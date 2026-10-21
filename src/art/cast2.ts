/**
 * Case 2 cast ("Chain of Custody") and a small generator for prospective jurors.
 */
import { shade } from './color';
import { type Build, type Ctx, CX, SHOULDERS, suit, sym } from './portrait';

// ---------------------------------------------------------------------------
// shared pieces

export function jailOutfit(c: Ctx): string {
  return `<path d="${SHOULDERS}" fill="#e2672e" stroke="${c.line}" stroke-width="3.5"/>
    <path d="M 252 548 L 300 640 L 348 548 Z" fill="#f2efe8"/>
    <path d="${sym('M 248 546 L 300 650 L 286 664 L 220 580 Z')}" fill="#cf5a24" stroke="${c.line}" stroke-width="2.5"/>
    <path d="M 300 650 L 300 900" stroke="${c.line}" stroke-width="2.5"/>
    <rect x="350" y="700" width="96" height="70" fill="#cf5a24" stroke="${c.line}" stroke-width="2"/>
    <text x="398" y="742" font-family="Inter, sans-serif" font-weight="700" font-size="17" text-anchor="middle" fill="#3a1608">SQ CO.</text>
    <path d="M 120 640 C 140 700 150 800 150 900 M 480 640 C 460 700 450 800 450 900" fill="none" stroke="#000" stroke-width="3" opacity="0.18"/>`;
}

function hoop(c: Ctx, side: -1 | 1, color: string, r = 9): string {
  const W = c.b.W ?? 112;
  return `<circle cx="${CX + side * (W + 7)}" cy="392" r="${r}" fill="none" stroke="${color}" stroke-width="3"/>`;
}

function stud(c: Ctx, side: -1 | 1, color: string): string {
  const W = c.b.W ?? 112;
  const x = CX + side * (W + 12);
  return `<path d="M ${x} 384 L ${x + 5} 390 L ${x} 396 L ${x - 5} 390 Z" fill="${color}" stroke="#555" stroke-width="1"/>`;
}

