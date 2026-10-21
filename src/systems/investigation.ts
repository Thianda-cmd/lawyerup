/**
 * Investigation: move between locations, examine hotspots, question people
 * and present evidence to them. Fully resumable from saved state.
 */
import { CHARACTERS } from '../content/characters';
import { audio } from '../engine/audio';
import { type Game, el, escapeHtml } from '../engine/game';
import type { CharId, Choice, Pos, Script } from '../engine/types';

type Cond = (g: Game) => boolean;

export interface Hotspot {
  id: string;
  label: string;
  /** Rectangle in stage coordinates (1600 x 900). */
  rect: [number, number, number, number];
  when?: Cond;
  /** Marks an already-examined spot as worth another look (new information unlocked). */
  again?: Cond;
  script: Script;
}

export interface Topic {
  id: string;
  label: string;
  when?: Cond;
  script: Script;
  tag?: string;
}

export interface Person {
  char: CharId;
  expr?: string;
  pos?: Pos;
  outfit?: string;
  when?: Cond;
  topics: Topic[];
  present?: Record<string, Script>;
  presentDefault?: Script;
}

export interface Location {
  id: string;
  name: string;
  bg: string;
  music?: string;
  when?: Cond;
  /** Played the first time the player arrives. */
  enter?: Script;
  hotspots: Hotspot[];
  people: Person[];
  exits: string[];
}

export interface InvestigationDef {
  id: string;
  start: string;
  locations: Record<string, Location>;
  /** When true, the "wrap up" option appears. */
  ready: Cond;
  finishLabel: string;
  /** Runs when the player chooses to wrap up; return false to stay. */
  finish: (g: Game) => Promise<boolean>;
  /** Optional hint when the player asks Rosa what's left. */
  hint?: (g: Game) => string;
}

type Action = 'examine' | 'talk' | 'present' | 'move' | 'finish' | 'hint';

const key = (def: InvestigationDef, ...parts: string[]) => [def.id, ...parts].join(':');

function peopleHere(g: Game, loc: Location): Person[] {
  return loc.people.filter((p) => !p.when || p.when(g));
}

function spotSeen(g: Game, def: InvestigationDef, loc: Location, h: Hotspot): boolean {
  return g.seen(key(def, 'spot', loc.id, h.id)) && !(h.again && h.again(g));
}

function showPeople(g: Game, loc: Location): void {
  const ppl = peopleHere(g, loc);
  for (const id of ['ezra', 'rosa', 'corvin', 'iris', 'benny', 'brandt', 'strand', 'judge', 'tino'] as CharId[]) {
    if (!ppl.some((p) => p.char === id)) g.hide(id);
  }
  const auto: Pos[] = ppl.length === 1 ? ['center'] : ppl.length === 2 ? ['left', 'right'] : ['left', 'center', 'right'];
  ppl.forEach((p, i) => {
    if (p.outfit) void g.exec({ t: 'outfit', who: p.char, id: p.outfit });
    g.show(p.char, p.expr ?? 'neutral', p.pos ?? auto[i] ?? 'center');
  });
}

function actionBar(g: Game, def: InvestigationDef, loc: Location): Promise<Action> {
  const ppl = peopleHere(g, loc);
  const hasNewTopic = ppl.some((p) => p.topics.some((t) => (!t.when || t.when(g)) && !g.seen(key(def, 'topic', p.char, t.id))));
  const hasNewSpot = loc.hotspots.some((h) => (!h.when || h.when(g)) && !spotSeen(g, def, loc, h));
  const buttons: [Action, string, string, boolean, boolean][] = [
    ['examine', '🔍', 'Examine', true, hasNewSpot],
    ['talk', '💬', 'Talk', ppl.length > 0, hasNewTopic],
    ['present', '📁', 'Present', ppl.length > 0, false],
    ['move', '🚪', 'Move', true, false],
  ];
  const bar = el(
    'div',
    'inv-bar no-advance',
    `${buttons
      .filter((b) => b[3])
      .map(([a, ic, label, , fresh]) => `<button class="inv-btn" data-a="${a}"><span class="ic">${ic}</span>${label}${fresh ? '<i class="dot"></i>' : ''}</button>`)
      .join('')}
     ${def.hint ? `<button class="inv-btn small" data-a="hint" title="Ask Rosa what's left"><span class="ic">?</span>Hint</button>` : ''}
     ${def.ready(g) ? `<button class="inv-btn finish" data-a="finish"><span class="ic">⚖</span>${escapeHtml(def.finishLabel)}</button>` : ''}`,
  );
  g.layers.ui.appendChild(bar);
  return g
    .waitFor<Action>((done) => {
      const onClick = (e: MouseEvent) => {
        const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-a]');
        if (!b) return;
        audio.sfx('select');
        done(b.dataset.a as Action);
      };
      bar.addEventListener('click', onClick);
      return () => bar.removeEventListener('click', onClick);
    })
    .finally(() => bar.remove());
}

