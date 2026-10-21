/**
 * A tiny screenplay language for writing scenes.
 *
 *   @bg office                     change background
 *   @show rosa smile right         put a character on stage
 *   @hide rosa | @hide all
 *   @expr rosa annoyed             change expression silently
 *   @music trial | @music stop
 *   @sfx gavel
 *   @shake [strength] | @flash [color] | @burst objection
 *   @wait 400
 *   @evidence cue_sheet | @profile benny
 *   @flag met_iris [off]
 *   @stat notoriety +1 | @jury -10 | @warn
 *   @title Paramount Theater | Oct 14, 10:32 AM
 *   @fade out [ms] | @fade in [ms]
 *   @filter flashback | @filter none
 *   @call tino | @call off       phone-call inset portrait
 *   @outfit corvin jail            switch a character's outfit
 *
 *   rosa[smile]: Spoken line, with *emphasis* and {w} pauses.
 *   rosa: Same speaker, keep expression.
 *   [Bailiff]: A one-off nameplate with no portrait.
 *   : Narration with no nameplate.
 *   ~ Ezra's inner thoughts.
 *   // comment
 */
import type { BurstKind, CharId, Cmd, Pos, StatId } from './types';

export const CHAR_IDS: readonly CharId[] = [
  'ezra',
  'rosa',
  'corvin',
  'iris',
  'benny',
  'brandt',
  'strand',
  'judge',
  'tino',
  'teo',
  'kessler',
  'jojo',
  'whitfield',
  'nand',
  'crane',
  'ortega',
];
const POSITIONS: readonly Pos[] = ['farleft', 'left', 'center', 'right', 'farright'];
const STATS: readonly StatId[] = ['integrity', 'notoriety', 'money', 'trust'];
const BURSTS: readonly BurstKind[] = ['objection', 'holdit', 'exhibit', 'gotcha', 'sustained', 'overruled', 'granted'];

export class ScriptError extends Error {}

function asChar(s: string, line: string): CharId {
  if (!(CHAR_IDS as readonly string[]).includes(s)) throw new ScriptError(`Unknown character "${s}" in: ${line}`);
  return s as CharId;
}

function parseNumber(s: string | undefined, line: string): number {
  const n = Number(s);
  if (s === undefined || Number.isNaN(n)) throw new ScriptError(`Expected a number in: ${line}`);
  return n;
}

export function parseLine(raw: string): Cmd | null {
  const line = raw.trim();
  if (!line || line.startsWith('//')) return null;

  if (line.startsWith('@')) {
    const [head, ...rest] = line.slice(1).split(/\s+/);
    const arg = rest.join(' ');
    switch (head) {
      case 'bg':
        return { t: 'bg', id: rest[0], instant: rest[1] === 'instant' };
      case 'show': {
        const pos = (rest[2] ?? 'center') as Pos;
        if (!POSITIONS.includes(pos)) throw new ScriptError(`Bad position "${pos}" in: ${line}`);
        return { t: 'show', who: asChar(rest[0], line), expr: rest[1] ?? 'neutral', pos };
      }
      case 'hide':
        return { t: 'hide', who: rest[0] === 'all' ? 'all' : asChar(rest[0], line) };
      case 'expr':
        return { t: 'expr', who: asChar(rest[0], line), expr: rest[1] };
      case 'sfx':
        return { t: 'sfx', id: rest[0] };
      case 'music':
        return { t: 'music', id: rest[0] === 'stop' ? null : rest[0] };
      case 'shake':
        return { t: 'shake', strength: rest[0] ? parseNumber(rest[0], line) : 1 };
      case 'flash':
        return { t: 'flash', color: rest[0] ?? '#ffffff' };
      case 'burst': {
        const kind = rest[0] as BurstKind;
        if (!BURSTS.includes(kind)) throw new ScriptError(`Bad burst "${kind}" in: ${line}`);
        return { t: 'burst', kind };
      }
      case 'wait':
        return { t: 'wait', ms: parseNumber(rest[0], line) };
      case 'evidence':
        return { t: 'evidence', id: rest[0] };
      case 'profile':
        return { t: 'profile', id: rest[0] };
      case 'flag':
        return { t: 'flag', id: rest[0], value: rest[1] !== 'off' };
      case 'stat': {
        const id = rest[0] as StatId;
        if (!STATS.includes(id)) throw new ScriptError(`Bad stat "${id}" in: ${line}`);
        return { t: 'stat', id, delta: parseNumber(rest[1], line) };
      }
      case 'jury':
        return { t: 'jury', delta: parseNumber(rest[0], line) };
      case 'warn':
        return { t: 'warn' };
      case 'title': {
        const [text, sub] = arg.split('|').map((s) => s.trim());
        return { t: 'title', text, sub };
      }
      case 'fade': {
        const dir = rest[0] === 'in' ? 'in' : 'out';
        return { t: 'fade', dir, ms: rest[1] ? parseNumber(rest[1], line) : 500 };
      }
      case 'filter': {
        const mode = rest[0] as 'none' | 'flashback' | 'noir';
        if (!['none', 'flashback', 'noir'].includes(mode)) throw new ScriptError(`Bad filter in: ${line}`);
        return { t: 'filter', mode };
      }
      case 'outfit':
        return { t: 'outfit', who: asChar(rest[0], line), id: rest[1] };
      case 'call':
        return { t: 'call', who: rest[0] === 'off' ? null : asChar(rest[0], line) };
      default:
        throw new ScriptError(`Unknown command "@${head}" in: ${line}`);
    }
  }

  if (line.startsWith('~')) {
    return { t: 'say', who: 'ezra', text: line.slice(1).trim(), thought: true };
  }
  if (line.startsWith(':')) {
    return { t: 'say', who: null, text: line.slice(1).trim() };
  }
  const custom = /^\[([^\]]+)\]:\s?(.*)$/.exec(line);
  if (custom) {
    return { t: 'say', who: null, name: custom[1], text: custom[2] };
  }
  const m = /^([a-z]+)(?:\[([a-z_]+)\])?:\s?(.*)$/.exec(line);
  if (m) {
    return { t: 'say', who: asChar(m[1], line), expr: m[2], text: m[3] };
  }
  throw new ScriptError(`Can't parse line: ${line}`);
}

export function parse(src: string): Cmd[] {
  const out: Cmd[] = [];
  for (const raw of src.split('\n')) {
    const cmd = parseLine(raw);
    if (cmd) out.push(cmd);
  }
  return out;
}

/** Tagged template: s`rosa: Hello ${name}.` */
export function s(strings: TemplateStringsArray, ...values: unknown[]): Cmd[] {
  let src = '';
  strings.forEach((str, i) => {
    src += str + (i < values.length ? String(values[i]) : '');
  });
  return parse(src);
}

/** Split a line of dialogue into renderable segments. */
export interface TextSeg {
  text: string;
  em?: boolean;
  pause?: number;
}

export function segmentText(text: string): TextSeg[] {
  const segs: TextSeg[] = [];
  const re = /\*([^*]+)\*|\{w(\d*)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) segs.push({ text: text.slice(last, m.index) });
    if (m[1] !== undefined) segs.push({ text: m[1], em: true });
    else segs.push({ text: '', pause: m[2] ? Number(m[2]) : 350 });
    last = re.lastIndex;
  }
  if (last < text.length) segs.push({ text: text.slice(last) });
  return segs;
}
