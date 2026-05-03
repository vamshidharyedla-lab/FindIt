// ─── MATCHING ALGORITHM ──────────────────────────────────────────────────────
// Weighted multi-factor scoring system for Lost & Found matching

const Matcher = {

  WEIGHTS: {
    category:     0.30,   // Same category = high signal
    keywords:     0.25,   // Overlapping keywords
    location:     0.20,   // Proximity of location strings
    color:        0.10,   // Same color mentioned
    date:         0.10,   // Date proximity (within ~3 days)
    titleSim:     0.05    // Title similarity
  },

  // ─── Main scoring function ─────────────────────────────────────────────────
  score(lostItem, foundItem) {
    if (lostItem.type === foundItem.type) return 0; // both same type — skip
    const lost  = lostItem.type  === 'lost'  ? lostItem  : foundItem;
    const found = lostItem.type  === 'found' ? lostItem  : foundItem;

    let total = 0;
    const breakdown = {};

    // Category
    const catScore = lost.category === found.category ? 1 : 0;
    breakdown.category = catScore;
    total += catScore * this.WEIGHTS.category;

    // Keywords (Jaccard similarity)
    const kwScore = this.jaccardSimilarity(
      lost.keywords  || [],
      found.keywords || []
    );
    breakdown.keywords = kwScore;
    total += kwScore * this.WEIGHTS.keywords;

    // Location (fuzzy string match)
    const locScore = this.stringSimilarity(
      (lost.location  || '').toLowerCase(),
      (found.location || '').toLowerCase()
    );
    breakdown.location = locScore;
    total += locScore * this.WEIGHTS.location;

    // Color
    const colorScore = lost.color && found.color &&
      lost.color.toLowerCase() === found.color.toLowerCase() ? 1 : 0;
    breakdown.color = colorScore;
    total += colorScore * this.WEIGHTS.color;

    // Date proximity (within 5 days = full score, degrades linearly)
    const dayDiff = Math.abs(
      new Date(lost.date) - new Date(found.date)
    ) / (1000 * 60 * 60 * 24);
    const dateScore = Math.max(0, 1 - dayDiff / 5);
    breakdown.date = dateScore;
    total += dateScore * this.WEIGHTS.date;

    // Title bigram similarity
    const titleScore = this.bigramSimilarity(
      (lost.title  || '').toLowerCase(),
      (found.title || '').toLowerCase()
    );
    breakdown.titleSim = titleScore;
    total += titleScore * this.WEIGHTS.titleSim;

    return {
      score: Math.round(total * 100),
      breakdown,
      lostItem: lost,
      foundItem: found
    };
  },

  // ─── Jaccard similarity for keyword sets ──────────────────────────────────
  jaccardSimilarity(setA, setB) {
    if (!setA.length || !setB.length) return 0;
    const a = new Set(setA.map(k => k.toLowerCase()));
    const b = new Set(setB.map(k => k.toLowerCase()));
    let intersection = 0;
    a.forEach(k => { if (b.has(k)) intersection++; });
    const union = new Set([...a, ...b]).size;
    return intersection / union;
  },

  // ─── Token overlap for location strings ───────────────────────────────────
  stringSimilarity(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;
    const tokA = new Set(a.split(/[\s,\/\-]+/).filter(Boolean));
    const tokB = new Set(b.split(/[\s,\/\-]+/).filter(Boolean));
    let overlap = 0;
    tokA.forEach(t => { if (tokB.has(t)) overlap++; });
    const maxLen = Math.max(tokA.size, tokB.size);
    return maxLen === 0 ? 0 : overlap / maxLen;
  },

  // ─── Bigram similarity for titles ─────────────────────────────────────────
  bigramSimilarity(a, b) {
    if (!a || !b) return 0;
    const bigrams = (s) => {
      const bg = new Set();
      for (let i = 0; i < s.length - 1; i++) bg.add(s.slice(i, i+2));
      return bg;
    };
    const bgA = bigrams(a);
    const bgB = bigrams(b);
    let shared = 0;
    bgA.forEach(bg => { if (bgB.has(bg)) shared++; });
    const total = bgA.size + bgB.size;
    return total === 0 ? 0 : (2 * shared) / total;
  },

  // ─── Find all matches above threshold ─────────────────────────────────────
  findMatches(items, threshold = 30) {
    const lostItems  = items.filter(i => i.type === 'lost'  && i.status === 'open');
    const foundItems = items.filter(i => i.type === 'found' && i.status === 'open');

    const matches = [];
    lostItems.forEach(lost => {
      foundItems.forEach(found => {
        const result = this.score(lost, found);
        if (result.score >= threshold) {
          matches.push(result);
        }
      });
    });

    // Sort descending by score
    matches.sort((a, b) => b.score - a.score);

    // Deduplicate: keep best match per item
    const seen = new Set();
    return matches.filter(m => {
      const key = `${m.lostItem.id}_${m.foundItem.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },

  // ─── Find matches for a specific item ────────────────────────────────────
  findMatchesForItem(item, allItems, threshold = 25) {
    const counterType = item.type === 'lost' ? 'found' : 'lost';
    const candidates  = allItems.filter(i => i.type === counterType && i.status === 'open' && i.id !== item.id);

    return candidates
      .map(c => this.score(item, c))
      .filter(r => r.score >= threshold)
      .sort((a, b) => b.score - a.score);
  }
};
