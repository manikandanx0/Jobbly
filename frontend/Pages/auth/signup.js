import AuthForm from '@/components/AuthForm';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';

export default function Signup(){
  return (
    <Layout>
      <SEO title="Sign Up" />
      <main className="py-6">
        <AuthForm mode="signup" onSubmit={async ()=>{ alert('Signed up (mock)'); }} />
      </main>
    </Layout>
  );
}
