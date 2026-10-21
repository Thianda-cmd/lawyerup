// Plays a case start to finish in a real browser and reports what happened.
// usage: PW_PATH=... BOT_URL=... node dev/bot.mjs <shotdir> [--fast] [--case2] [--from=scene] [--resume=cp.json]
// Every new scene writes its checkpoint to <shotdir>/cp-<scene>.json; --resume picks up from one.
import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH);
const out = process.argv[2];
const fast = process.argv.includes('--fast');
const case2 = process.argv.includes('--case2');
const from = (process.argv.find((a) => a.startsWith('--from=')) ?? '').slice(7);
const resume = (process.argv.find((a) => a.startsWith('--resume=')) ?? '').slice(9);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('crash', () => console.log('PAGE CRASHED'));
browser.on('disconnected', () => console.log('BROWSER DISCONNECTED'));
await page.goto(process.env.BOT_URL ?? 'http://localhost:5173/', { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });

// --- answer keys (substrings; avoid apostrophes, the game uses curly quotes) ----
const OBJECT = [
  ['hated the man', 'speculation'], ['feuding with the victim', 'leading'], ['janitor told me', 'hearsay'],
  ['everything you know about', 'narrative'], ['clear as day, walk into', 'leading'], ['gonna snap', 'speculation'], ['must have been terrified', 'facts'],
  ['The same drug the defendant sold', 'facts'], ['did Chloe Whitfield swallow', 'foundation'], ['sell Chloe a blue pill in your kitchen', 'leading'], ['Everybody knew Chloe was using again', 'speculation'],
];
const PRESENT = [
  ['Fresh enough to convict', 'forensics'], ['Nobody can confirm that', 'cuesheet'], ['on his way back to the trap room', 'floorplan'],
  ['toward the trap room', 'still'], ['Nobody else is that tall', 'ded_height'], ['TWO Corvins', 'ded_cape'],
  ['barely make my cue', 'stopwatch'], ['hung my cape back', 'tag'], ['stole my cape', 'ded_glitter'], ['no reason in the world', 'ledger'],
  ['straight to the balcony for the 9:46', 'photo'],
  ['roll through the stop sign', 'c2_telemetry'], ['strong odor of marijuana', 'c2_inventory'], ['consented to the search', 'c2_report'],
  ['indicates that she took the other half', 'c2_ded_drink'], ['consistent with the counterfeit pills circulating', 'c2_ded_burn'],
  ['She partied hard', 'c2_chip'], ['in my kitchen. Selling her', 'c2_ded_alibi'], ['never touched her drink', 'c2_cupphoto'], ['know any cops', 'c2_memo'],
  ['never met Jonah Pratt', 'c2_phonelog'], ['found them in a lawful search', 'c2_ded_plant'], ['destroyed by the book', 'c2_ded_burn'], ['Prove those pills ever left', '@stash'],
];
const READS = [
  ['heading to the restroom', 'Eyes', 'lying about why'], ['going to the restroom', 'Forehead', 'lying about why'], ['life', 'Eyes', 'protecting a person'],
  ['lying down in the dark', 'Throat', 'lying about where'], ['Not that night', 'Mouth', 'lying'],
  ['nothing else. I swear', 'Eyes', 'ashamed of something'], ['Selling her a blue. Clear as day', 'Brows', 'never saw Teo'], ['never used drugs. Never', 'Throat', 'protecting Chloe'],
  ['all I found', 'Eyes', 'allowed to put'], ['IA can weigh whatever', 'Forehead', 'something to move'], ['My witness is solid', 'Mouth', 'trust her own witness'],
  ['all I can say', 'Eyes', 'holding back what she found'], ['listen to the evidence. Obviously', 'Eyes', 'already decided'], ['No connections to law enforcement', 'Throat', 'lying about police'],
];
const READ_STATEMENTS = ['heading to the restroom', 'certainly never went into Leon'];
const CLOSING = [['beneath the stage', 'cuesheet'], ['could not have been Corvin', 'ded_height'], ['made for someone else', 'ded_cape'], ['left something of themselves', 'ded_glitter']];
const CHOICE_PREFS = [
  'Fifteen hundred', 'Pay the $200', 'Plain and honest', 'not here to crucify', 'Break the code', "We're ready",
  'do everything I can', 'you tell the truth about the Adderall', 'Pay the kid', 'subpoena you. Then', 'Call Brandt. Wait', 'Tell them plainly',
  'Ask him about Chloe', 'File the motion', 'pick a jury', 'We’re ready',
];
const SKIP = ['Back', 'Never mind', 'Not right now', 'Stay here', 'Not yet.', 'Not yet. Keep digging.'];
let moveCounter = 0;
const usedPresent = new Set();
const usedReads = new Set();
let lastText = '';
let shots = 0;
let invPhase = 'examine';
const ceVisits = {};
// Log lines stream to stdout as they happen, so a crash still leaves a trail.
const log = { push: (line) => console.log(line) };
const shot = async (name) => { await page.screenshot({ path: `${out}/${String(++shots).padStart(2, '0')}-${name}.png` }); };

