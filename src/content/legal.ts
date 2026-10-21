/** The objection grounds the player can raise, with plain-English explanations. */

export type Ground = 'leading' | 'hearsay' | 'speculation' | 'relevance' | 'badgering' | 'narrative' | 'facts' | 'foundation';

export interface GroundDef {
  id: Ground;
  name: string;
  short: string;
  long: string;
}

export const GROUNDS: GroundDef[] = [
  {
    id: 'leading',
    name: 'Leading the Witness',
    short: 'The question suggests its own answer.',
    long: "On direct examination, a lawyer can't put words in their own witness's mouth. \"You saw the defendant, didn't you?\" is leading. \"What did you see?\" is not. (Leading questions are allowed on cross.)",
  },
  {
    id: 'hearsay',
    name: 'Hearsay',
    short: 'Repeating what someone else said, to prove it true.',
    long: 'A witness may testify to what they saw and heard — but not repeat an out-of-court statement by someone else to prove that statement is true. "The janitor told me he threatened Sable" is hearsay.',
  },
  {
    id: 'speculation',
    name: 'Speculation',
    short: 'Guessing about things the witness cannot know.',
    long: "Witnesses testify to facts within their personal knowledge. They can't guess what someone else was thinking, feeling or planning — \"the killer clearly hated him\" is speculation.",
  },
  {
    id: 'relevance',
    name: 'Relevance',
    short: 'Has nothing to do with the facts of this case.',
    long: "Evidence must make a fact that matters to the case more or less likely. A defendant's unpaid parking tickets, or his taste in music, usually aren't relevant to a murder.",
  },
  {
    id: 'badgering',
    name: 'Badgering the Witness',
    short: 'Arguing with, mocking or harassing the witness.',
    long: 'Lawyers ask questions; they do not argue with, insult or bully witnesses. Repeating a question in an increasingly hostile tone, or sneering at answers, is badgering.',
  },
  {
    id: 'narrative',
    name: 'Calls for a Narrative',
    short: 'An open invitation to ramble.',
    long: '"Tell us everything you know about the defendant" lets a witness wander into inadmissible territory before anyone can object. Questions should be specific.',
  },
  {
    id: 'facts',
    name: 'Assumes Facts Not in Evidence',
    short: 'The question treats something unproven as true.',
    long: '"After the defendant left the trap room, where did he go?" assumes he left — which nobody has proven. A question cannot smuggle in its own facts.',
  },
  {
    id: 'foundation',
    name: 'Lack of Foundation',
    short: 'No basis shown for the witness to know this.',
    long: "Before a witness can offer an opinion or identify something, the lawyer must show how they'd know — their expertise, or their opportunity to observe.",
  },
];

export const GROUND_BY_ID = Object.fromEntries(GROUNDS.map((g) => [g.id, g])) as Record<Ground, GroundDef>;

export const MECHANICS: { title: string; body: string }[] = [
  { title: 'Jury Sway', body: 'Twelve jurors watch every move. Break a testimony, win an objection or land a gambit and they swing your way. Present the wrong thing, object without grounds, or let the prosecution score, and they drift toward GUILTY. If sway hits zero, the jury convicts.' },
  { title: 'Cross-Examination', body: 'Step through a testimony statement by statement. PRESS a statement to make the witness elaborate. PRESENT evidence when a statement contradicts it. READ a witness to catch a tell — it costs Focus.' },
  { title: 'Reading People', body: "Ezra spent ten years on stage reading strangers. Watch the witness closely: a dart of the eyes, a lip pressed thin, a swallow, a bead of sweat, a flash of the brows. Spot where the tell happened, then decide what it means." },
  { title: 'Objections', body: 'During direct examination, every line is a chance to object. Pick the right legal ground and the judge sustains it. Object to a proper question — or pick the wrong ground — and you look desperate.' },
  { title: 'Deduction Board', body: "Some truths only appear when two facts collide. Select two cards on the board and connect them. A successful connection becomes a Deduction you can present like evidence." },
  { title: 'Gambits & Patience', body: "Ezra's old showmanship can win a room — and lose a judge. Gambits are risky plays that cost the judge's patience. Run out and you'll be held in contempt." },
];
