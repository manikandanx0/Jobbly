import { useEffect, useState } from 'react';

export function useSuggestions(query = '') {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(()=>{
    setLoading(true);
    const url = '/api/suggestions' + (query ? ('?q=' + encodeURIComponent(query)) : '');
    fetch(url).then(r=>r.json()).then((d)=>setData(d.items || [])).finally(()=>setLoading(false));
  }, [query]);
  return { data, loading };
}
