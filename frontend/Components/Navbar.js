import Link from 'next/link';
import MultiLangSwitcher from '@/components/MultiLangSwitcher';
import { useI18n } from '@/utils/i18n';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, HomeIcon, ToolboxIcon, PencilIcon, CheckBadgeIcon, SearchIcon } from '@/components/icons';

export default function Navbar({ onMenuClick }) {
  const { t } = useI18n();
  const router = useRouter();
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
          <motion.div whileHover={{ y: -1 }}>
            <Link href="/" className="w-10 h-10 grid place-items-center rounded-lg hover:bg-secondary cursor-pointer" aria-label="Home"><HomeIcon /></Link>
          </motion.div>
          <motion.div whileHover={{ y: -1 }}>
            <Link href="/freelance" className="w-10 h-10 grid place-items-center rounded-lg hover:bg-secondary cursor-pointer" aria-label="Freelance"><ToolboxIcon /></Link>
          </motion.div>
          <motion.div whileHover={{ y: -1 }}>
            <Link href="/applications" className="w-10 h-10 grid place-items-center rounded-lg hover:bg-secondary cursor-pointer" aria-label="Applications"><CheckBadgeIcon /></Link>
          </motion.div>
          <motion.div whileHover={{ y: -1 }}>
            <Link href="/recruiter/dashboard" className="w-10 h-10 grid place-items-center rounded-lg hover:bg-secondary cursor-pointer" aria-label="Recruiter"><PencilIcon /></Link>
          </motion.div>
          <button className="w-10 h-10 grid place-items-center rounded-lg hover:bg-secondary" aria-label="Notifications">🔔</button>
          <button className="w-10 h-10 grid place-items-center rounded-lg hover:bg-secondary" aria-label="Profile">👤</button>
          <MultiLangSwitcher />
        </nav>
      </div>
    </header>
  );
}
