import { s } from '../../engine/dsl';
import type { Game, SceneFn } from '../../engine/game';
import { type InvestigationDef, type Location, investigate } from '../../systems/investigation';
import { readTell } from '../../systems/readTell';

const REQUIRED = ['c2_bodycam', 'c2_kesslercam', 'c2_dienotes', 'c2_burnlog', 'c2_memo', 'c2_cupphoto', 'c2_phonelog'];

const hasStash = (g: Game) => g.has('c2_stash') || g.has('c2_photos');

// ---------------------------------------------------------------------------

const office: Location = {
  id: 'office',
  name: 'Vane & Associates',
  bg: 'office',
  music: 'office',
  enter: async (g) => {
    await g.run(s`
      @title Vane & Associates | Thursday, 4:40 PM
      @show rosa serious center
      rosa[serious]: Ezra. Someone called the office line while you were at the DA's. Wouldn't leave a name. Young guy. Scared.
      rosa: He said he was "the other officer at the stop." He wants to meet. Tonight, 1 a.m., Tacos El Güero on Figueroa. Alone.
      ~ The other officer. Two cops on that stop, and Kessler's camera "glitched." I wonder whose didn't.
      rosa[worried]: It could be a setup. Kessler practically threatened you in the hallway.
      ezra: It could be. I'm going anyway.
      rosa[annoyed]: Then I'm going too. In the car. With the engine running.
    `);
    g.setFlag('c2_ortega_call');
  },
  hotspots: [
    { id: 'card', label: "Crane's card", rect: [980, 680, 230, 60], script: s`~ "Every jury has a tell." And Chloe's sticky note: "Who coaches him? S.C.?" I keep turning the card over like the answer's printed on the back.` },
    { id: 'window', label: 'Window', rect: [110, 100, 660, 480], script: s`~ A cruiser has driven past the strip mall twice in the last hour. Slowly. Could be nothing. Nothing doesn't usually drive that slowly.` },
  ],
  people: [
    {
      char: 'rosa',
      expr: 'serious',
      topics: [
        {
          id: 'brandt',
          label: 'Brandt called.',
          when: (g) => hasStash(g) && !g.has('c2_phonelog'),
          script: async (g) => {
            await g.run(s`
              @call brandt
              brandt[serious]: Vane. Jonah Pratt's Porsche got towed out of a fire lane on campus last night. Standard inventory search. Guess what was in the glovebox.
              brandt: A prepaid phone. I got a warrant for the records this morning. Saturday, 11:52 PM — a three-minute call to Ray Kessler's personal cell.
              brandt[annoyed]: Twenty-eight minutes after that call, Chloe Whitfield was drinking something she shouldn't have been.
              @call off
            `);
            await g.giveEvidence('c2_phonelog');
          },
        },
        {
          id: 'tino',
          label: 'Get the party videos from Tino',
          tag: 'SIDE',
          when: (g) => !g.has('c2_cupphoto'),
          script: async (g) => {
            await g.run(s`
              @sfx phone
              @call tino
              tino[grin]: Party videos? Already got 'em, hermano. A kid screen-records everything. I'll send you the good part. On the house, because it's for Rosa's brother.
              @call off
            `);
            await g.giveEvidence('c2_cupphoto');
            await g.run(s`~ 12:34 AM. Jonah Pratt hands Chloe a red cup. She's holding a green bottle of Limón in her other hand.`);
          },
        },
        {
          id: 'plan',
          label: 'What do we still need?',
          script: async (g) => {
            await g.say('rosa', hint(g), { expr: 'think' });
          },
        },
      ],
      present: {
        c2_bodycam: s`rosa[mad]: He reached under the seat. Before. I'm going to — no. No. I'm going to win. That's what I'm going to do.`,
        c2_memo: s`rosa[sad]: "My guy's a cop." She had it. She had all of it, and nobody listened to her in time.`,
      },
      presentDefault: s`rosa[think]: Put it with the rest. Monday's coming.`,
    },
  ],
  exits: ['taqueria', 'crime_lab', 'dorm', 'precinct', 'storage', 'detention'],
};

