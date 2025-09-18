import { useState } from 'react';
import { login, signup } from '@/utils/authStub';
import { getAuthHeaders } from '@/utils/authStub';

export default function RecruitAuth(){
  const [mode, setMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e){
    e.preventDefault();
    setError('');
    setLoading(true);
    try{
      if (mode === 'signup'){
        await signup({ email, password, name });
        await login({ email, password });
        // after login, set role=recruiter
        const headers = getAuthHeaders();
        const auth = JSON.parse(localStorage.getItem('auth')||'{}');
        const userId = auth?.user?.id;
        if (userId){
          await fetch(`/api/users/${userId}`, { method: 'PUT', headers, body: JSON.stringify({ role: 'recruiter' }) });
        }
        window.location.href = '/recruiter/dashboard';
      } else {
        await login({ email, password });
        window.location.href = '/recruiter/dashboard';
      }
    }catch(err){
      setError(err?.message || 'Failed');
    }finally{
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md border rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Recruiter {mode === 'signup' ? 'Sign up' : 'Login'}</h1>
        <p className="text-gray-600 mb-4">Create an account to post internships and review applications.</p>
        {!!error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm mb-1">Full name</label>
              <input className="input w-full" value={name} onChange={(e)=> setName(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="input w-full" type="email" value={email} onChange={(e)=> setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input className="input w-full" type="password" value={password} onChange={(e)=> setPassword(e.target.value)} required />
          </div>
          <button disabled={loading} className="w-full rounded-xl bg-[#00A9E0] text-white py-2">{loading ? 'Please wait...' : (mode === 'signup' ? 'Create account' : 'Login')}</button>
        </form>
        <div className="text-sm text-center mt-3">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button className="text-[#0078D4]" onClick={()=> setMode(mode === 'signup' ? 'login' : 'signup')}>
            {mode === 'signup' ? 'Login' : 'Sign up'}
          </button>
        </div>
      </div>
    </main>
  );
}


