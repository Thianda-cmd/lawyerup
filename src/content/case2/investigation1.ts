import { s } from '../../engine/dsl';
import type { Game, SceneFn } from '../../engine/game';
import { type InvestigationDef, type Location, investigate } from '../../systems/investigation';
import { readTell } from '../../systems/readTell';

const REQUIRED = ['c2_report', 'c2_affidavit', 'c2_texts', 'c2_venmo', 'c2_dashgo', 'c2_telemetry', 'c2_inventory', 'c2_tox', 'c2_fragment', 'c2_labreport', 'c2_chip', 'c2_article'];
const REQUIRED_PROFILES = ['p_teo', 'p_kessler', 'p_jojo', 'p_whitfield', 'p_nand', 'p_crane'];

// ---------------------------------------------------------------------------

const detention: Location = {
  id: 'detention',
  name: 'County Detention — Visiting Room',
  bg: 'detention',
  music: 'sad',
  enter: s`
    @outfit teo jail
    @show teo sad center
    teo[sad]: Rosie?
    rosa: Hey, little man.
    teo[cry]: I didn't do it. I swear to God, I didn't do it. I didn't even know her that well —
    rosa: I know. I know you didn't. This is Ezra. He's going to fix this.
    teo[worried]: The bus bench guy? You work for the bus bench guy?
    ezra: Hi, Teo. Your sister has told me absolutely nothing about you, which means she loves you very much.
    teo[blush]: ...
    ~ Nineteen. Rosa's eyes, Rosa's chin, and a jumpsuit two sizes too big. He's trying very hard not to look scared. He's failing.
  `,
  hotspots: [
    { id: 'glass', label: 'The glass', rect: [330, 200, 300, 90], script: s`~ Two inches of glass between Rosa and her brother. She keeps her hand flat against it the whole visit.` },
    { id: 'clock', label: 'Clock', rect: [750, 100, 100, 100], script: s`~ Nine minutes left. Arraignment at nine. The county doesn't care that it's the worst day of his life.` },
  ],
  people: [
    {
      char: 'teo',
      expr: 'sad',
      outfit: 'jail',
      topics: [
        {
          id: 'stop',
          label: 'Tell me about Sunday morning.',
          script: async (g) => {
            await g.run(s`
              teo[nervous]: I was on a delivery. Breakfast burritos. I come up to Alvarado and Fifth and I stop at the sign — I always stop, Mom made us count to three out loud — and then the lights go on behind me.
              teo: The big cop says I rolled it. I didn't. Then he says he smells weed. I don't smoke! I have asthma!
              teo[worried]: He made me stand by the curb with the other cop, the young one. Then he was leaning in the passenger side for a while. Like, a long while. Before they said they were searching.
              ezra: Before?
              teo: Yeah. Then his partner went and stood with him, and the big one goes "well, well, look what we've got." Like in a movie.
              ~ "Look what we've got." Officers say that when they find something. Or when they want a camera to hear them say it.
            `);
            await g.giveProfile('p_teo');
            g.setFlag('c2_heard_stop');
          },
        },
        {
          id: 'chloe',
          label: 'Did you know Chloe Whitfield?',
          when: (g) => g.has('p_teo'),
          script: s`
            teo[sad]: Kind of. She was in my comp class last year at SQCC before she transferred to State. She was nice. Smart. Always writing stuff down.
            teo: Last week she texted me out of nowhere asking if I had "blues." I was like, what? I said no. I don't mess with that stuff. People die from that stuff.
            ezra: The police say you wrote "ya i can get some."
            teo[shock]: That was a JOKE! I said "jk" right after! I said I don't touch it! It's literally the next text!
            ~ If that's true, someone left the next text out of a sworn affidavit.
          `,
        },
        {
          id: 'venmo',
          label: 'The $40 Venmo.',
          when: (g) => g.has('p_teo'),
          script: s`
            teo[surprised]: The — oh my God. Pizza. It was pizza! I delivered two large pizzas to her dorm Friday night. The tip button glitched, so she Venmo'd me forty bucks. I put a pizza emoji on it. SHE put a pizza emoji on it.
            ezra: Can you prove the delivery?
            teo: It's in my DashGo log! Every order, every mile. That app tracks me better than my mom does.
            rosa[serious]: Give me your login. I'll pull it at the office.
          `,
        },
        {
          id: 'saturday',
          label: 'Where were you Saturday night?',
          when: (g) => g.has('p_teo'),
          script: s`
            teo: Working. DashGo surge pricing, Saturday nights are money. Nine orders, all Eastside. I got home like two-thirty.
            teo[sad]: I didn't even know there was a party. I wasn't invited to stuff like that.
          `,
        },
        {
          id: 'secret',
          label: 'Is there anything else they could find?',
          tag: 'READ',
          when: (g) => g.has('p_teo'),
          script: async (g) => {
            await g.run(s`
              teo[nervous]: No! No. I'm clean. I swear.
              ~ He looked at his sister before he answered. Let's see what that was.
            `);
            const ok = await readTell(
              g,
              {
                char: 'teo',
                expr: 'nervous',
                outfit: 'jail',
                line: 'There’s nothing else. I swear. I’m clean.',
                tell: 'eyes',
                meanings: [
                  { label: "He's lying about the blue pills." },
                  { label: "He's ashamed of something — in front of his sister.", correct: true },
                  { label: "He's terrified of the police." },
                ],
                insight: 'His eyes went to Rosa, not the door. That’s not guilt about a murder. That’s a kid who doesn’t want his big sister to know something.',
              },
              { retry: true },
            );
            g.hideDialogue();
            if (!ok) {
              await g.run(s`teo[nervous]: Why are you looking at me like that, man?`);
              return;
            }
            await g.run(s`
              ezra: Rosa. Could you give us a minute?
              rosa[annoyed]: ...One minute.
              @hide rosa
              ezra: Tell me now, Teo. I don't want to hear it from a prosecutor.
              teo[blush]: ...Addy. Adderall. I have a prescription, and sometimes during finals I sell a few to people in my classes. Ten bucks a pill. That's it. That's the whole thing.
              teo[sad]: The cops took my backpack. There were six in there. Please don't tell Rosie.
              ~ Not a murderer. Not a saint. A nineteen-year-old who sells his ADHD meds during finals week. Strand will use it to paint him as a dealer.
            `);
            const how = await g.choose(
              [
                { label: '"If anyone asks, you tell the truth about the Adderall."', value: 'truth', tag: 'HONEST', hint: 'It costs him now. Lies cost more later.' },
                { label: '"You never say the word Adderall again. Not to anyone."', value: 'bury', tag: 'SHADY', hint: 'Keep the jury focused on the homicide charge.' },
              ],
              { prompt: 'He’s waiting for me to tell him who to be.' },
            );
            if (how === 'truth') {
              await g.run(s`
                ezra: If anyone asks, you tell the truth about the Adderall. It's a small crime. Lying about it makes everything else you say look like a lie too.
                teo[sad]: ...Okay. Yeah. Okay.
                @stat integrity 1
                @flag c2_teo_honest
              `);
            } else {
              await g.run(s`
                ezra: You never say the word Adderall again. Not to the guards, not to your cellmate, not to Rosa. Understood?
                teo[nervous]: ...Understood.
                @stat notoriety 1
              `);
            }
            g.setFlag('c2_adderall');
          },
        },
      ],
      present: {
        c2_affidavit: s`teo[mad]: That's not the whole conversation! Where's the next part? Where's the part where I say I don't touch that stuff?!`,
        c2_venmo: s`teo: Pizza. PIZZA. Two larges. One pepperoni, one veggie. I remember because she said thank you twice.`,
        c2_report: s`teo[mad]: "Rolled through the stop sign." I counted to three! Out loud! Like a dork!`,
        c2_dashgo: s`teo[happy]: See?! Eastside all night! That's me! Every dot is me!`,
        c2_fragment: s`teo[worried]: I've never even seen one of those up close. They look like candy. That's what's so messed up.`,
      },
      presentDefault: s`teo[nervous]: I don't know what that is, man. I'm sorry.`,
    },
  ],
  exits: ['office', 'party', 'precinct', 'dorm', 'crime_lab', 'da_office'],
};