// ---------------------------------------------------------------------------

const taqueria: Location = {
  id: 'taqueria',
  name: 'Tacos El Güero — 1:04 AM',
  bg: 'taqueria',
  music: 'street',
  when: (g) => g.flag('c2_ortega_call'),
  enter: s`
    ~ Tacos El Güero, one in the morning. Two cab drivers, a cook watching boxing on his phone, and Tino behind the counter, because Tino's cousin owns the place. Tino's cousin owns a lot of places.
    @show ortega worried left
    @show tino grin right
    tino[grin]: Ezra! He's been here forty minutes. He ordered one horchata and he hasn't touched it. I'm worried about him.
    ortega[worried]: ...You came alone?
    ezra: My paralegal is in the parking lot with the engine running. That's as alone as I get.
    ortega[nervous]: Luis Ortega. I was on the stop. With Sergeant Kessler.
  `,
  hotspots: [
    { id: 'menu', label: 'Menu board', rect: [700, 150, 760, 260], script: s`~ AL PASTOR $2.50. I have been in this business long enough to know that the cheapest tacos in town are always the best ones.` },
    { id: 'window', label: 'Window', rect: [80, 170, 520, 360], script: s`~ Rosa's car in the lot, lights off, engine on. She waves. Then she makes a gesture that means "if this is a setup, I'm driving through the window."` },
    { id: 'fridge', label: 'Fridge', rect: [1440, 440, 140, 200], script: s`~ Jarritos in every color. Tino slides me a tamarind one without asking. Tino knows things.` },
  ],
  people: [
    {
      char: 'ortega',
      expr: 'worried',
      topics: [
        {
          id: 'why',
          label: 'Why did you call me?',
          script: async (g) => {
            await g.run(s`
              ortega[sad]: Because I saw it. On the stop. Sarge had me keep the kid at the curb. He went to the passenger side and leaned in. A long time. His hand went under the seat.
              ortega: Then he waited a minute, and called me over, and his camera was on, and he said "well, well, look what we've got."
              ortega[cry]: I told myself I didn't see it. That maybe he was just... looking. I've been telling myself that for five days.
              ezra: Was your camera on?
              ortega[worried]: The whole time. I hit record when he hit the lights. Like they teach us.
            `);
            await g.giveProfile('p_ortega');
            const how = await g.choose(
              [
                { label: '"I’ll subpoena you. Then it’s not your choice. That protects you."', value: 'protect', tag: 'HONEST', hint: 'Give him cover, not a threat.' },
                { label: '"Give me the footage, or I put you under oath and ask what you saw."', value: 'squeeze', tag: 'SHADY', hint: 'He came to you scared. Make him more scared.' },
              ],
              { prompt: 'He wants to do the right thing. He also wants a pension.' },
            );
            if (how === 'protect') {
              await g.run(s`
                ezra: Here's how this works, Luis. I subpoena you. You come to court because a judge made you. Nobody can say you volunteered against your sergeant.
                ortega[sad]: ...That's a real thing? You can do that?
                ezra: It's the most boring kind of courage. It's also the kind that keeps your job.
                @stat integrity 1
              `);
            } else {
              await g.run(s`
                ezra: Let me be clear, Officer. Either I get that footage tonight, or Monday I put you on the stand and ask you, under oath, what you saw that Sunday.
                ortega[worried]: ...You're not much better than him, are you?
                ezra: I'm a lot better than him. I'm just in a hurry.
                @stat notoriety 1
              `);
            }
            await g.run(s`
              ortega[serious]: Sarge tagged my video "no evidentiary value" so it'd never get pulled. But I keep copies. Here. And I printed his camera's log, too.
            `);
            await g.giveEvidence('c2_bodycam');
            await g.giveEvidence('c2_kesslercam');
            await g.run(s`
              ~ 10:21:14 AM, Ortega's camera: Kessler's hand under the passenger seat. Kessler's own camera wakes up at 10:22:31.
              ~ Put those two together, and you have a sergeant planting evidence off-camera.
            `);
          },
        },
        {
          id: 'afraid',
          label: 'Why didn’t you report it?',
          when: (g) => g.has('p_ortega'),
          script: s`
            ortega[sad]: Report it to who? He's Officer of the Year. Twice. Everybody in Narcotics owes him something. I'm two years in. I'd be the rat who lied about a hero.
            ortega[serious]: But that kid's facing twenty years. I couldn't eat. I couldn't sleep. So. Here I am at a taco stand at one in the morning.
          `,
        },
      ],
      present: {
        c2_report: s`ortega[mad]: "Odor of cannabis." There was no smell. I was standing right there. The car smelled like breakfast burritos.`,
        c2_phonelog: s`ortega[shock]: He was talking to the Pratt kid the night before? Sarge told us he'd never met him.`,
        c2_burnlog: s`ortega[worried]: Burns are supposed to have two witnesses. Gaines retired in April. Moved to Arizona. Nobody's asked him anything.`,
      },
      presentDefault: s`ortega[nervous]: I don't know about that. I just know what I saw.`,
    },
    {
      char: 'tino',
      expr: 'grin',
      topics: [
        {
          id: 'jojo',
          label: 'What do you know about Jonah Pratt?',
          script: s`
            tino[neutral]: Jojo? Sells to the rich kids up on the hill. Blues, mostly. He never gets popped. Not once. Three years.
            tino: You know who never gets popped, Ezra? People with friends. My cousin sold one dime bag in 2019 and they put him on the news.
            ~ The street always knows. It just doesn't get subpoenaed.
          `,
        },
        {
          id: 'video',
          label: 'Party videos?',
          when: (g) => !g.has('c2_cupphoto'),
          script: async (g) => {
            await g.run(s`tino[grin]: Got 'em. Kid screen-records everything. On the house — it's for Rosa's brother. Look at 12:34.`);
            await g.giveEvidence('c2_cupphoto');
          },
        },
      ],
      present: {
        c2_memo: s`tino[surprised]: "My guy's a cop." Oh, that's — Ezra, you be careful. Cops like that don't lose. They just make you disappear on paper.`,
      },
      presentDefault: s`tino[neutral]: That's above my pay grade, and my pay grade is very flexible.`,
    },
  ],
  exits: ['office', 'crime_lab', 'dorm', 'precinct', 'storage', 'detention'],
};

