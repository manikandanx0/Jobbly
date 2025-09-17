let events = [];
export default function handler(req, res){
  if (req.method === 'POST'){
    const { type, payload } = req.body || {};
    events.push({ id: events.length+1, ts: Date.now(), type, payload });
    return res.status(200).json({ ok: true });
  }
  res.status(200).json({ events });
}





