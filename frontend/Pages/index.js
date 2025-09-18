export default function Landing() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-3xl text-center p-8">
        <img src="/images/logo.png" alt="Jobbly" className="h-16 mx-auto mb-6" />
        <h1 className="text-4xl font-semibold text-[#333333] mb-3">Find Internships and Freelance Jobs</h1>
        <p className="text-gray-600 mb-8">Multilingual job search, recruiter tools, resume analysis, and more.</p>
        <div className="flex gap-4 justify-center">
          <a href="/auth/talent" className="px-5 py-3 rounded-xl bg-[#00A9E0] text-white shadow">Talent: Sign up / Login</a>
          <a href="/auth/recruit" className="px-5 py-3 rounded-xl border border-[#E0E0E0] text-[#0078D4]">Recruiter: Sign up / Login</a>
        </div>
      </div>
    </main>
  );
}
