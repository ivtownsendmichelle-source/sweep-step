/* me.js — Settings, milestones, gratitude, export/import */
const Me = {
  settings: null,
  gratitude: null,

  chipMilestones: [
    { days: 1, label: '24 Hours' },
    { days: 30, label: '30 Days' },
    { days: 60, label: '60 Days' },
    { days: 90, label: '90 Days' },
    { days: 183, label: '6 Months' },
    { days: 274, label: '9 Months' },
    { days: 365, label: '1 Year' }
    // Yearly milestones generated dynamically
  ],

  init() {
    this.settings = Storage.getSettings();
    this.gratitude = Storage.getGratitude();

    // Bind settings inputs
    this.bindInput('me-name', 'name');
    this.bindInput('me-pronouns', 'pronouns');
    this.bindInput('me-hp-name', 'hpName');
    this.bindInput('me-sponsor-name', 'sponsorName');
    this.bindInput('me-sponsor-phone', 'sponsorPhone');

    // Sobriety date
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

    // Accent color
    document.querySelectorAll('.accent-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.accent-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.settings.accentColor = btn.dataset.color;
        Storage.saveSettings(this.settings);
        App.applyAccent(this.settings.accentColor);
      });
    });
    // Set active accent
    document.querySelectorAll('.accent-btn').forEach(btn => {
      if (btn.dataset.color === this.settings.accentColor) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    // Gratitude
    document.getElementById('btn-add-gratitude').addEventListener('click', () => this.addGratitude());
    document.getElementById('gratitude-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this.addGratitude(); }
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

    this.populateInputs();
    this.renderSobriety();
    this.renderMilestones();
    this.renderGratitude();
    this.updateSponsorCallBtn();
  },

  bindInput(elementId, settingKey) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.addEventListener('input', () => {
      this.settings[settingKey] = el.value;
      Storage.saveSettings(this.settings);
      if (settingKey === 'sponsorPhone' || settingKey === 'sponsorName') {
        this.updateSponsorCallBtn();
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
      btn.textContent = `Call ${this.settings.sponsorName || 'Sponsor'}`;
    }
  },

  /* ═══ SOBRIETY ═══ */
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
      display.innerHTML = '<p class="text-secondary">Set your sobriety date to start tracking.</p>';
      if (nextChip) nextChip.innerHTML = '';
      return;
    }

    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const d = days % 30;

    let parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    parts.push(`${d} day${d !== 1 ? 's' : ''}`);

    display.innerHTML = `
      <div class="sobriety-count">${days}</div>
      <div class="sobriety-label">days</div>
      <div class="sobriety-detail">${parts.join(', ')}</div>
    `;

    // Next chip
    if (nextChip) {
      const next = this.getNextMilestone(days);
      if (next) {
        const daysUntil = next.days - days;
        nextChip.innerHTML = `Next milestone: <strong>${next.label}</strong> in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
      } else {
        nextChip.innerHTML = '';
      }
    }

    // Check for new milestones
    this.checkMilestones(days);
  },

  getAllMilestones(currentDays) {
    const milestones = [...this.chipMilestones];
    // Add yearly milestones beyond year 1
    if (currentDays !== null) {
      for (let y = 2; y <= Math.ceil(currentDays / 365) + 1; y++) {
        milestones.push({ days: y * 365, label: `${y} Years` });
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
        this.showMilestoneCelebration(m.label);
      }
    });
  },

  showMilestoneCelebration(label) {
    const body = `
      <div class="text-center" style="padding:20px;">
        <div style="font-size:48px;margin-bottom:16px;">&#10024;</div>
        <h3 style="font-family:var(--font-heading);font-size:24px;margin-bottom:8px;">${label}</h3>
        <p>You're here. That matters more than you know.</p>
        <p class="text-secondary" style="margin-top:12px;">Pip is celebrating with you.</p>
      </div>
    `;
    App.openModal('Milestone Reached', body, '<button class="btn-primary" onclick="App.closeModal()">Thank you</button>');
  },

  renderMilestones() {
    const grid = document.getElementById('milestones-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const days = this.getSobrietyDays();
    const all = this.getAllMilestones(days || 0);
    // Show at most 12 milestones
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

  /* ═══ GRATITUDE ═══ */
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
    this.renderGratitude();
  },

  renderGratitude() {
    const container = document.getElementById('gratitude-list');
    if (!container) return;
    container.innerHTML = '';

    if (this.gratitude.length === 0) {
      container.innerHTML = '<div class="empty-state"><p class="text-secondary">What are you grateful for today?</p></div>';
      return;
    }

    // Group by date
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

  /* ═══ EXPORT / IMPORT ═══ */
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
          alert('This does not appear to be a Sweep Step backup file.');
          return;
        }
        if (confirm('This will replace all your current data with the backup. Are you sure?')) {
          Storage.importAll(data);
          // Reload everything
          this.settings = Storage.getSettings();
          this.gratitude = Storage.getGratitude();
          this.populateInputs();
          this.renderSobriety();
          this.renderMilestones();
          this.renderGratitude();
          this.updateSponsorCallBtn();
          App.applyAccent(this.settings.accentColor);
          Pip.data = Storage.getPip();
          Pip.render();
          Pip.renderMini();
          alert('Backup restored successfully.');
        }
      } catch (err) {
        alert('Could not read backup file. Make sure it is a valid Sweep Step JSON export.');
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