// ---------------------------------------------------------------------------

const office: Location = {
  id: 'office',
  name: 'Vane & Associates',
  bg: 'office',
  music: 'office',
  hotspots: [
    {
      id: 'laptop',
      label: "Rosa's laptop",
      rect: [560, 640, 260, 120],
      script: async (g) => {
        if (!g.has('p_teo')) {
          await g.run(s`~ Rosa's laptop. Forty-one browser tabs open, all of them about drug-induced homicide statutes.`);
          return;
        }
        if (g.has('c2_dashgo')) {
          await g.run(s`~ Teo's DashGo history, still open on Rosa's screen. A little blue dot doing laps around Eastside all Saturday night.`);
          return;
        }
        await g.run(s`
          @show rosa serious center
          rosa[serious]: Okay. Teo's DashGo driver account. His password is "RosieIsTheBest1." I'm going to cry again, hold on.
          rosa: Here. Every order, every pickup, GPS every fifteen seconds.
        `);
        await g.giveEvidence('c2_dashgo');
        await g.run(s`
          rosa[think]: Friday, 7:41 PM. Two large pizzas, Hadley Hall, customer C. Whitfield. And look — "tip failed."
          ~ And Saturday night, he's fourteen miles from that party for three hours straight.
          @hide rosa
        `);
      },
    },
    {
      id: 'card',
      label: "Crane's card",
      rect: [980, 680, 230, 60],
      script: s`
        ~ SILAS CRANE — TRIAL CONSULTING. "Every jury has a tell."
        ~ Ten years ago he whispered strangers' secrets into my ear and I said them out loud for money. Now he whispers to juries. I wonder who whispers to him.
      `,
    },
    {
      id: 'poster',
      label: 'Old poster',
      rect: [1200, 110, 250, 350],
      script: s`~ THE GREAT VANE. Silas designed this poster. He said the eye should look like it's judging you. It does.`,
    },
  ],
  people: [
    {
      char: 'rosa',
      expr: 'serious',
      topics: [
        {
          id: 'law',
          label: 'Drug-induced homicide',
          script: s`
            rosa[serious]: I've been reading all night. If you distribute a drug and someone dies from it, it's homicide. Doesn't matter if you meant it. Doesn't matter if they asked for it.
            rosa: They don't have to prove Teo wanted her dead. Just that the pill that killed her came from him.
            ezra: So we prove it didn't.
            rosa[sad]: Twenty years to life if we don't.
          `,
        },
        {
          id: 'telemetry',
          label: 'Teo says he stopped at the sign.',
          when: (g) => g.flag('c2_heard_stop') && !g.has('c2_telemetry'),
          script: async (g) => {
            await g.run(s`
              rosa[think]: DashGo records how its drivers drive. Speed, braking, everything — it's for their insurance. A friend in their legal department owes me for a thing.
              rosa: I'll send a subpoena this morning. They're scared of lawyers. They'll answer fast.
              @wait 600
              rosa[smile]: ...And they answered. Sunday, 10:19 AM, Alvarado and Fifth: zero miles an hour for three point two seconds.
            `);
            await g.giveEvidence('c2_telemetry');
            await g.run(s`~ A full stop. Counted to three, just like he said. So why did Kessler pull him over?`);
          },
        },
        {
          id: 'tino',
          label: 'Call Tino about the party',
          tag: 'SIDE',
          when: (g) => g.seen('c2inv1:visit:party') && !g.has('c2_cupphoto'),
          script: async (g) => tinoParty(g),
        },
        {
          id: 'plan',
          label: 'What now?',
          script: async (g) => {
            await g.say('rosa', 'The suppression hearing is Wednesday. If we can show the stop was illegal, the pills from his car get thrown out. That’s the first domino.', { expr: 'serious' });
          },
        },
      ],
      present: {
        c2_affidavit: s`rosa[mad]: "Excerpt." They swore to an excerpt of my brother's text messages.`,
        c2_chip: s`rosa[sad]: Eight months. That's hard, Ezra. My uncle never made it to eight days.`,
      },
      presentDefault: s`rosa[think]: Keep that. Everything matters now.`,
    },
  ],
  exits: ['detention', 'party', 'precinct', 'dorm', 'crime_lab', 'da_office'],
};

