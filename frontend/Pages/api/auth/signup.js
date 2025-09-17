import bcrypt from 'bcryptjs';

const users = global._users || (global._users = new Map());

function isStrong(pw){
  return typeof pw === 'string' && pw.length >= 8 && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw);
}

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { username, email, password, confirmPassword } = req.body || {};
  if (!username || !email || !password || !confirmPassword) return res.status(400).json({ error: 'Missing required fields' });
  if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });
  if (!isStrong(password)) return res.status(400).json({ error: 'Password must be 8+ chars with number and special char' });
  const key = (email || username).toLowerCase();
  if (users.has(key)) return res.status(409).json({ error: 'Account already exists' });
  const hash = await bcrypt.hash(password, 10);
  users.set(key, { username, email, hash });
  return res.status(201).json({ ok: true, user: { username, email } });
}


