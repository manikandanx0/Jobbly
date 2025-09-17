import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';

export default function PortfolioIndex(){
  const [profile, setProfile] = useState({ name: '', email: '', headline: '' });
  const [portfolio, setPortfolio] = useState({ summary: '', skills: '', projects: '' });
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
  return (
    <Layout>
      <SEO title="Profile" />
      <main className="space-y-4">
        <h1 className="text-h1 font-semibold">Your Profile</h1>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-5 md:p-6 space-y-3">
            <div className="text-h3 font-semibold">Account</div>
            <input className="border p-2 rounded w-full" placeholder="Username" value={profile.name} onChange={(e)=>setProfile(p=>({...p, name: e.target.value}))} />
            <input className="border p-2 rounded w-full" placeholder="Email" value={profile.email} onChange={(e)=>setProfile(p=>({...p, email: e.target.value}))} />
            <input className="border p-2 rounded w-full" placeholder="Headline" value={profile.headline} onChange={(e)=>setProfile(p=>({...p, headline: e.target.value}))} />
          </div>
          <div className="card p-5 md:p-6 space-y-3">
            <div className="text-h3 font-semibold">Portfolio</div>
            <textarea rows={3} className="border p-2 rounded w-full" placeholder="Summary" value={portfolio.summary} onChange={(e)=>setPortfolio(p=>({...p, summary: e.target.value}))} />
            <input className="border p-2 rounded w-full" placeholder="Skills (comma separated)" value={portfolio.skills} onChange={(e)=>setPortfolio(p=>({...p, skills: e.target.value}))} />
            <textarea rows={4} className="border p-2 rounded w-full" placeholder="Projects (one per line)" value={portfolio.projects} onChange={(e)=>setPortfolio(p=>({...p, projects: e.target.value}))} />
          </div>
        </div>
        <button onClick={save} className="px-4 py-2 bg-primary text-white rounded">Save</button>
        <div className="card p-5 md:p-6">
          <div className="text-h3 font-semibold mb-2">Public Preview</div>
          <div className="font-medium">{profile.name || 'Username'}</div>
          <div className="text-sm text-textSecondary">{profile.email || 'email@example.com'}</div>
          <div className="mt-2">{portfolio.summary || 'Your summary...'}</div>
          <div className="mt-3 flex gap-2 flex-wrap">
            {(portfolio.skills || '').split(',').map(s=>s.trim()).filter(Boolean).map(s=> (
              <span key={s} className="inline-flex items-center justify-center h-7 px-3 text-xs bg-secondary text-textPrimary rounded-full">{s}</span>
            ))}
          </div>
          <ul className="mt-3 list-disc pl-5 text-sm">
            {(portfolio.projects || '').split('\n').map(p=>p.trim()).filter(Boolean).map((p,i)=> (<li key={i}>{p}</li>))}
          </ul>
        </div>
      </main>
    </Layout>
  );
}


