/**
 * Voir dire: question prospective jurors, read the liars, spend your strikes.
 * The prosecution's consultant gets a strike too. The jury you end up with
 * sets the starting jury sway for the trial.
 */
import { portraitFromBuild } from '../art/cast';
import { type JurorLook, jurorBuild } from '../art/cast2';
import { audio } from '../engine/audio';
import { type Game, el, escapeHtml } from '../engine/game';
import type { Script } from '../engine/types';
import { type TellRegion, readTell } from './readTell';

export interface Juror {
  id: string;
  name: string;
  age: number;
  job: string;
  bio: string;
  look: JurorLook;
  /** Hidden lean: positive favors the defense, negative the prosecution. */
  bias: number;
  questions: { q: string; a: string; note?: string }[];
  read?: { line: string; tell: TellRegion; meanings: { label: string; correct?: boolean }[]; insight: string; note: string };
  /** Played after you decide on this juror (Crane's commentary, usually). */
  after?: { keep?: Script; strike?: Script };
}

export interface VoirDireDef {
  jurors: Juror[];
  strikes: number;
  focus: number;
  /** Played when the prosecution uses its strike on the juror who'd have helped you most. */
  craneStrike: (j: Juror) => Script;
}

export interface VoirDireResult {
  kept: string[];
  struck: string[];
  craneStruck: string | null;
  sway: number;
}

