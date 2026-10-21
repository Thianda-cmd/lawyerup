import { describe, expect, it } from 'vitest';
import { ScriptError, parse, parseLine, segmentText } from './dsl';

describe('screenplay DSL', () => {
  it('parses spoken lines with and without expressions', () => {
    expect(parseLine('rosa[smile]: Hello, *boss*.')).toEqual({ t: 'say', who: 'rosa', expr: 'smile', text: 'Hello, *boss*.' });
    expect(parseLine('ezra: Fine.')).toEqual({ t: 'say', who: 'ezra', expr: undefined, text: 'Fine.' });
  });

  it('keeps colons inside the line', () => {
    expect(parseLine('brandt: Time of death: 9:40.')).toMatchObject({ who: 'brandt', text: 'Time of death: 9:40.' });
  });

  it('parses thoughts, narration and custom nameplates', () => {
    expect(parseLine('~ Something is off.')).toEqual({ t: 'say', who: 'ezra', text: 'Something is off.', thought: true });
    expect(parseLine(': The lights dim.')).toEqual({ t: 'say', who: null, text: 'The lights dim.' });
    expect(parseLine('[Bailiff]: All rise!')).toEqual({ t: 'say', who: null, name: 'Bailiff', text: 'All rise!' });
  });

  it('parses commands', () => {
    expect(parseLine('@show corvin sad left')).toEqual({ t: 'show', who: 'corvin', expr: 'sad', pos: 'left' });
    expect(parseLine('@jury -10')).toEqual({ t: 'jury', delta: -10 });
    expect(parseLine('@stat notoriety +1')).toEqual({ t: 'stat', id: 'notoriety', delta: 1 });
    expect(parseLine('@title Paramount Theater | 10:32 AM')).toEqual({ t: 'title', text: 'Paramount Theater', sub: '10:32 AM' });
    expect(parseLine('@music stop')).toEqual({ t: 'music', id: null });
    expect(parseLine('@flag met_iris off')).toEqual({ t: 'flag', id: 'met_iris', value: false });
    expect(parseLine('@outfit corvin jail')).toEqual({ t: 'outfit', who: 'corvin', id: 'jail' });
  });

  it('skips blanks and comments', () => {
    expect(parse('\n  // nothing\n\n')).toEqual([]);
  });

  it('rejects typos loudly', () => {
    expect(() => parseLine('rossa: hi')).toThrow(ScriptError);
    expect(() => parseLine('@shwo rosa')).toThrow(ScriptError);
    expect(() => parseLine('@show rosa smile middle')).toThrow(ScriptError);
    expect(() => parseLine('@burst kaboom')).toThrow(ScriptError);
  });

  it('segments emphasis and pauses', () => {
    expect(segmentText('A *red* herring{w} indeed')).toEqual([
      { text: 'A ' },
      { text: 'red', em: true },
      { text: ' herring' },
      { text: '', pause: 350 },
      { text: ' indeed' },
    ]);
  });
});
