/* beliefs.js — Belief Tracker: 10 recovery statements, rated 1-5,
   taken at onboarding and retakeable from Me tab with delta view. */
const Beliefs = {
  statements: [
    "I am worth recovering.",
    "I can change.",
    "I deserve to be honest with myself.",
    "Other people can be trusted.",
    "My past does not have to define my future.",
    "I am capable of making amends.",
    "A higher power or something greater than me is available to me.",
    "I can ask for help without shame.",
    "I have something to offer others in recovery.",
    "I am not alone in this."
  ],

  /* Render form into a container. onSave receives the ratings array. */
  renderForm(containerId, isFirst, onSave) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const intro = isFirst
      ? "Rate these honestly. This is just where you are today."
      : "Same statements. Rate them the way they feel right now.";

    let html = `
      <div class="assessment-intro"><p>${intro}</p></div>
      <div class="assessment-scale-legend">
        <span>1 = not true for me</span>
        <span>5 = true for me today</span>
      </div>
      <div class="assessment-list">
    `;

    this.statements.forEach((text, i) => {
      html += `
        <div class="assessment-item" data-idx="${i}">
          <div class="assessment-statement">${this.esc(text)}</div>
          <div class="rating-row" data-idx="${i}">
            ${[1,2,3,4,5].map(n =>
              `<button type="button" class="rating-btn" data-rating="${n}">${n}</button>`
            ).join('')}
          </div>
        </div>
      `;
    });

    html += `</div>
      <button class="btn-primary btn-glow" id="beliefs-save-btn" disabled>Save</button>
    `;

    container.innerHTML = html;

    const ratings = new Array(this.statements.length).fill(null);

    container.querySelectorAll('.rating-row').forEach(row => {
      row.addEventListener('click', (e) => {
        const btn = e.target.closest('.rating-btn');
        if (!btn) return;
        const idx = parseInt(row.dataset.idx, 10);
        const val = parseInt(btn.dataset.rating, 10);
        ratings[idx] = val;
        row.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const saveBtn = document.getElementById('beliefs-save-btn');
        if (saveBtn) saveBtn.disabled = ratings.some(r => r === null);
      });
    });

    document.getElementById('beliefs-save-btn').addEventListener('click', () => {
      if (ratings.some(r => r === null)) return;
      Storage.addBeliefSnapshot(ratings);
      if (onSave) onSave(ratings);
    });
  },

  /* Retake flow from Me tab */
  openRetake() {
    const body = `<div id="beliefs-retake-form"></div>`;
    App.openModal('Beliefs check-in', body, '');
    this.renderForm('beliefs-retake-form', false, () => {
      App.closeModal();
      App.openModal('What moved', this.renderDelta(),
        '<button class="btn-primary" onclick="App.closeModal()">Close</button>');
    });
  },

  /* Delta view between first and latest snapshot */
  renderDelta() {
    const snaps = Storage.getBeliefs();
    if (snaps.length < 2) {
      return '<div class="empty-state"><p>Take the assessment again to see change.</p></div>';
    }
    const first = snaps[0];
    const latest = snaps[snaps.length - 1];

    let html = `<div class="beliefs-delta">
      <p class="text-secondary">First taken ${new Date(first.date).toLocaleDateString()}. Latest ${new Date(latest.date).toLocaleDateString()}.</p>
      <div class="assessment-list">`;

    this.statements.forEach((text, i) => {
      const s = first.ratings[i];
      const e = latest.ratings[i];
      const delta = e - s;
      html += `
        <div class="promise-compare-row">
          <div class="assessment-statement">${this.esc(text)}</div>
          <div class="promise-compare-bars">
            <div class="promise-bar-item">
              <span class="promise-bar-label">Then</span>
              <div class="promise-bar-track">${this._barDots(s)}</div>
            </div>
            <div class="promise-bar-item">
              <span class="promise-bar-label">Now</span>
              <div class="promise-bar-track">${this._barDots(e)}</div>
            </div>
            <div class="promise-delta ${delta > 0 ? 'delta-up' : delta < 0 ? 'delta-down' : 'delta-flat'}">
              ${delta > 0 ? '+' + delta : delta === 0 ? '—' : delta}
            </div>
          </div>
        </div>`;
    });
    html += `</div></div>`;
    return html;
  },

  _barDots(rating) {
    let s = '';
    for (let i = 1; i <= 5; i++) {
      s += `<span class="promise-dot${i <= rating ? ' filled' : ''}"></span>`;
    }
    return s;
  },

  esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
};
