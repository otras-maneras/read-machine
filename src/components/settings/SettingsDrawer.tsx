import type { ReactNode } from 'react';
import type { Theme, UserPreferences } from '../../engines/types';
import { useReaderStore } from '../../stores/reader-store';
import { Sheet } from '../ui/Sheet';
import { StatsSection } from './StatsSection';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const THEMES: { id: Theme; label: string }[] = [
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Oscuro' },
  { id: 'paper', label: 'Papel' },
  { id: 'sepia', label: 'Sepia' },
];

function Section({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <h3 className="rm-label mb-2 px-1">{title}</h3>
      <div className="rm-group">{children}</div>
      {note && <p className="mt-2 px-1 text-xs leading-relaxed text-reader-muted">{note}</p>}
    </section>
  );
}

function SwitchRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`rm-row cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        className="rm-switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function RangeRow({
  label,
  value,
  display,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  display?: ReactNode;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="rm-row">
      <span className="shrink-0">{label}</span>
      <span className="flex min-w-0 flex-1 items-center justify-end gap-3">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="rm-range w-full max-w-36"
        />
        <span className="w-8 shrink-0 text-right text-xs tabular-nums text-reader-muted">
          {display ?? value}
        </span>
      </span>
    </label>
  );
}

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
    <Sheet title="Ajustes" onClose={onClose}>
      <div className="flex flex-col gap-6 p-4 pb-8">
        <StatsSection />

        <section>
          <h3 className="rm-label mb-2 px-1">Tema</h3>
          <div className="rm-seg" role="group" aria-label="Tema">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={preferences.theme === t.id}
                onClick={() => setTheme(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <Section title="Tipografía">
          <RangeRow
            label="Lectura rápida"
            min={28}
            max={72}
            value={preferences.fontSize}
            onChange={(fontSize) => updatePreferences({ fontSize })}
          />
          <RangeRow
            label="Página"
            min={14}
            max={28}
            value={preferences.scrollFontSize}
            onChange={(scrollFontSize) => updatePreferences({ scrollFontSize })}
          />
          <label className="rm-row">
            <span>Color de la letra de foco</span>
            <input
              type="color"
              value={preferences.orpColor}
              onChange={(e) => updatePreferences({ orpColor: e.target.value })}
              className="h-7 w-7 cursor-pointer overflow-hidden rounded-full border-0 bg-transparent p-0 [&::-moz-color-swatch]:rounded-full [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
            />
          </label>
        </Section>

        <Section title="Ritmo">
          <SwitchRow
            label="Micropausas en la puntuación"
            checked={preferences.micropauses.enabled}
            onChange={(enabled) => updateMicropause({ enabled })}
          />
          <SwitchRow
            label="Arranque lento"
            checked={preferences.enableSlowStart}
            onChange={(enableSlowStart) => updatePreferences({ enableSlowStart })}
          />
        </Section>

        <Section title="Bionic">
          <RangeRow
            label="Palabras por pantalla"
            min={1}
            max={12}
            value={preferences.bionicWordsPerChunk}
            onChange={(bionicWordsPerChunk) => updatePreferences({ bionicWordsPerChunk })}
          />
          <RangeRow
            label="Resaltado"
            min={30}
            max={70}
            value={Math.round(preferences.bionic.ratio * 100)}
            display={`${Math.round(preferences.bionic.ratio * 100)}%`}
            onChange={(v) => updateBionic({ ratio: v / 100 })}
          />
          <RangeRow
            label="Contraste"
            min={1}
            max={5}
            value={preferences.bionic.weightContrast}
            onChange={(weightContrast) => updateBionic({ weightContrast })}
          />
          <SwitchRow
            label="Ajustar a consonantes"
            checked={preferences.bionic.adjustToConsonant}
            onChange={(adjustToConsonant) => updateBionic({ adjustToConsonant })}
          />
          <SwitchRow
            label="Regla -ing"
            checked={preferences.bionic.ingRule}
            onChange={(ingRule) => updateBionic({ ingRule })}
          />
          <SwitchRow
            label="Bionic en la página"
            checked={preferences.bionicInScroll}
            onChange={(bionicInScroll) => updatePreferences({ bionicInScroll })}
          />
        </Section>

        <Section
          title="Palabras con color"
          note="Cada palabra toma un color con nombre (de color-name-list): si coincide con el nombre de un color se usa ese; si no, uno fijo según la palabra."
        >
          <SwitchRow
            label="Colorear palabras"
            checked={preferences.wordColorNames}
            onChange={(wordColorNames) => updatePreferences({ wordColorNames })}
          />
          <SwitchRow
            label="Mostrar el nombre del color"
            checked={preferences.showWordColorNames}
            disabled={!preferences.wordColorNames}
            onChange={(showWordColorNames) => updatePreferences({ showWordColorNames })}
          />
        </Section>
      </div>
    </Sheet>
  );
}
