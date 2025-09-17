import { toggleBookmark, listBookmarks, dataStore } from '@/utils/dataStore';

export default function handler(req, res){
  if (req.method === 'POST'){
    const { internshipId } = req.body || {};
    if (!internshipId) return res.status(400).json({ error: 'internshipId required' });
    const added = toggleBookmark(internshipId);
    return res.status(200).json({ added });
  }
  const ids = listBookmarks();
  const items = dataStore.internships.filter(i => ids.includes(i.id));
  return res.status(200).json({ items });
}





