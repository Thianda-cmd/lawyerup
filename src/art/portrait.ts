/**
 * Procedural vector portraits. Every character is assembled from a shared
 * head/face rig (eyes, brows, nose, mouth) plus hand-drawn hair and outfits
 * defined in cast.ts. The rig exposes CSS hooks used for blinking, talking
 * and the mentalist "tells" (.p-pupils, .p-brows, .p-mouth, .p-throat, .p-sweat-tell).
 *
 * Canvas: 600 x 900. Head centered on x = 300.
 */
import { shade, skinShadow } from './color';

export const CX = 300;

export type BrowKind = 'neutral' | 'up' | 'angry' | 'sad' | 'furrow' | 'flat' | 'skeptic' | 'raised';
export type EyeKind = 'open' | 'wide' | 'half' | 'narrow' | 'closed' | 'happy' | 'sadclosed' | 'side' | 'sideR' | 'down' | 'up';
export type MouthKind =
  | 'neutral'
  | 'smile'
  | 'grin'
  | 'laugh'
  | 'smirk'
  | 'frown'
  | 'sad'
  | 'open'
  | 'o'
  | 'grimace'
  | 'tight'
  | 'wry';
export type NoseKind = 'straight' | 'hook' | 'button' | 'broad' | 'small';

export interface ExprParams {
  brow: BrowKind;
  eyes: EyeKind;
  mouth: MouthKind;
  sweat?: boolean;
  blush?: boolean;
  shade?: boolean;
  tear?: boolean;
  vein?: boolean;
  pinpoint?: boolean;
  silhouette?: boolean;
}

export interface Ctx {
  uid: string;
  b: Build;
  e: ExprParams;
  skin: string;
  shadow: string;
  line: string;
  outfit: string;
}

export interface Build {
  skin: string;
  line?: string;
  /** Half-width of the face at the temples. */
  W?: number;
  /** Half-width of the jaw corners. */
  J?: number;
  chinY?: number;
  chinW?: number;
  eyeColor: string;
  eyeSize?: number;
  eyeTilt?: number;
  eyeY?: number;
  eyeGap?: number;
  lash?: boolean;
  browColor: string;
  browThick?: number;
  browY?: number;
  nose: NoseKind;
  mouthW?: number;
  lips?: string;
  age?: 0 | 1 | 2 | 3;
  neckW?: number;
  stubble?: string;
  hairBack?: (c: Ctx) => string;
  hairFront: (c: Ctx) => string;
  facial?: (c: Ctx) => string;
  outfits: Record<string, (c: Ctx) => string>;
  defaultOutfit: string;
  /** Drawn on top of everything (glasses, hats...). */
  over?: (c: Ctx) => string;
  /** Drawn between face and hair (earrings, beauty marks). */
  faceExtras?: (c: Ctx) => string;
  /** Drawn on the skin before the eyes (eyeshadow, eye bags). */
  makeup?: (c: Ctx) => string;
}

// ---------------------------------------------------------------------------
// helpers

/** Mirror absolute path data (M/L/C/Q/Z only) across x = 300. */
export function mirror(d: string): string {
  return d.replace(/(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)/g, (_m, x: string, y: string) => `${600 - Number(x)} ${y}`);
}

/** Path plus its mirror image. */
export function sym(d: string): string {
  return `${d} ${mirror(d)}`;
}

let uidCounter = 0;

const BROW_OFFSETS: Record<Exclude<BrowKind, 'skeptic'>, [number, number, number]> = {
  neutral: [0, 0, 0],
  up: [-13, -14, -8],
  raised: [-6, -7, -3],
  angry: [12, -1, -8],
  sad: [-12, -3, 7],
  furrow: [7, 3, 0],
  flat: [3, 5, 6],
};

// ---------------------------------------------------------------------------
// face parts

function facePath(b: Build): string {
  const W = b.W ?? 112;
  const J = b.J ?? 84;
  const cy = b.chinY ?? 486;
  const cw = b.chinW ?? 38;
  return `M ${CX - W} 300 C ${CX - W} 205 ${CX - W * 0.58} 150 ${CX} 150 C ${CX + W * 0.58} 150 ${CX + W} 205 ${CX + W} 300
    C ${CX + W} 352 ${CX + J + 14} 398 ${CX + J} 428 Q ${CX + cw} ${cy - 6} ${CX} ${cy}
    Q ${CX - cw} ${cy - 6} ${CX - J} 428 C ${CX - J - 14} 398 ${CX - W} 352 ${CX - W} 300 Z`;
}

