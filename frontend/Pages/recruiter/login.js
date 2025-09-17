import AuthForm from '@/components/AuthForm';
import { login } from '@/utils/authStub';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';

export default function RecruiterLogin(){
  return (
    <Layout>
      <SEO title="Recruiter Login" />
      <main className="py-6">
        <AuthForm mode="login" onSubmit={async (c)=>{ await login(c); location.href='/recruiter/dashboard'; }} />
      </main>
    </Layout>
  );
}