// ---------------------------------------------------------------------------

const crimeLab: Location = {
  id: 'crime_lab',
  name: 'SQPD Crime Lab',
  bg: 'crime_lab',
  music: 'investigate',
  enter: s`
    @outfit nand lab
    @show nand serious center
    nand[serious]: The judge threw out the stop. I read the transcript twice. "Deeply troubled."
    nand: I've been deeply troubled for a week, Mr. Vane. Close the door.
  `,
  hotspots: [
    { id: 'monitor', label: 'Monitor', rect: [470, 110, 660, 370], script: s`~ This time she leaves the monitor on. Two blue pills, magnified. The same nicked M. The same offset 3. Like fingerprints, stamped by the same broken machine.` },
    { id: 'fridge', label: 'Evidence fridge', rect: [1200, 120, 320, 440], script: s`~ The sign-in log on the fridge. Every name, every date. Kessler's signature appears eleven times this month. The next most frequent visitor signed in twice.` },
  ],
  people: [
    {
      char: 'nand',
      expr: 'serious',
      outfit: 'lab',
      topics: [
        {
          id: 'notes',
          label: 'What did you leave out of your report?',
          script: async (g) => {
            await g.run(s`
              nand[serious]: Press dies wear unevenly. Every counterfeit pill press leaves its own flaws. These tablets have a nicked M and an offset 3. I'd seen that exact stamp before.
              nand: In March. A big seizure, case 24-1187. I tested those too. Same die. Same machine.
              nand[worried]: I wrote it in my bench notes. My supervisor told me it was "beyond the scope of the request" and to take it out of the final report.
            `);
            await g.giveEvidence('c2_dienotes');
            await g.run(s`
              nand[serious]: So I looked up case 24-1187 in the property system. Where those pills are now.
            `);
            await g.giveEvidence('c2_burnlog');
            await g.run(s`
              nand[worried]: "Destroyed by incineration, March 14." Witnessed by Sergeant R. Kessler.
              nand: Pills that were burned in March don't show up in a dead girl's purse in October, Mr. Vane. Not unless they were never burned.
              ~ Two thousand four hundred pills "destroyed." Witnessed by the same man who arrested Teo.
            `);
          },
        },
        {
          id: 'testify',
          label: 'Will you testify to this?',
          when: (g) => g.has('c2_dienotes'),
          script: s`
            nand[worried]: If you subpoena me, I'll tell the truth. I can't volunteer it. I'd be fired before lunch.
            nand[sad]: That's how cowardice works in a government building. It's not one big lie. It's a hundred people who each leave one thing out.
            ezra: Then I'll subpoena you, and you can be the one person who didn't.
          `,
        },
      ],
      present: {
        c2_bodycam: s`nand[shock]: He put them there. Oh my God. And then he sent them to me to test, and I signed it. My name is on that.`,
        c2_memo: s`nand[sad]: "They say they burn it. It comes right back." Then the warehouse is our property room.`,
      },
      presentDefault: s`nand[neutral]: I can only speak to chemistry. But I'm starting to think chemistry is the only honest thing in this building.`,
    },
  ],
  exits: ['office', 'taqueria', 'dorm', 'precinct', 'storage', 'detention'],
};

