import type { Content } from '../engine/game';
import { EVIDENCE, PROFILES, RECIPES } from './case1/data';
import { investigationScene } from './case1/investigation';
import { coldOpen, office } from './case1/prologue';
import { badEnd, bennyCross, bennyDirect, brandtCross, brandtDirect, closing, epilogue, irisScene, recess, trialOpen, verdict } from './case1/trial';
import { EVIDENCE2, PROFILES2, RECIPES2 } from './case2/data';
import { inv1Scene } from './case2/investigation1';
import { inv2Scene } from './case2/investigation2';
import { hearing, plea, pleaEnd } from './case2/pretrial';
import { coldOpen2, intake } from './case2/prologue';
import { epilogue2, jury2, recess2, trial2Jojo, trial2Kessler, trial2Open, verdict2 } from './case2/trial';

export const CONTENT: Content = {
  evidence: { ...EVIDENCE, ...EVIDENCE2 },
  profiles: { ...PROFILES, ...PROFILES2 },
  recipes: [...RECIPES, ...RECIPES2],
  scenes: {
    c1_cold_open: coldOpen,
    c1_office: office,
    c1_investigation: investigationScene,
    c1_trial_open: trialOpen,
    c1_brandt_direct: brandtDirect,
    c1_brandt_cross: brandtCross,
    c1_benny_direct: bennyDirect,
    c1_benny_cross: bennyCross,
    c1_recess: recess,
    c1_bad_end: badEnd,
    c1_iris: irisScene,
    c1_closing: closing,
    c1_verdict: verdict,
    c1_epilogue: epilogue,

    c2_cold_open: coldOpen2,
    c2_intake: intake,
    c2_inv1: inv1Scene,
    c2_hearing: hearing,
    c2_plea: plea,
    c2_plea_end: pleaEnd,
    c2_inv2: inv2Scene,
    c2_jury: jury2,
    c2_trial: trial2Open,
    c2_trial_jojo: trial2Jojo,
    c2_recess: recess2,
    c2_trial_kessler: trial2Kessler,
    c2_verdict: verdict2,
    c2_epilogue: epilogue2,
  },
  sceneLabels: {
    c1_cold_open: 'Case 1 — Prologue',
    c1_office: 'Case 1 — Vane & Associates',
    c1_investigation: 'Case 1 — Investigation',
    c1_trial_open: 'Case 1 — Trial: Opening',
    c1_brandt_direct: 'Case 1 — Trial: Det. Brandt',
    c1_brandt_cross: 'Case 1 — Trial: Cross-examining Brandt',
    c1_benny_direct: 'Case 1 — Trial: Benny Kowalski',
    c1_benny_cross: 'Case 1 — Trial: Cross-examining Benny',
    c1_recess: 'Case 1 — Recess',
    c1_bad_end: 'Case 1 — Recess',
    c1_iris: 'Case 1 — Trial: Iris Mallory',
    c1_closing: 'Case 1 — Closing Argument',
    c1_verdict: 'Case 1 — Verdict',
    c1_epilogue: 'Case 1 — Epilogue',

    c2_cold_open: 'Case 2 — Prologue',
    c2_intake: 'Case 2 — Rosa',
    c2_inv1: 'Case 2 — Investigation, Part 1',
    c2_hearing: 'Case 2 — Suppression Hearing',
    c2_plea: 'Case 2 — The Plea Offer',
    c2_plea_end: 'Case 2 — The Plea Offer',
    c2_inv2: 'Case 2 — Investigation, Part 2',
    c2_jury: 'Case 2 — Jury Selection',
    c2_trial: 'Case 2 — Trial: Dr. Nand',
    c2_trial_jojo: 'Case 2 — Trial: Jonah Pratt',
    c2_recess: 'Case 2 — Recess',
    c2_trial_kessler: 'Case 2 — Trial: Sgt. Kessler',
    c2_verdict: 'Case 2 — Dismissal',
    c2_epilogue: 'Case 2 — Epilogue',
  },
};
