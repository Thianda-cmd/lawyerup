import type { GameState } from './state';

export interface SaveData {
  version: 1;
  scene: string;
  state: GameState;
  time: number;
  label: string;
}

export interface Settings {
  textSpeed: number;
  music: number;
  sfx: number;
  shake: boolean;
}

const KEY = 'lawyerup.save.';
const SETTINGS_KEY = 'lawyerup.settings';
export const SLOTS = ['auto', '1', '2', '3'] as const;
export type Slot = (typeof SLOTS)[number];

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function writeSave(slot: Slot, data: SaveData): boolean {
  try {
    storage()?.setItem(KEY + slot, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function readSave(slot: Slot): SaveData | null {
  try {
    const raw = storage()?.getItem(KEY + slot);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    return data.version === 1 ? data : null;
  } catch {
    return null;
  }
}

export function latestSave(): { slot: Slot; data: SaveData } | null {
  let best: { slot: Slot; data: SaveData } | null = null;
  for (const slot of SLOTS) {
    const data = readSave(slot);
    if (data && (!best || data.time > best.data.time)) best = { slot, data };
  }
  return best;
}

export const DEFAULT_SETTINGS: Settings = { textSpeed: 1, music: 0.55, sfx: 0.8, shake: true };

export function readSettings(): Settings {
  try {
    const raw = storage()?.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function writeSettings(s: Settings): void {
  try {
    storage()?.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* settings are a convenience */
  }
}
