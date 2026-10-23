/* Íconos de trazo fino (24×24, stroke 1.5), en la línea de los de otrasmaneras.com. */
const PATHS = {
  back: <path d="M15 5l-7 7 7 7" />,
  play: <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none" />,
  pause: <path d="M7 4.5h3.5v15H7zM13.5 4.5H17v15h-3.5z" fill="currentColor" stroke="none" />,
  rewind: (
    <>
      <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none">
        10
      </text>
    </>
  ),
  forward: (
    <>
      <path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v4.5h-4.5" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none">
        10
      </text>
    </>
  ),
  restart: <path d="M4 4v5h5M4.5 15a8 8 0 1 0 1.9-8.3L4 9" />,
  bookmark: <path d="M6.5 3.5h11v17l-5.5-4-5.5 4z" />,
  settings: (
    <>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </>
  ),
  fullscreen: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  file: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4.5" width="14" height="16.5" rx="2" />
      <path d="M9 4.5V3h6v1.5M9 10h6M9 14h6" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  theme: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none" />
    </>
  ),
  upload: <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      {PATHS[name]}
    </svg>
  );
}

