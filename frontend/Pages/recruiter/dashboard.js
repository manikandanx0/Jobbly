import RecruiterPostForm from '@/components/RecruiterPostForm';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import { useMemo } from 'react';
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

        {/* Talent listing with filters */}
        <Card variant="glass" className="p-5 md:p-6">
          <div className="text-h3 font-semibold mb-3">Find Talent</div>
          <TalentFilters />
        </Card>
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

function TalentFilters(){
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState('');
  const [availability, setAvailability] = useState('');
  const [items, setItems] = useState([]);
  async function search(){
    const params = new URLSearchParams();
    if (skills) skills.split(',').map(s=>s.trim()).filter(Boolean).forEach(s=> params.append('skills', s));
    if (location) params.set('location', location);
    if (level) params.set('experience_level', level);
    if (availability) params.set('availability', availability);
    const r = await fetch('/api/users/talents?' + params.toString());
    const d = await r.json();
    setItems(d.talents || []);
  }
  return (
    <div>
      <div className="grid md:grid-cols-4 gap-3 mb-3">
        <input className="input" placeholder="Skills (comma)" value={skills} onChange={e=> setSkills(e.target.value)} />
        <input className="input" placeholder="Location" value={location} onChange={e=> setLocation(e.target.value)} />
        <select className="input" value={level} onChange={e=> setLevel(e.target.value)}>
          <option value="">Any level</option>
          <option value="fresher">Fresher</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
          <option value="expert">Expert</option>
        </select>
        <select className="input" value={availability} onChange={e=> setAvailability(e.target.value)}>
          <option value="">Any availability</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="freelance">Freelance</option>
        </select>
      </div>
      <button className="btn-primary" onClick={search}>Search</button>
      <div className="mt-4 grid md:grid-cols-2 gap-3">
        {items.map(u => (
          <Card key={u.id} variant="glass" className="p-4">
            <div className="font-medium">{u.full_name}</div>
            <div className="text-sm text-textSecondary">{u.location} • {u.experience_level || 'any'}</div>
            <div className="mt-2 text-sm">Skills: {(u.skills||[]).join(', ')}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
