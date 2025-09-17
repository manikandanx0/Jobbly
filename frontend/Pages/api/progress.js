let state = { current: 'Applied', timeline: [{ date: '2025-08-01', stage: 'Applied' }] };
export default function handler(req, res){
  if (req.method === 'POST') {
    const { current } = req.body || {};
    if (current) { state.current = current; state.timeline.push({ date: new Date().toISOString().slice(0,10), stage: current }); }
    return res.status(200).json(state);
  }
  res.status(200).json(state);
}
