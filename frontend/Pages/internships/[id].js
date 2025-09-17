import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';

export default function InternshipDetail(){
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if (!id) return;
    fetch('/api/internships').then(r=>r.json()).then(d=>{
      const found = (d.items||[]).find(x=>x.id === id);
      setItem(found || null);
    }).finally(()=>setLoading(false));
  }, [id]);

  return (
    <Layout>
      <SEO title={item ? item.title : 'Internship'} />
      <main className="py-6">
        {loading && <div className="card p-6">Loading...</div>}
        {!loading && !item && (
          <div className="card p-6">Not found.</div>
        )}
        {item && (
          <article className="card p-6 space-y-3">
            <h1 className="text-h1 font-semibold">{item.title}</h1>
            <div className="text-sm text-textSecondary">{item.company} • {item.location}</div>
            {item.description && <p className="text-body leading-relaxed">{item.description}</p>}
            {Array.isArray(item.skills) && item.skills.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {item.skills.map(s => <span key={s} className="text-xs bg-secondary rounded-full px-3 py-1.5">{s}</span>)}
              </div>
            )}
          </article>
        )}
      </main>
    </Layout>
  );
}