async function tinoParty(g: Game): Promise<void> {
  await g.run(s`
    ezra: Two hundred kids at that party. Two hundred phones.
    @sfx phone
    @call tino
    tino[grin]: Ezra! Big case, huh? Councilwoman's daughter. I seen you on the news in the background of the news.
    ezra: Tino. Las Lomas, Saturday night, the Pratt house. I want every story, every video anyone posted between midnight and one.
    tino: Stories expire in twenty-four hours, hermano. ...Lucky for you, I know a kid who screen-records everything for blackmail purposes. Very entrepreneurial. I like him.
  `);
  const pay = await g.choose(
    [
      { label: 'Pay the kid $150', value: 'pay', tag: 'HONEST' },
      { label: '"Tell the kid his blackmail folder is about to become evidence."', value: 'squeeze', tag: 'SHADY' },
    ],
    { prompt: 'Tino is chewing something. Tino is always chewing something.' },
  );
  if (pay === 'pay') await g.run(s`@stat money -150`);
  else await g.run(s`@stat notoriety 1`);
  await g.run(s`
    tino: Sending it. There's a lot of throwing up. Fast-forward to 12:34.
    @call off
  `);
  await g.giveEvidence('c2_cupphoto');
  await g.run(s`
    ~ 12:34 AM. In the background, Jonah Pratt hands Chloe a red cup. She's already holding a green bottle of Limón.
    ~ She didn't drink. Everyone keeps saying that. So why take a cup?
  `);
}

// ---------------------------------------------------------------------------

