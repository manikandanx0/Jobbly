export async function login({ email, password }) {
  // Placeholder: replace with real auth provider
  if (email && password) { return { token: 'mock-token', user: { email } }; }
  throw new Error('Invalid credentials');
}

export async function requireAuth(ctx) {
  // Example server-side guard placeholder
  return { user: { email: 'recruiter@example.com' } };
}
