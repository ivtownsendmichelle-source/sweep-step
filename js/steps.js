/* steps.js — 12 Step progress tracker */
const Steps = {
  data: null,

  descriptions: [
    "We admitted we were powerless over our addiction. That our lives had become unmanageable.",
    "Came to believe that a power greater than ourselves could restore us to sanity.",
    "Made a decision to turn our will and our lives over to the care of our Higher Power as we understood it.",
    "Made a searching and fearless moral inventory of ourselves.",
    "Admitted to our Higher Power, to ourselves, and to another human being the exact nature of our wrongs.",
    "Were entirely ready to have our Higher Power remove all these defects of character.",
    "Humbly asked our Higher Power to remove our shortcomings.",
    "Made a list of all persons we had harmed, and became willing to make amends to them all.",
    "Made direct amends to such people wherever possible, except when to do so would injure them or others.",
    "Continued to take personal inventory and when we were wrong promptly admitted it.",
    "Sought through prayer and meditation to improve our conscious contact with our Higher Power, seeking only for knowledge of its will for us and the power to carry that out.",
    "Having had a spiritual awakening as the result of these steps, we tried to carry this message and to practice these principles in all our affairs."
  ],

  principles: [
    "Honesty", "Hope", "Faith", "Courage", "Integrity",
    "Willingness", "Humility", "Compassion", "Justice", "Perseverance",
    "Spiritual Awareness", "Service"
  ],

  init() {
    this.data = Storage.getSteps();
    this.render();
  },

  render() {
    const container = document.getElementById('steps-list');
    if (!container) return;
    container.innerHTML = '';
    const settings = Storage.getSettings();
    const hpName = settings.hpName || 'Higher Power';

    this.data.forEach((step, i) => {
      const card = document.createElement('div');
      card.className = `step-card step-${step.status}`;

      const statusLabel = {
        not_started: 'Not started',
        in_progress: 'Working on it',
        complete: 'Done'
      }[step.status];

      const desc = this.descriptions[i].replace(/Higher Power/g, hpName);

      card.innerHTML = `
        <div class="step-badge step-badge-${step.status}">${step.step}</div>
        <div class="step-content">
          <div class="step-header">
            <h3 class="step-title">Step ${step.step}. ${this.principles[i]}.</h3>
            <span class="step-status-label step-status-${step.status}">${statusLabel}</span>
          </div>
          <p class="step-description">${desc}</p>
          ${step.dateStarted ? `<p class="step-date">Started ${new Date(step.dateStarted).toLocaleDateString()}</p>` : ''}
          ${step.dateCompleted ? `<p class="step-date">Done ${new Date(step.dateCompleted).toLocaleDateString()}</p>` : ''}
          <div class="step-actions">
            ${step.status === 'not_started' ? `<button class="btn-small btn-primary" onclick="Steps.setStatus(${i}, 'in_progress')">Start</button>` : ''}
            ${step.status === 'in_progress' ? `<button class="btn-small btn-primary" onclick="Steps.setStatus(${i}, 'complete')">Mark done</button><button class="btn-small btn-secondary" onclick="Steps.setStatus(${i}, 'not_started')">Reset</button>` : ''}
            ${step.status === 'complete' ? `<button class="btn-small btn-secondary" onclick="Steps.setStatus(${i}, 'in_progress')">Reopen</button>` : ''}
            <button class="btn-small btn-secondary" onclick="Steps.openNotes(${i})">Notes</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  },

  setStatus(index, status) {
    const step = this.data[index];
    step.status = status;

    if (status === 'in_progress' && !step.dateStarted) {
      step.dateStarted = new Date().toISOString();
      Pip.addScore(5);
    }
    if (status === 'complete') {
      step.dateCompleted = new Date().toISOString();
      Pip.addScore(20);
      Pip.celebrate();
      Pip.showNote(Pip.getResponse('step', step.step));
    }
    if (status === 'not_started') {
      step.dateStarted = null;
      step.dateCompleted = null;
    }

    Storage.saveSteps(this.data);
    this.render();

    // Step 12 complete → offer promises retake
    if (status === 'complete' && step.step === 12 && typeof Promises !== 'undefined') {
      setTimeout(() => Promises.offerEndAssessment(), 1500);
    }
  },

  openNotes(index) {
    const step = this.data[index];
    const body = `
      <label class="field-label">Notes on Step ${step.step}
        <textarea id="step-notes" class="input-field" rows="6" placeholder="Anything you want to remember">${this.esc(step.notes)}</textarea>
      </label>
    `;
    const footer = `
      <button class="btn-secondary" onclick="App.closeModal()">Cancel</button>
      <button class="btn-primary btn-small" onclick="Steps.saveNotes(${index})">Save</button>
    `;
    App.openModal(`Step ${step.step} notes`, body, footer);
  },

  saveNotes(index) {
    this.data[index].notes = document.getElementById('step-notes').value;
    Storage.saveSteps(this.data);
    App.closeModal();
  },

  esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
