/** Courtroom systems: testimony, cross-examination, objections, closing argument, verdict. */
import { CHARACTERS } from '../content/characters';
import { GROUNDS, GROUND_BY_ID, type Ground } from '../content/legal';
import { audio } from '../engine/audio';
import { type Game, el, escapeHtml } from '../engine/game';
import type { CharId, Script } from '../engine/types';
import { type ReadDef, readTell } from './readTell';

type Cond = (g: Game) => boolean;

function banner(g: Game, kicker: string, title: string, cls = ''): HTMLElement {
  g.layers.ui.querySelector('.court-banner')?.remove();
  const b = el('div', `court-banner ${cls}`, `<span class="cb-kicker">${kicker}</span><span class="cb-title">${escapeHtml(title)}</span><span class="cb-count"></span>`);
  g.layers.ui.appendChild(b);
  return b;
}

// ---------------------------------------------------------------------------
// Testimony & cross-examination

export interface Statement {
  id: string;
  text: string;
  expr?: string;
  when?: Cond;
  /** "Hold it!" — the witness elaborates. */
  press?: Script;
  /** Evidence id -> script played when that item exposes this statement. */
  present?: Record<string, Script>;
  /** A tell hidden in this statement. */
  read?: { def: ReadDef; success: Script; flag: string };
}

export interface CrossExamDef {
  id: string;
  witness: CharId;
  title: string;
  statements: Statement[];
  /** The cross-examination ends once this is true. */
  done: Cond;
  /** Played before the penalty when the wrong thing is presented. */
  wrong?: Script;
  penalty?: number;
  /** Ezra's thought when a Read finds nothing. */
  noTell?: string;
  /** How much the testimony sways the jury before you get to cross-examine it. */
  pressure?: number;
}

function live(g: Game, def: CrossExamDef): Statement[] {
  return def.statements.filter((s) => !s.when || s.when(g));
}

/** Play the testimony through once, statement by statement. */
export async function testimony(g: Game, def: CrossExamDef): Promise<void> {
  g.setWitness(def.witness);
  audio.music('trial');
  const b = banner(g, '— Witness Testimony —', def.title, 'testimony');
  await g.wait(600);
  for (const s of live(g, def)) {
    await g.say(def.witness, s.text, { expr: s.expr, testimony: true });
  }
  b.remove();
  const pressure = def.pressure ?? 8;
  if (pressure > 0) {
    await g.say('ezra', 'That landed. Half the jury is nodding along. I need to break this testimony, fast.', { thought: true });
    await g.jury(-pressure);
  }
}

type CEAction = 'prev' | 'next' | 'press' | 'present' | 'read';

export async function crossExam(g: Game, def: CrossExamDef): Promise<void> {
  g.setWitness(def.witness);
  audio.music('cross');
  let idx = 0;
  let currentId = '';
  const name = CHARACTERS[def.witness].full;
  try {
    while (!def.done(g)) {
      const list = live(g, def);
      const found = list.findIndex((s) => s.id === currentId);
      if (found >= 0) idx = found;
      idx = ((idx % list.length) + list.length) % list.length;
      const s = list[idx];
      currentId = s.id;
      const b = banner(g, '— Cross-Examination —', `${name}: ${def.title}`, 'cross');
      b.querySelector('.cb-count')!.innerHTML = list.map((_x, i) => `<i class="${i === idx ? 'on' : ''}"></i>`).join('');
      await g.prompt(def.witness, s.text, { testimony: true });
      const action = await ceControls(g);
      b.remove();
      if (action === 'prev') {
        if (idx === 0) {
          audio.sfx('back');
          continue;
        }
        idx--;
        currentId = list[idx].id;
      } else if (action === 'next') {
        if (idx === list.length - 1) {
          await g.say('ezra', "That's the whole testimony. Back to the top — there's a crack in here somewhere.", { thought: true });
          idx = 0;
        } else idx++;
        currentId = list[idx].id;
      } else if (action === 'press') {
        g.hideDialogue();
        await g.burst('holdit');
        if (s.press) await g.run(s.press);
        else await g.say(def.witness, 'I... I already said what I saw.', { expr: 'nervous' });
      } else if (action === 'present') {
        const id = await g.present({ title: 'Present what against this statement?' });
        if (!id) continue;
        g.hideDialogue();
        await g.burst('exhibit');
        const hit = s.present?.[id];
        if (hit) {
          g.state.trial.breakthroughs++;
          await g.run(hit);
          g.gainFocus(1);
        } else {
          g.state.trial.penalties++;
          if (def.wrong) await g.run(def.wrong);
          else {
            await g.say(def.witness, '...What is that supposed to prove?', { expr: 'surprised' });
            await g.say('strand', "Is the defense presenting evidence, or just showing us things it found in its pockets?", { expr: 'smug' });
          }
          await g.jury(-(def.penalty ?? 12));
        }
      } else if (action === 'read') {
        if (g.state.trial.focus <= 0) {
          await g.say('ezra', "I'm out of Focus. I need a breakthrough to get my head straight again.", { thought: true });
          continue;
        }
        if (s.read && g.flag(s.read.flag)) {
          await g.say('ezra', "I've already read that one. Now I have to use it.", { thought: true });
          continue;
        }
        g.useFocus();
        if (!s.read) {
          g.hideDialogue();
          audio.sfx('focus');
          await g.wait(500);
          await g.say('ezra', def.noTell ?? "Nothing. Steady eyes, steady breath. Whatever else is going on, they believe this part.", { thought: true });
          continue;
        }
        const ok = await readTell(g, s.read.def);
        if (ok) {
          g.state.trial.readsOk++;
          g.setFlag(s.read.flag);
          await g.run(s.read.success);
        } else {
          await g.say('ezra', 'Missed it. Whatever it was, it’s gone now.', { thought: true });
        }
      }
    }
  } finally {
    g.layers.ui.querySelector('.court-banner')?.remove();
    g.layers.ui.querySelector('.ce-bar')?.remove();
  }
}

