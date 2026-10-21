import { s } from '../../engine/dsl';
import { type Game, GameOver, type SceneFn } from '../../engine/game';
import { freshTrial } from '../../engine/state';
import type { CharId } from '../../engine/types';
import { type CrossExamDef, argueMotion, crossExam, negotiate, testimony } from '../../systems/court';

export function court2(g: Game, witness: CharId | null, opts: { bench?: boolean } = {}): void {
  g.resetStage();
  void g.exec({ t: 'outfit', who: 'teo', id: 'court' });
  void g.exec({ t: 'outfit', who: 'kessler', id: 'tactical' });
  void g.exec({ t: 'outfit', who: 'jojo', id: 'court' });
  void g.exec({ t: 'outfit', who: 'nand', id: 'lab' });
  g.court.bench = Boolean(opts.bench);
  g.enterCourt(witness);
}

// ---------------------------------------------------------------------------
// Suppression hearing

const STOP: CrossExamDef = {
  id: 'c2_stop',
  witness: 'kessler',
  title: 'The Stop',
  pressure: 6,
  done: (g) => g.flag('h_stop') && g.flag('h_odor') && g.flag('h_consent'),
  noTell: 'Nothing. He’s told this version so many times he half believes it.',
  statements: [
    {
      id: 'h1',
      text: 'At 10:19 Sunday morning, I observed a silver Honda roll through the stop sign at Alvarado and Fifth.',
      press: s`
        kessler[smirk]: Rolled right through it. Didn't so much as tap the brakes. Nineteen years on the job, counselor. I know a rolling stop.
        ~ Teo says he counted to three out loud. Something that recorded his driving would settle it.
      `,
      present: {
        c2_telemetry: s`
          ezra[point]: Didn't tap the brakes? Sergeant, Teo's delivery app records his driving for its insurance company. Every second.
          ezra: At 10:19 at Alvarado and Fifth, his car was at zero miles an hour for three point two seconds. That is a full stop.
          @sfx shock
          @shake 1
          kessler[shock]: ...!
          strand[surprised]: ...
          kessler[mad]: A phone app. You want to take a phone app's word over a decorated officer's?
          judge[stern]: I'll take a calibrated record over anyone's memory, Sergeant. Continue.
          @flag h_stop
          @jury 12
        `,
      },
    },
    {
      id: 'h2',
      text: 'When I approached the driver’s window, I detected a strong odor of marijuana.',
      press: s`
        kessler: Distinct. Skunky. Anybody who's worked narcotics knows that smell.
        ~ If the car smelled like weed, there'd be weed. Or ash. Or something.
      `,
      present: {
        c2_inventory: s`
          ezra[point]: A strong odor. Then explain the tow yard's inventory: no cannabis, no paraphernalia, no ash, no odor noted.
          ezra: And Teo's blood at booking was negative for THC. Your strong odor left no trace, in the car or in the driver.
          kessler[sweat]: Odor dissipates.
          ezra: Faster than a delivery driver with asthma, apparently.
          @flag h_odor
          @jury 12
        `,
      },
    },
    {
      id: 'h3',
      text: 'Under the law, that odor gave me probable cause to search the vehicle.',
      press: async (g) => {
        await g.run(s`
          ezra: Which law, Sergeant? The one from before cannabis was legal in this state?
          kessler[annoyed]: The law's the law, counselor.
          strand[think]: ...
          ~ The courts here have said it: once cannabis is legal, the smell of it alone isn't probable cause. Kessler is citing a rule that no longer exists. I can use that in the motion.
        `);
        g.setFlag('h_law');
      },
    },
    {
      id: 'h4',
      text: 'On top of that, the defendant consented to the search. He said, "Go ahead."',
      press: s`
        kessler: "Go ahead." Clear as day.
        ezra: Is that on your body camera?
        kessler[neutral]: Camera came on a little after. They glitch. Happens all the time.
        ~ "A little after." His report says activated upon contact. And there were two officers on that stop.
      `,
      present: {
        c2_report: s`
          ezra[point]: "Go ahead"? Then why isn't it in your own report, Sergeant?
          ezra: You wrote the basis for the search yourself: "probable cause, odor of cannabis." The word consent does not appear anywhere. You added it this morning, because you knew the odor wasn't going to hold.
          @sfx shock
          @shake 1.5
          kessler[angry]: ...!!
          judge[stern]: Sergeant. Did the defendant consent, or didn't he?
          kessler[sweat]: ...It's my recollection that he did, Your Honor.
          judge[stern]: Your recollection was not in your report.
          @flag h_consent
          @jury 14
        `,
      },
    },
    {
      id: 'h5',
      text: 'I found twelve tablets in plain view, under the passenger seat.',
      press: async (g) => {
        await g.run(s`
          ezra: In plain view. Under a seat.
          kessler[annoyed]: Once I was looking, they were plain to see.
          ~ Plain view means you can see it without searching. Nobody can see under a seat without searching. That's another argument for the motion.
        `);
        g.setFlag('h_plain');
      },
    },
  ],
  wrong: s`
    kessler[smirk]: Is that it? I've had parking tickets with more bite.
    judge[annoyed]: Mr. Vane, is there a point?
  `,
};

