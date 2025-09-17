import { useState } from 'react';
import Card from '@/components/Card';

export default function ResumeAnalyzer() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  async function analyze() {
    const res = await fetch('/api/resume-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    setResult(await res.json());
  }

  function onDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result || ''));
    reader.readAsText(file);
  }

  return (
    <Card variant="glass" className="p-5 md:p-6 motion-ready hover:shadow-lg transition-shadow" onDragOver={(e)=>e.preventDefault()} onDrop={onDrop}>
      <h3 className="text-h3 font-semibold mb-3 text-center">Resume Analyzer</h3>
      <p className="text-sm text-textSecondary mb-3 leading-relaxed text-center">Paste, drop, or upload your resume.</p>
      <div className="flex items-center justify-center gap-2 mb-3">
        <label className="btn-secondary cursor-pointer">
          <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e)=>{
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setText(String(reader.result || ''));
            reader.readAsText(file);
          }} />
          Upload
        </label>
      </div>
      <textarea
        className="w-full border border-border rounded-lg p-3 mb-3" rows={8}
        value={text} onChange={(e)=>setText(e.target.value)}
        placeholder="Paste resume here..."
      />
      <div className="flex items-center justify-center gap-2">
        <button className="btn-primary" onClick={analyze}>Analyze</button>
        <button className="btn-secondary" onClick={()=>setText('')}>Clear</button>
      </div>
      {result && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Parsed</h4>
            <pre className="text-xs bg-secondary p-3 rounded">{JSON.stringify(result.parsed, null, 2)}</pre>
          </div>
          <div>
            <h4 className="font-medium">Suggestions</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {result.suggestedSkills?.map((s)=> (<span key={s} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full">{s}</span>))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
