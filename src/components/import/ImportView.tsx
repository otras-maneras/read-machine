import { useRef, useState } from 'react';
import { useReaderStore } from '../../stores/reader-store';
import { countWords, tokenize } from '../../engines/tokenizer';
import { parseFile, parsePastedText } from '../../parsers';
import { Icon } from '../ui/Icon';
import { SystemBar } from '../ui/SystemBar';

export function ImportView() {
  const { setScreen, loadDocument } = useReaderStore();
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const wordCount = countWords(tokenize(draft));

  const handleStart = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      await loadDocument(parsePastedText(trimmed));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const doc = await parseFile(file);
      if (doc.chapters[0]?.text) {
        setDraft(doc.chapters[0].text.slice(0, 5000));
      }
      await loadDocument(doc, { sourceFile: file });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al importar archivo');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) setDraft(clip);
    } catch {
      setError('No se pudo leer el portapapeles.');
    }
  };

  return (
    <div className="flex min-h-svh flex-col">
      <SystemBar
        left={
          <button type="button" onClick={() => setScreen('library')} className="rm-bar-btn">
            <Icon name="back" />
            <span>Biblioteca</span>
          </button>
        }
      />

      <main className="flex flex-1 items-start justify-center px-3 pb-6 pt-2 sm:items-center sm:px-6 sm:pb-16">
        <section
          className="rm-window rm-pop flex w-full max-w-2xl flex-col overflow-hidden"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) void handleFile(file);
          }}
        >
          <header className="rm-win-head">
            <button
              type="button"
              className="rm-win-close"
              onClick={() => setScreen('library')}
              aria-label="Cerrar"
            />
            <span>Importar · TXT, MD, ePub o PDF</span>
          </header>

          <div className="relative flex flex-col gap-4 p-4 sm:p-5">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Pega tu texto aquí, o arrastra un archivo a esta ventana…"
              className="rm-field reading-text min-h-[45svh] resize-none rounded-xl p-4 text-base leading-relaxed outline-none transition-shadow placeholder:font-[family-name:var(--font-ui)] placeholder:text-sm placeholder:text-reader-muted focus:shadow-[0_0_0_1px_var(--color-reader-muted)]"
              spellCheck={false}
            />

            {dragging && (
              <div className="pointer-events-none absolute inset-4 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-reader-muted bg-reader-card text-sm text-reader-muted sm:inset-5 [&_svg]:h-7 [&_svg]:w-7 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.5]">
                <Icon name="upload" />
                Suelta el archivo para leerlo
              </div>
            )}

            {error && <p className="text-sm text-reader-accent">{error}</p>}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="rm-pill rm-pill-ghost"
              >
                <Icon name="file" />
                Archivo
              </button>
              <button type="button" onClick={handlePaste} className="rm-pill rm-pill-ghost">
                <Icon name="clipboard" />
                Portapapeles
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md,.markdown,.epub,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />

              <span className="ml-auto text-xs tabular-nums text-reader-muted">
                {draft ? `~${wordCount.toLocaleString()} palabras` : ''}
              </span>
              <button
                type="button"
                onClick={() => void handleStart()}
                disabled={!draft.trim() || loading}
                className="rm-pill rm-pill-primary"
              >
                <Icon name="play" />
                {loading ? 'Cargando…' : 'Leer'}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