export const hearing: SceneFn = async (g) => {
  g.state.trial = freshTrial();
  court2(g, 'kessler', { bench: true });
  await g.run(s`
    @bg court_judge instant
    @music trial
    @title Courtroom 3 | Wednesday, 9:00 AM
    @sfx gavel
    judge[stern]: We're here on the defense's motion to suppress all evidence obtained from the stop and search of the defendant's vehicle. Mr. Vane, it's your motion.
    ezra[serious]: Your Honor, the defense calls Sergeant Ray Kessler.
    ~ No jury today. Just Judge Okafor, deciding whether twelve blue pills ever get mentioned in front of one.
    ~ If the stop was illegal, everything that came out of it is "fruit of the poisonous tree." The pills go away. If it was legal, Teo goes into his murder trial with fentanyl under his seat.
    kessler[friendly]: Morning, Judge. Ray Kessler, SQPD Narcotics, nineteen years.
    rosa[serious]: Ezra. Same rules as always. But today the meter's the judge, not a jury. Don't waste his patience.
  `);
  await testimony(g, STOP);
  await crossExam(g, STOP);
  await g.run(s`
    judge[think]: Thank you, Sergeant. You may step down. Mr. Vane, argue your motion. Be precise.
    ~ Three arguments. The best three. A judge remembers the weakest thing you say.
  `);
  for (let attempt = 0; ; attempt++) {
    const { good, bad } = await argueMotion(g, {
      title: 'Motion to Suppress Evidence — People v. Quintero',
      prompt: 'Choose up to three grounds. Only argue what the hearing actually established.',
      pick: 3,
      args: [
        { id: 'stop', label: 'There was no lawful basis for the stop', detail: 'The telemetry shows a full stop. An unlawful stop taints everything that follows.', valid: (x) => x.flag('h_stop') },
        { id: 'odor', label: 'The odor of legal cannabis is not probable cause', detail: 'Cannabis is legal for adults, nothing was found, and Teo tested negative.', valid: (x) => x.flag('h_odor') || x.flag('h_law') },
        { id: 'consent', label: 'There was no valid consent', detail: 'The report lists odor as the only basis. "Consent" appeared for the first time today.', valid: (x) => x.flag('h_consent') },
        { id: 'plain', label: 'The tablets were not in plain view', detail: 'They were under a seat. Finding them required a search.', valid: (x) => x.flag('h_plain') },
        { id: 'record', label: 'Teo has no record and a loving family', detail: "He's a good kid from a good home.", valid: () => false },
        { id: 'plant', label: 'Sergeant Kessler planted the pills', detail: 'Someone put them there. It had to be him.', valid: () => false },
        { id: 'texts', label: "The affidavit misquotes Teo's texts", detail: 'The denial was cut from the quoted conversation.', valid: () => false },
      ],
    });
    for (const id of bad) {
      if (id === 'record') await g.say('judge', "Character is for sentencing, Mr. Vane. This is a Fourth Amendment motion. Whether he's a nice boy has nothing to do with whether the stop was lawful.", { expr: 'annoyed' });
      if (id === 'plant') await g.say('judge', 'That is an extraordinary accusation against a police officer, counselor, and nothing in this hearing supports it. Withdraw it, or prove it at trial.', { expr: 'stern' });
      if (id === 'texts') await g.say('judge', "Whatever the affidavit says, it isn't what this motion is about. The question today is the stop and the search. Save the texts for the jury.", { expr: 'annoyed' });
    }
    if (bad.length) await g.warn();
    if (good.length >= 2) {
      g.setFlag('motion_granted');
      await g.run(s`
        judge[stern]: The court has heard enough.
        judge: The defendant's driving data shows a complete stop. The claimed odor left no trace. The claimed consent appears nowhere in the officer's own report.
        judge[angry]: I'm troubled, Sergeant Kessler. Deeply troubled.
        @sfx gavel
        @burst granted
        judge[stern]: The motion is granted. All evidence obtained from the stop and search of the defendant's vehicle is suppressed.
        @sfx crowd
      `);
      break;
    }
    await g.run(s`
      judge[annoyed]: I'm not persuaded, counselor. Not on those grounds. You have one more chance to tell me what this hearing actually showed.
      @jury -12
    `);
    if (attempt >= 1) await g.say('ezra', "Think. What did I actually break on the stand? The stop. The smell. The consent. Plain view, if I pressed it.", { thought: true });
  }
  await g.run(s`
    strand[cold]: Your Honor, the People will proceed on count one. The pills from the car were never the heart of this case.
    ezra: Your homicide case is built on a "dealer" with no drugs, Ms. Strand.
    strand[smug]: It's built on the fragment from the victim's purse. And an eyewitness. The People will call a confidential informant who has agreed to testify publicly: Jonah Pratt.
    ~ Jonah Pratt. A confidential informant. Kessler's informant.
    kessler[cold]: ...
    ~ Kessler isn't looking at the judge. He's looking at me. That's the look of a man doing arithmetic about how much trouble I am.
    judge: Trial is set for Monday. We're adjourned.
    @sfx gavel
  `);
  g.leaveCourt();
  await g.run(s`
    @bg lobby
    @music crane
    @show crane delighted center
    crane[delighted]: Lovely. The stop sign. That was the thread, wasn't it? Men like Ray always lie about the small things first.
    ezra: Why are you telling me that, Silas?
    crane[neutral]: Because it's more fun when you win the early rounds, kid. It makes the ending mean something.
    @hide crane
    @show kessler cold center
    kessler[cold]: Nice trick in there, magic man.
    kessler: A word of advice. People who dig around in my yard find things they don't like.
    ezra: Is that a threat, Sergeant?
    kessler[friendly]: It's gardening advice.
    @hide kessler
    ~ Two men in one hallway, and only one of them was afraid of me. It wasn't the one with the badge.
  `);
  return 'c2_plea';
};

