import { audio } from '../../engine/audio';
import { s } from '../../engine/dsl';
import type { SceneFn } from '../../engine/game';
import { freshTrial } from '../../engine/state';
import { type CrossExamDef, crossExam, directExam, testimony, verdictReport } from '../../systems/court';
import { type Juror, voirDire } from '../../systems/voirDire';
import { court2 } from './pretrial';

// ---------------------------------------------------------------------------
// Jury selection

const JURORS: Juror[] = [
  {
    id: 'lindqvist',
    name: 'Marjorie Lindqvist',
    age: 67,
    job: 'Retired third-grade teacher',
    bio: 'Forty years at Alvarado Elementary. Widowed. Volunteers at the public library on Tuesdays.',
    look: { skin: '#f0d2bc', hair: 'bob', hairColor: '#d8d8dc', top: '#7a5a8a', glasses: true, age: 3 },
    bias: 6,
    questions: [
      { q: 'Has drug addiction ever touched your family?', a: "My nephew. Heroin, then pills. He's been clean four years now. People can come back from the edge, Mr. Vane. I've seen it.", note: 'Nephew in recovery. Believes in second chances.' },
      { q: 'Do you believe police officers always tell the truth?', a: 'I believe most people try to. Police are people.', note: 'Fair-minded about police.' },
      { q: "Can you set aside sympathy for the victim's mother?", a: "I'll try. I taught for forty years. I know when a child is lying, and I know when a child is scared.", note: 'Thinks she can spot liars.' },
    ],
    after: { keep: s`crane[neutral]: A schoolteacher. She'll forgive your boy anything except lying to her.` },
  },
  {
    id: 'holt',
    name: 'Derek Holt',
    age: 44,
    job: 'Gym owner',
    bio: 'Owns two CrossFit boxes in the Valley. Coaches youth wrestling. Married, three kids.',
    look: { skin: '#d9a27f', hair: 'short', hairColor: '#2a1a12', top: '#22324e', beard: true, age: 1 },
    bias: -8,
    questions: [
      { q: 'What should happen to people who sell fentanyl?', a: 'Honestly? Lock them up and lose the key. ...But I’d listen to the evidence. Obviously.', note: 'Hard line on dealers.' },
      { q: 'Have you ever been treated unfairly by police?', a: 'Never. Cops have always had my back.', note: 'Strongly pro-police.' },
      { q: "Could you acquit if the evidence wasn't there?", a: "Sure. If it's not there, it's not there." },
    ],
    read: {
      line: 'I’d listen to the evidence. Obviously.',
      tell: 'eyes',
      meanings: [{ label: "He's already decided the defendant is guilty.", correct: true }, { label: "He's nervous about public speaking." }, { label: "He's hiding a connection to the victim." }],
      insight: 'His eyes slid away on “obviously.” He decided Teo was guilty the moment he walked in.',
      note: 'READ: Already decided. Will convict.',
    },
    after: { strike: s`crane[neutral]: Mm. I'd have struck him too. The obvious ones make juries nervous.` },
  },
  {
    id: 'beltran',
    name: 'Ana Beltrán',
    age: 31,
    job: 'ER nurse, San Querida General',
    bio: 'Night shift, emergency department. Eight years. Lives in Eastside with her sister.',
    look: { skin: '#c48a62', hair: 'long', hairColor: '#1a1210', top: '#2a8a86', age: 0 },
    bias: 7,
    questions: [
      { q: "You've seen overdoses?", a: "Every weekend. I've pushed Narcan into kids younger than your client. I want whoever's flooding this city with pills stopped. Whoever they are.", note: 'Wants the supply stopped, "whoever they are."' },
      { q: 'Do you trust police testimony?', a: 'I trust evidence. I’ve had cops bring in kids who "resisted arrest" and could barely stand.', note: 'Skeptical of police narratives.' },
      { q: 'Can you be fair to the prosecution?', a: "If they prove it, I'll convict. I'm not here to hand anyone a pass." },
    ],
    after: { keep: s`crane[delighted]: An emergency room nurse. Excellent. Helena will have opinions.` },
  },
  {
    id: 'pike',
    name: 'Gordon Pike',
    age: 58,
    job: 'Retired insurance adjuster',
    bio: 'Thirty years investigating claims for Pacific Mutual. Golfs. Married to his high-school sweetheart.',
    look: { skin: '#ecc8b0', hair: 'bald', hairColor: '#9a9590', top: '#5a6a4a', age: 2 },
    bias: -14,
    questions: [
      { q: 'Any connections to law enforcement?', a: 'No, sir. None.', note: 'Says no police connections.' },
      { q: 'What did you do as an insurance adjuster?', a: 'Investigated claims. Fraud, mostly. People lie, Mr. Vane. My job was catching them.', note: 'Professional skeptic.' },
      { q: 'Can you be impartial?', a: 'Absolutely. I go where the facts go.' },
    ],
    read: {
      line: 'No, sir. No connections to law enforcement at all.',
      tell: 'throat',
      meanings: [{ label: "He's lying about police connections.", correct: true }, { label: "He's nervous about jury duty." }, { label: 'He dislikes defense attorneys.' }],
      insight: 'A hard swallow on “at all.” He’s lying. Someone close to him wears a badge, and someone told him not to mention it.',
      note: 'READ: Lying about police ties. Planted?',
    },
    after: {
      keep: s`crane[delighted]: ...Lovely choice, kid.`,
      strike: s`crane[cold]: ...Well read, kid. Well read.`,
    },
  },
  {
    id: 'greene',
    name: 'Tasha Greene',
    age: 26,
    job: 'Barista, sociology grad student',
    bio: 'Second-year master’s student at SQ State. Works mornings at a coffee shop on Fifth.',
    look: { skin: '#8a5a3c', hair: 'curly', hairColor: '#1a1210', top: '#c9a24a', age: 0 },
    bias: 3,
    questions: [
      { q: 'Do you trust police to tell the truth?', a: 'Mostly? My cousin’s a cop. Most of them are good. Some aren’t. You have to look at the person.', note: 'Cousin is a cop. Judges individuals.' },
      { q: 'Have you known anyone who sold drugs?', a: "In college? Everybody knew somebody selling Adderall. That's not the same thing as fentanyl.", note: 'Separates Adderall from fentanyl.' },
      { q: "What do you think of the councilwoman's campaign?", a: "I think she's grieving. I don't vote for grief." },
    ],
  },
  {
    id: 'huang',
    name: 'Walter Huang',
    age: 72,
    job: 'Retired accountant',
    bio: 'Forty years of corporate audits. Grandfather of four. Does the crossword in pen.',
    look: { skin: '#e8c8a0', hair: 'short', hairColor: '#cfcfd0', top: '#3a3e46', glasses: true, age: 3 },
    bias: -2,
    questions: [
      { q: "Would you hold it against the defendant if he doesn't testify?", a: "I'd want to hear from him, I'll be honest. But I know the law says I can't hold it against him.", note: 'Wants to hear from the defendant.' },
      { q: 'How do you feel about police paperwork?', a: 'Paperwork is where people get lazy. Forty years of audits taught me that.', note: 'Distrusts sloppy records. (Burn logs?)' },
      { q: 'Do you have opinions about drug cases?', a: "My granddaughter's roommate died last year. Pills. I don't have opinions. I have a hole in my family.", note: 'Personal loss to fentanyl.' },
    ],
  },
];

