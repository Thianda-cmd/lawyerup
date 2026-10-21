import { s } from '../../engine/dsl';
import type { Game, SceneFn } from '../../engine/game';
import type { InvestigationDef, Location } from '../../systems/investigation';
import { investigate } from '../../systems/investigation';
import { readTell } from '../../systems/readTell';

const REQUIRED_EVIDENCE = ['program', 'autopsy', 'statuette', 'forensics', 'cape', 'glove', 'floorplan', 'cuesheet', 'still', 'stopwatch', 'tag', 'glitter', 'ledger'];
const REQUIRED_PROFILES = ['p_corvin', 'p_iris', 'p_benny'];

const theaterOpen = (g: Game) => g.flag('met_corvin');

// ---------------------------------------------------------------------------

const tinoCall = async (g: Game): Promise<void> => {
  await g.run(s`
    rosa[think]: Eight hundred people watched that show. Somebody had their phone out during the balcony reveal. Somebody always does.
    ezra: Then we call the man with two phones.
    @sfx phone
    @call tino
    tino[grin]: Ezra Vane! My favorite lawyer that owes me money!
    ezra: Tino. I need a photo. Paramount Theater, Friday night, the balcony reveal around 9:46. Somebody in that audience posted it, I guarantee it.
    tino: Already ahead of you, hermano. Kid from the third row's been trying to sell it to Channel 6. I can get it to you. For a modest finder's fee.
  `);
  const pay = await g.choose(
    [
      { label: 'Pay the $200 finder’s fee', value: 'pay', tag: 'HONEST' },
      { label: '"Remember the DUI I made disappear?"', value: 'favor', tag: 'SHADY' },
      { label: 'Not right now', value: 'no' },
    ],
    { prompt: 'Tino is waiting. Tino is always waiting.' },
  );
  if (pay === 'no') {
    await g.run(s`
      tino: Your loss, counselor. Offer's open. Tino is always open.
      @call off
    `);
    return;
  }
  if (pay === 'pay') {
    await g.run(s`
      ezra: Two hundred. Not a cent more.
      tino[grin]: Pleasure doing business. Check your phone.
      @stat money -200
    `);
  } else {
    await g.run(s`
      ezra: Tino. Remember that DUI? The one where the breathalyzer "malfunctioned"?
      tino: ...Okay, okay. On the house. But this squares us.
      @stat notoriety 1
    `);
  }
  await g.run(s`
    @call off
    @evidence photo
    ~ The balcony reveal. One white glove raised in the spotlight... and the other hand hidden in the cape.
    ~ Corvin's signature pose is both arms flung wide. Every poster. Every show. Except this one.
  `);
};

