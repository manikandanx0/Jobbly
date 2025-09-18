import { useState } from 'react';
import SEO from '@/components/SEO';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AuthSlider from '@/components/AuthSlider';

export default function Signup(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e){
    e.preventDefault();
    setError('');
    setLoading(true);
    try{
      const res = await fetch('/api/users/signup', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password, name }) });
      if (!res.ok){
        const data = await res.json().catch(()=>({}));
        throw new Error(data?.error || 'Signup failed');
      }
      window.location.href = '/auth/login';
    }catch(err){ setError(err?.message || 'Signup failed'); }
    finally{ setLoading(false); }
  }

  return (
    <>
      <SEO title="Signup" />
      <main className="min-h-screen grid md:grid-cols-2 bg-white">
        <section className="hidden md:block bg-[#00A9E0] text-white">
          <AuthSlider onBlue />
        </section>
        <section className="relative p-6 md:p-10 flex items-center justify-center w-full">
          <div className="absolute top-4 right-6 flex items-center gap-3">
            <span className="text-2xl font-semibold text-[#333333]">Jobbly</span>
            <img src="/images/logo.png" alt="Jobbly" className="h-14 w-auto rounded" />
          </div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-md rounded-lg border border-[#E0E0E0] shadow-[0_2px_10px_rgba(0,0,0,0.1)] bg-white">
            <form onSubmit={onSubmit} className="p-6 space-y-4">
              {!!error && <div className="text-sm text-red-600">{error}</div>}
              <div>
                <label>Name</label>
                <input className="input mt-1" placeholder="Your name" value={name} onChange={(e)=>setName(e.target.value)} required />
              </div>
              <div>
                <label>Email</label>
                <input className="input mt-1" type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
              </div>
              <div>
                <label>Password</label>
                <input className="input mt-1" type="password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} required />
              </div>
              <div>
                <label>Confirm Password</label>
                <input className="input mt-1" type="password" placeholder="••••••••" required />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }} type="submit" className="w-full rounded-xl bg-[#00A9E0] text-white py-3 shadow-[0_8px_24px_rgba(0,0,0,0.2)]" disabled={loading}>{loading ? 'Creating...' : 'Sign Up'}</motion.button>
              <div className="text-sm text-[#0078D4] text-center">Already have an account? <Link className="hover:underline" href="/auth/login">Login</Link></div>
            </form>
          </motion.div>
        </section>
      </main>
    </>
  );
}

 
