/**
 * Everything you hear is synthesized live with WebAudio: text blips, stingers
 * and a small step sequencer that plays the soundtrack. No audio files needed.
 */

type Instrument = 'bass' | 'keys' | 'pad' | 'lead' | 'pluck' | 'bell';

interface Track {
  bpm: number;
  swing?: number;
  /** Chords as MIDI note arrays, one per bar. */
  chords: number[][];
  /** Bass step pattern per bar (16 steps): chord-tone index, 'o' = root an octave up, null = rest. */
  bass?: (number | 'o' | null)[];
  bassInst?: Instrument;
  /** Chord stab pattern (16 steps, 1 = hit). */
  comp?: number[];
  compInst?: Instrument;
  pad?: boolean;
  /** Arpeggio (16 steps) as chord-tone indexes. */
  arp?: (number | null)[];
  arpInst?: Instrument;
  arpOctave?: number;
  kick?: number[];
  snare?: number[];
  hat?: number[];
  /** Melody: [bar, step, midi, lengthSteps] repeated over the progression. */
  melody?: [number, number, number, number][];
  melodyInst?: Instrument;
  heartbeat?: boolean;
  volume?: number;
}

const n = (name: string): number => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  if (!m) throw new Error(name);
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1] as 'C'];
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return 12 * (Number(m[3]) + 1) + base + acc;
};
const chord = (...names: string[]) => names.map(n);
const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

const X = 1;
const _ = 0;