const office: Location = {
  id: 'office',
  name: 'Vane & Associates',
  bg: 'office',
  music: 'office',
  hotspots: [
    {
      id: 'poster',
      label: 'Old poster',
      rect: [1200, 110, 250, 350],
      script: s`
        ~ THE GREAT VANE. HE KNOWS WHAT YOU'RE THINKING.
        ~ He didn't, of course. A man named Silas Crane fed him every "psychic" answer through a hidden earpiece. Names, birthdays, dead relatives.
        ~ It was a good act. Right up until it ruined somebody's life.
        ~ ...I keep it up there so I don't forget.
      `,
    },
    {
      id: 'diploma',
      label: 'Diploma',
      rect: [930, 160, 210, 160],
      script: s`
        ~ Juris Doctor, Pacific Isles Correspondence School of Law. Fully accredited. Mostly.
        ~ Passed the bar on the third try. The first two times, I was overconfident. The third time, I was broke. Broke is a great study partner.
      `,
    },
    {
      id: 'window',
      label: 'Window',
      rect: [110, 100, 660, 480],
      script: s`
        ~ The Plaza del Sol strip mall. Checks cashed, nails done, wills contested.
        ~ The "OPEN" sign is backwards from in here. Rosa says it's a metaphor. I say it's a sign. Literally.
      `,
    },
    {
      id: 'cabinet',
      label: 'Filing cabinet',
      rect: [1450, 360, 140, 340],
      script: s`
        ~ Top drawer: active cases. Middle drawer: closed cases. Bottom drawer: takeout menus, organized by how much they'll let me run a tab.
        ~ The bottom drawer is the fullest.
      `,
    },
    {
      id: 'cards',
      label: 'Deck of cards',
      rect: [1410, 640, 180, 140],
      script: s`
        ~ An old Bicycle deck, soft as cloth from handling. Corvin taught me the pass with a deck just like this one.
        ~ "The trick is never in the hands, kid. It's in where you make them look."
      `,
    },
    {
      id: 'mug',
      label: 'Mug',
      rect: [1285, 640, 120, 110],
      script: s`
        ~ "#1 LAWYER." Rosa bought it for me as a joke.
        ~ I drink out of it every day, so who's laughing now? ...Still Rosa, probably.
      `,
    },
  ],
  people: [
    {
      char: 'rosa',
      expr: 'neutral',
      topics: [
        {
          id: 'case',
          label: 'The case',
          script: s`
            rosa[serious]: Leon Sable, 58, owned the Paramount. Killed in his office during Corvin's show, sometime between 9:40 and 9:50.
            rosa: The police say Corvin slipped out during his big disappearing act and came back before anyone noticed.
            ezra: The perfect alibi turned inside out. Nobody can see you while you're invisible.
            rosa[think]: Which means nobody can swear you weren't killing your producer, either.
          `,
        },
        {
          id: 'corvin',
          label: 'Corvin Mallory',
          script: s`
            rosa: So how do you know him? Really.
            ezra: We shared a bill in Reno. He was the headliner, I was the opening act who "read minds."
            ezra: He saw right through me on the first night. Bought me a drink and said, "You've got good hands and a bad conscience. Pick one."
            rosa[smile]: And you picked law school.
            ezra: Eventually. After the conscience picked me.
          `,
        },
        {
          id: 'tino',
          label: 'Call Tino?',
          tag: 'SIDE',
          when: (g) => g.flag('saw_stage') && !g.has('photo'),
          script: tinoCall,
        },
        {
          id: 'plan',
          label: 'What now?',
          script: async (g) => {
            if (!g.flag('met_corvin')) await g.say('rosa', "Go see the client, Ezra. County Detention. Before he says something dumb to a cop.", { expr: 'annoyed' });
            else if (!g.flag('office_open')) await g.say('rosa', "The Paramount. The detective in charge is still working the scene — maybe we can sweet-talk our way into Sable's office.", { expr: 'think' });
            else await g.say('rosa', "We've got a lot of pieces. Make sure you've checked everything at the theater — and try the Deduction Board in the Court Record.", { expr: 'smile' });
          },
        },
      ],
      present: {
        badge: s`rosa[annoyed]: Yes, Ezra, I know you're a lawyer. I've seen the bus bench.`,
        still: s`
          rosa[think]: A guy in a cape under an EXIT sign. Exit signs are always mounted at the same height, you know — fire code. My cousin's an inspector.
          ~ Interesting. If I knew exactly how tall that sign was...
        `,
        ledger: s`rosa[serious]: Forty thousand dollars. People have killed for a lot less, Ezra.`,
      },
      presentDefault: s`rosa[think]: Hm. Hang onto that. Might matter in court.`,
    },
  ],
  exits: ['detention', 'stage', 'corridor', 'dressing', 'sable_office'],
};

// ---------------------------------------------------------------------------

