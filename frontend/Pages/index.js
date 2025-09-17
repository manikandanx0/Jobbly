import Layout from '@/components/Layout';
import SuggestionPanel from '@/components/SuggestionPanel';
import ResumeAnalyzer from '@/components/ResumeAnalyzer';
import VoiceInput from '@/components/VoiceInput';
import ProgressTracker from '@/components/ProgressTracker';
import Card from '@/components/Card';
import { useSuggestions } from '@/components/useSuggestions';
import { I18nProvider, useI18n } from '@/utils/i18n';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Footer from '@/components/Footer';

function Dashboard(){
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [sort, setSort] = useState('score');
  useEffect(()=>{ const id = setTimeout(()=> setDebouncedQ(q), 300); return ()=> clearTimeout(id); }, [q]);
  const { data, loading } = useSuggestions(debouncedQ);
  const sorted = useMemo(()=>{
    const arr = [...(data||[])];
    if (sort === 'score') return arr.sort((a,b)=> (b.score||0) - (a.score||0));
    if (sort === 'date') return arr.sort((a,b)=> new Date(b.postedAt) - new Date(a.postedAt));
    return arr;
  }, [data, sort]);
  return (
    <Layout>
      <div className="w-full grid md:grid-cols-[320px_1fr] gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-h3 font-semibold">Browse</h3>
            <select value={sort} onChange={(e)=>setSort(e.target.value)} className="select-rounded w-auto px-4 py-2">
              <option value="score">Sort: Relevance</option>
              <option value="date">Sort: Newest</option>
            </select>
          </div>
          <ProgressTracker />
          <Card variant="glass" className="glass">
            <h3 className="text-h3 font-semibold mb-2">{t('quick_links')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link className="flex items-center gap-2 px-3 py-3 bg-white/70 rounded-lg hover:shadow-subtle transition overflow-hidden" href="/">
                <span className="shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg></span>
                <span className="truncate">Home</span>
              </Link>
              <Link className="flex items-center gap-2 px-3 py-3 bg-white/70 rounded-lg hover:shadow-subtle transition overflow-hidden" href="/recruiter/dashboard">
                <span className="shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z"/></svg></span>
                <span className="truncate">{t('link_post_internship')}</span>
              </Link>
              <Link className="flex items-center gap-2 px-3 py-3 bg-white/70 rounded-lg hover:shadow-subtle transition overflow-hidden" href="/freelance">
                <span className="shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><path d="M7 9V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg></span>
                <span className="truncate">{t('link_freelance_jobs')}</span>
              </Link>
              <Link className="flex items-center gap-2 px-3 py-3 bg-white/70 rounded-lg hover:shadow-subtle transition overflow-hidden" href="/portfolio">
                <span className="shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span>
                <span className="truncate">{t('link_profile')}</span>
              </Link>
            </div>
          </Card>
          <ResumeAnalyzer />
        </div>
        <div className="space-y-4">
          <div className="space-y-4 origin-top max-w-4xl">
            <SuggestionPanel items={sorted} loading={loading} />
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}

export default function Page(){
  return (<I18nProvider><Dashboard /></I18nProvider>);
}