interface EyeGeo {
  up: number;
  low: number;
  r: number;
  pupil: number;
  px: number;
  py: number;
  closed?: 'happy' | 'sad' | 'flat';
  lid?: number;
}

function eyeGeo(kind: EyeKind, size: number): EyeGeo {
  const s = size;
  switch (kind) {
    case 'wide':
      return { up: 23 * s, low: 13 * s, r: 10 * s, pupil: 3.4 * s, px: 0, py: 0 };
    case 'half':
      return { up: 6 * s, low: 9 * s, r: 12 * s, pupil: 5.5 * s, px: 0, py: 2, lid: 1 };
    case 'narrow':
      return { up: 10 * s, low: 7 * s, r: 11.5 * s, pupil: 5 * s, px: 0, py: 0, lid: 1 };
    case 'closed':
      return { up: 0, low: 0, r: 0, pupil: 0, px: 0, py: 0, closed: 'flat' };
    case 'happy':
      return { up: 0, low: 0, r: 0, pupil: 0, px: 0, py: 0, closed: 'happy' };
    case 'sadclosed':
      return { up: 0, low: 0, r: 0, pupil: 0, px: 0, py: 0, closed: 'sad' };
    case 'side':
      return { up: 15 * s, low: 9 * s, r: 11.5 * s, pupil: 5.5 * s, px: -9, py: 1 };
    case 'sideR':
      return { up: 15 * s, low: 9 * s, r: 11.5 * s, pupil: 5.5 * s, px: 9, py: 1 };
    case 'down':
      return { up: 11 * s, low: 9 * s, r: 11.5 * s, pupil: 5.5 * s, px: 0, py: 5, lid: 1 };
    case 'up':
      return { up: 18 * s, low: 10 * s, r: 11.5 * s, pupil: 5.5 * s, px: 0, py: -6 };
    default:
      return { up: 17 * s, low: 10 * s, r: 12 * s, pupil: 5.5 * s, px: 0, py: 0 };
  }
}

function eye(c: Ctx, side: -1 | 1): string {
  const { b, e, line, skin, shadow, uid } = c;
  const gap = b.eyeGap ?? 52;
  const cy = b.eyeY ?? 338;
  const cx = CX + side * gap;
  const d = side; // outer corner direction
  const size = (b.eyeSize ?? 1) * 1.08;
  const tilt = b.eyeTilt ?? 0;
  const g = eyeGeo(e.eyes, size);
  const ox = cx + d * 27 * size;
  const oy = cy - tilt;
  const ix = cx - d * 24 * size;
  const iy = cy + 2;
  const socket = `<ellipse cx="${cx}" cy="${cy - 8}" rx="${34 * size}" ry="${20 * size}" fill="${shadow}" opacity="0.28"/>`;

  if (g.closed) {
    const bend = g.closed === 'happy' ? -9 : g.closed === 'sad' ? 7 : 3;
    return `${socket}<path d="M ${ox} ${oy} Q ${cx} ${cy + bend} ${ix} ${iy}" fill="none" stroke="${line}" stroke-width="4.5" stroke-linecap="round"/>
      ${b.lash ? `<path d="M ${ox} ${oy} L ${ox + d * 9} ${oy - 4}" stroke="${line}" stroke-width="4" stroke-linecap="round"/>` : ''}`;
  }

  const upper = `M ${ox} ${oy} C ${cx + d * 13} ${cy - g.up} ${cx - d * 11} ${cy - g.up} ${ix} ${iy}`;
  const lower = `C ${cx - d * 10} ${cy + g.low} ${cx + d * 14} ${cy + g.low} ${ox} ${oy}`;
  const shape = `${upper} ${lower} Z`;
  const clip = `${uid}-eye${side}`;
  const px = g.px;
  const py = g.py;
  const pin = e.pinpoint ? 0.55 : 1;
  const crease = `<path d="M ${ox - d * 2} ${oy - 7} C ${cx + d * 12} ${cy - 17 * size - 12} ${cx - d * 9} ${cy - 17 * size - 12} ${ix + d * 3} ${iy - 9}" fill="none" stroke="${line}" stroke-width="2" opacity="0.35" stroke-linecap="round"/>`;
  return `${socket}${crease}
    <clipPath id="${clip}"><path d="${shape}"/></clipPath>
    <path d="${shape}" fill="#fbf7f2"/>
    <g clip-path="url(#${clip})">
      <path d="M ${ox} ${oy} C ${cx + d * 13} ${cy - g.up} ${cx - d * 11} ${cy - g.up} ${ix} ${iy} L ${ix} ${iy - 30} L ${ox} ${oy - 30} Z" fill="${shadow}" opacity="0.18" transform="translate(0 6)"/>
      <g class="p-pupils">
        <circle cx="${cx + px}" cy="${cy + py}" r="${g.r}" fill="${b.eyeColor}"/>
        <circle cx="${cx + px}" cy="${cy + py}" r="${g.r}" fill="none" stroke="${shade(b.eyeColor, -0.5)}" stroke-width="2"/>
        <circle cx="${cx + px}" cy="${cy + py + g.r * 0.25}" r="${g.r * 0.62}" fill="${shade(b.eyeColor, 0.25)}" opacity="0.5"/>
        <circle cx="${cx + px}" cy="${cy + py}" r="${g.pupil * pin}" fill="#120c0c"/>
        <circle cx="${cx + px - 4}" cy="${cy + py - 5}" r="${3.2 * size}" fill="#fff" opacity="0.95"/>
        <circle cx="${cx + px + 4}" cy="${cy + py + 3}" r="${1.4 * size}" fill="#fff" opacity="0.7"/>
      </g>
    </g>
    <path d="${upper}" fill="none" stroke="${line}" stroke-width="${g.lid ? 6 : 4.5}" stroke-linecap="round"/>
    <path d="M ${ix + d * 2} ${iy + 2} C ${cx - d * 10} ${cy + g.low + 1} ${cx + d * 14} ${cy + g.low + 1} ${ox - d * 3} ${oy + 2}" fill="none" stroke="${line}" stroke-width="1.6" opacity="0.45"/>
    ${b.lash ? `<path d="M ${ox + d * 1} ${oy} L ${ox + d * 11} ${oy - 7}" stroke="${line}" stroke-width="5" stroke-linecap="round"/><path d="M ${ox - d * 4} ${oy - 4} L ${ox + d * 4} ${oy - 11}" stroke="${line}" stroke-width="3" stroke-linecap="round"/>` : ''}
    <path class="p-lid" d="${shape}" fill="${skin}" stroke="${line}" stroke-width="3"/>`;
}

