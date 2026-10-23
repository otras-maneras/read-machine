import type { ReaderLayout, ReadingMode } from '../../engines/types';
import { Icon } from '../ui/Icon';

interface ControlBarProps {
  isPlaying: boolean;
  wpm: number;
  mode: ReadingMode;
  layout: ReaderLayout;
  bionicWordsPerChunk: number;
  onTogglePlay: () => void;
  onSeek: (delta: number) => void;
  onRestart: () => void;
  onWpmChange: (wpm: number) => void;
  onModeChange: (mode: ReadingMode) => void;
  onLayoutChange: (layout: ReaderLayout) => void;
  onSettings: () => void;
  onBookmarks: () => void;
  onFullscreen: () => void;
  onBack: () => void;
}

const MODES: { id: ReadingMode; label: string }[] = [
  { id: 'hybrid', label: 'Híbrido' },
  { id: 'rsvp', label: 'RSVP' },
  { id: 'bionic', label: 'Bionic' },
];

const LAYOUTS: { id: ReaderLayout; label: string }[] = [
  { id: 'rsvp', label: 'Rápida' },
  { id: 'scroll', label: 'Página' },
];

/** Dock flotante del lector: vista y modo arriba, reproducción y velocidad abajo. */
export function ControlBar({
  isPlaying,
  wpm,
  mode,
  layout,
  onTogglePlay,
  onSeek,
  onRestart,
  onWpmChange,
  onModeChange,
  onLayoutChange,
  onSettings,
  onBookmarks,
  onFullscreen,
}: ControlBarProps) {
  return (
    <div className="px-3 pt-2">
      <div className="rm-window mx-auto flex max-w-2xl flex-col gap-2.5 p-2.5 sm:p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="rm-seg shrink-0" role="group" aria-label="Vista">
            {LAYOUTS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={layout === item.id}
                onClick={() => onLayoutChange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {layout === 'rsvp' && (
            <div
              className="rm-seg order-last basis-full sm:order-none sm:basis-auto sm:flex-1"
              role="group"
              aria-label="Modo de lectura"
            >
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={mode === m.id}
                  onClick={() => onModeChange(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          <div className="ml-auto flex shrink-0 gap-0.5">
            <button type="button" onClick={onBookmarks} className="rm-icon-btn" title="Marcadores">
              <Icon name="bookmark" />
            </button>
            <button type="button" onClick={onSettings} className="rm-icon-btn" title="Ajustes">
              <Icon name="settings" />
            </button>
            <button
              type="button"
              onClick={onFullscreen}
              className="rm-icon-btn"
              title="Pantalla completa"
            >
              <Icon name="fullscreen" />
            </button>
          </div>
        </div>

        {layout === 'rsvp' && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onSeek(-10)}
              className="rm-icon-btn"
              title="Atrás 10 palabras"
            >
              <Icon name="rewind" />
            </button>
            <button
              type="button"
              onClick={onTogglePlay}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-reader-text text-reader-bg transition-transform active:scale-95 [&_svg]:h-5 [&_svg]:w-5"
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              <Icon name={isPlaying ? 'pause' : 'play'} />
            </button>
            <button
              type="button"
              onClick={() => onSeek(10)}
              className="rm-icon-btn"
              title="Adelante 10 palabras"
            >
              <Icon name="forward" />
            </button>
            <button type="button" onClick={onRestart} className="rm-icon-btn" title="Desde el principio">
              <Icon name="restart" />
            </button>

            <label className="ml-1 flex min-w-0 flex-1 items-center gap-2.5 sm:ml-2">
              <span className="rm-label shrink-0">Ppm</span>
              <input
                type="range"
                min={100}
                max={2000}
                step={25}
                value={wpm}
                onChange={(e) => onWpmChange(Number(e.target.value))}
                className="rm-range flex-1"
                aria-label="Palabras por minuto"
              />
              <span className="w-10 shrink-0 text-right text-xs tabular-nums">{wpm}</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
