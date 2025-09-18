import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isLoggedIn } from '@/utils/authStub';

const I18nContext = createContext({ t: (k)=>k, lang: 'en', setLang: ()=>{} });

export function I18nProvider({ children }) {
  const router = useRouter();
  const [lang, setLang] = useState('en');
  const [dict, setDict] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize from localStorage
  useEffect(()=>{
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('lang');
    if (saved) setLang(saved);
  }, []);
  
  // Load dictionary when lang changes
  useEffect(()=>{ 
    setIsLoading(true);
    fetch('/locales/' + lang + '.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then(data => {
        setDict(data);
        setIsLoading(false);
        
        // Server-side authentication is now handled by middleware
      })
      .catch(err => {
        console.error('Failed to load language file:', err);
        setDict({});
        setIsLoading(false);
      }); 
  }, [lang]);
  // Persist language
  useEffect(()=>{
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('lang', lang);
  }, [lang]);
  const t = (k) => {
    const result = dict[k] || k;
    if (process.env.NODE_ENV === 'development' && !dict[k]) {
      console.warn(`Missing translation for key: ${k} in language: ${lang}. Dict keys:`, Object.keys(dict));
    }
    return result;
  };
  return <I18nContext.Provider value={{ t, lang, setLang, isLoading }}>{children}</I18nContext.Provider>;
}

export function useI18n(){ return useContext(I18nContext); }
