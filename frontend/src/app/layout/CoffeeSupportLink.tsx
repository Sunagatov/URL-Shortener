import { SiBuymeacoffee } from 'react-icons/si';

export const CoffeeSupportLink = ({ compact = false }: { compact?: boolean }) => (
  <a
    href="https://buymeacoffee.com/lucky_1uck"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Buy me a coffee (opens in a new tab)"
    title="Support Shorty URL on Buy Me a Coffee"
    style={{ color: '#111111' }}
    className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#FFDD00] text-sm font-semibold transition-colors hover:bg-[#F3CE00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFDD00] ${
      compact ? 'w-10 sm:w-auto sm:px-3' : 'px-4'
    }`}
  >
    <SiBuymeacoffee className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
    <span className={compact ? 'hidden sm:inline' : undefined}>Buy me a coffee</span>
  </a>
);