// ---------------------------------------------------------------------------

const dorm: Location = {
  id: 'dorm',
  name: "Hadley Hall — Chloe's Room",
  bg: 'dorm',
  music: 'sad',
  enter: s`
    @outfit whitfield blazer
    @show whitfield sad center
    whitfield[sad]: I heard about the hearing. Sergeant Kessler called me. He said the judge "let a technicality win."
    whitfield[think]: Then my chief of staff read me the transcript. It didn't sound like a technicality.
  `,
  hotspots: [
    {
      id: 'laptop',
      label: "Chloe's laptop",
      again: (g) => g.flag('c2_password') && !g.has('c2_memo'),
      rect: [220, 440, 200, 120],
      script: async (g) => {
        if (!g.flag('c2_password')) {
          await g.run(s`~ Still locked. Her mother might know the password, if I can give her a reason to trust me with it.`);
          return;
        }
        if (g.has('c2_memo')) {
          await g.run(s`~ The voice memo folder, still open. Forty-one entries. "Day one" through "Day forty-one." She was counting.`);
          return;
        }
        await g.run(s`
          ~ The cloud backup has a folder called BLUE PIPELINE — AUDIO. Forty-one voice memos. The last one is from Thursday night, 11:48 PM.
          @music stop
          @show whitfield sad center
          [Chloe — voice memo]: Day forty-one. I'm at the Sigma house. He's drunk. Phone's in my sleeve. Okay. Okay.
          whitfield[cry]: ...That's her. That's her voice.
          [Young man — voice memo]: — nah, nah, listen. My guy's a cop, okay? The evidence room's basically my warehouse.
          [Young man — voice memo]: They say they burn it. Big fire, paperwork, whatever. It comes right back to me. Ha! Best supplier in the state.
          @sfx heartbeat
          whitfield[shock]: ...I know that voice. That's Jonah Pratt. He came to Chloe's sixteenth birthday party. He brought her a gift card.
        `);
        await g.giveEvidence('c2_memo');
        await g.run(s`
          @music sad
          whitfield[mad]: Mr. Vane. I spent five days demanding the maximum sentence for a boy who delivered her pizza.
          whitfield[serious]: Find who did this. Whoever it is. I don't care what badge they're wearing.
          @stat trust 1
        `);
      },
    },
    { id: 'board', label: 'Corkboard', rect: [60, 140, 500, 320], script: s`~ THE BLUE PIPELINE. "J.P." circled in red. And that sticky note: "Who coaches him? S.C.?" Chloe got further than anyone. Including me.` },
  ],
  people: [
    {
      char: 'whitfield',
      expr: 'sad',
      outfit: 'blazer',
      topics: [
        {
          id: 'password',
          label: "I need to see Chloe's laptop.",
          when: (g) => !g.flag('c2_password'),
          script: async (g) => {
            await g.run(s`
              whitfield[cold]: Why should I let the man defending her accused go through my daughter's private life?
              ezra: Because I don't think she was at that party to party. She was there to finish her story. And I think her story is why she's dead.
              ezra: She was writing about pills on campus, Councilwoman. The same pills that almost took her at sixteen. She was trying to stop them.
              whitfield[cry]: ...
              whitfield[sad]: "Biscuit2011." Our first dog, the year we got him. She used it for everything. I told her a hundred times it wasn't safe.
            `);
            g.setFlag('c2_password');
          },
        },
        {
          id: 'kessler',
          label: 'What has Kessler told you?',
          script: s`
            whitfield[think]: That he'd personally make sure the dealer never sold to another child. That he'd done this a hundred times. He held my hand at the hospital.
            whitfield[cold]: He was there by four in the morning. Before I'd even called anyone. I thought that meant he cared.
            ~ Narcotics, at the hospital, by 4 AM. For an overdose nobody had reported as a crime yet.
          `,
        },
      ],
      present: {
        c2_bodycam: s`whitfield[shock]: He planted — the man who held my hand at the hospital — planted —`,
        c2_phonelog: s`whitfield[mad]: Jonah called him. That night. Before she — and he never told me.`,
        c2_cupphoto: s`whitfield[cry]: She's holding her Limón. She drank it since she was a little girl. And he's handing her... oh, God.`,
      },
      presentDefault: s`whitfield[sad]: I don't know what that means anymore. I don't know what anything means.`,
    },
  ],
  exits: ['office', 'taqueria', 'crime_lab', 'precinct', 'storage', 'detention'],
};

