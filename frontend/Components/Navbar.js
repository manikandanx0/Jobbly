import Link from 'next/link';
import MultiLangSwitcher from '@/components/MultiLangSwitcher';
import { useI18n } from '@/utils/i18n';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, SearchIcon } from '@/components/icons';
import { useState, useRef, useEffect } from 'react';

export default function Navbar({ onMenuClick }) {
  const { t } = useI18n();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(()=>{
    function onDoc(e){
      if (!notifRef.current || !profileRef.current) return;
      if (!notifRef.current.contains(e.target)) setShowNotifications(false);
      if (!profileRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener('mousedown', onDoc);
    return ()=> document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <header className="w-full header-glass text-textPrimary sticky top-0 z-40">
      <div className="w-full px-6 md:px-10 lg:px-14 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="md:hidden w-10 h-10 grid place-items-center rounded-lg hover:bg-secondary" aria-label="Menu" onClick={onMenuClick}>☰</button>
          {router.pathname !== '/' && (
            <button onClick={() => router.back()} aria-label="Back" className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary transition">
              <ArrowLeftIcon />
              <span className="text-sm">{t('back')}</span>
            </button>
          )}
          <Link href="/" className="font-semibold text-h2 motion-ready">{t('app_title')}</Link>
        </div>
        <nav className="flex items-center gap-3">
          <div className="hidden md:flex items-center relative group">
            <motion.div
              className="relative flex items-center"
              initial={{ width: 40 }}
              whileHover={{ width: 360 }}
            >
              <motion.button
                aria-label="Search"
                className="w-10 h-10 grid place-items-center rounded-full hover:bg-secondary text-textSecondary absolute left-0"
                initial={{ opacity: 1 }}
                whileHover={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <SearchIcon />
              </motion.button>
              <motion.input
                className="input pl-10 rounded-full w-full"
                placeholder="Search"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                onFocus={(e)=>{ /* ensure visible when focused via keyboard */ e.currentTarget.style.opacity = '1'; }}
              />
              <motion.span className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" initial={{ x: 0, opacity: 0 }} whileHover={{ x: 4, opacity: 1 }}>
                <SearchIcon />
              </motion.span>
            </motion.div>
          </div>
          <div className="relative" ref={notifRef}>
            <button className="w-10 h-10 grid place-items-center rounded-lg hover:bg-secondary" aria-label="Notifications" onClick={()=> setShowNotifications((v)=>!v)}>🔔</button>
            <AnimatePresence>
            {showNotifications && (
              <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity:1, y: 4, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.12 }} className="absolute right-0 mt-1 w-72 rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xl p-3">
                <div className="text-sm font-medium mb-2">Notifications</div>
                <div className="text-sm text-textSecondary">No new notifications</div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
          <div className="relative" ref={profileRef}>
            <button className="w-10 h-10 grid place-items-center rounded-lg hover:bg-secondary" aria-label="Profile" onClick={()=> setShowProfile((v)=>!v)}>👤</button>
            <AnimatePresence>
            {showProfile && (
              <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity:1, y: 4, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.12 }} className="absolute right-0 mt-1 w-56 rounded-xl border border-border bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-secondary" onClick={()=> { setShowProfile(false); router.push('/portfolio'); }}>Profile</button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-secondary" onClick={()=> { setShowProfile(false); router.push('/auth/login'); }}>Login</button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-secondary" onClick={()=> { setShowProfile(false); router.push('/auth/signup'); }}>Sign up</button>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
          <MultiLangSwitcher />
        </nav>
      </div>
    </header>
  );
}
