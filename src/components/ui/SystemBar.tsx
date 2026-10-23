import { useEffect, useState, type ReactNode } from 'react';
import { useReaderStore } from '../../stores/reader-store';
import { Icon } from './Icon';

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

/** Alterna claro/oscuro como el botón ◐ de otrasmaneras (desde Papel o Sepia vuelve a oscuro). */
export function ThemeToggle() {
  const { preferences, setTheme } = useReaderStore();
  return (
    <button
      type="button"
      className="rm-bar-btn"
      onClick={() => setTheme(preferences.theme === 'dark' ? 'light' : 'dark')}
      title="Cambiar tema"
      aria-label="Cambiar tema"
    >
      <Icon name="theme" />
    </button>
  );
}

/**
 * Barra superior tipo sistema operativo: marca a la izquierda, tema y reloj a la derecha.
 * `left`/`center` reemplazan la marca (por ejemplo, «← Biblioteca» y el título en el lector).
 */
export function SystemBar({
  left,
  center,
  right,
}: {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}) {
  const time = useClock();
  return (
    <div className="safe-top shrink-0">
      <div className="rm-bar relative">
        <div className="flex min-w-0 items-center gap-1">
          {left ?? (
            <span className="rm-bar-btn pointer-events-none">
              <img src="/favicon.svg" alt="" className="h-4 w-4 rounded-[4px]" />
              <span className="rm-brand">Read Machine</span>
            </span>
          )}
        </div>
        {center && (
          <div className="pointer-events-none absolute inset-x-28 truncate text-center sm:inset-x-48">
            {center}
          </div>
        )}
        <div className="flex shrink-0 items-center gap-1">
          {right}
          <ThemeToggle />
          <span className="hidden px-2 tabular-nums sm:inline">{time}</span>
        </div>
      </div>
    </div>
  );
}
