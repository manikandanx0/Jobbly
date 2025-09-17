// Mock semantic embedding: converts text to a normalized token frequency vector length.
export function embed(text) {
  if (!text) return 0;
  const tokens = String(text).toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean);
  return tokens.length ** 0.5; // simple mock signal
}

export function scoreMatch(query, item) {
  // Rule-based weighting: skills, location, recency (newer postedAt is better)
  const q = String(query || '').toLowerCase();
  let score = 0;
  if (item.skills) { score += item.skills.filter(s=>q.includes(s.toLowerCase())).length * 2; }
  if (item.location && q.includes(item.location.toLowerCase())) score += 1.5;
  if (item.postedAt) {
    const days = Math.max(1, (Date.now() - new Date(item.postedAt).getTime()) / 86400000);
    score += 5 / days;
  }
  score += 0.3 * embed(item.title + ' ' + (item.company || ''));
  return score;
}
