import type { Theme, UserPreferences } from '../../engines/types';
import { useReaderStore } from '../../stores/reader-store';
import { StatsSection } from './StatsSection';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const THEMES: { id: Theme; label: string }[] = [
  { id: 'dark', label: 'Oscuro' },
  { id: 'paper', label: 'Papel' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'light', label: 'Claro' },
];

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const { preferences, updatePreferences, setTheme } = useReaderStore();

  if (!open) return null;

  const updateBionic = (partial: Partial<UserPreferences['bionic']>) => {
    updatePreferences({ bionic: { ...preferences.bionic, ...partial } });
  };

  const updateMicropause = (partial: Partial<UserPreferences['micropauses']>) => {
    updatePreferences({ micropauses: { ...preferences.micropauses, ...partial } });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Cerrar ajustes"
      />
      <aside className="relative z-10 flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-reader-border bg-reader-surface shadow-xl">
        <header className="flex items-center justify-between border-b border-reader-border px-5 py-4">
          <h2 className="text-base font-bold">Ajustes</h2>
          <button type="button" onClick={onClose} className="text-reader-muted hover:text-reader-text">
            ✕
          </button>
        </header>

        <div className="flex flex-col gap-6 p-5">
          <StatsSection />

          <section>
            <h3 className="ot-label mb-3">Tema</h3>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`ot-btn py-2 ${
                    preferences.theme === t.id
                      ? 'bg-reader-accent text-white'
                      : 'ot-btn-ghost'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="ot-label mb-3">Palabras con color</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={preferences.wordColorNames}
                onChange={(e) => updatePreferences({ wordColorNames: e.target.checked })}
              />
              Colorear palabras con colornames
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={preferences.showWordColorNames}
                disabled={!preferences.wordColorNames}
                onChange={(e) => updatePreferences({ showWordColorNames: e.target.checked })}
              />
              Mostrar nombre del color
            </label>
            <p className="mt-2 text-xs text-reader-muted">
              Cada palabra usa un color asociado de colornames.org. Si la palabra coincide con un
              nombre de color, se usa ese; si no, un color estable según la palabra.
            </p>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-medium text-reader-muted">Tipografía RSVP</h3>
            <label className="flex items-center justify-between text-sm">
              Tamaño
              <input
                type="range"
                min={28}
                max={72}
                value={preferences.fontSize}
                onChange={(e) => updatePreferences({ fontSize: Number(e.target.value) })}
                className="w-36 accent-reader-accent"
              />
            </label>
            <label className="mt-2 flex items-center justify-between text-sm">
              Scroll
              <input
                type="range"
                min={14}
                max={28}
                value={preferences.scrollFontSize}
                onChange={(e) => updatePreferences({ scrollFontSize: Number(e.target.value) })}
                className="w-36 accent-reader-accent"
              />
            </label>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-medium text-reader-muted">Bionic</h3>
            <label className="flex items-center justify-between text-sm">
              Palabras por pantalla
              <input
                type="range"
                min={1}
                max={12}
                value={preferences.bionicWordsPerChunk}
                onChange={(e) =>
                  updatePreferences({ bionicWordsPerChunk: Number(e.target.value) })
                }
                className="w-36 accent-reader-accent"
              />
            </label>
            <label className="mt-3 flex items-center justify-between text-sm">
              Ratio resaltado
              <input
                type="range"
                min={30}
                max={70}
                value={Math.round(preferences.bionic.ratio * 100)}
                onChange={(e) => updateBionic({ ratio: Number(e.target.value) / 100 })}
                className="w-36 accent-reader-accent"
              />
            </label>
            <label className="mt-2 flex items-center justify-between text-sm">
              Contraste peso
              <input
                type="range"
                min={1}
                max={5}
                value={preferences.bionic.weightContrast}
                onChange={(e) => updateBionic({ weightContrast: Number(e.target.value) })}
                className="w-36 accent-reader-accent"
              />
            </label>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={preferences.bionic.adjustToConsonant}
                onChange={(e) => updateBionic({ adjustToConsonant: e.target.checked })}
              />
              Ajustar a consonantes
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={preferences.bionic.ingRule}
                onChange={(e) => updateBionic({ ingRule: e.target.checked })}
              />
              Regla -ing
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={preferences.bionicInScroll}
                onChange={(e) => updatePreferences({ bionicInScroll: e.target.checked })}
              />
              Bionic en modo scroll
            </label>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-medium text-reader-muted">Micropausas</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={preferences.micropauses.enabled}
                onChange={(e) => updateMicropause({ enabled: e.target.checked })}
              />
              Activar micropausas
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={preferences.enableSlowStart}
                onChange={(e) => updatePreferences({ enableSlowStart: e.target.checked })}
              />
              Arranque lento
            </label>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-medium text-reader-muted">ORP</h3>
            <label className="flex items-center justify-between text-sm">
              Color
              <input
                type="color"
                value={preferences.orpColor}
                onChange={(e) => updatePreferences({ orpColor: e.target.value })}
                className="h-8 w-12 cursor-pointer rounded border-0 bg-transparent"
              />
            </label>
          </section>
        </div>
      </aside>
    </div>
  );
}
