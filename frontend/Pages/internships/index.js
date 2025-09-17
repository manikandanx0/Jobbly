import { useEffect, useState } from 'react';
import InternshipCard from '@/components/InternshipCard';

export default function Internships(){
  const [items, setItems] = useState([]);
  useEffect(()=>{ fetch('/api/internships').then(r=>r.json()).then((d)=>setItems(d.items||[])); }, []);
  return (
    <main className="max-w-5xl mx-auto p-4 space-y-3">
      <h1 className="text-h1 font-semibold">Internships</h1>
      {items.map((i)=> (<InternshipCard key={i.id} item={i} />))}
    </main>
  );
}
