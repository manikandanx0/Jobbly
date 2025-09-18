import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { setAuthCookie } from '@/utils/serverAuth';

// In-memory users store for demo (replace with DB)
const users = global._users || (global._users = new Map());

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { psid, email, password } = req.body || {};
  const key = (email || psid || '').toLowerCase();
  if (!key || !password) return res.status(400).json({ error: 'Missing credentials' });

  const u = users.get(key);
  if (!u) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, u.hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ sub: key }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '2h' });
  const user = { id: key, email: u.email || null, username: u.username || null };
  
  // Set HTTP-only cookie for server-side authentication
  setAuthCookie(res, token, user);
  
  return res.status(200).json({ access_token: token, user });
}