const detention: Location = {
  id: 'detention',
  name: 'County Detention — Visiting Room',
  bg: 'detention',
  music: 'investigate',
  enter: s`
    @outfit corvin jail
    @show corvin sad center
    corvin[sad]: Ezra Vane. The Great Vane, in a necktie.
    corvin[smile]: Iris found you. Of course she did. She always finds what I need before I know I need it.
    ezra: You look terrible, Corvin.
    corvin: Orange is not my color. I have asked them for something in black. They laughed.
  `,
  hotspots: [
    { id: 'clock', label: 'Clock', rect: [750, 100, 100, 100], script: s`~ 10:17. Twenty minutes per visit. The clock in here is the only thing that moves.` },
    { id: 'sign', label: 'Sign', rect: [330, 200, 300, 90], script: s`~ "NO CONTACT." The glass between us is thick enough to stop a bullet and thin enough to see a man come apart.` },
    { id: 'phone', label: 'Phone', rect: [20, 300, 130, 220], script: s`~ The receiver smells like a thousand other people's bad days.` },
  ],
  people: [
    {
      char: 'corvin',
      expr: 'sad',
      outfit: 'jail',
      topics: [
        {
          id: 'night',
          label: 'What happened Friday night?',
          script: async (g) => {
            await g.run(s`
              corvin[neutral]: The same thing that happens every night. At 9:42 I stepped into the cabinet. The trap dropped. I went beneath the stage.
              corvin: At 9:47 the lift brought me back up through the floor, to rather generous applause. At 9:50, bows.
              corvin[sad]: At 11:30, a detective put handcuffs on me in my own dressing room.
              ezra: And between 9:42 and 9:47?
              corvin: I was under the stage. Alone. Doing what a magician does in the dark.
              ezra: Which is?
              corvin[smug]: Never you mind.
              corvin: Here. Take this — a program from Friday. Signed, even. It may be worth something when I'm dead.
            `);
            await g.giveEvidence('program');
            await g.giveProfile('p_corvin');
            g.setFlag('met_corvin');
            await g.run(s`~ Five minutes, alone, under a stage. Not much of an alibi. I need to see the Paramount.`);
          },
        },
        {
          id: 'vanishing',
          label: 'How does the Vanishing work?',
          tag: 'READ',
          when: (g) => g.flag('met_corvin'),
          script: async (g) => {
            await g.run(s`
              ezra: Corvin. How does the Vanishing work?
              corvin[mad]: Absolutely not.
              ezra: You're facing life in prison.
              corvin[serious]: Then I will face it with my secrets intact. A magician never reveals, Ezra. You know that better than anyone.
              ~ He's hiding something. Let's see what.
            `);
            const ok = await readTell(
              g,
              {
                char: 'corvin',
                expr: 'serious',
                outfit: 'jail',
                line: 'The Vanishing is my life’s work. I will not reveal it. Not to you. Not to anyone.',
                tell: 'eyes',
                meanings: [
                  { label: "He's protecting the secret of the trick." },
                  { label: "He's protecting a person.", correct: true },
                  { label: "He's afraid of going to prison." },
                ],
                insight: 'His eyes went to the door — to whoever might walk through it. It isn’t the trick he’s guarding. It’s a person.',
              },
              { retry: true },
            );
            g.hideDialogue();
            if (ok) {
              g.setFlag('read_corvin');
              await g.run(s`
                ~ Corvin Mallory would go to prison for a magic trick. But he's not doing this for the trick.
                ~ Someone else is inside that secret with him.
              `);
            } else {
              await g.run(s`corvin[smug]: Stop looking at me like that, Ezra. I invented that look.`);
            }
          },
        },
        {
          id: 'sable',
          label: 'Leon Sable',
          when: (g) => g.flag('met_corvin'),
          script: s`
            corvin[sad]: Leon gave me a home when Vegas decided I was a nostalgia act. Nine years at the Paramount.
            corvin: Lately the houses were thin. He worried about money constantly. We argued last week — about the contract, about the future.
            ezra: The police will call that motive.
            corvin[mad]: The police would call a sneeze a motive.
          `,
        },
        {
          id: 'iris',
          label: 'Iris',
          when: (g) => g.flag('met_corvin'),
          script: async (g) => {
            await g.run(s`
              corvin[smile]: My Iris. My assistant, my wife, my manager. She handles everything that isn't magic — the bookings, the payroll, the box office.
              corvin: I couldn't balance a checkbook if you held a sword to my throat. Iris says it's my most charming quality.
              ~ He lights up when he talks about her. That's not an act.
            `);
            await g.giveProfile('p_iris');
          },
        },
        {
          id: 'twocapes',
          label: 'The bloody cape',
          when: (g) => g.has('cape'),
          script: s`
            corvin[serious]: That cape is not mine. I wore my cape for the bows. Eight hundred people saw it.
            ezra: Then whose is it?
            corvin[sad]: ...
            corvin: I can't say, Ezra.
            ~ Can't. Not won't. Can't.
          `,
        },
      ],
      present: {
        program: s`corvin[smile]: Keep it. Call it a retainer bonus.`,
        cape: s`corvin[serious]: It is not mine. That is all I'll say about it.`,
        tag: s`
          corvin[shock]: Where did you get that?
          corvin[serious]: ...It's an old hanger. It means nothing.
          ~ His voice went up half a step. It means something.
        `,
        still: s`corvin[mad]: That is not me. I don't hunch. Thirty years of posture, Ezra.`,
        ledger: s`
          corvin[surprised]: Forty thousand? From the box office? I never touched the box office. Iris handles...
          corvin[shock]: ...
          corvin[sad]: Leon must have been mistaken. That's all.
        `,
        statuette: s`corvin[sad]: My Golden Wand. I gave it to Leon the night we opened. I told him it was so he'd never forget who filled his seats.`,
        forensics: s`corvin: Of course my fingerprints are on it. I handed it to him. Nine years ago.`,
        photo: s`corvin[surprised]: One arm? That's... not the pose. The pose is both arms. It's always both arms.`,
      },
      presentDefault: s`corvin[neutral]: I'm a magician, Ezra, not a detective. I'm afraid that means nothing to me.`,
    },
  ],
  exits: ['office', 'stage', 'corridor', 'dressing', 'sable_office'],
};

// ---------------------------------------------------------------------------

