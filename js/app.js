/* app.js — Router, navigation, initialization, modal, harms aggregation */
const App = {
  currentScreen: 'home',

  init() {
    // Apply saved accent
    const settings = Storage.getSettings();
    this.applyAccent(settings.accentColor);

    // Bottom nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.navigate(btn.dataset.screen));
    });

    // Work tabs
    document.querySelectorAll('.work-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const parent = tab.closest('.screen');
        parent.querySelectorAll('.work-tab').forEach(t => t.classList.remove('active'));
        parent.querySelectorAll('.work-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) target.classList.add('active');
      });
    });

    // Modal close
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-overlay')) this.closeModal();
    });

    // Initialize all modules
    Pip.init();
    Inventory.init();
    Fears.init();
    SexInventory.init();
    Steps.init();
    Community.init();
    Me.init();

    // Render harms tab
    this.renderHarms();
    document.getElementById('btn-add-harm').addEventListener('click', () => this.openHarmEditor(null, true));

    // Home screen content
    this.renderHome();

    // Hash routing
    window.addEventListener('hashchange', () => this.handleHash());
    this.handleHash();
  },

  handleHash() {
    const hash = window.location.hash.replace('#', '') || 'home';
    if (['home', 'work', 'steps', 'community', 'me'].includes(hash)) {
      this.navigate(hash, false);
    }
  },

  navigate(screen, updateHash = true) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const target = document.getElementById('screen-' + screen);
    const btn = document.querySelector(`.nav-btn[data-screen="${screen}"]`);

    if (target) target.classList.add('active');
    if (btn) btn.classList.add('active');

    this.currentScreen = screen;
    if (updateHash) window.location.hash = screen;

    // Scroll to top
    if (target) {
      const content = target.querySelector('.screen-content');
      if (content) content.scrollTop = 0;
    }
    window.scrollTo(0, 0);

    // Refresh dynamic content on navigate
    if (screen === 'work') {
      this.renderHarms();
      Fears.render();
    }
    if (screen === 'home') this.renderHome();
    if (screen === 'me') Me.renderSobriety();
  },

  applyAccent(color) {
    document.body.setAttribute('data-accent', color || 'violet');
  },

  /* ═══ HOME ═══ */
  renderHome() {
    // Date
    const dateEl = document.getElementById('home-date');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString(undefined, {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      });
    }

    // Sobriety
    this.updateHomeSobriety();

    // Quote
    const quoteEl = document.getElementById('daily-quote');
    if (quoteEl) quoteEl.textContent = Quotes.getDailyQuote();

    // Reflection
    const refl = Quotes.getDailyReflection();
    const typeLabel = document.getElementById('reflection-type-label');
    const title = document.getElementById('reflection-title');
    const text = document.getElementById('reflection-text');
    const prompt = document.getElementById('reflection-prompt');

    if (typeLabel) typeLabel.textContent = `${refl.type} ${refl.number}${refl.principle ? ': ' + refl.principle : ''}`;
    if (title) title.textContent = refl.title || '';
    if (text) {
      // Replace HP references with user's chosen name
      const settings = Storage.getSettings();
      text.textContent = refl.text.replace(/Higher Power/g, settings.hpName || 'Higher Power');
    }
    if (prompt) prompt.textContent = refl.reflection;

    // Pip
    Pip.render();
  },

  updateHomeSobriety() {
    const el = document.getElementById('home-sobriety');
    if (!el) return;
    const settings = Storage.getSettings();
    if (!settings.sobrietyDate) {
      el.innerHTML = '';
      return;
    }
    const start = new Date(settings.sobrietyDate);
    const now = new Date();
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const days = Math.floor((now - start) / 86400000);
    el.innerHTML = `<span class="sobriety-home-count">${days}</span> day${days !== 1 ? 's' : ''} sober`;
  },

  /* ═══ MODAL ═══ */
  openModal(title, bodyHTML, footerHTML) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-footer').innerHTML = footerHTML || '';
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.body.style.overflow = '';
  },

  /* ═══ HARMS (aggregated) ═══ */
  harmsManual: null,

  renderHarms() {
    const container = document.getElementById('harms-list');
    if (!container) return;
    container.innerHTML = '';

    // Collect from all sources
    const allHarms = [];

    // From inventory Column 4
    const inv = Storage.getInventory();
    inv.forEach(entry => {
      if (entry.column4 && entry.column4.harm && entry.column4.harm.trim()) {
        allHarms.push({
          person: entry.person,
          harm: entry.column4.harm.trim(),
          source: 'Resentment inventory',
          auto: true
        });
      }
    });

    // From fears
    const fearHarms = Fears.getAllHarms();
    fearHarms.forEach(h => { h.auto = true; allHarms.push(h); });

    // From sex inventory
    const sexHarms = SexInventory.getAllHarms();
    sexHarms.forEach(h => { h.auto = true; allHarms.push(h); });

    // Manual harms
    const manual = Storage.getHarms();
    manual.forEach(h => { h.auto = false; allHarms.push(h); });

    if (allHarms.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <p>No harms recorded yet.</p>
        <p class="text-secondary">Harms are collected automatically from your inventory work, or you can add them directly here.</p>
      </div>`;
      return;
    }

    allHarms.forEach(harm => {
      const card = document.createElement('div');
      card.className = 'inventory-card';
      card.innerHTML = `
        <div class="card-top"${!harm.auto && harm.id ? ` onclick="App.openHarmEditor(App.findManualHarm('${harm.id}'), false)"` : ''}>
          <div class="card-title">${this.esc(harm.person || 'Unknown')}</div>
          <div class="card-meta">${this.esc(harm.harm)}</div>
          ${harm.makeRight ? `<div class="text-secondary" style="margin-top:4px">Amends: ${this.esc(harm.makeRight)}</div>` : ''}
          <div class="card-source">${this.esc(harm.source || '')}</div>
        </div>
        ${!harm.auto && harm.id ? `<button class="btn-small btn-danger" onclick="event.stopPropagation();App.deleteHarm('${harm.id}')">Delete</button>` : ''}
      `;
      container.appendChild(card);
    });
  },

  findManualHarm(id) {
    const harms = Storage.getHarms();
    return harms.find(h => h.id === id);
  },

  openHarmEditor(harm, isNew) {
    if (isNew) {
      harm = { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), person: '', harm: '', makeRight: '' };
    }

    const body = `
      <label class="field-label">Who was harmed?
        <input type="text" id="harm-person" class="input-field" value="${this.esc(harm.person)}" placeholder="Name or group">
      </label>
      <label class="field-label">What I did
        <textarea id="harm-what" class="input-field" rows="3">${this.esc(harm.harm)}</textarea>
      </label>
      <label class="field-label">What I could do to make it right
        <textarea id="harm-right" class="input-field" rows="3">${this.esc(harm.makeRight)}</textarea>
      </label>
    `;
    const footer = `
      <button class="btn-secondary" onclick="App.closeModal()">Cancel</button>
      <button class="btn-primary btn-small" onclick="App.saveHarm('${harm.id}', ${isNew})">Save</button>
    `;
    App.openModal(isNew ? 'Add Harm' : 'Edit Harm', body, footer);
  },

  saveHarm(id, isNew) {
    const harms = Storage.getHarms();
    const entry = {
      id: id,
      person: document.getElementById('harm-person').value.trim(),
      harm: document.getElementById('harm-what').value.trim(),
      makeRight: document.getElementById('harm-right').value.trim(),
      source: 'Manual entry'
    };

    if (isNew) {
      harms.push(entry);
    } else {
      const idx = harms.findIndex(h => h.id === id);
      if (idx >= 0) harms[idx] = entry;
    }

    Storage.saveHarms(harms);
    Pip.addScore(5);
    this.closeModal();
    this.renderHarms();
  },

  deleteHarm(id) {
    if (!confirm('Remove this harm entry?')) return;
    const harms = Storage.getHarms().filter(h => h.id !== id);
    Storage.saveHarms(harms);
    this.renderHarms();
  },

  esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