function brow(c: Ctx, side: -1 | 1): string {
  const { b, e } = c;
  const gap = b.eyeGap ?? 52;
  const cx = CX + side * gap;
  const by = (b.browY ?? 298) + 0;
  const t = b.browThick ?? 10;
  let kind: Exclude<BrowKind, 'skeptic'>;
  if (e.brow === 'skeptic') kind = side === -1 ? 'furrow' : 'up';
  else kind = e.brow;
  const [di, dm, dout] = BROW_OFFSETS[kind];
  const ix = cx - side * 27;
  const iy = by + di;
  const mx = cx + side * 3;
  const my = by - 10 + dm;
  const ox = cx + side * 34;
  const oy = by + 5 + dout;
  return `<path d="M ${ix} ${iy - t / 2} Q ${mx} ${my - t / 2} ${ox} ${oy} Q ${mx} ${my + t / 2} ${ix} ${iy + t / 2} Z" fill="${b.browColor}" stroke="${b.browColor}" stroke-width="2" stroke-linejoin="round"/>`;
}

function nose(c: Ctx): string {
  const { b, line, shadow } = c;
  switch (b.nose) {
    case 'hook':
      return `<path d="M ${CX + 4} 338 Q ${CX + 18} 360 ${CX + 16} 384 Q ${CX + 18} 398 ${CX + 6} 402 Q ${CX - 4} 404 ${CX - 12} 398" fill="none" stroke="${line}" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M ${CX + 6} 340 Q ${CX + 20} 362 ${CX + 18} 386 L ${CX + 8} 388 Q ${CX + 10} 362 ${CX + 2} 344 Z" fill="${shadow}" opacity="0.55"/>
        <path d="M ${CX - 24} 396 Q ${CX - 18} 404 ${CX - 10} 400" fill="none" stroke="${line}" stroke-width="2.5" opacity="0.7"/>`;
    case 'button':
      return `<path d="M ${CX - 10} 392 Q ${CX} 400 ${CX + 11} 391" fill="none" stroke="${line}" stroke-width="3" stroke-linecap="round"/>
        <path d="M ${CX + 4} 360 Q ${CX + 10} 378 ${CX + 9} 388" fill="none" stroke="${shadow}" stroke-width="4" opacity="0.6" stroke-linecap="round"/>
        <circle cx="${CX - 2}" cy="${386}" r="4" fill="#fff" opacity="0.35"/>`;
    case 'broad':
      return `<path d="M ${CX + 6} 344 Q ${CX + 12} 372 ${CX + 18} 388" fill="none" stroke="${shadow}" stroke-width="5" opacity="0.6" stroke-linecap="round"/>
        <path d="M ${CX - 26} 392 Q ${CX - 30} 404 ${CX - 16} 406 Q ${CX} 412 ${CX + 16} 406 Q ${CX + 30} 404 ${CX + 26} 392" fill="none" stroke="${line}" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M ${CX - 12} 404 Q ${CX - 8} 400 ${CX - 4} 404 M ${CX + 4} 404 Q ${CX + 8} 400 ${CX + 12} 404" fill="none" stroke="${line}" stroke-width="2.5" opacity="0.6"/>`;
    case 'small':
      return `<path d="M ${CX + 5} 368 Q ${CX + 10} 388 ${CX + 2} 394 Q ${CX - 4} 396 ${CX - 8} 392" fill="none" stroke="${line}" stroke-width="2.6" stroke-linecap="round" opacity="0.85"/>
        <path d="M ${CX + 3} 350 Q ${CX + 10} 372 ${CX + 9} 388" fill="none" stroke="${shadow}" stroke-width="4" opacity="0.45" stroke-linecap="round"/>`;
    default:
      return `<path d="M ${CX + 5} 342 Q ${CX + 12} 372 ${CX + 15} 390 Q ${CX + 8} 401 ${CX - 2} 400 Q ${CX - 9} 399 ${CX - 13} 395" fill="none" stroke="${line}" stroke-width="3" stroke-linecap="round"/>
        <path d="M ${CX + 6} 344 Q ${CX + 15} 372 ${CX + 16} 388 L ${CX + 8} 389 Q ${CX + 9} 368 ${CX + 3} 348 Z" fill="${shadow}" opacity="0.5"/>
        <path d="M ${CX - 22} 393 Q ${CX - 17} 401 ${CX - 10} 398" fill="none" stroke="${line}" stroke-width="2.4" opacity="0.6"/>`;
  }
}

