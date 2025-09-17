import { dataStore } from '@/utils/dataStore';
import { scoreMatch } from '@/utils/embeddingStub';
export default function handler(req, res) {
  const q = (req.query.q || '').toString();
  const ranked = dataStore.internships
    .map((it)=> {
      const reason = deriveReason(q, it);
      return { ...it, score: scoreMatch(q, it), ...(reason ? { reason } : {}) };
    })
    .sort((a,b)=> b.score - a.score);
  res.status(200).json({ items: ranked });
}
function deriveReason(q, it){
  if (!q) return '';
  const terms = q.toLowerCase();
  const hits = (it.skills||[]).filter(s=>terms.includes(s.toLowerCase()));
  if (hits.length) return 'Matches skills: ' + hits.join(', ');
  if (it.location && terms.includes(it.location.toLowerCase())) return 'Near your location';
  return '';
}
