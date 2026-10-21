import { s } from '../../engine/dsl';
import type { SceneFn } from '../../engine/game';
import { freshTrial } from '../../engine/state';

export const coldOpen2: SceneFn = async (g) => {
  // a new case starts with a clean Court Record; your reputation carries over
  g.state.evidence = [];
  g.state.profiles = [];
  g.state.inv.location = '';
  g.state.trial = freshTrial();
  g.state.vars.defendant = 'Teo Quintero';
  await g.run(s`
    @music stop
    @bg black instant
    @wait 600
    @title Voice Memo | Thursday, 11:48 PM
    [Chloe]: Day forty-one. I finally got him on tape. He doesn't even know he said it.
    [Chloe]: If this is real, it's not a campus story anymore. It's a city story.
    [Chloe]: ...Okay. Monday. Publish Monday. Don't chicken out, Chloe.
    @music tension
    @bg party
    @title Las Lomas | Saturday, 12:31 AM
    : The Pratt house. Two hundred college kids, a pool lit like a jewelry case, and music you can feel in your teeth.
    @outfit jojo party
    @show jojo neutral center
    jojo: Chloe Whitfield. At my party. You don't even drink.
    [Chloe]: I'm not here to drink, Jonah. I'm here to tell you to your face. It runs Monday. All of it.
    jojo[annoyed]: All of what?
    [Chloe]: You. Your "warehouse." Your cop.
    jojo[cold]: ...
    jojo[smile]: Okay. Okay, hey. You're shaking. Relax. You look thirsty. Here — it's just Limón, I swear. I'll even open a new bottle.
    @hide jojo
    @wait 400
    @sfx heartbeat
    @wait 900
    @sfx heartbeat
    : At 1:02 AM, Chloe Whitfield collapsed on the floor of an upstairs bathroom.
    : At 2:31 AM, she was pronounced dead at San Querida General. Fentanyl.
    @bg black instant
    @wait 500
    @music stop
    @bg traffic_stop
    @title Alvarado & 5th | Sunday, 10:20 AM
    @outfit teo hoodie
    @show teo nervous left
    @show kessler friendly right
    kessler[friendly]: Morning, son. License and registration.
    teo[nervous]: Sure, yeah — is something wrong? I'm on a delivery, my app's gonna —
    kessler: You rolled that stop sign back there.
    teo[surprised]: I stopped. I — I'm pretty sure I stopped.
    kessler[neutral]: You smell that? Smells like weed in here.
    teo[worried]: I don't smoke, sir. I don't even —
    kessler[cold]: Step out of the car. Hands where I can see them.
    @hide teo
    @wait 700
    @sfx paper
    kessler[smirk]: Well, well. Look what we've got under the passenger seat.
    kessler: Twelve blue thirties. Mateo Quintero, you're under arrest.
    @sfx stamp
    @shake 1
    @bg black instant
    @hide all
    @wait 400
  `);
  g.hideDialogue();
  await g.caseCard('CASE 2', 'Chain of Custody', 'People of the State v. Mateo Quintero');
  return 'c2_intake';
};

export const intake: SceneFn = async (g) => {
  g.resetStage();
  await g.run(s`
    @bg office
    @music sad
    @title Vane & Associates | Monday, 6:12 AM
    ~ Three weeks since The Vanishing Act. Three weeks of people asking for "the magician lawyer." Three weeks of Silas Crane's business card staring at me from the corner of this desk.
    @sfx door
    @show rosa cry center
    rosa[cry]: Ezra.
    ~ Rosa Quintero has walked through that door every morning for four years. I've seen her furious, exhausted and unpaid. I have never seen her cry.
    ezra: Rosa. Sit down. What happened?
    rosa[sad]: Teo. My little brother. They arrested him yesterday morning. Traffic stop. They're saying —
    rosa[cry]: They're saying he sold the pill that killed that girl. The councilwoman's daughter.
    ezra: Chloe Whitfield. It's been on every channel.
    rosa[mad]: He delivers pizzas, Ezra! He failed his driving test twice because he wouldn't go over the speed limit!
    rosa[sad]: They charged him with *drug-induced homicide*. Twenty years to life. He's nineteen.
  `);
  const promise = await g.choose(
    [
      { label: '"I’ll get him out. I promise."', value: 'promise', tag: 'RISKY', hint: 'She needs to hear it. You can’t know it.' },
      { label: '"I’ll do everything I can. And I won’t lie to you about the odds."', value: 'honest', tag: 'HONEST', hint: 'The truth, even now.' },
    ],
    { prompt: 'She is looking at me the way clients look at me. Not the way Rosa looks at me.' },
  );
  if (promise === 'promise') {
    await g.run(s`
      ezra: I'll get him out, Rosa. I promise.
      rosa[sad]: ...Don't say that unless you mean it.
      ezra: I mean it.
      ~ I have no idea if I can keep that. But I've never wanted to keep a promise more.
      @stat trust 1
      @flag c2_promised
    `);
  } else {
    await g.run(s`
      ezra: I'll do everything I can. And I'll tell you the truth about the odds, every step, even when it's bad.
      rosa[sad]: ...That's why I came to you. You don't lie to me. You lie to everyone else.
      @stat integrity 1
    `);
  }
  await g.run(s`
    rosa[serious]: There's more. Turn on the TV. Channel 6.
    @sfx click
    @hide rosa
    @bg press
    @music tension
    @outfit whitfield blazer
    @show strand cold left
    @show whitfield sad center
    @show crane neutral right
    whitfield[sad]: My daughter Chloe was twenty years old. She was bright, and she was kind, and on Saturday night someone sold her poison and called it medicine.
    whitfield[mad]: For two years I have fought this crisis on the city council. Now it is in my home.
    whitfield[cry]: I will not rest until every dealer in this city understands: Chloe will be the last.
    strand[cold]: The District Attorney's office has charged a nineteen-year-old man with drug-induced homicide. The evidence is strong. We will seek the maximum.
    ~ Helena Strand. Forty-one and one, and the one was me. She won't make it easy twice.
    ~ And standing behind the councilwoman, half out of frame, smiling at the cameras like he owns them...
    crane[neutral]: ...
    ~ Silas Crane.
    @hide all
    @bg office instant
    @music sad
    @show rosa worried center
    rosa[worried]: Ezra? Who's the old man?
    ezra: The man who taught me everything I know about lying. He's working for the prosecution.
    rosa[shock]: The guy from the business card?
    ezra: The guy from the business card.
    ~ "Every jury has a tell." He isn't here for the councilwoman. He's here for me.
    rosa[serious]: Then we'd better be faster than him. Teo's at County. They're arraigning him at nine.
    ezra: Then let's go meet our client.
    rosa[smile]: Our client. ...Yeah.
  `);
  return 'c2_inv1';
};
