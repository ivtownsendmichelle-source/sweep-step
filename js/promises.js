/* promises.js — The 12 Promises self-assessment, taken twice */
const Promises = {
  list: [
    "We are going to know a new freedom and a new happiness.",
    "We will not regret the past nor wish to shut the door on it.",
    "We will comprehend the word serenity.",
    "We will know peace.",
    "No matter how far down the scale we have gone, we will see how our experience can benefit others.",
    "The feeling of uselessness and self-pity will disappear.",
    "We will lose interest in selfish things and gain interest in our fellows.",
    "Self-seeking will slip away.",
    "Our whole attitude and outlook upon life will change.",
    "Fear of people and of economic insecurity will leave us.",
    "We will intuitively know how to handle situations which used to baffle us.",
    "We will suddenly realize that God is doing for us what we could not do for ourselves."
  ],

  /* Render an assessment form. phase: 'start' or 'end'. containerId is the host element.
     Calls onSave(ratings) when user taps Save. */
  renderForm(containerId, phase, onSave) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Replace "God" with user's HP name if set
    const settings = Storage.getSettings();
    const hp = settings.hpName || 'Higher Power';

    const intro = phase === 'start'
      ? "Before you start, rate how true each of these feels right now. There are no wrong answers. You will do this again when you finish the steps. That gap is going to mean something."
      : "You finished Step 12. Rate these now. Then we'll show you what changed.";

    let html = `
      <div class="assessment-intro">
        <p>${intro}</p>
      </div>
      <div class="assessment-scale-legend">
        <span>1 = not my life at all</span>
        <span>5 = true for me today</span>
      </div>
      <div class="assessment-list" id="promises-items">
    `;

    this.list.forEach((text, i) => {
      const displayText = text.replace(/\bGod\b/, hp);
      html += `
        <div class="assessment-item" data-idx="${i}">
          <div class="assessment-statement">${this.esc(displayText)}</div>
          <div class="rating-row" data-idx="${i}">
            ${[1,2,3,4,5].map(n =>
              `<button type="button" class="rating-btn" data-rating="${n}">${n}</button>`
            ).join('')}
          </div>
        </div>
      `;
    });

    html += `</div>
      <button class="btn-primary btn-glow" id="promises-save-btn" disabled>Save</button>
    `;

    container.innerHTML = html;

    const ratings = new Array(this.list.length).fill(null);

    container.querySelectorAll('.rating-row').forEach(row => {
      row.addEventListener('click', (e) => {
        const btn = e.target.closest('.rating-btn');
        if (!btn) return;
        const idx = parseInt(row.dataset.idx, 10);
        const val = parseInt(btn.dataset.rating, 10);
        ratings[idx] = val;
        row.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        // Enable save once all rated
        const saveBtn = document.getElementById('promises-save-btn');
        if (saveBtn) saveBtn.disabled = ratings.some(r => r === null);
      });
    });

    document.getElementById('promises-save-btn').addEventListener('click', () => {
      if (ratings.some(r => r === null)) return;
      if (phase === 'start') Storage.savePromisesStart(ratings);
      else Storage.savePromisesEnd(ratings);
      if (onSave) onSave(ratings);
    });
  },

  /* Before/after compare. Returns an HTML string. */
  renderComparison() {
    const start = Storage.getPromisesStart();
    const end = Storage.getPromisesEnd();

    if (!start) {
      return '<div class="empty-state"><p>No starting assessment yet.</p></div>';
    }

    const settings = Storage.getSettings();
    const hp = settings.hpName || 'Higher Power';

    let html = `<div class="promises-compare">
      <h3 class="patterns-section-title">How far you have come</h3>`;

    if (!end) {
      html += `<p class="text-secondary">You'll see the comparison here after you finish Step 12 and retake the assessment.</p>
        <div class="assessment-start-dates"><small>First assessment: ${new Date(start.date).toLocaleDateString()}</small></div>`;
    }

    html += `<div class="assessment-list">`;
    this.list.forEach((text, i) => {
      const displayText = text.replace(/\bGod\b/, hp);
      const s = start.ratings[i];
      const e = end ? end.ratings[i] : null;
      const delta = (e !== null && e !== undefined) ? e - s : null;
      html += `
        <div class="promise-compare-row">
          <div class="assessment-statement">${this.esc(displayText)}</div>
          <div class="promise-compare-bars">
            <div class="promise-bar-item">
              <span class="promise-bar-label">Then</span>
              <div class="promise-bar-track">${this._barDots(s)}</div>
            </div>
            ${e !== null && e !== undefined ? `
              <div class="promise-bar-item">
                <span class="promise-bar-label">Now</span>
                <div class="promise-bar-track">${this._barDots(e)}</div>
              </div>
              <div class="promise-delta ${delta > 0 ? 'delta-up' : delta < 0 ? 'delta-down' : 'delta-flat'}">
                ${delta > 0 ? '+' + delta : delta}
              </div>` : ''}
          </div>
        </div>
      `;
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

  /* Offer the end-of-steps retake when Step 12 is marked complete */
  offerEndAssessment() {
    const steps = Storage.getSteps();
    const step12 = steps[11];
    if (!step12 || step12.status !== 'complete') return;
    if (Storage.getPromisesEnd()) return; // Already done

    // Show a modal offering the retake
    const body = `
      <p>You finished Step 12.</p>
      <p>Remember that promises assessment you took at the beginning? It's time for the second one.</p>
      <p class="text-secondary">Rate each one the way you feel it right now. Then we'll show you what changed.</p>
    `;
    const footer = `
      <button class="btn-secondary" onclick="App.closeModal()">Later</button>
      <button class="btn-primary" onclick="Promises.openEndModal()">Take it now</button>
    `;
    App.openModal('The Promises. Second take.', body, footer);
  },

  openEndModal() {
    const body = `<div id="promises-end-form"></div>`;
    App.openModal('The Promises. Second take.', body, '');
    this.renderForm('promises-end-form', 'end', () => {
      App.closeModal();
      // Show comparison
      const cBody = this.renderComparison();
      App.openModal('How far you have come', cBody,
        '<button class="btn-primary" onclick="App.closeModal()">Close</button>');
    });
  },

  esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
};
