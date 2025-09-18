export async function login({ email, password, psid }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, psid }),
    credentials: 'include' // Include cookies for server-side auth
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Invalid credentials');
  }
  const data = await res.json();
  // Server-side cookies are now set automatically
  return data;
}

export function getAuth() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem('auth');
  return raw ? JSON.parse(raw) : null;
}

export function getAuthHeaders() {
  const auth = getAuth();
  if (!auth || !auth.token) return {};
  
  return {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
}

export async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('auth');
    window.location.href = '/auth';
  }
}

export function isLoggedIn(){
  return !!getAuth();
}

export async function signup({ email, password, name }) {
  const res = await fetch('/api/users/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Signup failed');
  }
  return await res.json();
}
