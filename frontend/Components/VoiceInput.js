import { useEffect, useRef, useState } from 'react';
import Card from '@/components/Card';

export default function VoiceInput() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [notes, setNotes] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e) => {
        let text = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
        }
        setTranscript(text);
      };
      recognitionRef.current = rec;
    }
  }, []);

  function start() { recognitionRef.current?.start(); setListening(true); }
  function stop() { recognitionRef.current?.stop(); setListening(false); }

  async function refreshNotes(){
    const r = await fetch('/api/voice-notes');
    const d = await r.json();
    setNotes(d.items || []);
  }

  useEffect(()=>{ refreshNotes(); }, []);

  async function saveNote() {
    await fetch('/api/voice-notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript }) });
    setTranscript('');
    refreshNotes();
  }

  return (
    <Card variant="glass" className="p-5 md:p-6 motion-ready hover:shadow-lg transition-shadow">
      <h3 className="text-h3 font-semibold mb-2 text-center">Voice Notes</h3>
      <div className="flex items-center justify-center gap-2 mb-3">
        {!listening ? (<button className="px-3 py-1 bg-primary text-white rounded" onClick={start}>Start</button>) : (<button className="px-3 py-1 bg-secondary rounded" onClick={stop}>Stop</button>)}
        <button className="px-3 py-1 bg-accent text-white rounded" onClick={saveNote}>Save as Note</button>
      </div>
      <div className="text-sm text-textSecondary bg-secondary rounded p-3 min-h-[60px]">{transcript || 'Say something...'}</div>
      {notes.length > 0 && (
        <div className="mt-3">
          <h4 className="font-medium">Saved Notes</h4>
          <ul className="mt-2 space-y-2">
            {notes.map(n => (
              <li key={n.id} className="text-sm bg-secondary rounded p-2">{n.transcript}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
