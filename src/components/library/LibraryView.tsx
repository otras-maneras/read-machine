import { useEffect, useState } from 'react';
import type { BookRecord } from '../../engines/types';
import { tokenize, countWords } from '../../engines/tokenizer';
import { useReaderStore } from '../../stores/reader-store';
import {
  estimateReadingSeconds,
  formatDuration,
  formatProgressPercent,
} from '../../utils/reading-time';
import { StatsBanner } from './StatsBanner';

const FORMAT_ICONS: Record<string, string> = {
  epub: '📖',
  pdf: '📄',
  md: '📝',
  txt: '📃',
  paste: '📋',
};

function bookStats(book: BookRecord, wpm: number) {
  const tokens = tokenize(book.fullText);
  const total = countWords(tokens);
  const remaining = Math.max(0, total - book.wordIndex);
  const pct = total > 0 ? ((book.wordIndex + 1) / tokens.length) * 100 : 0;
  return {
    total,
    pct,
    progressLabel: formatProgressPercent(book.wordIndex + 1, tokens.length),
    remainingLabel: formatDuration(estimateReadingSeconds(remaining, wpm)),
    totalLabel: formatDuration(estimateReadingSeconds(total, wpm)),
  };
}

function BookCover({
  book,
  size = 'grid',
}: {
  book: BookRecord;
  size?: 'hero' | 'grid';
}) {
  const isHero = size === 'hero';
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-reader-bg shadow-lg shadow-black/40 ${
        isHero ? 'aspect-[2/3] w-28 sm:w-36' : 'aspect-[2/3] w-full'
      }`}
    >
      {book.coverDataUrl ? (
        <img
          src={book.coverDataUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-reader-surface to-reader-bg ${
            isHero ? 'text-4xl' : 'text-3xl'
          }`}
        >
          {FORMAT_ICONS[book.format] ?? '📚'}
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}

function BookGridCard({
  book,
  wpm,
  onOpen,
  onDelete,
}: {
  book: BookRecord;
  wpm: number;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const stats = bookStats(book, wpm);
  const hasProgress = stats.pct > 0.5 && stats.pct < 99.5;

  return (
    <article className="group relative flex flex-col">
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-col text-left transition-transform active:scale-[0.98]"
      >
        <div className="relative">
          <BookCover book={book} size="grid" />
          {hasProgress && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/30">
              <div
                className="h-full bg-reader-accent"
                style={{ width: `${Math.min(100, stats.pct)}%` }}
              />
            </div>
          )}
        </div>
        <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-snug text-reader-text">
          {book.title}
        </h3>
        {book.author && (
          <p className="mt-0.5 line-clamp-1 text-xs text-reader-muted">{book.author}</p>
        )}
        {hasProgress && (
          <p className="mt-1 text-[10px] text-reader-muted">{stats.remainingLabel} restantes</p>
        )}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-reader-border bg-reader-surface text-xs text-reader-muted opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:text-reader-accent sm:opacity-0 max-sm:opacity-100"
        aria-label={`Eliminar ${book.title}`}
      >
        ✕
      </button>
    </article>
  );
}

export function LibraryView() {
  const { books, resumeHint, preferences, loadBooks, openBook, setScreen, deleteBookById } =
    useReaderStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadBooks().finally(() => setLoading(false));
  }, [loadBooks]);

  const readingNowBook = resumeHint
    ? books.find((b) => b.id === resumeHint.bookId)
    : undefined;
  const readingNowStats = readingNowBook
    ? bookStats(readingNowBook, preferences.wpm)
    : null;

  const shelfBooks = resumeHint
    ? books.filter((b) => b.id !== resumeHint.bookId)
    : books;

  return (
    <div className="flex min-h-svh flex-col bg-reader-bg">
      <header className="safe-top border-b border-reader-border/60 px-4 py-4 sm:px-8 sm:py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Biblioteca</h1>
            <p className="mt-1 text-xs text-reader-muted sm:text-sm">
              {books.length} {books.length === 1 ? 'libro' : 'libros'} en este dispositivo
            </p>
          </div>
          <button
            type="button"
            onClick={() => setScreen('import')}
            className="ot-btn ot-btn-primary shrink-0 px-4 py-2.5"
          >
            + Importar
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-8 sm:py-8">
        <StatsBanner />

        {loading ? (
          <p className="py-16 text-center text-reader-muted">Cargando…</p>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="text-5xl opacity-40">📚</div>
            <p className="text-reader-muted">Tu biblioteca está vacía</p>
            <button
              type="button"
              onClick={() => setScreen('import')}
              className="ot-btn ot-btn-ghost px-6 py-3"
            >
              Importar tu primer libro
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {resumeHint && readingNowBook && readingNowStats && (
              <section>
                <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-reader-muted">
                  Leyendo ahora
                </h2>
                <button
                  type="button"
                  onClick={() => void openBook(resumeHint.bookId)}
                  className="flex w-full items-center gap-5 rounded-2xl border border-reader-border bg-reader-surface/80 p-4 text-left shadow-lg shadow-black/20 transition-colors hover:bg-reader-surface sm:gap-8 sm:p-6"
                >
                  <BookCover book={readingNowBook} size="hero" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-reader-accent">
                      Continuar
                    </p>
                    <h3 className="mt-1 text-xl font-bold leading-tight sm:text-2xl">
                      {readingNowBook.title}
                    </h3>
                    {readingNowBook.author && (
                      <p className="mt-1 text-sm text-reader-muted">{readingNowBook.author}</p>
                    )}
                    <div className="mt-4">
                      <div className="h-1.5 overflow-hidden rounded-full bg-black/15">
                        <div
                          className="h-full rounded-full bg-reader-accent transition-[width]"
                          style={{ width: `${Math.min(100, readingNowStats.pct)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-reader-muted">
                        {readingNowStats.progressLabel} · {readingNowStats.remainingLabel}{' '}
                        restantes
                      </p>
                    </div>
                    <span className="ot-btn ot-btn-primary mt-4 inline-flex px-5 py-2 text-sm">
                      Reanudar lectura
                    </span>
                  </div>
                </button>
              </section>
            )}

            {shelfBooks.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-reader-muted">
                  {resumeHint ? 'Más en tu biblioteca' : 'Todos los libros'}
                </h2>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {shelfBooks.map((book) => (
                    <li key={book.id}>
                      <BookGridCard
                        book={book}
                        wpm={preferences.wpm}
                        onOpen={() => void openBook(book.id)}
                        onDelete={() => void deleteBookById(book.id)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {resumeHint && shelfBooks.length === 0 && (
              <p className="text-center text-sm text-reader-muted">
                Solo tienes este libro por ahora.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
