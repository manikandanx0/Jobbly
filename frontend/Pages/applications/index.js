import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import Card from '@/components/Card';
import Link from 'next/link';
import { withAuth } from '@/utils/serverAuth';
import { getAuthHeaders } from '@/utils/authStub';

export default function Applications({ user }){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const userId = user?.id;
    const url = userId ? `/api/multilingual/applications?userId=${encodeURIComponent(userId)}` : '/api/multilingual/applications';
    fetch(url, {
      headers: getAuthHeaders()
    }).then(r=>r.json()).then(d=> setItems(d.items || [])).finally(()=>setLoading(false));
  }, [user]);

  return (
    <Layout>
      <SEO title="Applications" />
      <main className="space-y-3">
        <h1 className="text-h1 font-semibold">Applications</h1>
        {loading && <Card variant="glass" className="p-4">Loading...</Card>}
        {!loading && items.length === 0 && <Card variant="glass" className="p-4">You have not applied yet.</Card>}
        <ul className="space-y-2">
          {items.map(a => (
            <li key={a.id}>
              <Card variant="glass" className="p-4">
                <div className="text-sm text-textSecondary">Applied at {new Date(a.created_at || a.at || Date.now()).toLocaleString()}</div>
                <div className="font-medium">Application</div>
                <Link href={`/internships/${a.internship_id || a.internshipId}`} className="text-sm text-primary hover:underline">View internship</Link>
              </Card>
            </li>
          ))}
        </ul>
      </main>
    </Layout>
  );
}

// Server-side authentication
export const getServerSideProps = withAuth();
