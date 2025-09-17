import { useEffect, useState } from 'react';
import Card from '@/components/Card';

const STAGES = ['Applied', 'Interview', 'Offer', 'Joined'];

export default function ProgressTracker() {
  const [status, setStatus] = useState('Applied');
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    fetch('/api/progress').then(r=>r.json()).then((d)=>{
      setTimeline(d.timeline || []);
      setStatus(d.current || 'Applied');
    });
  }, []);

  async function update(next) {
    setStatus(next);
    await fetch('/api/progress', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ current: next }) });
  }

  return (
    <Card variant="glass" className="p-5 md:p-6 motion-ready overflow-hidden glass">
      <h3 className="text-h3 font-semibold mb-2">Progress</h3>
      <div className="flex flex-wrap items-center gap-2">
        {STAGES.map((s)=> {
          const active = s === status;
          return (
            <button
              key={s}
              onClick={()=>update(s)}
              className={
                `px-3 py-1 rounded-full border transition-colors ${active ? 'bg-gradient-to-r from-[#6C00FF] to-[#8B5CF6] text-white border-transparent shadow-md' : 'bg-white/70 text-textPrimary hover:bg-white'}`
              }
            >
              {s}
            </button>
          );
        })}
      </div>
      <ul className="mt-3 text-sm text-textSecondary list-disc pl-5 max-h-40 overflow-auto">
        {timeline.map((t)=> (<li key={t.date + t.stage}>{t.date}: {t.stage}</li>))}
      </ul>
    </Card>
  );
}