// ---------------------------------------------------------------------------

const precinct: Location = {
  id: 'precinct',
  name: 'SQPD Narcotics Unit',
  bg: 'precinct',
  music: 'tension',
  enter: s`
    @outfit kessler tactical
    @show kessler cold left
    @show brandt neutral right
    kessler[cold]: The magic man. Back for an encore? You'll forgive me if I don't shake your hand. I'd want to count my fingers after.
    brandt[neutral]: ...
  `,
  hotspots: [
    { id: 'board', label: 'Arrest board', rect: [600, 120, 420, 270], script: s`~ ARRESTS THIS MONTH: 47. Seizures: 112 pounds. The more you seize, the more there is to "destroy." The more you destroy, the more you can sell.` },
    { id: 'plaque', label: 'Plaque', rect: [1180, 450, 200, 120], script: s`~ OFFICER OF THE YEAR. Two years running. It's easy to lead the county in seizures when you keep seizing the same pills.` },
  ],
  people: [
    {
      char: 'kessler',
      expr: 'cold',
      outfit: 'tactical',
      topics: [
        {
          id: 'sting',
          label: 'Give Kessler a reading.',
          tag: 'SHADY',
          when: (g) => g.has('c2_burnlog') && g.has('c2_bodycam') && !g.flag('c2_sting'),
          script: async (g) => {
            await g.run(s`
              ~ The old act. Silas taught it to me: you don't tell a mark what you know. You tell them what they're afraid you know, and you watch where they run.
              ezra: Sergeant. You know what I used to do, before law school? I read people. On stage. For money. Let me read you. Free of charge.
              kessler[annoyed]: Pass.
              ezra: You grew up with a father who kept score. Every grade, every game. You still keep score, don't you? Arrests. Seizures. Plaques.
              kessler[cold]: ...Cute.
              ezra: You've got a sister you're close to. Her husband, not so much — but he's useful. He's good at signing things.
              @sfx heartbeat
              kessler[sweat]: ...
              ezra: Oh, and a friendly tip, one professional to another. Internal Affairs is doing a full re-weigh of the property room Monday morning. Everything logged since March. I'd hate for there to be a discrepancy.
              ~ That last part is a lie. I made it up in the car. Now let's see if he believes it.
            `);
            const ok = await readTell(
              g,
              {
                char: 'kessler',
                expr: 'cold',
                outfit: 'tactical',
                line: 'IA can weigh whatever they want. I’ve got nothing to worry about.',
                tell: 'sweat',
                meanings: [
                  { label: 'He has something to move before Monday.', correct: true },
                  { label: "He's angry that you insulted his family." },
                  { label: "He knows you're bluffing." },
                ],
                insight: 'A bead of sweat at the hairline, in an air-conditioned office. He bought it. He’s already planning a drive tonight.',
              },
              { retry: true },
            );
            g.hideDialogue();
            g.setFlag('c2_sting');
            if (ok) {
              await g.run(s`
                ~ He has something stashed, and now he thinks a clock is running. Men like Ray don't wait for Monday. They move tonight.
                kessler[friendly]: Get out of my office, counselor. Before I find a reason to search your car.
              `);
            } else {
              await g.run(s`
                ~ I couldn't catch it. But he's rattled. Whatever he's hiding, he'll want to check on it.
                kessler[cold]: Get out of my office.
              `);
            }
          },
        },
      ],
      present: {
        c2_memo: s`
          kessler[cold]: A drunk college kid bragging at a party. You can't play that in court. Hearsay. Look it up.
          ~ He knows the law when it helps him.
        `,
        c2_burnlog: s`kessler[smirk]: I witness a lot of burns, counselor. It's called doing my job.`,
      },
      presentDefault: s`kessler[cold]: Run along, magic man.`,
    },
    {
      char: 'brandt',
      expr: 'neutral',
      topics: [
        {
          id: 'help',
          label: 'Want to catch a bad cop, Detective?',
          when: (g) => g.flag('c2_sting'),
          script: async (g) => {
            await g.run(s`
              brandt[annoyed]: What did you just do to him? He looks like he swallowed a lightbulb.
              ezra: I told him IA is re-weighing the property room on Monday. They're not. I think he has a stash, and I think he'll go check on it tonight.
              brandt[think]: ...If you're right, and you go in there without a warrant, nothing you find is worth a damn in court.
              brandt[serious]: Call me when you see where he goes. I'll get a judge out of bed if I have to. Legally.
            `);
            g.setFlag('c2_brandt_ready');
          },
        },
        {
          id: 'brandt',
          label: 'Whose side are you on?',
          script: s`
            brandt[serious]: The dead girl's.
            brandt: Twenty-eight years, Vane. I've arrested a lot of people I liked and let go a lot of people I didn't. That's the job. Ray forgot it was a job.
          `,
        },
      ],
      present: {
        c2_bodycam: s`brandt[mad]: ...Son of a — that's my department. That's my badge he's wearing.`,
        c2_phonelog: s`brandt[serious]: Good. Now it's a case.`,
      },
      presentDefault: s`brandt[neutral]: Not my case. Yet.`,
    },
  ],
  exits: ['office', 'taqueria', 'crime_lab', 'dorm', 'storage', 'detention'],
};

