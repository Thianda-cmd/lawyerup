/**
 * The runtime: owns the stage DOM, plays scripts, tracks state and drives
 * the scene flow (checkpoints, game over, retries, saves).
 */
import { BACKGROUNDS } from '../art/backgrounds';
import { portraitSVG } from '../art/cast';
import { icon } from '../art/icons';
import { Particles } from '../art/particles';
import { CHARACTERS } from '../content/characters';
import { openRecord, type RecordOpts } from '../ui/record';
import { audio } from './audio';
import { segmentText } from './dsl';
import { readSettings, writeSave, writeSettings, type Settings, type Slot } from './save';
import { type GameState, cloneState, freshState } from './state';
import type { BurstKind, CharId, Choice, Cmd, DeductionRecipe, EvidenceDef, Pos, ProfileDef, Script, StatId } from './types';

export class GameOver extends Error {
  constructor(public reason: 'jury' | 'story', public detail = '') {
    super(reason);
  }
}
export class FlowAbort extends Error {}

export type SceneFn = (g: Game) => Promise<string | null>;

export interface Content {
  evidence: Record<string, EvidenceDef>;
  profiles: Record<string, ProfileDef>;
  recipes: DeductionRecipe[];
  scenes: Record<string, SceneFn>;
  sceneLabels: Record<string, string>;
}

const POS_X: Record<Pos, number> = { farleft: 230, left: 470, center: 800, right: 1130, farright: 1370 };

interface CharView {
  el: HTMLElement;
  expr: string;
  pos: Pos;
}

export interface LogEntry {
  name: string;
  text: string;
  color: string;
  thought?: boolean;
}

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', html = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

export class Game {
  state: GameState = freshState();
  settings: Settings = readSettings();
  readonly stage: HTMLElement;
  readonly layers: Record<'bg' | 'chars' | 'tint' | 'fg' | 'play' | 'hud' | 'ui' | 'fx' | 'overlay' | 'fade', HTMLElement>;
  private dlg: HTMLElement;
  private dlgName: HTMLElement;
  private dlgText: HTMLElement;
  private particles: Particles;
  private chars = new Map<CharId, CharView>();
  private outfits: Partial<Record<CharId, string>> = {};
  private bgId = '';
  private pending = new Set<(e: Error) => void>();
  private advanceListeners = new Set<() => void>();
  private runId = 0;
  private cp: { scene: string; state: GameState } | null = null;
  sceneId = '';
  log: LogEntry[] = [];
  overlayDepth = 0;
  skipping = false;
  private recOn = false;
  /** Court camera. */
  court = {
    active: false,
    witness: null as CharId | null,
    angle: '' as string,
    exprs: {} as Partial<Record<CharId, string>>,
    cocounsel: true,
    /** Pretrial hearing: the meter tracks the judge, not a jury. */
    bench: false,
  };
  onTitle: () => void = () => {};
  onPause: () => void = () => {};

  get recordEnabled(): boolean {
    return this.recOn;
  }
  set recordEnabled(v: boolean) {
    this.recOn = v;
    this.stage.classList.toggle('rec-on', v);
  }

  constructor(root: HTMLElement, readonly content: Content) {
    this.stage = root;
    root.innerHTML = '';
    const mk = (cls: string) => {
      const e = el('div', `layer ${cls}`);
      root.appendChild(e);
      return e;
    };
    const bg = mk('bg');
    const canvas = el('canvas', 'layer particles');
    root.appendChild(canvas);
    const chars = mk('chars');
    const tint = mk('tint');
    const fg = mk('fg');
    mk('vignette');
    const play = mk('play');
    const hud = mk('hud');
    this.dlg = el('div', 'dlg hidden', `<div class="dlg-name"></div><div class="dlg-text"></div><div class="dlg-next"></div>`);
    root.appendChild(this.dlg);
    this.dlgName = this.dlg.querySelector('.dlg-name')!;
    this.dlgText = this.dlg.querySelector('.dlg-text')!;
    const ui = mk('ui');
    const fx = mk('fx');
    const overlay = mk('overlay');
    const fade = mk('fade');
    this.layers = { bg, chars, tint, fg, play, hud, ui, fx, overlay, fade };
    this.particles = new Particles(canvas);
    this.bindInput();
    this.applySettings();
  }

  // ---------------------------------------------------------------------------
  // input & waiting