function pearls(cx: number, cy: number, w: number, n: number): string {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const x = cx - w / 2 + w * t;
    const y = cy + Math.sin(t * Math.PI) * 34;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="#f7f3ea" stroke="#bdb5a6" stroke-width="1.2"/><circle cx="${(x - 2).toFixed(1)}" cy="${(y - 2).toFixed(1)}" r="2" fill="#fff"/>`;
  }).join('');
}

// ---------------------------------------------------------------------------
// TEO QUINTERO — Rosa's little brother. 19.

const teoHair = '#22140f';
export const teo: Build = {
  skin: '#c48a62',
  W: 104,
  J: 80,
  chinY: 476,
  chinW: 34,
  eyeColor: '#4e3220',
  eyeSize: 1.1,
  browColor: '#1e120c',
  browThick: 9,
  nose: 'button',
  mouthW: 24,
  facial: () => `<path d="M 272 420 Q 300 412 328 420" fill="none" stroke="${teoHair}" stroke-width="5" opacity="0.28" stroke-linecap="round"/>`,
  hairFront: (c) => {
    const curls: [number, number, number][] = [];
    for (let row = 0; row < 3; row++) {
      const y = 214 - row * 26;
      const n = 8 - row;
      for (let i = 0; i < n; i++) {
        const x = 214 + (172 / (n - 1)) * i + (row % 2) * 6;
        curls.push([x, y - Math.sin((i / (n - 1)) * Math.PI) * 18, 22 - row * 1.5]);
      }
    }
    return `<path d="M 188 304 C 184 250 194 214 218 196 L 382 196 C 406 214 416 250 412 304 L 404 304 C 402 262 392 238 374 228 L 226 228 C 208 238 198 262 196 304 Z" fill="${teoHair}" opacity="0.6"/>
      <g fill="${teoHair}" stroke="${c.line}" stroke-width="2.5">${curls.map(([x, y, r]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>`).join('')}</g>
      <g fill="${teoHair}">${curls.map(([x, y, r]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r - 2}"/>`).join('')}</g>
      <g fill="none" stroke="#4a2a1e" stroke-width="3" stroke-linecap="round">${curls.map(([x, y, r]) => `<path d="M ${(x - r * 0.4).toFixed(1)} ${(y - r * 0.2).toFixed(1)} Q ${x.toFixed(1)} ${(y - r * 0.7).toFixed(1)} ${(x + r * 0.4).toFixed(1)} ${(y - r * 0.25).toFixed(1)}"/>`).join('')}</g>`;
  },
  faceExtras: (c) => hoop(c, 1, '#d8d8d8', 7),
  outfits: {
    hoodie: (c) => {
      const g = `${c.uid}-hood`;
      return `<linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#7d8590"/><stop offset="1" stop-color="#4c535c"/></linearGradient>
        <path d="${SHOULDERS}" fill="url(#${g})" stroke="${c.line}" stroke-width="3.5"/>
        <path d="M 222 566 Q 300 640 378 566 Q 392 534 356 518 Q 300 570 244 518 Q 208 534 222 566 Z" fill="#5d646d" stroke="${c.line}" stroke-width="3"/>
        <path d="M 284 590 L 280 700 M 316 590 L 320 700" stroke="#e8e8e8" stroke-width="4" stroke-linecap="round"/>
        <rect x="275" y="696" width="10" height="16" rx="3" fill="#bbb"/><rect x="315" y="696" width="10" height="16" rx="3" fill="#bbb"/>
        <text x="300" y="790" font-family="Inter, sans-serif" font-weight="800" font-size="40" text-anchor="middle" fill="#2f353d" letter-spacing="4">SQCC</text>
        <path d="M 210 830 L 390 830" stroke="#3d434b" stroke-width="3" opacity="0.6"/>`;
    },
    jail: jailOutfit,
    court: (c) => suit(c, { jacket: '#2b3550', shirt: '#eef2f7', tie: '#4a6fa5' }),
  },
  defaultOutfit: 'hoodie',
};

// ---------------------------------------------------------------------------
// SGT. RAY KESSLER — SQPD Narcotics. Officer of the Year, twice.

export const kessler: Build = {
  skin: '#d6a383',
  W: 118,
  J: 98,
  chinY: 490,
  chinW: 52,
  neckW: 62,
  eyeColor: '#5d7888',
  eyeSize: 0.9,
  browColor: '#3a2a20',
  browThick: 13,
  browY: 300,
  nose: 'broad',
  mouthW: 26,
  age: 2,
  stubble: '#3a2a20',
  hairFront: () =>
    `<path d="M 184 300 C 178 196 220 146 300 144 C 380 146 422 196 416 300 L 406 300 C 404 262 394 238 376 228 C 340 216 260 216 224 228 C 206 238 196 262 194 300 Z" fill="#3a2a20" opacity="0.24"/>
     <ellipse cx="268" cy="188" rx="40" ry="14" fill="#fff" opacity="0.22" transform="rotate(-12 268 188)"/>
     <g transform="translate(0 -6)">
       <path d="M 214 196 Q 210 222 238 226 Q 270 228 282 204 Q 284 190 260 188 Z" fill="#20262c" stroke="#c9a24a" stroke-width="3"/>
       <path d="M 386 196 Q 390 222 362 226 Q 330 228 318 204 Q 316 190 340 188 Z" fill="#20262c" stroke="#c9a24a" stroke-width="3"/>
       <path d="M 282 198 Q 300 190 318 198" fill="none" stroke="#c9a24a" stroke-width="3"/>
       <path d="M 226 200 L 252 198" stroke="#fff" stroke-width="3" opacity="0.4"/>
     </g>`,
  facial: (c) =>
    `<path d="M 260 424 Q 280 410 300 414 Q 320 410 340 424 L 342 434 Q 300 426 258 434 Z" fill="#3a2a20" stroke="${c.line}" stroke-width="1.5"/>
     <path d="M 268 454 Q 300 466 332 454 L 328 488 Q 300 502 272 488 Z" fill="#3a2a20" stroke="${c.line}" stroke-width="1.5"/>`,
  outfits: {
    tactical: (c) =>
      `<path d="${SHOULDERS}" fill="#1c1f24" stroke="${c.line}" stroke-width="3.5"/>
       <path d="${sym('M 246 546 L 300 600 L 290 630 L 214 572 Z')}" fill="#262a31" stroke="${c.line}" stroke-width="2.5"/>
       <path d="M 290 600 L 290 690 L 310 690 L 310 600" fill="none" stroke="#33383f" stroke-width="3"/>
       <circle cx="300" cy="630" r="4" fill="#555"/><circle cx="300" cy="664" r="4" fill="#555"/>
       <text x="190" y="690" font-family="Inter, sans-serif" font-weight="800" font-size="18" text-anchor="middle" fill="#b9bec6" letter-spacing="2">SQPD</text>
       <text x="190" y="712" font-family="Inter, sans-serif" font-weight="700" font-size="12" text-anchor="middle" fill="#8a9099" letter-spacing="2">NARCOTICS</text>
       <path d="M 258 552 Q 300 700 342 552" fill="none" stroke="#c9ccd2" stroke-width="3" stroke-dasharray="3 3"/>
       <g transform="translate(300 712)"><path d="M 0 -30 L 9 -9 L 30 -9 L 13 4 L 20 26 L 0 12 L -20 26 L -13 4 L -30 -9 L -9 -9 Z" fill="#d8b14a" stroke="#6e5214" stroke-width="2"/><circle r="8" fill="#b88f2c"/></g>
       <path d="M 120 640 C 140 700 150 800 150 900 M 480 640 C 460 700 450 800 450 900" fill="none" stroke="#000" stroke-width="3" opacity="0.3"/>`,
    suit: (c) => suit(c, { jacket: '#3b4048', shirt: '#dfe6ee', tie: '#1f2a44' }),
  },
  defaultOutfit: 'tactical',
};

// ---------------------------------------------------------------------------
// JONAH "JOJO" PRATT — senior at SQ State, party host, informant CI-417.

export const jojo: Build = {
  skin: '#e7b28c',
  W: 108,
  J: 84,
  chinY: 482,
  chinW: 38,
  eyeColor: '#4c7ea8',
  browColor: '#7a5a30',
  browThick: 9,
  nose: 'straight',
  mouthW: 26,
  stubble: '#8a6a3a',
  hairFront: (c) =>
    `<path d="M 184 314 C 172 210 214 126 300 120 C 386 126 428 210 416 314 L 408 314 C 404 272 398 248 384 236 L 372 266 L 358 230 L 340 260 L 326 226 L 308 258 L 292 224 L 274 256 L 258 228 L 242 258 L 228 236 C 210 250 200 276 196 314 Z" fill="#efd894" stroke="${c.line}" stroke-width="3" stroke-linejoin="round"/>
     <path d="M 232 168 Q 270 146 300 150 M 300 150 Q 330 146 372 170 M 300 150 L 296 128" fill="none" stroke="#7a5a30" stroke-width="5" opacity="0.65" stroke-linecap="round"/>
     <path d="M 216 210 Q 260 180 300 186 Q 350 182 388 214" fill="none" stroke="#fff6cf" stroke-width="5" opacity="0.7" stroke-linecap="round"/>`,
  faceExtras: (c) => stud(c, 1, '#e8f2ff'),
  outfits: {
    party: (c) =>
      `<path d="${SHOULDERS}" fill="#22324e" stroke="${c.line}" stroke-width="3.5"/>
       <path d="M 250 548 L 300 900 L 350 548 Z" fill="#f4f4f2"/>
       <path d="M 252 556 Q 300 596 348 556" fill="none" stroke="#d8d8d4" stroke-width="5"/>
       <path d="${sym('M 246 548 L 292 900 L 270 900 L 228 560 Z')}" fill="#1b2840" stroke="${c.line}" stroke-width="2.5"/>
       <path d="M 222 556 Q 300 520 378 556 L 372 574 Q 300 540 228 574 Z" fill="#7a1f2e" stroke="${c.line}" stroke-width="2.5"/>
       <path d="M 226 564 Q 300 530 374 564" fill="none" stroke="#f0e6cf" stroke-width="3"/>
       <path d="M 268 566 Q 300 640 332 566" fill="none" stroke="#e2bc4c" stroke-width="3.5"/>
       <text x="420" y="720" font-family="'Playfair Display', serif" font-weight="800" font-size="54" text-anchor="middle" fill="#f0e6cf" stroke="#7a1f2e" stroke-width="2">SQ</text>
       <path d="M 120 640 C 140 700 150 800 150 900 M 480 640 C 460 700 450 800 450 900" fill="none" stroke="#000" stroke-width="3" opacity="0.25"/>`,
    court: (c) => suit(c, { jacket: '#2a3142', shirt: '#f4f4f4' }),
  },
  defaultOutfit: 'party',
};

// ---------------------------------------------------------------------------
// COUNCILWOMAN DIANE WHITFIELD — Chloe's mother. Running for mayor.

export const whitfield: Build = {
  skin: '#efcbb0',
  W: 106,
  J: 80,
  chinY: 480,
  chinW: 30,
  neckW: 40,
  eyeColor: '#6a5240',
  lash: true,
  browColor: '#7a3e22',
  browThick: 8,
  nose: 'small',
  lips: '#9c4a52',
  mouthW: 23,
  age: 2,
  makeup: () => `<ellipse cx="246" cy="350" rx="26" ry="8" fill="#d77a7a" opacity="0.25"/><ellipse cx="354" cy="350" rx="26" ry="8" fill="#d77a7a" opacity="0.25"/>`,
  hairBack: (c) =>
    `<path d="M 172 300 C 164 180 224 116 300 114 C 376 116 436 180 428 300 L 432 420 Q 412 436 390 428 L 210 428 Q 188 436 168 420 Z" fill="#7e3a1e" stroke="${c.line}" stroke-width="3"/>`,
  hairFront: (c) =>
    `<path d="M 178 320 C 170 200 226 124 300 120 C 374 124 430 200 422 320 L 428 420 Q 410 434 392 424 C 398 380 402 330 404 292 C 396 252 370 226 330 220 C 290 214 240 230 214 262 C 202 280 198 304 196 334 L 200 424 Q 182 434 170 420 Z" fill="#9c4a26" stroke="${c.line}" stroke-width="3"/>
     <path d="M 212 262 C 244 220 300 206 352 218 M 230 180 Q 300 140 380 180 M 412 300 L 416 400" fill="none" stroke="#c96e3c" stroke-width="5" stroke-linecap="round" opacity="0.85"/>`,
  faceExtras: (c) => {
    const W = c.b.W ?? 112;
    return [-1, 1].map((s) => `<circle cx="${CX + s * (W + 12)}" cy="388" r="7" fill="#f7f3ea" stroke="#bdb5a6" stroke-width="1.5"/>`).join('');
  },
  outfits: {
    blazer: (c) =>
      suit(c, { jacket: '#253457', shirt: '#f3eee6', lapel: '#1d2a47' }) +
      pearls(300, 566, 96, 11) +
      `<g transform="translate(408 652)"><circle r="12" fill="#d8b14a" stroke="#6e5214" stroke-width="2"/><path d="M -6 4 L 0 -7 L 6 4 Z" fill="#6e5214"/></g>`,
  },
  defaultOutfit: 'blazer',
};

// ---------------------------------------------------------------------------
// DR. PRIYA NAND — forensic chemist, SQPD Crime Lab.

export const nand: Build = {
  skin: '#b9845f',
  W: 104,
  J: 78,
  chinY: 478,
  chinW: 30,
  neckW: 40,
  eyeColor: '#3b2a1e',
  lash: true,
  browColor: '#1a120e',
  browThick: 9,
  nose: 'straight',
  lips: '#8e4a4a',
  mouthW: 23,
  hairBack: (c) =>
    `<path d="M 182 300 C 174 194 230 128 300 126 C 370 128 426 194 418 300 L 414 360 L 186 360 Z" fill="#141010" stroke="${c.line}" stroke-width="3"/>`,
  hairFront: (c) =>
    `<path d="M 188 322 C 180 208 228 130 300 128 C 372 130 420 208 412 322 L 404 322 C 402 268 386 232 352 218 C 330 210 312 214 300 224 C 288 214 270 210 248 218 C 214 232 198 268 196 322 Z" fill="#161212" stroke="${c.line}" stroke-width="3"/>
     <path d="M 300 132 L 300 222" stroke="#3a3030" stroke-width="3"/>
     <path d="M 236 170 Q 262 150 296 146 M 304 146 Q 340 150 366 172" fill="none" stroke="#4a3a3a" stroke-width="5" stroke-linecap="round"/>
     <path d="M 198 318 C 190 350 200 380 192 410" fill="none" stroke="#161212" stroke-width="6" stroke-linecap="round"/>`,
  over: () =>
    `<g fill="#dff6f2" fill-opacity="0.08" stroke="#1f5f5a" stroke-width="5">
       <rect x="210" y="314" width="76" height="50" rx="10"/><rect x="314" y="314" width="76" height="50" rx="10"/></g>
     <path d="M 286 334 Q 300 326 314 334" fill="none" stroke="#1f5f5a" stroke-width="5"/>
     <path d="M 210 328 L 194 320 M 390 328 L 406 320" stroke="#1f5f5a" stroke-width="5" stroke-linecap="round"/>`,
  outfits: {
    lab: (c) =>
      `<path d="${SHOULDERS}" fill="#f4f6f8" stroke="${c.line}" stroke-width="3.5"/>
       <path d="M 248 546 L 300 760 L 352 546 Z" fill="#2a8a86"/>
       <path d="M 262 560 Q 300 600 338 560" fill="none" stroke="#1f6a66" stroke-width="4"/>
       <path d="${sym('M 246 548 L 300 770 L 288 800 L 210 650 L 232 626 L 196 606 L 236 556 Z')}" fill="#e6eaee" stroke="${c.line}" stroke-width="3" stroke-linejoin="round"/>
       <path d="M 300 800 L 300 900" stroke="${c.line}" stroke-width="2.5"/>
       <rect x="376" y="676" width="70" height="8" fill="#c9ced4"/><rect x="392" y="650" width="6" height="34" fill="#2a5aa5"/><rect x="406" y="646" width="6" height="38" fill="#c43b4c"/>
       <g transform="rotate(-4 182 720)"><rect x="152" y="690" width="64" height="84" rx="6" fill="#fff" stroke="${c.line}" stroke-width="2"/><rect x="164" y="702" width="40" height="40" fill="#b9845f"/><rect x="160" y="750" width="48" height="8" fill="#2a8a86"/></g>
       <path d="M 120 640 C 140 700 150 800 150 900 M 480 640 C 460 700 450 800 450 900" fill="none" stroke="#9aa3ad" stroke-width="3" opacity="0.6"/>`,
  },
  defaultOutfit: 'lab',
};

// ---------------------------------------------------------------------------
// SILAS CRANE — trial consultant. Ezra's old manager. The voice in the earpiece.

export const crane: Build = {
  skin: '#efd5c4',
  W: 110,
  J: 82,
  chinY: 494,
  chinW: 34,
  eyeColor: '#8a7aa8',
  eyeSize: 0.92,
  eyeTilt: 2,
  browColor: '#cfcfd6',
  browThick: 9,
  browY: 296,
  nose: 'straight',
  mouthW: 24,
  age: 3,
  hairBack: (c) =>
    `<path d="M 188 290 C 176 360 186 430 216 470 L 384 470 C 414 430 424 360 412 290 Z" fill="#9ea2ab" stroke="${c.line}" stroke-width="3"/>`,
  hairFront: (c) =>
    `<path d="M 184 318 C 176 216 214 126 300 118 C 386 126 424 216 416 318 L 406 318 C 404 264 388 224 352 206 C 326 194 274 194 248 206 C 212 224 196 264 194 318 Z" fill="#dcdee4" stroke="${c.line}" stroke-width="3"/>
     <path d="M 220 210 C 250 170 300 158 350 172 C 380 182 400 200 410 230 M 240 196 C 270 160 330 150 372 176 M 200 260 C 206 220 230 196 262 186" fill="none" stroke="#f6f7fa" stroke-width="4" stroke-linecap="round"/>
     <path d="M 230 220 C 262 190 320 182 372 204" fill="none" stroke="#9fa3ad" stroke-width="3" opacity="0.8"/>`,
  over: () =>
    `<g stroke="#c9a24a" stroke-width="3"><circle cx="248" cy="340" r="31" fill="#5b3f8a" fill-opacity="0.42"/><circle cx="352" cy="340" r="31" fill="#5b3f8a" fill-opacity="0.42"/></g>
     <path d="M 279 336 Q 300 328 321 336" fill="none" stroke="#c9a24a" stroke-width="3"/>
     <path d="M 217 334 L 196 326 M 383 334 L 404 326" stroke="#c9a24a" stroke-width="3"/>
     <path d="M 230 324 L 246 314 M 334 324 L 350 314" stroke="#fff" stroke-width="3" opacity="0.55" stroke-linecap="round"/>`,
  outfits: {
    suit: (c) =>
      suit(c, { jacket: '#2b2b33', shirt: '#f1eef4', tie: '#8c6fc4', tieStripe: '#5b3f8a', vest: '#383843', pocket: '#b79cff' }) +
      `<g transform="translate(410 640)"><ellipse rx="13" ry="8" fill="#f3e6c8" stroke="#c9a24a" stroke-width="2"/><circle r="5" fill="#2a9d8f"/><circle r="2" fill="#000"/></g>`,
  },
  defaultOutfit: 'suit',
};

// ---------------------------------------------------------------------------
// OFFICER LUIS ORTEGA — patrol, two years in. Kessler's partner on the stop.

export const ortega: Build = {
  skin: '#c48d66',
  W: 106,
  J: 84,
  chinY: 480,
  chinW: 38,
  eyeColor: '#3a2618',
  eyeSize: 1.02,
  browColor: '#1a120c',
  browThick: 10,
  nose: 'straight',
  mouthW: 25,
  hairFront: (c) =>
    `<path d="M 186 304 C 180 214 220 150 300 146 C 380 150 420 214 414 304 L 406 304 C 404 264 394 240 376 230 C 330 216 270 218 224 230 C 206 240 196 264 194 304 Z" fill="#171210" stroke="${c.line}" stroke-width="3"/>
     <path d="M 252 158 L 246 228" stroke="#3a2e2a" stroke-width="3"/>
     <path d="M 262 170 Q 320 150 390 200" fill="none" stroke="#3a2e2a" stroke-width="5" stroke-linecap="round"/>`,
  outfits: {
    uniform: (c) =>
      `<path d="${SHOULDERS}" fill="#1f2d4a" stroke="${c.line}" stroke-width="3.5"/>
       <path d="${sym('M 246 546 L 300 606 L 290 634 L 216 574 Z')}" fill="#26365a" stroke="${c.line}" stroke-width="2.5"/>
       <path d="M 300 606 L 300 900" stroke="#16223a" stroke-width="4"/>
       ${[640, 700, 760, 820].map((y) => `<circle cx="300" cy="${y}" r="5" fill="#c9ccd2"/>`).join('')}
       <path d="M 392 628 L 430 628 L 432 664 Q 411 684 390 664 Z" fill="#c9ccd2" stroke="#6b7280" stroke-width="2"/>
       <rect x="162" y="652" width="70" height="16" rx="3" fill="#d8b14a"/>
       <text x="197" y="665" font-family="Inter, sans-serif" font-weight="800" font-size="11" text-anchor="middle" fill="#3a2a08">ORTEGA</text>
       <rect x="264" y="690" width="72" height="54" rx="8" fill="#111317" stroke="#000" stroke-width="2"/><circle cx="300" cy="712" r="12" fill="#2a2e36"/><circle cx="300" cy="712" r="6" fill="#0b0d10"/><circle cx="326" cy="698" r="4" fill="#ff3030"/>
       <path d="M 120 610 L 160 600 L 166 650 L 126 662 Z" fill="#c9a24a" opacity="0.8"/>
       <rect x="440" y="590" width="34" height="46" rx="6" fill="#111317"/><path d="M 456 636 Q 470 690 440 720" fill="none" stroke="#111317" stroke-width="4"/>
       <path d="M 120 640 C 140 700 150 800 150 900 M 480 640 C 460 700 450 800 450 900" fill="none" stroke="#000" stroke-width="3" opacity="0.25"/>`,
  },
  defaultOutfit: 'uniform',
};

// ---------------------------------------------------------------------------
// Prospective jurors

export interface JurorLook {
  skin: string;
  hair: 'short' | 'bob' | 'bald' | 'long' | 'curly';
  hairColor: string;
  top: string;
  eyeColor?: string;
  glasses?: boolean;
  age?: 0 | 1 | 2 | 3;
  beard?: boolean;
}

export function jurorBuild(l: JurorLook): Build {
  const fem = l.hair === 'bob' || l.hair === 'long';
  const hairFront = (c: Ctx): string => {
    const h = l.hairColor;
    switch (l.hair) {
      case 'bald':
        return `<path d="${sym('M 186 312 C 182 280 188 256 200 242 L 210 250 C 202 270 200 290 202 314 Z')}" fill="${h}"/><ellipse cx="270" cy="192" rx="40" ry="14" fill="#fff" opacity="0.18"/>`;
      case 'bob':
        return `<path d="M 176 300 C 172 190 228 118 300 116 C 372 118 428 190 424 300 L 428 430 L 396 438 C 400 380 402 320 400 286 C 380 240 330 222 300 224 C 260 226 220 244 200 286 C 198 320 200 380 204 438 L 172 430 Z" fill="${h}" stroke="${c.line}" stroke-width="3"/>`;
      case 'long':
        return `<path d="M 176 300 C 172 190 228 118 300 116 C 372 118 428 190 424 300 L 436 560 L 400 560 C 404 460 404 340 400 286 C 380 240 330 222 300 222 C 260 224 220 244 200 286 C 196 340 196 460 200 560 L 164 560 Z" fill="${h}" stroke="${c.line}" stroke-width="3"/>`;
      case 'curly':
        return `<g fill="${h}" stroke="${c.line}" stroke-width="2.5">${Array.from({ length: 13 }, (_, i) => {
          const a = Math.PI + (i / 12) * Math.PI;
          return `<circle cx="${(300 + Math.cos(a) * 112).toFixed(0)}" cy="${(268 + Math.sin(a) * 118).toFixed(0)}" r="30"/>`;
        }).join('')}</g><path d="M 200 250 Q 300 180 400 250 L 400 210 Q 300 140 200 210 Z" fill="${h}"/>`;
      default:
        return `<path d="M 186 304 C 180 214 220 150 300 146 C 380 150 420 214 414 304 L 406 304 C 404 264 394 240 376 230 C 330 216 270 218 224 230 C 206 240 196 264 194 304 Z" fill="${h}" stroke="${c.line}" stroke-width="3"/>`;
    }
  };
  return {
    skin: l.skin,
    W: fem ? 104 : 112,
    J: fem ? 78 : 88,
    chinY: fem ? 476 : 486,
    eyeColor: l.eyeColor ?? '#4a3426',
    lash: fem,
    browColor: shade(l.hairColor, -0.2),
    browThick: fem ? 8 : 11,
    nose: fem ? 'small' : 'straight',
    mouthW: fem ? 23 : 26,
    neckW: fem ? 40 : 50,
    age: l.age ?? 1,
    facial: l.beard ? (c) => `<path d="M 200 380 C 206 432 236 474 264 490 Q 300 508 336 490 C 364 474 394 432 400 380 C 392 418 372 436 350 444 Q 300 458 250 444 C 228 436 208 418 200 380 Z" fill="${l.hairColor}" stroke="${c.line}" stroke-width="1.5" opacity="0.9"/>` : undefined,
    hairFront,
    over: l.glasses
      ? () => `<g fill="none" stroke="#2a2a2a" stroke-width="4"><circle cx="248" cy="340" r="30"/><circle cx="352" cy="340" r="30"/><path d="M 278 336 Q 300 328 322 336"/></g>`
      : undefined,
    outfits: {
      plain: (c) =>
        `<path d="${SHOULDERS}" fill="${l.top}" stroke="${c.line}" stroke-width="3.5"/>
         <path d="M 244 550 Q 300 612 356 550" fill="${shade(l.top, -0.15)}" stroke="${c.line}" stroke-width="2.5"/>
         <path d="M 250 552 Q 300 600 350 552" fill="${c.skin}"/>
         <path d="M 120 640 C 140 700 150 800 150 900 M 480 640 C 460 700 450 800 450 900" fill="none" stroke="#000" stroke-width="3" opacity="0.2"/>`,
    },
    defaultOutfit: 'plain',
  };
}