const stage: Location = {
  id: 'stage',
  name: 'Paramount Theater — Stage',
  bg: 'stage',
  music: 'investigate',
  when: theaterOpen,
  enter: s`
    ~ The Paramount. Built in 1931, faded since about 1932. Still beautiful, in the way old things are when the lights are low.
    @show benny nervous center
    benny[nervous]: Whoa — hey. Theater's closed. Cops said nobody’s supposed to— who are you?
    ezra: Ezra Vane. I represent Corvin Mallory.
    benny[sweat]: Oh. Oh, great. The lawyer.
  `,
  hotspots: [
    {
      id: 'cabinet',
      label: 'The cabinet',
      rect: [700, 270, 200, 390],
      script: s`
        ~ THE VANISHING. Black lacquer, painted stars, a door with no visible hinges. Gorgeous.
        ~ The floor of the cabinet drops away on a spring trap. Corvin falls through into the trap room below, the door swings open, and the audience sees an empty box.
        ~ Oldest trick in the book. Still works, because nobody ever looks down.
      `,
    },
    {
      id: 'trap',
      label: 'Trap door',
      rect: [660, 655, 280, 70],
      script: s`
        ~ The trap door, and beside it the stage lift. Corvin goes down through one and comes back up on the other.
        ~ There's a smoke vent here too — a brass grate in the floor. The smoke machine must be in the trap room underneath.
      `,
    },
    {
      id: 'balcony',
      label: 'Spotlight & balcony',
      rect: [1080, 0, 260, 150],
      script: s`
        ~ The follow-spot's aimed up at the balcony. That's where Corvin "reappears" at 9:46, in a blinding spotlight.
        ~ Four minutes from cabinet to balcony, through a crowded theater, without being seen. That's either real magic or a very good trick.
        ~ And I don't believe in real magic.
      `,
    },
    {
      id: 'curtain',
      label: 'Curtains',
      rect: [0, 100, 210, 640],
      script: s`~ Red velvet, heavy as a lie. Behind the stage-left curtain, a ladder goes down to the trap room. Stage left is also where the wings connect to the backstage corridor.`,
    },
    {
      id: 'seats',
      label: 'Seats',
      rect: [0, 830, 1600, 70],
      script: s`~ Eight hundred seats, and on a Friday night, maybe half of them filled. Sable's money problems were sitting right here in the empty rows.`,
    },
  ],
  people: [
    {
      char: 'benny',
      expr: 'nervous',
      topics: [
        {
          id: 'saw',
          label: 'What did you see?',
          script: async (g) => {
            await g.run(s`
              benny[nervous]: I already told the cops. Around 9:44 I'm in the corridor, and I see Corvin go into Mr. Sable's office. Cape, collar, red lining. Him.
              ezra: You saw his face?
              benny[sweat]: Well — no. His back was to me. But nobody else wears that cape, man. Nobody.
            `);
            await g.giveProfile('p_benny');
            g.setFlag('saw_stage');
          },
        },
        {
          id: 'post',
          label: 'Where were you supposed to be?',
          tag: 'READ',
          when: (g) => g.has('p_benny'),
          script: async (g) => {
            await g.run(s`
              ezra: During the Vanishing, Benny. What's your job?
              benny: Fly rail. Stage left. I drop the curtain at 9:46 when the spotlight hits the balcony.
              ezra: Then what were you doing in the corridor at 9:44?
              benny[nervous]: I was... going to the restroom. Like a normal person.
            `);
            const ok = await readTell(
              g,
              {
                char: 'benny',
                expr: 'nervous',
                line: 'I was just going to the restroom, okay? That’s all.',
                tell: 'sweat',
                meanings: [
                  { label: "He's lying about why he was in the corridor.", correct: true },
                  { label: "He's terrified of Corvin." },
                  { label: "He's grieving for Sable." },
                ],
                insight: 'A bead of sweat, right on cue. He wasn’t going to any restroom. He was in that corridor for a reason he can’t afford to say out loud.',
              },
              { retry: true },
            );
            g.hideDialogue();
            if (ok) {
              g.setFlag('read_benny');
              await g.run(s`
                ezra: The staff restroom is right off the stage-left wing, Benny. You went the other way.
                benny[sweat]: I — hey, look, I gotta check the rigging. Are we done? We're done.
                ~ He's not the killer. Killers don't sweat that honestly. But he's hiding something, and Strand will put him on the stand.
              `);
            }
          },
        },
        {
          id: 'trap',
          label: 'The trap room',
          when: (g) => g.has('p_benny'),
          script: s`
            benny: Corvin drops in at 9:42 and comes up on the lift at 9:47. Nobody else goes down there during the act. One-man show, under there.
            benny: He fires the smoke by hand, too. The machine's down in the trap room. You hear it go — fwoomp — right on cue.
            ezra: Every night?
            benny: Every night, nine years. Corvin's never missed a cue in his life.
          `,
        },
        {
          id: 'cues',
          label: 'The cue log',
          when: (g) => g.has('p_benny'),
          script: async (g) => {
            await g.run(s`
              ezra: Does the stage manager keep a log?
              benny: Sure. Dot logs every cue to the second. She's a machine. Here — there's a copy on the board.
            `);
            await g.giveEvidence('cuesheet');
            await g.run(s`~ 9:44:10 — smoke fired "from below." From the trap room. While Benny says he saw "Corvin" upstairs in the corridor.`);
          },
        },
      ],
      present: {
        still: s`
          benny: That's the corridor cam. See? Cape. Told ya.
          ezra: You can't see a face.
          benny[annoyed]: You can't see a face on Batman either, and everybody knows it's Batman.
        `,
        cuesheet: s`benny[think]: Smoke at 9:44, yeah. Corvin fires it from below... huh. Weird, right? Whatever. Guy's a magician.`,
        cape: s`benny[nervous]: That's his cape. The one I saw. I think. Probably.`,
        ledger: s`benny[sweat]: M-money? I don't know nothin' about money. I don't even get paid half the time.`,
        tag: s`benny: Costume stuff's Iris's department. I just hang things from the ceiling.`,
      },
      presentDefault: s`benny[nervous]: Man, I just work here.`,
    },
  ],
  exits: ['office', 'detention', 'corridor', 'dressing', 'sable_office'],
};

