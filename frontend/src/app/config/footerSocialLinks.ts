import type { IconType } from 'react-icons';
import { FaGithub, FaLinkedin, FaTelegram } from 'react-icons/fa';

export const footerSocialLinks: Array<{ href: string; icon: IconType; label: string }> = [
  { href: 'https://github.com/Sunagatov/URL-Shortener', icon: FaGithub, label: 'GitHub' },
  { href: 'https://t.me/zufarexplained', icon: FaTelegram, label: 'Telegram' },
  {
    href: 'https://www.linkedin.com/in/zufar-sunagatov/',
    icon: FaLinkedin,
    label: 'LinkedIn',
  },
];
