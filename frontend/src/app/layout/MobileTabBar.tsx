import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaLink, FaUserCircle } from 'react-icons/fa';
import { routes } from '@/app/routes';

const tabItems = [
  {
    icon: FaHome,
    label: 'Home',
    path: routes.home,
    isActive: (pathname: string) => pathname === routes.home,
  },
  {
    icon: FaLink,
    label: 'My URLs',
    path: routes.urlMappings,
    isActive: (pathname: string) => pathname.startsWith(routes.urlMappings),
  },
  {
    icon: FaUserCircle,
    label: 'Account',
    path: routes.account,
    isActive: (pathname: string) =>
      pathname.startsWith(routes.account) && !pathname.startsWith(routes.urlMappings),
  },
] as const;

export function MobileTabBar() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-3 bottom-3 z-[58] rounded-[1.75rem] border border-white/10 bg-[#0b1020]/90 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="grid grid-cols-3 gap-2">
        {tabItems.map(item => {
          const Icon = item.icon;
          const active = item.isActive(pathname);

          return (
            <Link
              key={item.label}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-[4rem] flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                active
                  ? 'bg-blue-500/18 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'text-white/45 hover:bg-white/[0.06] hover:text-white/80'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-blue-300' : 'text-white/35'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
