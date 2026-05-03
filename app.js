// ─── APP CONTROLLER ──────────────────────────────────────────────────────────

const App = {
  currentPage: 'feed',
  currentFilter: { type: 'all', category: 'all', search: '' },
  selectedItem: null,

  // ─── Init ─────────────────────────────────────────────────────────────────
  init() {
    Store.init();
    this.bindNavigation();
    this.renderNavUser();
    this.navigate('feed');
    this.updateStats();
  },

  // ─── Navigation ───────────────────────────────────────────────────────────
  bindNavigation() {
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(el.dataset.nav);
      });
    });
  },

  navigate(page) {
    const user = Store.getCurrentUser();
    if ((page === 'profile' || page === 'report') && !user) {
      this.navigate('auth');
      return;
    }

    this.currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.classList.toggle('active', el.dataset.nav === page);
    });

    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');

    switch (page) {
      case 'feed':    this.renderFeed(); break;
      case 'matches': this.renderMatches(); break;
      case 'report':  this.renderReport(); break;
      case 'profile': this.renderProfile(); break;
      case 'auth':    this.renderAuth(); break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderNavUser() {
    const user = Store.getCurrentUser();
    const authBtn = document.getElementById('nav-auth-btn');
    const userBtn = document.getElementById('nav-user-btn');
    if (user) {
      if (authBtn) authBtn.style.display = 'none';
      if (userBtn) { userBtn.style.display = 'flex'; userBtn.textContent = user.avatar || user.name[0]; }
    } else {
      if (authBtn) authBtn.style.display = '';
      if (userBtn) userBtn.style.display = 'none';
    }
  },

  // ─── Update hero stats ────────────────────────────────────────────────────
  updateStats() {
    const items = Store.getItems();
    const lost  = items.filter(i => i.type === 'lost').length;
    const found = items.filter(i => i.type === 'found').length;
    const matches = Matcher.findMatches(items).length;

    const el = (id) => document.getElementById(id);
    if (el('stat-lost'))    el('stat-lost').textContent    = lost;
    if (el('stat-found'))   el('stat-found').textContent   = found;
    if (el('stat-matches')) el('stat-matches').textContent = matches;
  },

  // ─── FEED PAGE ────────────────────────────────────────────────────────────
  renderFeed() {
    const container = document.getElementById('feed-grid');
    if (!container) return;

    let items = Store.getItems();

    // Apply filters
    const f = this.currentFilter;
    if (f.type !== 'all')     items = items.filter(i => i.type === f.type);
    if (f.category !== 'all') items = items.filter(i => i.category === f.category);
    if (f.search) {
      const q = f.search.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
      );
    }

    document.getElementById('feed-count').textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">🔍</div>
          <h3>No items found</h3>
          <p>Try adjusting your filters or <a href="#" onclick="App.navigate('report')" style="color:var(--accent)">report an item</a></p>
        </div>`;
      return;
    }

    container.innerHTML = items.map((item, i) => this.renderItemCard(item, i)).join('');
  },

  renderItemCard(item, delay = 0) {
    const daysAgo = Math.floor((Date.now() - item.createdAt) / 86400000);
    const timeStr = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;
    const matches = Matcher.findMatchesForItem(item, Store.getItems());
    const topMatch = matches[0];

    return `
      <div class="item-card" onclick="App.openItemDetail('${item.id}')"
           style="animation-delay:${delay * 0.05}s">
        <div class="item-card-image">
          <span>${item.emoji || '📦'}</span>
          <span class="item-type-badge badge-${item.type}">${item.type}</span>
          ${topMatch ? `<span class="item-match-score">🔗 ${topMatch.score}%</span>` : ''}
        </div>
        <div class="item-card-body">
          <div class="item-card-title">${item.title}</div>
          <div class="item-card-desc">${item.description}</div>
          <div class="item-card-meta">
            <span class="location">📍 ${item.location}</span>
            <span>${timeStr}</span>
          </div>
        </div>
        <div class="item-card-footer">
          <button class="btn btn-ghost btn-sm" style="flex:1"
            onclick="event.stopPropagation(); App.openItemDetail('${item.id}')">
            View Details
          </button>
          ${topMatch ? `
            <button class="btn btn-primary btn-sm"
              onclick="event.stopPropagation(); App.navigate('matches')">
              Matches
            </button>` : ''}
        </div>
      </div>`;
  },

  // ─── Item Detail Modal ────────────────────────────────────────────────────
  openItemDetail(id) {
    const item    = Store.getItemById(id);
    const user    = Store.getCurrentUser();
    const matches = Matcher.findMatchesForItem(item, Store.getItems());

    const modal = document.getElementById('item-detail-modal');
    const body  = document.getElementById('item-detail-body');

    const isOwner = user && user.id === item.userId;
    const daysAgo = Math.floor((Date.now() - item.createdAt) / 86400000);

    body.innerHTML = `
      <div style="text-align:center;padding:2rem 0;background:var(--surface2);margin:-1.5rem -1.5rem 1.5rem;border-radius:0">
        <div style="font-size:4rem;margin-bottom:0.5rem">${item.emoji || '📦'}</div>
        <span class="item-type-badge badge-${item.type}" style="position:static;display:inline-block">${item.type}</span>
      </div>

      <h2 style="font-family:'Syne',sans-serif;font-size:1.375rem;font-weight:700;margin-bottom:0.75rem">${item.title}</h2>
      <p style="color:var(--text-muted);line-height:1.7;margin-bottom:1.5rem">${item.description}</p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.5rem">
        <div style="background:var(--surface2);border-radius:var(--radius-sm);padding:0.75rem">
          <div style="font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.25rem">Location</div>
          <div style="font-size:0.9rem;font-weight:500">📍 ${item.location}</div>
        </div>
        <div style="background:var(--surface2);border-radius:var(--radius-sm);padding:0.75rem">
          <div style="font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.25rem">Date</div>
          <div style="font-size:0.9rem;font-weight:500">📅 ${item.date}</div>
        </div>
        <div style="background:var(--surface2);border-radius:var(--radius-sm);padding:0.75rem">
          <div style="font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.25rem">Category</div>
          <div style="font-size:0.9rem;font-weight:500">🏷️ ${item.category}</div>
        </div>
        <div style="background:var(--surface2);border-radius:var(--radius-sm);padding:0.75rem">
          <div style="font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.25rem">Reported</div>
          <div style="font-size:0.9rem;font-weight:500">⏰ ${daysAgo === 0 ? 'Today' : daysAgo + 'd ago'}</div>
        </div>
      </div>

      ${matches.length > 0 ? `
        <div style="background:rgba(108,99,255,0.08);border:1px solid rgba(108,99,255,0.2);border-radius:var(--radius-sm);padding:1rem;margin-bottom:1.5rem">
          <div style="font-weight:600;margin-bottom:0.5rem">🔗 ${matches.length} Potential Match${matches.length > 1 ? 'es' : ''} Found!</div>
          ${matches.slice(0, 2).map(m => {
            const other = item.type === 'lost' ? m.foundItem : m.lostItem;
            return `<div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface);border-radius:6px;padding:0.5rem 0.75rem;margin-top:0.5rem;cursor:pointer" onclick="App.closeModal('item-detail-modal');App.openItemDetail('${other.id}')">
              <span style="font-size:0.875rem">${other.emoji} ${other.title}</span>
              <span style="font-size:0.75rem;background:var(--accent);color:white;padding:0.15rem 0.5rem;border-radius:100px">${m.score}%</span>
            </div>`;
          }).join('')}
        </div>` : ''}

      <div style="background:var(--surface2);border-radius:var(--radius-sm);padding:1rem;margin-bottom:1.5rem">
        <div style="font-size:0.75rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.5rem">Contact</div>
        <div style="font-weight:500">${item.contactName}</div>
        <div style="font-size:0.875rem;color:var(--accent)">${item.contactEmail}</div>
      </div>

      <div style="display:flex;gap:0.5rem">
        ${user && user.id !== item.userId ? `
          <a href="mailto:${item.contactEmail}?subject=Regarding: ${encodeURIComponent(item.title)}" class="btn btn-primary" style="flex:1;justify-content:center">
            ✉️ Contact Reporter
          </a>` : ''}
        ${isOwner ? `
          <button class="btn btn-danger btn-sm" onclick="App.deleteItem('${item.id}')">Delete</button>
          <button class="btn btn-success btn-sm" onclick="App.markResolved('${item.id}')">✓ Resolved</button>` : ''}
        ${!user ? `<button class="btn btn-primary" style="flex:1" onclick="App.closeModal('item-detail-modal');App.navigate('auth')">Login to Contact</button>` : ''}
      </div>
    `;

    this.openModal('item-detail-modal');
  },

  openModal(id) {
    document.getElementById(id).classList.add('open');
  },

  closeModal(id) {
    document.getElementById(id).classList.remove('open');
  },

  // ─── MATCHES PAGE ─────────────────────────────────────────────────────────
  renderMatches() {
    const container = document.getElementById('matches-container');
    if (!container) return;

    const items   = Store.getItems();
    const matches = Matcher.findMatches(items, 25);

    document.getElementById('matches-count').textContent = `${matches.length} pair${matches.length !== 1 ? 's' : ''}`;

    if (matches.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">🔗</div>
          <h3>No matches yet</h3>
          <p>Add more lost and found items to see potential matches</p>
        </div>`;
      return;
    }

    container.innerHTML = matches.map(m => this.renderMatchCard(m)).join('');
  },

  renderMatchCard(m) {
    const scoreAngle = m.score * 3.6;
    const lost  = m.lostItem;
    const found = m.foundItem;

    const bd = m.breakdown;
    const bars = [
      { label: 'Category', val: bd.category },
      { label: 'Keywords', val: bd.keywords },
      { label: 'Location', val: bd.location },
      { label: 'Color',    val: bd.color },
      { label: 'Date',     val: bd.date },
    ];

    return `
      <div class="match-card">
        <div class="match-item" onclick="App.openItemDetail('${lost.id}')" style="cursor:pointer">
          <div class="match-item-type" style="color:var(--lost)">Lost</div>
          <div class="match-item-name">${lost.emoji} ${lost.title}</div>
          <div class="match-item-loc">📍 ${lost.location}</div>
          <div style="font-size:0.75rem;color:var(--text-dim);margin-top:0.25rem">${lost.date}</div>
        </div>

        <div class="match-center">
          <div class="match-score-circle" style="--score:${scoreAngle}">
            <span class="match-score-inner">${m.score}%</span>
          </div>
          <div class="match-label">Match</div>
          <div style="margin-top:0.75rem">
            ${bars.map(b => `
              <div style="margin-bottom:0.3rem">
                <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:var(--text-dim);margin-bottom:2px">
                  <span>${b.label}</span><span>${Math.round(b.val * 100)}%</span>
                </div>
                <div style="height:3px;background:var(--surface2);border-radius:2px">
                  <div style="height:100%;width:${b.val * 100}%;background:var(--accent);border-radius:2px;transition:width 0.5s"></div>
                </div>
              </div>`).join('')}
          </div>
        </div>

        <div class="match-item" onclick="App.openItemDetail('${found.id}')" style="cursor:pointer">
          <div class="match-item-type" style="color:var(--found)">Found</div>
          <div class="match-item-name">${found.emoji} ${found.title}</div>
          <div class="match-item-loc">📍 ${found.location}</div>
          <div style="font-size:0.75rem;color:var(--text-dim);margin-top:0.25rem">${found.date}</div>
        </div>
      </div>`;
  },

  // ─── REPORT PAGE ──────────────────────────────────────────────────────────
  renderReport() {
    const user = Store.getCurrentUser();
    if (!user) { this.navigate('auth'); return; }

    document.getElementById('report-user-name').textContent = user.name;
    document.getElementById('report-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('report-contact-name').value  = user.name;
    document.getElementById('report-contact-email').value = user.email;

    // Set active type btn
    const activeType = document.querySelector('.type-btn.active-lost, .type-btn.active-found');
    if (!activeType) {
      document.querySelector('.type-btn[data-type="lost"]').classList.add('active-lost');
    }
  },

  setReportType(type) {
    document.querySelectorAll('.type-btn').forEach(b => {
      b.classList.remove('active-lost', 'active-found');
    });
    document.querySelector(`.type-btn[data-type="${type}"]`)
      .classList.add(`active-${type}`);
  },

  submitReport() {
    const typeBtn = document.querySelector('.type-btn.active-lost, .type-btn.active-found');
    const type = typeBtn ? typeBtn.dataset.type : null;

    const title    = document.getElementById('report-title').value.trim();
    const category = document.getElementById('report-category').value;
    const desc     = document.getElementById('report-desc').value.trim();
    const location = document.getElementById('report-location').value.trim();
    const date     = document.getElementById('report-date').value;
    const color    = document.getElementById('report-color').value;
    const name     = document.getElementById('report-contact-name').value.trim();
    const email    = document.getElementById('report-contact-email').value.trim();

    if (!type || !title || !category || !desc || !location || !date || !name || !email) {
      Toast.show('Please fill in all required fields', 'error');
      return;
    }

    const user = Store.getCurrentUser();
    const emojis = { electronics: '💻', documents: '🪪', accessories: '👜', clothing: '👕', keys: '🔑', bags: '🎒', other: '📦' };

    const item = {
      id: 'item_' + Date.now(),
      type, title, category, description: desc, location, date, color,
      keywords: [...title.toLowerCase().split(/\s+/), category, color].filter(Boolean),
      emoji: emojis[category] || '📦',
      contactName: name, contactEmail: email,
      userId: user.id,
      status: 'open',
      createdAt: Date.now()
    };

    Store.addItem(item);
    Toast.show(`Item reported successfully! ${type === 'lost' ? '🔍' : '✅'}`, 'success');

    // Check for instant matches
    const allItems = Store.getItems();
    const matches  = Matcher.findMatchesForItem(item, allItems);
    if (matches.length > 0) {
      setTimeout(() => {
        Toast.show(`🔗 ${matches.length} potential match${matches.length > 1 ? 'es' : ''} found! Check the Matches tab.`, 'info');
      }, 1500);
    }

    // Reset form
    document.getElementById('report-title').value = '';
    document.getElementById('report-desc').value  = '';
    document.getElementById('report-location').value = '';
    document.getElementById('report-color').value = '';

    this.updateStats();
    this.navigate('feed');
  },

  // ─── PROFILE PAGE ─────────────────────────────────────────────────────────
  renderProfile() {
    const user = Store.getCurrentUser();
    if (!user) { this.navigate('auth'); return; }

    document.getElementById('profile-avatar').textContent = user.name[0].toUpperCase();
    document.getElementById('profile-name').textContent   = user.name;
    document.getElementById('profile-email').textContent  = user.email;

    const items = Store.getItems().filter(i => i.userId === user.id);
    const lost  = items.filter(i => i.type === 'lost');
    const found = items.filter(i => i.type === 'found');

    document.getElementById('profile-stat-lost').textContent  = lost.length;
    document.getElementById('profile-stat-found').textContent = found.length;
    document.getElementById('profile-stat-total').textContent = items.length;

    this.renderProfileItems('all');
  },

  renderProfileItems(tab) {
    document.querySelectorAll('#page-profile .tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });

    const user  = Store.getCurrentUser();
    const items = Store.getItems().filter(i => i.userId === user.id);
    const filtered = tab === 'all' ? items :
                     tab === 'lost' ? items.filter(i => i.type === 'lost') :
                     items.filter(i => i.type === 'found');

    const container = document.getElementById('profile-items');
    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="icon">📭</div><h3>No items yet</h3><p>You haven't reported any ${tab === 'all' ? '' : tab} items yet.</p></div>`;
      return;
    }
    container.innerHTML = `<div class="items-grid">${filtered.map((item, i) => this.renderItemCard(item, i)).join('')}</div>`;
  },

  // ─── AUTH PAGE ────────────────────────────────────────────────────────────
  renderAuth() {
    // Already in HTML, just ensure it's visible
    const user = Store.getCurrentUser();
    if (user) { this.navigate('profile'); }
  },

  switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.getElementById('auth-login-form').style.display  = tab === 'login'    ? 'block' : 'none';
    document.getElementById('auth-signup-form').style.display = tab === 'signup' ? 'block' : 'none';
  },

  login() {
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-password').value;

    if (!email || !pass) { Toast.show('Please fill in all fields', 'error'); return; }

    const users = Store.getUsers();
    const user  = Object.values(users).find(u => u.email === email);

    if (!user || user.password !== btoa(pass)) {
      Toast.show('Invalid email or password', 'error');
      return;
    }

    Store.setCurrentUser(user);
    this.renderNavUser();
    Toast.show(`Welcome back, ${user.name}! 👋`, 'success');
    this.navigate('feed');
  },

  signup() {
    const name  = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pass  = document.getElementById('signup-password').value;
    const dept  = document.getElementById('signup-dept').value;

    if (!name || !email || !pass || !dept) { Toast.show('Please fill in all fields', 'error'); return; }
    if (pass.length < 6) { Toast.show('Password must be at least 6 characters', 'error'); return; }

    const users = Store.getUsers();
    if (Object.values(users).find(u => u.email === email)) {
      Toast.show('Email already registered', 'error');
      return;
    }

    const user = {
      id: 'user_' + Date.now(),
      name, email, dept,
      password: btoa(pass),
      avatar: name[0].toUpperCase(),
      joinedAt: Date.now()
    };

    Store.saveUser(user);
    Store.setCurrentUser(user);
    this.renderNavUser();
    Toast.show(`Account created! Welcome, ${name}! 🎉`, 'success');
    this.navigate('feed');
  },

  logout() {
    Store.logout();
    this.renderNavUser();
    Toast.show('Logged out successfully', 'info');
    this.navigate('feed');
  },

  // ─── Item actions ─────────────────────────────────────────────────────────
  deleteItem(id) {
    if (!confirm('Delete this item?')) return;
    Store.deleteItem(id);
    this.closeModal('item-detail-modal');
    Toast.show('Item deleted', 'info');
    this.renderFeed();
    this.updateStats();
  },

  markResolved(id) {
    Store.updateItem(id, { status: 'resolved' });
    this.closeModal('item-detail-modal');
    Toast.show('Marked as resolved! 🎉', 'success');
    this.renderFeed();
    this.updateStats();
  },

  // ─── Filter helpers ───────────────────────────────────────────────────────
  setFilter(key, value) {
    this.currentFilter[key] = value;

    if (key === 'type') {
      document.querySelectorAll('.filter-chip[data-filter-type]').forEach(c => {
        c.classList.toggle('active', c.dataset.filterType === value);
        c.classList.remove('lost-chip', 'found-chip');
        if (c.dataset.filterType === 'lost')  c.classList.add('lost-chip');
        if (c.dataset.filterType === 'found') c.classList.add('found-chip');
      });
    }

    this.renderFeed();
  }
};

// ─── TOAST SYSTEM ─────────────────────────────────────────────────────────────
const Toast = {
  show(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }
};

// ─── BOOT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
