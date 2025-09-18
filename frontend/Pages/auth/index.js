import { useEffect, useState } from 'react';
import { login, signup } from '@/utils/authStub';
import SEO from '@/components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import AuthSlider from '@/components/AuthSlider';
import { useI18n } from '@/utils/i18n';
import { withAuthRedirect } from '@/utils/serverAuth';

export default function Auth() {
  const { t } = useI18n();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [psid, setPsid] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear form when switching between login/signup
  useEffect(() => {
    setEmail('');
    setPsid('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setError('');
  }, [isLogin]);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password, psid });
      window.location.href = '/';
    } catch (err) {
      setError(err?.message || t('invalid_credentials'));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/users/signup', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email, password, name }) 
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Signup failed');
      }
      
      // Auto-login after successful signup
      await login({ email, password });
      window.location.href = '/';
    } catch (err) {
      setError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO title={isLogin ? t('login') : t('sign_up')} />
      <main className="min-h-screen grid md:grid-cols-2 bg-white">
        <section className="hidden md:block bg-[#00A9E0] text-white">
          <AuthSlider onBlue />
        </section>
        <section className="relative p-6 md:p-10 flex items-center justify-center w-full">
          <div className="absolute top-4 right-6 flex items-center gap-3">
            <span className="text-2xl font-semibold text-[#333333]">{t('app_title')}</span>
            <img src="/images/logo.png" alt="Jobbly" className="h-14 w-auto rounded" />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.35 }} 
            className="w-full max-w-md rounded-lg border border-[#E0E0E0] shadow-[0_2px_10px_rgba(0,0,0,0.1)] bg-white"
          >
            {/* Toggle Buttons */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  isLogin 
                    ? 'text-[#00A9E0] border-b-2 border-[#00A9E0]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('login')}
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  !isLogin 
                    ? 'text-[#00A9E0] border-b-2 border-[#00A9E0]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('sign_up')}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={isLogin ? handleLogin : handleSignup}
                className="p-6 space-y-4"
              >
                {!!error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 bg-red-50 p-3 rounded-lg"
                  >
                    {error}
                  </motion.div>
                )}

                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('name') || 'Name'}
                    </label>
                    <input
                      className="input mt-1"
                      type="text"
                      placeholder={t('name_placeholder') || 'Your name'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: isLogin ? 0.1 : 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('email')}
                  </label>
                  <input
                    className="input mt-1"
                    type="email"
                    placeholder={t('email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: isLogin ? 0.2 : 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('password')}
                  </label>
                  <input
                    className="input mt-1"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </motion.div>

                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      className="input mt-1"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={!isLogin}
                    />
                  </motion.div>
                )}

                {isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between"
                  >
                    <label className="inline-flex items-center gap-2 text-sm text-[#0078D4]">
                      <input type="checkbox" className="rounded" /> 
                      {t('remember_me')}
                    </label>
                    <a href="#" className="text-sm text-[#0078D4] hover:underline">
                      {t('forgot_password')}
                    </a>
                  </motion.div>
                )}

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: isLogin ? 0.4 : 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="w-full rounded-xl bg-[#00A9E0] text-white py-3 shadow-[0_8px_24px_rgba(0,0,0,0.2)] font-medium"
                  disabled={loading}
                >
                  {loading 
                    ? (isLogin ? t('signing_in') : 'Creating Account...') 
                    : (isLogin ? t('login') : t('sign_up'))
                  }
                </motion.button>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: isLogin ? 0.5 : 0.6 }}
                  className="text-sm text-[#0078D4] text-center"
                >
                  {isLogin ? t('no_account') : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="hover:underline font-medium"
                  >
                    {isLogin ? t('sign_up') : t('login')}
                  </button>
                </motion.div>
              </motion.form>
            </AnimatePresence>
          </motion.div>
        </section>
      </main>
    </>
  );
}

// Server-side authentication redirect
export const getServerSideProps = withAuthRedirect();
