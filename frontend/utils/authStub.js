export async function login({ email, password }) {
  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
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
    document.cookie = 'auth_token=; Max-Age=0; Path=/;';
    window.location.href = '/auth/talent';
  }
}

export function isLoggedIn(){
  return !!getAuth();
}

export async function signup({ email, password, name, role }) {
  const res = await fetch('/api/users/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Signup failed');
  }
  return await res.json();
}
