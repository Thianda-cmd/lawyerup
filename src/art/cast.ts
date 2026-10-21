/**
 * The cast: hair, outfits and expression sheets for every character.
 */
import type { CharId } from '../engine/types';
import { shade } from './color';
import { type Build, type Ctx, type ExprParams, CX, SHOULDERS, mirror, renderPortrait, suit, sym } from './portrait';

// ---------------------------------------------------------------------------
// Expression sheet shared by everybody; characters can override entries.

const COMMON: Record<string, ExprParams> = {
  neutral: { brow: 'neutral', eyes: 'open', mouth: 'neutral' },
  smile: { brow: 'raised', eyes: 'open', mouth: 'smile' },
  happy: { brow: 'raised', eyes: 'happy', mouth: 'grin' },
  grin: { brow: 'raised', eyes: 'open', mouth: 'grin' },
  laugh: { brow: 'raised', eyes: 'happy', mouth: 'laugh' },
  smirk: { brow: 'skeptic', eyes: 'half', mouth: 'smirk' },
  smug: { brow: 'skeptic', eyes: 'half', mouth: 'smile' },
  confident: { brow: 'raised', eyes: 'half', mouth: 'smirk' },
  think: { brow: 'furrow', eyes: 'side', mouth: 'wry' },
  serious: { brow: 'furrow', eyes: 'open', mouth: 'tight' },
  annoyed: { brow: 'flat', eyes: 'half', mouth: 'frown' },
  cold: { brow: 'flat', eyes: 'half', mouth: 'neutral' },
  mad: { brow: 'angry', eyes: 'open', mouth: 'frown' },
  angry: { brow: 'angry', eyes: 'narrow', mouth: 'grimace', vein: true },
  sad: { brow: 'sad', eyes: 'down', mouth: 'sad' },
  worried: { brow: 'sad', eyes: 'open', mouth: 'tight', sweat: true },
  nervous: { brow: 'sad', eyes: 'side', mouth: 'wry', sweat: true },
  sweat: { brow: 'sad', eyes: 'open', mouth: 'grimace', sweat: true },
  shock: { brow: 'up', eyes: 'wide', mouth: 'open', pinpoint: true },
  surprised: { brow: 'up', eyes: 'wide', mouth: 'o' },
  cry: { brow: 'sad', eyes: 'sadclosed', mouth: 'frown', tear: true },
  despair: { brow: 'sad', eyes: 'down', mouth: 'open', shade: true },
  breakdown: { brow: 'angry', eyes: 'wide', mouth: 'grimace', shade: true, pinpoint: true, sweat: true },
  blush: { brow: 'sad', eyes: 'side', mouth: 'wry', blush: true },
  closed: { brow: 'neutral', eyes: 'closed', mouth: 'neutral' },
  silhouette: { brow: 'neutral', eyes: 'open', mouth: 'neutral', silhouette: true },
};

// ---------------------------------------------------------------------------
// Shared bits

function earrings(c: Ctx, color: string, kind: 'hoop' | 'drop' | 'pearl'): string {
  const W = c.b.W ?? 112;
  return [-1, 1]
    .map((s) => {
      const x = CX + s * (W + 12);
      if (kind === 'hoop') return `<circle cx="${x}" cy="402" r="10" fill="none" stroke="${color}" stroke-width="3.5"/>`;
      if (kind === 'pearl')
        return `<circle cx="${x}" cy="388" r="7" fill="#f6f2ea" stroke="#b9b2a6" stroke-width="1.5"/><circle cx="${x - 2}" cy="386" r="2.5" fill="#fff"/>`;
      return `<circle cx="${x}" cy="388" r="4" fill="${color}"/><path d="M ${x} 392 C ${x - 9} 410 ${x - 7} 424 ${x} 424 C ${x + 7} 424 ${x + 9} 410 ${x} 392 Z" fill="${color}" stroke="${shade(color, -0.4)}" stroke-width="1.5"/>`;
    })
    .join('');
}

function glints(points: [number, number, number][], color = '#fff6c8'): string {
  return points
    .map(([x, y, r]) => `<path d="M ${x} ${y - r} L ${x + r * 0.25} ${y - r * 0.25} L ${x + r} ${y} L ${x + r * 0.25} ${y + r * 0.25} L ${x} ${y + r} L ${x - r * 0.25} ${y + r * 0.25} L ${x - r} ${y} L ${x - r * 0.25} ${y - r * 0.25} Z" fill="${color}" class="sparkle"/>`)
    .join('');
}

// ---------------------------------------------------------------------------
// EZRA VANE — ex-stage mentalist, current strip-mall attorney.

