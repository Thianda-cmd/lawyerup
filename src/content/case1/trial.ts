import { audio } from '../../engine/audio';
import { s } from '../../engine/dsl';
import { type Game, GameOver, type SceneFn } from '../../engine/game';
import { freshTrial } from '../../engine/state';
import type { CharId } from '../../engine/types';
import { type CrossExamDef, closingArgument, crossExam, directExam, testimony, verdictReport } from '../../systems/court';

function court(g: Game, witness: CharId | null): void {
  g.resetStage();
  void g.exec({ t: 'outfit', who: 'corvin', id: 'suit' });
  void g.exec({ t: 'outfit', who: 'iris', id: 'mourning' });
  g.enterCourt(witness);
}

// ---------------------------------------------------------------------------

export const trialOpen: SceneFn = async (g) => {
  g.state.trial = freshTrial();
  g.resetStage();
  await g.run(s`
    @outfit corvin suit
    @music investigate
    @bg courthouse
    @title San Querida County Courthouse | Tuesday, 9:41 AM
    @bg lobby
    @show corvin sad left
    @show rosa worried right
    rosa[worried]: The press is camped out on the steps. Every station in the county.
    corvin[sad]: Thirty years I begged them to cover my act. Now they come.
    ezra: Corvin. Whatever happens in there, follow my lead. Don't react. Don't speak. Don't do anything theatrical.
    corvin[smug]: You're asking a magician not to be theatrical?
    ezra: I'm asking a defendant not to be convicted.
    corvin[sad]: ...I trust you, Ezra. I'm just not sure I trust the *truth* to be kind.
    @hide all
    @wait 300
    @show strand cold center
    strand[cold]: So. You're the bus bench.
    ezra: "Need a lawyer? Need Vane." Catchy, right? Focus-grouped it myself.
    strand: I've read your file, Mr. Vane. Correspondence-school law degree. Two Bar complaints. And a former career as a *Las Vegas psychic*.
    ezra: Mentalist. Psychics claim it's magic. I just pay attention.
    strand[smug]: Then pay attention to this. I have tried forty-one cases. I have won forty-one cases.
    strand[cold]: Your client is going to be number forty-two.
    @hide strand
    ~ Helena Strand. Undefeated. And she's not bluffing — I read people for a living, and that woman believes every word she says.
    rosa[serious]: Ezra. It's time.
    @fade out 500
  `);
  court(g, null);
  await g.run(s`
    @bg court_judge instant
    @fade in 500
    @music trial
    @sfx gavel
    judge[stern]: Court is now in session for the trial of Corvin Mallory, charged with murder in the first degree.
    judge: Is the prosecution ready?
    strand[cold]: The People are ready, Your Honor.
    judge: And the defense? ...Mr. Vane, is it?
    ezra[smirk]: Ready, Your Honor. And may I say, that robe is very slimming.
    judge[stern]: You may not.
    judge: Ms. Strand. Your opening statement.
    strand[neutral]: Ladies and gentlemen. The defendant's act ends with a vanishing. For four minutes, he disappears — and eight hundred people wait in the dark for him to return.
    strand: On Friday night, during those four minutes, Leon Sable was beaten to death with the defendant's own award.
    strand[smug]: The People will show you the weapon. The motive. A cape soaked in the victim's blood. And an eyewitness who saw the defendant walk into that office.
    strand[cold]: Corvin Mallory's last trick was murder. Don't let him make the truth disappear too.
    judge: Mr. Vane. Your opening.
  `);
  const style = await g.choose(
    [
      { label: 'Plain and honest', value: 'honest', tag: 'HONEST', hint: '"The prosecution has a story. I’m going to show you where it doesn’t fit."' },
      { label: 'Showtime — vanish a coin in front of the jury', value: 'show', tag: 'GAMBIT', hint: 'Big swing with the jury. The judge will not love it. (Costs 1 Patience)' },
      { label: 'Go after Strand’s perfect record', value: 'attack', tag: 'RISKY', hint: '"Forty-one wins. Ask yourselves how many were the truth."' },
    ],
    { prompt: 'Twelve strangers in a box, and they’ve already heard a very good story. How do I open?' },
  );
  if (style === 'honest') {
    await g.run(s`
      ezra[serious]: Ladies and gentlemen. Ms. Strand just told you a story. It's a good one — she's very good.
      ezra: But a story isn't evidence. Over the next few hours, I'm going to show you exactly where hers doesn't fit.
      ezra: All I ask is that you keep watching. Especially when it gets uncomfortable.
      @stat integrity 1
      @jury 4
    `);
  } else if (style === 'show') {
    await g.run(s`
      ezra[smirk]: Ladies and gentlemen — a quarter. Ordinary. Watch it closely.
      @sfx magic
      @flash #fff3c4
      ezra[confident]: ...Gone. You saw it vanish. You didn't see where it went.
      ezra: Ms. Strand is about to show you a lot of coins vanishing. Keep asking yourself where they *really* went.
      @sfx crowd
      judge[stern]: Mr. Vane. This is a courtroom, not a lounge act in Reno.
      ezra: Funny you should mention Reno, Your Honor—
      judge[angry]: Consider that a warning.
      @warn
      @stat notoriety 1
      @jury 10
      ~ The jury is smiling. Juror four is checking her sleeve for the quarter. It's in her coat pocket.
    `);
  } else {
    await g.run(s`
      ezra[point]: Ms. Strand has won forty-one cases in a row. Impressive. Statistically, *suspiciously* impressive.
      ezra: Ask yourselves: in forty-one trials, was the truth always on her side? Or was she just always better at telling it?
      strand[mad]: Your Honor!
      judge[stern]: Careful, counselor. Opening statements are not an opportunity to put the prosecutor on trial.
      @stat notoriety 1
      @jury 6
      strand[cold]: ...Cute, Mr. Vane. I'll remember that.
    `);
  }
  await g.run(s`
    judge: Very well. Ms. Strand, call your first witness.
    strand[neutral]: The People call Detective Lyle Brandt.
  `);
  return 'c1_brandt_direct';
};

