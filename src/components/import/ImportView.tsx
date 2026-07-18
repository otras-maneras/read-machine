import { useRef, useState } from 'react';
import { useReaderStore } from '../../stores/reader-store';
import { countWords, tokenize } from '../../engines/tokenizer';
import { parseFile, parsePastedText } from '../../parsers';

export function ImportView() {
  const { setScreen, loadDocument } = useReaderStore();
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      <header className="safe-top flex items-center gap-4 border-b border-reader-border px-4 py-4 sm:px-6 sm:py-5">
        <button
          type="button"
          onClick={() => setScreen('library')}
          className="ot-btn ot-btn-ghost h-9 w-9 p-0"
        >
          ←
        </button>
        <div>
          <h1 className="text-lg font-bold sm:text-xl">Importar</h1>
          <p className="text-xs text-reader-muted sm:text-sm">TXT · MD · ePub · PDF</p>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Pega tu texto aquí..."
          className="min-h-48 flex-1 resize-none rounded-xl border border-reader-border bg-reader-surface p-4 text-base leading-relaxed placeholder:text-reader-muted focus:border-reader-accent focus:outline-none"
          spellCheck={false}
        />

        {error && <p className="text-sm text-reader-accent">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="ot-btn ot-btn-ghost px-4 py-2"
          >
            📎 Archivo
          </button>
          <button
            type="button"
            onClick={handlePaste}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            📋 Portapapeles
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
        </div>

        <div
          className="rounded-xl border border-dashed border-reader-border p-6 text-center text-sm text-reader-muted"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) void handleFile(file);
          }}
        >
          Arrastra .txt, .md, .epub o .pdf
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-reader-muted">
            {draft ? `~${wordCount.toLocaleString()} palabras` : 'O importa un archivo'}
          </span>
          <button
            type="button"
            onClick={() => void handleStart()}
            disabled={!draft.trim() || loading}
            className="ot-btn ot-btn-primary px-8 py-3 disabled:opacity-40"
          >
            {loading ? 'Cargando…' : 'Leer →'}
          </button>
        </div>
      </main>
    </div>
  );
}
