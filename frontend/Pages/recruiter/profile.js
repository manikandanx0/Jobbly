import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import Card from '@/components/Card';

export default function RecruiterProfile() {
  const [profile, setProfile] = useState({ 
    name: '', 
    email: '', 
    company: '', 
    title: '', 
    bio: '',
    website: '',
    linkedin: ''
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('recruiterProfile');
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  function save() {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('recruiterProfile', JSON.stringify(profile));
    alert('Profile saved!');
  }

  return (
    <Layout>
      <SEO title="Recruiter Profile" />
      <main className="space-y-4">
        <h1 className="text-h1 font-semibold">Recruiter Profile</h1>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5 md:p-6 space-y-3">
            <div className="text-h3 font-semibold">Personal Info</div>
            <input 
              className="border p-2 rounded w-full" 
              placeholder="Your Name" 
              value={profile.name} 
              onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} 
            />
            <input 
              className="border p-2 rounded w-full" 
              placeholder="Email" 
              value={profile.email} 
              onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} 
            />
            <input 
              className="border p-2 rounded w-full" 
              placeholder="Job Title" 
              value={profile.title} 
              onChange={(e) => setProfile(p => ({ ...p, title: e.target.value }))} 
            />
          </div>

          <Card className="p-5 md:p-6 space-y-3">
            <div className="text-h3 font-semibold">Company Info</div>
            <input 
              className="border p-2 rounded w-full" 
              placeholder="Company Name" 
              value={profile.company} 
              onChange={(e) => setProfile(p => ({ ...p, company: e.target.value }))} 
            />
            <input 
              className="border p-2 rounded w-full" 
              placeholder="Company Website" 
              value={profile.website} 
              onChange={(e) => setProfile(p => ({ ...p, website: e.target.value }))} 
            />
            <input 
              className="border p-2 rounded w-full" 
              placeholder="LinkedIn Profile" 
              value={profile.linkedin} 
              onChange={(e) => setProfile(p => ({ ...p, linkedin: e.target.value }))} 
            />
          </Card>
        </div>

        <Card className="p-5 md:p-6 space-y-3">
          <div className="text-h3 font-semibold">Bio</div>
          <textarea 
            rows={4} 
            className="border p-2 rounded w-full" 
            placeholder="Tell us about yourself and your company..." 
            value={profile.bio} 
            onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))} 
          />
        </Card>

        <button onClick={save} className="px-4 py-2 bg-primary text-white rounded">
          Save Profile
        </button>

        <Card className="p-5 md:p-6">
          <div className="text-h3 font-semibold mb-3">Public Preview</div>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-primary">
                {(profile.name || 'R').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">{profile.name || 'Your Name'}</div>
              <div className="text-sm text-textSecondary">{profile.title || 'Job Title'}</div>
              <div className="text-sm text-textSecondary">{profile.company || 'Company Name'}</div>
              {profile.bio && (
                <p className="text-sm text-textSecondary mt-2">{profile.bio}</p>
              )}
              <div className="flex gap-2 mt-2">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    Website
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </Card>
      </main>
    </Layout>
  );
}