export async function voirDire(g: Game, def: VoirDireDef): Promise<VoirDireResult> {
  let strikes = def.strikes;
  let focus = def.focus;
  const kept: Juror[] = [];
  const struck: Juror[] = [];
  const notes = new Map<string, { text: string; hot?: boolean }[]>();

  const root = el('div', 'voir no-advance');
  g.layers.ui.appendChild(root);

  const pick = <T extends string>(buttons: { label: string; value: T; cls?: string; disabled?: boolean; sub?: string }[]): Promise<T> => {
    const area = root.querySelector<HTMLElement>('.voir-actions')!;
    area.innerHTML = buttons
      .map((b, i) => `<button class="voir-btn ${b.cls ?? ''}" data-i="${i}" ${b.disabled ? 'disabled' : ''}><b>${escapeHtml(b.label)}</b>${b.sub ? `<small>${escapeHtml(b.sub)}</small>` : ''}</button>`)
      .join('');
    const shownAt = performance.now();
    return g.waitFor<T>((done) => {
      const onClick = (e: MouseEvent) => {
        const t = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-i]');
        if (!t || t.disabled || performance.now() - shownAt < 350) return;
        audio.sfx('select');
        done(buttons[Number(t.dataset.i)].value);
      };
      area.addEventListener('click', onClick);
      return () => area.removeEventListener('click', onClick);
    });
  };

  const render = (j: Juror, idx: number, expr = 'neutral') => {
    const n = notes.get(j.id) ?? [];
    root.innerHTML = `
      <div class="voir-face">${portraitFromBuild(jurorBuild(j.look), expr)}</div>
      <div class="voir-card">
        <div class="voir-kicker">PROSPECTIVE JUROR ${idx + 1} OF ${def.jurors.length}</div>
        <div class="voir-name">${escapeHtml(j.name)}</div>
        <div class="voir-meta">${j.age} • ${escapeHtml(j.job)}</div>
        <div class="voir-bio">${escapeHtml(j.bio)}</div>
        <div class="voir-notes"><h4>Ezra's notes</h4>${n.length ? n.map((x) => `<div class="${x.hot ? 'hot' : ''}">• ${escapeHtml(x.text)}</div>`).join('') : '<em>Nothing yet.</em>'}</div>
        <div class="voir-actions"></div>
      </div>
      <div class="voir-status"><span>STRIKES LEFT <b>${strikes}</b></span><span>FOCUS <b class="eyes">${'◉'.repeat(focus)}${'○'.repeat(Math.max(0, def.focus - focus))}</b></span><span>SEATED <b>${kept.length}</b></span></div>`;
  };

  try {
    for (const [idx, j] of def.jurors.entries()) {
      notes.set(j.id, []);
      render(j, idx);
      audio.sfx('paper');
      // one question per juror
      const qi = await pick(j.questions.map((q, i) => ({ label: q.q, value: String(i) })));
      const q = j.questions[Number(qi)];
      await g.say('ezra', q.q, { expr: 'neutral' });
      await g.say(null, q.a, { name: `Juror ${idx + 1} — ${j.name.split(' ')[0]}` });
      if (q.note) notes.get(j.id)!.push({ text: q.note });
      render(j, idx);
      // decide
      for (;;) {
        const usedRead = notes.get(j.id)!.some((x) => x.hot);
        const v = await pick<'read' | 'keep' | 'strike'>([
          { label: 'Read them', value: 'read', cls: 'read', disabled: focus <= 0 || usedRead, sub: focus > 0 ? 'Spend Focus to look for a tell' : 'Out of Focus' },
          { label: 'Keep', value: 'keep', cls: 'keep', sub: 'Seat this juror' },
          { label: 'Strike', value: 'strike', cls: 'strike', disabled: strikes <= 0, sub: strikes > 0 ? `Peremptory strike (${strikes} left)` : 'No strikes left' },
        ]);
        if (v === 'read') {
          focus--;
          g.hideDialogue();
          if (!j.read) {
            audio.sfx('focus');
            await g.wait(500);
            await g.say('ezra', 'Nothing. Relaxed shoulders, steady breathing. Whatever they told me, they believe it.', { thought: true });
            notes.get(j.id)!.push({ text: 'Read: honest answers.', hot: true });
          } else {
            const ok = await readTell(g, { build: jurorBuild(j.look), line: j.read.line, tell: j.read.tell, meanings: j.read.meanings, insight: j.read.insight });
            if (ok) {
              g.state.trial.readsOk++;
              notes.get(j.id)!.push({ text: j.read.note, hot: true });
            } else {
              await g.say('ezra', 'Missed it. Something was there. I just didn’t catch it.', { thought: true });
              notes.get(j.id)!.push({ text: 'Read: missed the moment.', hot: true });
            }
          }
          render(j, idx);
          continue;
        }
        if (v === 'keep') {
          kept.push(j);
          audio.sfx('stamp');
          if (j.after?.keep) await g.run(j.after.keep);
        } else {
          strikes--;
          struck.push(j);
          audio.sfx('swipe');
          await g.say('ezra', `The defense thanks and excuses Juror ${idx + 1}.`, { expr: 'neutral' });
          if (j.after?.strike) await g.run(j.after.strike);
        }
        break;
      }
      g.hideDialogue();
    }

    // the prosecution's strike: the seated juror most likely to acquit
    let craneStruck: Juror | null = null;
    const best = [...kept].sort((a, b) => b.bias - a.bias)[0];
    if (best && best.bias > 0) {
      craneStruck = best;
      kept.splice(kept.indexOf(best), 1);
      root.innerHTML = `<div class="voir-face">${portraitFromBuild(jurorBuild(best.look), 'sad')}</div>`;
      await g.run(def.craneStrike(best));
    }

    // summary
    g.hideDialogue();
    const sway = Math.max(30, Math.min(70, 50 + kept.reduce((s, j) => s + j.bias, 0)));
    root.innerHTML = `<div class="voir-summary">
      <div class="voir-kicker">THE JURY IS SEATED</div>
      <div class="voir-grid">${def.jurors
        .map((j) => {
          const st = craneStruck === j ? 'crane' : struck.includes(j) ? 'struck' : 'kept';
          return `<div class="vs-juror ${st}"><div class="vs-face">${portraitFromBuild(jurorBuild(j.look), 'neutral')}</div><b>${escapeHtml(j.name)}</b><small>${escapeHtml(j.job)}</small><span>${st === 'kept' ? 'SEATED' : st === 'struck' ? 'STRUCK BY DEFENSE' : 'STRUCK BY PROSECUTION'}</span></div>`;
        })
        .join('')}</div>
      <div class="voir-sway">Starting jury sway: <b>${sway}</b></div>
      <div class="voir-actions"></div>
    </div>`;
    await pick([{ label: 'Begin the trial', value: 'go', cls: 'keep' }]);
    return { kept: kept.map((j) => j.id), struck: struck.map((j) => j.id), craneStruck: craneStruck?.id ?? null, sway };
  } finally {
    root.remove();
  }
}
