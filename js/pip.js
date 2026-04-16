/* pip.js — Pip character logic, scoring, and rendering */
const Pip = {
  data: null,

  init() {
    this.data = Storage.getPip();
    this.checkDecay();
    this.recordDailyOpen();
    this.render();
    this.renderMini();
  },

  getStage() {
    const s = this.data.score;
    if (s <= 50) return 1;
    if (s <= 150) return 2;
    if (s <= 300) return 3;
    return 4;
  },

  getStageName() {
    const names = {
      1: 'Dusty Awakening',
      2: 'First Sweeps',
      3: 'Finding the Glow',
      4: 'Radiant Sweep'
    };
    return names[this.getStage()];
  },

  addScore(points) {
    this.data.score += points;
    this.data.lastActivity = new Date().toISOString();
    Storage.savePip(this.data);
    this.render();
    this.renderMini();
  },

  checkDecay() {
    const last = new Date(this.data.lastActivity);
    const now = new Date();
    const hoursSince = (now - last) / (1000 * 60 * 60);

    if (hoursSince > 48) {
      const daysOver = Math.floor((hoursSince - 48) / 24);
      const decay = daysOver * 2;
      this.data.score = Math.max(0, this.data.score - decay);
      Storage.savePip(this.data);
    }
  },

  recordDailyOpen() {
    const today = new Date().toDateString();
    const lastDate = this.data.lastActivity ? new Date(this.data.lastActivity).toDateString() : '';
    if (today !== lastDate) {
      this.addScore(1);
    }
  },

  showsMissMessage() {
    const last = new Date(this.data.lastActivity);
    const now = new Date();
    return (now - last) / (1000 * 60 * 60) > 48;
  },

  render() {
    const stage = this.getStage();
    const el = document.getElementById('pip-character');
    const status = document.getElementById('pip-status');
    const fill = document.getElementById('pip-score-fill');
    const label = document.getElementById('pip-score-label');
    const miss = document.getElementById('pip-miss-msg');

    if (el) {
      el.setAttribute('data-stage', stage);
      el.className = 'pip';
    }

    if (status) {
      status.textContent = this.getStageName();
    }

    if (fill) {
      // Max visual bar at 400 points
      const pct = Math.min(100, (this.data.score / 400) * 100);
      fill.style.width = pct + '%';
    }

    if (label) {
      label.textContent = `${this.data.score} points — Stage ${stage}`;
    }

    if (miss) {
      if (this.showsMissMessage()) {
        miss.classList.remove('hidden');
      } else {
        miss.classList.add('hidden');
      }
    }
  },

  renderMini() {
    const mini = document.getElementById('pip-mini');
    if (mini) {
      mini.setAttribute('data-stage', this.getStage());
    }
  },

  // Called from Steps when a step is completed
  celebrate() {
    const el = document.getElementById('pip-character');
    if (el) {
      el.classList.add('celebrating');
      setTimeout(() => el.classList.remove('celebrating'), 2000);
    }
    const mini = document.getElementById('pip-mini');
    if (mini) {
      mini.classList.add('celebrating');
      setTimeout(() => mini.classList.remove('celebrating'), 2000);
    }
  }
};
