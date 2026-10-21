import type { StatId } from './types';

export interface TrialState {
  active: boolean;
  /** 0 = certain conviction, 100 = certain acquittal. */
  jury: number;
  /** Mentalist reads available in court. */
  focus: number;
  maxFocus: number;
  /** Judge warnings left before contempt. */
  patience: number;
  objectionsRight: number;
  objectionsWrong: number;
  objectionsMissed: number;
  readsOk: number;
  penalties: number;
  breakthroughs: number;
}

export interface GameState {
  caseId: string;
  flags: Record<string, boolean>;
  evidence: string[];
  profiles: string[];
  /** Topics / hotspots the player has already seen. */
  seen: string[];
  stats: Record<StatId, number>;
  trial: TrialState;
  inv: { location: string };
  vars: Record<string, number | string>;
}

export function freshTrial(): TrialState {
  return {
    active: false,
    jury: 50,
    focus: 3,
    maxFocus: 3,
    patience: 3,
    objectionsRight: 0,
    objectionsWrong: 0,
    objectionsMissed: 0,
    readsOk: 0,
    penalties: 0,
    breakthroughs: 0,
  };
}

export function freshState(): GameState {
  return {
    caseId: 'case1',
    flags: {},
    evidence: [],
    profiles: [],
    seen: [],
    stats: { integrity: 0, notoriety: 0, money: 340, trust: 0 },
    trial: freshTrial(),
    inv: { location: '' },
    vars: {},
  };
}

export function cloneState(s: GameState): GameState {
  return structuredClone(s);
}

export const STAT_LABELS: Record<StatId, string> = {
  integrity: 'Integrity',
  notoriety: 'Notoriety',
  money: 'Cash',
  trust: 'Client Trust',
};