export const jury2: SceneFn = async (g) => {
  g.state.trial = freshTrial();
  g.resetStage();
  await g.run(s`
    @bg court_judge instant
    @music crane
    @title Courtroom 3 | Monday, 9:02 AM
    @sfx gavel
    judge[neutral]: Good morning. Before we begin, we seat a jury. Counsel will question the panel. Each side has its strikes. Use them wisely.
    ~ Voir dire. "To speak the truth." In practice: twelve strangers trying to look fair, and two lawyers trying to find out which of them are lying about it.
    ~ Today, one of those lawyers has a consultant who reads people better than anyone alive.
    crane[delighted]: Good morning, kid. Shall we play?
    rosa[serious]: Ezra. One question per juror. You have two Focus to read them, and two strikes. Crane gets a strike too, and he'll use it on whoever helps us most.
    rosa[worried]: Watch for liars. Crane loves a liar.
  `);
  const res = await voirDire(g, {
    jurors: JURORS,
    strikes: 2,
    focus: 2,
    craneStrike: (j) => s`
      strand[neutral]: The People thank and excuse ${j.name}.
      crane[delighted]: You liked that one, kid. I could tell. You lean forward when you like someone. You always did.
      ~ He's right. I do. Ten years, and he still knows my tells better than I do.
    `,
  });
  g.state.vars.jury_sway = res.sway;
  g.state.vars.pike = res.kept.includes('pike') ? 1 : 0;
  return 'c2_trial';
};

// ---------------------------------------------------------------------------
// Trial: Dr. Nand