const ezra: Build = {
  skin: '#e7b892',
  W: 110,
  J: 82,
  chinY: 490,
  chinW: 42,
  eyeColor: '#6b4a2b',
  eyeTilt: 1,
  browColor: '#231915',
  browThick: 11,
  nose: 'straight',
  mouthW: 27,
  age: 1,
  stubble: '#2b201c',
  hairFront: (c) => {
    const hair = '#231a17';
    const hi = '#4f3b31';
    return `<path d="M 186 322 C 176 240 182 150 252 116 C 300 92 374 98 414 140 C 438 168 434 252 416 322 L 408 322 C 406 278 396 246 372 232 C 346 220 320 222 302 234 C 286 220 258 216 236 226 C 212 238 196 270 194 322 Z" fill="${hair}" stroke="${c.line}" stroke-width="3"/>
      <path d="${sym('M 189 300 L 199 300 L 201 356 L 191 352 Z')}" fill="${hair}"/>
      <path d="M 226 224 C 238 170 290 128 362 124 M 262 226 C 282 178 334 148 404 158 M 322 230 C 352 202 392 192 418 214 M 240 140 C 270 116 320 106 370 116" fill="none" stroke="${hi}" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
      <path d="M 212 238 C 220 180 258 134 314 116 L 326 126 C 274 148 242 188 230 238 Z" fill="#b9b2ac"/>
      <path d="M 220 220 C 232 182 262 150 304 130" fill="none" stroke="#e0dad4" stroke-width="3" opacity="0.8"/>`;
  },
  outfits: {
    suit: (c) =>
      suit(c, { jacket: '#2c3a66', shirt: '#f3ede2', tie: '#b3303d', tieStripe: '#efbe57', vest: '#c4973c', pocket: '#efbe57' }),
  },
  defaultOutfit: 'suit',
};

// ---------------------------------------------------------------------------
// ROSA QUINTERO — paralegal, investigator, conscience.

