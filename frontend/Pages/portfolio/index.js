import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import Link from 'next/link';

export default function PortfolioIndex(){
  const [profile, setProfile] = useState({ name: '', email: '', headline: '' });
  const [portfolio, setPortfolio] = useState({ summary: '', skills: '', projects: '' });
  const publicUrl = useMemo(()=>{
    const username = (profile.name || 'user').trim().toLowerCase().replace(/\s+/g, '-');
    if (typeof window === 'undefined') return '/u/' + username;
    return `${window.location.origin}/u/${username}`;
  }, [profile.name]);
  useEffect(()=>{
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('profile');
    if (saved) setProfile(JSON.parse(saved));
    const savedP = window.localStorage.getItem('portfolio');
    if (savedP) setPortfolio(JSON.parse(savedP));
  }, []);
  function save(){
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('profile', JSON.stringify(profile));
    window.localStorage.setItem('portfolio', JSON.stringify(portfolio));
    alert('Saved');
  }
  function onUpload(e){
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      setPortfolio(p=> ({ ...p, summary: p.summary ? (p.summary + '\n' + text) : text }));
    };
    reader.readAsText(file);
  }
  function onPrint(){
    if (typeof window !== 'undefined') window.print();
  }
  return (
    <Layout>
      <SEO title="Profile" />
      <main className="space-y-6">
        <h1 className="text-h1 font-semibold">Your Profile</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass p-5 md:p-6 space-y-3 rounded-2xl border border-white/60">
            <div className="text-h3 font-semibold">Account</div>
            <input className="input" placeholder="Username" value={profile.name} onChange={(e)=>setProfile(p=>({...p, name: e.target.value}))} />
            <input className="input" placeholder="Email" value={profile.email} onChange={(e)=>setProfile(p=>({...p, email: e.target.value}))} />
            <input className="input" placeholder="Headline" value={profile.headline} onChange={(e)=>setProfile(p=>({...p, headline: e.target.value}))} />
          </div>
          <div className="glass p-5 md:p-6 space-y-3 rounded-2xl border border-white/60">
            <div className="text-h3 font-semibold">Portfolio</div>
            <textarea rows={4} className="textarea" placeholder="Summary" value={portfolio.summary} onChange={(e)=>setPortfolio(p=>({...p, summary: e.target.value}))} />
            <input className="input" placeholder="Skills (comma separated)" value={portfolio.skills} onChange={(e)=>setPortfolio(p=>({...p, skills: e.target.value}))} />
            <textarea rows={6} className="textarea" placeholder="Projects (one per line)" value={portfolio.projects} onChange={(e)=>setPortfolio(p=>({...p, projects: e.target.value}))} />
            <div className="flex items-center gap-2">
              <label className="btn-secondary cursor-pointer">
                <input type="file" className="hidden" onChange={onUpload} />
                Upload
              </label>
              <button className="btn-secondary" onClick={onPrint}>Print</button>
              <button onClick={save} className="btn-primary ml-auto">Save</button>
            </div>
          </div>
        </div>
        <div className="glass-deep rounded-2xl p-6 md:p-8 border border-white/50">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-h3 font-semibold">Public Preview</div>
            <Link href={publicUrl} className="text-sm text-primary hover:underline" target="_blank" rel="noreferrer">{publicUrl}</Link>
          </div>
          <div className="bg-white/70 dark:bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/60 shadow-md">
            <div className="font-semibold text-lg">{profile.name || 'Username'}</div>
            <div className="text-sm text-textSecondary">{profile.email || 'email@example.com'}</div>
            <div className="mt-2 text-textPrimary/90">{portfolio.summary || 'Your summary...'}</div>
            <div className="mt-3 flex gap-2 flex-wrap">
              {(portfolio.skills || '').split(',').map(s=>s.trim()).filter(Boolean).map(s=> (
                <span key={s} className="inline-flex items-center justify-center h-7 px-3 text-xs bg-white/70 text-textPrimary rounded-full border border-white/60">{s}</span>
              ))}
            </div>
            <ul className="mt-3 list-disc pl-5 text-sm text-textPrimary/90">
              {(portfolio.projects || '').split('\n').map(p=>p.trim()).filter(Boolean).map((p,i)=> (<li key={i}>{p}</li>))}
            </ul>
          </div>
        </div>
      </main>
    </Layout>
  );
}


