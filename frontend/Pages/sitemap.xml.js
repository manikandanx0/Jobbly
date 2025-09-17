export default function handler(req, res){
  const base = 'http://localhost:3000';
  const urls = ['/', '/applications', '/freelance', '/recruiter/login', '/recruiter/dashboard'];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map(u => `<url><loc>${base}${u}</loc></url>`).join('') +
    `</urlset>`;
  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(body);
}





