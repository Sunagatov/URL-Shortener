import { FaBolt, FaChartLine, FaQrcode, FaRocket, FaShieldAlt } from 'react-icons/fa';

export const landingFeatures = [
  {
    icon: FaRocket,
    title: 'Lightning Fast',
    description: 'Create short URLs in seconds with our optimized platform',
    color: 'from-blue-500 to-blue-700',
    glow: 'shadow-blue-500/20',
  },
  {
    icon: FaShieldAlt,
    title: 'Secure & Reliable',
    description: 'Your links are protected with enterprise-grade security',
    color: 'from-violet-500 to-purple-700',
    glow: 'shadow-purple-500/20',
  },
  {
    icon: FaChartLine,
    title: 'Analytics & Insights',
    description: 'Track clicks, analyze traffic, and measure performance',
    color: 'from-emerald-500 to-teal-700',
    glow: 'shadow-emerald-500/20',
  },
  {
    icon: FaQrcode,
    title: 'QR Code Generation',
    description: 'Generate QR codes for effortless mobile sharing',
    color: 'from-rose-500 to-pink-700',
    glow: 'shadow-rose-500/20',
  },
] as const;

export const landingStats = [
  {
    number: '10M+',
    label: 'URLs Shortened',
    sublabel: 'tracked & growing',
    dotColor: 'bg-blue-400',
    gradient: 'from-blue-400 to-cyan-300',
  },
  {
    number: '500K+',
    label: 'Happy Users',
    sublabel: 'trusting our platform',
    dotColor: 'bg-violet-400',
    gradient: 'from-violet-400 to-purple-300',
  },
  {
    number: '99.9%',
    label: 'Uptime SLA',
    sublabel: 'guaranteed reliability',
    dotColor: 'bg-emerald-400',
    gradient: 'from-emerald-400 to-teal-300',
  },
  {
    number: '24/7',
    label: 'Support',
    sublabel: 'human, always available',
    dotColor: 'bg-rose-400',
    gradient: 'from-rose-400 to-pink-300',
  },
] as const;

export const heroHighlights = [
  { label: 'No account needed', color: 'bg-emerald-400' },
  { label: 'Free to use', color: 'bg-blue-400' },
  { label: 'Links never expire', color: 'bg-purple-400' },
] as const;

export const heroBadgeIcon = FaBolt;
