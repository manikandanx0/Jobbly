import Link from 'next/link';
import { useRouter } from 'next/router';
import { HomeIcon, ToolboxIcon, PencilIcon, UserIcon, CheckBadgeIcon } from '@/components/icons';

export default function Sidebar() {
  const router = useRouter();
  const items = [
    { href: '/', label: 'Home', Icon: HomeIcon },
    { href: '/freelance', label: 'Freelance', Icon: ToolboxIcon },
    { href: '/applications', label: 'Applications', Icon: CheckBadgeIcon },
    { href: '/recruiter/dashboard', label: 'Recruiter', Icon: PencilIcon },
    { href: '/portfolio', label: 'Profile', Icon: UserIcon }
  ];
  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[320px] flex-col py-6 bg-sidebarBg text-textPrimary border-r border-border">
      <div className="px-6 py-2 text-xl font-bold">Jobbly</div>
      <nav className="mt-2 flex-1 overflow-y-auto">
        {items.map(({ href, label, Icon }) => {
          const active = href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-6 py-3 mx-3 my-1 rounded-lg transition ${active ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-secondary/50'}`} aria-current={active ? 'page' : undefined}>
              <Icon className="w-5 h-5" />
              <span className="text-sm">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
