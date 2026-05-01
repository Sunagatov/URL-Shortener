import {
  cloneElement,
  isValidElement,
  type PropsWithChildren,
  type ReactElement,
  useId,
  useState,
} from 'react';

interface TooltipProps extends PropsWithChildren {
  content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
  const tooltipId = useId();
  const [isVisible, setIsVisible] = useState(false);

  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, {
        'aria-describedby': isVisible ? tooltipId : undefined,
      })
    : children;

  return (
    <span
      className="relative inline-flex"
      onBlur={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {child}
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 -translate-x-1/2 rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-overlay)] px-3 py-1.5 text-xs font-medium text-[color:var(--text-primary)] shadow-[0_14px_32px_rgba(4,10,24,0.24)] transition duration-150 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
        }`}
      >
        <span className="whitespace-nowrap">{content}</span>
      </span>
    </span>
  );
}
