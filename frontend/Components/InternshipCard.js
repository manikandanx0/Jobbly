import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { useState } from 'react';
import { UserIcon, MicIcon, UserOutlineIcon, MailIcon, PaperclipIcon, DocumentTextIcon } from '@/components/icons';
import Card from '@/components/Card';

export default function InternshipCard({ item }) {
  const { notify } = useToast();
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', cover: '' });
  async function apply(){
    await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ internshipId: item.id, applicant: form }) });
    notify('Applied successfully', 'success');
    setShowApply(false);
    setForm({ name: '', email: '', cover: '' });
  }
  async function toggleBookmark(){
    const r = await fetch('/api/bookmarks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ internshipId: item.id }) });
    const d = await r.json();
    notify(d.added ? 'Saved' : 'Removed', 'success');
  }
  async function share(){
    const url = location.origin + '/internships/' + item.id;
    await navigator.clipboard.writeText(url);
    notify('Link copied', 'success');
  }
  return (
    <>
    <Card variant="glass" className="p-5 md:p-6 motion-ready hover:shadow-lg transition-shadow glass">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-h3 font-semibold text-textPrimary leading-snug">
            <Link href={`/internships/${item.id}`} className="hover:underline">{item.title}</Link>
          </h3>
          <p className="mt-1 text-sm text-textSecondary truncate">{item.company} • {item.location}</p>
          {item.recruiter && (
            <div className="mt-2 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-textSecondary" />
              <Link 
                href={`/u/${item.recruiter.username || 'recruiter'}`} 
                className="text-sm text-primary hover:underline"
              >
                {item.recruiter.name || 'Recruiter'}
              </Link>
              {item.recruiter.company && (
                <span className="text-xs text-textSecondary">at {item.recruiter.company}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={share} className="btn-secondary text-sm">Share</button>
          <button onClick={toggleBookmark} className="btn-secondary text-sm">Save</button>
          <span className="text-xs bg-white/70 text-textPrimary rounded-full px-3 py-1 border border-white/60">Score: {item.score?.toFixed?.(2) ?? '—'}</span>
        </div>
      </div>
      {item.reason && (
        <div className="mt-3 text-xs text-textSecondary bg-white/60 rounded-md px-3 py-2 border border-white/50">
          {item.reason}
        </div>
      )}
      {item.description && (
        <p className="mt-3 text-sm text-textSecondary leading-relaxed">
          {item.description}
        </p>
      )}
      <div className="mt-4 pt-3 border-t border-border flex gap-2 flex-wrap">
        {item.skills?.map((s)=> (
          <span key={s} className="inline-flex items-center justify-center h-7 px-3 text-xs bg-white/70 text-textPrimary rounded-full border border-white/60">{s}</span>
        ))}
        <button onClick={()=>setShowApply(true)} className="ml-auto btn-primary">Apply</button>
      </div>
    </Card>
    {showApply && (
      <div className="fixed inset-0 z-50 p-0 md:p-4 flex items-stretch md:items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/20 backdrop-blur-xl" onClick={()=>setShowApply(false)} />
        <div className="relative rounded-2xl p-6 md:p-8 w-full md:max-w-lg md:h-auto h-full overflow-auto glass-deep">
          <h3 className="text-h3 font-semibold mb-4">Apply to {item.title}</h3>
          <div className="space-y-4">
            <div className="relative">
              <span className="input-left-icon"><UserOutlineIcon /></span>
              <input className="input pl-10" placeholder="Your name" value={form.name} onChange={(e)=>setForm(f=>({...f, name: e.target.value}))} />
              <span className="input-right-icon"><button type="button" onClick={()=>{
                if (typeof window === 'undefined') return;
                const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!Rec) return;
                const rec = new Rec();
                rec.onresult = (e)=>{ const t = e.results?.[0]?.[0]?.transcript; if (t) setForm(f=>({...f, name: t})); };
                rec.start();
              }}><MicIcon /></button></span>
            </div>
            <div className="relative">
              <span className="input-left-icon"><MailIcon /></span>
              <input className="input pl-10" placeholder="Email" value={form.email} onChange={(e)=>setForm(f=>({...f, email: e.target.value}))} />
              <span className="input-right-icon"><button type="button" onClick={()=>{
                if (typeof window === 'undefined') return;
                const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!Rec) return;
                const rec = new Rec();
                rec.onresult = (e)=>{ const t = e.results?.[0]?.[0]?.transcript; if (t) setForm(f=>({...f, email: t})); };
                rec.start();
              }}><MicIcon /></button></span>
            </div>
            <div className="relative">
              <span className="absolute left-0 -top-6 text-textSecondary"><DocumentTextIcon /></span>
              <textarea rows={6} className="textarea pl-3" placeholder="Cover letter" value={form.cover} onChange={(e)=>setForm(f=>({...f, cover: e.target.value}))} />
            </div>
            <div className="relative">
              <span className="input-left-icon"><PaperclipIcon /></span>
              <label className="input pl-10 cursor-pointer">
                <input type="file" className="hidden" multiple />
                <span className="text-textSecondary">Upload files (PDF, DOCX, ZIP)</span>
              </label>
              <span className="input-right-icon"><button type="button" onClick={()=>{
                if (typeof window === 'undefined') return;
                const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!Rec) return;
                const rec = new Rec();
                rec.onresult = (e)=>{ const t = e.results?.[0]?.[0]?.transcript; if (t) setForm(f=>({...f, cover: (f.cover ? f.cover + ' ' : '') + t})); };
                rec.start();
              }}><MicIcon /></button></span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-5">
            <button onClick={()=>setShowApply(false)} className="btn-secondary">Cancel</button>
            <button onClick={apply} className="btn-primary">Submit</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