// ---------------------------------------------------------------------------

export const brandtDirect: SceneFn = async (g) => {
  court(g, 'brandt');
  await g.run(s`
    @bg court_witness instant
    @music trial
    brandt[neutral]: Lyle Brandt, Homicide Division, San Querida PD. Twenty-eight years.
    rosa[serious]: Ezra — she's going to walk him through the case. Listen to every line.
    rosa: If a question or an answer breaks the rules of evidence, hit *OBJECTION* and pick the grounds. The Handbook in the Court Record lists them.
    rosa[worried]: But object to a proper question, or pick the wrong grounds, and the jury will think we're desperate.
  `);
  await directExam(g, 'Det. Lyle Brandt', [
    { who: 'strand', text: 'Detective, please describe what you found in Mr. Sable’s office on Friday night.' },
    { who: 'brandt', text: 'The victim was on the floor beside his desk. One blow to the left temple. A brass award statuette was lying next to the body.' },
    {
      who: 'brandt',
      text: 'Whoever did it hated the man. You don’t hit somebody like that unless it’s personal.',
      improper: 'speculation',
      sustained: s`strand[annoyed]: ...Withdrawn. Let's stay with the facts, Detective.`,
    },
    {
      who: 'strand',
      text: 'And the defendant had been feuding with the victim for months — isn’t that right, Detective?',
      improper: 'leading',
      sustained: s`
        strand[cold]: Let me rephrase. What did you learn about the defendant's business relationship with the victim?
        brandt: Mallory's contract was up for renewal. Sable's own paperwork shows he wasn't planning to renew it.
      `,
    },
    {
      who: 'brandt',
      text: 'The theater janitor told me he heard Mallory shout, “I’ll kill you before I let you close this show.”',
      improper: 'hearsay',
      sustained: s`strand[annoyed]: The People will call the janitor separately if needed, Your Honor.`,
    },
    { who: 'strand', text: 'Did you recover anything else at the scene, Detective?' },
    { who: 'brandt', text: 'A cape. Black, red lining — the defendant’s costume. Soaked in blood and stuffed behind the machinery in the trap room.' },
    {
      who: 'strand',
      text: 'Detective, tell the jury everything you know about Corvin Mallory.',
      improper: 'narrative',
      sustained: s`strand[smug]: Withdrawn. I think the jury knows enough.`,
    },
  ]);
  await g.run(s`
    strand[smug]: Nothing further. Detective, please give the court your summary of the crime scene.
    judge: Proceed with your testimony, Detective.
  `);
  return 'c1_brandt_cross';
};

const BRANDT: CrossExamDef = {
  id: 'brandt',
  witness: 'brandt',
  title: 'The Crime Scene',
  done: (g) => g.flag('brandt_done'),
  statements: [
    {
      id: 'b1',
      text: 'The victim, Leon Sable, was killed in his office between 9:40 and 9:50 PM.',
      press: s`
        brandt: Coroner's estimate. And the stage manager's log puts the defendant's "vanishing" at 9:42 to 9:47. Right in the middle of the window.
        ezra: Or right underneath the stage.
        brandt[smug]: That's what he says.
      `,
    },
    {
      id: 'b2',
      text: 'He was struck once with the Golden Wand — an award belonging to the defendant.',
      press: s`
        brandt: The defendant gave it to Sable years ago. It sat on a plinth in that office. The killer grabbed it right off the shelf.
        ezra: So anyone who walked into that office could have grabbed it.
        brandt[smug]: Anyone could. Only one guy's prints are on it.
      `,
    },
    {
      id: 'b3',
      text: 'The defendant’s fingerprints were on that weapon. Fresh enough to convict.',
      press: s`
        brandt: The lab lifted his prints off the statuette. Clear as day.
        ezra: How fresh, Detective?
        brandt[annoyed]: Fresh enough. Read the report.
        ~ I did read the report. Maybe I should read it to him.
      `,
      present: {
        forensics: s`
          ezra[point]: Fresh? Detective, your own lab says otherwise!
          ezra: Page three. Corvin's prints were lifted from *beneath* a layer of settled dust — and *beneath* the blood.
          ezra: Dust takes weeks to settle. Those prints were left long before Friday. Corvin handed Sable that statuette nine years ago — of course his prints are on it!
          @sfx shock
          @shake 1
          brandt[shock]: ...!
          strand[mad]: Objection! The absence of fresh prints proves nothing, Your Honor — except that the defendant was careful enough to wear gloves.
          judge[stern]: Noted. But the jury will also note that the only prints on the weapon predate the murder.
          judge: Detective. Does the prosecution's case rest on those prints?
          brandt[annoyed]: ...No, Your Honor. It rests on the glove. We found the glove he wore.
          @flag brandt_prints
          @jury 12
        `,
      },
    },
    {
      id: 'b4',
      text: 'Mallory claims he was in the trap room the whole time. Nobody can confirm that.',
      press: s`
        brandt[smug]: One-man room under the stage. Convenient, isn't it? The only witness to his alibi is himself.
        ~ Nobody saw him down there... but somebody might have heard him.
      `,
      present: {
        cuesheet: s`
          ezra[point]: Nobody? The stage manager's cue log says otherwise. At 9:44:10, the smoke was fired — "from below."
          ezra: That machine is in the trap room, and it only fires by hand. Someone was down there at 9:44.
          brandt[smug]: Sure. He fired his smoke, climbed out and went upstairs to kill Sable. The office is a minute away.
          ~ ...He's not wrong. The smoke puts Corvin under the stage at 9:44:10 — but the window's wider than that. I'll need more than one puff of smoke.
          @flag smoke_noted
          @jury 4
        `,
      },
    },
    {
      id: 'b5',
      text: 'And his cape — soaked in Sable’s blood — was found hidden in that same trap room.',
      press: s`
        brandt: Behind the lift machinery. Black, red lining. You've seen the act.
        ezra: Corvin wore his cape for the bows at 9:50. In front of eight hundred people.
        brandt[annoyed]: So he's got a spare. Magicians love spares.
        ~ A spare... Hold that thought.
      `,
    },
    {
      id: 'b6',
      when: (g) => g.flag('brandt_prints'),
      text: 'The killer ditched one bloody glove in a trash bin on his way back to the trap room.',
      press: s`
        brandt: White silk stage glove. Right hand. Covered in Sable's blood.
        ezra: Where exactly was that trash bin, Detective?
        brandt: Stairwell landing. Back of the corridor.
        ~ The back of the corridor... I should check that against the layout of the theater.
      `,
      present: {
        floorplan: s`
          ezra[point]: On his way *back to the trap room*? Detective, look at the theater's own floor plan!
          ezra: The trap room is reached from the stage-left wing. The balcony stairwell is at the *far end* of the corridor — the opposite direction!
          ezra: Whoever dropped that glove wasn't heading back to the trap room. They were heading *up to the balcony*.
          @sfx shock
          @shake 1
          brandt[shock]: ...!
          strand[annoyed]: So he took the long way around. Murderers aren't known for their sense of direction.
          ezra: In the middle of his own act? With eight hundred people waiting for him to reappear? Why go to the balcony?
          ~ ...Unless whoever went up those stairs had a reason to be in the balcony at 9:46.
          judge[think]: An interesting question. Ms. Strand?
          strand[smug]: The People have something better than an answer, Your Honor. We have an eyewitness who saw the defendant walk into that office.
          @flag brandt_done
          @jury 12
        `,
      },
    },
  ],
  wrong: s`
    brandt[annoyed]: ...And?
    strand[smug]: The defense seems to be presenting evidence at random. Perhaps it's a magic trick.
  `,
};

