# Lawyer Up! — Game Design & Story Bible

> A 2D narrative courtroom game about **Ezra Vane**: an ex-Las-Vegas "psychic" who reads people
> for a living, now a strip-mall defense attorney with a bus-bench ad and a conscience he can't afford.
> Think *Better Call Saul*'s hustle and moral grey zone, crossed with *The Mentalist*'s
> cold-reading showmanship. And under every case, a long con that started ten years ago.

This document holds the pitch, the cast, the systems and the season plan. **Everything here is a
proposal.** The first case is written and playable. The rest is meant to be argued over and changed.

---

## 1. The pitch

**Ezra Vane** spent ten years as *The Great Vane*, a Vegas mentalist who "knew what you were thinking."
He didn't. His manager, **Silas Crane**, fed him every name, birthday and dead relative through a hidden
earpiece. Then a grieving widow trusted one of Vane's "readings" enough to say it under oath, and an
innocent man, **Marcus Hale**, went to prison for murder.

Ezra walked off the stage, earned a law degree by correspondence (third try at the bar), and opened
**Vane & Associates** (there are no associates) in the Plaza del Sol strip mall in **San Querida**, a
sun-bleached desert city that turns neon after dark.

He's good at law for the same reasons he was good at fraud. He watches. He notices. He knows how a room
breathes. The question the whole game keeps asking: **is Ezra using those skills to find the truth, or
just to win?**

### Tone
- Funny first, then devastating. Banter is quick; the reveals land hard.
- Every case ends with a twist that recontextualizes what came before (a "prestige," in magician terms).
- Morally grey, never nihilistic. Ezra can cut corners. The game remembers that he did.

---

## 2. Core cast

| Character | Role | Notes |
|---|---|---|
| **Ezra Vane** | Protagonist | Ex-mentalist, defense attorney. Charming, quick, a little sleazy, haunted. Cobalt three-piece and a loud tie. |
| **Rosa Quintero** | Paralegal / investigator | Ezra's conscience and the reason the lights stay on. Practical, warm, unimpressed by tricks. Her cousin is a fire inspector (useful). |
| **ADA Helena Strand** | Rival prosecutor | 41–0 before she met Ezra. Cold, precise, *not* corrupt, and that matters later. |
| **Judge Abraham Okafor** | Recurring judge | Stern, fair, dry humor. Hates theatrics. Has the patience meter to prove it. |
| **Det. Lyle Brandt** | Recurring detective | 28 years on the job. Thorough, tired, certain. Grows to respect Ezra, reluctantly. |
| **Tino "Two-Phones" Reyes** | Fixer / informant | Ezra's Saul-style street contact. Everything costs money or a favor. |
| **Silas Crane** | Season antagonist | Ezra's old manager, now a high-priced **jury consultant**. "Every jury has a tell." The dark mirror of Ezra. |
| **Marcus Hale** | The ghost | Wrongly convicted eleven years ago, partly because of Ezra's act. The season's final case is his. |

---

## 3. Systems ("the lawyer stuff")

All of these exist in code today (`src/systems/`).

### Investigation (`investigation.ts`)
- **Examine** hotspots in painted scenes, **Talk** through topic trees, **Present** evidence to people
  for reactions, **Move** between locations that unlock as the story progresses.
- **Hint** button: Rosa points you at what's left.
- Fully resumable: saves restore the exact location and what you've already seen.

### The Read (`readTell.ts`): the mentalist mechanic
1. The witness repeats a line. Somewhere in it, their body betrays them: a **glance away** (eyes),
   a **brow flash**, **lips pressed thin** (mouth), a **hard swallow** (throat) or a **bead of sweat**.
2. You pick **where** the tell happened.
3. You pick **what it means**: lying about *where*, protecting *someone*, scared of *what*.
- In investigation you can retry. In court, each Read costs **Focus** (3 max, +1 per breakthrough), and a
  Read on an honest statement tells you it's honest. That's useful too, but it costs.

### Deduction Board (Court Record → *Deduction Board*)
- Pin two facts together. If they belong together, Ezra realizes something and you get a **Deduction**
  card you can present like evidence. Several key contradictions *require* deductions.

### Direct examination & objections (`court.ts → directExam`)
- While the prosecutor questions her witness, every line is a chance to **OBJECT**, but you must pick
  the right **legal ground**: Leading, Hearsay, Speculation, Relevance, Badgering, Calls for a Narrative,
  Assumes Facts Not in Evidence, Lack of Foundation.
- Sustained earns jury sway. Overruled (a proper line, or the wrong ground) costs you. Letting an improper
  line slide costs a little, and Ezra explains what you missed. The **Handbook** teaches each ground.

