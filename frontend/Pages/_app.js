import '@/styles/globals.css';
import { I18nProvider } from '@/utils/i18n';
import { Inter } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { ToastProvider } from '@/components/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useEffect } from 'react';
import { isLoggedIn } from '@/utils/authStub';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }) {
  const router = useRouter();
  useEffect(()=>{
    const isAuthRoute = router.pathname.startsWith('/auth/');
    if (!isAuthRoute && !isLoggedIn()){
      router.replace('/auth/login');
    }
  }, [router.pathname]);
  return (
    <I18nProvider>
      <ToastProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-primary focus:text-white focus:px-3 focus:py-2 focus:rounded">Skip to content</a>
        <AnimatePresence mode="wait">
          <motion.div
            key={router.asPath}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className={inter.className}>
              <ErrorBoundary>
                <Component {...pageProps} />
              </ErrorBoundary>
            </div>
          </motion.div>
        </AnimatePresence>
      </ToastProvider>
    </I18nProvider>
  );
}
