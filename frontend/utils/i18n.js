import { createContext, useContext, useEffect, useState } from 'react';

const I18nContext = createContext({ t: (k)=>k, lang: 'en', setLang: ()=>{} });

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [dict, setDict] = useState({});
  // Initialize from localStorage
  useEffect(()=>{
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('lang');
    if (saved) setLang(saved);
  }, []);
  // Load dictionary when lang changes
  useEffect(()=>{ 
    fetch('/locales/' + lang + '.json')
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then(setDict)
      .catch(err => {
        console.warn('Failed to load language file:', err);
        setDict({});
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
      console.warn(`Missing translation for key: ${k} in language: ${lang}`);
    }
    return result;
  };
  return <I18nContext.Provider value={{ t, lang, setLang }}>{children}</I18nContext.Provider>;
}

export function useI18n(){ return useContext(I18nContext); }