### Cross-examination (`court.ts → crossExam`)
- Testimony plays through once, then you step through statements: **Hold it!** (press for details),
  **Exhibit** (present a contradiction), **Read** (spend Focus).
- Statements can change, appear or disappear as you break them.
- Wrong presentations cost jury sway.

### Jury Sway, Patience, Gambits
- **Jury Sway (0–100)**, shown as 12 jurors who flip from red to gold. At 0, the jury convicts (game over,
  retry from checkpoint).
- **Judge's Patience** (3 gavels) is spent by **Gambits**: Saul-style theatrical or shady plays that can
  swing a jury hard. Run out and you're in contempt ($500, jury −15).

### Closing argument (`court.ts → closingArgument`)
- Ezra lays out the defense point by point; you back up each claim with the right piece of evidence.

### Character stats
- **Integrity** (honest choices) vs **Notoriety** (shady choices), **Client Trust**, and **Cash**.
- They change the verdict report and epilogue today. In future cases they should gate options:
  Tino stops helping a high-Integrity Ezra, Strand respects a high-Integrity one, Silas Crane courts a
  high-Notoriety one.

---

## 4. Case 1 — *The Vanishing Act* (playable)

**Client:** Corvin Mallory, "The Amazing Corvin," aging stage magician.
**Victim:** Leon Sable, owner of the Paramount Theater.
**Charge:** Murder, committed during the four minutes Corvin "vanishes" in his signature illusion.

### The truth (spoilers)
- The Vanishing uses a **double**. Corvin drops into the trap room. His wife **Iris**, in an identical
  but shorter cape, walks from the wings to the balcony to "reappear" in a blinding spotlight.
- Iris had been skimming $40,000 from the box office to keep the dying show alive. Sable found out and
  planned to call the police after the show.
- During the Vanishing, Iris used her two spare minutes to beg Sable, then killed him with Corvin's
  Golden Wand award. She ditched a bloody glove on the balcony stairwell, took her bow with one hand
  hidden, and stuffed the bloody cape in the trap room.
- **The prestige:** she framed her husband *knowing* he would rather go to prison than reveal how the
  Vanishing works. Corvin suspects her all along. He's not protecting the trick. He's protecting her.

### Structure
1. **Cold open:** the murder, from the dark.
2. **Office:** meet Ezra and Rosa. Iris hires Ezra. (Choice: cash retainer vs. pay-on-acquittal.)
3. **Investigation:** six locations, three Reads, a Tino side quest, three deductions.
4. **Trial:** Strand's opening and your opening gambit → Det. Brandt (objections + cross) → Benny the
   stagehand (objections + cross: the double is revealed) → **Recess dilemma** (keep the secret = bad
   ending / break the code / leak it to the press) → Iris on the stand → closing argument → confession → verdict.
5. **Epilogue hook:** a business card. *Silas Crane — Trial Consulting. "Every jury has a tell."*

---

## 5. Season plan (proposal — change freely)

| # | Case | Hook | New mechanic / theme |
|---|---|---|---|
| 1 | **The Vanishing Act** | Magician accused of murder during his own disappearing act. | Core systems. The double. |
| 2 | **Slip and Fall** | Ezra's most reliable *fake* injury client (he stages accidents for insurance money) is accused of a *real* hit-and-run. Ezra's own hands aren't clean. | **Plea bargaining**: negotiate with Strand under a timer. Saul-style moral choices with real consequences. |
| 3 | **The Séance** | A celebrity medium is accused of poisoning a client mid-séance. Ezra has to expose cold reading in court without exposing himself. | **Voir dire / jury selection**: read twelve strangers before trial. Silas Crane is consulting for the prosecution. |
| 4 | **House Rules** | A casino surveillance chief dies in a locked "eye in the sky" room. Every camera in Vegas saw nothing. | **Surveillance review**: scrub footage timelines. Return to Vegas, Ezra's past catches up. |
| 5 | **People v. Marcus Hale** | The retrial. Ezra must prove his own act helped convict an innocent man, and that Silas Crane engineered it. | **Ezra testifies.** The cross-examination is of *you*. Integrity vs. Notoriety decides how. |

### Open questions for the team
- How dark should the Silas Crane arc go? Is he a killer, or "just" a manipulator who ruins lives legally?
- Should Strand become an ally by Case 5? (Current lean: yes, reluctantly, because she's honest.)
- Branching: today choices change dialogue and the verdict report. Do we want truly divergent case
  outcomes (e.g. Case 2 can end in a guilty plea that carries into Case 5)?
- Art direction: keep the fully procedural vector style, or bring in an illustrator and swap the
  portrait renderer for hand-drawn sprites? The engine supports both. See README → *Swapping in real art*.
