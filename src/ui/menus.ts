/** Title screen, pause menu, save/load, settings, backlog. */
import { audio } from '../engine/audio';
import { type Game, el, escapeHtml } from '../engine/game';
import { SLOTS, type Slot, latestSave, readSave } from '../engine/save';

const START_SCENE = 'c1_cold_open';

function modal(g: Game, cls: string, html: string, bind: (root: HTMLElement, close: () => void) => void): Promise<void> {
  const root = el('div', `menu-screen no-advance`, `<div class="menu-panel ${cls}">${html}</div>`);
  g.layers.overlay.appendChild(root);
  g.overlayDepth++;
  return new Promise<void>((resolve) => {
    const close = () => {
      window.removeEventListener('keydown', onKey, true);
      root.remove();
      g.overlayDepth--;
      audio.sfx('back');
      resolve();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener('keydown', onKey, true);
    root.addEventListener('click', (e) => {
      if (e.target === root) close();
    });
    bind(root, close);
  });
}

function fmtTime(t: number): string {
  const d = new Date(t);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function openSaveLoad(g: Game, mode: 'save' | 'load', onLoad: (slot: Slot) => void): Promise<void> {
  const render = () =>
    SLOTS.filter((s) => mode === 'load' || s !== 'auto')
      .map((slot) => {
        const d = readSave(slot);
        const info = d ? `<b>${escapeHtml(d.label)}</b>${fmtTime(d.time)}` : '<i>Empty</i>';
        const btn = mode === 'save' ? `<button class="btn" data-slot="${slot}">Save here</button>` : `<button class="btn" data-slot="${slot}" ${d ? '' : 'disabled'}>Load</button>`;
        return `<div class="slot-row"><div class="slot-name">${slot === 'auto' ? 'Autosave' : `Slot ${slot}`}</div><div class="slot-info">${info}</div>${btn}</div>`;
      })
      .join('');
  return modal(g, 'wide', `<h2>${mode === 'save' ? 'Save Game' : 'Load Game'}</h2>${mode === 'save' ? '<p style="margin:0 0 8px;color:var(--ink-dim);font-size:18px;text-align:center">Saves resume from the start of the current scene.</p>' : ''}<div class="slots">${render()}</div><button class="btn" data-close style="text-align:center">Back</button>`, (root, close) => {
    root.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!b) return;
      if (b.hasAttribute('data-close')) return close();
      const slot = b.dataset.slot as Slot | undefined;
      if (!slot) return;
      if (mode === 'save') {
        g.save(slot);
        audio.sfx('evidence');
        root.querySelector('.slots')!.innerHTML = render();
      } else {
        close();
        onLoad(slot);
      }
    });
  });
}

export function openSettings(g: Game): Promise<void> {
  const s = g.settings;
  return modal(
    g,
    '',
    `<h2>Settings</h2>
     <label class="setting"><span>Text speed</span><input type="range" min="0.4" max="2.5" step="0.1" value="${s.textSpeed}" data-k="textSpeed"></label>
     <label class="setting"><span>Music</span><input type="range" min="0" max="1" step="0.05" value="${s.music}" data-k="music"></label>
     <label class="setting"><span>Sound effects</span><input type="range" min="0" max="1" step="0.05" value="${s.sfx}" data-k="sfx"></label>
     <label class="setting"><span>Screen shake</span><input type="checkbox" ${s.shake ? 'checked' : ''} data-k="shake"></label>
     <p style="margin:6px 0;color:var(--ink-dim);font-size:16px">Tip: hold <b>Ctrl</b> to fast-forward dialogue. <b>R</b> opens the Court Record, <b>Esc</b> the menu.</p>
     <button class="btn" data-close style="text-align:center">Done</button>`,
    (root, close) => {
      root.addEventListener('input', (e) => {
        const i = e.target as HTMLInputElement;
        const k = i.dataset.k as keyof typeof s;
        if (k === 'shake') s.shake = i.checked;
        else (s as unknown as Record<string, number>)[k] = Number(i.value);
        g.applySettings();
        if (k === 'sfx') audio.sfx('click');
      });
      root.querySelector('[data-close]')!.addEventListener('click', close);
    },
  );
}

export function openLog(g: Game): Promise<void> {
  const rows = g.log
    .slice(-120)
    .map((l) => `<div class="log-row ${l.thought ? 'thought' : ''}">${l.name ? `<b style="color:${l.color}">${escapeHtml(l.name)}</b>` : ''}${escapeHtml(l.text.replace(/\*|\{w\d*\}/g, ''))}</div>`)
    .join('');
  return modal(g, 'wide', `<h2>Backlog</h2><div class="log-list">${rows || '<i>Nothing yet.</i>'}</div><button class="btn" data-close style="text-align:center">Back</button>`, (root, close) => {
    const list = root.querySelector('.log-list')!;
    list.scrollTop = list.scrollHeight;
    root.querySelector('[data-close]')!.addEventListener('click', close);
  });
}

