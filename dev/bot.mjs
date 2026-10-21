// Plays Case 1 start to finish in a real browser and reports what happened.
// usage: PW_PATH=... node dev/bot.mjs <shotdir> [--fast] [--from=scene]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH);
const out = process.argv[2];
const fast = process.argv.includes('--fast');
const from = (process.argv.find((a) => a.startsWith('--from=')) ?? '').slice(7);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto(process.env.BOT_URL ?? 'http://localhost:5173/', { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });

// --- answer keys -----------------------------------------------------------
const OBJECT = [
  ['clearly hated', 'speculation'], ['hated the man', 'speculation'], ['feuding with the victim', 'leading'], ['janitor told me', 'hearsay'],
  ['everything you know about', 'narrative'], ['clear as day, walk into', 'leading'], ['gonna snap', 'speculation'], ['must have been terrified', 'facts'],
];
const PRESENT = [
  ['Fresh enough to convict', 'forensics'], ['Nobody can confirm that', 'cuesheet'], ['on his way back to the trap room', 'floorplan'],
  ['toward the trap room', 'still'], ['Nobody else is that tall', 'ded_height'], ['TWO Corvins', 'ded_cape'],
  ['barely make my cue', 'stopwatch'], ['hung my cape back', 'tag'], ['stole my cape', 'ded_glitter'], ['no reason in the world', 'ledger'],
  ['straight to the balcony for the 9:46', 'photo'],
];
const READS = [
  ['heading to the restroom', 'Eyes', 'lying about why'], ['going to the restroom', 'Forehead', 'lying about why'], ['life’s work', 'Eyes', 'protecting a person'],
  ['lying down in the dark', 'Throat', 'lying about where'], ['Not that night', 'Mouth', 'lying'],
];
const READ_STATEMENTS = ['heading to the restroom', 'certainly never went into Leon'];
const CLOSING = [['beneath the stage', 'cuesheet'], ['could not have been Corvin', 'ded_height'], ['made for someone else', 'ded_cape'], ['left something of themselves', 'ded_glitter']];
const CHOICE_PREFS = ['Fifteen hundred', 'Pay the $200', 'Plain and honest', 'I’m not here to crucify', 'Break the code', "We're ready"];
const PLAN = ['Vane & Associates', 'County Detention', 'Stage', 'Backstage', "Leon Sable's Office", "Dressing Room"];
let planIdx = 0;
let usedPresent = new Set();
let usedReads = new Set();
let lastText = '';
let shots = 0;
let deduced = false;
let invPhase = 'examine';
let ceVisits = {};
const log = [];
const shot = async (name) => { await page.screenshot({ path: `${out}/${String(++shots).padStart(2, '0')}-${name}.png` }); };

const snap = () => page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  return {
    choices: [...document.querySelectorAll('.choices .choice')].map((b) => ({ label: b.querySelector('.choice-label').innerText, done: b.classList.contains('done'), disabled: b.disabled, tag: b.querySelector('.choice-tag')?.innerText })),
    ce: !!q('.ce-bar'), dx: !!q('.dx-bar'), inv: [...document.querySelectorAll('.inv-bar button')].map((b) => b.dataset.a),
    examine: !!q('.examine'), spots: [...document.querySelectorAll('.examine .spot:not(.seen)')].map((b) => b.dataset.id),
    record: !!q('.record'), presenting: !!q('.record.presenting'), recTitle: q('.rec-title')?.innerText,
    grounds: !!q('.grounds'), read: !!q('.read-overlay'), readBtns: [...document.querySelectorAll('.read-btn')].map((b) => b.innerText.split('\n')[0]),
    readCaption: q('.read-caption')?.innerText ?? '', readTitle: q('.read-title')?.innerText ?? '',
    text: q('.dlg-text')?.innerText ?? '', dlgHidden: q('.dlg')?.classList.contains('hidden'),
    report: !!q('.report'), gameover: q('.gameover')?.innerText, title: !!q('.title-screen'), loc: q('.hud-loc')?.innerText ?? '',
    banner: q('.court-banner .cb-kicker')?.innerText ?? '', jury: window.__game?.state.trial.jury, scene: window.__game?.sceneId,
    focus: window.__game?.state.trial.focus,
  };
});