// ---------------------------------------------------------------------------

async function unit214(g: Game): Promise<void> {
  if (hasStash(g)) {
    await g.run(s`~ Unit 214. Rented two years ago by a Michael Doyle. Kessler's sister married a Michael Doyle. He's very good at signing things.`);
    return;
  }
  if (!g.flag('c2_brandt_ready')) await g.run(s`~ Brandt offered to get a warrant, if I'd asked him properly. I could still go back to the precinct and ask. Or there's Tino.`);
  const how = await g.choose(
    [
      { label: 'Call Brandt. Wait for a warrant.', value: 'warrant', tag: 'HONEST', hint: g.flag('c2_brandt_ready') ? 'Slow, and he might come back. But it holds up in court.' : 'Ask Brandt at the precinct first.', disabled: !g.flag('c2_brandt_ready') },
      { label: '"Tino. How good are you with padlocks?"', value: 'tino', tag: 'SHADY', hint: 'Fast. Also a felony, for someone.' },
      { label: 'Not yet.', value: 'wait' },
    ],
    { prompt: 'Unit 214. Right there.' },
  );
  if (how === 'wait') return;
  if (how === 'warrant') {
    await g.run(s`
      @call brandt
      brandt[serious]: Unit 214. I've got Ortega's statement and your footage in front of Judge Harmon right now. She's in her bathrobe and she is not happy. Give me ninety minutes.
      @call off
      @show rosa worried center
      rosa[worried]: Ninety minutes. What if he comes back?
      ezra: Then we watch him come back.
      @hide rosa
      @wait 600
      : 1:22 AM. Two unmarked cars. Detective Brandt, with a warrant in one hand and bolt cutters in the other.
      @show brandt serious center
      brandt[serious]: SQPD. Search warrant. ...Stand back, counselor. This one's mine.
      @sfx door
      @shake 1
      brandt[shock]: ...
      brandt[mad]: Property room bags. Case number 24-1187. Stamped DESTROYED. Must be a thousand pills in here.
      @stat integrity 1
    `);
    await g.giveEvidence('c2_stash');
  } else {
    await g.run(s`
      @show rosa serious center
      rosa[serious]: Do it.
      ~ Rosa Quintero, the conscience of this office, just told a man to commit a burglary. I have never loved her more, and I've never been more worried.
      @sfx phone
      @call tino
      tino[grin]: Padlocks? Ezra, please. I'm insulted. Give me nine minutes and don't look at me while I work. It's a whole thing.
      @call off
      @hide rosa
      @wait 700
      @sfx door
      : Unit 214. A folding table, a scale, and two cardboard boxes nobody had time to carry out.
      : Inside: plastic bags with red SQPD evidence tape. CASE #24-1187. DESTROYED 3/14.
      @sfx paper
      @flash
      ~ I take forty photos. Tino locks it back up so carefully you'd never know. Then he asks me for gas money.
      @stat notoriety 2
    `);
    await g.giveEvidence('c2_photos');
    await g.run(s`~ The judge is going to hate how I got these. But the jury is going to see them.`);
  }
  g.setFlag('c2_stash_found');
}

