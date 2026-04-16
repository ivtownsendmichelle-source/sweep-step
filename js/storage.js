/* storage.js — localStorage abstraction for Sweep Step */
const Storage = {
  _keys: {
    inventory: 'sweepstep_inventory',
    fears: 'sweepstep_fears',
    sex: 'sweepstep_sex',
    harms: 'sweepstep_harms',
    steps: 'sweepstep_steps',
    meetings: 'sweepstep_meetings',
    contacts: 'sweepstep_contacts',
    gratitude: 'sweepstep_gratitude',
    settings: 'sweepstep_settings',
    pip: 'sweepstep_pip',
    intentions: 'sweepstep_intentions',
    beliefs: 'sweepstep_beliefs',
    promisesStart: 'sweepstep_promisesAssessmentStart',
    promisesEnd: 'sweepstep_promisesAssessmentEnd',
    sponsorCheckins: 'sweepstep_sponsor_checkins',
    streaks: 'sweepstep_streaks',
    patternsSeen: 'sweepstep_patterns_seen'
  },

  get(key) {
    try {
      const raw = localStorage.getItem(this._keys[key] || key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Storage read error:', key, e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(this._keys[key] || key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage write error:', key, e);
      return false;
    }
  },

  getInventory() { return this.get('inventory') || []; },
  saveInventory(d) { this.set('inventory', d); },

  getFears() { return this.get('fears') || { auto: [], manual: [], chains: {} }; },
  saveFears(d) { this.set('fears', d); },

  getSexInventory() { return this.get('sex') || []; },
  saveSexInventory(d) { this.set('sex', d); },

  getHarms() { return this.get('harms') || []; },
  saveHarms(d) { this.set('harms', d); },

  getSteps() {
    const saved = this.get('steps');
    if (saved && saved.length === 12) return saved;
    return Array.from({ length: 12 }, (_, i) => ({
      step: i + 1, status: 'not_started', notes: '', dateStarted: null, dateCompleted: null
    }));
  },
  saveSteps(d) { this.set('steps', d); },

  getMeetings() { return this.get('meetings') || []; },
  saveMeetings(d) { this.set('meetings', d); },

  getContacts() { return this.get('contacts') || []; },
  saveContacts(d) { this.set('contacts', d); },

  getGratitude() { return this.get('gratitude') || []; },
  saveGratitude(d) { this.set('gratitude', d); },

  getSettings() {
    return this.get('settings') || {
      name: '', pronouns: '', hpName: 'Higher Power', accentColor: 'violet',
      sobrietyDate: null, sponsorName: '', sponsorPhone: '',
      onboardingComplete: false, pinHash: null, pinSalt: null,
      firstOpenDate: null
    };
  },
  saveSettings(d) { this.set('settings', d); },

  getPip() {
    return this.get('pip') || {
      score: 0, lastActivity: new Date().toISOString(),
      celebratedMilestones: [], openStreak: 0, lastOpenDate: null,
      sevenDayNoticed: false
    };
  },
  savePip(d) { this.set('pip', d); },

  /* Daily intentions — stored by date YYYY-MM-DD */
  getIntentions() { return this.get('intentions') || {}; },
  saveIntentions(d) { this.set('intentions', d); },
  getIntentionFor(dateStr) {
    const all = this.getIntentions();
    return all[dateStr] || '';
  },
  setIntentionFor(dateStr, text) {
    const all = this.getIntentions();
    all[dateStr] = text;
    this.saveIntentions(all);
  },

  /* Belief assessments — array of snapshots with timestamp */
  getBeliefs() { return this.get('beliefs') || []; },
  saveBeliefs(d) { this.set('beliefs', d); },
  addBeliefSnapshot(ratings) {
    const arr = this.getBeliefs();
    arr.push({ date: new Date().toISOString(), ratings: ratings });
    this.saveBeliefs(arr);
    return arr.length;
  },

  /* Promises */
  getPromisesStart() { return this.get('promisesStart'); },
  savePromisesStart(ratings) {
    this.set('promisesStart', { date: new Date().toISOString(), ratings });
  },
  getPromisesEnd() { return this.get('promisesEnd'); },
  savePromisesEnd(ratings) {
    this.set('promisesEnd', { date: new Date().toISOString(), ratings });
  },

  /* Sponsor check-ins — array of YYYY-MM-DD dates */
  getSponsorCheckins() { return this.get('sponsorCheckins') || []; },
  saveSponsorCheckins(d) { this.set('sponsorCheckins', d); },
  addSponsorCheckin() {
    const today = new Date().toISOString().split('T')[0];
    const arr = this.getSponsorCheckins();
    if (!arr.includes(today)) {
      arr.push(today);
      this.saveSponsorCheckins(arr);
    }
    return arr;
  },

  /* Streaks cache (computed + flagged) */
  getStreaks() {
    return this.get('streaks') || {
      sponsor: { current: 0, last: null },
      meeting: { current: 0, last: null }
    };
  },
  saveStreaks(d) { this.set('streaks', d); },

  /* Patterns seen (track which crossover names we've highlighted) */
  getPatternsSeen() { return this.get('patternsSeen') || []; },
  savePatternsSeen(d) { this.set('patternsSeen', d); },

  exportAll() {
    const data = {};
    for (const [name, key] of Object.entries(this._keys)) {
      const raw = localStorage.getItem(key);
      if (raw) data[name] = JSON.parse(raw);
    }
    data._exportDate = new Date().toISOString();
    data._appVersion = '2.0.0';
    return data;
  },

  importAll(data) {
    for (const [name, key] of Object.entries(this._keys)) {
      if (data[name] !== undefined) {
        localStorage.setItem(key, JSON.stringify(data[name]));
      }
    }
    return true;
  }
};
