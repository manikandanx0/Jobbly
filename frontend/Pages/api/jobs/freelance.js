import { listFreelanceJobs, addFreelanceJob } from '@/utils/dataStore';

export default function handler(req, res){
  if (req.method === 'GET'){
    return res.status(200).json({ items: listFreelanceJobs() });
  }
  if (req.method === 'POST'){
    const { title, budgetType, budgetMin, budgetMax, location, skills = [], description = '' } = req.body || {};
    if (!title || !budgetType) return res.status(400).json({ error: 'title and budgetType required' });
    const created = addFreelanceJob({ title, budgetType, budgetMin, budgetMax, location, skills, description });
    return res.status(201).json({ item: created });
  }
  res.setHeader('Allow', ['GET','POST']);
  return res.status(405).end('Method Not Allowed');
}
