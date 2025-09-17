import { useEffect, useState } from 'react';
import { login } from '@/utils/authStub';
import SEO from '@/components/SEO';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AuthSlider from '@/components/AuthSlider';

export default function Login(){
  const [email, setEmail] = useState('');
  const [psid, setPsid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const featureCards = [];

  async function onSubmit(e){
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password, psid });
      window.location.href = '/';
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO title="Login" />
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
            <motion.form onSubmit={onSubmit} className="p-6 space-y-4" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
              {!!error && <div className="text-sm text-red-600">{error}</div>}
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <label>PSID / Mobile No.</label>
                <input className="input mt-1" placeholder="Enter your PSID or Mobile Number" value={psid} onChange={(e)=>setPsid(e.target.value)} />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <label>Password</label>
                <input className="input mt-1" type="password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} required />
              </motion.div>
              <motion.div className="flex items-center justify-between" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <label className="inline-flex items-center gap-2 text-sm text-[#0078D4]"><input type="checkbox" className="rounded" /> Remember me</label>
                <Link href="#" className="text-sm text-[#0078D4] hover:underline">Forgot password?</Link>
              </motion.div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }} type="submit" className="w-full rounded-xl bg-[#00A9E0] text-white py-3 shadow-[0_8px_24px_rgba(0,0,0,0.2)]" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</motion.button>
              <motion.div className="text-sm text-[#0078D4] text-center" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>Don't have an account? <Link className="hover:underline" href="/auth/signup">Sign Up</Link></motion.div>
            </motion.form>
          </motion.div>
        </section>
        
      </main>
    </>
  );
}
