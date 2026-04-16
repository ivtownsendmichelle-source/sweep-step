/* patterns.js — Cross-section pattern detection and display */
const Patterns = {

  init() {
    // No init-time bindings needed. Rendered on demand when nav opens Patterns.
  },

  /* Total inventory-related entries (used for empty state threshold) */
  _totalEntries() {
    const inv = Storage.getInventory().length;
    const sx = Storage.getSexInventory().length;
    const fears = (Storage.getFears().manual || []).length;
    const harms = Storage.getHarms().length;
    return inv + sx + fears + harms;
  },

  /* People Map — unique name → which categories they show up in */
  _buildPeopleMap() {
    const map = {};

    const add = (name, category) => {
      if (!name) return;
      const key = name.trim().toLowerCase();
      if (!key) return;
      if (!map[key]) map[key] = { display: name.trim(), categories: new Set() };
      map[key].categories.add(category);
    };

    // Resentments — person field
    Storage.getInventory().forEach(entry => {
      add(entry.person, 'resentment');
    });

    // Fears — pull from inventory Column 3 fears and Column 4 afraid
    // We key fears by the person in the parent resentment
    Storage.getInventory().forEach(entry => {
      const areas = ['selfEsteem','pride','ambition','security','personalRelations','sexRelations','pocketBook'];
      const hasAnyFear = entry.causes.some(c =>
        areas.some(a => c[a] && c[a].fear && c[a].fear.trim())
      ) || (entry.column4 && entry.column4.afraid && entry.column4.afraid.trim());
      if (hasAnyFear) add(entry.person, 'fear');
    });

    // Harms — from Column 4 + sex inventory + manual
    Storage.getInventory().forEach(entry => {
      if (entry.column4 && entry.column4.harm && entry.column4.harm.trim()) {
        add(entry.person, 'harm');
      }
    });
    Storage.getSexInventory().forEach(e => {
      if (e.harm && e.harm.trim()) add(e.name, 'harm');
    });
    Storage.getHarms().forEach(h => add(h.person, 'harm'));

    // Convert to array
    return Object.values(map).map(v => ({
      name: v.display,
      categories: Array.from(v.categories)
    }));
  },

  /* Life Areas — frequency counts from Column 3 */
  _buildLifeAreas() {
    const keys = [
      { key: 'selfEsteem', label: 'Self Esteem' },
      { key: 'pride', label: 'Pride' },
      { key: 'ambition', label: 'Ambition' },
      { key: 'security', label: 'Security' },
      { key: 'personalRelations', label: 'Personal Relationships' },
      { key: 'sexRelations', label: 'Sex and Relationships' },
      { key: 'pocketBook', label: 'Money and Security' }
    ];
    const counts = keys.map(k => ({ key: k.key, label: k.label, count: 0 }));

    Storage.getInventory().forEach(entry => {
      entry.causes.forEach(cause => {
        counts.forEach((c, i) => {
          const a = cause[c.key];
          if (a && (a.statement?.trim() || a.fear?.trim())) counts[i].count++;
        });
      });
    });

    return counts.sort((a, b) => b.count - a.count);
  },

  /* Column 4 aggregate counts */
  _buildColumn4Counts() {
    const fields = [
      { key: 'selfSeeking', label: 'Self-Seeking' },
      { key: 'selfish', label: 'Selfish' },
      { key: 'dishonest', label: 'Dishonest' },
      { key: 'afraid', label: 'Afraid' },
      { key: 'harm', label: 'Harm' }
    ];
    const counts = fields.map(f => ({ ...f, count: 0 }));

    Storage.getInventory().forEach(entry => {
      if (!entry.column4) return;
      counts.forEach((c, i) => {
        if (entry.column4[c.key] && entry.column4[c.key].trim()) counts[i].count++;
      });
    });

    return counts.sort((a, b) => b.count - a.count);
  },

  /* Check for new crossover patterns (name in 2+ categories) and flag first sighting */
  _checkNewCrossovers(people) {
    const crossovers = people.filter(p => p.categories.length >= 2).map(p => p.name.toLowerCase());
    const seen = Storage.getPatternsSeen();
    const newOnes = crossovers.filter(n => !seen.includes(n));
    if (newOnes.length > 0) {
      Storage.savePatternsSeen([...seen, ...newOnes]);
      // Tell Pip the first time we spot a crossover
      if (typeof Pip !== 'undefined' && Pip.showNote) {
        Pip.showNote("A name keeps showing up. Worth a look.");
      }
    }
  },

  render() {
    const container = document.getElementById('patterns-content');
    if (!container) return;

    const total = this._totalEntries();
    if (total < 3) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Your patterns show up here as you build your inventory.</p>
          <p class="text-secondary">Keep going. There is no rush and no wrong answer.</p>
        </div>
      `;
      return;
    }

    const people = this._buildPeopleMap();
    this._checkNewCrossovers(people);
    const crossovers = people.filter(p => p.categories.length >= 2);
    const singles = people.filter(p => p.categories.length < 2);
    const lifeAreas = this._buildLifeAreas();
    const col4 = this._buildColumn4Counts();
    const maxArea = Math.max(1, ...lifeAreas.map(a => a.count));

    let html = '';

    /* SECTION 1: People Map */
    html += `<div class="patterns-section">
      <h3 class="patterns-section-title">People, Places, Things</h3>`;

    if (crossovers.length > 0) {
      html += `<div class="patterns-crossover">
        <div class="patterns-crossover-heading">These keep showing up.</div>
        <p class="text-secondary" style="margin-bottom:12px;">When the same name shows up in multiple places, that's worth looking at.</p>`;
      crossovers.forEach(p => {
        html += this._renderPersonRow(p, true);
      });
      html += `</div>`;
    }

    if (singles.length > 0) {
      html += `<div class="patterns-singles">`;
      singles.forEach(p => {
        html += this._renderPersonRow(p, false);
      });
      html += `</div>`;
    }

    if (people.length === 0) {
      html += `<p class="text-secondary">No names yet. As you fill in resentments and harms, people will land here.</p>`;
    }

    html += `</div>`;

    /* SECTION 2: Life Areas */
    html += `<div class="patterns-section">
      <h3 class="patterns-section-title">Life Areas</h3>
      <p class="text-secondary" style="margin-bottom:12px;">Where your stuff keeps landing.</p>`;
    lifeAreas.forEach(a => {
      const pct = Math.round((a.count / maxArea) * 100);
      html += `
        <div class="patterns-bar-row">
          <div class="patterns-bar-label">${this.esc(a.label)}</div>
          <div class="patterns-bar-track">
            <div class="patterns-bar-fill" style="width:${pct}%"></div>
          </div>
          <div class="patterns-bar-count">${a.count}</div>
        </div>`;
    });
    html += `</div>`;

    /* SECTION 3: Column 4 Summary */
    html += `<div class="patterns-section">
      <h3 class="patterns-section-title">What keeps coming up in your part</h3>`;
    const maxCol4 = Math.max(1, ...col4.map(c => c.count));
    col4.forEach(c => {
      const pct = Math.round((c.count / maxCol4) * 100);
      html += `
        <div class="patterns-bar-row">
          <div class="patterns-bar-label">${this.esc(c.label)}</div>
          <div class="patterns-bar-track">
            <div class="patterns-bar-fill" style="width:${pct}%"></div>
          </div>
          <div class="patterns-bar-count">${c.count}</div>
        </div>`;
    });
    html += `</div>`;

    container.innerHTML = html;
  },

  _renderPersonRow(person, isCrossover) {
    const tags = person.categories.map(cat =>
      `<span class="pattern-tag pattern-tag-${cat}">${cat}</span>`
    ).join('');
    return `
      <div class="pattern-person${isCrossover ? ' pattern-person-crossover' : ''}">
        <div class="pattern-person-name">${this.esc(person.name)}</div>
        <div class="pattern-person-tags">${tags}</div>
      </div>`;
  },

  esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
};