function ceControls(g: Game): Promise<CEAction> {
  const t = g.state.trial;
  const bar = el(
    'div',
    'ce-bar no-advance',
    `<button class="ce-btn nav" data-a="prev" title="Previous statement (←)">◀</button>
     <button class="ce-btn press" data-a="press" title="Make the witness elaborate"><b>HOLD IT!</b><small>Press</small></button>
     <button class="ce-btn present" data-a="present" title="Present evidence that contradicts this statement"><b>EXHIBIT</b><small>Present</small></button>
     <button class="ce-btn read" data-a="read" ${t.focus <= 0 ? 'disabled' : ''} title="Spend Focus to read the witness"><b>READ</b><small>${'◉'.repeat(t.focus)}${'○'.repeat(Math.max(0, t.maxFocus - t.focus))}</small></button>
     <button class="ce-btn nav" data-a="next" title="Next statement (→)">▶</button>`,
  );
  g.layers.ui.appendChild(bar);
  return g
    .waitFor<CEAction>((done) => {
      const onClick = (e: MouseEvent) => {
        const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-a]');
        if (!b || b.disabled) return;
        audio.sfx('click');
        done(b.dataset.a as CEAction);
      };
      const onKey = (e: KeyboardEvent) => {
        if (g.overlayDepth > 0) return;
        if (e.key === 'ArrowLeft') done('prev');
        else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          done('next');
        }
      };
      bar.addEventListener('click', onClick);
      window.addEventListener('keydown', onKey);
      return () => {
        bar.removeEventListener('click', onClick);
        window.removeEventListener('keydown', onKey);
      };
    })
    .finally(() => bar.remove());
}

// ---------------------------------------------------------------------------
// Direct examination with objections

export interface DirectLine {
  who: CharId;
  expr?: string;
  text: string;
  /** If set, this line is objectionable on this ground. */
  improper?: Ground;
  /** Played after a sustained objection. */
  sustained?: Script;
  /** Played if the player lets an improper line slide. */
  missed?: Script;
}

