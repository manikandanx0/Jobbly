export default async function handler(req, res) {
  const { text = '' } = req.body || {};
  // Placeholder NLP parse: extract naive fields
  const emailMatch = text.match(/[w.-]+@[w.-]+.[A-Za-z]{2,}/);
  const name = (text.split(/
|,/)[0] || '').trim();
  const skills = Array.from(new Set(text.match(/react|node|python|nlp|tailwind/gi) || [])).map(s=>s.toLowerCase());
  const parsed = { name, email: emailMatch?.[0] || '', skills, education: [], experience: [] };
  const suggestedSkills = ['typescript','testing','docker'].filter(s=>!skills.includes(s));
  res.status(200).json({ parsed, suggestedSkills });
}
