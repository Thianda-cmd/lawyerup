/**
 * The mentalist Read: watch a witness repeat a line, spot where their body
 * betrayed them (eyes, brows, mouth, throat, sweat), then decide what it means.
 */
import { portraitSVG } from '../art/cast';
import { audio } from '../engine/audio';
import { type Game, el, escapeHtml } from '../engine/game';
import type { CharId } from '../engine/types';

export type TellRegion = 'eyes' | 'brows' | 'mouth' | 'throat' | 'sweat';

export interface ReadDef {
  char: CharId;
  expr?: string;
  outfit?: string;
  /** What the subject says while Ezra watches. */
  line: string;
  tell: TellRegion;
  /** Possible interpretations; exactly one should be correct. */
  meanings: { label: string; correct?: boolean }[];
  /** Ezra's read when the player nails it. */
  insight: string;
}

const REGIONS: { id: TellRegion; label: string; desc: string }[] = [
  { id: 'eyes', label: 'Eyes', desc: 'A glance away' },
  { id: 'brows', label: 'Brows', desc: 'A flash upward' },
  { id: 'mouth', label: 'Mouth', desc: 'Lips pressed thin' },
  { id: 'throat', label: 'Throat', desc: 'A hard swallow' },
  { id: 'sweat', label: 'Forehead', desc: 'A bead of sweat' },
];

const DURATION: Record<TellRegion, number> = { eyes: 900, brows: 700, mouth: 1000, throat: 900, sweat: 1600 };

/** Returns true if the read succeeded. `retry` allows another look on failure (investigation only). */
export async function readTell(g: Game, def: ReadDef, opts: { retry?: boolean } = {}): Promise<boolean> {
  g.hideDialogue();
  const ov = el(
    'div',
    'read-overlay',
    `<div class="read-rings"></div>
     <div class="read-face"><div class="read-portrait">${portraitSVG(def.char, def.expr ?? 'neutral', def.outfit)}</div></div>
     <div class="read-head"><span class="read-kicker">READ</span><span class="read-title">Watch closely.</span></div>
     <div class="read-caption"></div>
     <div class="read-panel"></div>`,
  );
  g.layers.ui.appendChild(ov);
  const face = ov.querySelector<HTMLElement>('.read-portrait')!;
  const caption = ov.querySelector<HTMLElement>('.read-caption')!;
  const panel = ov.querySelector<HTMLElement>('.read-panel')!;
  const title = ov.querySelector<HTMLElement>('.read-title')!;
  audio.sfx('focus');

  const choose = <T>(buttons: { label: string; sub?: string; value: T }[], cls = ''): Promise<T> =>
    g.waitFor<T>((done) => {
      const shownAt = performance.now();
      panel.innerHTML = `<div class="read-buttons ${cls}">${buttons
        .map((b, i) => `<button class="read-btn" data-i="${i}"><b>${escapeHtml(b.label)}</b>${b.sub ? `<small>${escapeHtml(b.sub)}</small>` : ''}</button>`)
        .join('')}</div>`;
      const onClick = (e: MouseEvent) => {
        const t = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-i]');
        if (!t || performance.now() - shownAt < 400) return;
        audio.sfx('select');
        done(buttons[Number(t.dataset.i)].value);
      };
      panel.addEventListener('click', onClick);
      return () => panel.removeEventListener('click', onClick);
    });

  const watch = async () => {
    panel.innerHTML = '';
    caption.textContent = '';
    title.textContent = 'Watch closely.';
    face.className = 'read-portrait';
    await g.wait(700);
    // the line types out while the tell fires at a random moment
    const total = 3600;
    const tellAt = 900 + Math.random() * 1500;
    const decoyAt = Math.random() < 0.5 ? 300 + Math.random() * 400 : tellAt + DURATION[def.tell] + 200;
    const words = def.line;
    let i = 0;
    const start = performance.now();
    let tellDone = false;
    let decoyDone = false;
    while (performance.now() - start < total) {
      const t = performance.now() - start;
      const upto = Math.floor((t / (total * 0.8)) * words.length);
      while (i < Math.min(upto, words.length)) {
        caption.textContent += words[i];
        if (i % 3 === 0 && words[i].trim()) audio.blip(260);
        i++;
      }
      if (!tellDone && t >= tellAt) {
        tellDone = true;
        face.classList.add(`tell-${def.tell}`);
        setTimeout(() => face.classList.remove(`tell-${def.tell}`), DURATION[def.tell]);
      }
      if (!decoyDone && t >= decoyAt) {
        decoyDone = true;
        face.classList.add('decoy-blink');
        setTimeout(() => face.classList.remove('decoy-blink'), 260);
      }
      await g.wait(30);
    }
    caption.textContent = words;
  };

  try {
    for (;;) {
      await watch();
      title.textContent = 'Where was the tell?';
      const region = await choose(
        REGIONS.map((r) => ({ label: r.label, sub: r.desc, value: r.id })),
        'regions',
      );
      if (region !== def.tell) {
        audio.sfx('fail');
        title.textContent = 'Nothing. You missed it.';
        if (opts.retry) {
          const again = await choose([
            { label: 'Watch again', value: true },
            { label: 'Give up', value: false },
          ]);
          if (again) continue;
        } else {
          await g.wait(1100);
        }
        return false;
      }
      audio.sfx('heartbeat');
      title.textContent = 'There. What does it mean?';
      const meaning = await choose(def.meanings.map((m) => ({ label: m.label, value: Boolean(m.correct) })), 'meanings');
      if (!meaning) {
        audio.sfx('fail');
        title.textContent = "No... that's not it. The moment's gone.";
        await g.wait(1300);
        return false;
      }
      ov.classList.add('cracked');
      panel.innerHTML = '';
      await g.burst('gotcha');
      title.textContent = def.insight;
      await g.wait(400);
      await g.waitAdvance();
      return true;
    }
  } finally {
    ov.classList.add('out');
    setTimeout(() => ov.remove(), 250);
  }
}