export async function directExam(g: Game, title: string, lines: DirectLine[]): Promise<void> {
  const t = g.state.trial;
  try {
    for (const line of lines) {
      const b = banner(g, '— Direct Examination —', `${title} • Objections open`, 'direct');
      await g.prompt(line.who, line.text, { expr: line.expr });
      const objected = await dxControls(g);
      b.remove();
      if (!objected) {
        if (line.improper) {
          t.objectionsMissed++;
          const gr = GROUND_BY_ID[line.improper];
          if (line.missed) await g.run(line.missed);
          await g.say('ezra', `Damn — that was *${gr.name.toLowerCase()}*. ${gr.short} I should have objected.`, { thought: true });
          await g.jury(-4);
        }
        continue;
      }
      g.hideDialogue();
      await g.burst('objection');
      const ground = await pickGround(g);
      if (ground && line.improper === ground) {
        t.objectionsRight++;
        await g.say('ezra', objectionLine(ground), { expr: 'point' });
        await g.burst('sustained');
        await g.say('judge', sustainLine(ground), { expr: 'stern' });
        if (line.sustained) await g.run(line.sustained);
        await g.jury(6);
      } else {
        t.objectionsWrong++;
        if (ground) await g.say('ezra', objectionLine(ground), { expr: 'point' });
        await g.burst('overruled');
        if (!line.improper) await g.say('judge', "Overruled. That was a perfectly proper question, Mr. Vane. Sit down.", { expr: 'annoyed' });
        else await g.say('judge', "Overruled. If you have a valid objection, counselor, find the right grounds for it.", { expr: 'annoyed' });
        await g.jury(-8);
      }
    }
  } finally {
    g.layers.ui.querySelector('.court-banner')?.remove();
  }
}

function objectionLine(gr: Ground): string {
  return {
    leading: 'Objection! Counsel is *leading the witness*.',
    hearsay: "Objection! *Hearsay*. The witness is repeating what someone else said.",
    speculation: 'Objection! *Speculation*. The witness can’t know that.',
    relevance: 'Objection! *Relevance*. What does this have to do with anything?',
    badgering: 'Objection! Counsel is *badgering the witness*.',
    narrative: 'Objection! That question *calls for a narrative*.',
    facts: 'Objection! The question *assumes facts not in evidence*.',
    foundation: 'Objection! *Lack of foundation*. How would the witness know?',
  }[gr];
}

function sustainLine(gr: Ground): string {
  return {
    leading: 'Sustained. Rephrase the question, Ms. Strand.',
    hearsay: 'Sustained. The jury will disregard what the janitor allegedly said.',
    speculation: 'Sustained. The witness will stick to what he observed. The jury will disregard that remark.',
    relevance: 'Sustained. Move along, counselor.',
    badgering: 'Sustained. Ms. Strand, you will treat witnesses with respect in my courtroom.',
    narrative: 'Sustained. Ask a specific question.',
    facts: 'Sustained. Nobody has established that, counselor. Rephrase.',
    foundation: 'Sustained. Lay a foundation or move on.',
  }[gr];
}

function dxControls(g: Game): Promise<boolean> {
  const bar = el('div', 'dx-bar no-advance', `<button class="dx-btn go" data-a="go">Let it go <span>▶</span></button><button class="dx-btn objection" data-a="object">OBJECTION!</button>`);
  g.layers.ui.appendChild(bar);
  return g
    .waitFor<boolean>((done) => {
      const onClick = (e: MouseEvent) => {
        const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-a]');
        if (!b) return;
        done(b.dataset.a === 'object');
      };
      const onKey = (e: KeyboardEvent) => {
        if (g.overlayDepth > 0) return;
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onAdvance();
        } else if (e.key === 'o' || e.key === 'O') done(true);
      };
      // clicking the stage itself also means "let it go" (after a beat, so the click
      // that finished the typewriter doesn't also skip the chance to object)
      const shownAt = performance.now();
      const onAdvance = () => performance.now() - shownAt > 400 && done(false);
      bar.addEventListener('click', onClick);
      window.addEventListener('keydown', onKey);
      g.stage.addEventListener('pointerdown', stagePointer);
      function stagePointer(e: PointerEvent) {
        if (g.overlayDepth > 0) return;
        if ((e.target as HTMLElement).closest('button, .no-advance')) return;
        onAdvance();
      }
      return () => {
        bar.removeEventListener('click', onClick);
        window.removeEventListener('keydown', onKey);
        g.stage.removeEventListener('pointerdown', stagePointer);
      };
    })
    .finally(() => bar.remove());
}

function pickGround(g: Game): Promise<Ground | null> {
  const box = el(
    'div',
    'grounds no-advance',
    `<div class="grounds-title">On what grounds?</div>
     <div class="grounds-grid">${GROUNDS.map((gr) => `<button class="ground" data-g="${gr.id}"><b>${gr.name}</b><small>${escapeHtml(gr.short)}</small></button>`).join('')}</div>`,
  );
  g.layers.ui.appendChild(box);
  const shownAt = performance.now();
  return g
    .waitFor<Ground | null>((done) => {
      const onClick = (e: MouseEvent) => {
        const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-g]');
        if (!b || performance.now() - shownAt < 400) return;
        audio.sfx('select');
        done(b.dataset.g as Ground);
      };
      box.addEventListener('click', onClick);
      return () => box.removeEventListener('click', onClick);
    })
    .finally(() => box.remove());
}

