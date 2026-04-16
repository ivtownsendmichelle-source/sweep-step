/* sex-inventory.js — Relationship/sex inventory */
const SexInventory = {
  data: null,

  init() {
    this.data = Storage.getSexInventory();
    document.getElementById('btn-add-sex').addEventListener('click', () => this.openEditor(null, true));
    this.render();
  },

  uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  render() {
    const container = document.getElementById('sex-inventory-list');
    if (!container) return;
    container.innerHTML = '';

    if (this.data.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <p>No relationships examined yet.</p>
        <p class="text-secondary">This is a space to honestly look at your relationships — past and present — with compassion for yourself and others.</p>
      </div>`;
      return;
    }

    this.data.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'inventory-card';
      card.innerHTML = `
        <div class="card-top" onclick="SexInventory.openEditor(SexInventory.data.find(e=>e.id==='${entry.id}'), false)">
          <div class="card-title">${this.esc(entry.name) || 'Unnamed'}</div>
          <div class="card-meta">${this.esc(entry.relationshipType || 'Relationship')}</div>
        </div>
        <button class="btn-small btn-danger" onclick="event.stopPropagation();SexInventory.delete('${entry.id}')">Delete</button>
      `;
      container.appendChild(card);
    });
  },

  openEditor(entry, isNew) {
    if (isNew) {
      entry = {
        id: this.uid(),
        name: '',
        relationshipType: '',
        history: '',
        motives: '',
        conduct: '',
        majorPoints: '',
        howEnded: '',
        selfish: '',
        dishonest: '',
        inconsiderate: '',
        whomDidIHurt: '',
        jealousy: '',
        suspicion: '',
        bitterness: '',
        atFault: '',
        whatShouldIDo: '',
        harm: '',
        createdAt: new Date().toISOString()
      };
    }

    const relationshipOptions = [
      'Romantic partner', 'Former partner', 'Spouse', 'Former spouse',
      'Dating relationship', 'Casual relationship', 'Friend with benefits',
      'Unrequited', 'Complicated', 'Other'
    ].map(opt => `<option value="${opt}" ${entry.relationshipType===opt?'selected':''}>${opt}</option>`).join('');

    const body = `
      <div class="guidance-box">
        <div class="guidance-header" onclick="this.parentElement.classList.toggle('open')">
          <span>Guidance</span>
          <span class="guidance-chevron">▼</span>
        </div>
        <div class="guidance-body">
          <p>Look at each significant relationship honestly. This is about understanding your patterns — not about blame or shame. Use gender-neutral language. Every relationship deserves the same honest examination.</p>
        </div>
      </div>

      <label class="field-label">Name
        <input type="text" id="sex-name" class="input-field" value="${this.esc(entry.name)}" placeholder="Who is this person?">
      </label>

      <label class="field-label">Relationship Type
        <select id="sex-type" class="input-field input-select">
          <option value="">Select...</option>
          ${relationshipOptions}
        </select>
      </label>

      <div class="column-section">
        <div class="column-label">History & Context</div>

        <label class="field-label">Brief history: what drew you together, how it started
          <textarea id="sex-history" class="input-field" rows="3">${this.esc(entry.history)}</textarea>
        </label>

        <label class="field-label">What were your motives in this relationship?
          <textarea id="sex-motives" class="input-field" rows="2">${this.esc(entry.motives)}</textarea>
        </label>

        <label class="field-label">How did you conduct yourself?
          <textarea id="sex-conduct" class="input-field" rows="2">${this.esc(entry.conduct)}</textarea>
        </label>

        <label class="field-label">Major points — turning moments, key events
          <textarea id="sex-major" class="input-field" rows="2">${this.esc(entry.majorPoints)}</textarea>
        </label>

        <label class="field-label">How did it end, or where is it now?
          <textarea id="sex-ended" class="input-field" rows="2">${this.esc(entry.howEnded)}</textarea>
        </label>
      </div>

      <div class="column-section">
        <div class="column-label">Honest Examination</div>

        <label class="field-label">Where was I selfish?
          <textarea id="sex-selfish" class="input-field" rows="2">${this.esc(entry.selfish)}</textarea>
        </label>

        <label class="field-label">Where was I dishonest?
          <textarea id="sex-dishonest" class="input-field" rows="2">${this.esc(entry.dishonest)}</textarea>
        </label>

        <label class="field-label">Where was I inconsiderate?
          <textarea id="sex-inconsiderate" class="input-field" rows="2">${this.esc(entry.inconsiderate)}</textarea>
        </label>

        <label class="field-label">Whom did I hurt?
          <textarea id="sex-hurt" class="input-field" rows="2">${this.esc(entry.whomDidIHurt)}</textarea>
        </label>

        <label class="field-label">Did I unjustifiably arouse jealousy?
          <textarea id="sex-jealousy" class="input-field" rows="2">${this.esc(entry.jealousy)}</textarea>
        </label>

        <label class="field-label">Did I unjustifiably arouse suspicion?
          <textarea id="sex-suspicion" class="input-field" rows="2">${this.esc(entry.suspicion)}</textarea>
        </label>

        <label class="field-label">Where was I bitter?
          <textarea id="sex-bitterness" class="input-field" rows="2">${this.esc(entry.bitterness)}</textarea>
        </label>

        <label class="field-label">Where was I at fault?
          <textarea id="sex-fault" class="input-field" rows="2">${this.esc(entry.atFault)}</textarea>
        </label>

        <label class="field-label">What should I have done instead?
          <textarea id="sex-should" class="input-field" rows="2">${this.esc(entry.whatShouldIDo)}</textarea>
        </label>
      </div>

      <div class="column-section">
        <div class="column-label">Harm</div>
        <label class="field-label">What harm did I cause in this relationship?
          <textarea id="sex-harm" class="input-field" rows="3">${this.esc(entry.harm)}</textarea>
        </label>
      </div>
    `;

    const footer = `
      <button class="btn-secondary" onclick="App.closeModal()">Cancel</button>
      <button class="btn-primary btn-small" onclick="SexInventory.save('${entry.id}', ${isNew})">Save</button>
    `;
    App.openModal(isNew ? 'New Relationship' : 'Edit Relationship', body, footer);
  },

  save(id, isNew) {
    const entry = {
      id: id,
      name: document.getElementById('sex-name').value.trim(),
      relationshipType: document.getElementById('sex-type').value,
      history: document.getElementById('sex-history').value.trim(),
      motives: document.getElementById('sex-motives').value.trim(),
      conduct: document.getElementById('sex-conduct').value.trim(),
      majorPoints: document.getElementById('sex-major').value.trim(),
      howEnded: document.getElementById('sex-ended').value.trim(),
      selfish: document.getElementById('sex-selfish').value.trim(),
      dishonest: document.getElementById('sex-dishonest').value.trim(),
      inconsiderate: document.getElementById('sex-inconsiderate').value.trim(),
      whomDidIHurt: document.getElementById('sex-hurt').value.trim(),
      jealousy: document.getElementById('sex-jealousy').value.trim(),
      suspicion: document.getElementById('sex-suspicion').value.trim(),
      bitterness: document.getElementById('sex-bitterness').value.trim(),
      atFault: document.getElementById('sex-fault').value.trim(),
      whatShouldIDo: document.getElementById('sex-should').value.trim(),
      harm: document.getElementById('sex-harm').value.trim(),
      updatedAt: new Date().toISOString()
    };

    if (isNew) {
      entry.createdAt = new Date().toISOString();
      this.data.push(entry);
    } else {
      const idx = this.data.findIndex(e => e.id === id);
      if (idx >= 0) {
        entry.createdAt = this.data[idx].createdAt;
        this.data[idx] = entry;
      }
    }

    Storage.saveSexInventory(this.data);
    Pip.addScore(10);
    App.closeModal();
    this.render();
  },

  delete(id) {
    if (!confirm('Remove this relationship entry?')) return;
    this.data = this.data.filter(e => e.id !== id);
    Storage.saveSexInventory(this.data);
    this.render();
  },

  getAllHarms() {
    return this.data
      .filter(e => e.harm && e.harm.trim())
      .map(e => ({
        person: e.name || 'Unnamed',
        harm: e.harm.trim(),
        source: 'Sex Inventory'
      }));
  },

  esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
