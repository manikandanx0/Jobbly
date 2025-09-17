import Link from 'next/link';
import SEO from '@/components/SEO';
import Layout from '@/components/Layout';
import Card from '@/components/Card';

export default function NotFound(){
  return (
    <Layout>
      <main className="min-h-[60vh] flex items-center justify-center text-textPrimary p-6">
        <SEO title="404 Not Found" />
        <Card variant="glass" className="p-6 text-center">
          <h1 className="text-h1 font-semibold">404</h1>
          <p className="mt-2 text-textSecondary">The page you’re looking for doesn’t exist.</p>
          <Link href="/" className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded">Go Home</Link>
        </Card>
      </main>
    </Layout>
  );
}


