// ─── SEED DATA ───────────────────────────────────────────────────────────────
const SEED_ITEMS = [
  {
    id: 'item_001',
    type: 'lost',
    title: 'Black HP Laptop',
    description: 'HP Pavilion 15, black lid with a small scratch on the corner. Has a "CS Dept" sticker on the back.',
    category: 'electronics',
    location: 'Library, 2nd Floor',
    date: '2024-01-15',
    color: 'black',
    keywords: ['laptop', 'hp', 'computer', 'pavilion', 'black'],
    emoji: '💻',
    contactName: 'Rahul Sharma',
    contactEmail: 'rahul.s@campus.edu',
    userId: 'user_demo',
    status: 'open',
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'item_002',
    type: 'found',
    title: 'Black Laptop Found',
    description: 'Found a black laptop near the library entrance. Has some stickers on it. Kept at security desk.',
    category: 'electronics',
    location: 'Library Entrance',
    date: '2024-01-16',
    color: 'black',
    keywords: ['laptop', 'black', 'sticker', 'computer'],
    emoji: '💻',
    contactName: 'Library Staff',
    contactEmail: 'library@campus.edu',
    userId: 'user_staff1',
    status: 'open',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'item_003',
    type: 'lost',
    title: 'Blue Water Bottle',
    description: 'Hydro Flask blue 32oz water bottle with dents and stickers. Very sentimental.',
    category: 'accessories',
    location: 'Cafeteria / Food Court',
    date: '2024-01-14',
    color: 'blue',
    keywords: ['water bottle', 'hydro flask', 'blue', 'sticker'],
    emoji: '🍶',
    contactName: 'Priya Patel',
    contactEmail: 'priya.p@campus.edu',
    userId: 'user_002',
    status: 'open',
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: 'item_004',
    type: 'found',
    title: 'Water Bottle',
    description: 'Found blue Hydro Flask near the cafeteria tables. Has colorful stickers on it.',
    category: 'accessories',
    location: 'Cafeteria',
    date: '2024-01-14',
    color: 'blue',
    keywords: ['water bottle', 'flask', 'blue'],
    emoji: '🍶',
    contactName: 'Amit Kumar',
    contactEmail: 'amit.k@campus.edu',
    userId: 'user_003',
    status: 'open',
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: 'item_005',
    type: 'lost',
    title: 'Student ID Card',
    description: 'Lost my student ID card. Name: Sneha Reddy, ID: 2021CS045. Please return urgently.',
    category: 'documents',
    location: 'Engineering Block A',
    date: '2024-01-17',
    color: 'white',
    keywords: ['id card', 'student id', 'identity', 'card'],
    emoji: '🪪',
    contactName: 'Sneha Reddy',
    contactEmail: 'sneha.r@campus.edu',
    userId: 'user_004',
    status: 'open',
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: 'item_006',
    type: 'found',
    title: 'ID Card Found',
    description: 'Found a student ID card near Block A corridor. Has a girl\'s photo on it.',
    category: 'documents',
    location: 'Block A Corridor',
    date: '2024-01-17',
    color: 'white',
    keywords: ['id card', 'student', 'identity'],
    emoji: '🪪',
    contactName: 'Vijay Nair',
    contactEmail: 'vijay.n@campus.edu',
    userId: 'user_005',
    status: 'open',
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: 'item_007',
    type: 'lost',
    title: 'AirPods Pro',
    description: 'White AirPods Pro in white charging case. Left them in the gym locker area.',
    category: 'electronics',
    location: 'Campus Gym',
    date: '2024-01-13',
    color: 'white',
    keywords: ['airpods', 'earbuds', 'apple', 'white', 'earphones'],
    emoji: '🎧',
    contactName: 'Karan Singh',
    contactEmail: 'karan.s@campus.edu',
    userId: 'user_006',
    status: 'open',
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'item_008',
    type: 'found',
    title: 'Earbuds Case Found',
    description: 'Found white earbuds case in gym changing room. Looks like Apple AirPods.',
    category: 'electronics',
    location: 'Gym Locker Room',
    date: '2024-01-13',
    color: 'white',
    keywords: ['airpods', 'earbuds', 'white', 'apple', 'case'],
    emoji: '🎧',
    contactName: 'Gym Staff',
    contactEmail: 'gym@campus.edu',
    userId: 'user_gym',
    status: 'open',
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'item_009',
    type: 'lost',
    title: 'Red Umbrella',
    description: 'Large red umbrella with a curved wooden handle. Left it near the main entrance.',
    category: 'accessories',
    location: 'Main Gate / Entrance',
    date: '2024-01-12',
    color: 'red',
    keywords: ['umbrella', 'red', 'rain'],
    emoji: '☂️',
    contactName: 'Meera Joshi',
    contactEmail: 'meera.j@campus.edu',
    userId: 'user_007',
    status: 'open',
    createdAt: Date.now() - 86400000 * 6
  },
  {
    id: 'item_010',
    type: 'found',
    title: 'Umbrella Left Behind',
    description: 'Someone left a red umbrella near the security cabin at main gate.',
    category: 'accessories',
    location: 'Main Gate',
    date: '2024-01-12',
    color: 'red',
    keywords: ['umbrella', 'red'],
    emoji: '☂️',
    contactName: 'Security Guard',
    contactEmail: 'security@campus.edu',
    userId: 'user_security',
    status: 'open',
    createdAt: Date.now() - 86400000 * 6
  }
];

const SEED_USERS = {
  'user_demo': { id: 'user_demo', name: 'Demo User', email: 'demo@campus.edu', avatar: 'D', joinedAt: Date.now() - 86400000 * 30 }
};

// ─── DATA STORE ──────────────────────────────────────────────────────────────
const Store = {
  init() {
    if (!localStorage.getItem('lf_seeded')) {
      localStorage.setItem('lf_items', JSON.stringify(SEED_ITEMS));
      localStorage.setItem('lf_users', JSON.stringify(SEED_USERS));
      localStorage.setItem('lf_seeded', '1');
    }
  },

  getItems() {
    return JSON.parse(localStorage.getItem('lf_items') || '[]');
  },

  saveItems(items) {
    localStorage.setItem('lf_items', JSON.stringify(items));
  },

  addItem(item) {
    const items = this.getItems();
    items.unshift(item);
    this.saveItems(items);
    return item;
  },

  getItemById(id) {
    return this.getItems().find(i => i.id === id);
  },

  updateItem(id, updates) {
    const items = this.getItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      this.saveItems(items);
      return items[idx];
    }
    return null;
  },

  deleteItem(id) {
    const items = this.getItems().filter(i => i.id !== id);
    this.saveItems(items);
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('lf_currentUser') || 'null');
  },

  setCurrentUser(user) {
    localStorage.setItem('lf_currentUser', JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('lf_currentUser');
  },

  getUsers() {
    return JSON.parse(localStorage.getItem('lf_users') || '{}');
  },

  saveUser(user) {
    const users = this.getUsers();
    users[user.id] = user;
    localStorage.setItem('lf_users', JSON.stringify(users));
  }
};
