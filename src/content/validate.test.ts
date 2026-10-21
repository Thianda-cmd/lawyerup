/// <reference types="node" />
/**
 * Static checks over the written content, so typos fail the build instead of
 * a playthrough: unknown expressions, evidence ids, items nobody hands out,
 * backgrounds, music, sfx, scene links and deduction recipes.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BACKGROUNDS } from '../art/backgrounds';
import { knownExpr } from '../art/cast';
import { TRACKS } from '../engine/audio';
import { CHAR_IDS } from '../engine/dsl';
import type { CharId } from '../engine/types';
import { CONTENT } from './index';

const root = join(__dirname);
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return files(p);
    return p.endsWith('.ts') && !p.endsWith('.test.ts') ? [p] : [];
  });
}
const sources = [...files(root), ...files(join(root, '../systems'))].map((p) => ({ p, src: readFileSync(p, 'utf8') }));
const audioSrc = readFileSync(join(root, '../engine/audio.ts'), 'utf8');
const sfxIds = new Set([...audioSrc.slice(audioSrc.indexOf('sfx(id: string)')).matchAll(/case '(\w+)':/g)].map((m) => m[1]));
const ids = CHAR_IDS.join('|');

function all(re: RegExp): { p: string; m: RegExpMatchArray }[] {
  return sources.flatMap(({ p, src }) => [...src.matchAll(re)].map((m) => ({ p, m })));
}

describe('case content', () => {
  it('uses only expressions that exist', () => {
    const bad: string[] = [];
    for (const { p, m } of all(new RegExp(`(?:^|\\n|\x60)\\s*(${ids})\\[(\\w+)\\]:`, 'g'))) {
      if (!knownExpr(m[1] as CharId, m[2])) bad.push(`${p}: ${m[1]}[${m[2]}]`);
    }
    for (const { p, m } of all(new RegExp(`@(?:show|expr) (${ids}) (\\w+)`, 'g'))) {
      if (!knownExpr(m[1] as CharId, m[2])) bad.push(`${p}: @show ${m[1]} ${m[2]}`);
    }
    for (const { p, m } of all(new RegExp(`char: '(${ids})',\\s*expr: '(\\w+)'`, 'g'))) {
      if (!knownExpr(m[1] as CharId, m[2])) bad.push(`${p}: ${m[1]} ${m[2]}`);
    }
    for (const { p, m } of all(/expr: '(\w+)'/g)) {
      if (!CHAR_IDS.some((c) => knownExpr(c, m[1]))) bad.push(`${p}: expr ${m[1]}`);
    }
    expect(bad).toEqual([]);
  });

  it('references only real evidence and profiles', () => {
    const known = new Set([...Object.keys(CONTENT.evidence), ...Object.keys(CONTENT.profiles)]);
    const bad: string[] = [];
    const refs = [
      ...all(/@(?:evidence|profile) (\w+)/g),
      ...all(/give(?:Evidence|Profile)\('(\w+)'/g),
      ...all(/g\.has\('(\w+)'\)/g),
      ...all(/answer: \[([^\]]+)\]/g),
    ];
    for (const { p, m } of refs) {
      for (const id of m[1].split(',').map((x) => x.trim().replace(/'/g, ''))) if (!known.has(id)) bad.push(`${p}: ${id}`);
    }
    // keys of present: { id: ... } maps
    for (const { p, src } of sources) {
      for (const block of src.matchAll(/present: \{([\s\S]*?)\n\s{6,8}\},/g)) {
        for (const k of block[1].matchAll(/^\s{6,10}(\w+): (?:s`|async)/gm)) if (!known.has(k[1])) bad.push(`${p}: present.${k[1]}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('hands out every evidence item and profile somewhere', () => {
    const given = new Set([
      ...all(/@(?:evidence|profile) (\w+)/g).map(({ m }) => m[1]),
      ...all(/give(?:Evidence|Profile)\('(\w+)'/g).map(({ m }) => m[1]),
      ...CONTENT.recipes.map((r) => r.result),
    ]);
    const never = [...Object.keys(CONTENT.evidence), ...Object.keys(CONTENT.profiles)].filter((id) => !given.has(id));
    expect(never).toEqual([]);
  });

  it('uses real backgrounds, music and sound effects', () => {
    const bad: string[] = [];
    for (const { p, m } of all(/@bg (\w+)/g)) if (!BACKGROUNDS[m[1]]) bad.push(`${p}: bg ${m[1]}`);
    for (const { p, m } of all(/bg: '(\w+)'/g)) if (!BACKGROUNDS[m[1]]) bad.push(`${p}: bg ${m[1]}`);
    for (const { p, m } of all(/\.bg\('(\w+)'/g)) if (!BACKGROUNDS[m[1]]) bad.push(`${p}: bg ${m[1]}`);
    for (const { p, m } of all(/@music (\w+)/g)) if (m[1] !== 'stop' && !TRACKS[m[1]]) bad.push(`${p}: music ${m[1]}`);
    for (const { p, m } of all(/music: '(\w+)'/g)) if (!TRACKS[m[1]]) bad.push(`${p}: music ${m[1]}`);
    for (const { p, m } of all(/audio\.music\('(\w+)'\)/g)) if (!TRACKS[m[1]]) bad.push(`${p}: music ${m[1]}`);
    for (const { p, m } of all(/@sfx (\w+)/g)) if (!sfxIds.has(m[1])) bad.push(`${p}: sfx ${m[1]}`);
    expect(bad).toEqual([]);
  });

  it('links scenes that exist', () => {
    const bad: string[] = [];
    for (const { p, m } of all(/return '(c\d_\w+)'/g)) if (!CONTENT.scenes[m[1]]) bad.push(`${p}: ${m[1]}`);
    for (const id of Object.keys(CONTENT.scenes)) expect(CONTENT.sceneLabels[id], `label for ${id}`).toBeTruthy();
    expect(bad).toEqual([]);
  });

  it('has deduction recipes over real items', () => {
    const known = new Set([...Object.keys(CONTENT.evidence), ...Object.keys(CONTENT.profiles)]);
    for (const r of CONTENT.recipes) {
      expect(known.has(r.a), r.a).toBe(true);
      expect(known.has(r.b), r.b).toBe(true);
      expect(CONTENT.evidence[r.result]?.kind, r.result).toBe('deduction');
    }
  });
});