async function examine(g: Game, def: InvestigationDef, loc: Location): Promise<void> {
  g.hideAll(true);
  for (;;) {
    const spots = loc.hotspots.filter((h) => !h.when || h.when(g));
    const layer = el('div', 'examine no-advance');
    layer.innerHTML = `<div class="examine-tip">Click anything that looks interesting.</div>
      ${spots
        .map(
          (h) =>
            `<button class="spot ${spotSeen(g, def, loc, h) ? 'seen' : ''}" data-id="${h.id}" style="left:${h.rect[0]}px;top:${h.rect[1]}px;width:${h.rect[2]}px;height:${h.rect[3]}px"><span>${escapeHtml(h.label)}</span></button>`,
        )
        .join('')}
      <button class="btn examine-back">← Back</button>`;
    g.layers.play.appendChild(layer);
    const picked = await g
      .waitFor<string | null>((done) => {
        const onClick = (e: MouseEvent) => {
          const t = e.target as HTMLElement;
          if (t.closest('.examine-back')) {
            audio.sfx('back');
            return done(null);
          }
          const s = t.closest<HTMLElement>('.spot');
          if (s) {
            audio.sfx('click');
            done(s.dataset.id!);
          }
        };
        layer.addEventListener('click', onClick);
        return () => layer.removeEventListener('click', onClick);
      })
      .finally(() => layer.remove());
    if (!picked) break;
    const spot = spots.find((s) => s.id === picked)!;
    g.markSeen(key(def, 'spot', loc.id, spot.id));
    await g.run(spot.script);
    g.hideDialogue();
    g.hideAll(true);
  }
  showPeople(g, loc);
}

async function pickPerson(g: Game, loc: Location, prompt: string): Promise<Person | null> {
  const ppl = peopleHere(g, loc);
  if (ppl.length === 1) return ppl[0];
  const choice = await g.choose<CharId | null>(
    [...ppl.map((p) => ({ label: CHARACTERS[p.char].full, value: p.char as CharId | null })), { label: 'Never mind', value: null }],
    { prompt },
  );
  g.hideDialogue();
  return ppl.find((p) => p.char === choice) ?? null;
}

async function talk(g: Game, def: InvestigationDef, loc: Location): Promise<void> {
  const person = await pickPerson(g, loc, 'Who should I talk to?');
  if (!person) return;
  for (;;) {
    const topics = person.topics.filter((t) => !t.when || t.when(g));
    const choices: Choice<string | null>[] = topics.map((t) => {
      const seen = g.seen(key(def, 'topic', person.char, t.id));
      return { label: t.label, value: t.id, done: seen, tag: t.tag ?? (seen ? undefined : 'NEW') };
    });
    choices.push({ label: 'Back', value: null });
    const id = await g.choose(choices, { prompt: 'What should I ask about?' });
    g.hideDialogue();
    if (!id) return;
    const topic = topics.find((t) => t.id === id)!;
    g.markSeen(key(def, 'topic', person.char, topic.id));
    await g.run(topic.script);
    g.hideDialogue();
    showPeople(g, loc);
  }
}

async function present(g: Game, loc: Location): Promise<void> {
  const person = await pickPerson(g, loc, 'Show it to whom?');
  if (!person) return;
  const id = await g.present({ title: 'Present what?' });
  if (!id) return;
  const script = person.present?.[id] ?? person.presentDefault;
  if (script) await g.run(script);
  else await g.say(person.char, "I don't know what you want me to say about that.");
  g.hideDialogue();
  showPeople(g, loc);
}

async function move(g: Game, def: InvestigationDef, loc: Location): Promise<boolean> {
  const exits = loc.exits.map((id) => def.locations[id]).filter((l) => !l.when || l.when(g));
  const id = await g.choose<string | null>(
    [...exits.map((l) => ({ label: l.name, value: l.id, tag: g.seen(key(def, 'visit', l.id)) ? undefined : 'NEW' })), { label: 'Stay here', value: null }],
    { prompt: 'Where to?' },
  );
  g.hideDialogue();
  if (!id) return false;
  audio.sfx('door');
  g.state.inv.location = id;
  return true;
}

export async function investigate(g: Game, def: InvestigationDef): Promise<void> {
  g.recordEnabled = true;
  if (!g.state.inv.location || !def.locations[g.state.inv.location]) g.state.inv.location = def.start;
  let arrived = true;
  try {
    for (;;) {
      const loc = def.locations[g.state.inv.location];
      if (arrived) {
        g.hideDialogue();
        await g.fade('out', 250);
        g.hideAll(true);
        await g.bg(loc.bg, true);
        if (loc.music) audio.music(loc.music);
        g.setLocation(loc.name);
        await g.fade('in', 300);
        if (!g.seen(key(def, 'visit', loc.id))) {
          g.markSeen(key(def, 'visit', loc.id));
          if (loc.enter) {
            await g.run(loc.enter);
            g.hideDialogue();
          }
        }
        showPeople(g, loc);
        arrived = false;
      }
      g.checkpoint();
      const action = await actionBar(g, def, loc);
      if (action === 'examine') await examine(g, def, loc);
      else if (action === 'talk') await talk(g, def, loc);
      else if (action === 'present') await present(g, loc);
      else if (action === 'move') arrived = await move(g, def, loc);
      else if (action === 'hint' && def.hint) {
        await g.say('rosa', def.hint(g), { expr: 'think' });
        g.hideDialogue();
      } else if (action === 'finish') {
        if (await def.finish(g)) break;
        g.hideDialogue();
        showPeople(g, loc);
      }
      if (g.currentBg !== loc.bg && !arrived) {
        // a script changed scenery (e.g. a cutaway); restore it
        await g.bg(loc.bg, true);
        showPeople(g, loc);
      }
    }
  } finally {
    g.setLocation(null);
    g.layers.play.innerHTML = '';
  }
  g.state.inv.location = '';
}
