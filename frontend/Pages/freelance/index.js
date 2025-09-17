import { useEffect, useMemo, useState } from 'react';
import PortfolioCard from '@/components/PortfolioCard';
import RatingCard from '@/components/RatingCard';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import Card from '@/components/Card';

export default function Freelance(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [skill, setSkill] = useState('');
  const [minPay, setMinPay] = useState(0);

  useEffect(()=>{ fetch('/api/jobs/freelance').then(r=>r.json()).then((d)=>setItems(d.items||[])).finally(()=>setLoading(false)); }, []);

  const filtered = useMemo(()=>{
    return items.filter(j => {
      const text = (j.title + ' ' + j.location + ' ' + j.worker?.skill).toLowerCase();
      const okQ = !q || text.includes(q.toLowerCase());
      const okLoc = !location || j.location.toLowerCase().includes(location.toLowerCase());
      const okSkill = !skill || (j.worker?.skill || '').toLowerCase().includes(skill.toLowerCase());
      const numericPay = Number(String(j.pay).replace(/[^0-9.]/g, '')) || 0;
      const okPay = numericPay >= minPay;
      return okQ && okLoc && okSkill && okPay;
    });
  }, [items, q, location, skill, minPay]);

  return (
    <Layout>
      <SEO title="Freelance" />
      <main className="py-2">
      <Card variant="glass" className="mb-4 grid md:grid-cols-4 gap-3">
        <input className="input" placeholder="Search..." value={q} onChange={(e)=>setQ(e.target.value)} />
        <input className="input" placeholder="Location" value={location} onChange={(e)=>setLocation(e.target.value)} />
        <input className="input" placeholder="Skill" value={skill} onChange={(e)=>setSkill(e.target.value)} />
        <div className="flex items-center gap-2">
          <input type="number" className="input" placeholder="Min Pay" value={minPay} onChange={(e)=>setMinPay(Number(e.target.value)||0)} />
          <span className="text-sm text-textSecondary">₹</span>
        </div>
      </Card>

      {loading && <Card variant="glass" className="p-4">Loading...</Card>}
      {!loading && filtered.length === 0 && <Card variant="glass" className="p-4">No jobs found.</Card>}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((j)=> (
          <div key={j.id} className="space-y-2">
            <Card variant="glass">
              <div className="font-semibold">{j.title}</div>
              <div className="text-sm text-textSecondary">{j.location} • {j.pay}</div>
            </Card>
            <PortfolioCard worker={j.worker} />
            <RatingCard rating={j.rating.score} reviews={j.rating.reviews} />
          </div>
        ))}
      </div>
      </main>
    </Layout>
  );
}