const NAND: CrossExamDef = {
  id: 'c2_nand',
  witness: 'nand',
  title: 'The Fragment',
  pressure: 8,
  done: (g) => g.flag('t_drink') && g.flag('t_burn'),
  noTell: 'Nothing on that one. She believes every word of it.',
  statements: [
    {
      id: 'n1',
      text: 'Item 13 is half of a counterfeit M30 tablet. It contains fentanyl.',
      press: s`
        nand[neutral]: Pressed in an illegal pill press, like millions of others. Fentanyl, binder, blue dye to look like real oxycodone.
        ~ Binder and blue dye. Remember that.
      `,
    },
    {
      id: 'n2',
      text: 'The medical examiner found that fentanyl toxicity caused Chloe Whitfield’s death.',
      press: s`nand[sad]: Forty-six nanograms per milliliter. That's... that's not an accident level. That's many lethal doses.`,
    },
    {
      id: 'n3',
      text: 'The fragment indicates that she took the other half of that tablet.',
      press: s`
        nand[nervous]: Well... that would be the usual assumption. Half in the purse, half... consumed.
        ~ The usual assumption. Nobody checked the stomach. I did. If I've put it together on the Deduction Board, now's the time.
      `,
      present: {
        c2_ded_drink: s`
          ezra[point]: Took the other half? Doctor, you just told us these tablets contain a binder and blue dye.
          ezra: The autopsy found no tablet fragments in her stomach. No binder. No dye. Only lemon-lime soda.
          ezra: Chloe Whitfield never swallowed a pill. The fentanyl that killed her was dissolved in her drink.
          @sfx shock
          @shake 1.5
          nand[surprised]: ...
          nand[serious]: That's correct. I should be precise. The fragment shows a tablet was present in her purse. It does not show she took one. The stomach contents are consistent with a dissolved dose. In a liquid.
          strand[shock]: ...!
          @flag t_drink
          @jury 14
        `,
        c2_tox: s`
          ezra[point]: Doctor, the autopsy. No tablet fragments, no binder, no blue dye in her stomach. Only soda.
          nand[serious]: ...Yes. That's consistent with a dissolved dose, not a swallowed tablet. I should have been more precise.
          @flag t_drink
          @jury 10
        `,
      },
    },
    {
      id: 'n4',
      text: 'The tablet is consistent with the counterfeit pills circulating in San Querida.',
      press: s`
        nand[worried]: Consistent. Yes. That's... the word.
        ~ "Consistent." She's choosing every word like it might be her last day at work.
      `,
      read: {
        flag: 't_nand_read',
        def: {
          char: 'nand',
          expr: 'worried',
          outfit: 'lab',
          line: 'It’s consistent with what’s circulating. That’s all I can say.',
          tell: 'eyes',
          meanings: [{ label: "She's holding back what she found about this batch.", correct: true }, { label: "She's unsure about her chemistry." }, { label: "She's afraid of the defendant." }],
          insight: 'Her eyes went to the gallery, to her supervisor in the third row. She has more, and she’s waiting for permission to say it.',
        },
        success: s`
          ezra: Dr. Nand, nobody in this room can fire you for answering my question truthfully. Is that all you found?
          nand[sad]: ...No.
          ~ That's the door. Now I need the evidence to walk her through it.
          @jury 4
        `,
      },
      present: {
        c2_ded_burn: s`
          ezra[point]: Consistent with what's circulating? Doctor, isn't it more specific than that?
          ezra: Isn't it true that the die marks on this tablet, a nicked M and an offset 3, match tablets seized in March under case 24-1187?
          ezra: Tablets that the property room logged as destroyed by incineration on March 14, with Sergeant Ray Kessler signing as witness?
          @sfx shock
          @shake 2
          nand[serious]: ...Yes. It's true. I wrote it in my bench notes. I was told to take it out of my report.
          nand[sad]: I'm sorry. I should have said it the first time.
          @sfx crowd
          strand[shock]: ...!!
          judge[stern]: Order. Order! ...Dr. Nand, who told you to remove it?
          nand[worried]: My supervisor. After Sergeant Kessler came to the lab.
          @flag t_burn
          @jury 16
        `,
        c2_dienotes: s`
          ezra[point]: Doctor, your own bench notes. The die marks on this tablet match a batch seized in March, case 24-1187.
          nand[serious]: ...Yes. I was told to leave that out of my final report.
          ~ That's half of it. The burn log would finish it. But it's out now.
          @flag t_burn
          @jury 10
        `,
      },
    },
  ],
  wrong: s`
    nand[worried]: I... I'm sorry, I don't see how that relates to the chemistry.
    strand[annoyed]: Neither do the People, Your Honor.
  `,
};