const snap = () => page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  return {
    choices: [...document.querySelectorAll('.choices .choice')].map((b) => ({ label: b.querySelector('.choice-label').innerText, done: b.classList.contains('done'), disabled: b.disabled })),
    ce: !!q('.ce-bar'), dx: !!q('.dx-bar'), inv: [...document.querySelectorAll('.inv-bar button')].map((b) => b.dataset.a),
    examine: !!q('.examine'), spots: [...document.querySelectorAll('.examine .spot:not(.seen)')].map((b) => b.dataset.id),
    record: !!q('.record'), presenting: !!q('.record.presenting'), recTitle: q('.rec-title')?.innerText,
    grounds: !!q('.grounds'), read: !!q('.read-overlay'), readBtns: [...document.querySelectorAll('.read-btn')].map((b) => b.innerText.split('\n')[0]),
    readCaption: q('.read-caption')?.innerText ?? '', readTitle: q('.read-title')?.innerText ?? '',
    motion: !!q('.motion'), voir: !!q('.voir'), voirName: q('.voir-name')?.innerText ?? '',
    voirBtns: [...document.querySelectorAll('.voir-btn')].map((b) => ({ t: b.querySelector('b').innerText, d: b.disabled })),
    text: q('.dlg-text')?.innerText ?? '', dlgHidden: q('.dlg')?.classList.contains('hidden'),
    report: !!q('.report'), gameover: q('.gameover')?.innerText, title: !!q('.title-screen'), loc: q('.hud-loc')?.innerText ?? '',
    jury: window.__game?.state.trial.jury, scene: window.__game?.sceneId, focus: window.__game?.state.trial.focus,
  };
});

async function presentItem(id) {
  if (id === '@stash') id = (await page.evaluate(() => window.__game.has('c2_stash'))) ? 'c2_stash' : 'c2_photos';
  const tab = id.startsWith('p_') ? 'profiles' : 'evidence';
  await page.click(`.rec-tab[data-tab=${tab}]`);
  if (!(await page.$(`.rec-item[data-id="${id}"]`))) { log.push('MISSING ITEM ' + id); await page.click('[data-close]').catch(() => {}); return; }
  await page.click(`.rec-item[data-id="${id}"]`);
  await page.click('.present-btn');
}

async function deduce() {
  const pairs = await page.evaluate(() => {
    const g = window.__game;
    return g.content.recipes.filter((r) => g.has(r.a) && g.has(r.b) && !g.has(r.result)).map((r) => [r.a, r.b]);
  });
  if (!pairs.length) return;
  await page.click('.hud-btn.rec');
  await page.click('.rec-tab[data-tab=board]');
  for (const [a, b] of pairs) {
    await page.click(`.board-card[data-board="${a}"]`);
    await page.click(`.board-card[data-board="${b}"]`);
    await page.click('[data-connect]');
    await page.waitForTimeout(150);
    log.push('board: ' + (await page.$eval('.board-msg', (e) => e.innerText)).replace(/\n/g, ' '));
  }
  await shot('board');
  await page.click('[data-close]');
}

if (fast) await page.keyboard.down('Control');
if (resume) {
  await page.evaluate((cp) => {
    const g = window.__game;
    document.querySelector('.title-screen')?.remove();
    g.stage.classList.remove('on-title');
    g.load(cp.scene, cp.state);
  }, JSON.parse(readFileSync(resume, 'utf8')));
} else if (from) {
  await page.evaluate((scene) => {
    const g = window.__game;
    document.querySelector('.title-screen')?.remove();
    g.stage.classList.remove('on-title');
    const st = JSON.parse(JSON.stringify(g.state));
    st.evidence = ['badge','program','autopsy','statuette','forensics','cape','glove','floorplan','cuesheet','still','stopwatch','tag','glitter','ledger','photo','ded_height','ded_cape','ded_glitter'];
    st.profiles = ['p_corvin','p_iris','p_benny','p_sable'];
    g.load(scene, st);
  }, from);
} else if (case2) {
  await page.click('.click-to-start');
  await page.click('[data-a=cases]');
  await page.waitForTimeout(400);
  await page.click('.case-pick[data-scene=c2_cold_open]');
} else {
  await page.click('.click-to-start');
  await page.click('[data-a=new]');
}