const party: Location = {
  id: 'party',
  name: 'The Pratt House, Las Lomas',
  bg: 'party',
  music: 'tension',
  when: (g) => g.has('p_teo'),
  enter: s`
    ~ Las Lomas. Houses that cost more than the block I grew up on, with views of the block I grew up on.
    @outfit jojo party
    @show jojo neutral center
    jojo[neutral]: You're the lawyer? Come in, come in. Sorry about the mess. The cops said don't clean anything, and honestly? Thank God.
    jojo[sad]: I still can't believe it. Chloe. In my house.
    ~ Jonah Pratt. Twenty-two, expensive teeth, and the kind of hangover money doesn't fix. Very eager to help.
  `,
  hotspots: [
    {
      id: 'table',
      label: 'Drinks table',
      rect: [100, 640, 1400, 140],
      script: s`
        ~ Red cups everywhere, half of them still sticky. Cheap vodka, cheaper rum, a punch bowl nobody should trust.
        ~ And a dozen green bottles of Limón soda. Everyone says Chloe didn't drink alcohol. If she drank anything, it was probably this.
      `,
    },
    {
      id: 'stairs',
      label: 'Upstairs bathroom',
      rect: [1240, 140, 360, 480],
      script: s`
        ~ Police tape across the top of the stairs. That's where they found her, on the floor of the upstairs bathroom, at 1:02 AM.
        ~ Somebody told the 911 operator she "took something." Somebody was very sure, very fast.
      `,
    },
    {
      id: 'camera',
      label: 'Security camera',
      rect: [1180, 60, 120, 80],
      again: () => false,
      script: s`
        ~ A doorbell camera and two more on the deck. All "switched off for the party," according to Jonah. His parents' rule, he says.
        ~ The kind of rule you make when you're expecting to do something on Saturday night that you don't want on video.
      `,
    },
    {
      id: 'pool',
      label: 'Pool',
      rect: [210, 540, 1180, 100],
      script: s`~ An infinity pool glowing turquoise. The city lights below it look like they're spilling over the edge. Two hundred kids, and every one of them was looking at their phone or this pool.`,
    },
    {
      id: 'couch',
      label: 'Couch',
      rect: [30, 510, 380, 150],
      script: s`~ A white couch that cost more than Teo's car. Someone put a cigarette out on it. Jonah didn't seem to care, which tells you something about Jonah.`,
    },
  ],
  people: [
    {
      char: 'jojo',
      expr: 'neutral',
      outfit: 'party',
      topics: [
        {
          id: 'night',
          label: 'What happened Saturday night?',
          script: async (g) => {
            await g.run(s`
              jojo[sad]: Chloe showed up around midnight. She was already, like... off. Messed up. She went upstairs and somebody found her in the bathroom. I called 911 myself.
              ezra: Messed up how?
              jojo: You know. Pills. Everybody knew she had a thing with pills.
              ~ "Everybody knew." People say that when they need you to stop asking how they know.
            `);
            await g.giveProfile('p_jojo');
          },
        },
        {
          id: 'teo',
          label: 'Do you know Teo Quintero?',
          tag: 'READ',
          when: (g) => g.has('p_jojo'),
          script: async (g) => {
            await g.run(s`
              jojo[neutral]: That's the guy who sold to her, right? Yeah. I saw him in my kitchen around midnight. Selling her a blue.
              ezra: You saw that.
              jojo: Clear as day. I already told the cops. I'm a witness.
            `);
            const ok = await readTell(
              g,
              {
                char: 'jojo',
                expr: 'neutral',
                outfit: 'party',
                line: 'I saw him in my kitchen. Selling her a blue. Clear as day.',
                tell: 'brows',
                meanings: [
                  { label: "He's lying — he never saw Teo.", correct: true },
                  { label: "He's upset about Chloe." },
                  { label: "He's nervous about his parents finding out about the party." },
                ],
                insight: 'His brows jumped on “clear as day.” Nobody needs to perform certainty about something they actually saw. He’s never seen Teo in his life.',
              },
              { retry: true },
            );
            g.hideDialogue();
            if (ok) {
              g.setFlag('c2_read_jojo');
              await g.run(s`
                ~ Jonah Pratt is the eyewitness. And Jonah Pratt is lying. The question is who handed him the script.
                jojo[neutral]: You good, man? You look like you're doing math.
              `);
            }
          },
        },
        {
          id: 'cops',
          label: 'Do you know Sgt. Kessler?',
          when: (g) => g.has('p_jojo') && g.has('p_kessler'),
          script: s`
            jojo[surprised]: Who? Oh — the narcotics guy? I met him that night. Seems like a stand-up dude. Super professional.
            ~ "That night." Narcotics wasn't called to a hospital death at 2:31 AM. They took the case Sunday morning. So when did Jonah meet him?
          `,
        },
        {
          id: 'cameras',
          label: 'Why were the cameras off?',
          when: (g) => g.has('p_jojo'),
          script: s`
            jojo[nervous]: My parents' rule. Privacy for the guests. It's, like, a party etiquette thing.
            ezra: Your parents make you turn off their security cameras when they leave you alone with two hundred strangers.
            jojo[annoyed]: ...They're very progressive.
          `,
        },
      ],
      present: {
        c2_cupphoto: s`
          jojo[shock]: Where'd you get — that's — I was handing out drinks to everybody! I'm the host!
          ~ He didn't ask what the video was. He knew exactly which frame mattered.
        `,
        c2_fragment: s`jojo[neutral]: See? She had pills on her. I told you. Everybody knew.`,
        c2_chip: s`jojo[surprised]: Eight months? No way. She was... I mean, people relapse, right? Happens all the time.`,
        c2_affidavit: s`jojo: That's the guy! The pizza guy. Teo. Total dealer. Everybody knew.`,
      },
      presentDefault: s`jojo[neutral]: I don't know anything about that, man. I just threw a party.`,
    },
  ],
  exits: ['office', 'detention', 'precinct', 'dorm', 'crime_lab', 'da_office'],
};

// ---------------------------------------------------------------------------