export const trial2Open: SceneFn = async (g) => {
  court2(g, 'nand');
  g.state.trial.jury = Number(g.state.vars.jury_sway ?? 50);
  g.renderHud();
  await g.run(s`
    @bg court_judge instant
    @music trial
    judge[neutral]: The jury is seated. Ms. Strand, your opening.
    strand[neutral]: Ladies and gentlemen. Chloe Whitfield was twenty years old. She died on a bathroom floor, alone, with fentanyl in her blood.
    strand[cold]: The People will present the physical evidence and an eyewitness. Your job is to decide whether they prove that the defendant is responsible. Nothing more, and nothing less.
    ~ That's not the speech she gave the cameras a week ago. She's hedging. She's read page forty.
    judge: Mr. Vane.
  `);
  const style = await g.choose(
    [
      { label: 'Tell them plainly: someone poisoned Chloe, and it wasn’t Teo.', value: 'plain', tag: 'HONEST', hint: 'Promise the jury the truth and then deliver it.' },
      { label: "Play Chloe's voice for them: “Day forty-one.”", value: 'voice', tag: 'GAMBIT', hint: 'Devastating. Also not admitted into evidence yet. (Costs 1 Patience)' },
      { label: '"This whole case was built by one man."', value: 'attack', tag: 'RISKY', hint: 'Plant the idea early. Strand will object.' },
    ],
    { prompt: 'Twelve people. One of them might be Crane’s. How do I open?' },
  );
  if (style === 'plain') {
    await g.run(s`
      ezra[serious]: Ladies and gentlemen, Chloe Whitfield was not a party girl who bought a bad pill. She was a reporter, eight months sober, working on the biggest story of her life.
      ezra: Someone poisoned her to stop that story. It wasn't the boy who delivered her pizza. By the end of this trial, you'll know who it was.
      @stat integrity 1
      @jury 6
    `);
  } else if (style === 'voice') {
    await g.run(s`
      ezra[serious]: Before I say anything, I want you to hear from the only person in this room who can't speak for herself.
      @music stop
      [Chloe — voice memo]: Day forty-one. I finally got him on tape. Monday. Publish Monday. Don't chicken out, Chloe.
      @sfx crowd
      strand[mad]: Objection! That recording hasn't been admitted!
      judge[angry]: Sustained! Mr. Vane, you know better. One more stunt like that and you'll argue this case from a holding cell.
      @warn
      @music trial
      ~ The jury heard her voice. Juror six is crying. The judge can tell them to forget it. They won't.
      @stat notoriety 1
      @jury 12
    `);
  } else {
    await g.run(s`
      ezra[point]: Every piece of evidence in this case passed through one man's hands. One sergeant took the case, made the arrest, found the pills, wrote the affidavit, and brought you the eyewitness.
      ezra: Keep an eye on him. I will.
      strand[annoyed]: Objection. Counsel is testifying.
      judge[stern]: Sustained. Save it for the evidence, Mr. Vane.
      @stat notoriety 1
      @jury 8
    `);
  }
  await g.run(s`
    strand[neutral]: The People call Dr. Priya Nand.
  `);
  await directExam(g, 'Dr. Priya Nand', [
    { who: 'strand', text: 'Dr. Nand, what did you test in this case?' },
    { who: 'nand', text: 'Item 13: a fragment of a blue tablet, recovered from the victim’s purse.' },
    { who: 'strand', text: 'And what did it contain?' },
    { who: 'nand', text: 'Fentanyl.' },
    {
      who: 'strand',
      text: 'The same drug the defendant sold to Chloe Whitfield.',
      improper: 'facts',
      sustained: s`strand[annoyed]: ...Withdrawn. The same drug found in the victim's blood?`,
    },
    {
      who: 'strand',
      text: 'Doctor, in your opinion, did Chloe Whitfield swallow one of these tablets?',
      improper: 'foundation',
      sustained: s`
        judge[stern]: Dr. Nand is a chemist, Ms. Strand, not the medical examiner. Lay a foundation for that opinion or move on.
        strand[cold]: ...Moving on.
      `,
    },
  ]);
  await g.run(s`
    judge: Dr. Nand, please give the jury your findings.
  `);
  await testimony(g, NAND);
  await crossExam(g, NAND);
  await g.run(s`
    judge[stern]: Thank you, Doctor. ...Ms. Strand?
    strand[sweat]: ...The People call Jonah Pratt.
    ~ She didn't look at Crane when she said it. She looked at Kessler, in the second row. Kessler wasn't looking at anybody.
  `);
  return 'c2_trial_jojo';
};

// ---------------------------------------------------------------------------
// Trial: Jonah Pratt