// ---------------------------------------------------------------------------
// Closing argument

export interface Beat {
  /** Ezra lays out the point, then must back it up. */
  claim: string;
  answer: string[];
  success: Script;
  fail?: Script;
}

export async function closingArgument(g: Game, beats: Beat[]): Promise<void> {
  audio.music('pursuit');
  for (const [i, beat] of beats.entries()) {
    for (;;) {
      const b = banner(g, '— Closing Argument —', `Point ${i + 1} of ${beats.length}`, 'closing');
      await g.say('ezra', beat.claim, { expr: 'confident' });
      const id = await g.present({ title: 'Prove it.', cancellable: false });
      b.remove();
      g.hideDialogue();
      if (id && beat.answer.includes(id)) {
        await g.burst('exhibit');
        await g.run(beat.success);
        await g.jury(8);
        break;
      }
      g.state.trial.penalties++;
      if (beat.fail) await g.run(beat.fail);
      else await g.say('strand', "That proves nothing, and the defense knows it. Is this a closing argument or a garage sale?", { expr: 'smug' });
      await g.jury(-10);
    }
  }
}

// ---------------------------------------------------------------------------
// Verdict report

export function grade(g: Game): { letter: string; score: number } {
  const t = g.state.trial;
  const score = Math.round(t.jury + t.objectionsRight * 3 - t.objectionsWrong * 3 - t.objectionsMissed * 2 + t.readsOk * 4 - t.penalties * 3);
  const letter = score >= 100 ? 'S' : score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D';
  return { letter, score };
}

export async function verdictReport(g: Game, opts: { title: string; verdict: string; lines: string[] }): Promise<void> {
  const t = g.state.trial;
  const s = g.state.stats;
  const { letter } = grade(g);
  g.hideDialogue();
  audio.music('victory');
  const box = el(
    'div',
    'report no-advance',
    `<div class="rp-panel">
      <div class="rp-kicker">${escapeHtml(opts.title)}</div>
      <div class="rp-verdict">${escapeHtml(opts.verdict)}</div>
      <div class="rp-grid">
        <div class="rp-stats">
          <div><span>Final jury sway</span><b>${t.jury}</b></div>
          <div><span>Breakthroughs</span><b>${t.breakthroughs}</b></div>
          <div><span>Objections sustained</span><b>${t.objectionsRight}</b></div>
          <div><span>Objections overruled</span><b>${t.objectionsWrong}</b></div>
          <div><span>Objections missed</span><b>${t.objectionsMissed}</b></div>
          <div><span>Successful reads</span><b>${t.readsOk}</b></div>
          <div><span>Mistakes</span><b>${t.penalties}</b></div>
        </div>
        <div class="rp-grade"><span>RATING</span><b class="g-${letter}">${letter}</b></div>
        <div class="rp-person">
          <div><span>Integrity</span><b class="pos">${s.integrity >= 0 ? '+' : ''}${s.integrity}</b></div>
          <div><span>Notoriety</span><b class="neg">${s.notoriety >= 0 ? '+' : ''}${s.notoriety}</b></div>
          <div><span>Client trust</span><b>${s.trust >= 0 ? '+' : ''}${s.trust}</b></div>
          <div><span>Cash on hand</span><b>$${s.money.toLocaleString()}</b></div>
        </div>
      </div>
      <ul class="rp-lines">${opts.lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>
      <button class="btn primary big" data-ok>Continue</button>
    </div>`,
  );
  g.layers.overlay.appendChild(box);
  g.overlayDepth++;
  audio.sfx('reveal');
  try {
    await g.waitFor<void>((done) => {
      const b = box.querySelector<HTMLButtonElement>('[data-ok]')!;
      const onClick = () => {
        audio.sfx('select');
        done();
      };
      b.addEventListener('click', onClick);
      return () => b.removeEventListener('click', onClick);
    });
  } finally {
    g.overlayDepth--;
    box.remove();
  }
}