const precinct: Location = {
  id: 'precinct',
  name: 'SQPD Narcotics Unit',
  bg: 'precinct',
  music: 'investigate',
  when: (g) => g.has('p_teo'),
  enter: s`
    @outfit kessler tactical
    @show kessler friendly left
    @show brandt annoyed right
    kessler[friendly]: Well, if it isn't the magician lawyer! Ray Kessler, Narcotics. Saw you on the news. Big fan of the bus bench.
    ezra: Everyone loves the bus bench.
    kessler: Sorry about your client, counselor. Sincerely. It's a tragedy all around. Kid made a bad choice.
    brandt[annoyed]: Vane.
    ezra: Detective Brandt. I didn't know homicide was on this.
    brandt[annoyed]: It isn't. Apparently.
    ~ Ray Kessler: the handshake of a politician and the eyes of a man counting exits. Two Officer of the Year plaques. Brandt is standing behind him like a man who'd like to step on his foot.
  `,
  hotspots: [
    { id: 'board', label: 'Arrest board', rect: [600, 120, 420, 270], script: s`~ ARRESTS THIS MONTH: 47. Narcotics units live and die by numbers. Numbers mean overtime, grants and plaques.` },
    { id: 'plaque', label: 'Plaque', rect: [1180, 450, 200, 120], script: s`~ OFFICER OF THE YEAR — SGT. R. KESSLER, 2024 AND 2025. Two years in a row of the most seizures in the county. Somebody's having a very good run.` },
    { id: 'case', label: 'Case wall', rect: [1100, 110, 400, 300], script: s`~ Photos, red string, mugshots. A dozen faces, all young, all small-time. Not one supplier. All roads on this board stop at the street corner.` },
  ],
  people: [
    {
      char: 'kessler',
      expr: 'friendly',
      outfit: 'tactical',
      topics: [
        {
          id: 'arrest',
          label: 'The arrest',
          script: async (g) => {
            await g.run(s`
              kessler[friendly]: By the book. He rolls a stop sign, I smell marijuana, I search, I find twelve blue thirties under the seat. Here's my report. Light reading.
            `);
            await g.giveEvidence('c2_report');
            await g.giveProfile('p_kessler');
            await g.run(s`~ "Odor of cannabis." Cannabis has been legal in this state for years. And the camera note says "activated upon contact." We'll see.`);
          },
        },
        {
          id: 'affidavit',
          label: 'The probable cause affidavit',
          when: (g) => g.has('p_kessler'),
          script: async (g) => {
            await g.run(s`
              kessler: The victim's phone. Your boy offers her blues, she pays him forty bucks. Sworn and signed.
            `);
            await g.giveEvidence('c2_affidavit');
            await g.run(s`~ "(excerpt)." An excerpt. In a sworn affidavit. Teo says the very next text was a denial.`);
          },
        },
        {
          id: 'purse',
          label: 'The pill in her purse',
          when: (g) => g.has('p_kessler'),
          script: async (g) => {
            await g.run(s`
              kessler: Found it myself, in her little clutch, at the scene. Half a thirty. She took the other half. Same pills as in your client's car.
            `);
            await g.giveEvidence('c2_fragment');
          },
        },
        {
          id: 'why',
          label: 'Why is Narcotics running a homicide?',
          when: (g) => g.has('p_kessler'),
          script: s`
            kessler[friendly]: The councilwoman asked for the best. I'm the best. It's a drug case with a body, counselor. Who knows drugs better than me?
            ~ He took the case at seven in the morning, four and a half hours after she died. Before most people in this building had heard her name.
          `,
        },
      ],
      present: {
        c2_telemetry: s`
          kessler[cold]: Phone apps. Cute. My eyes beat a delivery app any day, counselor.
          ~ First crack in the smile. Barely there. But there.
        `,
        c2_texts: s`kessler[neutral]: I quoted the relevant part. That's what "excerpt" means. You went to law school. Allegedly.`,
        c2_inventory: s`kessler[smirk]: Odor dissipates. Kid probably aired it out. Next.`,
        c2_cupphoto: s`kessler[cold]: Party footage. Lot of people handing a lot of cups. Means nothing.`,
      },
      presentDefault: s`kessler[friendly]: You're going to have to try harder than that, magic man.`,
    },
    {
      char: 'brandt',
      expr: 'annoyed',
      topics: [
        {
          id: 'sidelined',
          label: 'Why aren’t you on this case?',
          script: async (g) => {
            await g.run(s`
              brandt[annoyed]: Because at seven a.m. Sunday, Ray Kessler went over my lieutenant's head and took it. Narcotics, running a death investigation. Twenty-eight years and I've never seen that.
              brandt[think]: The ME still sends me copies out of habit, though. Here. I didn't give you this.
            `);
            await g.giveEvidence('c2_tox');
            await g.run(s`
              brandt: Read the gastric contents. Then ask yourself why nobody in this room has.
              ~ "No tablet fragments, binder or blue dye detected." Just lemon-lime soda.
            `);
          },
        },
        {
          id: 'kessler',
          label: 'What do you think of Kessler?',
          when: (g) => g.has('c2_tox'),
          script: s`
            brandt[think]: I think Ray Kessler has more seizures than any cop in the county and never once caught anybody who matters. Just kids. Corner kids.
            brandt[annoyed]: And I think if I say that out loud in this building, I'm writing parking tickets by Friday.
          `,
        },
      ],
      present: {
        c2_fragment: s`brandt[think]: Half a pill in her purse, and nothing in her stomach. You see the problem.`,
        c2_report: s`brandt: "Odor of cannabis." Ray still writes reports like it's 2009.`,
      },
      presentDefault: s`brandt[annoyed]: Not my case, Vane. Apparently.`,
    },
  ],
  exits: ['office', 'detention', 'party', 'dorm', 'crime_lab', 'da_office'],
};

// ---------------------------------------------------------------------------

