import { listInternships, addInternship, dataStore } from '@/utils/dataStore';
import { isRateLimited } from './_rateLimiter';

export default function handler(req, res) {
  const { id } = req.query || {};

  if (req.method === 'GET') {
    if (id) {
      const found = (dataStore.internships || []).find(x => x.id === id);
      return found ? res.status(200).json({ item: found }) : res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json({ items: listInternships() });
  }

  if (req.method === 'POST') {
    if (isRateLimited()) return res.status(429).json({ error: 'Too Many Requests' });
    const { title, company, location, skills = [], description = '', recruiter } = req.body || {};
    if (!title || !company) return res.status(400).json({ error: 'title and company are required' });
    
    // Get recruiter profile from localStorage (in real app, this would come from auth/session)
    let recruiterInfo = null;
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('recruiterProfile');
      if (saved) {
        const profile = JSON.parse(saved);
        recruiterInfo = {
          name: profile.name,
          username: profile.name?.toLowerCase().replace(/\s+/g, '') || 'recruiter',
          company: profile.company,
          title: profile.title
        };
      }
    }
    
    const created = addInternship({ title, company, location, skills, description, recruiter: recruiterInfo });
    return res.status(201).json({ item: created });
  }

  if (req.method === 'DELETE') {
    if (isRateLimited()) return res.status(429).json({ error: 'Too Many Requests' });
    if (!id) return res.status(400).json({ error: 'id required' });
    const idx = dataStore.internships.findIndex(x => x.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const [removed] = dataStore.internships.splice(idx, 1);
    return res.status(200).json({ item: removed });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).end('Method Not Allowed');
}
