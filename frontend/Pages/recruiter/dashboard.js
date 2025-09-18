import RecruiterPostForm from '@/components/RecruiterPostForm';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import Card from '@/components/Card';
import { withAuth } from '@/utils/serverAuth';

export default function Dashboard({ user }){
  const { notify } = useToast();
  const [items, setItems] = useState([]);
  const [verified, setVerified] = useState(false);
  async function refresh(){ const r = await fetch('/api/internships'); const d = await r.json(); setItems(d.items || []); }
  async function fetchVerification(){ const r = await fetch('/api/recruiter'); const d = await r.json(); setVerified(!!d.recruiter?.verified); }
  useEffect(()=>{ refresh(); fetchVerification(); }, []);

  async function remove(id){
    try {
      if (!confirm('Delete this internship?')) return;
      await fetch('/api/internships?id=' + encodeURIComponent(id), { method: 'DELETE' });
      notify('Internship deleted', 'success');
      refresh();
    } catch(e){ notify('Delete failed', 'error'); }
  }

  return (
    <Layout>
      <SEO title="Recruiter Dashboard" />
      <main className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-h1 font-semibold">Recruiter Dashboard</h1>
          <Link href="/recruiter/profile" className="px-3 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition">
            Edit Profile
          </Link>
        </div>
        {!verified && (
          <Card variant="glass" className="p-4">
            <div className="font-medium">Verification required</div>
            <p className="text-sm text-textSecondary mt-1">You must be verified to post internships.</p>
            <button onClick={async ()=>{ await fetch('/api/recruiter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ verified: true }) }); fetchVerification(); }} className="mt-2 btn-primary">Verify now</button>
          </Card>
        )}
        {verified && <RecruiterPostForm previewEnabled onPosted={refresh} />}
        <Card variant="glass" className="p-5 md:p-6">
          <div className="text-h3 font-semibold mb-2">Your Internships</div>
          {items.length === 0 && <div className="text-sm text-textSecondary">No internships yet.</div>}
          <ul className="space-y-2 text-sm">
            {items.map(it => (
              <li key={it.id} className="flex items-center justify-between gap-3">
                <div className="truncate"><span className="font-medium">{it.title}</span> — {it.company} • {it.location}</div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs text-textSecondary">{it.postedAt}</span>
                  <button onClick={()=>remove(it.id)} className="btn-secondary text-xs">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </main>
    </Layout>
  );
}

// Server-side authentication
export const getServerSideProps = withAuth();