export const brandtCross: SceneFn = async (g) => {
  court(g, 'brandt');
  await g.bg('court_witness', true);
  await testimony(g, BRANDT);
  if (!g.flag('tut_cross')) {
    g.setFlag('tut_cross');
    await g.run(s`
      rosa[serious]: Okay. Cross-examination. Step through his statements with the arrows.
      rosa: *Hold it!* presses a statement for details. *Exhibit* presents evidence when a statement contradicts it. *Read* spends Focus to catch a witness lying.
      rosa[worried]: Present the wrong thing and the jury slips. If they slide all the way... Corvin's done.
    `);
  }
  await crossExam(g, BRANDT);
  await g.run(s`
    judge: Thank you, Detective. You may step down.
    strand[cold]: The People call Benjamin Kowalski.
  `);
  return 'c1_benny_direct';
};

// ---------------------------------------------------------------------------

export const bennyDirect: SceneFn = async (g) => {
  court(g, 'benny');
  await g.run(s`
    @bg court_witness instant
    @music trial
    benny[nervous]: B-Benny Kowalski. Stagehand. I run the fly rail at the Paramount. Eleven years.
  `);
  await directExam(g, 'Benny Kowalski', [
    { who: 'strand', text: 'Mr. Kowalski, where were you at approximately 9:44 on Friday night?' },
    { who: 'benny', text: 'In the backstage corridor. Going to the, uh. The restroom.' },
    {
      who: 'strand',
      text: 'And you saw the defendant, clear as day, walk into Mr. Sable’s office — didn’t you?',
      improper: 'leading',
      sustained: s`
        strand[annoyed]: Mr. Kowalski. What did you see?
        benny: Corvin. In his cape. Going into Mr. Sable's office.
      `,
    },
    { who: 'strand', text: 'Did anyone else in the company wear that cape?' },
    { who: 'benny', text: 'No ma’am. Just Corvin. It’s his whole thing.' },
    {
      who: 'benny',
      text: 'Everybody knew Corvin and Mr. Sable were fighting about money. Corvin was gonna snap sooner or later.',
      improper: 'speculation',
      sustained: s`strand[cold]: The witness will confine himself to what he saw.`,
    },
    {
      who: 'strand',
      text: 'And when you saw a killer walk into that office, you must have been terrified.',
      improper: 'facts',
      sustained: s`strand[annoyed]: ...Rephrase. How did you feel, Mr. Kowalski? — Never mind. Nothing further.`,
    },
  ]);
  await g.run(s`
    judge: Mr. Kowalski, please tell the court what you saw that night.
  `);
  return 'c1_benny_cross';
};

