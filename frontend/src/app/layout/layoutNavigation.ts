import type { IconType } from 'react-icons';
import {
  FaGithub,
  FaLinkedin,
  FaLink,
  FaShieldAlt,
  FaTachometerAlt,
  FaTelegram,
  FaUser,
} from 'react-icons/fa';
import { routes } from '@/app/routes';

export const accountNavigationItems: Array<{ icon: IconType; label: string; path: string }> = [
  { icon: FaTachometerAlt, label: 'Dashboard', path: routes.dashboard },
  { icon: FaLink, label: 'My URLs', path: routes.urlMappings },
  { icon: FaShieldAlt, label: 'Security', path: routes.security },
  { icon: FaUser, label: 'Profile', path: routes.profile },
];

export const footerSocialLinks: Array<{ href: string; icon: IconType; label: string }> = [
  { href: 'https://github.com/Sunagatov/URL-Shortener', icon: FaGithub, label: 'GitHub' },
  { href: 'https://t.me/zufarexplained', icon: FaTelegram, label: 'Telegram' },
  {
    href: 'https://www.linkedin.com/in/zufar-sunagatov/',
    icon: FaLinkedin,
    label: 'LinkedIn',
  },
];
