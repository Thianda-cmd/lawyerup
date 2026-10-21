import type { Game } from './game';

export type CharId =
  | 'ezra'
  | 'rosa'
  | 'corvin'
  | 'iris'
  | 'benny'
  | 'brandt'
  | 'strand'
  | 'judge'
  | 'tino';

export type Pos = 'farleft' | 'left' | 'center' | 'right' | 'farright';

export type StatId = 'integrity' | 'notoriety' | 'money' | 'trust';

export type BurstKind = 'objection' | 'holdit' | 'exhibit' | 'gotcha' | 'sustained' | 'overruled';

export type Cmd =
  | { t: 'say'; who: CharId | null; name?: string; expr?: string; text: string; thought?: boolean }
  | { t: 'bg'; id: string; instant?: boolean }
  | { t: 'show'; who: CharId; expr: string; pos: Pos }
  | { t: 'hide'; who: CharId | 'all' }
  | { t: 'expr'; who: CharId; expr: string }
  | { t: 'sfx'; id: string }
  | { t: 'music'; id: string | null }
  | { t: 'shake'; strength: number }
  | { t: 'flash'; color: string }
  | { t: 'burst'; kind: BurstKind }
  | { t: 'wait'; ms: number }
  | { t: 'evidence'; id: string }
  | { t: 'profile'; id: string }
  | { t: 'flag'; id: string; value: boolean }
  | { t: 'stat'; id: StatId; delta: number }
  | { t: 'jury'; delta: number }
  | { t: 'title'; text: string; sub?: string }
  | { t: 'fade'; dir: 'in' | 'out'; ms: number }
  | { t: 'filter'; mode: 'none' | 'flashback' | 'noir' }
  | { t: 'call'; who: CharId | null }
  | { t: 'outfit'; who: CharId; id: string }
  | { t: 'warn' };

/** A script is either a flat list of commands or arbitrary async logic. */
export type Script = Cmd[] | ((g: Game) => Promise<void>);

export interface EvidenceDef {
  id: string;
  name: string;
  icon: string;
  /** One-line summary shown in the record grid tooltip / list. */
  short: string;
  /** Full description; may change based on flags. */
  desc: string | ((g: Game) => string);
  /** Optional extra detail page ("Check"). */
  detail?: string | ((g: Game) => string);
  kind?: 'evidence' | 'deduction';
}

export interface ProfileDef {
  id: string;
  name: string;
  char?: CharId;
  icon?: string;
  age?: string;
  role: string;
  desc: string | ((g: Game) => string);
}

export interface DeductionRecipe {
  a: string;
  b: string;
  result: string;
  /** Ezra's realization, shown on the board when the connection lands. */
  note: string;
}

export interface Choice<T = string> {
  label: string;
  value: T;
  tag?: string;
  hint?: string;
  disabled?: boolean;
  done?: boolean;
}