export const TRACKS: Record<string, Track> = {
  title: {
    bpm: 72,
    swing: 0.12,
    chords: [chord('C3', 'Eb3', 'G3', 'Bb3', 'D4'), chord('F2', 'Ab3', 'C4', 'Eb4'), chord('Ab2', 'C4', 'Eb4', 'G4'), chord('G2', 'B3', 'D4', 'F4')],
    bass: [0, null, null, null, null, null, 0, null, 1, null, null, null, null, null, null, null],
    pad: true,
    hat: [_, _, X, _, _, _, X, _, _, _, X, _, _, _, X, X],
    kick: [X, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _],
    melody: [
      [0, 0, n('G4'), 6], [0, 6, n('Bb4'), 2], [0, 8, n('C5'), 6], [0, 14, n('D5'), 2],
      [1, 0, n('Eb5'), 8], [1, 8, n('D5'), 4], [1, 12, n('C5'), 4],
      [2, 0, n('Bb4'), 6], [2, 6, n('C5'), 2], [2, 8, n('G4'), 8],
      [3, 0, n('F4'), 4], [3, 4, n('G4'), 4], [3, 8, n('B4'), 8],
    ],
    melodyInst: 'lead',
    volume: 0.85,
  },
  office: {
    bpm: 92,
    swing: 0.18,
    chords: [chord('D3', 'F3', 'A3', 'C4', 'E4'), chord('G2', 'F3', 'B3', 'E4'), chord('C3', 'E3', 'G3', 'B3', 'D4'), chord('A2', 'G3', 'C#4', 'F4')],
    bass: [0, null, null, null, 2, null, null, null, 1, null, null, null, 3, null, 2, null],
    comp: [_, _, _, _, _, _, X, _, _, _, _, _, _, _, X, _],
    compInst: 'keys',
    hat: [X, _, X, X, X, _, X, X, X, _, X, X, X, _, X, X],
    kick: [X, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _],
    volume: 0.7,
  },
  investigate: {
    bpm: 86,
    chords: [chord('A2', 'C4', 'E4', 'G4'), chord('F2', 'A3', 'C4', 'E4'), chord('D3', 'F3', 'A3', 'C4'), chord('E2', 'G#3', 'B3', 'D4')],
    bass: [0, null, null, 0, null, null, 0, null, null, null, 2, null, null, null, null, null],
    arp: [0, null, 1, null, 2, null, 3, null, 2, null, 1, null, 3, null, 2, null],
    arpInst: 'pluck',
    arpOctave: 12,
    pad: true,
    hat: [_, _, X, _, _, _, X, _, _, _, X, _, _, _, X, _],
    kick: [X, _, _, _, _, _, _, _, _, _, X, _, _, _, _, _],
    volume: 0.65,
  },
  trial: {
    bpm: 112,
    chords: [chord('C3', 'Eb3', 'G3', 'C4'), chord('Ab2', 'C3', 'Eb3', 'Ab3'), chord('Bb2', 'D3', 'F3', 'Bb3'), chord('G2', 'B2', 'D3', 'G3')],
    bass: [0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 'o', null, 0, null],
    pad: true,
    comp: [X, _, _, _, _, _, _, _, X, _, _, X, _, _, _, _],
    compInst: 'keys',
    kick: [X, _, _, _, X, _, _, _, X, _, _, _, X, _, _, _],
    snare: [_, _, _, _, X, _, _, _, _, _, _, _, X, _, _, _],
    hat: [X, _, X, _, X, _, X, _, X, _, X, _, X, _, X, _],
    melody: [
      [0, 0, n('G4'), 3], [0, 3, n('C5'), 3], [0, 6, n('Eb5'), 6], [0, 12, n('D5'), 4],
      [1, 0, n('C5'), 6], [1, 6, n('Eb5'), 2], [1, 8, n('Ab4'), 8],
      [2, 0, n('Bb4'), 3], [2, 3, n('D5'), 3], [2, 6, n('F5'), 6], [2, 12, n('Eb5'), 4],
      [3, 0, n('D5'), 8], [3, 8, n('B4'), 8],
    ],
    melodyInst: 'lead',
    volume: 0.65,
  },
  cross: {
    bpm: 128,
    chords: [chord('E3', 'G3', 'B3', 'E4'), chord('C3', 'E3', 'G3', 'C4'), chord('D3', 'F#3', 'A3', 'D4'), chord('B2', 'D#3', 'F#3', 'B3')],
    bass: [0, null, 0, 0, null, 0, null, 0, 0, null, 0, 0, null, 2, null, 0],
    arp: [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3],
    arpInst: 'pluck',
    arpOctave: 12,
    kick: [X, _, _, _, X, _, _, X, X, _, _, _, X, _, _, _],
    snare: [_, _, _, _, X, _, _, _, _, _, _, _, X, _, _, X],
    hat: [X, X, X, X, X, X, X, X, X, X, X, X, X, X, X, X],
    pad: true,
    volume: 0.6,
  },
  pursuit: {
    bpm: 146,
    chords: [chord('G2', 'Bb2', 'D3', 'G3'), chord('Eb3', 'G3', 'Bb3', 'Eb4'), chord('F3', 'A3', 'C4', 'F4'), chord('D3', 'F#3', 'A3', 'D4')],
    bass: [0, 0, null, 0, 0, null, 0, 0, 0, 0, null, 0, 2, null, 3, null],
    kick: [X, _, _, X, X, _, _, _, X, _, _, X, X, _, _, _],
    snare: [_, _, _, _, X, _, _, _, _, _, _, _, X, _, X, X],
    hat: [X, _, X, _, X, _, X, _, X, _, X, _, X, _, X, _],
    pad: true,
    melody: [
      [0, 0, n('D5'), 2], [0, 2, n('G5'), 2], [0, 4, n('Bb5'), 4], [0, 8, n('A5'), 2], [0, 10, n('G5'), 2], [0, 12, n('F#5'), 4],
      [1, 0, n('G5'), 6], [1, 6, n('Bb5'), 2], [1, 8, n('Eb6'), 8],
      [2, 0, n('C6'), 2], [2, 2, n('A5'), 2], [2, 4, n('F5'), 4], [2, 8, n('A5'), 4], [2, 12, n('C6'), 4],
      [3, 0, n('D6'), 8], [3, 8, n('A5'), 4], [3, 12, n('F#5'), 4],
    ],
    melodyInst: 'lead',
    volume: 0.6,
  },
  tension: {
    bpm: 62,
    chords: [chord('F2', 'Ab2', 'C3', 'Db3'), chord('F2', 'Ab2', 'B2', 'E3')],
    pad: true,
    heartbeat: true,
    arp: [0, null, null, null, null, null, 3, null, null, null, null, null, null, null, null, null],
    arpInst: 'bell',
    arpOctave: 24,
    volume: 0.75,
  },
  sad: {
    bpm: 66,
    chords: [chord('F2', 'A3', 'C4', 'F4'), chord('E2', 'G3', 'C4', 'E4'), chord('D2', 'F3', 'A3', 'D4'), chord('Bb1', 'F3', 'Bb3', 'D4')],
    bass: [0, null, null, null, null, null, null, null, 0, null, null, null, null, null, null, null],
    arp: [0, null, 1, null, 2, null, 3, null, 2, null, 1, null, 2, null, 3, null],
    arpInst: 'keys',
    pad: true,
    volume: 0.7,
  },
  victory: {
    bpm: 124,
    chords: [chord('C3', 'E3', 'G3', 'C4'), chord('G2', 'B2', 'D3', 'G3'), chord('A2', 'C3', 'E3', 'A3'), chord('F2', 'A2', 'C3', 'F3')],
    bass: [0, null, 0, null, 2, null, 0, null, 0, null, 0, null, 2, null, 1, null],
    kick: [X, _, _, _, X, _, _, _, X, _, _, _, X, _, _, _],
    snare: [_, _, _, _, X, _, _, _, _, _, _, _, X, _, _, _],
    hat: [X, _, X, _, X, _, X, _, X, _, X, _, X, _, X, _],
    pad: true,
    melody: [
      [0, 0, n('E5'), 4], [0, 4, n('G5'), 4], [0, 8, n('C6'), 8],
      [1, 0, n('B5'), 4], [1, 4, n('A5'), 2], [1, 6, n('G5'), 2], [1, 8, n('D5'), 8],
      [2, 0, n('C5'), 4], [2, 4, n('E5'), 4], [2, 8, n('A5'), 8],
      [3, 0, n('G5'), 4], [3, 4, n('F5'), 4], [3, 8, n('A5'), 4], [3, 12, n('C6'), 4],
    ],
    melodyInst: 'lead',
    volume: 0.6,
  },
};