function mouthShape(kind: MouthKind, w: number, line: string, lips?: string): string {
  const y = 438;
  const dark = '#4a1518';
  const lipStroke = (d: string) =>
    lips ? `<path d="${d}" fill="none" stroke="${lips}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>` : '';
  const lineStroke = (d: string, sw = 3.6) => `<path d="${d}" fill="none" stroke="${line}" stroke-width="${sw}" stroke-linecap="round"/>`;
  switch (kind) {
    case 'smile': {
      const d = `M ${CX - w - 4} ${y - 5} Q ${CX} ${y + 16} ${CX + w + 4} ${y - 5}`;
      return lipStroke(d) + lineStroke(d);
    }
    case 'grin':
    case 'laugh': {
      const h = kind === 'laugh' ? 34 : 24;
      const d = `M ${CX - w - 6} ${y - 7} Q ${CX} ${y + h} ${CX + w + 6} ${y - 7} Q ${CX} ${y + 2} ${CX - w - 6} ${y - 7} Z`;
      return `${lips ? `<path d="${d}" fill="none" stroke="${lips}" stroke-width="9" stroke-linejoin="round"/>` : ''}
        <path d="${d}" fill="${dark}" stroke="${line}" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M ${CX - w} ${y - 3} Q ${CX} ${y + 6} ${CX + w} ${y - 3} L ${CX + w - 6} ${y + 5} Q ${CX} ${y + 11} ${CX - w + 6} ${y + 5} Z" fill="#fffaf2"/>
        ${kind === 'laugh' ? `<ellipse cx="${CX}" cy="${y + 20}" rx="${w * 0.45}" ry="7" fill="#c4505a"/>` : ''}`;
    }
    case 'smirk': {
      const d = `M ${CX - w + 4} ${y + 3} Q ${CX + 4} ${y + 7} ${CX + w + 6} ${y - 9}`;
      return lipStroke(d) + lineStroke(d) + `<path d="M ${CX + w + 2} ${y - 13} Q ${CX + w + 10} ${y - 8} ${CX + w + 6} ${y - 2}" fill="none" stroke="${line}" stroke-width="2.2" opacity="0.6"/>`;
    }
    case 'wry': {
      const d = `M ${CX - w + 2} ${y} Q ${CX} ${y + 4} ${CX + w - 2} ${y - 3}`;
      return lipStroke(d) + lineStroke(d);
    }
    case 'frown': {
      const d = `M ${CX - w} ${y + 8} Q ${CX} ${y - 7} ${CX + w} ${y + 8}`;
      return lipStroke(d) + lineStroke(d);
    }
    case 'sad': {
      const d = `M ${CX - w + 6} ${y + 6} Q ${CX} ${y - 2} ${CX + w - 6} ${y + 6}`;
      return lipStroke(d) + lineStroke(d);
    }
    case 'open': {
      return `${lips ? `<ellipse cx="${CX}" cy="${y + 10}" rx="17" ry="22" fill="none" stroke="${lips}" stroke-width="8"/>` : ''}
        <ellipse cx="${CX}" cy="${y + 10}" rx="16" ry="21" fill="${dark}" stroke="${line}" stroke-width="3.2"/>
        <ellipse cx="${CX}" cy="${y + 22}" rx="9" ry="6" fill="#b3444f"/>
        <path d="M ${CX - 10} ${y - 6} Q ${CX} ${y - 9} ${CX + 10} ${y - 6} L ${CX + 9} ${y - 2} Q ${CX} ${y - 4} ${CX - 9} ${y - 2} Z" fill="#fffaf2"/>`;
    }
    case 'o':
      return `${lips ? `<ellipse cx="${CX}" cy="${y + 4}" rx="10" ry="11" fill="none" stroke="${lips}" stroke-width="7"/>` : ''}
        <ellipse cx="${CX}" cy="${y + 4}" rx="9" ry="10" fill="${dark}" stroke="${line}" stroke-width="3"/>`;
    case 'grimace':
      return `<path d="M ${CX - w - 2} ${y - 6} Q ${CX} ${y - 10} ${CX + w + 2} ${y - 6} L ${CX + w - 2} ${y + 10} Q ${CX} ${y + 14} ${CX - w + 2} ${y + 10} Z" fill="#fffaf2" stroke="${line}" stroke-width="3.2" stroke-linejoin="round"/>
        <path d="M ${CX - w} ${y + 2} Q ${CX} ${y} ${CX + w} ${y + 2}" stroke="${line}" stroke-width="2" fill="none"/>
        ${[-18, -6, 6, 18].map((x) => `<path d="M ${CX + x} ${y - 7} L ${CX + x} ${y + 11}" stroke="${line}" stroke-width="1.6" opacity="0.6"/>`).join('')}`;
    case 'tight': {
      const d = `M ${CX - w + 8} ${y + 2} Q ${CX} ${y + 4} ${CX + w - 8} ${y + 2}`;
      return lipStroke(d).replace('stroke-width="10"', 'stroke-width="5"') + lineStroke(d, 5);
    }
    default: {
      const d = `M ${CX - w} ${y} Q ${CX} ${y + 5} ${CX + w} ${y}`;
      return lipStroke(d) + lineStroke(d);
    }
  }
}