const BENNY: CrossExamDef = {
  id: 'benny',
  witness: 'benny',
  title: 'What I Saw',
  done: (g) => g.flag('benny_done'),
  pressure: 10,
  noTell: "Nothing. Benny believes this part completely. He's wrong — but he isn't lying.",
  statements: [
    {
      id: 'k1',
      text: 'I was in the corridor around 9:44. Just... heading to the restroom.',
      press: s`
        benny[nervous]: When you gotta go, you gotta go! Is that a crime now?
        ~ The staff restroom is right off the stage-left wing. The corridor goes the other way. He's hiding something.
      `,
      read: {
        flag: 'benny_read',
        def: {
          char: 'benny',
          expr: 'nervous',
          line: 'I was just heading to the restroom. That’s all. Swear to God.',
          tell: 'eyes',
          meanings: [
            { label: "He's lying about why he was in the corridor.", correct: true },
            { label: "He's afraid of Corvin." },
            { label: "He's lying about seeing the cape." },
          ],
          insight: 'His eyes slid toward the door — toward the hallway where Sable kept his petty cash. That’s where he was going.',
        },
        success: async (g) => {
          await g.run(s`
            ezra[point]: The restroom, Mr. Kowalski? The staff restroom is next to the stage-left wing. You were at the opposite end of the building.
            ezra: Right outside Leon Sable's office. Where he kept the *petty cash box*.
            @shake 1
            benny[shock]: I — that's —
            benny[sweat]: OKAY! Okay! He owed me three weeks' pay! I was just gonna take what I was owed!
            @sfx crowd
            judge[stern]: Order! ...Mr. Kowalski. You were planning to steal from the victim?
            benny[cry]: I didn't take nothin'! I saw the cape go in, and I panicked, and I ran back to the rail!
          `);
          const how = await g.choose(
            [
              { label: '"Funny. The man robbing Sable is the one pointing fingers."', value: 'twist', tag: 'SHADY', hint: 'Destroy his credibility. The judge may not appreciate it. (Costs 1 Patience)' },
              { label: '"I’m not here to crucify you, Benny. Just tell it straight."', value: 'kind', tag: 'HONEST', hint: 'A frightened witness who trusts you tells you more.' },
            ],
            { prompt: 'Benny is coming apart. I could finish him off right now.' },
          );
          if (how === 'twist') {
            await g.run(s`
              ezra[smirk]: Funny, isn't it? The one man in that corridor with a reason to sneak into Sable's office is the one pointing fingers at my client.
              strand[mad]: Objection! Badgering!
              judge[stern]: Sustained. Mr. Vane, that's enough.
              @warn
              @stat notoriety 1
              @jury 8
              benny[cry]: ...
              ~ The jury's looking at him like he's the killer. He isn't. But that's not my job right now. ...Is it?
            `);
            g.setFlag('benny_twisted');
          } else {
            await g.run(s`
              ezra[serious]: I'm not here to crucify you, Benny. I'm here to find out what happened. Just tell it straight.
              benny[sad]: ...Yeah. Okay. Thanks, man. I'll tell it straight.
              @stat integrity 1
              @jury 4
            `);
          }
        },
      },
    },
    {
      id: 'k2',
      text: 'I saw Corvin go into Mr. Sable’s office. The cape, the collar, the red lining — it was him.',
      press: s`
        benny: I couldn't see his face — his back was to me. But nobody else wears that cape. Nobody.
        ezra: Nobody that you know of.
        benny[nervous]: ...What's that supposed to mean?
      `,
    },
    {
      id: 'k3',
      when: (g) => !g.flag('benny_still'),
      text: 'About a minute later he came out and went back down the hall, toward the trap room.',
      press: s`
        benny: Back toward the stage-left wing. Where the trap room ladder is. Where else would he go?
        ~ "Where else would he go." He's assuming. Did the camera see the same thing he did?
      `,
      present: {
        still: s`
          ezra[point]: Toward the trap room? Then explain this! The corridor camera. 9:44:31.
          ezra: The caped figure is walking *under the EXIT sign* — toward the balcony stairwell. Not the trap room. The other way!
          benny[sweat]: I — I didn't watch where he went! I just figured... where else would he go?
          ezra: Where else indeed.
          @flag benny_still
          @jury 10
        `,
      },
    },
    {
      id: 'k3b',
      when: (g) => g.flag('benny_still') && !g.flag('benny_height'),
      text: 'Okay, so maybe he went toward the stairs. It was still Corvin. Big guy, six-foot-two in that cape. Nobody else is that tall.',
      press: s`
        benny: Corvin's a tall guy! You've seen him! He's like a lamppost in a cape!
        ~ Six-foot-two. The still shows the figure under the EXIT sign, and Brandt marked how far below the sign its head was.
        ~ If I pin the still to what I know about Corvin on the *Deduction Board*, I can do the math.
      `,
      present: {
        ded_height: s`
          ezra[point]: Six-foot-two? Mr. Kowalski, look at the still again. The figure walks right under the EXIT sign.
          ezra: That sign is mounted at exactly seven feet — fire code. And the top of the figure's head is seventeen inches below it.
          ezra: Seven feet minus seventeen inches is *five-foot-seven*. Whoever you saw was seven inches shorter than Corvin Mallory!
          @sfx shock
          @shake 1.5
          benny[shock]: ...!!
          strand[shock]: ...!
          @sfx crowd
          judge[stern]: Order! Order in the court!
          strand[mad]: Camera angles distort, Your Honor! A slouch, a crouch —
          ezra[smirk]: Seven inches of slouch? In a flowing cape, walking briskly? Corvin Mallory has been standing up straight for thirty years. It's the whole act.
          @flag benny_height
          @jury 15
        `,
      },
    },
    {
      id: 'k4',
      text: 'After the show I went back to talk to Mr. Sable. That’s when I found him. 10:05.',
      press: s`
        benny[sad]: Door was open. He was just... lying there. I called 911. I didn't touch nothin'.
        benny: Mr. Sable was a cheapskate, but he didn't deserve that.
      `,
    },
    {
      id: 'k5',
      when: (g) => g.flag('benny_height'),
      text: 'But it was HIS cape! The red lining! It’s not like there’s TWO Corvins running around!',
      press: s`
        benny[mad]: One Corvin! One cape! That's how it works!
        ~ One cape... The bloody cape from the trap room is 52 inches. That empty hanger in Iris's dressing room said 52 inches too.
        ~ I should put those two side by side on the *Deduction Board*.
      `,
      present: {
        ded_cape: async (g) => {
          await g.run(s`
            ezra[serious]: Two Corvins, Mr. Kowalski? ...That's exactly what there were.
            @music pursuit
            ezra: The bloody cape from the trap room is fifty-two inches long. Corvin's cape — hanging clean in the costume rack on a hanger marked "C" — is fifty-eight.
            ezra: The bloody one came off the hanger right next to it. An empty hanger, tagged "D."
            ezra[confident]: Not C for Corvin. *D for Double*.
            ~ Of course. I should have seen it the moment I read the program. He vanishes from the cabinet at 9:42 and reappears in the balcony at 9:46.
            ~ No man can be in two places at once. So you don't use one man.
            ezra[point]: You use *two*!
            ezra: While Corvin was under the stage firing the smoke, someone else put on the second cape and walked down that corridor toward the balcony — to take his bow in the spotlight.
            ezra: *That's* who you saw, Mr. Kowalski. Not Corvin. *His double!*
            @sfx shock
            @shake 2
            benny[shock]: A... a double?!
            strand[shock]: ...!
            @sfx crowd
            judge[surprised]: Mr. Vane. Are you telling this court that the defendant's famous illusion requires a second performer?
            ezra: I'm telling the court that whoever wore that cape walked into Leon Sable's office at 9:44 — and then walked up to the balcony to take a bow. Wearing his blood.
            strand[mad]: Then name them! Who is this phantom double, Mr. Vane?
            ezra[serious]: The double is —
            corvin[angry]: STOP!!
            @shake 2.5
            corvin[angry]: Ezra — don't. Don't you DARE.
            @sfx crowd
            judge[angry]: Order! Mr. Mallory, sit down!
            judge[stern]: ...This court will take a fifteen-minute recess. Mr. Vane — speak to your client.
            @sfx gavel
            @flag benny_done
            @jury 15
          `);
        },
      },
    },
  ],
  wrong: s`
    benny[nervous]: Uh... what am I lookin' at?
    strand[smug]: The defense is showing the witness its scrapbook, Your Honor.
  `,
};