  private bindInput(): void {
    this.stage.addEventListener('pointerdown', (e) => {
      audio.unlock();
      const t = e.target as HTMLElement;
      if (this.overlayDepth > 0) return;
      if (t.closest('button, .no-advance, input, a')) return;
      if (e.button !== 0) return;
      this.fireAdvance();
    });
    window.addEventListener('keydown', (e) => {
      audio.unlock();
      if (e.key === 'Control') this.skipping = true;
      if (e.repeat && e.key !== 'Control') return;
      if (this.overlayDepth > 0) return;
      if (e.key === ' ' || e.key === 'Enter') {
        if ((document.activeElement as HTMLElement | null)?.tagName === 'BUTTON' && document.activeElement !== document.body) return;
        e.preventDefault();
        this.fireAdvance();
      } else if (e.key === 'Escape') {
        this.onPause();
      } else if ((e.key === 'r' || e.key === 'R') && this.recordEnabled) {
        void this.viewRecord();
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Control') this.skipping = false;
    });
    window.addEventListener('blur', () => (this.skipping = false));
  }

  private fireAdvance(): void {
    for (const l of [...this.advanceListeners]) l();
  }

  /**
   * Create an abortable wait. `setup` registers listeners, calls `done(value)` to
   * finish, and may return a cleanup function.
   */
  waitFor<T>(setup: (done: (v: T) => void) => (() => void) | void): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let cleanup: (() => void) | void = undefined;
      let finished = false;
      const fail = (e: Error) => {
        if (finished) return;
        finished = true;
        this.pending.delete(fail);
        if (cleanup) cleanup();
        reject(e);
      };
      this.pending.add(fail);
      cleanup = setup((v) => {
        if (finished) return;
        finished = true;
        this.pending.delete(fail);
        queueMicrotask(() => cleanup && cleanup());
        resolve(v);
      });
      if (finished && cleanup) cleanup();
    });
  }

  /** Wait for a click / Space / Enter anywhere on stage. */
  waitAdvance(): Promise<void> {
    return this.waitFor<void>((done) => {
      if (this.skipping) {
        const t = setTimeout(() => done(), 45);
        return () => clearTimeout(t);
      }
      const l = () => done();
      this.advanceListeners.add(l);
      const skipPoll = setInterval(() => this.skipping && done(), 60);
      return () => {
        this.advanceListeners.delete(l);
        clearInterval(skipPoll);
      };
    });
  }

  wait(ms: number): Promise<void> {
    return this.waitFor<void>((done) => {
      const t = setTimeout(() => done(), this.skipping ? Math.min(ms, 40) : ms);
      return () => clearTimeout(t);
    });
  }

  abortFlow(): void {
    this.runId++;
    for (const f of [...this.pending]) f(new FlowAbort());
  }

  // ---------------------------------------------------------------------------
  // flow

  async play(sceneId: string): Promise<void> {
    this.abortFlow();
    const run = this.runId;
    let id: string | null = sceneId;
    while (id && run === this.runId) {
      const fn: SceneFn | undefined = this.content.scenes[id];
      if (!fn) throw new Error(`Unknown scene "${id}"`);
      this.sceneId = id;
      this.checkpoint();
      try {
        id = await fn(this);
      } catch (e) {
        if (e instanceof FlowAbort) return;
        if (e instanceof GameOver) {
          const retry = await this.gameOverScreen(e).catch(() => false);
          if (run !== this.runId) return;
          if (retry && this.cp) {
            this.state = cloneState(this.cp.state);
            continue;
          }
          this.onTitle();
          return;
        }
        throw e;
      }
    }
  }

  /** Remember a safe restart point (and autosave it). */
  checkpoint(): void {
    this.cp = { scene: this.sceneId, state: cloneState(this.state) };
    this.save('auto');
  }

  save(slot: Slot): boolean {
    if (!this.cp) return false;
    const label = this.content.sceneLabels[this.cp.scene] ?? this.cp.scene;
    return writeSave(slot, { version: 1, scene: this.cp.scene, state: this.cp.state, time: Date.now(), label });
  }

  newGame(scene: string): void {
    this.state = freshState();
    this.log = [];
    this.resetStage();
    void this.play(scene);
  }

  load(scene: string, state: GameState): void {
    this.state = cloneState(state);
    this.log = [];
    this.resetStage();
    void this.play(scene);
  }

  resetStage(): void {
    this.hideAll(true);
    this.layers.play.innerHTML = '';
    this.layers.ui.innerHTML = '';
    this.layers.fx.innerHTML = '';
    this.layers.hud.innerHTML = '';
    this.layers.fade.className = 'layer fade';
    this.stage.classList.remove('flashback', 'noir');
    this.hideDialogue();
    this.call(null);
    this.court.active = false;
    this.court.bench = false;
    this.court.angle = '';
    this.recordEnabled = false;
    this.outfits = {};
  }

  applySettings(): void {
    audio.setVolumes(this.settings.music, this.settings.sfx);
    writeSettings(this.settings);
  }

  // ---------------------------------------------------------------------------
  // script execution

  async run(script: Script): Promise<void> {
    if (typeof script === 'function') return script(this);
    for (const cmd of script) await this.exec(cmd);
  }

  async exec(c: Cmd): Promise<void> {
    switch (c.t) {
      case 'say':
        return this.say(c.who, c.text, { expr: c.expr, thought: c.thought, name: c.name });
      case 'bg':
        return this.bg(c.id, c.instant);
      case 'show':
        this.show(c.who, c.expr, c.pos);
        return;
      case 'hide':
        if (c.who === 'all') this.hideAll();
        else this.hide(c.who);
        return;
      case 'expr':
        this.setExpr(c.who, c.expr);
        return;
      case 'outfit':
        this.outfits[c.who] = c.id;
        if (this.chars.has(c.who)) this.renderChar(c.who);
        return;
      case 'sfx':
        audio.sfx(c.id);
        return;
      case 'music':
        audio.music(c.id);
        return;
      case 'shake':
        this.shake(c.strength);
        return;
      case 'flash':
        this.flash(c.color);
        return;
      case 'burst':
        return this.burst(c.kind);
      case 'wait':
        return this.wait(c.ms);
      case 'evidence':
        return this.giveEvidence(c.id);
      case 'profile':
        return this.giveProfile(c.id);
      case 'flag':
        this.state.flags[c.id] = c.value;
        return;
      case 'stat':
        return this.stat(c.id, c.delta);
      case 'jury':
        return this.jury(c.delta);
      case 'warn':
        return this.warn();
      case 'title':
        return this.titleCard(c.text, c.sub);
      case 'fade':
        return this.fade(c.dir, c.ms);
      case 'filter':
        this.stage.classList.toggle('flashback', c.mode === 'flashback');
        this.stage.classList.toggle('noir', c.mode === 'noir');
        return;
      case 'call':
        this.call(c.who);
        return;
    }
  }

  // ---------------------------------------------------------------------------
  // dialogue

  async say(who: CharId | null, text: string, opts: { expr?: string; thought?: boolean; name?: string; testimony?: boolean; keepOpen?: boolean } = {}): Promise<void> {
    if (who && !opts.thought) {
      if (this.court.active) this.courtFocus(who, opts.expr);
      else if (opts.expr && this.chars.has(who)) this.setExpr(who, opts.expr);
    } else if (who && opts.expr && this.chars.has(who)) {
      this.setExpr(who, opts.expr);
    }
    const meta = who ? CHARACTERS[who] : null;
    const name = opts.name ?? (opts.thought ? '' : meta?.name ?? '');
    const color = meta?.color ?? '#d9cfc0';
    this.dlg.classList.remove('hidden', 'thought', 'testimony', 'narration');
    if (opts.thought) this.dlg.classList.add('thought');
    if (opts.testimony) this.dlg.classList.add('testimony');
    if (!name && !opts.thought) this.dlg.classList.add('narration');
    this.dlgName.textContent = name;
    this.dlgName.style.setProperty('--name-color', color);
    this.dlgName.style.display = name ? '' : 'none';
    this.log.push({ name: opts.thought ? '(Ezra)' : name, text, color, thought: opts.thought });
    if (this.log.length > 300) this.log.shift();
    const speaker = who && !opts.thought ? this.chars.get(who)?.el : undefined;
    await this.typewrite(text, who && !opts.thought ? meta!.blip : opts.thought ? 300 : 260, speaker);
    if (opts.keepOpen) return;
    await this.waitAdvance();
  }

  private async typewrite(text: string, blip: number, speaker?: HTMLElement): Promise<void> {
    this.dlg.classList.remove('done');
    this.dlgText.innerHTML = '';
    const segs = segmentText(text);
    const spans: { span: HTMLElement; ch: string }[] = [];
    const pauses = new Map<number, number>();
    for (const seg of segs) {
      if (seg.pause !== undefined) {
        pauses.set(spans.length, seg.pause);
        continue;
      }
      const wrap = seg.em ? el('span', 'em') : null;
      for (const ch of seg.text) {
        const s = el('span', 'ch');
        s.textContent = ch;
        (wrap ?? this.dlgText).appendChild(s);
        spans.push({ span: s, ch });
      }
      if (wrap) this.dlgText.appendChild(wrap);
    }
    let skip = this.skipping;
    const onSkip = () => (skip = true);
    this.advanceListeners.add(onSkip);
    speaker?.classList.add('talking');
    try {
      const base = 26 / Math.max(0.25, this.settings.textSpeed);
      for (let i = 0; i < spans.length; i++) {
        if (skip || this.skipping) break;
        const p = pauses.get(i);
        if (p) {
          speaker?.classList.remove('talking');
          await this.wait(p);
          speaker?.classList.add('talking');
        }
        const { span, ch } = spans[i];
        span.classList.add('on');
        if (ch.trim() && i % 2 === 0) audio.blip(blip);
        let d = base;
        if ('.!?'.includes(ch) && spans[i + 1]?.ch === ' ') d = base * 7;
        else if (ch === ',' || ch === ';' || ch === '—') d = base * 3.5;
        if (d > base * 2) speaker?.classList.remove('talking');
        await this.wait(d);
        if (d > base * 2) speaker?.classList.add('talking');
      }
    } finally {
      this.advanceListeners.delete(onSkip);
      speaker?.classList.remove('talking');
    }
    for (const { span } of spans) span.classList.add('on');
    this.dlg.classList.add('done');
    // swallow the click that completed the text
    await new Promise((r) => setTimeout(r, 30));
  }

  hideDialogue(): void {
    this.dlg.classList.add('hidden');
  }

  /** Show a line in the dialogue box without waiting (used under menus). */
  async prompt(who: CharId | null, text: string, opts: { thought?: boolean; testimony?: boolean; name?: string; expr?: string } = {}): Promise<void> {
    await this.say(who, text, { ...opts, keepOpen: true });
  }

  async choose<T>(choices: Choice<T>[], opts: { prompt?: string; who?: CharId | null; className?: string } = {}): Promise<T> {
    if (opts.prompt !== undefined) await this.prompt(opts.who ?? null, opts.prompt, { thought: opts.who === undefined && !opts.prompt.startsWith('[') });
    const box = el('div', `choices no-advance ${opts.className ?? ''}`);
    this.layers.ui.appendChild(box);
    try {
      // ignore clicks for a moment so a fast "advance" click can't land on a fresh choice
      const shownAt = performance.now();
      const ready = () => performance.now() - shownAt > 400;
      return await this.waitFor<T>((done) => {
        choices.forEach((c, i) => {
          const b = el('button', `choice ${c.done ? 'done' : ''}`, `<span class="choice-key">${i + 1}</span><span class="choice-label">${escapeHtml(c.label)}</span>${c.tag ? `<span class="choice-tag tag-${c.tag.toLowerCase().replace(/[^a-z]/g, '')}">${escapeHtml(c.tag)}</span>` : ''}${c.hint ? `<span class="choice-hint">${escapeHtml(c.hint)}</span>` : ''}`);
          b.disabled = Boolean(c.disabled);
          b.style.animationDelay = `${i * 50}ms`;
          b.onclick = () => {
            if (!ready()) return;
            audio.sfx('select');
            done(c.value);
          };
          box.appendChild(b);
        });
        const key = (e: KeyboardEvent) => {
          if (this.overlayDepth > 0) return;
          const n = Number(e.key);
          if (n >= 1 && n <= choices.length && !choices[n - 1].disabled) {
            audio.sfx('select');
            done(choices[n - 1].value);
          }
        };
        window.addEventListener('keydown', key);
        return () => window.removeEventListener('keydown', key);
      });
    } finally {
      box.remove();
    }
  }

  // ---------------------------------------------------------------------------
  // stage: background & characters

  async bg(id: string, instant = false): Promise<void> {
    const def = BACKGROUNDS[id];
    if (!def) throw new Error(`Unknown background "${id}"`);
    if (id === this.bgId) return;
    this.bgId = id;
    const u = `${id.replace(/[^a-z]/g, '')}${Math.random().toString(36).slice(2, 7)}`;
    const scene = el('div', 'bg-scene', def.paint(u));
    const old = [...this.layers.bg.children] as HTMLElement[];
    this.layers.bg.appendChild(scene);
    this.layers.fg.innerHTML = def.fg ? def.fg(`${u}f`) : '';
    this.layers.tint.style.background = def.tint ?? 'transparent';
    this.particles.set(def.particles ?? 'none');
    if (instant || this.skipping) {
      old.forEach((o) => o.remove());
      return;
    }
    scene.classList.add('fade-in');
    await this.wait(380);
    old.forEach((o) => o.remove());
  }

  get currentBg(): string {
    return this.bgId;
  }

  private renderChar(who: CharId): void {
    const v = this.chars.get(who);
    if (!v) return;
    const talking = v.el.classList.contains('talking');
    const expr = v.expr;
    v.el.innerHTML = portraitSVG(who, expr, this.outfits[who]);
    v.el.classList.toggle('silhouette', expr === 'silhouette');
    v.el.classList.toggle('talking', talking);
  }

  show(who: CharId, expr = 'neutral', pos: Pos = 'center'): void {
    let v = this.chars.get(who);
    if (!v) {
      const e = el('div', 'char enter');
      e.dataset.id = who;
      e.style.setProperty('--blink-delay', `${(-Math.random() * 5).toFixed(2)}s`);
      this.layers.chars.appendChild(e);
      v = { el: e, expr, pos };
      this.chars.set(who, v);
      this.renderChar(who);
      setTimeout(() => e.classList.remove('enter'), 400);
    } else if (v.expr !== expr) {
      v.expr = expr;
      this.renderChar(who);
    }
    v.pos = pos;
    v.el.style.left = `${POS_X[pos]}px`;
    v.el.dataset.pos = pos;
  }

  setExpr(who: CharId, expr: string): void {
    const v = this.chars.get(who);
    if (this.court.active) this.court.exprs[who] = expr;
    if (!v || v.expr === expr) return;
    v.expr = expr;
    this.renderChar(who);
  }

  hide(who: CharId): void {
    const v = this.chars.get(who);
    if (!v) return;
    this.chars.delete(who);
    v.el.classList.add('exit');
    setTimeout(() => v.el.remove(), 300);
  }

  hideAll(instant = false): void {
    for (const [id, v] of this.chars) {
      if (instant) v.el.remove();
      else this.hide(id);
    }
    if (instant) this.chars.clear();
  }

  charEl(who: CharId): HTMLElement | undefined {
    return this.chars.get(who)?.el;
  }

  // ---------------------------------------------------------------------------
  // court camera

  enterCourt(witness: CharId | null = null): void {
    this.court.active = true;
    this.court.witness = witness;
    this.court.angle = '';
    this.state.trial.active = true;
    this.recordEnabled = true;
    this.renderHud();
  }

  setWitness(w: CharId | null): void {
    this.court.witness = w;
  }

  leaveCourt(): void {
    this.court.bench = false;
    this.court.active = false;
    this.state.trial.active = false;
    this.court.angle = '';
    this.renderHud();
  }

  private angleFor(who: CharId): string | null {
    if (who === 'judge') return 'court_judge';
    if (who === 'strand') return 'court_prosecution';
    if (who === 'ezra' || who === 'rosa' || who === 'corvin') return 'court_defense';
    if (who === this.court.witness) return 'court_witness';
    return null;
  }

  /** Cut the camera to whoever is speaking. */
  courtFocus(who: CharId, expr?: string): void {
    const angle = this.angleFor(who);
    if (expr) this.court.exprs[who] = expr;
    if (!angle) return;
    const ex = (c: CharId) => this.court.exprs[c] ?? 'neutral';
    if (this.court.angle !== angle) {
      this.court.angle = angle;
      void this.bg(angle, true);
      this.hideAll(true);
      this.layers.chars.classList.remove('cut');
      void this.layers.chars.offsetWidth;
      this.layers.chars.classList.add('cut');
      if (angle === 'court_defense') {
        this.show('ezra', ex('ezra'), who === 'ezra' ? 'center' : 'left');
        if (who === 'rosa') this.show('rosa', ex('rosa'), 'right');
        if (who === 'corvin') this.show('corvin', ex('corvin'), 'right');
      } else if (angle === 'court_judge') this.show('judge', ex('judge'), 'center');
      else if (angle === 'court_prosecution') this.show('strand', ex('strand'), 'center');
      else if (angle === 'court_witness' && this.court.witness) this.show(this.court.witness, ex(this.court.witness), 'center');
    } else if (angle === 'court_defense' && !this.chars.has(who)) {
      this.show(who, ex(who), 'right');
      if (this.chars.get('ezra')?.pos === 'center') this.show('ezra', ex('ezra'), 'left');
    }
    if (expr) this.setExpr(who, expr);
  }

  // ---------------------------------------------------------------------------
  // effects

  shake(strength = 1): void {
    if (!this.settings.shake) return;
    this.stage.style.setProperty('--shake', `${8 * strength}px`);
    this.stage.classList.remove('shake');
    void this.stage.offsetWidth;
    this.stage.classList.add('shake');
  }

  flash(color = '#fff'): void {
    const f = el('div', 'flash');
    f.style.background = color;
    this.layers.fx.appendChild(f);
    setTimeout(() => f.remove(), 600);
  }

  async burst(kind: BurstKind): Promise<void> {
    const labels: Record<BurstKind, string> = {
      objection: 'OBJECTION!',
      holdit: 'HOLD IT!',
      exhibit: 'EXHIBIT A!',
      gotcha: 'I SEE YOU.',
      sustained: 'SUSTAINED',
      overruled: 'OVERRULED',
      granted: 'GRANTED',
    };
    if (kind === 'sustained' || kind === 'overruled' || kind === 'granted') {
      const s = el('div', `stamp stamp-${kind}`, labels[kind]);
      this.layers.fx.appendChild(s);
      audio.sfx(kind === 'overruled' ? 'stamp' : 'gavel');
      this.shake(0.6);
      await this.wait(1100);
      s.classList.add('out');
      setTimeout(() => s.remove(), 300);
      return;
    }
    const pts: string[] = [];
    const n = 22;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = i % 2 ? 0.72 : 1;
      pts.push(`${(50 + Math.cos(a) * 48 * r).toFixed(1)},${(50 + Math.sin(a) * 40 * r).toFixed(1)}`);
    }
    const b = el(
      'div',
      `burst burst-${kind}`,
      `<div class="speedlines"></div><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="${pts.join(' ')}"/></svg><span>${labels[kind]}</span>`,
    );
    this.layers.fx.appendChild(b);
    audio.sfx(kind === 'gotcha' ? 'gotcha' : kind);
    this.shake(kind === 'gotcha' ? 0.4 : 1.2);
    await this.wait(kind === 'gotcha' ? 1200 : 950);
    b.classList.add('out');
    setTimeout(() => b.remove(), 250);
  }

  async fade(dir: 'in' | 'out', ms = 500): Promise<void> {
    const f = this.layers.fade;
    f.style.transitionDuration = `${ms}ms`;
    f.classList.toggle('on', dir === 'out');
    await this.wait(ms);
  }

  async titleCard(text: string, sub?: string): Promise<void> {
    const t = el('div', 'title-card', `<div class="tc-text"></div>${sub ? `<div class="tc-sub"></div>` : ''}`);
    this.layers.fx.appendChild(t);
    const write = async (node: Element, s: string) => {
      for (const ch of s) {
        node.textContent += ch;
        if (ch.trim()) audio.sfx('typewriter');
        await this.wait(32);
      }
    };
    try {
      await write(t.querySelector('.tc-text')!, text);
      if (sub) await write(t.querySelector('.tc-sub')!, sub);
      await Promise.race([this.wait(1500), this.waitAdvance()]);
    } finally {
      t.classList.add('out');
      setTimeout(() => t.remove(), 500);
    }
  }

  /** Full-screen chapter card. */
  async caseCard(kicker: string, title: string, sub: string): Promise<void> {
    const c = el('div', 'case-card no-advance', `<div class="cc-kicker">${kicker}</div><div class="cc-title">${title}</div><div class="cc-rule"></div><div class="cc-sub">${sub}</div>`);
    this.layers.fx.appendChild(c);
    audio.sfx('reveal');
    try {
      await this.wait(900);
      await Promise.race([this.wait(3500), this.waitAdvance()]);
    } finally {
      c.classList.add('out');
      setTimeout(() => c.remove(), 700);
    }
    await this.wait(500);
  }

  call(who: CharId | null): void {
    this.layers.hud.querySelector('.call-inset')?.remove();
    if (!who) return;
    const c = el('div', 'call-inset', `<div class="call-face">${portraitSVG(who, 'neutral', this.outfits[who])}</div><div class="call-label">☎ ${CHARACTERS[who].name}</div>`);
    this.layers.hud.appendChild(c);
  }

  // ---------------------------------------------------------------------------
  // state helpers

  flag(id: string): boolean {
    return Boolean(this.state.flags[id]);
  }

  setFlag(id: string, v = true): void {
    this.state.flags[id] = v;
  }

  has(id: string): boolean {
    return this.state.evidence.includes(id) || this.state.profiles.includes(id);
  }

  seen(key: string): boolean {
    return this.state.seen.includes(key);
  }

  markSeen(key: string): void {
    if (!this.seen(key)) this.state.seen.push(key);
  }

  async giveEvidence(id: string, quiet = false): Promise<void> {
    const def = this.content.evidence[id];
    if (!def) throw new Error(`Unknown evidence "${id}"`);
    if (this.state.evidence.includes(id)) return;
    this.state.evidence.push(id);
    if (quiet) return;
    await this.itemPopup(def.icon, def.kind === 'deduction' ? 'Deduction added' : 'Added to the Court Record', def.name, def.short);
  }

  async updateEvidence(id: string, note: string): Promise<void> {
    const def = this.content.evidence[id];
    audio.sfx('paper');
    await this.itemPopup(def.icon, 'Court Record updated', def.name, note);
  }

  async giveProfile(id: string): Promise<void> {
    const def = this.content.profiles[id];
    if (!def) throw new Error(`Unknown profile "${id}"`);
    if (this.state.profiles.includes(id)) return;
    this.state.profiles.push(id);
    const art = def.char ? `<div class="pop-face">${portraitSVG(def.char, 'neutral')}</div>` : icon(def.icon ?? 'card');
    await this.itemPopup('', 'Profile added', def.name, def.role, art);
  }

  private async itemPopup(iconId: string, kicker: string, name: string, desc: string, art?: string): Promise<void> {
    audio.sfx('evidence');
    const p = el('div', 'item-pop', `<div class="pop-art">${art ?? icon(iconId)}</div><div class="pop-body"><div class="pop-kicker">${kicker}</div><div class="pop-name">${escapeHtml(name)}</div><div class="pop-desc">${escapeHtml(desc)}</div></div>`);
    this.layers.fx.appendChild(p);
    try {
      await this.wait(350);
      await this.waitAdvance();
    } finally {
      p.classList.add('out');
      setTimeout(() => p.remove(), 300);
    }
  }

  async stat(id: StatId, delta: number): Promise<void> {
    this.state.stats[id] += delta;
    if (id === 'money') return;
    const labels: Record<StatId, string> = { integrity: 'Integrity', notoriety: 'Notoriety', money: 'Cash', trust: 'Client Trust' };
    const t = el('div', `stat-toast stat-${id}`, `${labels[id]} ${delta > 0 ? '+' : ''}${delta}`);
    this.layers.fx.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  async jury(delta: number): Promise<void> {
    const t = this.state.trial;
    t.jury = Math.max(0, Math.min(100, t.jury + delta));
    this.renderHud(delta);
    if (delta < 0) {
      audio.sfx('damage');
      this.shake(0.8);
    } else if (delta > 0) audio.sfx('success');
    await this.wait(450);
    if (t.jury <= 0) throw new GameOver('jury');
  }

  async warn(): Promise<void> {
    const t = this.state.trial;
    t.patience -= 1;
    audio.sfx('gavel');
    this.renderHud();
    this.shake(0.7);
    if (t.patience <= 0) {
      t.patience = 2;
      this.state.stats.money -= 500;
      await this.say('judge', 'That is *contempt of court*, Mr. Vane. Five hundred dollars. Payable today. And the jury will disregard every theatrical thing you just did.', { expr: 'stern' });
      await this.jury(-15);
    }
  }

  useFocus(): boolean {
    const t = this.state.trial;
    if (t.focus <= 0) return false;
    t.focus -= 1;
    this.renderHud();
    return true;
  }

  gainFocus(n = 1): void {
    const t = this.state.trial;
    t.focus = Math.min(t.maxFocus, t.focus + n);
    this.renderHud();
  }

  // ---------------------------------------------------------------------------
  // HUD

  renderHud(delta = 0): void {
    const hud = this.layers.hud;
    let court = hud.querySelector<HTMLElement>('.court-hud');
    const t = this.state.trial;
    if (!t.active) {
      court?.remove();
      return;
    }
    if (!court) {
      court = el('div', 'court-hud no-advance');
      hud.appendChild(court);
    }
    const label = this.court.bench ? 'THE BENCH' : 'JURY';
    const jurors = this.court.bench
      ? `<span class="bench-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="11" height="6" rx="1.5" transform="rotate(-35 8.5 7)"/><rect x="9" y="9" width="3" height="13" rx="1.5" transform="rotate(-35 10.5 15)"/></svg></span>`
      : Array.from({ length: 12 }, (_, i) => {
      const threshold = 6 + i * 8;
          return `<span class="juror ${t.jury > threshold ? 'acquit' : 'convict'}"><svg viewBox="0 0 20 24"><circle cx="10" cy="7" r="5.5"/><path d="M 1 24 Q 1 13 10 13 Q 19 13 19 24 Z"/></svg></span>`;
        }).join('');
    court.innerHTML = `
      <div class="hud-focus" title="Focus — spend it to Read a witness">${Array.from({ length: t.maxFocus }, (_, i) => `<span class="eye ${i < t.focus ? 'on' : ''}">◉</span>`).join('')}<label>FOCUS</label></div>
      <div class="hud-jury ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}" title="Jury sway — if it hits zero, the jury convicts">
        <div class="jurors">${jurors}</div>
        <div class="jury-bar"><div class="jury-fill" style="width:${t.jury}%"></div><div class="jury-mark"></div></div>
        <label>${label} <b>${t.jury}</b>${delta ? `<span class="delta">${delta > 0 ? '+' : ''}${delta}</span>` : ''}</label>
      </div>
      <div class="hud-patience" title="Judge's patience — run out and you're in contempt">${Array.from({ length: 3 }, (_, i) => `<span class="gavel ${i < t.patience ? 'on' : ''}"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="11" height="6" rx="1.5" transform="rotate(-35 8.5 7)"/><rect x="9" y="9" width="3" height="13" rx="1.5" transform="rotate(-35 10.5 15)"/></svg></span>`).join('')}<label>PATIENCE</label></div>`;
  }

  setLocation(name: string | null): void {
    let loc = this.layers.hud.querySelector<HTMLElement>('.hud-loc');
    if (!name) {
      loc?.remove();
      return;
    }
    if (!loc) {
      loc = el('div', 'hud-loc');
      this.layers.hud.appendChild(loc);
    }
    loc.textContent = name;
  }

  // ---------------------------------------------------------------------------
  // record

  async viewRecord(): Promise<void> {
    await openRecord(this, { mode: 'view' });
  }

  /** Ask the player to present something. Resolves the item id, or null if cancelled. */
  present(opts: Omit<RecordOpts, 'mode'> = {}): Promise<string | null> {
    return openRecord(this, { ...opts, mode: 'present' });
  }

  // ---------------------------------------------------------------------------

  private async gameOverScreen(e: GameOver): Promise<boolean> {
    this.hideDialogue();
    this.layers.ui.innerHTML = '';
    audio.music(null);
    audio.sfx('gavel');
    const verdict = e.reason === 'jury';
    const bench = this.court.bench;
    const defendant = String(this.state.vars.defendant ?? 'Corvin Mallory');
    const kicker = verdict ? (bench ? 'THE COURT HAS RULED' : 'THE JURY HAS REACHED A VERDICT') : 'THE STORY ENDS HERE';
    const title = verdict ? (bench ? 'DENIED' : 'GUILTY') : escapeHtml(e.detail || 'Case Closed');
    const sub = verdict
      ? bench
        ? `You lost the judge. The motion is denied, and ${escapeHtml(defendant)} stays in a cell.`
        : `You lost the room. ${escapeHtml(defendant)} is led away in handcuffs.`
      : 'Not every road leads to the truth.';
    const box = el(
      'div',
      'gameover no-advance',
      `<div class="go-kicker">${kicker}</div>
       <div class="go-title">${title}</div>
       <div class="go-sub">${sub}</div>
       <div class="go-buttons"><button class="btn primary" data-v="retry">Retry from checkpoint</button><button class="btn" data-v="title">Return to title</button></div>`,
    );
    this.layers.overlay.appendChild(box);
    this.overlayDepth++;
    try {
      return await this.waitFor<boolean>((done) => {
        box.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
          b.onclick = () => {
            audio.sfx('select');
            done(b.dataset.v === 'retry');
          };
        });
      });
    } finally {
      this.overlayDepth--;
      box.remove();
    }
  }
}