const JOJO: CrossExamDef = {
  id: 'c2_jojo',
  witness: 'jojo',
  title: 'The Kitchen',
  pressure: 10,
  penalty: 13,
  done: (g) => g.flag('t_memo'),
  statements: [
    {
      id: 'j1',
      text: "I've known Chloe since freshman year. She partied hard. Pills, mostly.",
      press: s`
        jojo[neutral]: Everybody knew. She was a mess, honestly. Sad. But, you know. Everybody knew.
        ~ "Everybody knew." Except her mother, and her sponsor, and the bronze coin in her desk.
      `,
      present: {
        c2_chip: s`
          ezra[point]: Pills, mostly? This was in Chloe's desk drawer. An eight-month sobriety coin.
          ezra: Chloe Whitfield hadn't taken a pill in eight months. She went to meetings. She counted the days.
          jojo[sweat]: ...People relapse. Happens all the time.
          ezra: Not with a sealed bottle of soda in her hand, Mr. Pratt.
          @flag t_chip
          @jury 10
        `,
      },
    },
    {
      id: 'j2',
      text: 'Around midnight, I saw Teo Quintero in my kitchen. Selling her a blue pill.',
      press: s`
        jojo: Clear as day. Pizza guy. I recognized him from campus.
        ~ He doesn't know Teo. He knows a name from her phone. And Teo's phone was somewhere very specific that night.
      `,
      present: {
        c2_ded_alibi: s`
          ezra[point]: Clear as day? At midnight, Teo Quintero was delivering breakfast burritos in Eastside, fourteen miles from your kitchen.
          ezra: His delivery app logged his GPS every fifteen seconds from 10:58 PM to 2:06 AM. He never came within ten miles of Las Lomas.
          @sfx shock
          @shake 1.5
          jojo[shock]: ...!
          jojo[nervous]: Maybe it was — earlier, then. Or somebody who looked like him.
          ezra: You said "clear as day," Mr. Pratt.
          @flag t_alibi
          @jury 14
        `,
        c2_dashgo: s`
          ezra[point]: Teo's delivery log says he was in Eastside from 10:58 PM to 2:06 AM. Fourteen miles away.
          jojo[nervous]: ...Phones can be wrong.
          @flag t_alibi
          @jury 10
        `,
      },
    },
    {
      id: 'j3',
      text: 'After that she went upstairs. I never touched her drink. I never even talked to her.',
      press: s`
        jojo[neutral]: I was hosting. Two hundred people. I didn't even see her after the kitchen thing.
        ~ Two hundred people. Two hundred phones. One of them was recording at 12:34.
      `,
      present: {
        c2_cupphoto: s`
          ezra[point]: Never talked to her? Never touched her drink? Then who is this, at 12:34 AM, handing Chloe Whitfield a red cup?
          ezra: Look at her other hand. She's already holding her own soda. A sealed bottle of Limón. She didn't need your cup, Mr. Pratt. So why did you give it to her?
          @sfx shock
          @shake 2
          jojo[shock]: I — I was handing out cups to EVERYBODY! I'm the host!
          @sfx crowd
          ~ Twenty-eight minutes later, she was on a bathroom floor.
          @flag t_cup
          @jury 14
        `,
      },
    },
    {
      id: 'j4',
      text: "I don't even know any cops. Why would I know cops? I'm a student.",
      press: s`
        jojo[nervous]: I met Sergeant Kessler that night, after. That's it. He was very professional.
        ~ He met him "that night." Narcotics didn't take this case until Sunday morning. And Chloe recorded something on Thursday.
      `,
      present: {
        c2_memo: s`
          ezra[point]: You don't know any cops? Then I'd like the jury to hear a recording Chloe Whitfield made on Thursday night, three days before she died.
          @music stop
          [Young man — voice memo]: — nah, nah, listen. My guy's a cop, okay? The evidence room's basically my warehouse.
          [Young man — voice memo]: They say they burn it. Big fire, paperwork, whatever. It comes right back to me.
          @sfx heartbeat
          ezra[serious]: Is that your voice, Mr. Pratt?
          jojo[breakdown]: ...
          @flag t_memo
          @jury 10
        `,
        c2_phonelog: s`
          ezra[point]: Then why did a prepaid phone from your glovebox call Sergeant Kessler's personal cell at 11:52 PM that night?
          jojo[sweat]: I — that's not — anyone could have that phone!
          ~ He's shaking. But he isn't breaking. I need his own voice.
          @jury 6
        `,
      },
    },
  ],
  wrong: s`
    jojo[smirk]: Okay? Is this supposed to scare me?
    strand[annoyed]: Your Honor, the defense is fishing.
  `,
};

export const trial2Jojo: SceneFn = async (g) => {
  court2(g, 'jojo');
  await g.bg('court_witness', true);
  await g.run(s`
    @music trial
    jojo[neutral]: Jonah Pratt. Senior, business major. It was my party. My parents' house.
  `);
  await directExam(g, 'Jonah Pratt', [
    { who: 'strand', text: 'Mr. Pratt, you hosted the party where Chloe Whitfield collapsed?' },
    { who: 'jojo', text: 'Yeah. My parents were in Cabo.' },
    {
      who: 'strand',
      text: 'And you saw the defendant sell Chloe a blue pill in your kitchen, didn’t you?',
      improper: 'leading',
      sustained: s`strand[annoyed]: ...What did you see in the kitchen, Mr. Pratt?`,
    },
    {
      who: 'jojo',
      text: 'Everybody knew Chloe was using again. She was always looking to score.',
      improper: 'speculation',
      sustained: s`judge[stern]: The witness will testify to what he saw, not what "everybody knew."`,
    },
    { who: 'strand', text: 'What did you do when she collapsed?' },
    { who: 'jojo', text: 'Called 911. I tried to help. I even did CPR until the paramedics came.' },
  ]);
  await g.run(s`judge: Proceed with your testimony, Mr. Pratt.`);
  await testimony(g, JOJO);
  await crossExam(g, JOJO);
  await g.run(s`
    jojo[breakdown]: ...Stop. Stop playing it.
    @music sad
    jojo[cry]: He said it'd just knock her out! He said, make her look like a user, and nobody would believe her stupid article!
    jojo: He gave me the stuff. He gave me everything. For three years. I'm — I'm CI four-one-seven. I'm his informant. He gets me pills from the evidence room, I sell them, he gets his cut and his arrests.
    jojo[despair]: When she said she had me on tape I called him. He said "handle it." He said it like it was nothing. Like taking out the trash.
    jojo[cry]: And Teo — Teo was just a name on her phone. Ray said a name on her phone was all he needed.
    @sfx crowd
    strand[shock]: ...
    judge[angry]: Order! ORDER!
    judge[stern]: Mr. Pratt, stop talking. You need a lawyer. Now. Bailiff, the witness is not to leave this building.
    judge: We'll take a thirty-minute recess.
    @sfx gavel
  `);
  g.leaveCourt();
  return 'c2_recess';
};

