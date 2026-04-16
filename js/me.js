/* me.js — Settings, milestones, gratitude, export/import, belief retake */
const Me = {
  settings: null,
  gratitude: null,
  _liveInterval: null,

  chipMilestones: [
    { days: 1, label: '24 Hours' },
    { days: 7, label: '7 Days' },
    { days: 30, label: '30 Days' },
    { days: 60, label: '60 Days' },
    { days: 90, label: '90 Days' },
    { days: 183, label: '6 Months' },
    { days: 274, label: '9 Months' },
    { days: 365, label: '1 Year' },
    { days: 548, label: '18 Months' },
    { days: 730, label: '2 Years' },
    { days: 1826, label: '5 Years' },
    { days: 3653, label: '10 Years' }
  ],

  milestoneLines: {
    1: "24 hours. First chip. Don't lose it.",
    7: "One week. You built a fence.",
    30: "30 days. The old version is losing its grip.",
    60: "60 days. You can feel this now.",
    90: "90 days. They say something shifts around here. They're right.",
    183: "6 months. Life actually looks different.",
    274: "9 months. You've been at this longer than you thought possible.",
    365: "One year. You kept the promise.",
    548: "18 months. You're not counting as close anymore. That's normal.",
    730: "2 years. Look at you.",
    1826: "5 years. You are someone's hope now.",
    3653: "10 years. One day at a time. All the way here."
  },

  init() {
    this.settings = Storage.getSettings();
    this.gratitude = Storage.getGratitude();

    this.bindInput('me-name', 'name');
    this.bindInput('me-pronouns', 'pronouns');
    this.bindInput('me-hp-name', 'hpName');
    this.bindInput('me-sponsor-name', 'sponsorName');
    this.bindInput('me-sponsor-phone', 'sponsorPhone');

    const dateInput = document.getElementById('me-sobriety-date');
    if (dateInput) {
      dateInput.value = this.settings.sobrietyDate || '';
      dateInput.addEventListener('change', () => {
        this.settings.sobrietyDate = dateInput.value || null;
        Storage.saveSettings(this.settings);
        this.renderSobriety();
        this.renderMilestones();
        App.updateHomeSobriety();
      });
    }

    // Accent buttons (wired up by index.html using data-color attributes)
    document.querySelectorAll('.accent-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.accent-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.settings.accentColor = btn.dataset.color;
        Storage.saveSettings(this.settings);
        App.applyAccent(this.settings.accentColor);
      });
    });
    document.querySelectorAll('.accent-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === this.settings.accentColor);
    });

    // Gratitude
    document.getElementById('btn-add-gratitude').addEventListener('click', () => this.addGratitude());
    document.getElementById('gratitude-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.addGratitude(); }
    });

    // Sponsor call
    document.getElementById('btn-call-sponsor').addEventListener('click', () => {
      if (this.settings.sponsorPhone) {
        window.location.href = 'tel:' + this.settings.sponsorPhone;
      }
    });

    // Export / Import
    document.getElementById('btn-export').addEventListener('click', () => this.exportData());
    document.getElementById('btn-import').addEventListener('click', () => document.getElementById('import-file').click());
    document.getElementById('import-file').addEventListener('change', (e) => this.importData(e));

    // Belief retake
    const retakeBtn = document.getElementById('btn-retake-beliefs');
    if (retakeBtn) retakeBtn.addEventListener('click', () => Beliefs.openRetake());

    // Promises compare
    const promisesBtn = document.getElementById('btn-view-promises');
    if (promisesBtn) promisesBtn.addEventListener('click', () => {
      App.openModal('The Promises', Promises.renderComparison(),
        '<button class="btn-primary" onclick="App.closeModal()">Close</button>');
    });

    this.populateInputs();
    this.renderSobriety();
    this.renderMilestones();
    this.renderGratitude();
    this.updateSponsorCallBtn();
    this.renderBeliefSummary();
  },

  onShow() {
    // Called every time Me tab is shown — refreshes live counter
    this.settings = Storage.getSettings();
    this.gratitude = Storage.getGratitude();
    this.renderSobriety();
    this.renderMilestones();
    this.renderGratitude();
    this.updateSponsorCallBtn();
    this.renderBeliefSummary();
    // Start 1s tick so the counter updates at midnight
    if (this._liveInterval) clearInterval(this._liveInterval);
    this._liveInterval = setInterval(() => this.renderSobriety(), 60000);
  },

  onHide() {
    if (this._liveInterval) clearInterval(this._liveInterval);
    this._liveInterval = null;
  },

  bindInput(elementId, settingKey) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.addEventListener('input', () => {
      this.settings[settingKey] = el.value;
      Storage.saveSettings(this.settings);
      if (settingKey === 'sponsorPhone' || settingKey === 'sponsorName') {
        this.updateSponsorCallBtn();
        if (typeof Community !== 'undefined') Community.renderSponsorCheckin();
      }
    });
  },

  populateInputs() {
    const fields = {
      'me-name': 'name',
      'me-pronouns': 'pronouns',
      'me-hp-name': 'hpName',
      'me-sponsor-name': 'sponsorName',
      'me-sponsor-phone': 'sponsorPhone'
    };
    for (const [id, key] of Object.entries(fields)) {
      const el = document.getElementById(id);
      if (el) el.value = this.settings[key] || '';
    }
  },

  updateSponsorCallBtn() {
    const btn = document.getElementById('btn-call-sponsor');
    if (btn) {
      btn.style.display = this.settings.sponsorPhone ? 'block' : 'none';
      btn.textContent = `Call ${this.settings.sponsorName || 'them'}`;
    }
  },

  getSobrietyDays() {
    if (!this.settings.sobrietyDate) return null;
    const start = new Date(this.settings.sobrietyDate);
    const now = new Date();
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return Math.floor((now - start) / 86400000);
  },

  renderSobriety() {
    const display = document.getElementById('me-sobriety-display');
    const nextChip = document.getElementById('me-next-chip');
    if (!display) return;

    const days = this.getSobrietyDays();
    if (days === null) {
      display.innerHTML = '<p class="text-secondary">Set your sobriety date to start the counter.</p>';
      if (nextChip) nextChip.innerHTML = '';
      return;
    }

    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const d = days % 30;

    let parts = [];
    if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
    parts.push(`${d} day${d !== 1 ? 's' : ''}`);

    display.innerHTML = `
      <div class="sobriety-count">${days}</div>
      <div class="sobriety-label">day${days !== 1 ? 's' : ''}</div>
      <div class="sobriety-detail">${parts.join(', ')}</div>
    `;

    if (nextChip) {
      const next = this.getNextMilestone(days);
      if (next) {
        const daysUntil = next.days - days;
        nextChip.innerHTML = `Next: <strong>${next.label}</strong> in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
      } else {
        nextChip.innerHTML = '';
      }
    }

    this.checkMilestones(days);
  },

  getAllMilestones(currentDays) {
    const milestones = [...this.chipMilestones];
    if (currentDays !== null) {
      // Add yearly milestones from year 3 onward
      for (let y = 3; y <= Math.ceil((currentDays || 0) / 365) + 1; y++) {
        if (![1, 2, 5, 10].includes(y)) {
          milestones.push({ days: y * 365, label: `${y} Years` });
        }
      }
    }
    return milestones.sort((a, b) => a.days - b.days);
  },

  getNextMilestone(days) {
    const all = this.getAllMilestones(days);
    return all.find(m => m.days > days);
  },

  checkMilestones(days) {
    const pip = Storage.getPip();
    const celebrated = pip.celebratedMilestones || [];
    const all = this.getAllMilestones(days);

    all.forEach(m => {
      if (days >= m.days && !celebrated.includes(m.days)) {
        celebrated.push(m.days);
        pip.celebratedMilestones = celebrated;
        Storage.savePip(pip);
        Pip.celebrate();
        this.showMilestoneCelebration(m);
      }
    });
  },

  showMilestoneCelebration(milestone) {
    const line = this.milestoneLines[milestone.days] || "That's a real number. Don't lose it.";
    const overlay = document.getElementById('celebration-overlay');
    if (overlay) {
      document.getElementById('celebration-label').textContent = milestone.label;
      document.getElementById('celebration-line').textContent = line;
      overlay.classList.remove('hidden');
      overlay.classList.add('show');
      const close = () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.classList.add('hidden'), 500);
        overlay.removeEventListener('click', close);
      };
      overlay.addEventListener('click', close);
    }
  },

  renderMilestones() {
    const grid = document.getElementById('milestones-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const days = this.getSobrietyDays();
    const all = this.getAllMilestones(days || 0);
    const toShow = all.slice(0, 12);

    toShow.forEach(m => {
      const earned = days !== null && days >= m.days;
      const chip = document.createElement('div');
      chip.className = `milestone-chip ${earned ? 'earned' : ''}`;
      chip.innerHTML = `
        <div class="milestone-icon">${earned ? '&#10024;' : '&#9675;'}</div>
        <div class="milestone-label">${m.label}</div>
      `;
      grid.appendChild(chip);
    });
  },

  addGratitude() {
    const input = document.getElementById('gratitude-input');
    const text = input.value.trim();
    if (!text) return;

    this.gratitude.unshift({
      id: Date.now().toString(36),
      text: text,
      date: new Date().toISOString()
    });
    Storage.saveGratitude(this.gratitude);
    input.value = '';
    Pip.addScore(3);

    // 5-in-a-day acknowledgment
    const todayKey = new Date().toDateString();
    const todayCount = this.gratitude.filter(g =>
      new Date(g.date).toDateString() === todayKey
    ).length;
    if (todayCount === 5) {
      const list = document.getElementById('gratitude-list');
      if (list) {
        list.classList.add('gratitude-five-pulse');
        setTimeout(() => list.classList.remove('gratitude-five-pulse'), 2000);
      }
    }

    this.renderGratitude();
  },

  renderGratitude() {
    const container = document.getElementById('gratitude-list');
    if (!container) return;
    container.innerHTML = '';

    if (this.gratitude.length === 0) {
      container.innerHTML = '<div class="empty-state"><p class="text-secondary">Write one. Then another. Short is fine.</p></div>';
      return;
    }

    const groups = {};
    this.gratitude.forEach(entry => {
      const dateKey = new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(entry);
    });

    for (const [date, entries] of Object.entries(groups)) {
      const header = document.createElement('div');
      header.className = 'gratitude-date-header';
      header.textContent = date;
      container.appendChild(header);

      entries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'gratitude-entry';
        item.innerHTML = `
          <span>${this.esc(entry.text)}</span>
          <button class="btn-tiny" onclick="Me.deleteGratitude('${entry.id}')" aria-label="Remove">&times;</button>
        `;
        container.appendChild(item);
      });
    }
  },

  deleteGratitude(id) {
    this.gratitude = this.gratitude.filter(g => g.id !== id);
    Storage.saveGratitude(this.gratitude);
    this.renderGratitude();
  },

  renderBeliefSummary() {
    const el = document.getElementById('beliefs-summary');
    if (!el) return;
    const snaps = Storage.getBeliefs();
    if (snaps.length === 0) {
      el.innerHTML = '<p class="text-secondary">No beliefs snapshot yet.</p>';
      return;
    }
    const count = snaps.length;
    const latest = snaps[snaps.length - 1];
    el.innerHTML = `
      <p class="text-secondary">${count} snapshot${count !== 1 ? 's' : ''}. Latest ${new Date(latest.date).toLocaleDateString()}.</p>
    `;
  },

  exportData() {
    const data = Storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sweep-step-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data._appVersion) {
          alert('This does not look like a Sweep Step backup.');
          return;
        }
        if (confirm('This replaces everything with the backup. Are you sure?')) {
          Storage.importAll(data);
          this.settings = Storage.getSettings();
          this.gratitude = Storage.getGratitude();
          this.populateInputs();
          this.renderSobriety();
          this.renderMilestones();
          this.renderGratitude();
          this.updateSponsorCallBtn();
          this.renderBeliefSummary();
          App.applyAccent(this.settings.accentColor);
          Pip.data = Storage.getPip();
          Pip.render();
          alert('Restored.');
        }
      } catch (err) {
        alert('Could not read that file. Must be Sweep Step JSON.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  },

  esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
