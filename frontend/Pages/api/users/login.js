import { setAuthCookie } from '@/utils/serverAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

    const base = process.env.API_BASE || 'http://localhost:5000';
    const r = await fetch(`${base}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json(data);

    // Set HTTP-only auth cookie for middleware/SSR
    if (data?.access_token) {
      setAuthCookie(res, data.access_token, data.user || null);
    }
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
}