export class AudioEngine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private noiseBuf!: AudioBuffer;
  private current: { id: string; gain: GainNode; timer: number } | null = null;
  musicVolume = 0.55;
  sfxVolume = 0.8;
  private wanted: string | null = null;

  /** Must be called from a user gesture at least once. */
  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 3;
      this.master.connect(comp).connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.sfxBus = this.ctx.createGain();
      this.musicBus.connect(this.master);
      this.sfxBus.connect(this.master);
      this.setVolumes(this.musicVolume, this.sfxVolume);
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    if (this.wanted && !this.current) this.music(this.wanted);
  }

  setVolumes(music: number, sfx: number): void {
    this.musicVolume = music;
    this.sfxVolume = sfx;
    if (!this.ctx) return;
    this.musicBus.gain.setTargetAtTime(music * 0.6, this.ctx.currentTime, 0.05);
    this.sfxBus.gain.setTargetAtTime(sfx, this.ctx.currentTime, 0.05);
  }

  // ---------- low-level voices ----------

  private env(g: GainNode, t: number, a: number, peak: number, d: number, sustain = 0, rel = 0.05): void {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    if (sustain > 0) {
      g.gain.exponentialRampToValueAtTime(Math.max(peak * 0.6, 0.0002), t + a + d);
      g.gain.setValueAtTime(Math.max(peak * 0.6, 0.0002), t + a + d + sustain);
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + d + sustain + rel);
    } else {
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    }
  }

  private osc(type: OscillatorType, freq: number, t: number, dur: number, peak: number, out: AudioNode, opts: { a?: number; filter?: number; detune?: number; glideTo?: number } = {}): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (opts.glideTo) o.frequency.exponentialRampToValueAtTime(opts.glideTo, t + dur);
    if (opts.detune) o.detune.value = opts.detune;
    const g = ctx.createGain();
    this.env(g, t, opts.a ?? 0.005, peak, dur);
    let node: AudioNode = o;
    if (opts.filter) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = opts.filter;
      node.connect(f);
      node = f;
    }
    node.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  private noise(t: number, dur: number, peak: number, out: AudioNode, type: BiquadFilterType, freq: number, q = 1, sweepTo?: number): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    f.Q.value = q;
    const g = ctx.createGain();
    this.env(g, t, 0.002, peak, dur);
    src.connect(f).connect(g).connect(out);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  private voice(inst: Instrument, midi: number, t: number, dur: number, vel: number, out: AudioNode): void {
    const f = mtof(midi);
    switch (inst) {
      case 'bass':
        this.osc('triangle', f, t, dur * 0.9, 0.5 * vel, out, { filter: 900 });
        this.osc('sawtooth', f, t, dur * 0.6, 0.12 * vel, out, { filter: 500 });
        break;
      case 'keys':
        this.osc('sine', f, t, dur * 1.6, 0.16 * vel, out, { a: 0.008 });
        this.osc('triangle', f * 2, t, dur * 0.8, 0.04 * vel, out, { a: 0.004 });
        break;
      case 'pad':
        this.osc('sawtooth', f, t, dur, 0.035 * vel, out, { a: dur * 0.35, filter: 1100, detune: -7 });
        this.osc('sawtooth', f, t, dur, 0.035 * vel, out, { a: dur * 0.35, filter: 1100, detune: 7 });
        break;
      case 'lead':
        this.osc('square', f, t, dur, 0.07 * vel, out, { a: 0.02, filter: 2400 });
        this.osc('triangle', f, t, dur, 0.09 * vel, out, { a: 0.02, detune: 5 });
        break;
      case 'pluck':
        this.osc('triangle', f, t, Math.min(dur, 0.35), 0.13 * vel, out, { filter: 3000 });
        break;
      case 'bell':
        this.osc('sine', f, t, 1.8, 0.12 * vel, out);
        this.osc('sine', f * 2.76, t, 0.6, 0.04 * vel, out);
        break;
    }
  }

  private kick(t: number, out: AudioNode, vel = 1): void {
    this.osc('sine', 120, t, 0.28, 0.75 * vel, out, { glideTo: 38 });
  }
  private snare(t: number, out: AudioNode, vel = 1): void {
    this.noise(t, 0.16, 0.28 * vel, out, 'bandpass', 1800, 0.8);
    this.osc('triangle', 190, t, 0.08, 0.15 * vel, out);
  }
  private hat(t: number, out: AudioNode, vel = 1): void {
    this.noise(t, 0.045, 0.09 * vel, out, 'highpass', 7500, 0.7);
  }

  // ---------- music ----------

  music(id: string | null): void {
    this.wanted = id;
    if (!this.ctx) return;
    if (this.current?.id === id) return;
    this.stopMusic();
    if (!id) return;
    const track = TRACKS[id];
    if (!track) return;
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(track.volume ?? 0.7, ctx.currentTime + 1.2);
    gain.connect(this.musicBus);
    const stepDur = 60 / track.bpm / 4;
    let step = 0;
    let next = ctx.currentTime + 0.08;
    const bars = track.chords.length;
    const schedule = () => {
      while (next < ctx.currentTime + 0.25) {
        const bar = Math.floor(step / 16) % bars;
        const s = step % 16;
        const swing = track.swing && s % 2 === 1 ? stepDur * track.swing : 0;
        const t = next + swing;
        const ch = track.chords[bar];
        if (track.pad && s === 0) {
          for (const note of ch.slice(1)) this.voice('pad', note, t, stepDur * 16, 1, gain);
        }
        const b = track.bass?.[s];
        if (b !== undefined && b !== null) {
          const note = b === 'o' ? ch[0] + 12 : Math.min((ch[b] ?? ch[0]) - (b > 0 ? 12 : 0), ch[0] + 12);
          this.voice(track.bassInst ?? 'bass', note, t, stepDur * 1.8, 1, gain);
        }
        if (track.comp?.[s]) for (const note of ch.slice(1)) this.voice(track.compInst ?? 'keys', note, t, stepDur * 2, 0.8, gain);
        const a = track.arp?.[s];
        if (a !== undefined && a !== null) {
          const tones = ch.slice(1);
          this.voice(track.arpInst ?? 'pluck', tones[a % tones.length] + (track.arpOctave ?? 0), t, stepDur * 2, 0.9, gain);
        }
        if (track.kick?.[s]) this.kick(t, gain);
        if (track.snare?.[s]) this.snare(t, gain);
        if (track.hat?.[s]) this.hat(t, gain, s % 4 === 0 ? 1 : 0.6);
        if (track.heartbeat && (s === 0 || s === 3)) this.osc('sine', 60, t, 0.18, s === 0 ? 0.6 : 0.4, gain, { glideTo: 40 });
        if (track.melody) {
          for (const [mb, ms, note, len] of track.melody) {
            if (mb === bar && ms === s) this.voice(track.melodyInst ?? 'lead', note, t, stepDur * len, 1, gain);
          }
        }
        next += stepDur;
        step++;
      }
    };
    schedule();
    const timer = window.setInterval(schedule, 50);
    this.current = { id, gain, timer };
  }

  private stopMusic(): void {
    if (!this.current || !this.ctx) return;
    const { gain, timer } = this.current;
    clearInterval(timer);
    gain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.25);
    setTimeout(() => gain.disconnect(), 1500);
    this.current = null;
  }

  // ---------- sfx ----------

  blip(pitch: number): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.osc('square', pitch * (0.97 + Math.random() * 0.06), t, 0.035, 0.05, this.sfxBus, { filter: 2800 });
  }

  sfx(id: string): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const out = this.sfxBus;
    switch (id) {
      case 'click':
        this.osc('triangle', 880, t, 0.05, 0.12, out);
        break;
      case 'select':
        this.osc('triangle', 660, t, 0.06, 0.12, out);
        this.osc('triangle', 990, t + 0.05, 0.08, 0.12, out);
        break;
      case 'back':
        this.osc('triangle', 520, t, 0.06, 0.1, out);
        this.osc('triangle', 390, t + 0.05, 0.08, 0.1, out);
        break;
      case 'objection':
        this.noise(t, 0.35, 0.5, out, 'bandpass', 1200, 0.6, 400);
        for (const m of [n('C4'), n('Eb4'), n('G4'), n('C5')]) this.osc('sawtooth', mtof(m), t + 0.02, 0.6, 0.09, out, { filter: 2500 });
        this.kick(t, out, 1.2);
        break;
      case 'holdit':
        this.noise(t, 0.25, 0.4, out, 'bandpass', 1600, 0.6, 600);
        for (const m of [n('D4'), n('F#4'), n('A4')]) this.osc('sawtooth', mtof(m), t, 0.4, 0.08, out, { filter: 2400 });
        break;
      case 'exhibit':
        this.noise(t, 0.3, 0.45, out, 'bandpass', 1400, 0.6, 500);
        for (const m of [n('E4'), n('G#4'), n('B4'), n('E5')]) this.osc('sawtooth', mtof(m), t + 0.02, 0.55, 0.08, out, { filter: 2600 });
        this.kick(t, out, 1.1);
        break;
      case 'gotcha':
        for (const [i, m] of [n('A4'), n('E5'), n('A5')].entries()) this.osc('sine', mtof(m), t + i * 0.07, 0.9, 0.16, out);
        this.noise(t, 0.6, 0.12, out, 'highpass', 6000, 0.5);
        break;
      case 'gavel':
        this.osc('sine', 140, t, 0.18, 0.9, out, { glideTo: 60 });
        this.noise(t, 0.06, 0.6, out, 'bandpass', 2400, 1.5);
        this.osc('sine', 140, t + 0.22, 0.18, 0.7, out, { glideTo: 60 });
        this.noise(t + 0.22, 0.06, 0.45, out, 'bandpass', 2400, 1.5);
        break;
      case 'evidence':
        for (const [i, m] of [n('C5'), n('E5'), n('G5'), n('C6')].entries()) this.osc('triangle', mtof(m), t + i * 0.08, 0.35, 0.16, out);
        break;
      case 'success':
        for (const [i, m] of [n('G4'), n('C5'), n('E5'), n('G5')].entries()) this.osc('square', mtof(m), t + i * 0.06, 0.3, 0.06, out, { filter: 3000 });
        break;
      case 'fail':
        this.osc('sawtooth', 300, t, 0.5, 0.15, out, { glideTo: 90, filter: 1200 });
        break;
      case 'damage':
        this.noise(t, 0.35, 0.5, out, 'lowpass', 900, 0.8, 200);
        this.osc('square', 180, t, 0.3, 0.12, out, { glideTo: 70, filter: 900 });
        break;
      case 'shock':
        this.noise(t, 0.4, 0.35, out, 'bandpass', 3000, 0.5, 300);
        this.osc('sawtooth', 900, t, 0.4, 0.08, out, { glideTo: 120, filter: 3000 });
        break;
      case 'whoosh':
        this.noise(t, 0.35, 0.22, out, 'bandpass', 400, 1.2, 3000);
        break;
      case 'swipe':
        this.noise(t, 0.18, 0.18, out, 'bandpass', 2400, 1.2, 600);
        break;
      case 'heartbeat':
        this.osc('sine', 70, t, 0.16, 0.7, out, { glideTo: 45 });
        this.osc('sine', 70, t + 0.24, 0.14, 0.5, out, { glideTo: 45 });
        break;
      case 'reveal':
        for (const [i, m] of [n('E5'), n('B5'), n('E6'), n('G#6')].entries()) this.osc('sine', mtof(m), t + i * 0.05, 1.2, 0.08, out);
        break;
      case 'phone':
        for (let i = 0; i < 2; i++) {
          this.osc('square', 480, t + i * 0.45, 0.35, 0.05, out, { filter: 1800 });
          this.osc('square', 620, t + i * 0.45, 0.35, 0.05, out, { filter: 1800 });
        }
        break;
      case 'stamp':
        this.osc('sine', 90, t, 0.2, 0.9, out, { glideTo: 40 });
        this.noise(t, 0.1, 0.4, out, 'lowpass', 1500);
        break;
      case 'thud':
        this.osc('sine', 80, t, 0.3, 0.8, out, { glideTo: 35 });
        break;
      case 'crowd':
        this.noise(t, 1.4, 0.18, out, 'bandpass', 700, 0.4);
        this.noise(t + 0.1, 1.2, 0.12, out, 'bandpass', 1300, 0.5);
        break;
      case 'door':
        this.noise(t, 0.25, 0.25, out, 'lowpass', 600, 1);
        this.osc('sine', 110, t + 0.18, 0.2, 0.5, out, { glideTo: 60 });
        break;
      case 'paper':
        this.noise(t, 0.18, 0.18, out, 'highpass', 3000, 0.6, 5000);
        break;
      case 'warn':
        this.osc('square', 220, t, 0.18, 0.12, out, { filter: 1200 });
        this.osc('square', 207, t + 0.2, 0.25, 0.12, out, { filter: 1200 });
        break;
      case 'focus':
        this.osc('sine', 220, t, 1.4, 0.12, out, { a: 0.4, glideTo: 440 });
        this.noise(t, 1.2, 0.05, out, 'bandpass', 1200, 4, 300);
        break;
      case 'magic':
        for (let i = 0; i < 8; i++) this.osc('sine', mtof(n('C6') + [0, 4, 7, 11, 12, 16, 19, 24][i]), t + i * 0.04, 0.5, 0.06, out);
        this.noise(t, 0.5, 0.15, out, 'highpass', 4000, 0.4);
        break;
      case 'typewriter':
        this.noise(t, 0.03, 0.25, out, 'bandpass', 3500, 2);
        break;
    }
  }
}

export const audio = new AudioEngine();