// ---------------------------------------------------------------------------
// Recess

export const recess2: SceneFn = async (g) => {
  g.resetStage();
  await g.run(s`
    @bg lobby
    @music crane
    @show crane delighted center
    crane[delighted]: Your frightened rich boy cracked like a cheap mirror. Beautiful. Did you see Helena's face? She'll be dining out on it for years. Quietly.
    ezra: You don't seem upset, Silas. Your side is losing.
    crane[neutral]: I don't have a side, kid. I have a seat.
    crane[cold]: But Ray won't crack. Ray has been lying under oath for nineteen years. Perjury is just another uniform to a man like that. He'll stare at the jury and deny it all.
    crane[neutral]: Ask him about the fire. Men always lie about fire.
    ezra: Why are you helping me?
    crane[delighted]: Helping? I'm watching. There's a difference, and someday you'll understand it.
  `);
  if (g.flag('c2_saw_sc')) {
    const ask = await g.choose(
      [
        { label: 'Ask him about Chloe’s note: "Who coaches him? S.C.?"', value: true, tag: 'RISKY' },
        { label: 'Walk away.', value: false },
      ],
      { prompt: 'Chloe wrote his initials on a sticky note. He has no idea I know.' },
    );
    if (ask) {
      await g.run(s`
        ezra: Chloe left a note on her draft. "Kessler testifies like he's reading a script. Who coaches him? A consultant? S.C.?"
        crane[cold]: ...
        crane[neutral]: Clever girl.
        crane: Pity.
        ~ Two words. No tell. Nothing. And I've never been more afraid of a man in my life.
      `);
      g.setFlag('c2_asked_sc');
    }
  }
  await g.run(s`
    @hide crane
    @show brandt serious left
    @show ortega worried right
    brandt[serious]: Ortega's here. Under subpoena, like you said. And Jonah Pratt is downstairs with a public defender, talking faster than the stenographer can type.
    ortega[worried]: Sarge saw me in the hallway. He didn't say anything. He just looked at me.
    ezra: He's going to look at you a lot more in about twenty minutes. Stay close to Brandt.
    brandt[serious]: Go finish it, Vane.
  `);
  return 'c2_trial_kessler';
};

// ---------------------------------------------------------------------------
// Trial: Sgt. Kessler