const rosaHair = '#2a1712';
const rosa: Build = {
  neckW: 40,
  skin: '#c88b62',
  W: 106,
  J: 80,
  chinY: 478,
  chinW: 34,
  eyeColor: '#5b3a24',
  eyeSize: 1.05,
  lash: true,
  browColor: '#24130e',
  browThick: 9,
  nose: 'button',
  mouthW: 24,
  lips: '#a24f55',
  hairBack: (c) => {
    const circles: [number, number, number][] = [];
    for (let a = -175; a <= -5; a += 17) {
      const r = (a * Math.PI) / 180;
      circles.push([300 + Math.cos(r) * 122, 292 + Math.sin(r) * 128, 34]);
    }
    circles.push([176, 344, 30], [424, 344, 30], [182, 392, 26], [418, 392, 26], [192, 432, 20], [408, 432, 20]);
    const bun: [number, number, number][] = [[300, 98, 48], [258, 112, 32], [342, 112, 32], [280, 72, 28], [322, 72, 28]];
    const all = [...circles, ...bun];
    return `<g fill="${rosaHair}" stroke="${c.line}" stroke-width="3">${all.map(([x, y, r]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>`).join('')}</g>
      <g fill="${rosaHair}">${all.map(([x, y, r]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r - 2}"/>`).join('')}</g>
      <g fill="none" stroke="#5a3526" stroke-width="4" stroke-linecap="round" opacity="0.8">${all.map(([x, y, r]) => `<path d="M ${(x - r * 0.5).toFixed(1)} ${(y - r * 0.3).toFixed(1)} Q ${x.toFixed(1)} ${(y - r * 0.75).toFixed(1)} ${(x + r * 0.45).toFixed(1)} ${(y - r * 0.35).toFixed(1)}"/>`).join('')}</g>
      <g transform="rotate(-28 300 96)"><rect x="226" y="90" width="150" height="12" rx="2" fill="#f2c230" stroke="${c.line}" stroke-width="2"/><path d="M 376 90 L 394 96 L 376 102 Z" fill="#ead2ad" stroke="${c.line}" stroke-width="2"/><rect x="216" y="90" width="12" height="12" fill="#e98fa0" stroke="${c.line}" stroke-width="2"/></g>`;
  },
  hairFront: (c) =>
    `<path d="M 190 306 C 180 210 220 148 300 144 C 380 148 420 210 410 306 C 404 274 396 252 384 246 Q 376 266 360 250 Q 350 230 334 242 Q 318 258 304 240 Q 290 222 272 240 Q 256 256 244 240 Q 230 228 218 248 Q 204 266 196 306 Z" fill="${rosaHair}" stroke="${c.line}" stroke-width="3"/>
     <path d="M 232 196 Q 260 170 300 168 M 320 170 Q 356 176 380 204" fill="none" stroke="#5a3526" stroke-width="5" stroke-linecap="round"/>
     <path d="${sym('M 194 300 C 182 330 202 350 188 384 C 180 404 196 418 190 432')}" fill="none" stroke="${rosaHair}" stroke-width="10" stroke-linecap="round"/>`,
  faceExtras: (c) => earrings(c, '#e0b040', 'hoop'),
  over: (c) => {
    const f = '#7a3b2a';
    return `<g fill="#cfe8ff" fill-opacity="0.1" stroke="${f}" stroke-width="5">
      <circle cx="248" cy="340" r="34"/><circle cx="352" cy="340" r="34"/></g>
      <path d="M 282 336 Q 300 326 318 336" fill="none" stroke="${f}" stroke-width="5"/>
      <path d="M 214 334 L 196 326 M 386 334 L 404 326" stroke="${f}" stroke-width="5" stroke-linecap="round"/>
      <path d="M 228 322 L 244 312 M 332 322 L 348 312" stroke="#fff" stroke-width="3" opacity="0.6" stroke-linecap="round"/>
      ${c.e.eyes === 'side' ? '' : ''}`;
  },
  outfits: {
    casual: (c) => {
      const denim = '#3f5f8c';
      const g = `${c.uid}-denim`;
      return `<linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="${shade(denim, 0.1)}"/><stop offset="1" stop-color="${shade(denim, -0.35)}"/></linearGradient>
        <path d="${SHOULDERS}" fill="url(#${g})" stroke="${c.line}" stroke-width="3.5"/>
        <path d="M 238 552 Q 300 616 362 552 L 376 900 L 224 900 Z" fill="#e4a53c" stroke="${c.line}" stroke-width="2.5"/>
        <path d="M 250 556 Q 300 604 350 556" fill="none" stroke="#b9802a" stroke-width="4"/>
        <path d="${sym('M 244 548 L 190 590 L 210 656 L 256 612 Z')}" fill="${shade(denim, -0.08)}" stroke="${c.line}" stroke-width="3" stroke-linejoin="round"/>
        <path d="${sym('M 256 612 L 232 900')}" stroke="${c.line}" stroke-width="3"/>
        <path d="${sym('M 140 690 L 214 684 L 216 728 L 142 734 Z')}" fill="${shade(denim, -0.1)}" stroke="#d9c79a" stroke-width="2" stroke-dasharray="5 4"/>
        <path d="${sym('M 120 640 C 150 640 190 650 210 660')}" fill="none" stroke="#d9c79a" stroke-width="2" stroke-dasharray="5 4"/>
        <rect x="392" y="752" width="64" height="86" rx="6" fill="#f5f2ea" stroke="${c.line}" stroke-width="2" transform="rotate(6 424 795)"/>
        <rect x="400" y="770" width="48" height="10" fill="#c43b4c" transform="rotate(6 424 795)"/>
        <path d="M 372 610 L 420 754" stroke="#c43b4c" stroke-width="4"/>`;
    },
  },
  defaultOutfit: 'casual',
};

// ---------------------------------------------------------------------------
// CORVIN MALLORY — "The Amazing Corvin", the client.

const corvinHair = '#cdd2da';
const corvin: Build = {
  skin: '#ebc5a7',
  W: 112,
  J: 78,
  chinY: 498,
  chinW: 30,
  eyeColor: '#62789a',
  eyeSize: 0.95,
  eyeTilt: -1,
  browColor: '#474951',
  browThick: 11,
  browY: 296,
  nose: 'hook',
  mouthW: 25,
  age: 2,
  hairBack: (c) =>
    `<path d="M 180 262 C 156 350 164 470 206 548 L 394 548 C 436 470 444 350 420 262 Z" fill="#959cab" stroke="${c.line}" stroke-width="3"/>
     <path d="M 196 330 C 186 400 196 470 222 530 M 404 330 C 414 400 404 470 378 530" fill="none" stroke="#c3c8d1" stroke-width="4" opacity="0.7"/>`,
  hairFront: (c) =>
    `<path d="M 184 320 C 176 220 214 126 300 118 C 386 126 424 220 416 320 L 406 320 C 404 268 388 236 356 222 C 336 214 314 214 300 236 C 286 214 264 214 244 222 C 212 236 196 268 194 320 Z" fill="${corvinHair}" stroke="${c.line}" stroke-width="3"/>
     <path d="M 300 234 C 300 190 278 150 236 134 M 300 234 C 310 180 342 150 386 152 M 256 224 C 238 192 218 176 198 206 M 344 224 C 364 194 386 182 404 210" fill="none" stroke="#f3f5f9" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
     <path d="M 276 226 C 270 200 262 180 246 168 M 324 226 C 334 196 350 178 372 170" fill="none" stroke="#8d94a2" stroke-width="3" stroke-linecap="round" opacity="0.8"/>`,
  facial: (c) =>
    `<path d="M 262 421 Q 280 409 300 415 Q 320 409 338 421 Q 352 427 360 414 Q 354 434 336 430 Q 318 422 300 426 Q 282 422 264 430 Q 246 434 240 414 Q 248 427 262 421 Z" fill="#5a5d66" stroke="${c.line}" stroke-width="1.5"/>
     <path d="M 282 460 Q 300 468 318 460 Q 316 494 300 524 Q 284 494 282 460 Z" fill="#62656e" stroke="${c.line}" stroke-width="2"/>
     <path d="M 294 470 Q 300 494 300 514" stroke="#9aa0aa" stroke-width="2" fill="none"/>`,
  outfits: {
    stage: (c) => {
      const g = `${c.uid}-lining`;
      return `<linearGradient id="${g}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#c4283c"/><stop offset="1" stop-color="#5e0f1c"/></linearGradient>
        <path d="${sym('M 236 556 C 170 480 138 380 160 270 C 196 352 232 420 268 476 Z')}" fill="url(#${g})" stroke="${c.line}" stroke-width="3"/>
        <path d="${sym('M 236 556 C 170 480 138 380 160 270 C 150 360 160 460 200 560 Z')}" fill="#151119" stroke="${c.line}" stroke-width="2.5"/>
        <path d="${SHOULDERS}" fill="#17131c" stroke="${c.line}" stroke-width="3.5"/>
        <path d="M 250 548 L 300 900 L 350 548 Z" fill="#f1ede6"/>
        <path d="M 262 600 L 300 700 L 338 600 L 352 900 L 248 900 Z" fill="#1e1a24" stroke="${c.line}" stroke-width="2"/>
        <path d="M 278 572 L 300 584 L 322 572 L 322 598 L 300 586 L 278 598 Z" fill="#17131c" stroke="${c.line}" stroke-width="2"/>
        <path d="${sym('M 250 548 L 210 620 L 196 900 L 172 900 L 186 610 Z')}" fill="url(#${g})" stroke="${c.line}" stroke-width="2"/>
        <path d="M 196 640 Q 300 700 404 640" fill="none" stroke="#e1b84f" stroke-width="4"/>
        <circle cx="196" cy="640" r="12" fill="#e1b84f" stroke="${c.line}" stroke-width="2"/><circle cx="404" cy="640" r="12" fill="#e1b84f" stroke="${c.line}" stroke-width="2"/>`;
    },
    jail: (c) =>
      `<path d="${SHOULDERS}" fill="#e2672e" stroke="${c.line}" stroke-width="3.5"/>
       <path d="M 252 548 L 300 640 L 348 548 Z" fill="#f2efe8"/>
       <path d="${sym('M 248 546 L 300 650 L 286 664 L 220 580 Z')}" fill="#cf5a24" stroke="${c.line}" stroke-width="2.5"/>
       <path d="M 300 650 L 300 900" stroke="${c.line}" stroke-width="2.5"/>
       <rect x="350" y="700" width="96" height="70" fill="#cf5a24" stroke="${c.line}" stroke-width="2"/>
       <text x="398" y="742" font-family="Inter, sans-serif" font-weight="700" font-size="17" text-anchor="middle" fill="#3a1608">SQ CO.</text>
       <path d="M 120 640 C 140 700 150 800 150 900 M 480 640 C 460 700 450 800 450 900" fill="none" stroke="#000" stroke-width="3" opacity="0.18"/>`,
    suit: (c) => suit(c, { jacket: '#221f29', shirt: '#ece7ee', tie: '#7a1526', pocket: '#c4283c' }),
  },
  defaultOutfit: 'stage',
};

// ---------------------------------------------------------------------------
// IRIS MALLORY — stage assistant, company manager, wife.

const irisHair = '#15121b';
const iris: Build = {
  neckW: 40,
  skin: '#f2d3bf',
  W: 106,
  J: 78,
  chinY: 474,
  chinW: 30,
  eyeColor: '#3d8060',
  eyeSize: 1.06,
  eyeTilt: 4,
  lash: true,
  browColor: '#17121a',
  browThick: 7,
  browY: 296,
  nose: 'small',
  mouthW: 22,
  lips: '#b51f33',
  hairBack: (c) =>
    `<path d="M 164 300 C 156 168 220 102 300 100 C 380 102 444 168 436 300 L 442 458 Q 420 474 394 466 L 206 466 Q 180 474 158 458 Z" fill="${irisHair}" stroke="${c.line}" stroke-width="3"/>`,
  hairFront: (c) =>
    `<path d="M 176 300 C 174 188 230 116 300 114 C 370 116 426 188 424 300 L 432 460 L 390 474 C 396 420 398 340 404 290 L 404 272 L 196 272 L 196 290 C 202 340 204 420 210 474 L 168 460 Z" fill="${irisHair}" stroke="${c.line}" stroke-width="3"/>
     <path d="M 214 176 Q 300 128 386 176" fill="none" stroke="#3d4868" stroke-width="16" stroke-linecap="round" opacity="0.75"/>
     <path d="M 234 270 L 236 210 M 262 270 L 262 196 M 290 270 L 290 190 M 318 270 L 318 190 M 346 270 L 344 198 M 372 270 L 370 212" stroke="#2c3248" stroke-width="3" opacity="0.8"/>
     <path d="M 412 320 L 420 440 M 188 320 L 180 440" stroke="#2c3248" stroke-width="3" opacity="0.8"/>`,
  makeup: () =>
    `<ellipse cx="246" cy="326" rx="32" ry="13" fill="#7a3f86" opacity="0.28"/><ellipse cx="354" cy="326" rx="32" ry="13" fill="#7a3f86" opacity="0.28"/>`,
  faceExtras: (c) => `<circle cx="338" cy="414" r="3.2" fill="#3a1f1f"/>${earrings(c, '#e2b24a', 'drop')}`,
  outfits: {
    stage: (c) => {
      const p = `${c.uid}-seq`;
      return `<pattern id="${p}" width="16" height="14" patternUnits="userSpaceOnUse"><rect width="16" height="14" fill="#b8892b"/><circle cx="4" cy="4" r="4" fill="#f3cf6a"/><circle cx="12" cy="11" r="4" fill="#e0b24a"/><circle cx="3" cy="3" r="1.4" fill="#fff8d6"/></pattern>
        <path d="${SHOULDERS}" fill="${c.skin}" stroke="${c.line}" stroke-width="3.5"/>
        <path d="M 120 640 C 160 610 220 600 270 612 M 480 640 C 440 610 380 600 330 612" fill="none" stroke="${c.shadow}" stroke-width="5" opacity="0.6"/>
        <path d="M 200 660 Q 300 600 400 660 L 430 900 L 170 900 Z" fill="url(#${p})" stroke="${c.line}" stroke-width="3"/>
        <path d="M 256 560 L 280 640 M 344 560 L 320 640" stroke="#e8c25a" stroke-width="7" stroke-linecap="round"/>
        ${glints([[160, 640, 9], [450, 660, 7], [248, 700, 10], [372, 760, 8], [310, 650, 6], [220, 820, 9], [400, 840, 7]])}`;
    },
    mourning: (c) =>
      `<path d="${SHOULDERS}" fill="#151119" stroke="${c.line}" stroke-width="3.5"/>
       <path d="M 236 552 Q 300 646 364 552 Z" fill="${c.skin}"/>
       <path d="M 236 552 Q 300 646 364 552" fill="none" stroke="${c.line}" stroke-width="3"/>
       <path d="M 252 590 Q 270 606 284 610 M 348 590 Q 330 606 316 610" stroke="${c.shadow}" stroke-width="3" fill="none" opacity="0.7"/>
       <path d="${sym('M 72 606 C 40 638 24 720 16 900 L 120 900 C 126 760 130 680 150 630 Z')}" fill="#2a2430" opacity="0.6"/>
       ${glints([[274, 600, 5], [262, 588, 3.5], [330, 604, 3]], '#f6d878')}`,
  },
  defaultOutfit: 'mourning',
};

// ---------------------------------------------------------------------------
// BENNY KOWALSKI — stagehand.

const benny: Build = {
  skin: '#e6ac8a',
  W: 114,
  J: 92,
  chinY: 482,
  chinW: 46,
  eyeColor: '#6b5a3f',
  eyeSize: 0.9,
  browColor: '#4b3420',
  browThick: 12,
  nose: 'broad',
  mouthW: 27,
  age: 1,
  stubble: '#3d2f2a',
  makeup: (c) => `<path d="M 222 360 Q 248 372 274 360 M 326 360 Q 352 372 378 360" fill="none" stroke="${c.shadow}" stroke-width="3" opacity="0.7"/>`,
  hairFront: (c) => {
    const beanie = '#4b5f3a';
    return `<path d="${sym('M 188 254 L 174 300 L 190 292 L 184 326 L 200 300 L 202 262 Z')}" fill="#6b4a2e" stroke="${c.line}" stroke-width="2"/>
      <path d="M 180 270 C 176 160 230 100 300 98 C 370 100 424 160 420 270 Z" fill="${beanie}" stroke="${c.line}" stroke-width="3"/>
      <path d="M 220 150 Q 300 110 380 150" fill="none" stroke="#6a8052" stroke-width="10" stroke-linecap="round" opacity="0.7"/>
      <path d="M 172 236 Q 300 212 428 236 L 430 282 Q 300 258 170 282 Z" fill="${shade(beanie, -0.18)}" stroke="${c.line}" stroke-width="3"/>
      <g stroke="#2a361f" stroke-width="2.5" opacity="0.6">${Array.from({ length: 21 }, (_, i) => {
        const x = 184 + i * 11.6;
        return `<path d="M ${x} ${236 - Math.sin((i / 20) * Math.PI) * 22} L ${x} ${280 - Math.sin((i / 20) * Math.PI) * 22}"/>`;
      }).join('')}</g>`;
  },
  outfits: {
    work: (c) => {
      const p = `${c.uid}-plaid`;
      return `<pattern id="${p}" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(4)"><rect width="64" height="64" fill="#a3302d"/><rect y="22" width="64" height="16" fill="#2a1414" opacity="0.55"/><rect x="22" width="16" height="64" fill="#2a1414" opacity="0.55"/><rect y="50" width="64" height="3" fill="#e8c27a" opacity="0.5"/><rect x="50" width="3" height="64" fill="#e8c27a" opacity="0.5"/></pattern>
        <path d="${SHOULDERS}" fill="url(#${p})" stroke="${c.line}" stroke-width="3.5"/>
        <path d="M 244 548 Q 300 620 356 548 L 350 900 L 250 900 Z" fill="#8c8f94" stroke="${c.line}" stroke-width="2.5"/>
        <path d="M 254 554 Q 300 606 346 554" fill="none" stroke="#6e7176" stroke-width="5"/>
        <path d="${sym('M 244 546 L 202 586 L 232 650 L 258 610 Z')}" fill="url(#${p})" stroke="${c.line}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M 120 640 C 140 700 150 800 150 900 M 480 640 C 460 700 450 800 450 900" fill="none" stroke="#000" stroke-width="3" opacity="0.25"/>
        <path d="M 236 586 Q 300 560 364 586" fill="none" stroke="#1d1d22" stroke-width="9"/>
        <ellipse cx="226" cy="600" rx="30" ry="36" fill="#1d1d22" stroke="${c.line}" stroke-width="2.5"/><ellipse cx="226" cy="600" rx="18" ry="22" fill="#3a3a44"/>
        <ellipse cx="374" cy="600" rx="30" ry="36" fill="#1d1d22" stroke="${c.line}" stroke-width="2.5"/><ellipse cx="374" cy="600" rx="18" ry="22" fill="#3a3a44"/>
        <path d="M 386 628 Q 380 680 340 700" fill="none" stroke="#1d1d22" stroke-width="6" stroke-linecap="round"/><circle cx="338" cy="701" r="8" fill="#1d1d22"/>`;
    },
  },
  defaultOutfit: 'work',
};

// ---------------------------------------------------------------------------
// DET. LYLE BRANDT — homicide, 28 years on the job.

const brandt: Build = {
  skin: '#d39e7a',
  W: 118,
  J: 96,
  chinY: 486,
  chinW: 50,
  eyeColor: '#566a58',
  eyeSize: 0.86,
  browColor: '#6c6863',
  browThick: 14,
  browY: 302,
  nose: 'broad',
  mouthW: 27,
  age: 3,
  stubble: '#6b5f58',
  makeup: (c) => `<path d="M 218 362 Q 246 376 274 362 M 326 362 Q 354 376 382 362" fill="none" stroke="${c.shadow}" stroke-width="4" opacity="0.75"/>`,
  hairFront: (c) =>
    `<path d="M 184 306 C 176 200 214 136 300 134 C 386 136 424 200 416 306 L 408 306 C 408 264 400 240 380 230 C 360 216 340 230 300 226 C 260 230 240 216 220 230 C 200 240 192 264 192 306 Z" fill="#8f8c89" stroke="${c.line}" stroke-width="3"/>
     <g stroke="#b9b6b2" stroke-width="2.5" opacity="0.8">${Array.from({ length: 34 }, (_, i) => {
       const x = 206 + (i % 17) * 11.5;
       const y = 160 + Math.floor(i / 17) * 30 + (i % 3) * 4;
       return `<path d="M ${x} ${y} l 3 -8"/>`;
     }).join('')}</g>`,
  facial: (c) =>
    `<path d="M 252 426 Q 266 402 300 408 Q 334 402 348 426 Q 352 440 336 434 Q 318 426 300 428 Q 282 426 264 434 Q 248 440 252 426 Z" fill="#8a8580" stroke="${c.line}" stroke-width="2"/>
     <path d="M 270 416 L 268 426 M 284 412 L 283 424 M 316 412 L 317 424 M 330 416 L 332 426" stroke="#5e5a56" stroke-width="2"/>`,
  outfits: {
    trench: (c) => {
      const coat = '#b49a6c';
      return `<path d="${SHOULDERS}" fill="${coat}" stroke="${c.line}" stroke-width="3.5"/>
        <path d="M 252 546 L 300 760 L 348 546 Z" fill="#dfe5ec"/>
        <path d="M 287 610 L 313 610 L 309 636 L 291 636 Z" fill="#6c2a2a" stroke="${c.line}" stroke-width="2.5"/>
        <path d="M 291 636 L 309 636 L 322 780 L 300 812 L 278 780 Z" fill="#6c2a2a" stroke="${c.line}" stroke-width="2.5"/>
        <path d="${sym('M 254 542 L 300 596 L 274 618 L 240 566 Z')}" fill="#dfe5ec" stroke="${c.line}" stroke-width="2.5"/>
        <path d="${sym('M 244 548 L 300 770 L 282 800 L 178 652 L 214 622 L 156 592 L 210 548 Z')}" fill="${shade(coat, -0.1)}" stroke="${c.line}" stroke-width="3" stroke-linejoin="round"/>
        <path d="${sym('M 112 612 L 196 588 L 202 606 L 120 632 Z')}" fill="${shade(coat, -0.15)}" stroke="${c.line}" stroke-width="2.5"/>
        <circle cx="198" cy="597" r="5" fill="#4a3a28"/><circle cx="402" cy="597" r="5" fill="#4a3a28"/>
        <path d="M 120 650 C 140 710 150 800 150 900 M 480 650 C 460 710 450 800 450 900" fill="none" stroke="#000" stroke-width="3" opacity="0.2"/>`;
    },
  },
  defaultOutfit: 'trench',
};

// ---------------------------------------------------------------------------
// ADA HELENA STRAND — the prosecutor. 41 wins, 0 losses.

const strandHair = '#e4d9bf';
const strand: Build = {
  neckW: 40,
  skin: '#f2d6c5',
  W: 106,
  J: 76,
  chinY: 482,
  chinW: 28,
  eyeColor: '#7b8996',
  eyeTilt: 3,
  lash: true,
  browColor: '#7d6c4e',
  browThick: 7,
  browY: 294,
  nose: 'small',
  mouthW: 23,
  lips: '#8b2733',
  age: 1,
  hairBack: (c) =>
    `<path d="M 180 300 C 172 188 228 126 300 124 C 372 126 428 188 420 300 Z" fill="#b9aa8a" stroke="${c.line}" stroke-width="3"/>
     <circle cx="404" cy="168" r="50" fill="${strandHair}" stroke="${c.line}" stroke-width="3"/>
     <path d="M 372 150 C 392 128 432 140 430 172 C 428 196 398 204 386 186 C 378 172 392 160 404 168" fill="none" stroke="#b9aa8a" stroke-width="4"/>`,
  hairFront: (c) =>
    `<path d="M 186 312 C 180 208 226 130 300 126 C 374 130 420 208 414 312 L 406 312 C 404 262 388 230 360 220 C 330 210 304 216 292 226 C 266 212 236 222 214 240 C 200 256 194 282 194 312 Z" fill="${strandHair}" stroke="${c.line}" stroke-width="3"/>
     <path d="M 214 240 C 236 196 300 160 390 160 M 252 222 C 280 186 330 168 396 176 M 300 220 C 330 196 370 190 410 200 M 220 200 C 250 160 300 140 360 140" fill="none" stroke="#b5a582" stroke-width="3" opacity="0.9"/>
     <path d="M 404 252 C 424 296 418 344 404 376" fill="none" stroke="${strandHair}" stroke-width="5" stroke-linecap="round"/>`,
  faceExtras: (c) => earrings(c, '#fff', 'pearl'),
  outfits: {
    suit: (c) =>
      suit(c, { jacket: '#efece6', shirt: '#1d1b22', lapel: '#d9d4ca' }) +
      `<circle cx="420" cy="660" r="11" fill="#c9ccd4" stroke="${c.line}" stroke-width="2"/><path d="M 412 660 L 428 660 M 420 652 L 420 668" stroke="#7d828d" stroke-width="2"/>`,
  },
  defaultOutfit: 'suit',
};

// ---------------------------------------------------------------------------
// JUDGE ABRAHAM OKAFOR

const judge: Build = {
  skin: '#7b4b34',
  line: '#24130d',
  W: 116,
  J: 94,
  chinY: 486,
  chinW: 46,
  eyeColor: '#3a281d',
  eyeSize: 0.9,
  browColor: '#e9e3d8',
  browThick: 13,
  nose: 'broad',
  mouthW: 26,
  age: 3,
  hairFront: () =>
    `<ellipse cx="270" cy="196" rx="46" ry="20" fill="#fff" opacity="0.18" transform="rotate(-14 270 196)"/>
     <ellipse cx="262" cy="190" rx="18" ry="7" fill="#fff" opacity="0.25" transform="rotate(-14 262 190)"/>
     <path d="${sym('M 186 312 C 182 280 188 256 200 242 L 210 250 C 202 270 200 290 202 314 Z')}" fill="#e6e0d5"/>`,
  facial: (c) =>
    `<path d="M 194 360 C 198 422 230 474 262 494 Q 300 514 338 494 C 370 474 402 422 406 360 C 398 402 380 424 360 436 Q 330 454 300 456 Q 270 454 240 436 C 220 424 202 402 194 360 Z" fill="#ebe6dd" stroke="${c.line}" stroke-width="2"/>
     <path d="M 256 422 Q 278 410 300 415 Q 322 410 344 422 Q 342 436 300 431 Q 258 436 256 422 Z" fill="#ebe6dd" stroke="${c.line}" stroke-width="2"/>
     <path d="M 232 450 Q 236 470 250 484 M 368 450 Q 364 470 350 484 M 300 470 L 300 500" stroke="#bdb6aa" stroke-width="2" fill="none"/>`,
  over: (c) =>
    `<g fill="#fff" fill-opacity="0.1" stroke="#c9a24a" stroke-width="3.5">
      <path d="M 212 352 L 282 352 Q 280 384 247 384 Q 214 384 212 352 Z"/><path d="M 318 352 L 388 352 Q 386 384 353 384 Q 320 384 318 352 Z"/></g>
     <path d="M 282 354 Q 300 346 318 354" fill="none" stroke="#c9a24a" stroke-width="3.5"/>
     <path d="M 212 354 L 192 344 M 388 354 L 408 344" stroke="#c9a24a" stroke-width="3.5"/>
     ${c.e.eyes === 'closed' ? '' : ''}`,
  outfits: {
    robe: (c) =>
      `<path d="${SHOULDERS}" fill="#17151d" stroke="${c.line}" stroke-width="3.5"/>
       <path d="M 260 548 L 300 660 L 340 548 Z" fill="#f2eee6"/>
       <path d="M 290 596 L 310 596 L 314 660 L 300 676 L 286 660 Z" fill="#2c2a46"/>
       <path d="${sym('M 252 546 L 300 676 L 288 700 L 226 574 Z')}" fill="#211e29" stroke="${c.line}" stroke-width="2.5"/>
       <path d="M 150 650 C 170 720 172 820 168 900 M 230 700 C 236 780 236 850 232 900 M 450 650 C 430 720 428 820 432 900 M 370 700 C 364 780 364 850 368 900" fill="none" stroke="#3a3646" stroke-width="4" opacity="0.8"/>`,
  },
  defaultOutfit: 'robe',
};

// ---------------------------------------------------------------------------
// TINO "TWO-PHONES" REYES — fixer, informant, entrepreneur.

const tino: Build = {
  skin: '#b5794f',
  W: 110,
  J: 86,
  chinY: 484,
  chinW: 40,
  eyeColor: '#3a2a1e',
  browColor: '#1c1410',
  browThick: 10,
  nose: 'broad',
  mouthW: 27,
  stubble: '#2a1a14',
  hairFront: (c) =>
    `<path d="M 186 302 C 180 212 220 148 300 144 C 380 148 420 212 414 302 L 406 302 C 404 262 396 240 380 232 C 340 222 260 222 220 232 C 204 240 196 262 194 302 Z" fill="#1d1712" stroke="${c.line}" stroke-width="3"/>
     <path d="M 210 252 L 228 236 L 224 252 L 244 238" fill="none" stroke="${c.skin}" stroke-width="3.5" stroke-linejoin="round"/>
     <g transform="translate(0 -2)"><rect x="222" y="176" width="66" height="30" rx="12" fill="#121216" stroke="#d6b04a" stroke-width="3"/><rect x="312" y="176" width="66" height="30" rx="12" fill="#121216" stroke="#d6b04a" stroke-width="3"/>
     <path d="M 288 188 Q 300 182 312 188" stroke="#d6b04a" stroke-width="3" fill="none"/><path d="M 232 184 L 256 184" stroke="#fff" stroke-width="3" opacity="0.5"/></g>`,
  outfits: {
    track: (c) =>
      `<path d="${SHOULDERS}" fill="#178080" stroke="${c.line}" stroke-width="3.5"/>
       <path d="M 256 548 L 300 680 L 344 548 Z" fill="#f4f4f4"/>
       <path d="${sym('M 248 540 L 300 690 L 300 900 L 284 900 L 284 700 L 232 560 Z')}" fill="#126b6b" stroke="${c.line}" stroke-width="2.5"/>
       <path d="${sym('M 70 620 C 110 576 180 562 240 556 M 80 640 C 120 596 186 580 244 572')}" fill="none" stroke="#f4f4f4" stroke-width="7"/>
       <path d="M 252 560 Q 300 660 348 560" fill="none" stroke="#e2bc4c" stroke-width="7" stroke-dasharray="10 4"/>
       <circle cx="300" cy="640" r="14" fill="#e2bc4c" stroke="${c.line}" stroke-width="2"/><text x="300" y="646" font-family="Inter" font-weight="800" font-size="16" text-anchor="middle" fill="#6e5214">$</text>`,
  },
  defaultOutfit: 'track',
};

// ---------------------------------------------------------------------------

export const BUILDS: Record<CharId, Build> = { ezra, rosa, corvin, iris, benny, brandt, strand, judge, tino };

/** Per-character overrides to the shared expression sheet. */
const OVERRIDES: Partial<Record<CharId, Record<string, ExprParams>>> = {
  ezra: {
    neutral: { brow: 'neutral', eyes: 'open', mouth: 'wry' },
    point: { brow: 'angry', eyes: 'open', mouth: 'smirk' },
    read: { brow: 'furrow', eyes: 'narrow', mouth: 'tight' },
  },
  strand: {
    neutral: { brow: 'flat', eyes: 'open', mouth: 'neutral' },
    smug: { brow: 'raised', eyes: 'half', mouth: 'smirk' },
  },
  judge: {
    stern: { brow: 'angry', eyes: 'narrow', mouth: 'tight' },
    amused: { brow: 'raised', eyes: 'happy', mouth: 'smile' },
  },
  iris: {
    cold: { brow: 'flat', eyes: 'half', mouth: 'smirk' },
  },
  brandt: {
    neutral: { brow: 'flat', eyes: 'open', mouth: 'neutral' },
  },
};

export function exprFor(id: CharId, expr: string): ExprParams {
  return OVERRIDES[id]?.[expr] ?? COMMON[expr] ?? COMMON.neutral;
}

export function knownExpr(id: CharId, expr: string): boolean {
  return Boolean(OVERRIDES[id]?.[expr] ?? COMMON[expr]);
}

export function portraitSVG(id: CharId, expr: string, outfit?: string): string {
  return renderPortrait(BUILDS[id], exprFor(id, expr), outfit);
}

export { mirror };