// ---------------------------------------------------------------------------

const corridor: Location = {
  id: 'corridor',
  name: 'Paramount Theater — Backstage',
  bg: 'corridor',
  music: 'investigate',
  when: theaterOpen,
  enter: s`
    @show brandt annoyed center
    brandt[annoyed]: Hold it. This is an active crime scene.
    ezra: Ezra Vane. Counsel for Corvin Mallory.
    brandt[smug]: The bus bench guy. "Need a lawyer? Need Vane." My wife laughs every time we drive past it.
    ezra: I'm glad I bring joy into your marriage, Detective.
    brandt[neutral]: Lyle Brandt, Homicide. Twenty-eight years. I've seen a hundred guys like you, Vane. Your client did it. Save yourself the embarrassment.
  `,
  hotspots: [
    {
      id: 'door',
      label: "Sable's office",
      rect: [150, 150, 210, 620],
      script: async (g) => {
        if (g.flag('office_open')) await g.run(s`~ Leon Sable's office. Brandt said I've got five minutes. I should make them count.`);
        else await g.run(s`~ Police tape across the door. I'll need Brandt's permission to go in. Asking nicely might work. Asking annoyingly might work faster.`);
      },
    },
    {
      id: 'exit',
      label: 'EXIT sign',
      rect: [745, 305, 110, 55],
      script: s`
        ~ A green EXIT sign over the stairwell door. Mounted at regulation height, like every exit sign in America.
        ~ Somewhere there's a fire code that says exactly how high. Probably on that fire map.
      `,
    },
    {
      id: 'stairs',
      label: 'Balcony stairwell',
      rect: [725, 370, 150, 195],
      again: (g) => g.has('glove') && g.has('floorplan') && !g.has('stopwatch'),
      script: async (g) => {
        await g.run(s`~ The stairwell up to the balcony. There's a trash bin on the landing.`);
        if (!g.has('glove')) {
          await g.run(s`~ Empty now. The police cleared it. I should ask Brandt what they found.`);
          return;
        }
        if (!g.has('floorplan')) {
          await g.run(s`~ That's where they found the bloody glove. I should get a sense of the layout back here first.`);
          return;
        }
        if (g.has('stopwatch')) {
          await g.run(s`~ Ninety-two seconds from the wings to the balcony. Rosa didn't even break a sweat.`);
          return;
        }
        await g.run(s`
          @show rosa think center
          rosa[think]: The glove was found here. So whoever dropped it was going UP to the balcony. Not back toward the stage.
          ezra: During the Vanishing, someone needs to get from the wings to the balcony by 9:46. How long does that take?
          rosa[smile]: Only one way to find out. Time me.
          @hide rosa
          @sfx whoosh
          @wait 900
          @sfx click
          @show rosa smile center
          rosa[smile]: Stage-left wing, down the corridor, up the stairs, into the balcony. One minute, thirty-two seconds. Walking.
          ezra: So whoever made that trip would have had time to spare.
          rosa[serious]: About two minutes of it.
        `);
        await g.giveEvidence('stopwatch');
        g.hide('rosa');
      },
    },
    {
      id: 'camera',
      label: 'Security camera',
      rect: [1330, 30, 130, 120],
      script: s`~ A security camera, pointed straight down the corridor toward the stairwell. The little red light means it's recording. Brandt will have the footage.`,
    },
    {
      id: 'map',
      label: 'Fire exit map',
      rect: [995, 300, 140, 195],
      script: async (g) => {
        await g.run(s`
          ~ A fire evacuation map of the backstage area. Rosa snaps a photo of it.
          ~ The trap room ladder comes up in the stage-left wing. The corridor runs away from it — past Sable's office, to the balcony stairs.
        `);
        await g.giveEvidence('floorplan');
      },
    },
    {
      id: 'poster',
      label: 'Corvin poster',
      rect: [1170, 150, 250, 380],
      script: s`~ THE AMAZING CORVIN. Arms flung wide, cape spread like wings. Thirty years of the same pose. A silhouette people would recognize anywhere. That's the point of a silhouette.`,
    },
  ],
  people: [
    {
      char: 'brandt',
      expr: 'neutral',
      topics: [
        {
          id: 'scene',
          label: 'The crime scene',
          script: async (g) => {
            await g.run(s`
              brandt: Leon Sable. Found at 10:05 by the stagehand, on his office floor. One blow to the left temple. Coroner puts it between 9:40 and 9:50.
            `);
            await g.giveEvidence('autopsy');
            await g.run(s`
              brandt: Weapon was right next to him. A brass award — the "Golden Wand." Belonged to your client.
            `);
            await g.giveEvidence('statuette');
            await g.giveProfile('p_sable');
          },
        },
        {
          id: 'physical',
          label: 'Evidence against Corvin',
          when: (g) => g.has('autopsy'),
          script: async (g) => {
            await g.run(s`
              brandt[smug]: Where do I start? His prints are on the murder weapon. Here — the lab report. Read it and weep.
            `);
            await g.giveEvidence('forensics');
            await g.run(s`
              brandt: And after the show we searched the trap room — where he says he was "alone in the dark." Found this stuffed behind the lift machinery.
            `);
            await g.giveEvidence('cape');
            await g.run(s`
              brandt: His cape. Soaked in Sable's blood. Case closed, counselor.
              ~ The cape's tag says 52 inches. And there's "gold particulate" on the collar. Brandt didn't mention that part.
            `);
          },
        },
        {
          id: 'glove',
          label: 'Anything else?',
          when: (g) => g.has('cape'),
          script: async (g) => {
            await g.run(s`
              brandt: A bloody stage glove. White silk, same as in his act. In the trash on the balcony stairwell landing.
            `);
            await g.giveEvidence('glove');
            await g.run(s`~ The balcony stairwell. That's at the far end of the corridor. Not exactly on the way back to the trap room.`);
          },
        },
        {
          id: 'camera',
          label: 'The security footage',
          when: (g) => g.has('autopsy'),
          script: async (g) => {
            await g.run(s`
              brandt: The corridor camera caught your boy at 9:44:31, walking toward the stairs in full costume. I printed you a still. Professional courtesy.
            `);
            await g.giveEvidence('still');
            await g.run(s`
              ~ Back to the camera. Cape, collar... and he's walking right under the EXIT sign.
              ~ Brandt's even marked it: the top of the head is 17 inches below the sign. If I knew how high that sign was — and how tall Corvin is — I could put them together on the board.
            `);
          },
        },
        {
          id: 'office',
          label: 'Can I see the office?',
          when: (g) => g.has('autopsy') && !g.flag('office_open'),
          script: async (g) => {
            await g.run(s`
              brandt[annoyed]: Absolutely not.
              ezra: The defense has a right to inspect the scene, Detective. I could file a motion. A long one. With exhibits. And I type with two fingers.
              brandt[annoyed]: ...Five minutes. Touch nothing. And if you breathe on my evidence, I'll arrest you for assault on a crime scene.
              ezra: That's not a real charge.
              brandt[smug]: Try me.
            `);
            g.setFlag('office_open');
          },
        },
      ],
      present: {
        forensics: s`
          brandt[annoyed]: Yeah, yeah, the prints are old. Doesn't matter. He wore gloves. We got the glove.
          ~ He knows the prints are weak. He's betting the glove covers it.
        `,
        still: s`brandt: Six-foot-two of guilty magician. You can see it from here.`,
        cuesheet: s`brandt[think]: Smoke at 9:44 from the trap room. So he fires it, climbs out, does the deed. The office is a minute away. Timeline works fine.`,
        stopwatch: s`brandt[think]: Ninety seconds to the balcony? Huh. ...So what. He wasn't going to the balcony. He was coming back.`,
        ledger: s`
          brandt[surprised]: Where'd you get that? ...From the safe? We inventoried that safe.
          brandt[annoyed]: "M." Mallory. Thanks for the motive, counselor.
        `,
        glove: s`brandt: Right hand. Expensive silk. The kind a guy wears when he's pulling rabbits out of hats. Or murdering producers.`,
        badge: s`brandt[smug]: Laminated twice? You know that makes it look fake, right?`,
      },
      presentDefault: s`brandt[annoyed]: Is this going somewhere, Vane? I have a murder to close.`,
    },
  ],
  exits: ['stage', 'sable_office', 'dressing', 'office', 'detention'],
};