const KESSLER: CrossExamDef = {
  id: 'c2_kessler',
  witness: 'kessler',
  title: 'My Investigation',
  pressure: 8,
  penalty: 14,
  done: (g) => g.flag('t_phone') && g.flag('t_plant') && g.flag('t_burnk') && g.flag('t_stash'),
  noTell: 'Nothing. That part he’s practiced in a mirror.',
  statements: [
    {
      id: 'k1',
      text: "I'd never met Jonah Pratt before this investigation. Whatever that kid says, he's a liar looking for a deal.",
      press: s`
        kessler[cold]: Junkies and dealers will say anything once they're scared. Nineteen years, counselor. I've heard it all.
        ~ Never met him. Somebody's phone remembers it differently.
      `,
      present: {
        c2_phonelog: s`
          ezra[point]: Never met him? Then explain this. A prepaid phone from Jonah Pratt's glovebox called your personal cell at 11:52 PM on Saturday night. Three minutes.
          ezra: Twenty-eight minutes before Chloe Whitfield drank from his cup.
          @sfx shock
          @shake 1.5
          kessler[shock]: ...!
          kessler[sweat]: That's — informants call me all the time. That's the job.
          ezra: You just testified you'd never met him.
          @flag t_phone
          @jury 12
        `,
      },
    },
    {
      id: 'k2',
      text: 'The pills under that seat were the defendant’s. I found them in a lawful search, and every minute of it is on my camera.',
      press: s`
        kessler[smirk]: Judge didn't like the stop. Fine. That doesn't change what was under the seat.
        ~ Every minute is on his camera. Every minute after 10:22:31. His partner's camera started earlier.
      `,
      present: {
        c2_ded_plant: s`
          ezra[point]: Every minute? Your camera turned on at 10:22:31, more than two minutes after the stop began.
          ezra: But Officer Ortega's camera was running the whole time. At 10:21:14, it shows you leaning into the passenger side while my client stood at the curb, and your hand going under that seat.
          ezra: A minute later, your camera wakes up, and you say "well, well, look what we've got." You found exactly what you'd just put there.
          @sfx shock
          @shake 2.5
          kessler[breakdown]: ...!!
          @sfx crowd
          judge[angry]: Order!
          @flag t_plant
          @jury 16
        `,
        c2_bodycam: s`
          ezra[point]: Officer Ortega's camera, 10:21:14. Your hand goes under the passenger seat while my client stands at the curb. The "search" starts eighty-six seconds later.
          kessler[angry]: That's — I was checking for weapons!
          @flag t_plant
          @jury 12
        `,
      },
    },
    {
      id: 'k3',
      text: 'Every drug I seize goes to the property room and gets destroyed by the book. I’ve never lost a single pill.',
      press: s`
        kessler[neutral]: Two witnesses, sign the log, into the incinerator. By the book.
        ~ "Ask him about the fire," Silas said. I hate that he was right.
      `,
      present: {
        c2_ded_burn: s`
          ezra[point]: Destroyed by the book? You signed the burn log for case 24-1187 on March 14. Two thousand four hundred pills, "incinerated."
          ezra: Dr. Nand has testified that the pill in Chloe Whitfield's purse came from that same batch. Pills you watched burn in March turned up in a dead girl's purse in October, Sergeant.
          @sfx shock
          @shake 2
          kessler[sweat]: ...Then somebody in the property room screwed up. Not me.
          @flag t_burnk
          @jury 12
        `,
        c2_burnlog: s`
          ezra[point]: You witnessed the burn of case 24-1187 on March 14. That batch came back.
          kessler[sweat]: Property room errors happen.
          @flag t_burnk
          @jury 8
        `,
      },
    },
    {
      id: 'k4',
      when: (g) => g.flag('t_burnk'),
      text: "Prove those pills ever left the property room. You can't. You've got a chemist's notes and a frightened kid.",
      press: s`
        kessler[smirk]: Theories, counselor. Show me pills. Show me where they went.
        ~ He doesn't know. He thinks he moved everything Thursday night.
      `,
      present: {
        c2_stash: s`
          ezra[point]: Pills? Unit 214, SafeKeep Self Storage, rented in the name of your brother-in-law, Michael Doyle, who lives in Phoenix.
          ezra: Detective Brandt executed a search warrant there at 1:22 AM on Friday. He found about eleven hundred tablets, still in SQPD property-room bags, tagged 24-1187, stamped "destroyed."
          ezra: You moved three duffel bags out that night, Sergeant. You left two boxes. You should have taken all five.
          @sfx shock
          @shake 3
          kessler[breakdown]: ...!!!
          @sfx crowd
          @flag t_stash
          @jury 16
        `,
        c2_photos: s`
          ezra[point]: Pills? These photos were taken inside Unit 214, SafeKeep Self Storage, rented by your brother-in-law. Property-room bags. Case 24-1187. "Destroyed."
          judge[angry]: Mr. Vane. Where, exactly, did these photographs come from?
          ezra[sweat]: ...A concerned citizen, Your Honor.
          judge[stern]: I'll allow them to impeach this witness. And then you and I are going to have a very long conversation about concerned citizens.
          @warn
          kessler[breakdown]: ...!!!
          @sfx crowd
          @flag t_stash
          @jury 12
        `,
      },
    },
  ],
  wrong: s`
    kessler[smirk]: Is that it? I've been cross-examined by better lawyers than a bus bench.
    strand[cold]: ...The People have no objection, Your Honor. We're curious too.
  `,
};

export const trial2Kessler: SceneFn = async (g) => {
  court2(g, 'kessler');
  await g.bg('court_judge', true);
  await g.run(s`
    @music trial
    @sfx gavel
    judge[stern]: Back on the record. Mr. Pratt will not be returning to the stand today, on advice of his new counsel. Mr. Vane?
    ezra[serious]: Your Honor, the defense calls Sergeant Ray Kessler as a hostile witness.
    strand[cold]: No objection. In fact, the People are very interested in what the sergeant has to say.
    kessler[cold]: Ray Kessler. SQPD Narcotics. Nineteen years.
    ~ He walked up there like a man walking into a bar he owns. He still thinks this is his room.
  `);
  await testimony(g, KESSLER);
  await crossExam(g, KESSLER);
  return 'c2_verdict';
};

// ---------------------------------------------------------------------------
// The end of it

