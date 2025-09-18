export async function login({ email, password, psid }) {
  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, psid })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Invalid credentials');
  }
  const data = await res.json();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('auth', JSON.stringify({ token: data.access_token, user: data.user }));
  }
  return data;
}

export function getAuth() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem('auth');
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  if (typeof window !== 'undefined') window.localStorage.removeItem('auth');
}

export function isLoggedIn(){
  return !!getAuth();
}