// ---------------------------------------------------------------------------

const sableOffice: Location = {
  id: 'sable_office',
  name: "Leon Sable's Office",
  bg: 'sable_office',
  music: 'tension',
  when: (g) => g.flag('office_open'),
  enter: s`
    ~ Leon Sable's office. Wood paneling, theater posters, a window full of city lights.
    ~ And a tape outline on the carpet where the man who owned all of this used to be.
  `,
  hotspots: [
    {
      id: 'outline',
      label: 'Tape outline',
      rect: [110, 740, 350, 160],
      script: s`
        ~ He fell beside the plinth, facing the door. He saw whoever came in.
        ~ And whoever came in was someone he let get close enough to pick up a statuette from his own shelf.
      `,
    },
    {
      id: 'plinth',
      label: 'Empty plinth',
      rect: [195, 495, 135, 255],
      script: s`
        ~ An empty plinth with a brass plate: GOLDEN WAND — C. MALLORY, 2015. There's a clean ring in the dust where the statuette stood.
        ~ Dust that thick takes weeks to settle. Nobody's touched that award in a long time. Until Friday.
      `,
    },
    {
      id: 'desk',
      label: 'Desk',
      rect: [520, 590, 680, 110],
      script: s`
        ~ Contracts scattered across the desk. Corvin's renewal is on top — unsigned. Sable had circled the box-office figures in red. Over and over.
      `,
    },
    {
      id: 'safe',
      label: 'Wall safe',
      rect: [1185, 375, 240, 170],
      script: async (g) => {
        if (g.has('ledger')) {
          await g.run(s`~ The safe's empty now. Whatever else Sable kept in here, the ledger was the part that mattered.`);
          return;
        }
        await g.run(s`
          @show rosa think center
          rosa[think]: Ezra. The safe's open. And the police missed this — it was slid down behind the back panel.
          rosa: A ledger. Box office receipts versus what actually hit the bank.
          rosa[serious]: Forty thousand dollars missing in six months. And look at Friday's entry.
          ezra: "Confront M. after the show. Then police."
          rosa: M. As in Mallory.
          ~ As in Mallory. But which one?
          @hide rosa
        `);
        await g.giveEvidence('ledger');
      },
    },
    {
      id: 'photo',
      label: 'Framed photo',
      rect: [1195, 125, 230, 210],
      script: s`
        ~ "OPENING NIGHT — 9 YRS." Sable, Corvin... and Iris, laughing, in a gold dress, with Corvin's cape thrown over her shoulders.
        ~ It suits her. Which is a strange thought to have about a cape.
      `,
    },
    {
      id: 'window',
      label: 'Window',
      rect: [550, 80, 500, 400],
      script: s`~ San Querida at night. From up here you can see the courthouse dome. Sable used to say the Paramount was the only honest stage in town. The other one has a judge.`,
    },
    {
      id: 'lamp',
      label: 'Fallen lamp',
      rect: [985, 555, 130, 110],
      script: s`~ Knocked over in the struggle — if there was one. More likely when he fell. One blow, Brandt said. Whoever swung that statuette meant it.`,
    },
  ],
  people: [],
  exits: ['corridor', 'stage', 'dressing', 'office', 'detention'],
};