const dorm: Location = {
  id: 'dorm',
  name: "Hadley Hall — Chloe's Room",
  bg: 'dorm',
  music: 'sad',
  when: (g) => g.has('p_teo'),
  enter: async (g) => {
    await g.run(s`
      @outfit whitfield blazer
      @show whitfield mad center
      whitfield[mad]: Who let you in here?
      ezra: The RA. I told her I was —
      whitfield[mad]: I know exactly who you are. You're defending the boy who killed my daughter. Get out of her room.
      ezra: Councilwoman, I'm not here to fight you. I'm here because I don't think the right person is in jail.
      whitfield[cold]: ...You have five minutes. Touch nothing I haven't packed.
      ~ She's folding her daughter's sweaters with the precision of someone who will fall apart the second her hands stop moving.
    `);
    await g.giveProfile('p_whitfield');
    await g.giveProfile('p_chloe');
  },
  hotspots: [
    {
      id: 'board',
      label: 'Corkboard',
      rect: [60, 140, 500, 320],
      script: async (g) => {
        await g.run(s`
          ~ THE BLUE PIPELINE. Index cards, red string, photos of pill baggies. Interview notes with dates. A circle around "J.P." and an arrow pointing to three question marks.
          ~ This isn't a party girl's room. This is an investigation. A good one.
          @show whitfield sad center
          whitfield[sad]: Her article. For the school paper. She wouldn't tell me what it was about. She said I'd "make it political."
        `);
        await g.giveEvidence('c2_article');
        await g.run(s`
          ~ "J.P. brags his pills come from someone with a badge." Publication date: the Monday after she died.
          ~ And a sticky note: "K. testifies like he's reading a script. Who coaches him?? — a consultant? S.C.?"
          ~ ...S.C.
        `);
        g.setFlag('c2_saw_sc');
      },
    },
    {
      id: 'desk',
      label: 'Desk drawer',
      rect: [60, 480, 520, 160],
      script: async (g) => {
        await g.run(s`
          ~ In the desk drawer, under a stack of index cards: a bronze coin stamped with an 8.
          @show whitfield shock center
          whitfield[shock]: What is that?
          ezra: An eight-month sobriety coin, Councilwoman.
          whitfield[cry]: ...She was still going to meetings? She never told me. She never — I thought that was over. I thought we fixed it when she was sixteen.
        `);
        await g.giveEvidence('c2_chip');
        await g.run(s`~ Eight months clean. Everyone at that party says she was "messed up on pills." Everyone at that party is wrong, or lying.`);
      },
    },
    {
      id: 'laptop',
      label: 'Laptop',
      rect: [220, 440, 200, 120],
      script: s`
        ~ Chloe's laptop. Covered in stickers: PRESS, SQ SENTINEL, a cartoon of a lightbulb. Password-locked.
        ~ Whatever she recorded, the backup is in there. And her mother is the only person who might know the password.
      `,
    },
    { id: 'boxes', label: 'Boxes', rect: [690, 680, 540, 180], script: s`~ CHLOE — BOOKS. WINTER CLOTHES. DESK STUFF. Twenty years of a person, in three boxes, labeled in her mother's handwriting.` },
    { id: 'window', label: 'Window', rect: [1200, 110, 320, 360], script: s`~ The campus at sunset. From here you can see the Sentinel office. Her light would have been on Monday night.` },
  ],
  people: [
    {
      char: 'whitfield',
      expr: 'cold',
      outfit: 'blazer',
      topics: [
        {
          id: 'chloe',
          label: 'Tell me about Chloe.',
          script: s`
            whitfield[sad]: She was stubborn. She was funny when she forgot to be serious. She wanted to be a journalist since she was nine and made a newspaper about our neighbors' dogs.
            whitfield[cold]: And she is dead because someone sold her a pill. That is all this is, Mr. Vane. Don't make it more complicated than it is.
          `,
        },
        {
          id: 'past',
          label: 'Did Chloe ever struggle with pills?',
          tag: 'READ',
          script: async (g) => {
            await g.run(s`
              whitfield[mad]: How dare you. My daughter never used drugs. Never.
            `);
            const ok = await readTell(
              g,
              {
                char: 'whitfield',
                expr: 'mad',
                outfit: 'blazer',
                line: 'My daughter never used drugs. Never. Not once.',
                tell: 'throat',
                meanings: [
                  { label: "She's protecting Chloe's memory. She knows Chloe struggled once.", correct: true },
                  { label: "She's protecting her political campaign." },
                  { label: "She's telling the truth — Chloe never used." },
                ],
                insight: 'She swallowed on “never.” Not a politician’s lie. A mother’s. She’s guarding the one thing she still can.',
              },
              { retry: true },
            );
            g.hideDialogue();
            if (ok) {
              g.setFlag('c2_read_whitfield');
              await g.run(s`
                ezra: Councilwoman. I'm not going to use it against her. I think it matters for why she was at that party.
                whitfield[sad]: ...When she was sixteen. Oxy, from a friend's medicine cabinet. We sent her to a program in Oregon for a summer. She came back herself again.
                whitfield[cry]: I told everyone she was at a writing camp. I've been telling that lie for four years.
                ~ And she's been running for mayor on fentanyl the whole time. Not for votes. For Chloe.
              `);
            }
          },
        },
      ],
      present: {
        c2_chip: s`whitfield[cry]: Eight months. She was doing it alone. She didn't think she could tell me.`,
        c2_article: s`
          whitfield[think]: "Someone with a badge." She never said anything about police. Chloe, what did you get into?
        `,
        c2_affidavit: s`whitfield[cold]: Sergeant Kessler showed me this on Sunday. He was very kind. He said he'd make sure the boy never hurt anyone again.`,
        c2_tox: s`whitfield[sad]: I couldn't read it. I read the first line and I couldn't read any more.`,
      },
      presentDefault: s`whitfield[cold]: I don't see what that has to do with my daughter.`,
    },
  ],
  exits: ['office', 'detention', 'party', 'precinct', 'crime_lab', 'da_office'],
};

// ---------------------------------------------------------------------------

