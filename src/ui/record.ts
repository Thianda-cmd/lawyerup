/** The Court Record: evidence, profiles, the deduction board and the legal handbook. */
import { portraitSVG } from '../art/cast';
import { icon } from '../art/icons';
import { audio } from '../engine/audio';
import { type Game, el, escapeHtml } from '../engine/game';
import { GROUNDS, MECHANICS } from '../content/legal';

export type RecordTab = 'evidence' | 'profiles' | 'board' | 'handbook';

export interface RecordOpts {
  mode: 'view' | 'present';
  title?: string;
  allowProfiles?: boolean;
  cancellable?: boolean;
  tab?: RecordTab;
}

interface Item {
  id: string;
  name: string;
  art: string;
  sub: string;
  desc: string;
  detail?: string;
  deduction?: boolean;
  profile?: boolean;
}

function face(char: string): string {
  return `<div class="face-crop">${portraitSVG(char as never, 'neutral')}</div>`;
}

function items(g: Game, kind: 'evidence' | 'profiles'): Item[] {
  if (kind === 'evidence') {
    return g.state.evidence.map((id) => {
      const d = g.content.evidence[id];
      const desc = typeof d.desc === 'function' ? d.desc(g) : d.desc;
      const detail = d.detail ? (typeof d.detail === 'function' ? d.detail(g) : d.detail) : undefined;
      return { id, name: d.name, art: icon(d.icon), sub: d.kind === 'deduction' ? 'Deduction' : 'Evidence', desc, detail, deduction: d.kind === 'deduction' };
    });
  }
  return g.state.profiles.map((id) => {
    const p = g.content.profiles[id];
    const desc = typeof p.desc === 'function' ? p.desc(g) : p.desc;
    return { id, name: p.name, art: p.char ? face(p.char) : icon(p.icon ?? 'card'), sub: `${p.role}${p.age ? ` • ${p.age}` : ''}`, desc, profile: true };
  });
}

