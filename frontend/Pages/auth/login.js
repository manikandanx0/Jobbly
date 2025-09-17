import AuthForm from '@/components/AuthForm';
import { login } from '@/utils/authStub';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';

export default function Login(){
  return (
    <Layout>
      <SEO title="Login" />
      <main className="py-6">
        <AuthForm mode="login" onSubmit={async (c)=>{ await login(c); alert('Logged in (mock)'); }} />
      </main>
    </Layout>
  );
}