const crimeLab: Location = {
  id: 'crime_lab',
  name: 'SQPD Crime Lab',
  bg: 'crime_lab',
  music: 'investigate',
  when: (g) => g.has('p_teo'),
  enter: s`
    @outfit nand lab
    @show nand worried center
    nand[worried]: You're not supposed to be back here. Did reception — oh. You're the defense attorney. They said you might come.
    nand: Dr. Priya Nand. Forensic chemistry. I tested everything in your case. I'll answer what I'm allowed to answer.
    ~ "Allowed to." Interesting choice of words.
  `,
  hotspots: [
    { id: 'monitor', label: 'Monitor', rect: [470, 110, 660, 370], script: s`~ Two pills side by side on the monitor, magnified. Little red circles around flaws in the stamped M and the 3. She switches the screen off when she sees me looking.` },
    { id: 'backlog', label: 'Backlog board', rect: [1250, 600, 260, 130], script: s`~ BACKLOG: 1,204 CASES. One chemist for every three hundred of them. Labs like this are where cases go to wait.` },
    { id: 'fridge', label: 'Evidence fridge', rect: [1200, 120, 320, 440], script: s`~ EVIDENCE — AUTHORIZED ONLY. A sign-in clipboard hangs on the handle. Every name, every time, in and out. Chain of custody, the most boring phrase in law until it's the only one that matters.` },
  ],
  people: [
    {
      char: 'nand',
      expr: 'worried',
      outfit: 'lab',
      topics: [
        {
          id: 'findings',
          label: 'Your findings',
          script: async (g) => {
            await g.run(s`
              nand[neutral]: Thirteen items. Twelve tablets from the vehicle, one fragment from the victim's purse. All counterfeit oxycodone. All fentanyl. That's my report.
            `);
            await g.giveEvidence('c2_labreport');
            await g.giveProfile('p_nand');
          },
        },
        {
          id: 'more',
          label: 'Is that everything you found?',
          tag: 'READ',
          when: (g) => g.has('p_nand'),
          script: async (g) => {
            await g.run(s`
              nand[nervous]: That's... that's what's in my report. They're consistent with what's circulating on the street.
            `);
            const ok = await readTell(
              g,
              {
                char: 'nand',
                expr: 'nervous',
                outfit: 'lab',
                line: 'They’re consistent with what’s on the street. That’s all I found.',
                tell: 'eyes',
                meanings: [
                  { label: 'She found something she wasn’t allowed to put in the report.', correct: true },
                  { label: "She made a mistake in the testing and she's embarrassed." },
                  { label: "She's afraid of the defense attorney." },
                ],
                insight: 'Her eyes went to the supervisor’s office door. She found something. Someone told her to leave it out.',
              },
              { retry: true },
            );
            g.hideDialogue();
            if (ok) {
              g.setFlag('c2_read_nand');
              await g.run(s`
                ezra: Dr. Nand. Who told you to leave it out?
                nand[shock]: ...
                nand[worried]: Not here. Not today. I have a mortgage and a supervisor who reads my email.
                nand: Come back after the hearing. If the judge throws out the stop... I'll know I'm not the only one who thinks something's wrong.
              `);
            }
          },
        },
      ],
      present: {
        c2_tox: s`
          nand[think]: No tablet residue in the stomach at all? Binder doesn't just vanish. That's... consistent with a dissolved dose. In a liquid.
          nand[worried]: I didn't do the autopsy. I just — that's what it's consistent with.
        `,
        c2_fragment: s`nand[nervous]: Item thirteen. Yes. Chemically identical to the others. Same... same everything.`,
        c2_labreport: s`nand[neutral]: That's my signature. That's what I'm allowed to sign.`,
      },
      presentDefault: s`nand[neutral]: I only know chemistry, Mr. Vane. Ask me about chemistry.`,
    },
  ],
  exits: ['office', 'detention', 'party', 'precinct', 'dorm', 'da_office'],
};

// ---------------------------------------------------------------------------

