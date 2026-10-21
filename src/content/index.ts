import type { Content } from '../engine/game';
import { EVIDENCE, PROFILES, RECIPES } from './case1/data';
import { investigationScene } from './case1/investigation';
import { coldOpen, office } from './case1/prologue';
import { badEnd, bennyCross, bennyDirect, brandtCross, brandtDirect, closing, epilogue, irisScene, recess, trialOpen, verdict } from './case1/trial';

export const CONTENT: Content = {
  evidence: EVIDENCE,
  profiles: PROFILES,
  recipes: RECIPES,
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
  },
};