export const bennyCross: SceneFn = async (g) => {
  court(g, 'benny');
  await g.bg('court_witness', true);
  await testimony(g, BENNY);
  await crossExam(g, BENNY);
  return 'c1_recess';
};

// ---------------------------------------------------------------------------

export const recess: SceneFn = async (g) => {
  g.resetStage();
  await g.run(s`
    @outfit corvin suit
    @bg lobby
    @music sad
    @show corvin despair left
    @show rosa mad right
    corvin[despair]: You can't tell them, Ezra. You can't.
    ezra: Corvin, the double is your *alibi*! It proves you were under the stage!
    corvin[sad]: It's thirty years of my life. The Vanishing is the only thing I ever made that mattered. The moment the world learns how it's done, it dies.
    rosa[mad]: And if they don't learn, *you* die. In a cell!
    corvin[sad]: ...Then I'll die The Amazing Corvin.
    ~ He's lying. Not about loving the act. About *why* he's doing this.
  `);
  if (g.flag('read_corvin')) {
    await g.run(s`~ I saw it in the visiting room. His eyes went to the door. It was never the trick he was protecting. It's a person.`);
  }
  await g.run(s`
    ezra[serious]: Who plays your double, Corvin?
    corvin[shock]: ...
    corvin[cry]: Please. Please don't make me answer that.
    ~ He knows. Or he's afraid he knows. And he would rather go to prison than find out for certain.
    rosa[worried]: Ezra... he's your client. If he says keep the secret...
  `);
  const choice = await g.choose(
    [
      { label: 'Honor his wish. Keep the secret.', value: 'keep', tag: 'LOYAL', hint: 'He asked. You owe him that much.' },
      { label: 'Break the code. Call the double to the stand.', value: 'break', tag: 'HONEST', hint: 'Save the man, lose the friend?' },
      { label: 'Leak it to the press on the courthouse steps. Technically, you never said a word in court.', value: 'leak', tag: 'SHADY', hint: 'Loopholes are just doors nobody bothered to lock.' },
    ],
    { prompt: 'Fifteen minutes. Then I either name the double, or I let my client go to prison for a magic trick.' },
  );
  if (choice === 'keep') return 'c1_bad_end';
  g.setFlag(choice === 'break' ? 'recess_break' : 'recess_leak');
  if (choice === 'break') {
    await g.run(s`
      ezra[serious]: I'm sorry, Corvin. My job is to keep you out of prison. Even if you hate me for it.
      corvin[cry]: ...Then you'll have done your job, Ezra. And I will hate you for it.
      @stat integrity 2
      @stat trust -1
      ~ I know who I'm going to call. I think I've known since the dressing room.
    `);
  } else {
    await g.run(s`
      ezra[smirk]: Rosa. Do you still have the number for that producer at Channel 6?
      rosa[surprised]: Ezra, you are NOT —
      @fade out 400
      @bg courthouse instant
      @fade in 400
      : Two minutes later, on the courthouse steps, an "anonymous source close to the defense" explains The Vanishing to six news cameras.
      @fade out 400
      @bg lobby instant
      @fade in 400
      @show corvin angry left
      corvin[angry]: You — weaselly — *Reno* — CARD SHARP!
      ezra: I didn't say a word in court, Corvin. It's public knowledge now. Anyone can call the double.
      corvin[sad]: ...You haven't changed at all, have you?
      @stat notoriety 2
      ~ The secret's out. Nobody can say I broke it on the record. ...That's the kind of win that keeps you up at night.
    `);
  }
  return 'c1_iris';
};

