import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';
import Card from '@/components/Card';

export default function PublicProfile() {
  const router = useRouter();
  const { username } = router.query;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (username) {
      setLoading(true);
      setError(false);
      
      // Try to get profile from localStorage first (for demo)
      if (typeof window !== 'undefined') {
        const savedProfile = window.localStorage.getItem('profile');
        const savedPortfolio = window.localStorage.getItem('portfolio');
        
        if (savedProfile && savedPortfolio) {
          const profileData = JSON.parse(savedProfile);
          const portfolioData = JSON.parse(savedPortfolio);
          
          // Check if username matches (simple demo logic)
          if (profileData.name?.toLowerCase().replace(/\s+/g, '') === username.toLowerCase()) {
            setProfile({ ...profileData, ...portfolioData });
            setLoading(false);
            return;
          }
        }
      }
      
      // In a real app, this would fetch from API
      // fetch(`/api/profiles/${username}`)
      //   .then(res => res.json())
      //   .then(data => {
      //     if (data.profile) {
      //       setProfile(data.profile);
      //     } else {
      //       setError(true);
      //     }
      //   })
      //   .catch(() => setError(true))
      //   .finally(() => setLoading(false));
      
      // For demo, show error if not found
      setError(true);
      setLoading(false);
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-gray-900 text-textPrimary dark:text-white flex flex-col">
        <Layout>
        <main className="flex-grow w-full py-6">
          <Card variant="glass" className="animate-pulse space-y-4 glass">
        <Card variant="glass" className="animate-pulse space-y-4 glass">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="flex gap-2 flex-wrap">
              <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </Card>
        </main>
        </Layout>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background dark:bg-gray-900 text-textPrimary dark:text-white flex flex-col">
        <Layout>
        <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-6 lg:px-10 py-6 text-center">
          <h1 className="text-h1 font-bold mb-4">Profile Not Found</h1>
          <p className="text-lg text-textSecondary mb-6">The profile you're looking for doesn't exist or is private.</p>
          <button onClick={() => router.push('/')} className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            Go to Home
          </button>
        </main>
        </Layout>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 text-textPrimary dark:text-white flex flex-col">
      <SEO title={`${profile.name || 'User'} - Profile`} description={profile.summary || 'User profile'} />
      <Layout>
      <main className="flex-grow w-full py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card variant="glass" className="p-6 glass">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {(profile.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-h1 font-semibold">{profile.name || 'Username'}</h1>
                <p className="text-textSecondary">{profile.email || 'email@example.com'}</p>
                {profile.headline && (
                  <p className="text-sm text-textSecondary mt-1">{profile.headline}</p>
                )}
              </div>
            </div>
          </Card>

          {profile.summary && (
            <Card variant="glass" className="p-6 glass">
              <h2 className="text-h2 font-semibold mb-3">About</h2>
              <p className="text-textSecondary leading-relaxed">{profile.summary}</p>
            </Card>
          )}

          {profile.skills && (
            <Card variant="glass" className="p-6 glass">
              <h2 className="text-h2 font-semibold mb-3">Skills</h2>
              <div className="flex gap-2 flex-wrap">
                {profile.skills.split(',').map(skill => skill.trim()).filter(Boolean).map(skill => (
                  <span key={skill} className="inline-flex items-center justify-center h-7 px-3 text-xs bg-secondary text-textPrimary rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {profile.projects && (
            <Card variant="glass" className="p-6 glass">
              <h2 className="text-h2 font-semibold mb-3">Projects</h2>
              <ul className="space-y-2">
                {profile.projects.split('\n').map(project => project.trim()).filter(Boolean).map((project, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-textSecondary">{project}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </main>
      </Layout>
      <Footer />
    </div>
  );
}


