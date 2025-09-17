#!/usr/bin/env node
// Initializes a production-ready Next.js + Tailwind scaffold from design tokens.
// - Reads ./design.json
// - Creates folders/files if missing
// - Generates tailwind.config.js mapped to tokens
// - Seeds pages, components, api routes, utils, and locales

import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd());
const designPath = path.join(root, 'design.json');

function readJSON(file, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {
    return fallback;
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeIfMissing(file, content) {
  if (!fs.existsSync(file)) {
    ensureDir(path.dirname(file));
    fs.writeFileSync(file, content, 'utf-8');
  }
}

const tokens = readJSON(designPath, {});
const theme = tokens?.designSystem?.style?.theme || {};
const typography = tokens?.designSystem?.style?.typography || {};

// Basic project structure
const dirs = [
  'components',
  'pages',
  'pages/api/jobs',
  'public',
  'styles',
  'utils',
  'locales',
];
dirs.forEach((d) => ensureDir(path.join(root, d)));

// tailwind.config.js
const twConfig = `/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '${theme.primaryColor || '#4F46E5'}',
        secondary: '${theme.secondaryColor || '#F3F4F6'}',
        accent: '${theme.accentColor || '#22C55E'}',
        background: '${theme.backgroundColor || '#FFFFFF'}',
        sidebar: '${theme.sidebarColor || '#F9FAFB'}',
        textPrimary: '${theme.textColorPrimary || '#111827'}',
        textSecondary: '${theme.textColorSecondary || '#6B7280'}',
        border: '${theme.borderColor || '#E5E7EB'}'
      },
      boxShadow: {
        subtle: '${theme.shadow || '0 4px 12px rgba(0,0,0,0.05)'}'
      },
      borderRadius: {
        xl: '${theme.radius || '12px'}'
      },
      spacing: ${JSON.stringify(
        (theme.spacingScale || [4, 8, 12, 16, 20, 24, 32]).reduce((acc, v) => {
          acc[v] = v + 'px';
          return acc;
        }, {})
      )},
      fontFamily: {
        sans: ['${(typography.fontFamily || 'Inter, sans-serif').split(',')[0].trim()}', ...defaultTheme.fontFamily.sans]
      },
      fontSize: {
        h1: '${typography.headings?.size?.h1 || '1.875rem'}',
        h2: '${typography.headings?.size?.h2 || '1.5rem'}',
        h3: '${typography.headings?.size?.h3 || '1.25rem'}',
        body: '${typography.body?.size || '1rem'}',
        smbody: '${typography.small?.size || '0.875rem'}'
      }
    }
  },
  plugins: []
};
`;
writeIfMissing(path.join(root, 'tailwind.config.js'), twConfig);

// postcss.config.js
writeIfMissing(
  path.join(root, 'postcss.config.js'),
  `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };\n`
);

// styles/globals.css
writeIfMissing(
  path.join(root, 'styles/globals.css'),
  `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --shadow-subtle: ${theme.shadow || '0 4px 12px rgba(0, 0, 0, 0.05)'};\n}\n\n.motion-ready {\n  will-change: transform, opacity;\n}\n\n.card {\n  @apply bg-white rounded-xl shadow-subtle p-4;\n}\n\n.shadow-subtle {\n  box-shadow: var(--shadow-subtle);\n}\n`
);

// next.config.js (optional but helpful)
writeIfMissing(
  path.join(root, 'next.config.js'),
  `/** @type {import('next').NextConfig} */\nconst nextConfig = { reactStrictMode: true };\nmodule.exports = nextConfig;\n`
);

// pages/_app.js to include global CSS
writeIfMissing(
  path.join(root, 'pages/_app.js'),
  `import '@/styles/globals.css';\n\nexport default function App({ Component, pageProps }) {\n  return <Component {...pageProps} />;\n}\n`
);

// Simple layout components
writeIfMissing(
  path.join(root, 'components/Navbar.js'),
  `import Link from 'next/link';\n\nexport default function Navbar() {\n  return (\n    <header className=\"w-full bg-white border-b border-border text-textPrimary sticky top-0 z-40\">\n      <div className=\"max-w-7xl mx-auto px-4 py-3 flex items-center justify-between\">\n        <Link href=\"/\" className=\"font-semibold text-h2 motion-ready\">Jobbly</Link>\n        <nav className=\"flex items-center gap-4\">\n          <Link href=\"/internships\" className=\"hover:text-primary transition\">Internships</Link>\n          <Link href=\"/freelance\" className=\"hover:text-primary transition\">Freelance</Link>\n          <Link href=\"/recruiter/dashboard\" className=\"hover:text-primary transition\">Recruiter</Link>\n        </nav>\n      </div>\n    </header>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'components/Sidebar.js'),
  `export default function Sidebar() {\n  return (\n    <aside className=\"hidden md:flex md:w-[72px] flex-col items-center py-4 bg-sidebar border-r border-border text-textSecondary\">\n      <button aria-label=\"Home\" className=\"w-10 h-10 grid place-items-center rounded-lg hover:bg-secondary motion-ready\">🏠</button>\n      <button aria-label=\"Search\" className=\"w-10 h-10 grid place-items-center rounded-lg hover:bg-secondary motion-ready mt-2\">🔍</button>\n      <button aria-label=\"Profile\" className=\"w-10 h-10 grid place-items-center rounded-lg hover:bg-secondary motion-ready mt-2\">👤</button>\n    </aside>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'components/SearchBar.js'),
  `export default function SearchBar({ value, onChange, placeholder }) {\n  return (\n    <div className=\"w-full\">\n      <div className=\"flex items-center bg-white rounded-full shadow-subtle px-4 py-2 gap-2\">\n        <span>🔎</span>\n        <input\n          value={value} onChange={(e)=>onChange?.(e.target.value)}\n          placeholder={placeholder || 'Search internships...'}\n          className=\"w-full outline-none text-body\"\n        />\n      </div>\n    </div>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'components/InternshipCard.js'),
  `export default function InternshipCard({ item }) {\n  return (\n    <div className=\"card motion-ready hover:shadow-lg transition-shadow\">\n      <div className=\"flex items-start justify-between\">\n        <div>\n          <h3 className=\"text-h3 font-semibold text-textPrimary\">{item.title}</h3>\n          <p className=\"text-textSecondary\">{item.company} • {item.location}</p>\n        </div>\n        <span className=\"text-xs bg-secondary text-textPrimary rounded-full px-2 py-1\">Score: {item.score?.toFixed?.(2) ?? '—'}</span>\n      </div>\n      {item.reason && (<div className=\"mt-2 text-xs text-textSecondary\">Why: {item.reason}</div>)}\n      <div className=\"mt-3 flex gap-2 flex-wrap\">\n        {item.skills?.map((s)=> (\n          <span key={s} className=\"text-xs bg-secondary rounded-full px-2 py-1\">{s}</span>\n        ))}\n      </div>\n    </div>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'components/SuggestionPanel.js'),
  `import InternshipCard from './InternshipCard';\n\nexport default function SuggestionPanel({ items }) {\n  return (\n    <section className=\"space-y-3\">\n      {items?.map((i)=> (<InternshipCard key={i.id} item={i} />))}\n    </section>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'components/ResumeAnalyzer.js'),
  `import { useState } from 'react';\n\nexport default function ResumeAnalyzer() {\n  const [text, setText] = useState('');\n  const [result, setResult] = useState(null);\n\n  async function analyze() {\n    const res = await fetch('/api/resume-analyze', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ text })\n    });\n    setResult(await res.json());\n  }\n\n  function onDrop(e) {\n    e.preventDefault();\n    const file = e.dataTransfer.files?.[0];\n    if (!file) return;\n    const reader = new FileReader();\n    reader.onload = () => setText(String(reader.result || ''));\n    reader.readAsText(file);\n  }\n\n  return (\n    <div className=\"card motion-ready\" onDragOver={(e)=>e.preventDefault()} onDrop={onDrop}>\n      <h3 className=\"text-h3 font-semibold mb-2\">Resume Analyzer</h3>\n      <p className=\"text-sm text-textSecondary mb-2\">Paste or drop your resume text.\n        {/* Plug real NLP (spaCy/transformer) on the API endpoint */}\n      </p>\n      <textarea\n        className=\"w-full border border-border rounded-lg p-3 mb-2\" rows={6}\n        value={text} onChange={(e)=>setText(e.target.value)}\n        placeholder=\"Paste resume here...\"\n      />\n      <div className=\"flex gap-2\">\n        <button className=\"px-4 py-2 bg-primary text-white rounded-lg\" onClick={analyze}>Analyze</button>\n        <button className=\"px-4 py-2 bg-secondary rounded-lg\" onClick={()=>setText('')}>Clear</button>\n      </div>\n      {result && (\n        <div className=\"mt-3 grid grid-cols-1 md:grid-cols-2 gap-3\">\n          <div>\n            <h4 className=\"font-medium\">Parsed</h4>\n            <pre className=\"text-xs bg-secondary p-2 rounded\">{JSON.stringify(result.parsed, null, 2)}</pre>\n          </div>\n          <div>\n            <h4 className=\"font-medium\">Suggestions</h4>\n            <div className=\"flex flex-wrap gap-2\">\n              {result.suggestedSkills?.map((s)=> (<span key={s} className=\"text-xs bg-accent/10 text-accent px-2 py-1 rounded-full\">{s}</span>))}\n            </div>\n          </div>\n        </div>\n      )}\n    </div>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'components/VoiceInput.js'),
  `import { useEffect, useRef, useState } from 'react';\n\nexport default function VoiceInput() {\n  const [listening, setListening] = useState(false);\n  const [transcript, setTranscript] = useState('');\n  const recognitionRef = useRef(null);\n\n  useEffect(() => {\n    if (typeof window === 'undefined') return;\n    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;\n    if (SpeechRecognition) {\n      const rec = new SpeechRecognition();\n      rec.continuous = true;\n      rec.interimResults = true;\n      rec.onresult = (e) => {\n        let text = '';\n        for (let i = e.resultIndex; i < e.results.length; i++) {\n          text += e.results[i][0].transcript;\n        }\n        setTranscript(text);\n      };\n      recognitionRef.current = rec;\n    }\n  }, []);\n\n  function start() { recognitionRef.current?.start(); setListening(true); }\n  function stop() { recognitionRef.current?.stop(); setListening(false); }\n\n  async function saveNote() {\n    await fetch('/api/voice-notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript }) });\n    setTranscript('');\n  }\n\n  return (\n    <div className=\"card motion-ready\">\n      <h3 className=\"text-h3 font-semibold mb-2\">Voice Notes</h3>\n      <div className=\"flex items-center gap-2 mb-2\">\n        {!listening ? (<button className=\"px-3 py-1 bg-primary text-white rounded\" onClick={start}>Start</button>) : (<button className=\"px-3 py-1 bg-secondary rounded\" onClick={stop}>Stop</button>)}\n        <button className=\"px-3 py-1 bg-accent text-white rounded\" onClick={saveNote}>Save as Note</button>\n      </div>\n      <div className=\"text-sm text-textSecondary bg-secondary rounded p-2 min-h-[60px]\">{transcript || 'Say something...'}</div>\n    </div>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'components/ProgressTracker.js'),
  `import { useEffect, useState } from 'react';\n\nconst STAGES = ['Applied', 'Interview', 'Offer', 'Joined'];\n\nexport default function ProgressTracker() {\n  const [status, setStatus] = useState('Applied');\n  const [timeline, setTimeline] = useState([]);\n\n  useEffect(() => {\n    fetch('/api/progress').then(r=>r.json()).then((d)=>{\n      setTimeline(d.timeline || []);\n      setStatus(d.current || 'Applied');\n    });\n  }, []);\n\n  async function update(next) {\n    setStatus(next);\n    await fetch('/api/progress', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ current: next }) });\n  }\n\n  return (\n    <div className=\"card motion-ready\">\n      <h3 className=\"text-h3 font-semibold mb-2\">Progress</h3>\n      <div className=\"flex items-center gap-2\">\n        {STAGES.map((s)=> (\n          <button key={s} onClick={()=>update(s)} className=\"px-3 py-1 rounded-full border\"\n            style={{ background: s === status ? 'var(--tw-color-primary, #4F46E5)' : 'transparent', color: s === status ? '#fff' : 'inherit' }}>{s}</button>\n        ))}\n      </div>\n      <ul className=\"mt-3 text-sm text-textSecondary list-disc pl-5\">\n        {timeline.map((t)=> (<li key={t.date + t.stage}>{t.date}: {t.stage}</li>))}\n      </ul>\n    </div>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'components/RatingCard.js'),
  `export default function RatingCard({ rating = 4.5, reviews = 120 }) {\n  return (\n    <div className=\"card motion-ready\">\n      <div className=\"text-h3 font-semibold\">{rating}⭐</div>\n      <div className=\"text-sm text-textSecondary\">{reviews} reviews</div>\n    </div>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'components/PortfolioCard.js'),
  `export default function PortfolioCard({ worker }) {\n  return (\n    <div className=\"card motion-ready\">\n      <div className=\"font-semibold\">{worker.name}</div>\n      <div className=\"text-sm text-textSecondary\">{worker.skill} • {worker.location}</div>\n    </div>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'components/RecruiterPostForm.js'),
  `import { useState } from 'react';\n\nexport default function RecruiterPostForm() {\n  const [form, setForm] = useState({ title: '', location: '', pay: '' });\n  function update(k,v){ setForm((f)=>({ ...f, [k]: v })); }\n  async function submit(e){ e.preventDefault(); alert('Posted (mock)'); }\n  return (\n    <form onSubmit={submit} className=\"card motion-ready space-y-2\">\n      <h3 className=\"text-h3 font-semibold\">Post Job</h3>\n      <input className=\"border p-2 rounded w-full\" placeholder=\"Title\" value={form.title} onChange={(e)=>update('title', e.target.value)} />\n      <input className=\"border p-2 rounded w-full\" placeholder=\"Location\" value={form.location} onChange={(e)=>update('location', e.target.value)} />\n      <input className=\"border p-2 rounded w-full\" placeholder=\"Pay\" value={form.pay} onChange={(e)=>update('pay', e.target.value)} />\n      <button className=\"px-4 py-2 bg-primary text-white rounded\" type=\"submit\">Submit</button>\n    </form>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'components/AuthForm.js'),
  `import { useState } from 'react';\n\nexport default function AuthForm({ mode = 'login', onSubmit }) {\n  const [email, setEmail] = useState('');\n  const [password, setPassword] = useState('');\n  return (\n    <form onSubmit={(e)=>{e.preventDefault(); onSubmit?.({ email, password });}} className=\"card motion-ready space-y-2\">\n      <h3 className=\"text-h3 font-semibold\">{mode === 'login' ? 'Login' : 'Sign Up'}</h3>\n      <input className=\"border p-2 rounded w-full\" type=\"email\" placeholder=\"Email\" value={email} onChange={(e)=>setEmail(e.target.value)} />\n      <input className=\"border p-2 rounded w-full\" type=\"password\" placeholder=\"Password\" value={password} onChange={(e)=>setPassword(e.target.value)} />\n      <button className=\"px-4 py-2 bg-primary text-white rounded\" type=\"submit\">{mode === 'login' ? 'Login' : 'Create account'}</button>\n    </form>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'components/MultiLangSwitcher.js'),
  `import { useI18n } from '@/utils/i18n';\n\nexport default function MultiLangSwitcher(){\n  const { lang, setLang } = useI18n();\n  return (\n    <div className=\"flex items-center gap-2\">\n      <select className=\"border p-2 rounded\" value={lang} onChange={(e)=>setLang(e.target.value)}>\n        <option value=\"en\">EN</option>\n        <option value=\"ta\">TA</option>\n      </select>\n    </div>\n  );\n}\n`
);

// utils
writeIfMissing(
  path.join(root, 'utils/mockData.js'),
  `export const internships = [\n  { id: 'i1', title: 'Frontend Intern', company: 'Acme', location: 'Remote', skills: ['React','Tailwind'], postedAt: '2025-09-01' },\n  { id: 'i2', title: 'Backend Intern', company: 'Globex', location: 'Chennai', skills: ['Node','MongoDB'], postedAt: '2025-08-26' },\n  { id: 'i3', title: 'Data Intern', company: 'Initech', location: 'Remote', skills: ['Python','NLP'], postedAt: '2025-09-10' }\n];\n\nexport const freelancers = [\n  { id: 'f1', title: 'Electrician', location: 'Chennai', pay: '₹600/day', worker: { name:'Ravi', skill:'Electrician', location:'Chennai' }, rating: { score: 4.7, reviews: 210 } },\n  { id: 'f2', title: 'Plumber', location: 'Bangalore', pay: '₹700/day', worker: { name:'Arjun', skill:'Plumber', location:'Bangalore' }, rating: { score: 4.4, reviews: 90 } }\n];\n\nexport const progress = { current: 'Applied', timeline: [\n  { date: '2025-08-01', stage: 'Applied' },\n  { date: '2025-08-05', stage: 'Interview' }\n]};\n`
);

writeIfMissing(
  path.join(root, 'utils/embeddingStub.js'),
  `// Mock semantic embedding: converts text to a normalized token frequency vector length.\nexport function embed(text) {\n  if (!text) return 0;\n  const tokens = String(text).toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean);\n  return tokens.length ** 0.5; // simple mock signal\n}\n\nexport function scoreMatch(query, item) {\n  // Rule-based weighting: skills, location, recency (newer postedAt is better)\n  const q = String(query || '').toLowerCase();\n  let score = 0;\n  if (item.skills) { score += item.skills.filter(s=>q.includes(s.toLowerCase())).length * 2; }\n  if (item.location && q.includes(item.location.toLowerCase())) score += 1.5;\n  if (item.postedAt) {\n    const days = Math.max(1, (Date.now() - new Date(item.postedAt).getTime()) / 86400000);\n    score += 5 / days;\n  }\n  score += 0.3 * embed(item.title + ' ' + (item.company || ''));\n  return score;\n}\n`
);

writeIfMissing(
  path.join(root, 'utils/authStub.js'),
  `export async function login({ email, password }) {\n  // Placeholder: replace with real auth provider\n  if (email && password) { return { token: 'mock-token', user: { email } }; }\n  throw new Error('Invalid credentials');\n}\n\nexport async function requireAuth(ctx) {\n  // Example server-side guard placeholder\n  return { user: { email: 'recruiter@example.com' } };\n}\n`
);

writeIfMissing(
  path.join(root, 'utils/i18n.js'),
  `import { createContext, useContext, useEffect, useState } from 'react';\n\nconst I18nContext = createContext({ t: (k)=>k, lang: 'en', setLang: ()=>{} });\n\nexport function I18nProvider({ children }) {\n  const [lang, setLang] = useState('en');\n  const [dict, setDict] = useState({});\n  useEffect(()=>{ fetch('/locales/' + lang + '.json').then(r=>r.json()).then(setDict).catch(()=>setDict({})); }, [lang]);\n  const t = (k) => dict[k] || k;\n  return <I18nContext.Provider value={{ t, lang, setLang }}>{children}</I18nContext.Provider>;\n}\n\nexport function useI18n(){ return useContext(I18nContext); }\n`
);

// locales
writeIfMissing(
  path.join(root, 'locales/en.json'),
  JSON.stringify({
    app_title: 'Jobbly',
    search_placeholder: 'Search internships...'
  }, null, 2)
);
writeIfMissing(
  path.join(root, 'locales/ta.json'),
  JSON.stringify({
    app_title: 'ஜாப்ளி',
    search_placeholder: 'இன்டர்ன்ஷிப்புகளை தேடுங்கள்...'
  }, null, 2)
);

// hooks
writeIfMissing(
  path.join(root, 'components/useSuggestions.js'),
  `import { useEffect, useState } from 'react';\n\nexport function useSuggestions(query = '') {\n  const [data, setData] = useState([]);\n  const [loading, setLoading] = useState(false);\n  useEffect(()=>{\n    setLoading(true);\n    const url = '/api/suggestions' + (query ? ('?q=' + encodeURIComponent(query)) : '');\n    fetch(url).then(r=>r.json()).then((d)=>setData(d.items || [])).finally(()=>setLoading(false));\n  }, [query]);\n  return { data, loading };\n}\n`
);

// API routes
writeIfMissing(
  path.join(root, 'pages/api/internships.js'),
  `import { internships } from '@/utils/mockData';\nexport default function handler(req, res) {\n  res.status(200).json({ items: internships });\n}\n`
);

writeIfMissing(
  path.join(root, 'pages/api/suggestions.js'),
  `import { internships } from '@/utils/mockData';\n  import { scoreMatch } from '@/utils/embeddingStub';\n  export default function handler(req, res) {\n    const q = (req.query.q || '').toString();\n    const ranked = internships\n      .map((it)=> ({ ...it, score: scoreMatch(q, it), reason: deriveReason(q, it) }))\n      .sort((a,b)=> b.score - a.score);\n    res.status(200).json({ items: ranked });\n  }\n  function deriveReason(q, it){\n    if (!q) return 'Top picks for you';\n    const terms = q.toLowerCase();\n    const hits = (it.skills||[]).filter(s=>terms.includes(s.toLowerCase()));\n    if (hits.length) return 'Matches skills: ' + hits.join(', ');\n    if (it.location && terms.includes(it.location.toLowerCase())) return 'Near your location';\n    return 'Recent and relevant';\n  }\n`
);

writeIfMissing(
  path.join(root, 'pages/api/resume-analyze.js'),
  `export default async function handler(req, res) {\n  const { text = '' } = req.body || {};\n  // Placeholder NLP parse: extract naive fields\n  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/);\n  const name = (text.split(/\n|,/)[0] || '').trim();\n  const skills = Array.from(new Set(text.match(/react|node|python|nlp|tailwind/gi) || [])).map(s=>s.toLowerCase());\n  const parsed = { name, email: emailMatch?.[0] || '', skills, education: [], experience: [] };\n  const suggestedSkills = ['typescript','testing','docker'].filter(s=>!skills.includes(s));\n  res.status(200).json({ parsed, suggestedSkills });\n}\n`
);

writeIfMissing(
  path.join(root, 'pages/api/progress.js'),
  `let state = { current: 'Applied', timeline: [{ date: '2025-08-01', stage: 'Applied' }] };\nexport default function handler(req, res){\n  if (req.method === 'POST') {\n    const { current } = req.body || {};\n    if (current) { state.current = current; state.timeline.push({ date: new Date().toISOString().slice(0,10), stage: current }); }\n    return res.status(200).json(state);\n  }\n  res.status(200).json(state);\n}\n`
);

writeIfMissing(
  path.join(root, 'pages/api/jobs/freelance.js'),
  `import { freelancers } from '@/utils/mockData';\nexport default function handler(req, res){ res.status(200).json({ items: freelancers }); }\n`
);

writeIfMissing(
  path.join(root, 'pages/api/portfolio.js'),
  `import { freelancers } from '@/utils/mockData';\nexport default function handler(req, res){ res.status(200).json({ items: freelancers.map(f=>f.worker) }); }\n`
);

writeIfMissing(
  path.join(root, 'pages/api/voice-notes.js'),
  `let notes = [];\nexport default function handler(req, res){\n  if (req.method === 'POST') { const { transcript } = req.body || {}; notes.push({ id: notes.length+1, transcript, at: Date.now() }); return res.status(200).json({ ok: true }); }\n  res.status(200).json({ items: notes });\n}\n`
);

// Pages
writeIfMissing(
  path.join(root, 'pages/index.js'),
  `import Navbar from '@/components/Navbar';\nimport Sidebar from '@/components/Sidebar';\nimport SearchBar from '@/components/SearchBar';\nimport SuggestionPanel from '@/components/SuggestionPanel';\nimport ResumeAnalyzer from '@/components/ResumeAnalyzer';\nimport VoiceInput from '@/components/VoiceInput';\nimport ProgressTracker from '@/components/ProgressTracker';\nimport { useSuggestions } from '@/components/useSuggestions';\nimport { I18nProvider, useI18n } from '@/utils/i18n';\nimport Link from 'next/link';\nimport { useState } from 'react';\n\nfunction Dashboard(){\n  const { t } = useI18n();\n  const [q, setQ] = useState('');\n  const { data } = useSuggestions(q);\n  return (\n    <div className=\"min-h-screen bg-background text-textPrimary\">\n      <Navbar />\n      <div className=\"max-w-7xl mx-auto grid md:grid-cols-[72px_300px_1fr] gap-6 px-4 py-6\">\n        <Sidebar />\n        <div className=\"space-y-4\">\n          <SearchBar value={q} onChange={setQ} placeholder={t('search_placeholder')} />\n          <ProgressTracker />\n          <div className=\"card\">\n            <h3 className=\"text-h3 font-semibold mb-2\">Quick Links</h3>\n            <div className=\"flex gap-3 flex-wrap\">\n              <Link className=\"px-3 py-2 bg-secondary rounded-lg\" href=\"/recruiter/dashboard\">Post internship</Link>\n              <Link className=\"px-3 py-2 bg-secondary rounded-lg\" href=\"/freelance\">Freelance jobs</Link>\n              <Link className=\"px-3 py-2 bg-secondary rounded-lg\" href=\"/portfolio\">Profile</Link>\n            </div>\n          </div>\n        </div>\n        <div className=\"space-y-4\">\n          <SuggestionPanel items={data} />\n          <ResumeAnalyzer />\n          <VoiceInput />\n        </div>\n      </div>\n    </div>\n  );\n}\n\nexport default function Page(){\n  return (<I18nProvider><Dashboard /></I18nProvider>);\n}\n`
);

writeIfMissing(
  path.join(root, 'pages/internships/index.js'),
  `import { useEffect, useState } from 'react';\nimport InternshipCard from '@/components/InternshipCard';\n\nexport default function Internships(){\n  const [items, setItems] = useState([]);\n  useEffect(()=>{ fetch('/api/internships').then(r=>r.json()).then((d)=>setItems(d.items||[])); }, []);\n  return (\n    <main className=\"max-w-5xl mx-auto p-4 space-y-3\">\n      <h1 className=\"text-h1 font-semibold\">Internships</h1>\n      {items.map((i)=> (<InternshipCard key={i.id} item={i} />))}\n    </main>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'pages/freelance/index.js'),
  `import { useEffect, useState } from 'react';\nimport PortfolioCard from '@/components/PortfolioCard';\nimport RatingCard from '@/components/RatingCard';\n\nexport default function Freelance(){\n  const [items, setItems] = useState([]);\n  useEffect(()=>{ fetch('/api/jobs/freelance').then(r=>r.json()).then((d)=>setItems(d.items||[])); }, []);\n  return (\n    <main className=\"max-w-5xl mx-auto p-4 grid md:grid-cols-2 gap-4\">\n      {items.map((j)=> (\n        <div key={j.id} className=\"space-y-2\">\n          <div className=\"card\">\n            <div className=\"font-semibold\">{j.title}</div>\n            <div className=\"text-sm text-textSecondary\">{j.location} • {j.pay}</div>\n          </div>\n          <PortfolioCard worker={j.worker} />\n          <RatingCard rating={j.rating.score} reviews={j.rating.reviews} />\n        </div>\n      ))}\n    </main>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'pages/recruiter/login.js'),
  `import AuthForm from '@/components/AuthForm';\nimport { login } from '@/utils/authStub';\n\nexport default function RecruiterLogin(){\n  return (\n    <main className=\"max-w-md mx-auto p-6\">\n      <AuthForm mode=\"login\" onSubmit={async (c)=>{ await login(c); location.href='/recruiter/dashboard'; }} />\n    </main>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'pages/recruiter/dashboard.js'),
  `import RecruiterPostForm from '@/components/RecruiterPostForm';\n\nexport default function Dashboard(){\n  return (\n    <main className=\"max-w-3xl mx-auto p-6 space-y-4\">\n      <h1 className=\"text-h1 font-semibold\">Recruiter Dashboard</h1>\n      <RecruiterPostForm />\n    </main>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'pages/auth/login.js'),
  `import AuthForm from '@/components/AuthForm';\nimport { login } from '@/utils/authStub';\n\nexport default function Login(){\n  return (\n    <main className=\"max-w-md mx-auto p-6\">\n      <AuthForm mode=\"login\" onSubmit={async (c)=>{ await login(c); alert('Logged in (mock)'); }} />\n    </main>\n  );\n}\n`
);

writeIfMissing(
  path.join(root, 'pages/auth/signup.js'),
  `import AuthForm from '@/components/AuthForm';\n\nexport default function Signup(){\n  return (\n    <main className=\"max-w-md mx-auto p-6\">\n      <AuthForm mode=\"signup\" onSubmit={async ()=>{ alert('Signed up (mock)'); }} />\n    </main>\n  );\n}\n`
);

// Basic tsconfig for path alias @/
writeIfMissing(
  path.join(root, 'jsconfig.json'),
  JSON.stringify({ compilerOptions: { baseUrl: '.', paths: { '@/*': ['./*'] } } }, null, 2)
);

console.log('Scaffold ensured. You can now run:');
console.log('  npm install');
console.log('  npm run dev');