export const verdict2: SceneFn = async (g) => {
  court2(g, 'kessler');
  await g.bg('court_witness', true);
  await g.run(s`
    @music stop
    kessler[breakdown]: ...
    ezra[serious]: Sergeant Kessler. Did you give Jonah Pratt the fentanyl that killed Chloe Whitfield?
    kessler[sweat]: ...
    kessler[cold]: On the advice of... on advice...
    kessler[despair]: I invoke my Fifth Amendment right against self-incrimination.
    @sfx crowd
    @shake 1.5
    ~ Eight words. Every cop on the gallery benches stood up and walked out. Not one of them looked at him.
    @music sad
    strand[serious]: Your Honor.
    strand: In light of the testimony of Dr. Nand and Mr. Pratt, and the evidence this court has heard, the People move to dismiss all charges against Mateo Quintero. With prejudice.
    strand[cold]: The People further ask the court to remand Sergeant Kessler into custody pending charges of perjury, evidence tampering, and the murder of Chloe Whitfield.
    judge[stern]: ...The motion to dismiss is granted. Mr. Quintero, you are free to go.
    judge[angry]: Bailiffs. Take Sergeant Kessler into custody.
    @sfx gavel
    @burst granted
    @show brandt serious left
    brandt[serious]: Ray Kessler, you're under arrest.
    kessler[angry]: You think you won, magic man? You don't even know who you're playing for.
    ~ He wasn't looking at me when he said it. He was looking past me. At the man in the tinted glasses, in the second row, applauding very softly.
  `);
  g.leaveCourt();
  const lines: string[] = [];
  lines.push(g.flag('c2_promised') ? 'You promised Rosa you’d bring her brother home. You did.' : 'You told Rosa the truth about the odds, every step. Then you beat them.');
  lines.push(g.has('c2_stash') ? 'Detective Brandt’s warrant held. Every pill in Unit 214 is evidence against Kessler.' : 'Tino’s photos got you through the trial. Kessler’s lawyer will spend months trying to get them thrown out.');
  if (g.flag('c2_teo_honest')) lines.push('Teo admitted the Adderall sales and entered a diversion program. His record will be clean in a year.');
  if (Number(g.state.vars.pike ?? 0)) lines.push('Juror Gordon Pike’s wife turned out to be a retired SQPD sergeant. Crane picked him. You kept him.');
  await verdictReport(g, { title: 'CASE 2 • CHAIN OF CUSTODY', verdict: 'DISMISSED', lines });
  return 'c2_epilogue';
};

export const epilogue2: SceneFn = async (g) => {
  g.resetStage();
  audio.music('sad');
  await g.run(s`
    @bg press
    @title City Hall | Two weeks later
    @outfit whitfield blazer
    @show strand neutral left
    @show whitfield serious center
    whitfield[serious]: This morning, the SQ State Sentinel published my daughter's article. "The Blue Pipeline," by Chloe Whitfield.
    whitfield: She traced the pills that flooded her campus back to our own police property room. She was right. She was twenty years old, and she was right, and it killed her.
    whitfield[sad]: I spent two years promising to fight this crisis. I was fighting the wrong people. Today I'm calling for an independent audit of every property room in this county.
    whitfield[cry]: Chloe will be the last. I'm going to make that true this time.
    strand[serious]: The District Attorney's office has charged Raymond Kessler with murder, conspiracy, and twenty-six counts of evidence tampering. I will be trying the case personally.
    ~ Forty-one and two. She doesn't seem to mind this one.
    @hide all
    @bg office
    @music office
    @title Vane & Associates | That evening
    @outfit teo hoodie
    @show teo grin left
    @show rosa happy right
    teo[grin]: So this is the office. It's smaller than the bus bench made it look.
    rosa[happy]: He's interning here. Unpaid. Every afternoon. For a year. He's going to file things until he dies.
    teo[nervous]: Is that legal?
    ezra: Nothing about this office is fully legal, Teo. Welcome aboard.
    rosa[sad]: Ezra. ...Thank you. I don't know how to say it better than that.
    ezra: You just did.
    @hide all
    @wait 400
    @music stop
    @bg office instant
    @filter noir
    : Later. The strip mall is dark. Only the NEPO sign is still buzzing.
    @sfx door
    @music crane
    @show crane neutral center
    crane[neutral]: You left the door unlocked, kid. You always did.
    ezra: Silas. Get out of my office.
    crane[delighted]: In a minute. I came to say congratulations. And to give you something.
    crane: Ray Kessler was my client for six years. Every time he took the stand, I prepared him. The pauses, the "nineteen years," the way he looked at the jury. All mine. He was the best liar I ever trained.
    crane[cold]: Your girl Chloe noticed. She wrote my initials on a sticky note. And Ray, the moment anyone squeezed him, was going to trade me for a lighter sentence. He told me so, on Friday.
    crane[neutral]: But who's going to believe a word Ray Kessler says now? A dirty cop who planted evidence and poisoned a girl. You took the last credible man who could hurt me, kid, and made him the least credible man in California.
    ezra: ...You used me.
    crane[delighted]: I directed you. Like old times. The voice in your ear. "Ask him about the fire." You were magnificent.
    crane: Here.
    : He drops a thick folder on the desk. The tab reads: HALE, MARCUS — PAROLE HEARING — 90 DAYS.
    crane[neutral]: You've been hiding from that one for ten years. Come out and play, kid.
    @hide crane
    @sfx door
    ~ He's gone. The folder is still here. I can't stop looking at it.
    ~ Marcus Hale. Eleven years inside, because a widow believed a psychic, and the psychic was me.
    @filter none
    @fade out 1200
  `);
  await g.caseCard('CASE 2 — CLOSED', 'To Be Continued', 'Case 3: The Séance');
  g.onTitle();
  return null;
};
