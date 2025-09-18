import { clearAuthCookie } from '@/utils/serverAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear the authentication cookie
  clearAuthCookie(res);

  return res.status(200).json({ message: 'Logged out successfully' });
}


