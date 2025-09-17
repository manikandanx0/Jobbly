import { freelancers } from '@/utils/mockData';
export default function handler(req, res){ res.status(200).json({ items: freelancers }); }