async function presentItem(id) {
  const tab = id.startsWith('p_') ? 'profiles' : 'evidence';
  await page.click(`.rec-tab[data-tab=${tab}]`);
  const has = await page.$(`.rec-item[data-id="${id}"]`);
  if (!has) { log.push('MISSING ITEM ' + id); await page.click('[data-close]').catch(() => {}); return; }
  await page.click(`.rec-item[data-id="${id}"]`);
  await page.click('.present-btn');
}

async function deduce() {
  await page.click('.hud-btn.rec');
  await page.click('.rec-tab[data-tab=board]');
  for (const [a, b] of [['still', 'p_corvin'], ['cape', 'tag'], ['cape', 'glitter']]) {
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
if (from) {
  await page.evaluate((scene) => {
    const g = window.__game;
    document.querySelector('.title-screen')?.remove();
    g.stage.classList.remove('on-title');
    const st = JSON.parse(JSON.stringify(g.state));
    st.evidence = ['badge','program','autopsy','statuette','forensics','cape','glove','floorplan','cuesheet','still','stopwatch','tag','glitter','ledger','photo','ded_height','ded_cape','ded_glitter'];
    st.profiles = ['p_corvin','p_iris','p_benny','p_sable'];
    g.load(scene, st);
  }, from);
} else {
  await page.click('.click-to-start');
  await page.click('[data-a=new]');
}

const seenScenes = new Set();
let clickErrors = 0;
for (let tick = 0; tick < 6000; tick++) {
  await page.waitForTimeout(fast ? 25 : 60);
  try {
  const s = await snap();
  if (tick % 400 === 0) {
    const miss = await page.evaluate(() => { const g = window.__game; const need = ['program','autopsy','statuette','forensics','cape','glove','floorplan','cuesheet','still','stopwatch','tag','glitter','ledger','p_corvin','p_iris','p_benny']; return need.filter((i) => !g.has(i)); });
    console.log(`tick ${tick} scene=${s.scene} loc=${s.loc} missing=${miss.join(',')}`);
  }
  if (s.scene && !seenScenes.has(s.scene)) { seenScenes.add(s.scene); log.push(`== scene ${s.scene} (jury ${s.jury})`); if (!fast || ['c1_trial_open','c1_benny_cross','c1_iris','c1_verdict'].includes(s.scene)) await shot(s.scene); }
  if (s.gameover) { log.push('GAME OVER: ' + s.gameover.replace(/\n/g, ' ')); await shot('gameover'); break; }
  if (s.title && tick > 50) { log.push('back at title'); await shot('end-title'); break; }
  if (s.report) { await shot('report'); log.push('report shown'); await page.click('[data-ok]'); continue; }
  if (s.grounds) {
    const g = OBJECT.find(([k]) => lastText.includes(k))?.[1];
    log.push(`object (${g}) <- ${lastText.slice(0, 50)}`);
    await page.click(`.ground[data-g=${g ?? 'relevance'}]`);
    continue;
  }
  if (s.read) {
    if (s.readBtns.length && s.readBtns.includes('Eyes')) {
      const r = READS.find(([k]) => s.readCaption.includes(k));
      log.push(`read region ${r?.[1]} <- ${s.readCaption.slice(0, 40)}`);
      await page.waitForTimeout(300);
      await page.click(`.read-btn:has-text("${r?.[1] ?? 'Eyes'}")`, { force: true });
    } else if (s.readBtns.length > 1) {
      const r = READS.find(([k]) => s.readCaption.includes(k));
      const btns = await page.$$('.read-btn');
      let clicked = false;
      await page.waitForTimeout(300);
      for (const b of btns) { const t = await b.innerText(); if (r && t.includes(r[2])) { await b.click({ force: true }); clicked = true; log.push('read meaning: ' + t); break; } }
      if (!clicked) await btns[0].click({ force: true });
      await page.waitForTimeout(300);
      await shot('read');
    } else if (!s.readBtns.length && s.readTitle && !s.readTitle.startsWith('Watch')) {
      await page.keyboard.press('Space');
    }
    continue;
  }
  if (s.presenting) {
    let id;
    if (s.recTitle === 'Prove it.') id = CLOSING.find(([k]) => lastText.includes(k))?.[1];
    else id = PRESENT.find(([k]) => lastText.includes(k))?.[1];
    log.push(`present ${id} <- ${lastText.slice(0, 50)}`);
    await presentItem(id ?? 'badge');
    continue;
  }
  if (s.record) { await page.click('[data-close]').catch(() => {}); continue; }
  if (s.dx) {
    lastText = s.text;
    const hit = OBJECT.find(([k]) => s.text.includes(k));
    log.push(`dx ${hit ? 'OBJECT' : 'go'} <- ${s.text.slice(0, 50)}`);
    if (hit) await page.click('.dx-btn.objection'); else await page.click('.dx-btn.go');
    continue;
  }
  if (s.ce) {
    lastText = s.text;
    const key = s.text.slice(0, 40);
    ceVisits[key] = (ceVisits[key] ?? 0) + 1;
    if (ceVisits[key] === 1 && !s.text.includes('trap room the whole time')) { await page.click('.ce-btn.press'); continue; }
    const p = PRESENT.find(([k]) => s.text.includes(k));
    if (p && !usedPresent.has(p[0])) { usedPresent.add(p[0]); await page.click('.ce-btn.present'); continue; }
    const rs = READ_STATEMENTS.find((k) => s.text.includes(k));
    if (rs && !usedReads.has(rs) && s.focus > 0) { usedReads.add(rs); await page.click('.ce-btn.read'); continue; }
    if (ceVisits[key] > 12) { log.push('STUCK on ' + key); await shot('stuck'); break; }
    await page.click('.ce-btn[data-a=next]');
    continue;
  }
  if (s.examine) {
    if (s.spots.length) { await page.click(`.spot[data-id="${s.spots[0]}"]`); }
    else await page.click('.examine-back');
    continue;
  }
  if (s.inv.length) {
    if (s.inv.includes('finish')) {
      if (!deduced) { deduced = true; await deduce(); continue; }
      await page.click('.inv-btn[data-a=finish]'); continue;
    }
    if (invPhase === 'examine') { invPhase = 'talk'; await shot('inv-' + s.loc.slice(0, 20).replace(/\W/g, '')); await page.click('.inv-btn[data-a=examine]'); continue; }
    if (invPhase === 'talk') { invPhase = 'move'; if (s.inv.includes('talk')) { await page.click('.inv-btn[data-a=talk]'); continue; } }
    if (invPhase === 'move') { invPhase = 'pickmove'; await page.click('.inv-btn[data-a=move]'); continue; }
    invPhase = 'examine';
    continue;
  }
  if (s.choices.length) {
    const labels = s.choices.map((c) => c.label);
    if (invPhase === 'pickmove') {
      // pick next location in plan that is available
      let pick = null;
      for (let k = 1; k <= PLAN.length; k++) {
        const want = PLAN[(planIdx + k) % PLAN.length];
        const c = s.choices.find((c) => c.label.includes(want));
        if (c) { pick = c.label; planIdx = (planIdx + k) % PLAN.length; break; }
      }
      invPhase = 'examine';
      await page.click(`.choice:has-text("${pick ?? 'Stay here'}")`);
      continue;
    }
    const pref = CHOICE_PREFS.find((p) => labels.some((l) => l.includes(p)));
    if (pref) { log.push('choose: ' + pref); await page.click(`.choice:has-text("${pref}")`); continue; }
    // talk topics: first undone, else back
    const undone = s.choices.find((c) => !c.done && !c.disabled && !['Back', 'Never mind', 'Not right now', 'Stay here'].includes(c.label));
    if (undone) { await page.click(`.choice:has-text("${undone.label.slice(0, 30)}")`); continue; }
    const back = s.choices.find((c) => ['Back', 'Never mind', 'Not right now'].includes(c.label));
    await page.click(`.choice:has-text("${back?.label ?? labels[0]}")`);
    continue;
  }
  if (!s.dlgHidden) lastText = s.text || lastText;
  await page.mouse.click(800, 450);
  } catch (e) {
    log.push('tick error: ' + e.message.split('\n')[0]);
    if (++clickErrors > 15) { await shot('errors'); break; }
  }
}
const final = await snap();
log.push(`final scene=${final.scene} jury=${final.jury}`);
const stats = await page.evaluate(() => JSON.stringify({ trial: window.__game.state.trial, stats: window.__game.state.stats }));
log.push(stats);
console.log(log.join('\n'));
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
await browser.close();