export const badEnd: SceneFn = async (g) => {
  court(g, null);
  await g.run(s`
    @bg court_judge instant
    @music sad
    judge[stern]: Mr. Vane. Before the recess you were about to name a second performer.
    ezra[sad]: ...The defense withdraws the suggestion, Your Honor.
    @sfx crowd
    strand[smug]: Then the People rest.
    : The jury was out for forty minutes.
    @sfx gavel
    judge[sad]: On the charge of murder in the first degree, the jury finds the defendant, Corvin Mallory... *guilty*.
  `);
  g.leaveCourt();
  await g.run(s`
    @hide all
    @bg detention
    @outfit corvin jail
    @show corvin sad center
    corvin[sad]: Don't look like that, Ezra. You kept my secret. That's more than most men ever do for me.
    corvin[smile]: The Vanishing will die with me. As it should.
    : Iris Mallory left San Querida the following week.
    : She was never seen in the balcony again.
  `);
  throw new GameOver('story', 'BAD END: The Final Bow');
};

// ---------------------------------------------------------------------------

const IRIS: CrossExamDef = {
  id: 'iris',
  witness: 'iris',
  title: 'The Balcony',
  done: (g) => g.flag('iris_done'),
  pressure: 10,
  penalty: 14,
  statements: [
    {
      id: 'i1',
      text: 'For the Vanishing, I slip into the second cape in the wings and go straight to the balcony for the 9:46 reveal.',
      press: s`
        iris[neutral]: The audience sees a silhouette in a blinding spotlight. Arms thrown wide. They never see a face. Corvin and I rehearsed it a thousand times.
        ~ Arms thrown wide. Both arms.
      `,
      present: {
        photo: async (g) => {
          if (g.flag('iris_photo')) {
            await g.run(s`iris[cold]: You've made your point about the photograph, Mr. Vane.`);
            return;
          }
          await g.run(s`
            ezra[point]: Arms thrown wide? A fan photographed your reveal at 9:46, Mrs. Mallory. One white glove raised in the spotlight.
            ezra: The *right* hand stays hidden inside the cape. The right-hand glove was found in a trash bin on the balcony stairwell — covered in Leon Sable's blood.
            iris[nervous]: ...I had a cramp. It happens.
            strand[sweat]: ...
            @flag iris_photo
            @jury 8
          `);
        },
      },
    },
    {
      id: 'i2',
      text: 'It’s a long way up. It takes every second of those four minutes. I barely make my cue.',
      press: s`
        iris[smile]: Down the corridor, up all those stairs, in heels and a cape. I'm always breathless by the time the spotlight hits me.
        ~ "Every second." Rosa might have something to say about that.
      `,
      present: {
        stopwatch: s`
          ezra[point]: Every second? My investigator timed that route herself. Wing to balcony: one minute, thirty-two seconds. Walking.
          ezra: Leave the wing at 9:42, and you're in the balcony by 9:44 — with two full minutes to spare.
          ezra: Two minutes, Mrs. Mallory. Exactly long enough to walk into an office... and walk out again.
          iris[nervous]: I... take my time. A performer has to compose herself before an entrance.
          @flag iris_time
          @jury 12
        `,
      },
    },
    {
      id: 'i3',
      text: 'I didn’t stop anywhere along the way. I certainly never went into Leon’s office.',
      press: s`
        iris[sad]: Leon was family. I'd never have interrupted him during a show.
      `,
      read: {
        flag: 'iris_read',
        def: {
          char: 'iris',
          expr: 'neutral',
          line: 'I never went into Leon’s office. Not that night. Not during the show.',
          tell: 'mouth',
          meanings: [
            { label: "She's lying — she went into the office.", correct: true },
            { label: "She's grieving and trying not to cry." },
            { label: "She's angry at Corvin for dragging her into this." },
          ],
          insight: 'Her lips pressed white on “never.” That’s the body physically holding words in. She went into that office.',
        },
        success: s`
          ezra[serious]: You went into his office, Iris. You can say it.
          iris[cold]: ...Prove it, darling.
          ~ That's not the voice of a grieving widow. That's the voice of someone counting cards.
          @jury 6
        `,
      },
    },
    {
      id: 'i4',
      when: (g) => !g.flag('iris_tag'),
      text: 'After the reveal, I hung my cape back on its rack, like always. It’s there now, if you’d like to check.',
      press: s`
        iris[smile]: Right next to Corvin's. "C" and "D." We're very organized.
        ~ Organized. Then let's check the organization.
      `,
      present: {
        tag: s`
          ezra[point]: Back on its rack? Then why is the hanger tagged "D — 52 in." *empty*?
          ezra: Your cape never went back on that rack, Mrs. Mallory. It went into the trap room — soaked in blood — where the police would find it and blame your husband.
          @sfx shock
          @shake 1.5
          iris[shock]: ...!
          @flag iris_tag
          @jury 12
        `,
        ded_cape: s`
          ezra[point]: Back on its rack? The bloody cape is fifty-two inches — your "D" cape. And its hanger is *empty*.
          ezra: Your cape never went back on that rack. It went into the trap room, soaked in Leon Sable's blood, where it would be blamed on your husband.
          @sfx shock
          @shake 1.5
          iris[shock]: ...!
          @flag iris_tag
          @jury 12
        `,
      },
    },
    {
      id: 'i5',
      when: (g) => g.flag('iris_tag') && !g.flag('iris_glitter'),
      text: 'Then someone stole my cape after the show to frame us! Benny, maybe — he admitted he was sneaking around!',
      press: s`
        iris[nervous]: Anyone could have taken it off the rack while we were taking our bows! Anyone!
        ~ Anyone could have taken it. But the lab found something on that cape that not just anyone would leave behind.
        ~ "Gold particulate" on the collar. And a jar of gold glitter on her vanity. That's a job for the *Deduction Board*.
      `,
      present: {
        ded_glitter: s`
          ezra[point]: Then explain *this*. The lab found flecks of gold inside the collar of the bloody cape.
          ezra: Gold body glitter. The kind you wear with your sequined costume. The kind that's *still on your collarbone* right now, three days later.
          @sfx shock
          @shake 2
          iris[shock]: ...!!
          ezra: Benny Kowalski doesn't wear gold glitter. Corvin doesn't wear gold glitter. The last person to wear that cape wore *your makeup*, Mrs. Mallory.
          iris[breakdown]: ...
          strand[sweat]: ...
          @flag iris_glitter
          @jury 15
        `,
      },
    },
    {
      id: 'i6',
      when: (g) => g.flag('iris_glitter'),
      text: 'Very clever. But why would I hurt Leon? He was family. I had no reason in the world.',
      press: s`
        iris[cold]: Motive, Mr. Vane. Even a correspondence-school lawyer knows a jury wants a motive.
        ~ Forty thousand dollars of motive, sitting in Sable's safe.
      `,
      present: {
        ledger: s`
          ezra[point]: No reason? Leon Sable's ledger, from his safe. Forty thousand dollars missing from the box office.
          ezra: His last entry, Friday night: "Confront M. after the show. Then police."
          ezra: The prosecution assumed M meant Mallory — Corvin. But Corvin never touched the box office. He can't balance a checkbook.
          ezra[point]: The person who handled every dollar that show ever made was its company manager. *Iris Mallory!*
          @sfx shock
          @shake 2.5
          iris[despair]: ...!!
          @flag iris_done
          @jury 12
        `,
      },
    },
  ],
  wrong: s`
    iris[smile]: Is that supposed to frighten me, darling?
    strand[annoyed]: The defense is wasting the court's time, Your Honor.
  `,
};

