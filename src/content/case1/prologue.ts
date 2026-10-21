import { s } from '../../engine/dsl';
import type { SceneFn } from '../../engine/game';

export const coldOpen: SceneFn = async (g) => {
  await g.run(s`
    @music stop
    @bg black instant
    @wait 600
    : Friday night. The Paramount Theater, San Querida.
    @music tension
    @bg stage
    @outfit corvin stage
    @show corvin smug center
    [The Amazing Corvin]: Ladies and gentlemen. For thirty years, I have shown you the impossible.
    [The Amazing Corvin]: Tonight, for my final illusion, I will step into this cabinet{w} — and *cease to exist*.
    @hide corvin
    @wait 500
    @sfx magic
    @flash #ffe7a8
    @shake 1
    : Smoke. A gasp from eight hundred throats. The cabinet stands empty.
    @bg corridor
    @filter flashback
    : Backstage, a figure in a black cape moves quickly down the corridor, beneath the green glow of the EXIT sign.
    : The door marked L. SABLE opens without a knock.
    [Leon Sable]: You. I told you — after the show. I meant it. I'm calling the police.
    [???]: Leon. Please. Nine years...
    [Leon Sable]: Nine years doesn't buy you forty thousand dollars.
    @sfx thud
    @shake 2
    @flash #8a0c18
    @bg black instant
    @filter none
    @wait 900
    : At 9:46, The Amazing Corvin reappeared in the balcony to a standing ovation.
    : At 10:05, Leon Sable was found dead on his office floor.
    : At 11:31, Corvin Mallory was arrested for his murder.
    @wait 400
  `);
  g.hideDialogue();
  await g.caseCard('CASE 1', 'The Vanishing Act', 'People of the State v. Corvin Mallory');
  return 'c1_office';
};

export const office: SceneFn = async (g) => {
  await g.run(s`
    @bg office
    @music office
    @title Vane & Associates | Saturday, 8:52 AM
    @show rosa annoyed center
    rosa[annoyed]: You slept here again.
    ~ Rosa Quintero. Paralegal, investigator, and the only reason this office still has electricity.
    ezra: I was *working*, Rosa. Deep, contemplative, billable legal work.
    rosa[annoyed]: There's a playing card stuck to your face.
    ezra: ...Contemplative legal work involving a deck of cards.
    rosa[smile]: Good morning, Mr. Vane.
    ezra: Let me guess. You took the 14 bus because your car's back in the shop. You called your mother on the way — she asked when you're going to get a "real job" — and you're about to ask me about your paycheck.
    rosa[surprised]: ...How did you—
    ezra: Bus transfer sticking out of your pocket. You only fold your arms like that after you've talked to your mother. And the paycheck... is always the paycheck.
    rosa[annoyed]: That's not a trick, that's just you being behind on payroll.
    ~ The poster on the wall says THE GREAT VANE — HE KNOWS WHAT YOU'RE THINKING. Ten years reading strangers in a Las Vegas showroom.
    ~ Turns out it's excellent training for reading juries. Less excellent for paying rent.
    @sfx phone
    @wait 800
    rosa[think]: It's a 702 number. Vegas.
    ezra: Nobody good calls from Vegas.
    @sfx click
    @outfit iris mourning
    @call iris
    iris[sad]: Mr. Vane? My name is Iris Mallory. I'm... I'm calling about my husband. Corvin Mallory.
    ezra: ...The Amazing Corvin?
    iris: You've seen the news, then. They're saying he killed Leon. Leon Sable — our producer. Our friend.
    iris: Corvin always said, if he were ever in real trouble, there was one man who would understand him. "Find the Great Vane."
    ~ Reno, 2009. We shared a bill at the Silver Spur. Corvin taught me my first real sleight of hand — and told me I was wasting my talent pretending to read minds.
    ~ He was right. Just not in the way he meant.
    iris: The district attorney is pushing for an expedited trial. It starts Tuesday. Will you help him?
  `);
  const fee = await g.choose(
    [
      { label: '"Five thousand. Cash. Up front."', value: 'cash', tag: 'SHADY', hint: 'Rent is due. Rent is always due.' },
      { label: '"Fifteen hundred now. The rest when he walks."', value: 'fair', tag: 'HONEST', hint: 'Bet on yourself.' },
    ],
    { prompt: 'Iris is waiting for an answer. And the landlord is waiting for April.' },
  );
  if (fee === 'cash') {
    await g.run(s`
      ezra: My retainer is five thousand dollars, Mrs. Mallory. Cash. Small bills, if you have them.
      iris: ...I'll have it couriered within the hour.
      @stat money 5000
      @stat notoriety 1
      rosa[annoyed]: Small bills?
      ezra: Small bills are friendly bills.
    `);
  } else {
    await g.run(s`
      ezra: Fifteen hundred to start. The rest when Corvin walks out of that courtroom.
      iris[surprised]: You're very sure of yourself, Mr. Vane.
      ezra: In my old line of work, confidence was the whole act.
      @stat money 1500
      @stat integrity 1
      rosa[smile]: Look at you, being a person.
    `);
  }
  await g.run(s`
    iris: He's at County Detention. Please, Mr. Vane. Corvin is a proud man. He won't tell you everything.
    iris: But he didn't do this.
    @call off
    @sfx click
    rosa[serious]: Tuesday. That's three days to build a murder defense.
    ezra: Then we'd better start with the man who vanished.
    rosa[smile]: Okay, boss, the usual drill. Look around with *Examine*. *Talk* to people. *Present* evidence to see how they react. *Move* when you're done.
    rosa: Anything we pick up goes in the *Court Record* — top right, or press R. And if you get stuck, ask me for a *Hint*.
    rosa[think]: Oh — and that corkboard in the Record? The *Deduction Board*. When two facts belong together, pin them together. That's where cases crack.
    ~ County Detention first. Our client has some explaining to do.
  `);
  await g.giveEvidence('badge');
  g.hideDialogue();
  return 'c1_investigation';
};