// ---------------------------------------------------------------------------
// Plea negotiation

export const plea: SceneFn = async (g) => {
  g.resetStage();
  await g.run(s`
    @bg da_office
    @music tension
    @title District Attorney's Office | Thursday, 8:30 AM
    @show strand cold left
    @show rosa serious right
    strand[cold]: Thank you for coming. Ms. Quintero, I'm sorry. I know this is your brother.
    rosa[serious]: Then you know I'm not leaving this room until you say something reasonable.
    strand[neutral]: The People don't make reasonable offers on homicides, Ms. Quintero. We make survivable ones.
    ~ Here's the ugly truth of criminal law: almost nobody goes to trial. Ninety-some percent of cases end in a room like this, with a folder sliding across a desk.
    ~ My job is to make that folder better. Teo's job is to decide whether to take it.
  `);
  const res = await negotiate(g, {
    offers: [
      { charge: 'Drug-induced homicide, as charged', sentence: '12 years state prison', line: "The People's offer: he pleads to count one as charged. I recommend twelve years instead of twenty. He'll be thirty-one when he gets out." },
      { charge: 'Involuntary manslaughter', sentence: '6 years state prison', line: '...Fine. Involuntary manslaughter. Six years. That is a gift, Mr. Vane.' },
      { charge: 'Sale of fentanyl', sentence: '3 years state prison', line: 'I will drop the homicide. He pleads to selling fentanyl. Three years.' },
      { charge: 'Sale of Adderall', sentence: '1 year county jail + probation', line: 'He pleads to the Adderall. One year in county, probation after. That is my final offer.' },
      { charge: 'Misdemeanor possession', sentence: 'Probation; record sealed in 2 years', line: "...Misdemeanor possession. Probation. Record sealed in two years if he stays out of trouble. That's the floor. I'm only standing on it because I don't like how my own case smells." },
    ],
    leverages: [
      {
        id: 'motion',
        label: 'The pills from the car are suppressed',
        hint: 'Your "dealer" had no drugs on him.',
        available: (x) => x.flag('motion_granted'),
        script: s`
          ezra: Your dealer had no drugs, Ms. Strand. As of yesterday, as far as any jury will ever know, Teo Quintero's car was empty.
          strand[annoyed]: I was there, Mr. Vane.
        `,
      },
      {
        id: 'quote',
        label: 'The affidavit cut Teo’s denial',
        hint: 'Your own discovery, page forty.',
        available: (x) => x.has('c2_ded_quote'),
        script: s`
          ezra: Page forty of your own discovery. Teo's next text: "jk lol. i dont touch that stuff." Sergeant Kessler swore to a conversation and cut off the half that clears my client.
          strand[shock]: ...
          strand[cold]: Give me that.
          ~ She reads it twice. Then she puts it down very gently, the way you put down something you'd like to throw.
        `,
      },
      {
        id: 'pizza',
        label: 'The $40 was for pizza',
        hint: 'Venmo plus the DashGo log.',
        available: (x) => x.has('c2_ded_pizza'),
        script: s`
          ezra: Two large pizzas, delivered at 7:41. Forty dollars at 7:52, with a pizza emoji. The app's tip failed. Your drug payment is a pepperoni and a veggie.
          strand[annoyed]: ...You're enjoying this.
          ezra: A little.
        `,
      },
      {
        id: 'alibi',
        label: 'Teo was fourteen miles away',
        hint: 'GPS, every fifteen seconds.',
        available: (x) => x.has('c2_ded_alibi'),
        script: s`
          ezra: While your witness says Teo was in that kitchen, Teo's GPS has him delivering burritos in Eastside. Fourteen miles away. Every fifteen seconds, for three hours.
          strand[think]: ...
        `,
      },
      {
        id: 'drink',
        label: 'She never swallowed a pill',
        hint: 'The autopsy’s gastric contents.',
        available: (x) => x.has('c2_ded_drink'),
        script: s`
          ezra: No tablet in her stomach. No binder, no dye. Just lemon-lime soda. Chloe Whitfield never swallowed a pill, so nobody sold her one. Someone put fentanyl in her drink.
          strand[shock]: ...That's not drug-induced homicide, Mr. Vane. That's murder.
          ezra: Yes. It is.
        `,
      },
    ],
    read: {
      char: 'strand',
      expr: 'cold',
      line: 'My witness is solid. Jonah Pratt saw the sale with his own eyes.',
      tell: 'mouth',
      meanings: [
        { label: "She doesn't trust her own witness.", correct: true },
        { label: "She's offended that you'd question her." },
        { label: "She's worried about her win record." },
      ],
      insight: 'Lips pressed thin on “solid.” She met Jonah Pratt this week. Kessler handed him to her, and she doesn’t like it.',
    },
    readSuccess: s`
      ezra: You met your eyewitness this week, didn't you? Kessler brought him to you, gift-wrapped, and you've been trying not to notice the bow.
      strand[annoyed]: ...You're very irritating when you're right, Mr. Vane.
      strand[neutral]: There may be more room in this folder than I said.
    `,
    readFail: s`strand[cold]: Stop staring at me like that. I've been stared at by better.`,
  });
  g.state.vars.plea_level = res.level;
  if (res.accepted) return 'c2_plea_end';
  await g.run(s`
    ezra: We're rejecting it, Ms. Strand.
    strand[surprised]: Even this?
    rosa[serious]: Call him first, Ezra. It's his life.
    @sfx phone
    @outfit teo jail
    @call teo
    teo[worried]: Rosie? What happened? Did they — is there a deal?
    rosa: There's a deal, Teo. It's a good one. You'd come home.
    teo[sad]: ...Would I have to say I did it?
    ezra: You'd have to say you did something. Not the murder.
    teo[mad]: Then no. I didn't kill her. I'm not saying I did. Not for a year, not for a day. I'm not going to be the guy who did that to her, even on paper.
    @call off
    strand[neutral]: ...Then I'll see you Monday, Mr. Vane.
    strand[cold]: For what it's worth, I hope you're right. I would rather lose than convict the wrong man.
    ~ That's the first time I've ever heard a prosecutor say that and believed it.
  `);
  return 'c2_inv2';
};

export const pleaEnd: SceneFn = async (g) => {
  const level = Number(g.state.vars.plea_level ?? 0);
  const outcomes = [
    'Teo Quintero pleaded guilty to drug-induced homicide and was sentenced to twelve years in state prison.',
    'Teo Quintero pleaded guilty to involuntary manslaughter and was sentenced to six years.',
    'Teo Quintero pleaded guilty to selling fentanyl he never sold, and served three years.',
    'Teo Quintero pleaded guilty to selling Adderall. He served eleven months in county jail.',
    'Teo Quintero pleaded to misdemeanor possession. He walked out that afternoon with probation and a sealed record.',
  ];
  await g.run(s`
    @bg office
    @music sad
    : ${outcomes[level]}
    : The case of Chloe Whitfield's death was closed.
    : Sergeant Ray Kessler was promoted to lieutenant the following spring.
    : Five weeks later, a nineteen-year-old freshman collapsed at a party in Las Lomas. Blue pill. Same flaws in the stamp.
    : Chloe's article, "The Blue Pipeline," was never published.
  `);
  throw new GameOver('story', 'ENDING: The Deal');
};