const daOffice: Location = {
  id: 'da_office',
  name: "District Attorney's Office",
  bg: 'da_office',
  music: 'crane',
  when: (g) => g.has('p_teo'),
  enter: s`
    @show strand cold left
    @show crane neutral right
    strand[cold]: Mr. Vane. I assume you're here for discovery. I had it boxed this morning.
    crane[neutral]: Hello, kid.
    ~ Ten years. Same voice. Warm as a fireplace, and it still makes the back of my neck go cold.
    ezra: Silas.
    crane[delighted]: You remembered my name. I'm touched. You used to call me "the voice."
    strand[annoyed]: You two know each other.
    crane: We were in show business together, Helena. A long time ago. He was the face. I was the brains.
    ~ He says it like a joke. It isn't.
  `,
  hotspots: [
    { id: 'tally', label: 'Whiteboard', rect: [1360, 120, 180, 120], script: s`~ "41 – 1." She circled the one. In red. She hasn't erased it. She looks at it every morning, I'd bet my bar card.` },
    { id: 'chess', label: 'Chess board', rect: [1200, 410, 200, 210], script: s`~ A game in progress. White is three moves from mate. Strand plays white. Of course she does.` },
    { id: 'window', label: 'Window', rect: [560, 80, 520, 440], script: s`~ The courthouse dome, right across the plaza. She can see her courtroom from her desk.` },
  ],
  people: [
    {
      char: 'strand',
      expr: 'cold',
      topics: [
        {
          id: 'discovery',
          label: 'Discovery',
          script: async (g) => {
            await g.run(s`
              strand[cold]: Everything the People have, as required. Phone extraction, Venmo subpoena return, inventory of the vehicle, booking records. I disclose everything, Mr. Vane. Unlike some prosecutors.
              strand: The full extraction is on page forty. Read it all. I always do.
            `);
            await g.giveEvidence('c2_texts');
            await g.giveEvidence('c2_venmo');
            await g.giveEvidence('c2_inventory');
            await g.run(s`
              ~ Page forty. "jk lol. i dont touch that stuff. addy only." She handed me the denial Kessler cut out of his affidavit.
              ~ She hasn't noticed the affidavit leaves it out. Or she has, and she's letting me find it.
            `);
          },
        },
        {
          id: 'charges',
          label: 'The charges',
          script: s`
            strand[neutral]: Count one: drug-induced homicide. Count two: possession of fentanyl with intent to distribute. Count three: possession with intent, amphetamine. Six Adderall tablets from his backpack.
            strand[cold]: Your client sells pills, Mr. Vane. The only question is which ones.
          `,
        },
        {
          id: 'crane',
          label: 'Why is Silas Crane here?',
          script: s`
            strand[annoyed]: The councilwoman's office brought him in. Pro bono, for jury selection.
            strand[cold]: For the record, I don't need help picking a jury. And I don't like men who smile at autopsy photos.
            ~ Helena Strand, it turns out, has excellent instincts.
          `,
        },
      ],
      present: {
        c2_affidavit: s`
          strand[think]: Sergeant Kessler's affidavit. I've read it. Why?
          ~ She hasn't put it next to page forty. Not yet.
        `,
        c2_telemetry: s`strand[neutral]: Save it for Wednesday, Mr. Vane. I don't argue motions in my office.`,
      },
      presentDefault: s`strand[cold]: If you have an argument, file it.`,
    },
    {
      char: 'crane',
      expr: 'neutral',
      topics: [
        {
          id: 'why',
          label: 'What are you doing here, Silas?',
          script: async (g) => {
            await g.run(s`
              crane[neutral]: A grieving mother asked for help, and I am a helpful man. Also, I wanted to watch you work. You've gotten good, kid. The magician — that was lovely.
              ezra: You're picking a jury to convict a nineteen-year-old.
              crane[delighted]: I'm picking a jury. What they do with it is up to you.
            `);
            await g.giveProfile('p_crane');
          },
        },
        {
          id: 'read',
          label: 'Read Silas',
          tag: 'READ',
          when: (g) => g.has('p_crane'),
          script: s`
            ~ I look for the tell. The swallow, the glance, the breath. Anything.
            crane[neutral]: ...
            ~ Nothing. Not a flicker. He's looking right back at me, doing the same thing, and enjoying it more.
            crane[delighted]: You used to do this on stage, remember? I'd whisper the answer and you'd look at the mark like you'd found it in their soul.
            crane: You never had a gift, kid. You had a script. Same as everyone.
          `,
        },
        {
          id: 'hale',
          label: 'Marcus Hale',
          when: (g) => g.has('p_crane'),
          script: s`
            crane[cold]: ...
            crane[neutral]: Now there's a name for a rainy day. Let's not spoil this one, kid. One case at a time.
            ~ For half a second, the smile stopped. That's the first time in ten years I've seen it stop.
          `,
        },
      ],
      present: {
        c2_article: s`
          crane[neutral]: A student newspaper. How quaint. The young still think printing a thing makes it true.
          ~ He didn't look at the sticky note. He very carefully didn't look at the sticky note.
        `,
      },
      presentDefault: s`crane[delighted]: Show me something that surprises me, kid. I'll wait.`,
    },
  ],
  exits: ['office', 'detention', 'party', 'precinct', 'dorm', 'crime_lab'],
};

// ---------------------------------------------------------------------------

export const CASE2_INV1: InvestigationDef = {
  id: 'c2inv1',
  start: 'detention',
  locations: { detention, office, party, precinct, dorm, crime_lab: crimeLab, da_office: daOffice },
  ready: (g) => REQUIRED.every((id) => g.has(id)) && REQUIRED_PROFILES.every((id) => g.has(id)),
  finishLabel: 'Go to the hearing',
  finish: async (g) =>
    g.choose(
      [
        { label: 'File the motion. Wednesday, we go after the stop.', value: true },
        { label: 'Not yet. Keep digging.', value: false },
      ],
      { prompt: 'The suppression hearing is Wednesday morning. Ready?' },
    ),
  hint: (g) => {
    if (!g.has('p_teo')) return 'Talk to Teo first. Get his side of everything.';
    if (!g.has('c2_dashgo')) return "Teo said his DashGo log proves the pizza delivery. My laptop's at the office.";
    if (!g.has('c2_telemetry')) return 'Teo swears he stopped at that sign. Ask me about it at the office. I have an idea.';
    if (!g.has('c2_report') || !g.has('c2_affidavit') || !g.has('c2_fragment')) return "Sergeant Kessler has the arrest paperwork. The Narcotics Unit.";
    if (!g.has('c2_tox')) return 'Detective Brandt looked like he wanted to tell you something at the precinct.';
    if (!g.has('c2_texts')) return "The DA's office has discovery ready. Strand doesn't hide things.";
    if (!g.has('c2_labreport')) return 'The crime lab tested the pills. Go talk to the chemist.';
    if (!g.has('c2_article') || !g.has('c2_chip')) return "Chloe's dorm room. Look at her desk and that corkboard.";
    if (!g.has('p_jojo')) return 'The party house in Las Lomas. Somebody there called the police very fast.';
    if (!g.has('p_crane')) return 'Talk to Silas Crane at the DA’s office. I know you don’t want to.';
    return "That's enough to argue the motion. And try the Deduction Board before Wednesday — two facts at a time.";
  },
};

export const inv1Scene: SceneFn = async (g) => {
  await investigate(g, CASE2_INV1);
  return 'c2_hearing';
};
