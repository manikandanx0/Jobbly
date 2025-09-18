import { useEffect, useState } from 'react';
import { getAuth, getAuthHeaders } from '@/utils/authStub';

export default function RoleSelect() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = typeof window !== 'undefined' ? getAuth() : null;

  useEffect(() => {
    if (!auth) {
      window.location.href = '/';
    }
  }, [auth]);

  async function setRole(role) {
    setError('');
    setLoading(true);
    try {
      // Update role in backend
      const headers = getAuthHeaders();
      const userId = auth?.user?.id;
      if (!userId) throw new Error('Not authenticated');
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to set role');
      }
      // Redirect based on role
      window.location.href = role === 'recruiter' ? '/recruiter/dashboard' : '/';
    } catch (e) {
      setError(e?.message || 'Failed to set role');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-xl text-center border border-[#E0E0E0] rounded-xl p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-[#333333] mb-2">Choose your role</h1>
        <p className="text-gray-600 mb-8">Select how you want to use Jobbly.</p>
        {!!error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">{error}</div>}
        <div className="grid md:grid-cols-2 gap-6">
          <button
            disabled={loading}
            onClick={() => setRole('talent')}
            className="p-6 rounded-xl border hover:border-[#00A9E0] hover:shadow transition text-left"
          >
            <div className="text-xl font-medium mb-2">Talent</div>
            <div className="text-gray-600">Find internships and freelance opportunities.</div>
          </button>
          <button
            disabled={loading}
            onClick={() => setRole('recruiter')}
            className="p-6 rounded-xl border hover:border-[#00A9E0] hover:shadow transition text-left"
          >
            <div className="text-xl font-medium mb-2">Recruiter</div>
            <div className="text-gray-600">Post and manage roles, review applicants.</div>
          </button>
        </div>
      </div>
    </main>
  );
}