export function openCredits(g: Game): Promise<void> {
  return modal(
    g,
    '',
    `<h2>Credits</h2>
     <p style="font-size:20px;line-height:1.6;color:#e2d9ca;margin:0">
       <b>Lawyer Up</b> — Case 1: <i>The Vanishing Act</i><br><br>
       Every portrait, background, sound and note of music is generated in code at runtime — no image or audio files.<br><br>
       Fonts: Playfair Display, Inter, Special Elite, Yellowtail, Bangers (Google Fonts).
     </p>
     <button class="btn" data-close style="text-align:center">Back</button>`,
    (root, close) => root.querySelector('[data-close]')!.addEventListener('click', close),
  );
}

export function loadSlot(g: Game, slot: Slot): void {
  const d = readSave(slot);
  if (!d) return;
  g.layers.overlay.querySelector('.title-screen')?.remove();
  g.stage.classList.remove('on-title');
  g.load(d.scene, d.state);
}

export function openPause(g: Game): void {
  if (g.stage.classList.contains('on-title') || g.overlayDepth > 0) return;
  audio.sfx('paper');
  void modal(
    g,
    '',
    `<h2>Paused</h2>
     <button class="btn" data-a="resume">Resume</button>
     ${g.recordEnabled ? '<button class="btn" data-a="record">Court Record</button>' : ''}
     <button class="btn" data-a="log">Backlog</button>
     <button class="btn" data-a="save">Save</button>
     <button class="btn" data-a="load">Load</button>
     <button class="btn" data-a="settings">Settings</button>
     <button class="btn" data-a="title">Quit to Title</button>`,
    (root, close) => {
      root.addEventListener('click', async (e) => {
        const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
        if (!b) return;
        const a = b.dataset.a;
        close();
        if (a === 'record') await g.viewRecord();
        else if (a === 'log') await openLog(g);
        else if (a === 'save') await openSaveLoad(g, 'save', () => {});
        else if (a === 'load') await openSaveLoad(g, 'load', (slot) => loadSlot(g, slot));
        else if (a === 'settings') await openSettings(g);
        else if (a === 'title') showTitle(g);
      });
    },
  );
}

export function mountHudButtons(g: Game): void {
  const bar = el(
    'div',
    'hud-buttons no-advance',
    `<button class="hud-btn rec" data-a="record" title="Court Record (R)">📁 RECORD</button>
     <button class="hud-btn" data-a="log" title="Backlog">LOG</button>
     <button class="hud-btn" data-a="menu" title="Menu (Esc)">☰</button>`,
  );
  g.stage.appendChild(bar);
  bar.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!b || g.overlayDepth > 0) return;
    audio.sfx('click');
    if (b.dataset.a === 'record') void g.viewRecord();
    else if (b.dataset.a === 'log') void openLog(g);
    else openPause(g);
  });
  g.onPause = () => openPause(g);
  g.onTitle = () => showTitle(g);
}

export function showTitle(g: Game, first = false): void {
  g.abortFlow();
  g.resetStage();
  g.stage.classList.add('on-title');
  void g.bg('title', true);
  audio.music('title');
  g.layers.overlay.querySelectorAll('.title-screen, .menu-screen').forEach((n) => n.remove());
  g.overlayDepth = 0;
  const save = latestSave();
  const screen = el(
    'div',
    'title-screen no-advance',
    `<div class="logo"><div class="logo-main">Lawyer Up!</div><div class="logo-sub">EZRA VANE • ATTORNEY AT LAW</div><div class="logo-tag">“Guilty? Innocent? Who’s asking?”</div></div>
     <div class="title-menu">
       ${save ? `<button class="btn primary" data-a="continue">Continue <small style="opacity:.7;font-size:16px">— ${escapeHtml(save.data.label)}</small></button>` : ''}
       <button class="btn ${save ? '' : 'primary'}" data-a="new">New Game</button>
       <button class="btn" data-a="load">Load Game</button>
       <button class="btn" data-a="settings">Settings</button>
       <button class="btn" data-a="credits">Credits</button>
     </div>
     <div class="title-foot">Case 1: The Vanishing Act • Every pixel and note generated in code</div>
     ${first ? '<div class="click-to-start">CLICK TO BEGIN</div>' : ''}`,
  );
  g.layers.overlay.appendChild(screen);
  const start = screen.querySelector<HTMLElement>('.click-to-start');
  start?.addEventListener('click', () => {
    audio.unlock();
    audio.music('title');
    start.remove();
  });
  screen.addEventListener('click', async (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!b || g.overlayDepth > 0) return;
    audio.unlock();
    audio.sfx('select');
    const a = b.dataset.a;
    if (a === 'new') {
      screen.remove();
      g.stage.classList.remove('on-title');
      g.newGame(START_SCENE);
    } else if (a === 'continue' && save) {
      loadSlot(g, save.slot);
    } else if (a === 'load') {
      await openSaveLoad(g, 'load', (slot) => loadSlot(g, slot));
    } else if (a === 'settings') {
      await openSettings(g);
    } else if (a === 'credits') {
      await openCredits(g);
    }
  });
}