function talkShape(kind: MouthKind, w: number, line: string, lips?: string): string {
  const y = 438;
  const dark = '#4a1518';
  const happy = kind === 'smile' || kind === 'grin' || kind === 'laugh' || kind === 'smirk';
  const sad = kind === 'frown' || kind === 'sad' || kind === 'grimace';
  const top = happy ? y - 6 : sad ? y + 2 : y - 1;
  const bot = happy ? y + 24 : sad ? y + 16 : y + 18;
  const d = `M ${CX - w + 2} ${top} Q ${CX} ${top - 3} ${CX + w - 2} ${top} Q ${CX} ${bot + 4} ${CX - w + 2} ${top} Z`;
  return `${lips ? `<path d="${d}" fill="none" stroke="${lips}" stroke-width="8" stroke-linejoin="round"/>` : ''}
    <path d="${d}" fill="${dark}" stroke="${line}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M ${CX - w + 8} ${top + 1} Q ${CX} ${top + 3} ${CX + w - 8} ${top + 1} L ${CX + w - 12} ${top + 6} Q ${CX} ${top + 7} ${CX - w + 12} ${top + 6} Z" fill="#fffaf2"/>
    <ellipse cx="${CX}" cy="${bot - 3}" rx="${w * 0.4}" ry="4" fill="#b3444f"/>`;
}