const storage: Location = {
  id: 'storage',
  name: 'SafeKeep Self Storage — 11:46 PM',
  bg: 'storage',
  music: 'tension',
  when: (g) => g.flag('c2_sting'),
  enter: s`
    ~ Rosa followed his truck from the precinct lot. Forty minutes of side streets. He doubled back twice. Cops know how to be followed. They don't expect a paralegal in a 2009 Corolla.
    ~ SafeKeep Self Storage, off the 101. He punched in a gate code, drove to the end of row two, and opened unit 214.
    @show rosa worried center
    rosa[worried]: He's carrying duffel bags out. Two. Three. Ezra, he's moving it.
    ~ Eleven minutes later his taillights are gone. Unit 214 is locked again. Whatever's left inside is the only proof that the property room is a pharmacy.
  `,
  hotspots: [
    { id: 'unit', label: 'Unit 214', rect: [400, 330, 120, 260], again: (g) => !hasStash(g), script: unit214 },
    { id: 'gate', label: 'Gate keypad', rect: [700, 520, 200, 80], script: s`~ The keypad logs every code. Brandt says Kessler's brother-in-law's code was used fourteen times this year. Michael Doyle lives in Phoenix.` },
  ],
  people: [],
  exits: ['office', 'taqueria', 'crime_lab', 'dorm', 'precinct', 'detention'],
};

