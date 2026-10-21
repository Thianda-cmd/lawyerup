# Lawyer Up!

*Ezra Vane, Attorney at Law.* A 2D narrative courtroom game in the spirit of *Better Call Saul* and
*The Mentalist*: a former Las Vegas "psychic" turned strip-mall defense attorney who wins cases by
reading people.

**Case 1, "The Vanishing Act," is fully playable** (about 45–75 minutes): a stage magician is accused of
murdering his producer during the four minutes he "vanishes" in his signature illusion.

Every portrait, background, sound effect and music track is **generated in code at runtime**. The
repo has no image or audio files.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run build:single` | Build, then inline everything into one self-contained `dist/lawyerup.html` |
| `npm test` | DSL unit tests + static validation of all case content |
| `npm run typecheck` | TypeScript only |

### Controls
- **Click / Space / Enter**: advance dialogue
- **Hold Ctrl**: fast-forward
- **R**: Court Record · **Esc**: menu · **1–9**: pick a choice
- Cross-examination: **← / →** to move between statements

## What's in the game

| System | Where | Summary |
|---|---|---|
| Investigation | `src/systems/investigation.ts` | Examine hotspots, talk through topic trees, present evidence to people, move between unlockable locations, ask Rosa for hints. |
| The Read | `src/systems/readTell.ts` | Mentalist minigame: spot the micro-tell (eyes, brows, mouth, throat, sweat), then interpret it. Costs Focus in court. |
| Deduction Board | `src/ui/record.ts` | Pin two facts together to create a Deduction you can present. |
| Objections | `src/systems/court.ts` | During direct examination, object with the correct legal ground (8 grounds, explained in the in-game Handbook). |
| Cross-examination | `src/systems/court.ts` | Press, present contradictions, read the witness. Statements change as you break them. |
| Jury & Patience | `src/engine/game.ts` | Jury sway (12 jurors, 0 = conviction) and the judge's patience (spent by risky Gambits). |
| Closing argument | `src/systems/court.ts` | Back up each point of your summation with evidence. |
| Choices & stats | throughout | Integrity / Notoriety / Client Trust / Cash, a recess dilemma with a bad ending, verdict report card. |
| Saves | `src/engine/save.ts` | Autosave at every checkpoint + 3 manual slots (localStorage). |

Story bible, cast, system design and the proposed five-case season arc: **[docs/GAME_DESIGN.md](docs/GAME_DESIGN.md)**.

## Project layout

```
src/
  engine/      runtime: Game (stage, dialogue, court camera, flow), DSL, audio synth, state, saves
  art/         procedural art: portrait rig + cast, painted SVG backgrounds, icons, particles
  systems/     investigation, cross-exam/objections/closing, the Read minigame
  ui/          court record + deduction board, menus (title, pause, save/load, settings, backlog)
  content/     characters, legal handbook, and case1/ (data, prologue, investigation, trial)
  styles/      all CSS
dev/           preview pages + Playwright scripts (bot.mjs plays Case 1 end-to-end)
```

## Writing scenes

Scenes are written in a small screenplay language inside TypeScript (see the header of
`src/engine/dsl.ts`):

```ts
await g.run(s`
  @bg corridor
  @show brandt annoyed center
  brandt[annoyed]: This is an active crime scene.
  ezra: Ezra Vane. Counsel for the defense.
  ~ Ezra's private thoughts look like this.
  @evidence still
  @jury +10
`);
```

Branching, investigations and trials are plain TypeScript: see `src/content/case1/`. Typos in
character names, expressions, evidence IDs, backgrounds, music, sound effects or scene links fail
`npm test`.

### Adding a case
1. Create `src/content/case2/` with `data.ts` (evidence, profiles, deduction recipes) and scene files.
2. Register the scenes and labels in `src/content/index.ts`.
3. New characters: add metadata in `content/characters.ts` and a build (hair, outfits) in `art/cast.ts`.
4. New locations: add a painter to `art/backgrounds.ts`.

### Swapping in real art
The portrait renderer is isolated behind `portraitSVG(char, expression, outfit)` in `src/art/cast.ts`,
and backgrounds behind `BACKGROUNDS[id].paint()`. Either can be replaced with `<img>` sprites without
touching game logic. The blink, talk and tell animations would need sprite-sheet equivalents.
