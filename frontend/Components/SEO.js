import Head from 'next/head';

export default function SEO({ title = 'Jobbly', description = 'Find internships and freelance work', url = '', image = '' }){
  const fullTitle = title ? `${title} | Jobbly` : 'Jobbly';
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
}



