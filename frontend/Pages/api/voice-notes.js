let notes = [];
export default function handler(req, res){
  if (req.method === 'POST') { const { transcript } = req.body || {}; notes.push({ id: notes.length+1, transcript, at: Date.now() }); return res.status(200).json({ ok: true }); }
  res.status(200).json({ items: notes });
}