const seenScenes = new Set();
let clickErrors = 0;
for (let tick = 0; tick < 12000; tick++) {
  await page.waitForTimeout(fast ? 25 : 60);
  try {
    const s = await snap();
    if (s.scene && !seenScenes.has(s.scene)) { seenScenes.add(s.scene); log.push(`== scene ${s.scene} (jury ${s.jury}) tick ${tick}`); await shot(s.scene);
      writeFileSync(`${out}/cp-${s.scene}.json`, await page.evaluate(() => JSON.stringify(window.__game.cp)));
    }
    if (tick % 300 === 299) log.push(`.. tick ${tick} loc=${s.loc} inv=${s.inv} spots=${s.spots} choices=${s.choices.map((c) => c.label + (c.done ? '✓' : '') + (c.disabled ? '✗' : '')).join(' | ')} text=${s.text.slice(0, 60)}`);
    if (tick % 600 === 599) log.push('.. have ' + (await page.evaluate(() => [...window.__game.state.evidence, ...window.__game.state.profiles].join(','))));
    if (s.gameover) { log.push('GAME OVER: ' + s.gameover.replace(/\n/g, ' ')); await shot('gameover'); break; }
    if (s.title && tick > 50) { log.push('back at title'); await shot('end-title'); break; }
    if (s.report) { await shot('report'); log.push('report shown'); await page.click('[data-ok]'); continue; }
    if (s.grounds) {
      const g = OBJECT.find(([k]) => lastText.includes(k))?.[1];
      log.push(`object (${g}) <- ${lastText.slice(0, 50)}`);
      await page.waitForTimeout(420);
      await page.click(`.ground[data-g=${g ?? 'relevance'}]`);
      continue;
    }
    if (s.motion) {
      await page.waitForTimeout(450);
      for (const id of ['stop', 'odor', 'consent']) await page.click(`.motion-arg[data-id=${id}]`);
      await shot('motion');
      await page.click('[data-file]');
      log.push('motion filed');
      continue;
    }
    if (s.voir) {
      const t = s.voirBtns.map((b) => b.t);
      await page.waitForTimeout(380);
      if (t.includes('Begin the trial')) { await shot('voir-summary'); await page.click('.voir-btn'); continue; }
      if (t.includes('Keep')) {
        const bad = ['Derek Holt', 'Gordon Pike'].includes(s.voirName);
        const readBtn = s.voirBtns.find((b) => b.t === 'Read them');
        if (bad && readBtn && !readBtn.d && !usedReads.has(s.voirName)) { usedReads.add(s.voirName); await page.click('.voir-btn.read'); continue; }
        if (s.voirName === 'Gordon Pike') await shot('voir-pike');
        await page.click(bad ? '.voir-btn.strike' : '.voir-btn.keep');
        log.push(`voir: ${bad ? 'strike' : 'keep'} ${s.voirName}`);
        continue;
      }
      if (t.length) { await page.click('.voir-btn'); continue; }
    }
    if (s.read) {
      if (s.readBtns.length && s.readBtns.includes('Eyes')) {
        const r = READS.find(([k]) => s.readCaption.includes(k));
        log.push(`read region ${r?.[1]} <- ${s.readCaption.slice(0, 40)}`);
        await page.waitForTimeout(420);
        await page.click(`.read-btn:has-text("${r?.[1] ?? 'Eyes'}")`, { force: true });
      } else if (s.readBtns.length > 1) {
        const r = READS.find(([k]) => s.readCaption.includes(k));
        await page.waitForTimeout(420);
        const btns = await page.$$('.read-btn');
        let clicked = false;
        for (const b of btns) { const t = await b.innerText(); if (r && t.includes(r[2])) { await b.click({ force: true }); clicked = true; log.push('read meaning: ' + t); break; } }
        if (!clicked) { log.push('read meaning: NO MATCH for ' + s.readCaption.slice(0, 40)); await btns[0].click({ force: true }); }
      } else if (!s.readBtns.length && s.readTitle && !s.readTitle.startsWith('Watch')) {
        await page.keyboard.press('Space');
      }
      continue;
    }
    if (s.presenting) {
      const id = s.recTitle === 'Prove it.' ? CLOSING.find(([k]) => lastText.includes(k))?.[1] : PRESENT.find(([k]) => lastText.includes(k))?.[1];
      log.push(`present ${id} <- ${lastText.slice(0, 50)}`);
      await presentItem(id ?? 'badge');
      continue;
    }
    if (s.record) { await page.click('[data-close]').catch(() => {}); continue; }
    if (s.dx) {
      lastText = s.text;
      const hit = OBJECT.find(([k]) => s.text.includes(k));
      await page.waitForTimeout(420);
      if (hit) await page.click('.dx-btn.objection'); else await page.click('.dx-btn.go');
      continue;
    }
    if (s.ce) {
      lastText = s.text;
      const key = s.text.slice(0, 40);
      ceVisits[key] = (ceVisits[key] ?? 0) + 1;
      if (ceVisits[key] === 1) { await page.click('.ce-btn.press'); continue; }
      const p = PRESENT.find(([k]) => s.text.includes(k));
      if (p && !usedPresent.has(p[0] + s.scene)) { usedPresent.add(p[0] + s.scene); await page.click('.ce-btn.present'); continue; }
      const rs = READ_STATEMENTS.find((k) => s.text.includes(k));
      if (rs && !usedReads.has(rs) && s.focus > 0) { usedReads.add(rs); await page.click('.ce-btn.read'); continue; }
      if (ceVisits[key] > 14) { log.push('STUCK on ' + key); await shot('stuck'); break; }
      await page.click('.ce-btn[data-a=next]');
      continue;
    }
    if (s.examine) {
      if (s.spots.length) await page.click(`.spot[data-id="${s.spots[0]}"]`);
      else await page.click('.examine-back');
      continue;
    }
    if (s.inv.length) {
      if (s.inv.includes('finish')) { await deduce(); await page.click('.inv-btn[data-a=finish]'); continue; }
      if (invPhase === 'examine') { invPhase = 'talk'; await page.click('.inv-btn[data-a=examine]'); continue; }
      if (invPhase === 'talk') { invPhase = 'move'; if (s.inv.includes('talk')) { await page.click('.inv-btn[data-a=talk]'); continue; } }
      if (invPhase === 'move') { invPhase = 'pickmove'; await deduce(); await page.click('.inv-btn[data-a=move]'); continue; }
      invPhase = 'examine';
      continue;
    }
    if (s.choices.length) {
      const labels = s.choices.map((c) => c.label);
      await page.waitForTimeout(420);
      if (invPhase === 'pickmove') {
        const opts = s.choices.filter((c) => !SKIP.includes(c.label));
        const pick = opts[moveCounter++ % Math.max(1, opts.length)]?.label ?? 'Stay here';
        invPhase = 'examine';
        await page.click(`.choice:has-text("${pick.slice(0, 40)}")`);
        continue;
      }
      // plea negotiation: use every leverage, read once, then reject
      if (labels.some((l) => l.startsWith('Reject the deal'))) {
        const lev = s.choices.find((c) => !c.disabled && !c.done && !c.label.startsWith('Take the deal') && !c.label.startsWith('Reject'));
        const pick = lev?.label ?? labels.find((l) => l.startsWith('Reject'));
        log.push('negotiate: ' + pick);
        await page.click(`.choice:has-text("${pick.slice(0, 40)}")`);
        continue;
      }
      const warrant = s.choices.find((c) => c.label.startsWith('Call Brandt. Wait'));
      if (warrant?.disabled) { await page.click('.choice:has-text("Not yet.")'); continue; }
      const pref = CHOICE_PREFS.find((p) => s.choices.some((c) => c.label.includes(p) && !c.disabled));
      if (pref) { log.push('choose: ' + pref); await page.click(`.choice:has-text("${pref}")`); continue; }
      const undone = s.choices.find((c) => !c.done && !c.disabled && !SKIP.includes(c.label));
      if (undone) { await page.click(`.choice:has-text("${undone.label.slice(0, 30)}")`); continue; }
      const back = s.choices.find((c) => SKIP.includes(c.label));
      await page.click(`.choice:has-text("${(back?.label ?? labels[0]).slice(0, 30)}")`);
      continue;
    }
    if (!s.dlgHidden) lastText = s.text || lastText;
    await page.mouse.click(800, 450);
  } catch (e) {
    log.push('tick error: ' + e.message.split('\n')[0]);
    if (++clickErrors > 20) { await shot('errors'); break; }
  }
}
const final = await snap();
log.push(`final scene=${final.scene} jury=${final.jury}`);
log.push(await page.evaluate(() => JSON.stringify({ trial: window.__game.state.trial, stats: window.__game.state.stats })));
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
await browser.close();