function ageLines(c: Ctx): string {
  const a = c.b.age ?? 0;
  if (!a) return '';
  const { line } = c;
  const op = 0.18 + a * 0.08;
  let out = `<path d="M ${CX - 40} 400 Q ${CX - 50} 424 ${CX - 42} 448 M ${CX + 40} 400 Q ${CX + 50} 424 ${CX + 42} 448" fill="none" stroke="${line}" stroke-width="2.2" opacity="${op}"/>`;
  if (a >= 2) {
    out += `<path d="M ${CX - 86} 336 L ${CX - 98} 330 M ${CX - 86} 344 L ${CX - 99} 346 M ${CX + 86} 336 L ${CX + 98} 330 M ${CX + 86} 344 L ${CX + 99} 346" stroke="${line}" stroke-width="2" opacity="${op}"/>
      <path d="M ${CX - 30} 362 Q ${CX - 52} 372 ${CX - 76} 362 M ${CX + 30} 362 Q ${CX + 52} 372 ${CX + 76} 362" fill="none" stroke="${line}" stroke-width="1.8" opacity="${op * 0.8}"/>`;
  }
  if (a >= 3) {
    out += `<path d="M ${CX - 46} 252 Q ${CX} 244 ${CX + 46} 252 M ${CX - 36} 266 Q ${CX} 260 ${CX + 36} 266" fill="none" stroke="${line}" stroke-width="2" opacity="${op * 0.8}"/>`;
  }
  return out;
}

function extrasUnder(c: Ctx): string {
  const { e, uid } = c;
  let out = '';
  if (e.blush) {
    out += `<ellipse cx="${CX - 66}" cy="402" rx="24" ry="11" fill="#ff6b6b" opacity="0.32"/><ellipse cx="${CX + 66}" cy="402" rx="24" ry="11" fill="#ff6b6b" opacity="0.32"/>
      <path d="M ${CX - 78} 398 l 6 8 M ${CX - 66} 396 l 6 8 M ${CX + 58} 396 l 6 8 M ${CX + 70} 398 l 6 8" stroke="#d94a4a" stroke-width="2" opacity="0.5"/>`;
  }
  if (e.shade) {
    out += `<linearGradient id="${uid}-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0b2e" stop-opacity="0.85"/><stop offset="0.55" stop-color="#1a0b2e" stop-opacity="0.45"/><stop offset="1" stop-color="#1a0b2e" stop-opacity="0"/></linearGradient>
      <path d="${facePath(c.b)}" fill="url(#${uid}-shade)" clip-path="url(#${uid}-face)"/>`;
  }
  if (e.tear) {
    out += `<path d="M ${CX - 62} 352 Q ${CX - 70} 380 ${CX - 64} 408 Q ${CX - 58} 412 ${CX - 56} 404 Q ${CX - 58} 380 ${CX - 56} 354 Z" fill="#a8dcff" opacity="0.85"/>
      <path d="M ${CX + 62} 352 Q ${CX + 70} 380 ${CX + 64} 408 Q ${CX + 58} 412 ${CX + 56} 404 Q ${CX + 58} 380 ${CX + 56} 354 Z" fill="#a8dcff" opacity="0.85"/>`;
  }
  return out;
}

function extrasOver(c: Ctx): string {
  const { e } = c;
  let out = '';
  if (e.sweat) out += sweatDrop(CX + 104, 262, 1) + sweatDrop(CX - 112, 300, 0.7);
  if (e.vein) {
    out += `<g transform="translate(${CX + 66} 222)" stroke="#d6283a" stroke-width="5" fill="none" stroke-linecap="round">
      <path d="M -14 -4 Q -4 -4 -4 -14"/><path d="M 4 -14 Q 4 -4 14 -4"/><path d="M 14 4 Q 4 4 4 14"/><path d="M -4 14 Q -4 4 -14 4"/></g>`;
  }
  return out;
}

