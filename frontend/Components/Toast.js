import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({ notify: (m)=>{}, toasts: [] });

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([]);
  const notify = useCallback((message, type='info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(()=> setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  const startVoiceCapture = async (onText) => {
    try {
      const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Rec) return;
      const rec = new Rec();
      rec.continuous = false; rec.interimResults = false;
      rec.onresult = (e)=>{ const t = e.results?.[0]?.[0]?.transcript; if (t && onText) onText(t); };
      rec.start();
    } catch {}
  };

  return (
    <ToastContext.Provider value={{ notify, toasts, startVoiceCapture }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2 rounded shadow-subtle text-white ${t.type==='error' ? 'bg-red-600' : t.type==='success' ? 'bg-green-600' : 'bg-textPrimary'}`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(){ return useContext(ToastContext); }



