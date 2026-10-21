# Lawyer Up! — Game Design & Story Bible

> A 2D narrative courtroom game about **Ezra Vane**: an ex-Las-Vegas "psychic" who reads people
> for a living, now a strip-mall defense attorney with a bus-bench ad and a conscience he can't afford.
> Think *Better Call Saul*'s hustle and moral grey zone, crossed with *The Mentalist*'s
> cold-reading showmanship. And under every case, a long con that started ten years ago.

This document holds the pitch, the cast, the systems and the season plan. **Everything here is a
proposal.** Cases 1 and 2 are written and playable. The rest is meant to be argued over and changed.

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
| **Teo Quintero** | Rosa's brother | Case 2's client, now the office's unpaid intern. |
| **Sgt. Ray Kessler** | Case 2 antagonist | Decorated narcotics cop recycling "destroyed" evidence. Coached for years by Crane. |
| **Councilwoman Diane Whitfield** | Grieving mother | Starts Case 2 demanding the maximum for Teo; ends it publishing her daughter's exposé. |
| **Dr. Priya Nand / Ofc. Luis Ortega** | Insiders | The chemist and the rookie cop who each refuse to leave one thing out. |

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

## 5. Case 2 — *Chain of Custody* (playable)

**Client:** Mateo "Teo" Quintero, 19, **Rosa's little brother**. Community college student, delivery driver,
sells his own Adderall to classmates during finals (not a saint, not a dealer).
**Victim:** Chloe Whitfield, 20, student journalist, daughter of Councilwoman Diane Whitfield (running for
mayor on an anti-fentanyl platform).
**Charge:** Drug-induced homicide: if you distribute a drug and someone dies, it's homicide, regardless of intent.

### The truth (spoilers)
- Chloe was eight months sober and writing "The Blue Pipeline," an exposé tracing campus fentanyl pills to
  **Jonah "Jojo" Pratt**, who is secretly **CI-417**, the informant of **Sgt. Ray Kessler** (SQPD Narcotics,
  Officer of the Year twice).
- Kessler signs off on seized pills as "destroyed" (burn log, case #24-1187) and recycles them through Jojo.
  Arrests of small fry keep his numbers up.
- Chloe recorded Jojo bragging ("my guy's a cop, the evidence room's my warehouse") and told him it would run
  Monday. Jojo called Kessler (11:52 PM). Kessler said "handle it." Jojo dissolved fentanyl in her drink and
  planted half a pill in her purse.
- Kessler grabbed the case, found "blues" and a $40 Venmo on Chloe's phone, and planted pills in Teo's car on a
  pretext traffic stop. His bodycam started late. His rookie partner Ortega's camera didn't.
- **The prestige:** Silas Crane, the prosecution's jury consultant, coached Kessler's testimony for years.
  Chloe's notes had his initials. Crane fed Ezra hints ("ask him about the fire") so that Ezra would destroy
  Kessler's credibility before Kessler could trade Crane for a deal. Ezra won Teo's freedom, and served
  Crane's interests while doing it.

### Realistic legal beats
| Beat | Mechanic | What it teaches |
|---|---|---|
| Motion to suppress | Cross-examine the officer about the stop, then pick the legal grounds for the written motion | Fourth Amendment: a pretext stop, the smell of legal cannabis, consent that only appears at the hearing, "plain view" |
| Plea negotiation | Wear the offer down with leverage from the investigation; read the prosecutor to reach her true floor; accept (alternate ending) or go to trial | Most cases end in a plea; leverage is evidence |
| Jury selection | One question per juror, Reads on their faces, two strikes; the prosecution's consultant strikes too; one juror is a plant lying about police ties | Voir dire, peremptory strikes, hidden bias |
| Trial | Chemist (chain of custody, die marks, gastric contents), informant (alibi GPS, party video, voice memo), sergeant (burner call, partner's bodycam, burn log, storage unit) | Brady material, informant reliability, evidence-room corruption, the Fifth Amendment |

### Choices
Promise Rosa vs. tell her the odds · Teo's Adderall: truth vs. bury it · Ortega: protect vs. pressure ·
the storage unit: wait for a warrant vs. Tino's lockpicks · the opening gambit · ask Crane about "S.C."
The plea offer, if accepted, ends the case early with its own ending.

---

## 6. Season plan (proposal — change freely)

| # | Case | Hook | New mechanic / theme |
|---|---|---|---|
| 1 | **The Vanishing Act** ✅ | Magician accused of murder during his own disappearing act. | Core systems. The double. |
| 2 | **Chain of Custody** ✅ | Rosa's brother charged with drug-induced homicide; a narcotics sergeant recycles "destroyed" pills. | Suppression hearing, plea negotiation, jury selection vs. Crane. |
| 3 | **The Séance** | A celebrity medium is accused of poisoning a client mid-séance. Ezra has to expose cold reading in court without exposing himself. | Ezra's past goes public. Crane consults for the defense this time. |
| 4 | **House Rules** | A casino surveillance chief dies in a locked "eye in the sky" room. Every camera in Vegas saw nothing. | Surveillance timelines. Return to Vegas. |
| 5 | **People v. Marcus Hale** | The parole hearing and retrial. Ezra must prove his own act helped convict an innocent man, and that Silas Crane engineered it. | **Ezra testifies.** The cross-examination is of *you*. Integrity vs. Notoriety decides how. |

### Open questions for the team
- How dark should the Silas Crane arc go? After Case 2 he is clearly manipulating events. Is he a killer, or
  "just" a man who ruins lives legally?
- Strand is now an uneasy ally. Should she prosecute Hale's retrial against Ezra, or switch sides?
- Should Case 2's choices (warrant vs. Tino, Ortega) carry into Case 3? Kessler's lawyer attacking Tino's
  photos would be a natural Case 3 subplot.
- Art direction: keep the fully procedural vector style, or bring in an illustrator? The engine supports both.