function sweatDrop(x: number, y: number, s: number): string {
  return `<path d="M ${x} ${y} C ${x - 11 * s} ${y + 19 * s} ${x - 9 * s} ${y + 32 * s} ${x} ${y + 32 * s} C ${x + 9 * s} ${y + 32 * s} ${x + 11 * s} ${y + 19 * s} ${x} ${y} Z" fill="#cdeeff" stroke="#4f97c9" stroke-width="2.5"/>
    <path d="M ${x - 3 * s} ${y + 16 * s} Q ${x - 4 * s} ${y + 24 * s} ${x} ${y + 27 * s}" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
}

// ---------------------------------------------------------------------------

export function renderPortrait(b: Build, e: ExprParams, outfit?: string): string {
  const uid = `p${++uidCounter}`;
  const skin = b.skin;
  const shadow = skinShadow(skin);
  const line = b.line ?? '#2a1814';
  const c: Ctx = { uid, b, e, skin, shadow, line, outfit: outfit && b.outfits[outfit] ? outfit : b.defaultOutfit };
  const W = b.W ?? 112;
  const nw = b.neckW ?? 50;
  const face = facePath(b);
  const mw = b.mouthW ?? 26;

  const neck = `<path d="M ${CX - nw} 420 L ${CX - nw - 4} 575 Q ${CX} 600 ${CX + nw + 4} 575 L ${CX + nw} 420 Z" fill="${skin}"/>
    <path d="M ${CX - nw} 430 Q ${CX} 530 ${CX + nw} 430 L ${CX + nw + 2} 520 Q ${CX} 560 ${CX - nw - 2} 520 Z" fill="${shadow}" opacity="0.75"/>
    <path class="p-throat" d="M ${CX - 8} 520 Q ${CX} 530 ${CX + 8} 520" fill="none" stroke="${line}" stroke-width="2.4" opacity="0.45"/>`;

  const ears = [-1, 1]
    .map((s) => {
      const x = CX + s * (W + 1);
      return `<path d="M ${x} 312 C ${x + s * 26} 300 ${x + s * 30} 352 ${x + s * 18} 378 C ${x + s * 10} 392 ${x} 388 ${x - s * 4} 380 Z" fill="${skin}" stroke="${line}" stroke-width="3"/>
        <path d="M ${x + s * 4} 326 C ${x + s * 18} 322 ${x + s * 18} 352 ${x + s * 8} 366" fill="none" stroke="${shadow}" stroke-width="4" stroke-linecap="round"/>`;
    })
    .join('');

  const stubble = b.stubble
    ? `<path d="M ${CX - W + 4} 384 C ${CX - W + 14} 424 ${CX - 70} 446 ${CX - 50} 466 Q ${CX} 504 ${CX + 50} 466 C ${CX + 70} 446 ${CX + W - 14} 424 ${CX + W - 4} 384 C ${CX + 70} 430 ${CX + 44} 414 ${CX} 414 C ${CX - 44} 414 ${CX - 70} 430 ${CX - W + 4} 384 Z" fill="${b.stubble}" opacity="0.2" clip-path="url(#${uid}-face)"/>`
    : '';

  const faceShade = `<path d="M ${CX + W} 300 C ${CX + W} 352 ${CX + (b.J ?? 84) + 14} 398 ${CX + (b.J ?? 84)} 428 Q ${CX + (b.chinW ?? 38)} ${(b.chinY ?? 486) - 6} ${CX} ${b.chinY ?? 486} L ${CX} ${(b.chinY ?? 486) - 10} Q ${CX + 50} 470 ${CX + 70} 420 C ${CX + 90} 380 ${CX + W - 16} 340 ${CX + W - 10} 280 Z" fill="${shadow}" opacity="0.55"/>
    <ellipse cx="${CX}" cy="${(b.chinY ?? 486) - 22}" rx="26" ry="10" fill="${shadow}" opacity="0.25"/>
    <path d="M ${CX - W + 18} 300 C ${CX - W + 16} 230 ${CX - 50} 180 ${CX} 176" fill="none" stroke="#fff" stroke-width="10" opacity="0.08" stroke-linecap="round"/>`;

  const mouthRest = mouthShape(e.mouth, mw, line, b.lips);
  const mouthTalk = talkShape(e.mouth, mw, line, b.lips);

  const tellSweat = `<g class="p-sweat-tell">${sweatDrop(CX + 98, 250, 0.9)}</g>`;

  const body = b.outfits[c.outfit](c);

  const svg = `<svg viewBox="0 0 600 900" xmlns="http://www.w3.org/2000/svg" class="portrait-svg">
  <defs><clipPath id="${uid}-face"><path d="${face}"/></clipPath></defs>
  <g class="p-root">
    ${b.hairBack ? b.hairBack(c) : ''}
    ${neck}
    ${body}
    ${ears}
    <path d="${face}" fill="${skin}" stroke="${line}" stroke-width="3.5"/>
    <g clip-path="url(#${uid}-face)">${faceShade}</g>
    ${stubble}
    ${ageLines(c)}
    ${b.makeup ? b.makeup(c) : ''}
    <g class="p-eyes">${eye(c, -1)}${eye(c, 1)}</g>
    <g class="p-brows">${brow(c, -1)}${brow(c, 1)}</g>
    ${nose(c)}
    ${b.facial ? b.facial(c) : ''}
    <g class="p-mouth"><g class="p-mouth-rest">${mouthRest}</g><g class="p-mouth-talk">${mouthTalk}</g></g>
    ${b.faceExtras ? b.faceExtras(c) : ''}
    ${extrasUnder(c)}
    ${b.hairFront(c)}
    ${extrasOver(c)}
    ${tellSweat}
    ${b.over ? b.over(c) : ''}
  </g>
</svg>`;
  return svg;
}

// Shared clothing pieces ------------------------------------------------------

export const SHOULDERS =
  'M 248 548 C 190 556 112 568 72 606 C 40 638 24 720 16 900 L 584 900 C 576 720 560 638 528 606 C 488 568 410 556 352 548 Z';

export interface SuitOpts {
  jacket: string;
  shirt: string;
  tie?: string;
  tieStripe?: string;
  lapel?: string;
  pocket?: string;
  vest?: string;
  open?: boolean;
}

export function suit(c: Ctx, o: SuitOpts): string {
  const { uid, line } = c;
  const lapel = o.lapel ?? shade(o.jacket, -0.12);
  const grad = `${uid}-jacket`;
  const tie = o.tie
    ? `<path d="M 287 586 L 313 586 L 309 612 L 291 612 Z" fill="${o.tie}" stroke="${line}" stroke-width="2.5"/>
       <path d="M 291 612 L 309 612 L 324 770 L 300 810 L 276 770 Z" fill="${o.tie}" stroke="${line}" stroke-width="2.5"/>
       ${o.tieStripe ? `<clipPath id="${uid}-tie"><path d="M 291 612 L 309 612 L 324 770 L 300 810 L 276 770 Z"/></clipPath><g clip-path="url(#${uid}-tie)" stroke="${o.tieStripe}" stroke-width="7" opacity="0.9">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M 260 ${620 + i * 26} L 340 ${590 + i * 26}"/>`).join('')}</g>` : ''}
       <path d="M 300 612 L 300 800" stroke="#000" stroke-width="2" opacity="0.15"/>`
    : `<path d="M 268 566 L 300 640 L 332 566" fill="none" stroke="${shade(o.shirt, -0.25)}" stroke-width="3"/>`;
  const vest = o.vest
    ? `<path d="M 262 600 L 300 700 L 338 600 L 360 900 L 240 900 Z" fill="${o.vest}" stroke="${line}" stroke-width="2.5"/>
       <circle cx="300" cy="740" r="5" fill="${shade(o.vest, 0.3)}"/><circle cx="300" cy="790" r="5" fill="${shade(o.vest, 0.3)}"/><circle cx="300" cy="840" r="5" fill="${shade(o.vest, 0.3)}"/>`
    : '';
  return `<linearGradient id="${grad}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(o.jacket, 0.08)}"/><stop offset="0.55" stop-color="${o.jacket}"/><stop offset="1" stop-color="${shade(o.jacket, -0.35)}"/></linearGradient>
  <path d="${SHOULDERS}" fill="url(#${grad})" stroke="${line}" stroke-width="3.5"/>
  <path d="M 252 546 L 300 720 L 348 546 Z" fill="${o.shirt}"/>
  ${vest}
  ${tie}
  <path d="${sym('M 252 540 L 300 592 L 270 616 L 238 562 Z')}" fill="${o.shirt}" stroke="${line}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="${sym('M 246 550 L 300 742 L 288 770 L 206 646 L 230 622 L 192 604 L 236 556 Z')}" fill="${lapel}" stroke="${line}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M 206 646 L 288 770 M 394 646 L 312 770" stroke="#fff" stroke-width="2" opacity="0.12"/>
  ${o.pocket ? `<path d="M 386 686 L 446 680 L 450 690 L 388 696 Z" fill="${shade(o.jacket, -0.25)}"/><path d="M 394 688 L 404 664 L 414 684 L 424 662 L 436 684 Z" fill="${o.pocket}" stroke="${line}" stroke-width="2"/>` : ''}
  <circle cx="300" cy="830" r="6" fill="${shade(o.jacket, -0.4)}"/>
  <path d="M 120 640 C 140 700 150 800 150 900" fill="none" stroke="#000" stroke-width="3" opacity="0.18"/>
  <path d="M 480 640 C 460 700 450 800 450 900" fill="none" stroke="#000" stroke-width="3" opacity="0.18"/>`;
}
