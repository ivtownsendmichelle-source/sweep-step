/* pip.js — Pip character logic, scoring, and phase-aware voice */
const Pip = {
  data: null,

  /* Phase-aware voice lines. Pip never uses the word "journey".
     Pip never lectures. Pip is warm, scrappy, fond of you. */
  voice: {
    /* Day 1-7: close, gentle, checking in */
    newcomer: [
      "You're here. That's the thing.",
      "One day. Just this one.",
      "Don't go yet. Stay where the help is.",
      "I've seen worse starts. You're fine.",
      "Breathe. Then one more.",
      "You're allowed to feel weird. Keep going.",
      "I'm right here."
    ],
    /* Day 8-30: encouraging habit */
    habit: [
      "You keep showing up. I notice.",
      "The habit is starting to take.",
      "Same time, different day. Good.",
      "This is the part nobody sees. It counts.",
      "Little by little, then all at once.",
      "You're building something."
    ],
    /* Day 31-90: steadier, less hand-holding */
    building: [
      "You know what you're doing now.",
      "Stay with it. The work is working.",
      "You've got a groove.",
      "Less noise in here. I can feel it.",
      "Keep going. Don't look back too long."
    ],
    /* Day 91+: peer energy */
    peer: [
      "You know the drill.",
      "Go be useful to somebody today.",
      "This is who you are now.",
      "Pass it on when you can.",
      "I'm just hanging out. You've got this."
    ],
    /* 7-day streak notice */
    streakSeven: [
      "Seven days in a row. I see you.",
      "A week of showing up. That's a thing.",
      "Every day this week. Noticed."
    ]
  },

  init() {
    this.data = Storage.getPip();
    this.checkDecay();
    this.recordDailyOpen();
    this.render();
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
      1: 'Dusty',
      2: 'Sweeping',
      3: 'Glowing',
      4: 'Lit up'
    };
    return names[this.getStage()];
  },

  /* Sobriety days — if no date, use days since first open */
  getSobrietyDays() {
    const s = Storage.getSettings();
    const anchor = s.sobrietyDate || s.firstOpenDate;
    if (!anchor) return 0;
    const start = new Date(anchor);
    const now = new Date();
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((now - start) / 86400000));
  },

  /* Which voice bucket to pull from */
  getPhase() {
    const d = this.getSobrietyDays();
    if (d <= 7) return 'newcomer';
    if (d <= 30) return 'habit';
    if (d <= 90) return 'building';
    return 'peer';
  },

  /* A line Pip would say today */
  sayDaily() {
    const phase = this.getPhase();
    const list = this.voice[phase];
    // Rotate based on date so it's stable per-day
    const today = new Date();
    const idx = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000) % list.length;
    return list[idx];
  },

  addScore(points) {
    this.data.score += points;
    this.data.lastActivity = new Date().toISOString();
    Storage.savePip(this.data);
    this.render();
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

  /* Track daily opens and 7-day streak */
  recordDailyOpen() {
    const today = new Date().toDateString();
    const lastDate = this.data.lastOpenDate || '';

    if (today === lastDate) return;

    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yday = yesterday.toDateString();

    if (lastDate === yday) {
      this.data.openStreak = (this.data.openStreak || 0) + 1;
    } else {
      this.data.openStreak = 1;
    }
    this.data.lastOpenDate = today;

    // Daily +1 score
    this.data.score += 1;
    this.data.lastActivity = new Date().toISOString();

    Storage.savePip(this.data);

    // 7-day streak notice (once)
    if (this.data.openStreak === 7 && !this.data.sevenDayNoticed) {
      this.data.sevenDayNoticed = true;
      Storage.savePip(this.data);
      // Queue notice for next render cycle
      this._queuedStreakNote = true;
    }

    // Reset flag if they break streak
    if (this.data.openStreak < 7) {
      this.data.sevenDayNoticed = false;
      Storage.savePip(this.data);
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
    const voice = document.getElementById('pip-voice');

    if (el) {
      el.setAttribute('data-stage', stage);
      el.className = 'pip';
    }

    if (status) status.textContent = this.getStageName();

    if (fill) {
      const pct = Math.min(100, (this.data.score / 400) * 100);
      fill.style.width = pct + '%';
    }

    if (label) {
      label.textContent = `${this.data.score} points. Stage ${stage}.`;
    }

    if (miss) {
      miss.classList.toggle('hidden', !this.showsMissMessage());
    }

    if (voice) {
      if (this._queuedStreakNote) {
        const lines = this.voice.streakSeven;
        voice.textContent = lines[Math.floor(Math.random() * lines.length)];
        voice.classList.add('pip-voice-special');
        this._queuedStreakNote = false;
        setTimeout(() => { voice.classList.remove('pip-voice-special'); }, 5000);
      } else {
        voice.textContent = this.sayDaily();
      }
    }
  },

  celebrate() {
    const el = document.getElementById('pip-character');
    if (el) {
      el.classList.add('celebrating');
      setTimeout(() => el.classList.remove('celebrating'), 2000);
    }
  },

  /* Context-aware Pip responses by section */
  responses: {
    resentment: [
      "That one needed to come out.",
      "Honest work. You went there.",
      "You can stop carrying that now. Not all at once. But you started.",
      "Naming it takes the air out of it.",
      "Good. Keep going when you can.",
      "That's the work. Nobody sees it but us. It still counts.",
      "You wrote it down. That's the whole thing.",
      "No shortcuts. You took the long way. Right call."
    ],
    fear: [
      "Most fears shrink when you look at them straight. You looked.",
      "That's the root or getting close to it.",
      "Fear is loud. You wrote it down anyway.",
      "Nice work getting it on the page.",
      "You're not the first person scared of that. Won't be the last.",
      "Good. That one's going to move now."
    ],
    sex: [
      "That's a hard one to write down. You wrote it down.",
      "No edits. That's how this works.",
      "Patterns start showing up when you put the details on paper.",
      "You went there. That's the whole deal.",
      "Honest. Keep going when you're ready."
    ],
    harm: [
      "Naming harm is the first half of making it right.",
      "You don't have to fix it today. You just had to see it.",
      "That list is heavy. You're carrying it differently now.",
      "Write it. Walk it. Don't skip steps.",
      "Good. It's on the page now, not just in your head."
    ],
    step: {
      1: "Step 1. Admitted it. That takes the whole thing out of the shadows.",
      2: "Step 2. Came to believe. Not had to believe. Came to. Big difference.",
      3: "Step 3. Decision made. Keep making it.",
      4: "Step 4. You wrote the whole thing down. That's the one most people skip. You didn't.",
      5: "Step 5. Told it to someone. Out loud. Nothing like it.",
      6: "Step 6. Ready. Just ready. That's enough.",
      7: "Step 7. Asked. Keep asking. Every day is fine.",
      8: "Step 8. The list. Hardest list you'll ever write.",
      9: "Step 9. You made it right where you could. That's a different kind of free.",
      10: "Step 10. Daily. Short. Honest. You've got the rhythm now.",
      11: "Step 11. Quiet. Listening. Keep doing that.",
      12: "Step 12. You carry it now. Somebody is going to need what you have."
    }
  },

  getResponse(section, stepNumber) {
    if (section === 'step' && stepNumber) {
      return this.responses.step[stepNumber] || "Step done. You did the thing.";
    }
    const list = this.responses[section];
    if (!list || !list.length) return '';
    return list[Math.floor(Math.random() * list.length)];
  },

  /* Show a Pip note in a transient banner */
  showNote(text) {
    let banner = document.getElementById('pip-note');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'pip-note';
      banner.className = 'pip-note';
      document.body.appendChild(banner);
    }
    banner.textContent = text;
    banner.classList.remove('hidden');
    banner.classList.add('show');
    clearTimeout(this._noteTimer);
    this._noteTimer = setTimeout(() => {
      banner.classList.remove('show');
      setTimeout(() => banner.classList.add('hidden'), 400);
    }, 4000);
  }
};