export const irisScene: SceneFn = async (g) => {
  court(g, 'iris');
  await g.bg('court_judge', true);
  await g.run(s`
    @music trial
    @sfx gavel
    judge: Court is back in session.
  `);
  if (g.flag('recess_leak')) {
    await g.run(s`
      judge[stern]: Mr. Vane. During the recess, I glanced at my phone. Every news site in the county is explaining how The Vanishing works.
      judge[angry]: An "anonymous source close to the defense." Do you take me for a fool?
      ezra[sweat]: Never, Your Honor. A very perceptive man. In a very slimming robe.
      @warn
    `);
  }
  await g.run(s`
    judge: Mr. Vane, before the recess, you were about to name someone.
    ezra[serious]: Yes, Your Honor. The defense calls... *Iris Mallory* to the stand.
    @sfx crowd
    corvin[despair]: ...
    strand[surprised]: The defendant's *wife*?
    iris[sad]: Hello, Ezra.
    iris: Corvin would never forgive me for saying this out loud. But I won't let my husband go to prison for a secret.
    iris[neutral]: Yes. I am the double. For nine years, I have been The Amazing Corvin for two minutes a night.
    ~ She's getting ahead of it. Admit the part you can't hide, and build a wall around the rest.
    judge: Mrs. Mallory, please tell the court what you did during The Vanishing on Friday night.
  `);
  await testimony(g, IRIS);
  await crossExam(g, IRIS);
  await g.run(s`
    iris[breakdown]: ...
    iris[cold]: ...Circumstantial. All of it. Glitter and hangers and stopwatches.
    iris: Nobody saw me. Corvin was alone under that stage — you can't prove a thing, Mr. Vane.
    judge: Ms. Strand? Does the prosecution have anything to add?
    strand[sweat]: ...The People... would like to hear the defense's closing, Your Honor.
    ~ Strand isn't defending Iris. She's waiting to see if I can close the door. Fine.
    judge: Mr. Vane. Make your argument to the jury.
  `);
  return 'c1_closing';
};

// ---------------------------------------------------------------------------

export const closing: SceneFn = async (g) => {
  court(g, 'iris');
  await g.bg('court_defense', true);
  await g.run(s`
    ezra[serious]: Ladies and gentlemen. Let me show you how The Vanishing really works.
  `);
  await closingArgument(g, [
    {
      claim: 'First: at 9:44, Corvin Mallory was exactly where he said he was — beneath the stage. And the theater itself proves it.',
      answer: ['cuesheet'],
      success: s`
        ezra[point]: The stage manager's cue log. 9:44:10 — smoke fired *from below*, by hand, from the trap room.
        ezra: At the moment the killer was walking down that corridor, Corvin was under the stage, doing his job. He has never missed a cue in nine years.
      `,
    },
    {
      claim: 'Second: the caped figure in the corridor at 9:44:31 could not have been Corvin Mallory.',
      answer: ['ded_height'],
      success: s`
        ezra[point]: Seven feet to the EXIT sign. Seventeen inches to the top of the figure's head. Five-foot-seven.
        ezra: Corvin is six-foot-two. You can't fake seven inches in a cape.
      `,
    },
    {
      claim: 'Third: the cape soaked in Leon Sable’s blood was never Corvin’s. It was made for someone else.',
      answer: ['ded_cape', 'tag'],
      success: s`
        ezra[point]: Fifty-two inches. The "D" cape. The double's cape — six inches too short for Corvin, and its hanger empty.
      `,
    },
    {
      claim: 'And finally: the last person to wear that cape left something of themselves behind.',
      answer: ['ded_glitter', 'glitter'],
      success: s`
        ezra[point]: Gold stage glitter, inside the collar. The same glitter Iris Mallory wears onstage — the same glitter that's on her skin today.
        ezra[serious]: Corvin Mallory vanished on Friday night. But he didn't kill Leon Sable. His shadow did.
      `,
    },
  ]);
  return 'c1_verdict';
};

