import type { IconType } from 'react-icons';
import { FaChartBar, FaLink, FaShieldAlt, FaTachometerAlt, FaUser } from 'react-icons/fa';
import { routes } from '@/app/routes';

export const accountNavigationItems: Array<{ icon: IconType; label: string; path: string }> = [
  { icon: FaTachometerAlt, label: 'Dashboard', path: routes.dashboard },
  { icon: FaChartBar, label: 'Analytics', path: routes.analytics },
  { icon: FaLink, label: 'My URLs', path: routes.urlMappings },
  { icon: FaShieldAlt, label: 'Security', path: routes.security },
  { icon: FaUser, label: 'Profile', path: routes.profile },
];
