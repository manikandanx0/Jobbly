import { useEffect, useState } from 'react';

export default function Footer(){
  const [time, setTime] = useState('');
  useEffect(()=>{
    async function load(){
      try {
        const r = await fetch('/api/time');
        const d = await r.json();
        setTime(new Date(d.epoch).toLocaleString());
      } catch {}
    }
    load();
    const id = setInterval(load, 30000);
    return ()=> clearInterval(id);
  }, []);
  return (
    <footer className="w-full border-t border-border text-textSecondary">
      <div className="w-full px-4 md:px-6 lg:px-10 py-3 text-sm flex items-center justify-between">
        <span>© {new Date().getFullYear()} Jobbly</span>
        <span>Server time: {time || '—'}</span>
      </div>
    </footer>
  );
}