// ---------------------------------------------------------------------------

export const verdict: SceneFn = async (g) => {
  court(g, 'iris');
  await g.bg('court_witness', true);
  await g.run(s`
    @music stop
    iris[breakdown]: Stop.
    iris[breakdown]: Stop it. Stop. *STOP.*
    @shake 1.5
    @wait 500
    @music sad
    iris[cry]: Do you know what it's like to be someone's shadow for nine years? Two minutes a night in his spotlight. And the rest of the time... the bills.
    iris[sad]: The show was dying, Ezra. Half-empty houses. Corvin never saw the numbers. I made sure he never had to.
    iris: I borrowed from the box office to keep the lights on. I was going to put it all back. Every dollar.
    iris: Leon found out. He told me he'd call the police after the show. Nine years, and he was going to destroy us over *money*.
    iris[cry]: I went in to beg him. During the Vanishing — I had two minutes. He laughed at me. And the Golden Wand was right there on the shelf...
    corvin[cry]: Iris...
    iris[cold]: Then I walked up to the balcony and took my bow. And afterward, I left the cape where they'd find it.
    iris: Because I know my husband. He would rather rot in a cell than tell the world how The Vanishing is done.
    iris[sad]: I counted on it, darling. I'm so sorry. I counted on you.
    corvin[despair]: ...
    corvin[cry]: ...I would have, too.
    @wait 600
    judge[sad]: ...Bailiff. Take Mrs. Mallory into custody.
    strand[cold]: Your Honor. In light of this testimony, the People move to dismiss all charges against Corvin Mallory.
    strand: ...Forty-one and one, Mr. Vane. Don't get used to it.
    judge: Given the circumstances, I'll ask the jury for its verdict on the record.
    [Jury Foreman]: We, the jury, find the defendant, Corvin Mallory...
    @music stop
    @wait 500
    [Jury Foreman]: ...*Not guilty*.
    @sfx gavel
    @flash #fff3c4
    @sfx crowd
  `);
  g.leaveCourt();
  const lines: string[] = [];
  if (g.flag('recess_leak')) lines.push('The Vanishing is on every news site in the county. Your phone hasn’t stopped ringing.');
  else lines.push('You broke the magician’s code — and saved the magician.');
  if (g.flag('benny_twisted')) lines.push('Benny Kowalski was fired on Monday. He hasn’t returned your calls.');
  else if (g.flag('benny_read')) lines.push('Benny Kowalski got his three weeks’ back pay. Corvin insisted.');
  if (g.flag('iris_photo')) lines.push('A fan’s phone photo became Defense Exhibit 14.');
  if (g.state.stats.money > 3000) lines.push('For once, the rent is paid on time.');
  await verdictReport(g, { title: 'CASE 1 • THE VANISHING ACT', verdict: 'NOT GUILTY', lines });
  return 'c1_epilogue';
};

export const epilogue: SceneFn = async (g) => {
  g.resetStage();
  audio.music('office');
  await g.run(s`
    @bg office
    @title Vane & Associates | Tuesday, 7:30 PM
    @outfit corvin suit
    @show corvin sad left
    @show rosa smile right
    corvin[sad]: I came to say thank you. And to say that I'm still very angry with you.
    ezra: That seems fair.
    corvin: I'll never perform The Vanishing again. Without her, there is no trick. There never was.
    corvin[smile]: But you were right, all those years ago in Reno. You do have good hands.
    corvin: Keep the program. The last show of The Amazing Corvin. ...Probably.
    @hide corvin
    @wait 300
    rosa[smile]: Not bad for a bus bench.
    ezra: Not bad for a paralegal who doesn't get paid.
    rosa[annoyed]: About that.
    rosa[think]: Oh — a courier dropped this off for you at the courthouse. No name. Just "For the Great Vane."
  `);
  await g.run(s`
    : It's a business card. Heavy stock, black, embossed in silver.
    : SILAS CRANE — TRIAL CONSULTING. "Every jury has a tell."
    : On the back, in handwriting Ezra hasn't seen in ten years: "Nice reading today, kid. Let's catch up. — S."
    @music tension
    rosa[worried]: Ezra? You've gone white.
    ~ Silas Crane. The voice in my earpiece. The man who fed me every "psychic" answer I ever gave on stage.
    ~ The man who turned a grieving widow's trust in me into a murder conviction. Marcus Hale has been in prison for eleven years because of what we did.
    ~ Ten years I've been hiding in a strip mall. And Silas just found me.
    ezra[serious]: ...Rosa. Clear my calendar.
    rosa[surprised]: Your calendar is clear. It's always clear.
    ezra[serious]: Then clear it harder.
    @fade out 900
  `);
  await g.caseCard('CASE 1 — CLOSED', 'Three Weeks Later', 'Case 2: Chain of Custody');
  return 'c2_cold_open';
};