export function openRecord(g: Game, opts: RecordOpts): Promise<string | null> {
  const present = opts.mode === 'present';
  const cancellable = opts.cancellable ?? true;
  const allowProfiles = opts.allowProfiles ?? true;
  let tab: RecordTab = opts.tab ?? 'evidence';
  let selected: string | null = null;
  const boardSel: string[] = [];
  let boardMsg = '';

  const root = el('div', `record no-advance ${present ? 'presenting' : ''}`);
  g.layers.overlay.appendChild(root);
  g.overlayDepth++;
  audio.sfx('paper');

  return g
    .waitFor<string | null>((done) => {
      const close = (v: string | null) => {
        audio.sfx(v ? 'select' : 'back');
        done(v);
      };

      const render = () => {
        const tabs: [RecordTab, string][] = [
          ['evidence', 'Evidence'],
          ['profiles', 'Profiles'],
          ['board', 'Deduction Board'],
          ['handbook', 'Handbook'],
        ];
        let body = '';
        if (tab === 'evidence' || tab === 'profiles') {
          const list = items(g, tab);
          if (!selected || !list.some((i) => i.id === selected)) selected = list[0]?.id ?? null;
          const cur = list.find((i) => i.id === selected);
          const canPresent = present && cur && (tab === 'evidence' || allowProfiles);
          body = `<div class="rec-grid">${
            list.length
              ? list.map((i) => `<button class="rec-item ${i.id === selected ? 'sel' : ''} ${i.deduction ? 'deduction' : ''}" data-id="${i.id}" title="${escapeHtml(i.name)}">${i.art}<span>${escapeHtml(i.name)}</span></button>`).join('')
              : `<div class="rec-empty">Nothing here yet.</div>`
          }</div>
          <div class="rec-detail">${
            cur
              ? `<div class="rec-art ${cur.profile ? 'is-face' : ''}">${cur.art}</div>
                 <div class="rec-name">${escapeHtml(cur.name)}</div>
                 <div class="rec-sub">${escapeHtml(cur.sub)}</div>
                 <div class="rec-desc">${escapeHtml(cur.desc).replace(/\n/g, '<br>')}</div>
                 ${cur.detail ? `<details class="rec-more"><summary>Examine closely</summary><div>${escapeHtml(cur.detail).replace(/\n/g, '<br>')}</div></details>` : ''}
                 ${canPresent ? `<button class="btn primary big present-btn" data-present="${cur.id}">Present</button>` : ''}`
              : ''
          }</div>`;
        } else if (tab === 'board') {
          const pool = [...items(g, 'evidence'), ...items(g, 'profiles')];
          const made = g.state.evidence.filter((id) => g.content.evidence[id].kind === 'deduction');
          body = `<div class="board">
            <div class="board-cards">${pool
              .filter((i) => !i.deduction)
              .map((i) => `<button class="board-card ${boardSel.includes(i.id) ? 'sel' : ''}" data-board="${i.id}">${i.art}<span>${escapeHtml(i.name)}</span></button>`)
              .join('')}</div>
            <div class="board-side">
              <div class="board-help">Pick two cards that belong together, then connect them. A good connection becomes a <b>Deduction</b> you can present in court.</div>
              <div class="board-slots"><div class="slot">${boardSel[0] ? escapeHtml(pool.find((p) => p.id === boardSel[0])?.name ?? '') : '?'}</div><div class="string ${boardSel.length === 2 ? 'taut' : ''}"></div><div class="slot">${boardSel[1] ? escapeHtml(pool.find((p) => p.id === boardSel[1])?.name ?? '') : '?'}</div></div>
              <button class="btn primary" data-connect ${boardSel.length === 2 ? '' : 'disabled'}>Connect</button>
              <div class="board-msg">${boardMsg}</div>
              <div class="board-made"><h4>Deductions</h4>${made.length ? made.map((id) => `<div class="made">${icon('deduction')}<span>${escapeHtml(g.content.evidence[id].name)}</span></div>`).join('') : '<em>None yet.</em>'}</div>
            </div>
          </div>`;
        } else {
          body = `<div class="handbook">
            <section><h3>Objection Grounds</h3>${GROUNDS.map((gr) => `<div class="hb-item"><b>${gr.name}</b><p>${escapeHtml(gr.long)}</p></div>`).join('')}</section>
            <section><h3>How Court Works</h3>${MECHANICS.map((m) => `<div class="hb-item"><b>${m.title}</b><p>${escapeHtml(m.body)}</p></div>`).join('')}</section>
          </div>`;
        }
        root.innerHTML = `<div class="rec-panel">
          <div class="rec-head">
            <div class="rec-title">${present ? escapeHtml(opts.title ?? 'Present what?') : 'Court Record'}</div>
            <div class="rec-tabs">${tabs.map(([id, label]) => `<button class="rec-tab ${tab === id ? 'on' : ''}" data-tab="${id}">${label}</button>`).join('')}</div>
            ${cancellable ? `<button class="btn rec-close" data-close>${present ? 'Back' : 'Close'} ✕</button>` : ''}
          </div>
          <div class="rec-body tab-${tab}">${body}</div>
        </div>`;
      };

      const onClick = (e: MouseEvent) => {
        const t = (e.target as HTMLElement).closest<HTMLElement>('button');
        if (!t) {
          if (e.target === root && cancellable) close(null);
          return;
        }
        if (t.dataset.tab) {
          tab = t.dataset.tab as RecordTab;
          audio.sfx('click');
          render();
        } else if (t.dataset.id) {
          selected = t.dataset.id;
          audio.sfx('click');
          render();
        } else if (t.dataset.present) {
          close(t.dataset.present);
        } else if (t.hasAttribute('data-close')) {
          close(null);
        } else if (t.dataset.board) {
          const id = t.dataset.board;
          const i = boardSel.indexOf(id);
          if (i >= 0) boardSel.splice(i, 1);
          else {
            if (boardSel.length === 2) boardSel.shift();
            boardSel.push(id);
          }
          boardMsg = '';
          audio.sfx('click');
          render();
        } else if (t.hasAttribute('data-connect')) {
          const [a, b] = boardSel;
          const r = g.content.recipes.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
          if (!r) {
            audio.sfx('fail');
            boardMsg = `<span class="bad">These two don't connect. Not yet, anyway.</span>`;
          } else if (g.state.evidence.includes(r.result)) {
            audio.sfx('click');
            boardMsg = `<span class="ok">Already worked that out: <b>${escapeHtml(g.content.evidence[r.result].name)}</b>.</span>`;
          } else {
            void g.giveEvidence(r.result, true);
            audio.sfx('reveal');
            boardMsg = `<span class="ok eureka">✨ <b>${escapeHtml(g.content.evidence[r.result].name)}</b><br>${escapeHtml(r.note)}</span>`;
            boardSel.length = 0;
          }
          render();
        }
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && cancellable) {
          e.stopPropagation();
          close(null);
        }
      };
      root.addEventListener('click', onClick);
      window.addEventListener('keydown', onKey, true);
      render();
      return () => {
        root.removeEventListener('click', onClick);
        window.removeEventListener('keydown', onKey, true);
      };
    })
    .finally(() => {
      g.overlayDepth--;
      root.remove();
    });
}
