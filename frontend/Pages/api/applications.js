import { addApplication, listApplications } from '@/utils/dataStore';

export default function handler(req, res){
  if (req.method === 'POST') {
    const { internshipId, applicant } = req.body || {};
    if (!internshipId) return res.status(400).json({ error: 'internshipId required' });
    if (!applicant?.name || !applicant?.email) return res.status(400).json({ error: 'name and email required' });
    const rec = addApplication({ internshipId, applicant });
    return res.status(201).json({ item: rec });
  }
  return res.status(200).json({ items: listApplications() });
}