// ---------------------------------------------------------------------------

const dressing: Location = {
  id: 'dressing',
  name: "Paramount Theater — Iris's Dressing Room",
  bg: 'dressing',
  music: 'investigate',
  when: theaterOpen,
  enter: async (g) => {
    await g.run(s`
      @outfit iris mourning
      @show iris sad center
      iris[sad]: Mr. Vane. Thank you for coming. Thank you for... all of it.
      ~ Iris Mallory. Composed in black, eyes red at the edges. Grief, or a very good imitation — and I've seen the best imitations there are.
      iris: Please, look around. Ask me anything. I have nothing to hide.
      ~ People who have nothing to hide almost never say so.
      ~ ...There's a dusting of gold glitter on her collarbone. Stage glitter. Three days after the show.
    `);
    await g.giveProfile('p_iris');
  },
  hotspots: [
    {
      id: 'mirror',
      label: 'Mirror',
      rect: [450, 90, 560, 450],
      script: s`~ Bulbs all the way around. The kind of mirror that makes everyone look like a star and no one look like themselves.`,
    },
    {
      id: 'glitter',
      label: 'Gold jar',
      rect: [625, 470, 100, 100],
      script: async (g) => {
        await g.run(s`
          ~ A jar of gold body glitter. Theatrical grade — the kind that clings to skin and fabric and the inside of your soul.
          ~ Part of Iris's sequined assistant costume. Every dancer I ever worked with said the same thing: you never really get it off.
        `);
        await g.giveEvidence('glitter');
      },
    },
    {
      id: 'roses',
      label: 'Roses',
      rect: [775, 415, 170, 150],
      script: s`~ A dozen red roses. The card says: "To my Iris — the real magic. C." Dated Friday. He gave them to her before the show.`,
    },
    {
      id: 'rack',
      label: 'Costume rack',
      rect: [1140, 150, 300, 580],
      script: s`~ Costumes for Midnight Mysteries. A sequined gold gown, a midnight-blue robe, and Corvin's black-and-crimson cape on a hanger tagged "C — 58 in." Clean as the day it was made.`,
    },
    {
      id: 'tag',
      label: 'Empty hanger',
      rect: [1450, 185, 90, 150],
      script: async (g) => {
        await g.run(s`
          ~ An empty hanger at the end of the rack. Its tag reads "D — 52 in."
          ~ C for Corvin. D for... what? And it's six inches shorter.
        `);
        await g.giveEvidence('tag');
      },
    },
    {
      id: 'screen',
      label: 'Folding screen',
      rect: [40, 180, 340, 540],
      script: s`~ A lacquered changing screen. Good for quick changes. Theater people can get in and out of a costume in under thirty seconds. They practice.`,
    },
  ],
  people: [
    {
      char: 'iris',
      expr: 'sad',
      outfit: 'mourning',
      topics: [
        {
          id: 'where',
          label: 'Where were you during the Vanishing?',
          tag: 'READ',
          script: async (g) => {
            await g.run(s`
              iris[sad]: Here. I had one of my migraines — I sat out the second half of the show. I was lying down in the dark when it happened.
              ~ Smooth. Rehearsed, even. Let's look closer.
            `);
            const ok = await readTell(
              g,
              {
                char: 'iris',
                expr: 'sad',
                outfit: 'mourning',
                line: 'I was right here, lying down in the dark. I never left this room.',
                tell: 'throat',
                meanings: [
                  { label: "She's lying about where she was.", correct: true },
                  { label: "She's holding back tears for Leon." },
                  { label: "She's frightened for Corvin." },
                ],
                insight: 'A swallow — right on “never left.” Practiced, polished, and a lie. She was not in this room at 9:44.',
              },
              { retry: true },
            );
            g.hideDialogue();
            if (ok) {
              g.setFlag('read_iris');
              await g.run(s`
                ~ Why would Corvin's wife lie about where she was during the Vanishing?
                ~ Maybe to protect the trick. Maybe to protect him.
                ~ ...Or maybe not.
              `);
            } else {
              await g.run(s`iris[neutral]: Is something wrong, Mr. Vane? You're staring.`);
            }
          },
        },
        {
          id: 'leon',
          label: 'Leon Sable',
          script: s`
            iris[sad]: Leon was family. When Vegas threw Corvin away, Leon gave us a stage and a home. Nine years.
            iris: He could be difficult about money. All producers are. But he loved the theater more than he loved being right.
          `,
        },
        {
          id: 'money',
          label: 'The business side',
          script: s`
            iris[neutral]: I handle everything that isn't magic. Bookings, payroll, the box office. Corvin can't add up a dinner bill.
            iris[smile]: Someone in this family has to live in the real world, darling.
          `,
        },
        {
          id: 'cape',
          label: "Corvin's cape",
          script: s`
            iris[smile]: There's only one, darling. A magician's silhouette is his signature. You wouldn't paint two Mona Lisas.
            ~ That's a lovely line. She's said it before.
          `,
        },
      ],
      present: {
        tag: s`
          iris[surprised]: Oh, that old thing? We had a second cape made years ago for publicity photos. It went missing ages ago.
          ~ Her hand drifted to her collar when she said it.
        `,
        cape: s`iris[sad]: Please. Put that away. I can't look at it.`,
        still: s`
          iris[sad]: That's Corvin. I'd know his walk anywhere.
          ~ The man's on trial for murder, and his wife just identified him from behind. Without being asked.
        `,
        ledger: s`
          iris[neutral]: Leon's ledger? "M." could be anyone, Mr. Vane. Mallory is a common name.
          iris[smile]: You should ask Benny where his paychecks went. He's always short.
        `,
        glitter: s`iris[smile]: My stage glitter. A girl has to sparkle. It's in the contract.`,
        photo: s`iris[cold]: Fans and their phones. It's a wonder anyone watches the show at all.`,
        stopwatch: s`iris[neutral]: Ninety seconds to the balcony. Is that... significant?`,
      },
      presentDefault: s`iris[neutral]: I'm not sure what you want me to say, darling.`,
    },
  ],
  exits: ['stage', 'corridor', 'sable_office', 'office', 'detention'],
};