// ---------------------------------------------------------------------------

const detention: Location = {
  id: 'detention',
  name: 'County Detention — Visiting Room',
  bg: 'detention',
  music: 'sad',
  enter: s`
    @outfit teo jail
    @show teo sad center
    teo[sad]: Rosie told me you turned down the deal. Even the probation one.
    teo[serious]: Thanks. I mean it. I couldn't — I couldn't be that guy. Even on paper.
  `,
  hotspots: [{ id: 'glass', label: 'The glass', rect: [330, 200, 300, 90], script: s`~ Somebody scratched a calendar into the counter on the inmate side. Teo has added five lines to it.` }],
  people: [
    {
      char: 'teo',
      expr: 'sad',
      outfit: 'jail',
      topics: [
        {
          id: 'okay',
          label: 'How are you holding up?',
          script: s`
            teo[sad]: My cellmate snores like a leaf blower and the food is gray. But some guy on my block knew Chloe's article was coming out. He said everybody on campus knew someone was writing about the blues.
            teo[serious]: She was brave, man. I didn't know she was that brave.
          `,
        },
        {
          id: 'monday',
          label: 'Monday.',
          script: s`
            teo[worried]: What happens Monday?
            ezra: Monday we pick a jury. Then we tell them the truth, in the right order, until it's impossible not to believe.
            teo[nervous]: ...Is that a lawyer thing or a magic thing?
            ezra: Same thing, done honestly.
          `,
        },
      ],
      present: {
        c2_bodycam: s`teo[shock]: I KNEW he was in there too long! I told you! I told you!`,
        c2_memo: s`teo[sad]: That's Jojo Pratt. He threw the party? He's the — oh my God.`,
      },
      presentDefault: s`teo[nervous]: Is that good? It looks like it might be good.`,
    },
  ],
  exits: ['office', 'taqueria', 'crime_lab', 'dorm', 'precinct', 'storage'],
};

// ---------------------------------------------------------------------------

function hint(g: Game): string {
  if (!g.has('c2_bodycam')) return 'The officer from the stop wants to meet. Tacos El Güero, 1 a.m.';
  if (!g.has('c2_dienotes')) return 'Dr. Nand said to come back after the hearing. The crime lab.';
  if (!g.has('c2_memo')) return "Chloe's laptop. Her mother has the password. Be gentle with her.";
  if (!g.flag('c2_sting')) return 'You have enough to scare Kessler. Go to the Narcotics Unit and do the thing you do.';
  if (!g.flag('c2_brandt_ready') && !hasStash(g)) return 'Before you go anywhere tonight, ask Brandt if he wants in. Legally.';
  if (!hasStash(g)) return 'He took the bait. SafeKeep Storage, tonight.';
  if (!g.has('c2_phonelog')) return 'Brandt has news. Talk to me at the office.';
  if (!g.has('c2_cupphoto')) return "We still need that party video. Tino's at the taqueria.";
  return 'That’s everything. Make your deductions on the board, then let’s go pick a jury.';
}

export const CASE2_INV2: InvestigationDef = {
  id: 'c2inv2',
  start: 'office',
  locations: { office, taqueria, crime_lab: crimeLab, dorm, precinct, storage, detention },
  ready: (g) => REQUIRED.every((id) => g.has(id)) && hasStash(g) && g.has('p_ortega'),
  finishLabel: 'Monday: jury selection',
  finish: async (g) =>
    g.choose(
      [
        { label: 'We’re ready. Let’s pick a jury.', value: true },
        { label: 'Not yet.', value: false },
      ],
      { prompt: 'Monday, 9 AM. Silas Crane will be sitting next to Strand. Ready?' },
    ),
  hint,
};

export const inv2Scene: SceneFn = async (g) => {
  await investigate(g, CASE2_INV2);
  return 'c2_jury';
};
