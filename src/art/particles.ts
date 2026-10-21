import type { ParticleMode } from './backgrounds';

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  t: number;
}

/** Lightweight ambient particles drawn on a canvas over the background. */
export class Particles {
  private ctx: CanvasRenderingContext2D;
  private ps: P[] = [];
  private mode: ParticleMode = 'none';
  private raf = 0;
  private last = 0;

  constructor(canvas: HTMLCanvasElement) {
    canvas.width = 1600;
    canvas.height = 900;
    this.ctx = canvas.getContext('2d')!;
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  set(mode: ParticleMode): void {
    if (mode === this.mode) return;
    this.mode = mode;
    this.ps = [];
    const n = { dust: 70, rain: 220, embers: 60, glitter: 50, none: 0 }[mode];
    for (let i = 0; i < n; i++) this.ps.push(this.spawn(true));
  }

  private spawn(initial: boolean): P {
    const r = Math.random;
    switch (this.mode) {
      case 'rain':
        return { x: r() * 1800 - 100, y: initial ? r() * 900 : -40, vx: -120, vy: 900 + r() * 400, r: 0.8 + r(), a: 0.15 + r() * 0.3, t: 0 };
      case 'embers':
        return { x: r() * 1600, y: initial ? r() * 900 : 920, vx: (r() - 0.5) * 20, vy: -20 - r() * 40, r: 1 + r() * 2.5, a: 0.2 + r() * 0.6, t: r() * 10 };
      case 'glitter':
        return { x: r() * 1600, y: initial ? r() * 900 : -10, vx: (r() - 0.5) * 10, vy: 8 + r() * 14, r: 1 + r() * 2, a: r(), t: r() * 10 };
      default:
        return { x: r() * 1600, y: initial ? r() * 900 : 920, vx: (r() - 0.5) * 8, vy: -4 - r() * 8, r: 0.8 + r() * 2.2, a: 0.1 + r() * 0.35, t: r() * 10 };
    }
  }

  private loop(now: number): void {
    const dt = Math.min(0.05, (now - this.last) / 1000 || 0);
    this.last = now;
    const c = this.ctx;
    c.clearRect(0, 0, 1600, 900);
    if (this.mode !== 'none') {
      for (let i = 0; i < this.ps.length; i++) {
        const p = this.ps[i];
        p.t += dt;
        p.x += (p.vx + (this.mode === 'dust' ? Math.sin(p.t * 0.7) * 6 : 0)) * dt;
        p.y += p.vy * dt;
        if (p.y < -50 || p.y > 950 || p.x < -150 || p.x > 1750) {
          this.ps[i] = this.spawn(false);
          continue;
        }
        if (this.mode === 'rain') {
          c.strokeStyle = `rgba(190,210,255,${p.a})`;
          c.lineWidth = p.r;
          c.beginPath();
          c.moveTo(p.x, p.y);
          c.lineTo(p.x + p.vx * 0.03, p.y + p.vy * 0.03);
          c.stroke();
        } else if (this.mode === 'embers') {
          const flick = 0.6 + Math.sin(p.t * 3) * 0.4;
          c.fillStyle = `rgba(255,${120 + Math.floor(flick * 80)},80,${p.a * flick})`;
          c.beginPath();
          c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          c.fill();
        } else if (this.mode === 'glitter') {
          const tw = Math.max(0, Math.sin(p.t * 4));
          c.fillStyle = `rgba(255,230,150,${p.a * tw})`;
          c.fillRect(p.x - p.r, p.y - 0.4, p.r * 2, 0.8);
          c.fillRect(p.x - 0.4, p.y - p.r, 0.8, p.r * 2);
        } else {
          c.fillStyle = `rgba(255,240,210,${p.a})`;
          c.beginPath();
          c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          c.fill();
        }
      }
    }
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
  }
}