// ---------------------------------------------------------------------------

export const CASE1_INVESTIGATION: InvestigationDef = {
  id: 'c1inv',
  start: 'office',
  locations: { office, detention, stage, corridor, sable_office: sableOffice, dressing },
  ready: (g) => REQUIRED_EVIDENCE.every((id) => g.has(id)) && REQUIRED_PROFILES.every((id) => g.has(id)),
  finishLabel: 'Prepare for trial',
  finish: async (g) => {
    const go = await g.choose(
      [
        { label: "We're ready. Let's go to court.", value: true },
        { label: 'Not yet. Keep digging.', value: false },
      ],
      { prompt: "Tuesday morning comes fast. Have we got everything we need?" },
    );
    return go;
  },
  hint: (g) => {
    if (!g.flag('met_corvin')) return 'Start with the client. County Detention.';
    const missing = REQUIRED_EVIDENCE.filter((id) => !g.has(id));
    if (!g.has('p_benny')) return "There's a stagehand at the Paramount who saw something. Talk to him on the stage.";
    if (!g.has('autopsy')) return 'The detective at the theater has the case file. Backstage corridor.';
    if (!g.flag('office_open')) return "Ask Brandt to let us into Sable's office.";
    if (missing.includes('ledger')) return "Sable's office. Check the safe.";
    if (missing.includes('cuesheet')) return 'Ask the stagehand about the cue log.';
    if (missing.includes('floorplan')) return 'There was a fire exit map on the wall backstage.';
    if (missing.includes('stopwatch')) return "The balcony stairwell, backstage. I'd like to time something.";
    if (missing.includes('tag') || missing.includes('glitter')) return "Iris's dressing room. Look closely at the vanity and the costume rack.";
    if (missing.length) return `We still don't have everything. Missing: ${missing.length} item(s). Keep examining.`;
    return "That's everything I can think of. When you're ready, we prepare for trial. And try the Deduction Board before Tuesday!";
  },
};

export const investigationScene: SceneFn = async (g) => {
  await investigate(g, CASE1_INVESTIGATION);
  return 'c1_trial_open';
};
