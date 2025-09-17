import { getRecruiter, setRecruiterVerified } from '@/utils/dataStore';

export default function handler(req, res){
  if (req.method === 'POST') {
    const { verified } = req.body || {};
    const r = setRecruiterVerified(!!verified);
    return res.status(200).json({ recruiter: r });
  }
  return res.status(200).json({ recruiter: getRecruiter() });
}





