# FindIt — Smart Campus Lost & Found

A complete, production-quality web application for managing lost and found items on a university campus.

---

## 🚀 Getting Started

Just open `index.html` in any modern browser — no server or install needed!

**Demo credentials:** `demo@campus.edu` / `demo123`

---

## 📁 Project Structure

```
lost-found/
├── index.html          # All pages (SPA — single HTML file)
├── css/
│   └── styles.css      # Complete design system + responsive styles
├── js/
│   ├── data.js         # LocalStorage data layer + 10 seed items
│   ├── matcher.js      # ⭐ Matching algorithm (Jaccard, bigram, fuzzy)
│   └── app.js          # SPA router, all page controllers, auth
└── README.md
```

---

## ✨ Features

### Pages
| Page | Description |
|------|-------------|
| **Feed** | Browse all lost/found items with live search + filters |
| **Matches** | AI-matched pairs with score breakdown |
| **Report** | Form to submit a lost or found item |
| **Profile** | User dashboard with their items |
| **Auth** | Sign in / Sign up with LocalStorage persistence |

### Matching Algorithm
Located in `js/matcher.js` — the technical heart of the project.

**Scoring weights:**
- 🏷️ Category match — 30%
- 🔤 Keyword Jaccard similarity — 25%
- 📍 Location token overlap — 20%
- 🎨 Color match — 10%
- 📅 Date proximity (5-day window) — 10%
- 📝 Title bigram similarity — 5%

### Authentication
- Sign up / login with campus email
- Passwords stored as Base64 (suitable for demo)
- Session persisted in LocalStorage

---

## 🌱 Seed Data

10 pre-loaded items (5 lost / 5 found pairs) with realistic matches:
- Black HP Laptop ↔ Black Laptop Found
- Blue Hydro Flask ↔ Water Bottle  
- Student ID Card ↔ ID Card Found
- AirPods Pro ↔ Earbuds Case
- Red Umbrella ↔ Umbrella Left Behind

---

## 🎓 Demo Day Tips

1. Open the app and click "Continue as Demo User"
2. Navigate to **Matches** to show the algorithm in action
3. Report a new item to show real-time matching
4. Click any match card to view the score breakdown bars

---

## 🛠 Tech Stack

- Vanilla HTML5, CSS3, JavaScript (ES6+)
- Google Fonts: Syne + DM Sans
- LocalStorage for persistence
- Zero dependencies, zero build step
