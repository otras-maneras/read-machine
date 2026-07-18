import type { ReaderLayout, ReadingMode } from '../../engines/types';

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
    <div className="border-t border-reader-border bg-reader-bg/90 px-2 py-2 backdrop-blur-xl sm:px-3">
      <div className="ot-panel mx-auto flex max-w-2xl flex-col gap-2 p-2 sm:p-2.5">
        {/* Fila 1: vista + modo + utilidades */}
        <div className="flex items-center gap-2">
          <div className="flex shrink-0 rounded-lg border border-reader-border bg-reader-bg/50 p-0.5">
            {(['rsvp', 'scroll'] as ReaderLayout[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onLayoutChange(item)}
                className={`ot-btn px-2.5 py-1.5 capitalize ${
                  layout === item
                    ? 'bg-reader-accent text-white shadow-sm'
                    : 'bg-transparent text-reader-muted hover:text-reader-text'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {layout === 'rsvp' && (
            <div className="flex min-w-0 flex-1 rounded-lg border border-reader-border bg-reader-bg/40 p-0.5">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onModeChange(m.id)}
                  className={`ot-btn flex-1 px-1 py-1.5 ${
                    mode === m.id
                      ? 'bg-reader-text text-reader-bg'
                      : 'bg-transparent text-reader-muted hover:text-reader-text'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {layout === 'scroll' && <div className="flex-1" />}

          <div className="flex shrink-0 gap-1">
            <button type="button" onClick={onBookmarks} className="ot-btn ot-btn-ghost h-9 w-9 p-0" title="Marcadores">
              🔖
            </button>
            <button type="button" onClick={onSettings} className="ot-btn ot-btn-ghost h-9 w-9 p-0" title="Ajustes">
              ⚙
            </button>
            <button type="button" onClick={onFullscreen} className="ot-btn ot-btn-ghost h-9 w-9 p-0" title="Pantalla completa">
              ⛶
            </button>
          </div>
        </div>

        {/* Fila 2 (solo RSVP): transport + WPM */}
        {layout === 'rsvp' && (
          <div className="flex items-center gap-2">
            <div className="flex shrink-0 gap-1">
              <button type="button" onClick={() => onSeek(-10)} className="ot-btn ot-btn-ghost h-11 min-w-11 px-2 text-xs">
                −10
              </button>
            </div>

            <button
              type="button"
              onClick={onTogglePlay}
              className="ot-btn ot-btn-primary flex h-11 w-14 shrink-0 rounded-xl text-lg"
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            <div className="flex shrink-0 gap-1">
              <button type="button" onClick={() => onSeek(10)} className="ot-btn ot-btn-ghost h-11 min-w-11 px-2 text-xs">
                +10
              </button>
              <button type="button" onClick={onRestart} className="ot-btn ot-btn-ghost h-11 min-w-11 px-2" title="Reiniciar">
                ↺
              </button>
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-reader-border bg-reader-bg/40 px-2.5 py-1.5">
              <span className="shrink-0 text-[11px] font-bold text-reader-muted">WPM</span>
              <input
                type="range"
                min={100}
                max={2000}
                step={25}
                value={wpm}
                onChange={(e) => onWpmChange(Number(e.target.value))}
                className="h-8 min-w-0 flex-1 accent-reader-accent"
              />
              <span className="w-9 shrink-0 text-right text-[11px] font-bold tabular-nums text-reader-text">
                {wpm}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
