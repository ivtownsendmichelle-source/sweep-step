/* inventory.js — 4th Step Resentment Inventory (core feature) */
const Inventory = {

  /* ── Lifecycle ─────────────────────────────────────────── */

  init() {
    const btn = document.getElementById('btn-new-resentment');
    if (btn) btn.addEventListener('click', () => this.openEditor(this._blank(), true));
    this.render();
  },

  /* ── Data helpers ──────────────────────────────────────── */

  _uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  _blank() {
    return {
      id: this._uid(),
      person: '',
      causes: [{ id: 'a', text: '',
        selfEsteem:        { statement: '', fear: '' },
        pride:             { statement: '', fear: '' },
        ambition:          { statement: '', fear: '' },
        security:          { statement: '', fear: '' },
        personalRelations: { statement: '', fear: '' },
        sexRelations:      { statement: '', fear: '' },
        pocketBook:        { statement: '', fear: '' }
      }],
      column4: { selfSeeking: '', selfish: '', dishonest: '', afraid: '', harm: '' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  _letterFor(index) {
    return String.fromCharCode(97 + index); // a, b, c ...
  },

  _areas() {
    return [
      { key: 'selfEsteem',        label: 'Self Esteem',         starter: 'I am...',                                      fearStarter: 'What I am afraid of being' },
      { key: 'pride',             label: 'Pride',               starter: 'Others should... / No one should...',          fearStarter: 'What I am afraid of being seen as' },
      { key: 'ambition',          label: 'Ambition',            starter: 'I want...',                                    fearStarter: 'What I am afraid of' },
      { key: 'security',          label: 'Security',            starter: 'I need... to be okay',                         fearStarter: 'What I am afraid of losing' },
      { key: 'personalRelations', label: 'Personal Relationships', starter: 'How I think this relationship should look', fearStarter: 'What I am afraid of' },
      { key: 'sexRelations',      label: 'Sex and Relationships', starter: 'A real person...',                           fearStarter: 'What I am afraid of' },
      { key: 'pocketBook',        label: 'Money and Security',  starter: 'The money piece is...',                        fearStarter: 'What I am afraid of' }
    ];
  },

  /* ── Render card list ──────────────────────────────────── */

  render() {
    const list = document.getElementById('inventory-list');
    if (!list) return;
    list.innerHTML = '';

    const entries = Storage.getInventory();

    if (!entries.length) {
      list.innerHTML =
        '<div class="empty-state">' +
          '<p>Nothing here yet.</p>' +
          '<p>When you are ready, tap the button below. Start with the loudest one.</p>' +
        '</div>';
      return;
    }

    entries.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'card card-entry';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      const filledCols = this._progressFlags(entry);
      const dots = [1, 2, 3, 4].map(n =>
        '<span class="progress-dot' + (filledCols[n] ? ' filled' : '') + '" title="Column ' + n + '"></span>'
      ).join('');

      card.innerHTML =
        '<div class="card-entry-row">' +
          '<div class="card-entry-info">' +
            '<h3 class="card-entry-title">' + this._esc(entry.person || 'Unnamed') + '</h3>' +
            '<span class="card-entry-meta">' + entry.causes.length + ' cause' + (entry.causes.length !== 1 ? 's' : '') + '</span>' +
          '</div>' +
          '<div class="card-entry-actions">' +
            '<div class="progress-dots">' + dots + '</div>' +
            '<button class="btn-icon btn-delete" aria-label="Delete entry" data-id="' + entry.id + '">&times;</button>' +
          '</div>' +
        '</div>';

      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-delete')) return;
        this.openEditor(JSON.parse(JSON.stringify(entry)), false);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openEditor(JSON.parse(JSON.stringify(entry)), false);
        }
      });
      card.querySelector('.btn-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        this.delete(entry.id);
      });

      list.appendChild(card);
    });
  },

  _progressFlags(entry) {
    const f = {};
    f[1] = !!entry.person.trim();
    f[2] = entry.causes.some(c => c.text.trim());
    f[3] = entry.causes.some(c => this._areas().some(a => c[a.key] && c[a.key].statement.trim()));
    const c4 = entry.column4;
    f[4] = !!(c4.selfSeeking.trim() || c4.selfish.trim() || c4.dishonest.trim() || c4.afraid.trim() || c4.harm.trim());
    return f;
  },

  /* ── Editor modal ──────────────────────────────────────── */

  openEditor(entry, isNew) {
    const title = isNew ? 'New Resentment' : 'Edit Resentment';

    const body = document.createElement('div');
    body.className = 'inventory-editor';

    /* — Column 1 — */
    body.appendChild(this._section('Column 1. Who or what.',
      this._guidanceBox('A person. A place. An institution. A principle. Whatever you are resentful at. Write the name.') +
      '<label class="input-label" for="inv-person">Name</label>' +
      '<input type="text" id="inv-person" class="input-field" value="' + this._esc(entry.person) + '" placeholder="Who or what">'
    ));

    /* — Column 2 — */
    body.appendChild(this._section('Column 2. The cause.',
      this._guidanceBox('What did they do. Be specific. One cause per line. Do not combine them. If there are five, write five.') +
      '<div id="inv-causes"></div>' +
      '<button type="button" class="btn-secondary btn-sm" id="btn-add-cause">+ Add another cause</button>'
    ));

    /* — Column 3 — */
    body.appendChild(this._section('Column 3. What it touches.',
      this._guidanceBox('For each cause, look at which parts of you got hit. Not every area applies every time. Leave blank what does not fit. Be honest about the ones that do.') +
      '<div id="inv-col3"></div>'
    ));

    /* — Column 4 — */
    const settings = Storage.getSettings();
    const hp = settings.hpName || 'Higher Power';
    const personName = entry.person || '___';

    const col4Section = this._section('Column 4. My part.',
      '<div class="realization-box">' +
        '<p class="realization-prompt"><strong>Before you write this:</strong> where have I done the same things I resent in Column 2 to this person, or to anybody else? That is the question. Sit with it for a minute.</p>' +
        '<p class="realization-prayer"><em>' + this._esc(hp) + ', show me my part. Where was I selfish. Where was I dishonest. Where was I self-seeking. Where was I afraid. Help me see it clean. Help me be willing to let it go.</em></p>' +
      '</div>' +
      '<label class="input-label">Self-seeking. Where were you working an angle.</label>' +
      '<textarea class="input-field" id="inv-c4-selfSeeking" rows="3" placeholder="I was working an angle when...">' + this._esc(entry.column4.selfSeeking) + '</textarea>' +
      '<label class="input-label">Selfish. What was only about you.</label>' +
      '<textarea class="input-field" id="inv-c4-selfish" rows="3" placeholder="I was thinking only about myself when...">' + this._esc(entry.column4.selfish) + '</textarea>' +
      '<label class="input-label">Dishonest. What you were pretending not to know.</label>' +
      '<textarea class="input-field" id="inv-c4-dishonest" rows="3" placeholder="The lie I was telling myself was...">' + this._esc(entry.column4.dishonest) + '</textarea>' +
      '<label class="input-label">Afraid. What you were actually scared of underneath.</label>' +
      '<textarea class="input-field" id="inv-c4-afraid" rows="3" placeholder="I was afraid that...">' + this._esc(entry.column4.afraid) + '</textarea>' +
      '<label class="input-label">Harm. What you did to them or to yourself.</label>' +
      '<textarea class="input-field" id="inv-c4-harm" rows="3" placeholder="What I did was...">' + this._esc(entry.column4.harm) + '</textarea>'
    );
    col4Section.id = 'inv-col4-section';
    body.appendChild(col4Section);

    /* — Footer — */
    const footer =
      '<button class="btn-secondary" id="inv-cancel">Cancel</button>' +
      '<button class="btn-primary" id="inv-save">Save</button>';

    this._openModal(title, body.innerHTML, footer);

    /* — Populate causes — */
    this._renderCauses(entry.causes);
    this._renderColumn3(entry.causes);
    this._toggleColumn4(entry.causes);

    /* — Wire events — */
    document.getElementById('btn-add-cause').addEventListener('click', () => {
      const nextLetter = this._letterFor(entry.causes.length);
      entry.causes.push({
        id: nextLetter, text: '',
        selfEsteem:        { statement: '', fear: '' },
        pride:             { statement: '', fear: '' },
        ambition:          { statement: '', fear: '' },
        security:          { statement: '', fear: '' },
        personalRelations: { statement: '', fear: '' },
        sexRelations:      { statement: '', fear: '' },
        pocketBook:        { statement: '', fear: '' }
      });
      this._collectCauses(entry);
      this._renderCauses(entry.causes);
      this._renderColumn3(entry.causes);
      this._toggleColumn4(entry.causes);
    });

    document.getElementById('inv-cancel').addEventListener('click', () => this._closeModal());
    document.getElementById('inv-save').addEventListener('click', () => {
      this._collectAll(entry);
      this.save(entry, isNew);
    });
  },

  /* ── Cause list rendering ──────────────────────────────── */

  _renderCauses(causes) {
    const wrap = document.getElementById('inv-causes');
    if (!wrap) return;
    wrap.innerHTML = '';

    causes.forEach((cause, i) => {
      const letter = this._letterFor(i).toUpperCase();
      const row = document.createElement('div');
      row.className = 'cause-row';
      row.innerHTML =
        '<span class="cause-letter">' + letter + '</span>' +
        '<input type="text" class="input-field cause-input" data-cidx="' + i + '" value="' + this._esc(cause.text) + '" placeholder="What they did">' +
        (causes.length > 1
          ? '<button type="button" class="btn-icon btn-delete-cause" data-cidx="' + i + '" aria-label="Remove cause ' + letter + '">&times;</button>'
          : '');
      wrap.appendChild(row);
    });

    wrap.querySelectorAll('.btn-delete-cause').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-cidx'), 10);
        this._collectCauses(causes._owner || { causes: causes });
        causes.splice(idx, 1);
        // Re-letter
        causes.forEach((c, j) => { c.id = this._letterFor(j); });
        this._renderCauses(causes);
        this._renderColumn3(causes);
        this._toggleColumn4(causes);
      });
    });
  },

  /* ── Column 3 rendering ────────────────────────────────── */

  _renderColumn3(causes) {
    const wrap = document.getElementById('inv-col3');
    if (!wrap) return;
    wrap.innerHTML = '';

    if (!causes.length) {
      wrap.innerHTML = '<p class="muted">Add a cause in Column 2 first. Then come back here.</p>';
      return;
    }

    const areas = this._areas();

    causes.forEach((cause, ci) => {
      const letter = this._letterFor(ci).toUpperCase();
      const causeBlock = document.createElement('div');
      causeBlock.className = 'col3-cause-block';
      causeBlock.innerHTML = '<h4 class="col3-cause-heading">Cause ' + letter + ': ' + this._esc(cause.text || '(blank)') + '</h4>';

      areas.forEach(area => {
        const data = cause[area.key] || { statement: '', fear: '' };
        const areaId = 'col3-' + ci + '-' + area.key;

        const areaDiv = document.createElement('div');
        areaDiv.className = 'col3-area collapsed';
        areaDiv.innerHTML =
          '<div class="col3-area-header" role="button" tabindex="0" aria-expanded="false">' +
            '<span class="col3-area-name">' + area.label + '</span>' +
            '<span class="guidance-chevron">&#9660;</span>' +
          '</div>' +
          '<div class="col3-area-body">' +
            '<p class="col3-starter">' + this._esc(area.starter) + '</p>' +
            '<textarea class="input-field col3-stmt" id="' + areaId + '-stmt" rows="2" placeholder="' + this._esc(area.starter) + '">' + this._esc(data.statement) + '</textarea>' +
            '<p class="col3-fear-label">' + this._esc(area.fearStarter) + '</p>' +
            '<textarea class="input-field col3-fear" id="' + areaId + '-fear" rows="2" placeholder="' + this._esc(area.fearStarter) + '">' + this._esc(data.fear) + '</textarea>' +
          '</div>';

        const header = areaDiv.querySelector('.col3-area-header');
        header.addEventListener('click', () => {
          const isOpen = !areaDiv.classList.contains('collapsed');
          areaDiv.classList.toggle('collapsed', isOpen);
          header.setAttribute('aria-expanded', String(!isOpen));
        });
        header.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            header.click();
          }
        });

        causeBlock.appendChild(areaDiv);
      });

      wrap.appendChild(causeBlock);
    });
  },

  /* ── Column 4 visibility ───────────────────────────────── */

  _toggleColumn4(causes) {
    const section = document.getElementById('inv-col4-section');
    if (!section) return;
    const hasCause = causes.some(c => c.text.trim());
    section.style.display = (causes.length && hasCause) ? '' : 'none';
  },

  /* ── Collect form data ─────────────────────────────────── */

  _collectCauses(entry) {
    document.querySelectorAll('.cause-input').forEach(input => {
      const idx = parseInt(input.getAttribute('data-cidx'), 10);
      if (entry.causes[idx]) entry.causes[idx].text = input.value;
    });
  },

  _collectColumn3(entry) {
    const areas = this._areas();
    entry.causes.forEach((cause, ci) => {
      areas.forEach(area => {
        const stmtEl = document.getElementById('col3-' + ci + '-' + area.key + '-stmt');
        const fearEl = document.getElementById('col3-' + ci + '-' + area.key + '-fear');
        if (!cause[area.key]) cause[area.key] = { statement: '', fear: '' };
        if (stmtEl) cause[area.key].statement = stmtEl.value;
        if (fearEl) cause[area.key].fear = fearEl.value;
      });
    });
  },

  _collectColumn4(entry) {
    const fields = ['selfSeeking', 'selfish', 'dishonest', 'afraid', 'harm'];
    fields.forEach(f => {
      const el = document.getElementById('inv-c4-' + f);
      if (el) entry.column4[f] = el.value;
    });
  },

  _collectAll(entry) {
    const personEl = document.getElementById('inv-person');
    if (personEl) entry.person = personEl.value;
    this._collectCauses(entry);
    this._collectColumn3(entry);
    this._collectColumn4(entry);
  },

  /* ── Save ──────────────────────────────────────────────── */

  save(entry, isNew) {
    entry.updatedAt = new Date().toISOString();
    const all = Storage.getInventory();

    if (isNew) {
      all.push(entry);
    } else {
      const idx = all.findIndex(e => e.id === entry.id);
      if (idx !== -1) all[idx] = entry;
      else all.push(entry);
    }

    Storage.saveInventory(all);

    // Score: +10 for each newly filled column section
    let points = 0;
    if (entry.person.trim()) points += 10;
    if (entry.causes.some(c => c.text.trim())) points += 10;
    const areas = this._areas();
    if (entry.causes.some(c => areas.some(a => c[a.key] && c[a.key].statement.trim()))) points += 10;
    const c4 = entry.column4;
    if (c4.selfSeeking.trim() || c4.selfish.trim() || c4.dishonest.trim() || c4.afraid.trim() || c4.harm.trim()) points += 10;
    if (points > 0 && typeof Pip !== 'undefined') {
      Pip.addScore(points);
      if (isNew) Pip.showNote(Pip.getResponse('resentment'));
    }

    this.render();
    this._closeModal();
  },

  /* ── Delete ────────────────────────────────────────────── */

  delete(id) {
    if (!confirm('Delete this entry? No undo.')) return;
    const all = Storage.getInventory().filter(e => e.id !== id);
    Storage.saveInventory(all);
    this.render();
  },

  /* ── Helpers: fears & harms ────────────────────────────── */

  getAllFears() {
    const entries = Storage.getInventory();
    const fears = [];
    const areas = this._areas();

    entries.forEach(entry => {
      entry.causes.forEach((cause, ci) => {
        const letter = this._letterFor(ci).toUpperCase();
        areas.forEach(area => {
          const data = cause[area.key];
          if (data && data.fear && data.fear.trim()) {
            fears.push({
              text: data.fear,
              source: 'Resentment toward ' + (entry.person || 'unnamed') + ', cause ' + letter + ', ' + area.label
            });
          }
        });
      });
    });

    return fears;
  },

  getAllHarms() {
    const entries = Storage.getInventory();
    const harms = [];

    entries.forEach(entry => {
      const h = entry.column4 && entry.column4.harm;
      if (h && h.trim()) {
        harms.push({
          person: entry.person || 'unnamed',
          harm: h,
          source: 'inventory'
        });
      }
    });

    return harms;
  },

  /* ── DOM Utilities ─────────────────────────────────────── */

  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  _section(heading, innerHtml) {
    const s = document.createElement('div');
    s.className = 'editor-section';
    s.innerHTML = '<h3 class="editor-section-title">' + heading + '</h3>' + innerHtml;
    return s;
  },

  _guidanceBox(text) {
    return (
      '<div class="guidance-box">' +
        '<div class="guidance-header" onclick="this.parentElement.classList.toggle(\'open\')">' +
          '<span>Guidance</span>' +
          '<span class="guidance-chevron">&#9660;</span>' +
        '</div>' +
        '<div class="guidance-body">' +
          '<p>' + text + '</p>' +
        '</div>' +
      '</div>'
    );
  },

  /* ── Modal wrappers ────────────────────────────────────── */

  _openModal(title, bodyHtml, footerHtml) {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    overlay.querySelector('.modal-title').textContent = title;
    overlay.querySelector('.modal-body').innerHTML = bodyHtml;
    overlay.querySelector('.modal-footer').innerHTML = footerHtml || '';
    overlay.classList.remove('hidden');

    // Close on backdrop click
    const handler = (e) => {
      if (e.target === overlay) {
        this._closeModal();
        overlay.removeEventListener('click', handler);
      }
    };
    overlay.addEventListener('click', handler);

    // Close button
    const closeBtn = overlay.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.onclick = () => this._closeModal();
    }
  },

  _closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.add('hidden');
  }
};
