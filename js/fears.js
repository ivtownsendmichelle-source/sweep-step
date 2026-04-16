/* fears.js — Fear inventory with chaining */
const Fears = {
  data: null,

  init() {
    this.data = Storage.getFears();
    document.getElementById('btn-add-fear').addEventListener('click', () => this.openAddModal());
    this.render();
  },

  uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  collectAutoFears() {
    // Pull fears from Column 3 and Column 4 of inventory
    const inv = Storage.getInventory();
    const fears = [];
    const areas = ['selfEsteem','pride','ambition','security','personalRelations','sexRelations','pocketBook'];

    inv.forEach(entry => {
      entry.causes.forEach(cause => {
        areas.forEach(area => {
          if (cause[area] && cause[area].fear && cause[area].fear.trim()) {
            fears.push({
              id: 'auto_' + entry.id + '_' + cause.id + '_' + area,
              text: cause[area].fear.trim(),
              source: `Resentment toward ${entry.person}, cause ${cause.id.toUpperCase()}, ${Fears.areaLabel(area)}`,
              auto: true
            });
          }
        });
      });
      if (entry.column4 && entry.column4.afraid && entry.column4.afraid.trim()) {
        fears.push({
          id: 'auto_col4_' + entry.id,
          text: entry.column4.afraid.trim(),
          source: `Resentment toward ${entry.person}, Column 4`,
          auto: true
        });
      }
    });
    return fears;
  },

  areaLabel(key) {
    const labels = {
      selfEsteem: 'Self Esteem',
      pride: 'Pride',
      ambition: 'Ambition',
      security: 'Security',
      personalRelations: 'Personal Relations',
      sexRelations: 'Sex Relations',
      pocketBook: 'Pocket Book'
    };
    return labels[key] || key;
  },

  getAllFears() {
    const auto = this.collectAutoFears();
    const manual = this.data.manual || [];
    return [...auto, ...manual];
  },

  render() {
    const container = document.getElementById('fears-list');
    if (!container) return;
    container.innerHTML = '';

    const allFears = this.getAllFears();
    if (allFears.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <p>Nothing here yet.</p>
        <p class="text-secondary">Fears land here automatically as you fill in your inventory. Or add one by hand.</p>
      </div>`;
      return;
    }

    allFears.forEach(fear => {
      const card = document.createElement('div');
      card.className = 'inventory-card';
      const chains = this.data.chains[fear.id] || [];
      const chainCount = chains.length;

      card.innerHTML = `
        <div class="card-top" onclick="Fears.openChainModal('${fear.id}')">
          <div class="card-title">${this.esc(fear.text)}</div>
          <div class="card-meta">${fear.source || 'Manual entry'}${chainCount ? ` — ${chainCount} chain link${chainCount>1?'s':''}` : ''}</div>
        </div>
        ${!fear.auto ? `<button class="btn-small btn-danger" onclick="event.stopPropagation();Fears.delete('${fear.id}')">Delete</button>` : ''}
      `;
      container.appendChild(card);
    });
  },

  openAddModal() {
    const body = `
      <label class="field-label">What are you afraid of
        <textarea id="fear-text" class="input-field" rows="3" placeholder="Write it plainly"></textarea>
      </label>
    `;
    const footer = `
      <button class="btn-secondary" onclick="App.closeModal()">Cancel</button>
      <button class="btn-primary btn-small" onclick="Fears.saveNew()">Save</button>
    `;
    App.openModal('Add a fear', body, footer);
  },

  saveNew() {
    const text = document.getElementById('fear-text').value.trim();
    if (!text) return;

    if (!this.data.manual) this.data.manual = [];
    this.data.manual.push({
      id: this.uid(),
      text: text,
      source: 'Manual entry',
      auto: false
    });
    Storage.saveFears(this.data);
    Pip.addScore(3);
    Pip.showNote(Pip.getResponse('fear'));
    App.closeModal();
    this.render();
  },

  delete(id) {
    if (!confirm('Remove this fear?')) return;
    this.data.manual = (this.data.manual || []).filter(f => f.id !== id);
    delete this.data.chains[id];
    Storage.saveFears(this.data);
    this.render();
  },

  openChainModal(fearId) {
    const allFears = this.getAllFears();
    const fear = allFears.find(f => f.id === fearId);
    if (!fear) return;

    if (!this.data.chains) this.data.chains = {};
    const chains = this.data.chains[fearId] || [];

    let chainHTML = '';
    chains.forEach((link, i) => {
      const indent = Math.min(i * 16, 80);
      chainHTML += `
        <div class="fear-chain-link" style="margin-left:${indent}px">
          <div class="column-label">Why? (Level ${i + 1})</div>
          <textarea class="input-field fear-chain-input" data-index="${i}" rows="2">${this.esc(link)}</textarea>
        </div>
        <div class="fear-chain-arrow" style="margin-left:${indent + 10}px">↓</div>
      `;
    });

    const body = `
      <div class="guidance-box">
        <div class="guidance-header" onclick="this.parentElement.classList.toggle('open')">
          <span>How this works</span>
          <span class="guidance-chevron">▼</span>
        </div>
        <div class="guidance-body">
          <p>Start with the fear. Ask yourself why. Write the answer. Then ask why again. Keep going. Your fears will land on a small number of roots. Usually the same few.</p>
        </div>
      </div>
      <div class="realization-box">
        <strong>Fear:</strong> ${this.esc(fear.text)}
      </div>
      <div class="fear-chain" id="fear-chain-container">
        ${chainHTML}
      </div>
      <button class="btn-secondary btn-small" onclick="Fears.addChainLink('${fearId}')">+ Ask why again</button>
      <div style="margin-top:20px">
        <label class="field-label">What has this fear cost you
          <textarea id="fear-harm-input" class="input-field" rows="3" placeholder="What it has cost you and the people around you">${this.esc((this.data.chainHarms && this.data.chainHarms[fearId]) || '')}</textarea>
        </label>
      </div>
    `;
    const footer = `
      <button class="btn-secondary" onclick="App.closeModal()">Cancel</button>
      <button class="btn-primary btn-small" onclick="Fears.saveChain('${fearId}')">Save</button>
    `;
    App.openModal('Fear Chain', body, footer);
  },

  addChainLink(fearId) {
    if (!this.data.chains) this.data.chains = {};
    if (!this.data.chains[fearId]) this.data.chains[fearId] = [];

    // Save current inputs first
    document.querySelectorAll('.fear-chain-input').forEach(input => {
      const idx = parseInt(input.dataset.index);
      this.data.chains[fearId][idx] = input.value;
    });

    this.data.chains[fearId].push('');
    Storage.saveFears(this.data);
    // Re-open to refresh
    this.openChainModal(fearId);
  },

  saveChain(fearId) {
    if (!this.data.chains) this.data.chains = {};
    if (!this.data.chains[fearId]) this.data.chains[fearId] = [];
    if (!this.data.chainHarms) this.data.chainHarms = {};

    document.querySelectorAll('.fear-chain-input').forEach(input => {
      const idx = parseInt(input.dataset.index);
      this.data.chains[fearId][idx] = input.value;
    });

    // Remove empty trailing links
    while (this.data.chains[fearId].length && !this.data.chains[fearId][this.data.chains[fearId].length - 1].trim()) {
      this.data.chains[fearId].pop();
    }

    const harmInput = document.getElementById('fear-harm-input');
    if (harmInput) {
      this.data.chainHarms[fearId] = harmInput.value;
    }

    Storage.saveFears(this.data);
    Pip.addScore(5);
    Pip.showNote(Pip.getResponse('fear'));
    App.closeModal();
    this.render();
  },

  // Get all harms from fear chains
  getAllHarms() {
    const harms = [];
    if (!this.data.chainHarms) return harms;
    const allFears = this.getAllFears();
    for (const [fearId, harm] of Object.entries(this.data.chainHarms)) {
      if (harm.trim()) {
        const fear = allFears.find(f => f.id === fearId);
        harms.push({
          person: 'Self and others',
          harm: harm.trim(),
          source: `Fear: ${fear ? fear.text : 'Unknown'}`
        });
      }
    }
    return harms;
  },

  esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
