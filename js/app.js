/* app.js — Router, navigation, modal, harms, onboarding (7 screens), daily intention */
const App = {
  currentScreen: 'home',
  _pinEntry: '',
  _pinMode: 'enter', // 'create', 'confirm', 'enter'
  _pinFirst: '',
  _pinAttempts: 0,
  _pinLockUntil: 0,
  _hiddenAt: 0,
  _lockThresholdMs: 5 * 60 * 1000, // 5 minutes in background triggers re-lock
  _visibilityBound: false,

  init() {
    const settings = Storage.getSettings();

    // Record firstOpenDate if never set
    if (!settings.firstOpenDate) {
      settings.firstOpenDate = new Date().toISOString().split('T')[0];
      Storage.saveSettings(settings);
    }

    this.applyAccent(settings.accentColor);

    // Bind visibilitychange exactly once. This handles both tab-switching
    // and the PWA being backgrounded on mobile (OS pauses the page rather
    // than reloading it, so DOMContentLoaded never fires again).
    if (!this._visibilityBound) {
      this._visibilityBound = true;
      document.addEventListener('visibilitychange', () => this._handleVisibility());
      window.addEventListener('pageshow', (e) => {
        // pageshow fires when page is restored from bfcache (iOS Safari).
        // Treat bfcache restore as "returned from background" too.
        if (e.persisted) this._checkRelock(true);
      });
    }

    if (!settings.onboardingComplete) {
      this._showOnboarding();
      return;
    }
    if (settings.pinHash) {
      this._showPin('enter');
      return;
    }
    this._bootApp();
  },

  /* Called on visibilitychange. Tracks when the page goes hidden,
     and on return checks the 5-minute threshold. */
  _handleVisibility() {
    if (document.visibilityState === 'hidden') {
      this._hiddenAt = Date.now();
    } else if (document.visibilityState === 'visible') {
      this._checkRelock(false);
    }
  },

  /* If a PIN is set and enough time has passed (or force=true),
     show the PIN gate again. */
  _checkRelock(force) {
    const settings = Storage.getSettings();
    if (!settings.onboardingComplete) return;
    if (!settings.pinHash) return; // PIN was skipped — never re-lock

    // Already on the PIN screen? Don't re-trigger.
    const pinScreen = document.getElementById('screen-pin');
    if (pinScreen && pinScreen.classList.contains('active')) return;

    const gone = Date.now() - (this._hiddenAt || 0);
    if (force || gone >= this._lockThresholdMs) {
      this._showPin('enter');
    }
  },

  _bootApp() {
    // Bottom nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.navigate(btn.dataset.screen));
    });

    // Work tabs
    document.querySelectorAll('.work-tab').forEach(tab => {
      tab.addEventListener('click', () => {
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

    // Hide gate screens
    document.getElementById('screen-onboarding').classList.remove('active');
    document.getElementById('screen-pin').classList.remove('active');
    document.getElementById('screen-home').classList.add('active');
    document.getElementById('bottom-nav').classList.remove('hidden');

    // Modules
    Pip.init();
    Inventory.init();
    Fears.init();
    SexInventory.init();
    Steps.init();
    Community.init();
    Me.init();
    if (typeof Patterns !== 'undefined') Patterns.init();

    this.renderHarms();
    document.getElementById('btn-add-harm').addEventListener('click', () => this.openHarmEditor(null, true));

    // Daily intention bindings
    const intentInput = document.getElementById('daily-intention-input');
    if (intentInput) {
      const todayKey = new Date().toISOString().split('T')[0];
      intentInput.value = Storage.getIntentionFor(todayKey);
      intentInput.addEventListener('input', () => {
        Storage.setIntentionFor(todayKey, intentInput.value);
      });
    }

    this.renderHome();

    window.addEventListener('hashchange', () => this.handleHash());
    this.handleHash();
  },

  /* ═══ ONBOARDING — 7 screens ═══ */
  _onboardState: {
    name: '',
    hpName: 'Higher Power',
    sobrietyDate: '',
    pronouns: '',
    accent: 'violet',
    promisesRatings: null,
    beliefRatings: null
  },

  _showOnboarding() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-onboarding').classList.add('active');
    document.getElementById('bottom-nav').classList.add('hidden');
    this._renderOnboardScreen(1);
  },

  _renderOnboardScreen(n) {
    const host = document.getElementById('onboard-host');
    if (!host) return;
    host.innerHTML = '';

    switch (n) {
      case 1: return this._onboardScreen1(host);
      case 2: return this._onboardScreen2(host);
      case 3: return this._onboardScreen3(host);
      case 4: return this._onboardScreen4(host);
      case 5: return this._onboardScreen5(host);
      case 6: return this._onboardScreen6(host);
      case 7: return this._onboardScreen7(host);
    }
  },

  _onboardScreen1(host) {
    host.innerHTML = `
      <div class="onboard-screen onboard-screen-1">
        <div class="onboard-statement">You showed up. That matters.</div>
        <label class="field-label onboard-name-label">What's your name?
          <input type="text" id="ob1-name" class="input-field" value="${this.esc(this._onboardState.name)}" placeholder="Your name">
        </label>
        <button class="btn-primary btn-glow onboard-continue" id="ob1-next">Next</button>
      </div>
    `;
    const input = document.getElementById('ob1-name');
    input.focus();
    document.getElementById('ob1-next').addEventListener('click', () => {
      this._onboardState.name = input.value.trim();
      this._renderOnboardScreen(2);
    });
  },

  _onboardScreen2(host) {
    host.innerHTML = `
      <div class="onboard-screen">
        <h2 class="onboard-heading">What this is</h2>
        <div class="onboard-prose">
          <p>Sweep Step is a place to do the work between meetings. Inventory. Lists. Notes. The stuff your sponsor tells you to write down.</p>
          <p>It's not a replacement for meetings or your sponsor. It's a pocket full of what you've already been told to do, so you can actually do it.</p>
          <p>This app lives on your phone. Nothing you put in here goes anywhere else. It is yours.</p>
        </div>
        <button class="btn-primary btn-glow onboard-continue" id="ob2-next">Next</button>
      </div>
    `;
    document.getElementById('ob2-next').addEventListener('click', () => this._renderOnboardScreen(3));
  },

  _onboardScreen3(host) {
    host.innerHTML = `
      <div class="onboard-screen">
        <h2 class="onboard-heading">How to keep your stuff</h2>
        <div class="onboard-prose">
          <p>Your entries live in this browser, on this phone. If you lose the phone or clear the browser, they're gone. So back them up.</p>
          <p>Tap Export Backup in the Me tab whenever you want to save a copy.</p>
        </div>
        <button class="btn-primary btn-glow onboard-continue" id="ob3-next">Got it</button>
      </div>
    `;
    document.getElementById('ob3-next').addEventListener('click', () => this._renderOnboardScreen(4));
  },

  _onboardScreen4(host) {
    host.innerHTML = `
      <div class="onboard-screen">
        <h2 class="onboard-heading">The tabs</h2>
        <div class="onboard-tour">
          <div><strong>Home.</strong> Today. A quote. A reflection. One line about what you want today to be.</div>
          <div><strong>Work.</strong> Fourth Step. Resentments, fears, relationships, harms. All the writing.</div>
          <div><strong>Steps.</strong> Track where you are in the 12. Notes for each one.</div>
          <div><strong>Community.</strong> Phone list. Meeting log. Streaks.</div>
          <div><strong>Patterns.</strong> What keeps showing up across all your work.</div>
          <div><strong>Me.</strong> Sobriety counter. Settings. Gratitude. Backup.</div>
        </div>
        <button class="btn-primary btn-glow onboard-continue" id="ob4-next">Next</button>
      </div>
    `;
    document.getElementById('ob4-next').addEventListener('click', () => this._renderOnboardScreen(5));
  },

  _onboardScreen5(host) {
    host.innerHTML = `
      <div class="onboard-screen">
        <h2 class="onboard-heading">The Promises. First take.</h2>
        <div id="ob-promises-form"></div>
      </div>
    `;
    Promises.renderForm('ob-promises-form', 'start', (ratings) => {
      this._onboardState.promisesRatings = ratings;
      this._renderOnboardScreen(6);
    });
  },

  _onboardScreen6(host) {
    host.innerHTML = `
      <div class="onboard-screen">
        <h2 class="onboard-heading">Beliefs. First take.</h2>
        <div id="ob-beliefs-form"></div>
      </div>
    `;
    Beliefs.renderForm('ob-beliefs-form', true, (ratings) => {
      this._onboardState.beliefRatings = ratings;
      this._renderOnboardScreen(7);
    });
  },

  _onboardScreen7(host) {
    const accents = [
      'violet','teal','gold','slate','ember','sage','ocean','plum','copper','sand','midnight','rose','forest','steel'
    ];
    const accentBtns = accents.map(c =>
      `<button class="accent-btn accent-${c} ${c === this._onboardState.accent ? 'active' : ''}" data-color="${c}" aria-label="${c}" title="${c.charAt(0).toUpperCase() + c.slice(1)}"></button>`
    ).join('');

    host.innerHTML = `
      <div class="onboard-screen">
        <h2 class="onboard-heading">A few details</h2>

        <label class="field-label">Higher Power name
          <input type="text" id="ob7-hp" class="input-field" value="${this.esc(this._onboardState.hpName)}" placeholder="Higher Power, Universe, G.O.D., whatever">
        </label>

        <label class="field-label">Sobriety date (optional)
          <input type="date" id="ob7-sobriety" class="input-field" value="${this._onboardState.sobrietyDate}">
        </label>

        <label class="field-label">Pronouns (optional)
          <input type="text" id="ob7-pronouns" class="input-field" value="${this.esc(this._onboardState.pronouns)}" placeholder="they/them, she/her, he/him">
        </label>

        <label class="field-label">Accent color</label>
        <div class="accent-picker">${accentBtns}</div>

        <p class="privacy-notice" style="margin-top:20px;">Everything you enter stays on your device. Nothing is ever sent anywhere.</p>

        <button class="btn-primary btn-glow onboard-continue" id="ob7-next" style="margin-top:20px;">Continue to PIN</button>
      </div>
    `;

    host.querySelectorAll('.accent-btn').forEach(b => {
      b.addEventListener('click', () => {
        host.querySelectorAll('.accent-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        this._onboardState.accent = b.dataset.color;
        this.applyAccent(b.dataset.color);
      });
    });

    document.getElementById('ob7-next').addEventListener('click', () => {
      this._onboardState.hpName = document.getElementById('ob7-hp').value.trim() || 'Higher Power';
      this._onboardState.sobrietyDate = document.getElementById('ob7-sobriety').value || '';
      this._onboardState.pronouns = document.getElementById('ob7-pronouns').value.trim();
      this._finishOnboarding();
    });
  },

  _finishOnboarding() {
    const settings = Storage.getSettings();
    settings.name = this._onboardState.name;
    settings.hpName = this._onboardState.hpName;
    settings.pronouns = this._onboardState.pronouns;
    settings.accentColor = this._onboardState.accent;
    if (this._onboardState.sobrietyDate) settings.sobrietyDate = this._onboardState.sobrietyDate;
    settings.onboardingComplete = true;
    Storage.saveSettings(settings);
    this._showPin('create');
  },

  /* ═══ PIN ═══ */
  _showPin(mode) {
    this._pinMode = mode;
    this._pinEntry = '';
    // Only clear the stored first PIN when we're NOT entering confirm mode.
    // In confirm mode _pinFirst holds the PIN the user just typed and must
    // be preserved so the comparison in _submitPin actually works.
    if (mode !== 'confirm') this._pinFirst = '';

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-pin').classList.add('active');
    document.getElementById('bottom-nav').classList.add('hidden');

    const title = document.getElementById('pin-title');
    const subtitle = document.getElementById('pin-subtitle');
    const warning = document.getElementById('pin-setup-warning');
    const skipBtn = document.getElementById('pin-skip');
    const submit = document.getElementById('pin-submit');

    if (mode === 'create') {
      title.textContent = 'Set a PIN';
      subtitle.textContent = '4 to 6 digits. Keeps your stuff private.';
      warning.classList.remove('hidden');
      skipBtn.classList.remove('hidden');
      submit.classList.add('hidden');
    } else if (mode === 'confirm') {
      title.textContent = 'Again';
      subtitle.textContent = 'Same PIN to confirm';
      warning.classList.add('hidden');
      skipBtn.classList.add('hidden');
      submit.classList.add('hidden');
    } else {
      title.textContent = 'Enter PIN';
      subtitle.textContent = '';
      warning.classList.add('hidden');
      skipBtn.classList.add('hidden');
      submit.classList.add('hidden');
    }

    this._updatePinDots();
    document.getElementById('pin-error').classList.add('hidden');

    const keypad = document.getElementById('pin-keypad');
    const newKeypad = keypad.cloneNode(true);
    keypad.parentNode.replaceChild(newKeypad, keypad);
    newKeypad.addEventListener('click', (e) => {
      const btn = e.target.closest('.pin-key');
      if (!btn || !btn.dataset.key) return;
      if (Date.now() < this._pinLockUntil) return;
      const key = btn.dataset.key;
      if (key === 'back') {
        this._pinEntry = this._pinEntry.slice(0, -1);
      } else if (this._pinEntry.length < 6) {
        this._pinEntry += key;
      }
      this._updatePinDots();
      const sb = document.getElementById('pin-submit');
      if (sb) sb.classList.toggle('hidden', this._pinEntry.length < 4);
    });

    const submitBtn = document.getElementById('pin-submit');
    const newSubmit = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmit, submitBtn);
    newSubmit.addEventListener('click', () => this._submitPin());

    if (skipBtn) {
      const newSkip = skipBtn.cloneNode(true);
      skipBtn.parentNode.replaceChild(newSkip, skipBtn);
      newSkip.addEventListener('click', () => {
        const settings = Storage.getSettings();
        settings.pinHash = null;
        settings.pinSalt = null;
        Storage.saveSettings(settings);
        this._bootApp();
      });
    }
  },

  _updatePinDots() {
    const dots = document.querySelectorAll('#screen-pin .pin-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('filled', i < this._pinEntry.length);
    });
  },

  _submitPin() {
    const pin = this._pinEntry;
    if (pin.length < 4) return;

    const errEl = document.getElementById('pin-error');

    if (this._pinMode === 'create') {
      const checkbox = document.getElementById('pin-understand');
      if (!checkbox.checked) {
        errEl.textContent = 'Check the box first.';
        errEl.classList.remove('hidden');
        return;
      }
      this._pinFirst = pin;
      this._showPin('confirm');
      return;
    }

    if (this._pinMode === 'confirm') {
      if (pin !== this._pinFirst) {
        errEl.textContent = "PINs don't match. Try again.";
        errEl.classList.remove('hidden');
        this._pinEntry = '';
        this._updatePinDots();
        document.getElementById('pin-submit').classList.add('hidden');
        return;
      }
      const salt = Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
      const hash = this._hashPin(pin, salt);
      const settings = Storage.getSettings();
      settings.pinHash = hash;
      settings.pinSalt = salt;
      Storage.saveSettings(settings);
      this._bootApp();
      return;
    }

    const settings = Storage.getSettings();
    const hash = this._hashPin(pin, settings.pinSalt);
    if (hash === settings.pinHash) {
      this._pinAttempts = 0;
      this._bootApp();
    } else {
      this._pinAttempts++;
      this._pinEntry = '';
      this._updatePinDots();
      document.getElementById('pin-submit').classList.add('hidden');

      if (this._pinAttempts >= 10) {
        errEl.textContent = 'Too many tries. Erase everything?';
        errEl.classList.remove('hidden');
        if (confirm('10 wrong PINs. Erase ALL data and start over?')) {
          for (const key of Object.keys(localStorage)) {
            if (key.startsWith('sweepstep_')) localStorage.removeItem(key);
          }
          location.reload();
        }
        this._pinAttempts = 0;
      } else if (this._pinAttempts >= 5) {
        this._pinLockUntil = Date.now() + 60000;
        const lockout = document.getElementById('pin-lockout');
        lockout.classList.remove('hidden');
        errEl.classList.add('hidden');
        const timer = document.getElementById('pin-lockout-timer');
        const interval = setInterval(() => {
          const remaining = Math.ceil((this._pinLockUntil - Date.now()) / 1000);
          if (remaining <= 0) {
            lockout.classList.add('hidden');
            clearInterval(interval);
          } else {
            timer.textContent = 'Try again in ' + remaining + 's';
          }
        }, 1000);
      } else {
        errEl.textContent = 'Wrong. ' + (5 - this._pinAttempts) + ' more before lockout.';
        errEl.classList.remove('hidden');
      }
    }
  },

  _hashPin(pin, salt) {
    let hash = 5381;
    const str = salt + ':' + pin;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return 'djb2_' + (hash >>> 0).toString(36);
  },

  handleHash() {
    const hash = window.location.hash.replace('#', '') || 'home';
    if (['home', 'work', 'steps', 'community', 'me', 'patterns'].includes(hash)) {
      this.navigate(hash, false);
    }
  },

  navigate(screen, updateHash = true) {
    // Hide all main screens and deactivate nav
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const target = document.getElementById('screen-' + screen);
    const btn = document.querySelector(`.nav-btn[data-screen="${screen}"]`);

    if (target) target.classList.add('active');
    if (btn) btn.classList.add('active');

    // Notify Me of hide/show to manage live counter
    if (this.currentScreen === 'me' && screen !== 'me' && typeof Me !== 'undefined' && Me.onHide) Me.onHide();
    if (screen === 'me' && typeof Me !== 'undefined' && Me.onShow) Me.onShow();

    this.currentScreen = screen;
    if (updateHash) window.location.hash = screen;

    if (target) {
      const content = target.querySelector('.screen-content');
      if (content) content.scrollTop = 0;
    }
    window.scrollTo(0, 0);

    if (screen === 'work') { this.renderHarms(); Fears.render(); }
    if (screen === 'home') this.renderHome();
    if (screen === 'patterns' && typeof Patterns !== 'undefined') Patterns.render();
    if (screen === 'community' && typeof Community !== 'undefined') {
      Community.renderSponsorCheckin();
      Community.renderMeetingStreak();
    }
  },

  applyAccent(color) {
    document.body.setAttribute('data-accent', color || 'violet');
  },

  /* ═══ HOME ═══ */
  renderHome() {
    const dateEl = document.getElementById('home-date');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString(undefined, {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      });
    }

    // Welcome using preferred name
    const hiEl = document.getElementById('home-hi');
    if (hiEl) {
      const s = Storage.getSettings();
      hiEl.textContent = s.name ? `Hey ${s.name}.` : '';
    }

    this.updateHomeSobriety();

    // Daily intention
    const intentInput = document.getElementById('daily-intention-input');
    if (intentInput) {
      const todayKey = new Date().toISOString().split('T')[0];
      intentInput.value = Storage.getIntentionFor(todayKey);
    }

    const quoteEl = document.getElementById('daily-quote');
    if (quoteEl) quoteEl.textContent = Quotes.getDailyQuote();

    const refl = Quotes.getDailyReflection();
    const typeLabel = document.getElementById('reflection-type-label');
    const title = document.getElementById('reflection-title');
    const text = document.getElementById('reflection-text');
    const prompt = document.getElementById('reflection-prompt');

    if (typeLabel) typeLabel.textContent = `${refl.type} ${refl.number}${refl.principle ? '. ' + refl.principle : ''}`;
    if (title) title.textContent = refl.title || '';
    if (text) {
      const settings = Storage.getSettings();
      text.textContent = refl.text.replace(/Higher Power/g, settings.hpName || 'Higher Power');
    }
    if (prompt) prompt.textContent = refl.reflection;

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

  /* ═══ HARMS ═══ */
  renderHarms() {
    const container = document.getElementById('harms-list');
    if (!container) return;
    container.innerHTML = '';

    const allHarms = [];

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

    const fearHarms = Fears.getAllHarms();
    fearHarms.forEach(h => { h.auto = true; allHarms.push(h); });

    const sexHarms = SexInventory.getAllHarms();
    sexHarms.forEach(h => { h.auto = true; allHarms.push(h); });

    const manual = Storage.getHarms();
    manual.forEach(h => { h.auto = false; allHarms.push(h); });

    if (allHarms.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <p>Nothing here yet.</p>
        <p class="text-secondary">Harms land here on their own as you fill in your inventory. Or add one directly.</p>
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
          ${harm.makeRight ? `<div class="text-secondary" style="margin-top:4px">Make it right: ${this.esc(harm.makeRight)}</div>` : ''}
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
      <label class="field-label">Who you harmed
        <input type="text" id="harm-person" class="input-field" value="${this.esc(harm.person)}" placeholder="Name">
      </label>
      <label class="field-label">What you did
        <textarea id="harm-what" class="input-field" rows="3">${this.esc(harm.harm)}</textarea>
      </label>
      <label class="field-label">What it would take to make it right
        <textarea id="harm-right" class="input-field" rows="3">${this.esc(harm.makeRight)}</textarea>
      </label>
    `;
    const footer = `
      <button class="btn-secondary" onclick="App.closeModal()">Cancel</button>
      <button class="btn-primary btn-small" onclick="App.saveHarm('${harm.id}', ${isNew})">Save</button>
    `;
    App.openModal(isNew ? 'Add harm' : 'Edit harm', body, footer);
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
    if (isNew) Pip.showNote(Pip.getResponse('harm'));
    this.closeModal();
    this.renderHarms();
  },

  deleteHarm(id) {
    if (!confirm('Remove this harm?')) return;
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

document.addEventListener('DOMContentLoaded', () => App.init());
