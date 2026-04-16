/* community.js — Phone list, Google Sheets import, meetings, streaks, resources */
const Community = {
  contacts: null,
  meetings: null,

  init() {
    this.contacts = Storage.getContacts();
    this.meetings = Storage.getMeetings();

    document.getElementById('btn-add-contact').addEventListener('click', () => this.openContactEditor(null, true));
    document.getElementById('btn-import-sheets').addEventListener('click', () => this.openImportModal());
    document.getElementById('btn-add-meeting').addEventListener('click', () => this.openMeetingEditor(null, true));
    document.getElementById('contact-search').addEventListener('input', () => this.renderContacts());
    document.getElementById('contact-filter').addEventListener('change', () => this.renderContacts());

    const callToday = document.getElementById('btn-called-today');
    if (callToday) callToday.addEventListener('click', () => this.logSponsorCheckin());

    this.renderContacts();
    this.renderMeetings();
    this.renderSponsorCheckin();
    this.renderMeetingStreak();
  },

  uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  /* ═══ SPONSOR CHECK-IN STREAK ═══ */
  computeStreak(dates) {
    if (!dates || !dates.length) return { current: 0, last: null };
    const sorted = [...dates].sort().reverse();
    const last = sorted[0];
    let current = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const lastDate = new Date(last); lastDate.setHours(0,0,0,0);
    // Only count if last date is today or yesterday
    if (lastDate.getTime() !== today.getTime() && lastDate.getTime() !== yesterday.getTime()) {
      return { current: 0, last };
    }
    // Count consecutive days backward
    let cursor = new Date(lastDate);
    const dateSet = new Set(sorted.map(d => d));
    while (dateSet.has(cursor.toISOString().split('T')[0])) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return { current, last };
  },

  logSponsorCheckin() {
    Storage.addSponsorCheckin();
    Pip.addScore(2);
    this.renderSponsorCheckin();
  },

  renderSponsorCheckin() {
    const section = document.getElementById('sponsor-checkin-section');
    if (!section) return;

    const settings = Storage.getSettings();
    const dates = Storage.getSponsorCheckins();
    const { current, last } = this.computeStreak(dates);
    const today = new Date().toISOString().split('T')[0];
    const calledToday = last === today;

    if (!settings.sponsorName && !settings.sponsorPhone) {
      section.innerHTML = `
        <p class="text-secondary">Add a sponsor or support person in the Me tab and this tracker will show up here.</p>
      `;
      return;
    }

    section.innerHTML = `
      <div class="sponsor-checkin">
        <div class="sponsor-checkin-top">
          <div>
            <div class="sponsor-name">${this.esc(settings.sponsorName || 'Your sponsor')}</div>
            ${settings.sponsorPhone ? `<a class="sponsor-phone-link" href="tel:${this.esc(settings.sponsorPhone)}">${this.esc(settings.sponsorPhone)}</a>` : ''}
          </div>
          <button id="btn-called-today" class="${calledToday ? 'btn-secondary' : 'btn-primary'} btn-small">
            ${calledToday ? 'Called today ✓' : 'Did you call today?'}
          </button>
        </div>
        <div class="streak-row">
          <div class="streak-count">
            <span class="streak-num">${current}</span>
            <span class="streak-label">day streak</span>
          </div>
          <div class="streak-last">
            ${last ? `Last call: ${new Date(last + 'T00:00').toLocaleDateString()}` : 'No calls logged yet'}
          </div>
        </div>
      </div>
    `;
    // Rebind because we replaced the button
    const btn = document.getElementById('btn-called-today');
    if (btn) btn.addEventListener('click', () => this.logSponsorCheckin());
  },

  /* ═══ MEETING STREAK ═══ */
  renderMeetingStreak() {
    const el = document.getElementById('meeting-streak');
    if (!el) return;

    const dates = this.meetings.map(m => m.date).filter(Boolean);
    const { current, last } = this.computeStreak(dates);

    if (this.meetings.length === 0) {
      el.innerHTML = '';
      return;
    }

    el.innerHTML = `
      <div class="streak-row">
        <div class="streak-count">
          <span class="streak-num">${current}</span>
          <span class="streak-label">day streak</span>
        </div>
        <div class="streak-last">
          ${last ? `Last meeting: ${new Date(last + 'T00:00').toLocaleDateString()}` : ''}
        </div>
      </div>
    `;
  },

  /* ═══ CONTACTS ═══ */
  renderContacts() {
    const container = document.getElementById('contacts-list');
    if (!container) return;
    container.innerHTML = '';

    const search = (document.getElementById('contact-search').value || '').toLowerCase();
    const filter = document.getElementById('contact-filter').value;

    let filtered = this.contacts;
    if (search) {
      filtered = filtered.filter(c =>
        (c.name || '').toLowerCase().includes(search) ||
        (c.phone || '').includes(search)
      );
    }
    if (filter) {
      filtered = filtered.filter(c => c.role === filter);
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <p>${this.contacts.length === 0 ? 'No numbers yet.' : 'Nothing matches that search.'}</p>
        <p class="text-secondary">Get phone numbers at meetings. Put them in here. Call them before you need to.</p>
      </div>`;
      return;
    }

    filtered.forEach(contact => {
      const card = document.createElement('div');
      card.className = 'contact-card';

      const roleLabels = {
        sponsor: 'Sponsor',
        support: 'Support Person',
        homegroup: 'Home Group',
        friend: 'Friend in Recovery',
        other: 'Other'
      };

      card.innerHTML = `
        <div class="contact-info" onclick="Community.openContactEditor(Community.contacts.find(c=>c.id==='${contact.id}'), false)">
          <div class="card-title">${this.esc(contact.name)}${contact.pronouns ? ` <span class="text-secondary">(${this.esc(contact.pronouns)})</span>` : ''}</div>
          <div class="contact-role">${roleLabels[contact.role] || contact.role || ''}</div>
          <div class="text-secondary">${this.esc(contact.phone || '')}</div>
        </div>
        ${contact.phone ? `<a href="tel:${this.esc(contact.phone)}" class="contact-call-btn" aria-label="Call ${this.esc(contact.name)}" onclick="event.stopPropagation()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        </a>` : ''}
      `;
      container.appendChild(card);
    });
  },

  openContactEditor(contact, isNew) {
    if (isNew) {
      contact = { id: this.uid(), name: '', pronouns: '', phone: '', role: '', isImported: false };
    }

    const roles = [
      { value: 'sponsor', label: 'Sponsor' },
      { value: 'support', label: 'Support Person' },
      { value: 'homegroup', label: 'Home Group' },
      { value: 'friend', label: 'Friend in Recovery' },
      { value: 'other', label: 'Other' }
    ];
    const roleOpts = roles.map(r => `<option value="${r.value}" ${contact.role===r.value?'selected':''}>${r.label}</option>`).join('');

    const body = `
      <label class="field-label">Name
        <input type="text" id="contact-name" class="input-field" value="${this.esc(contact.name)}" placeholder="Their name">
      </label>
      <label class="field-label">Pronouns (optional)
        <input type="text" id="contact-pronouns" class="input-field" value="${this.esc(contact.pronouns)}" placeholder="they/them, she/her, he/him">
      </label>
      <label class="field-label">Phone
        <input type="tel" id="contact-phone" class="input-field" value="${this.esc(contact.phone)}" placeholder="Phone number">
      </label>
      <label class="field-label">Role
        <select id="contact-role" class="input-field input-select">
          <option value="">Pick one</option>
          ${roleOpts}
        </select>
      </label>
      ${!isNew ? `<button class="btn-danger btn-small" style="margin-top:16px" onclick="Community.deleteContact('${contact.id}')">Delete</button>` : ''}
    `;
    const footer = `
      <button class="btn-secondary" onclick="App.closeModal()">Cancel</button>
      <button class="btn-primary btn-small" onclick="Community.saveContact('${contact.id}', ${isNew})">Save</button>
    `;
    App.openModal(isNew ? 'Add contact' : 'Edit contact', body, footer);
  },

  saveContact(id, isNew) {
    const contact = {
      id: id,
      name: document.getElementById('contact-name').value.trim(),
      pronouns: document.getElementById('contact-pronouns').value.trim(),
      phone: document.getElementById('contact-phone').value.trim(),
      role: document.getElementById('contact-role').value,
      isImported: false
    };

    if (!contact.name) return;

    if (isNew) {
      this.contacts.push(contact);
      Pip.addScore(2);
    } else {
      const idx = this.contacts.findIndex(c => c.id === id);
      if (idx >= 0) {
        contact.isImported = this.contacts[idx].isImported;
        this.contacts[idx] = contact;
      }
    }

    Storage.saveContacts(this.contacts);
    App.closeModal();
    this.renderContacts();
  },

  deleteContact(id) {
    if (!confirm('Remove this contact?')) return;
    this.contacts = this.contacts.filter(c => c.id !== id);
    Storage.saveContacts(this.contacts);
    App.closeModal();
    this.renderContacts();
  },

  /* ═══ GOOGLE SHEETS IMPORT ═══ */
  openImportModal() {
    const body = `
      <div class="guidance-box open">
        <div class="guidance-header" onclick="this.parentElement.classList.toggle('open')">
          <span>How to import</span>
          <span class="guidance-chevron">▼</span>
        </div>
        <div class="guidance-body">
          <p>1. Open your group's Google Sheet.</p>
          <p>2. Publish it to the web: File, Share, Publish to web, CSV.</p>
          <p>3. Paste the URL below.</p>
          <p>4. Columns: Name, Phone, Role.</p>
          <p>Your own contacts stay put. Only the imported ones get merged.</p>
        </div>
      </div>
      <label class="field-label">Google Sheet published URL
        <input type="url" id="sheets-url" class="input-field" placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv">
      </label>
      <div id="import-status" class="text-secondary" style="margin-top:8px;"></div>
    `;
    const footer = `
      <button class="btn-secondary" onclick="App.closeModal()">Cancel</button>
      <button class="btn-primary btn-small" id="btn-do-import" onclick="Community.doImport()">Import</button>
    `;
    App.openModal('Import from Sheets', body, footer);
  },

  async doImport() {
    const url = document.getElementById('sheets-url').value.trim();
    const status = document.getElementById('import-status');
    const btn = document.getElementById('btn-do-import');

    if (!url) {
      status.textContent = 'Paste a URL first.';
      return;
    }

    let csvUrl = url;
    if (url.includes('/spreadsheets/d/') && !url.includes('pub?output=csv')) {
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
      }
    }

    status.textContent = 'Fetching...';
    btn.disabled = true;

    try {
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error('Could not reach the sheet. Make sure it is published.');
      const text = await response.text();
      const rows = this.parseCSV(text);

      if (rows.length < 2) {
        status.textContent = 'Sheet looks empty.';
        btn.disabled = false;
        return;
      }

      const header = rows[0].map(h => h.toLowerCase().trim());
      const nameIdx = header.findIndex(h => h.includes('name'));
      const phoneIdx = header.findIndex(h => h.includes('phone') || h.includes('number'));
      const roleIdx = header.findIndex(h => h.includes('role') || h.includes('type'));

      if (nameIdx === -1) {
        status.textContent = 'Could not find a Name column.';
        btn.disabled = false;
        return;
      }

      let imported = 0;
      const existingNames = new Set(this.contacts.filter(c => c.isImported).map(c => c.name.toLowerCase()));

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const name = (row[nameIdx] || '').trim();
        if (!name) continue;
        if (existingNames.has(name.toLowerCase())) continue;

        this.contacts.push({
          id: this.uid(),
          name: name,
          pronouns: '',
          phone: (phoneIdx >= 0 ? (row[phoneIdx] || '') : '').trim(),
          role: this.mapRole(roleIdx >= 0 ? (row[roleIdx] || '') : ''),
          isImported: true
        });
        imported++;
      }

      Storage.saveContacts(this.contacts);
      if (imported > 0) Pip.addScore(2);
      status.textContent = `Got ${imported} new contact${imported !== 1 ? 's' : ''}.`;
      this.renderContacts();
    } catch (err) {
      status.textContent = 'Error: ' + err.message;
    }
    btn.disabled = false;
  },

  parseCSV(text) {
    const rows = [];
    let current = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"' && text[i + 1] === '"') {
          field += '"'; i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          field += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          current.push(field); field = '';
        } else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
          current.push(field); field = '';
          rows.push(current); current = [];
          if (ch === '\r') i++;
        } else {
          field += ch;
        }
      }
    }
    if (field || current.length) { current.push(field); rows.push(current); }
    return rows;
  },

  mapRole(roleStr) {
    const r = roleStr.toLowerCase().trim();
    if (r.includes('sponsor')) return 'sponsor';
    if (r.includes('support')) return 'support';
    if (r.includes('home') || r.includes('group')) return 'homegroup';
    if (r.includes('friend')) return 'friend';
    return 'other';
  },

  /* ═══ MEETINGS ═══ */
  renderMeetings() {
    const container = document.getElementById('meetings-list');
    if (!container) return;
    container.innerHTML = '';

    const sorted = [...this.meetings].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sorted.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <p>No meetings logged yet.</p>
        <p class="text-secondary">Log them as you go. You'll forget what hit and what didn't if you don't write it down.</p>
      </div>`;
      return;
    }

    sorted.forEach(meeting => {
      const card = document.createElement('div');
      card.className = 'meeting-card';
      card.onclick = () => this.openMeetingEditor(meeting, false);
      card.innerHTML = `
        <div class="meeting-date">${new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
        <div class="meeting-name">${this.esc(meeting.groupName)}</div>
        <div class="text-secondary">${this.esc(meeting.format || '')}</div>
        ${meeting.notes ? `<div class="meeting-notes-preview">${this.esc(meeting.notes.substring(0, 100))}${meeting.notes.length > 100 ? '...' : ''}</div>` : ''}
      `;
      container.appendChild(card);
    });
  },

  openMeetingEditor(meeting, isNew) {
    if (isNew) {
      meeting = {
        id: this.uid(),
        date: new Date().toISOString().split('T')[0],
        groupName: '',
        format: '',
        notes: '',
        shared: ''
      };
    }

    const formats = ['Open', 'Closed', 'Speaker', 'Discussion', 'Big Book', 'Step Study', 'Online', 'Hybrid', 'Other'];
    const formatOpts = formats.map(f => `<option value="${f}" ${meeting.format===f?'selected':''}>${f}</option>`).join('');

    const body = `
      <label class="field-label">Date
        <input type="date" id="meeting-date" class="input-field" value="${meeting.date}">
      </label>
      <label class="field-label">Group
        <input type="text" id="meeting-group" class="input-field" value="${this.esc(meeting.groupName)}" placeholder="Name of the group">
      </label>
      <label class="field-label">Format
        <select id="meeting-format" class="input-field input-select">
          <option value="">Pick one</option>
          ${formatOpts}
        </select>
      </label>
      <label class="field-label">What hit. What stood out.
        <textarea id="meeting-notes" class="input-field" rows="4" placeholder="What you want to remember">${this.esc(meeting.notes)}</textarea>
      </label>
      <label class="field-label">What you shared or wanted to share
        <textarea id="meeting-shared" class="input-field" rows="3" placeholder="Yours">${this.esc(meeting.shared)}</textarea>
      </label>
      ${!isNew ? `<button class="btn-danger btn-small" style="margin-top:16px" onclick="Community.deleteMeeting('${meeting.id}')">Delete</button>` : ''}
    `;
    const footer = `
      <button class="btn-secondary" onclick="App.closeModal()">Cancel</button>
      <button class="btn-primary btn-small" onclick="Community.saveMeeting('${meeting.id}', ${isNew})">Save</button>
    `;
    App.openModal(isNew ? 'Log meeting' : 'Edit meeting', body, footer);
  },

  saveMeeting(id, isNew) {
    const meeting = {
      id: id,
      date: document.getElementById('meeting-date').value,
      groupName: document.getElementById('meeting-group').value.trim(),
      format: document.getElementById('meeting-format').value,
      notes: document.getElementById('meeting-notes').value.trim(),
      shared: document.getElementById('meeting-shared').value.trim()
    };

    if (isNew) {
      this.meetings.push(meeting);
      Pip.addScore(5);
    } else {
      const idx = this.meetings.findIndex(m => m.id === id);
      if (idx >= 0) this.meetings[idx] = meeting;
    }

    Storage.saveMeetings(this.meetings);
    App.closeModal();
    this.renderMeetings();
    this.renderMeetingStreak();
  },

  deleteMeeting(id) {
    if (!confirm('Remove this meeting?')) return;
    this.meetings = this.meetings.filter(m => m.id !== id);
    Storage.saveMeetings(this.meetings);
    App.closeModal();
    this.renderMeetings();
    this.renderMeetingStreak();
  },

  esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
