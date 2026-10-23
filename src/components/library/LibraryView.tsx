import { useEffect, useState } from 'react';
import type { BookRecord } from '../../engines/types';
import { tokenize, countWords } from '../../engines/tokenizer';
import { useReaderStore } from '../../stores/reader-store';
import {
  type CatalogBook,
  catalogBookId,
  catalogCoverUrl,
  fetchCatalogBook,
  loadCatalog,
} from '../../services/catalog';
import {
  estimateReadingSeconds,
  formatDuration,
  formatProgressPercent,
} from '../../utils/reading-time';
import { StatsBanner } from './StatsBanner';
import { SystemBar } from '../ui/SystemBar';
import { Icon } from '../ui/Icon';

const FORMAT_LABELS: Record<string, string> = {
  epub: 'ePub',
  pdf: 'PDF',
  md: 'Markdown',
  txt: 'Texto',
  paste: 'Texto pegado',
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
      className={`relative overflow-hidden rounded-md bg-reader-surface shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45),0_0_0_1px_var(--color-reader-border)] ${
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
        <div className="flex h-full w-full flex-col justify-between bg-reader-surface p-3 text-left">
          <span className="reading-text line-clamp-4 text-sm leading-snug text-reader-text">
            {book.title}
          </span>
          <span className="rm-label text-[9px]">{FORMAT_LABELS[book.format] ?? 'Texto'}</span>
        </div>
      )}
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
        <h3 className="mt-2.5 line-clamp-2 text-[13px] leading-snug text-reader-text">
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
        className="rm-window absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full text-reader-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-reader-accent max-sm:opacity-100 [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.8]"
        aria-label={`Eliminar ${book.title}`}
      >
        <Icon name="close" />
      </button>
    </article>
  );
}

function CatalogCard({
  book,
  opening,
  onOpen,
}: {
  book: CatalogBook;
  opening: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={opening}
      className="flex w-full flex-col text-left transition-transform active:scale-[0.98] disabled:opacity-60"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-reader-surface shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45),0_0_0_1px_var(--color-reader-border)]">
        <img src={catalogCoverUrl(book)} alt="" loading="lazy" className="h-full w-full object-cover" />
        {opening && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs text-white backdrop-blur-[2px]">
            Abriendo…
          </div>
        )}
      </div>
      <h3 className="mt-2.5 line-clamp-2 text-[13px] leading-snug text-reader-text">
        {book.title}
      </h3>
      <p className="mt-0.5 line-clamp-1 text-xs text-reader-muted">
        {book.author} · {book.year}
      </p>
    </button>
  );
}

export function LibraryView() {
  const {
    books,
    resumeHint,
    preferences,
    loadBooks,
    loadDocument,
    openBook,
    setScreen,
    deleteBookById,
  } = useReaderStore();
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<CatalogBook[]>([]);
  const [opening, setOpening] = useState<string | null>(null);
  const [catalogError, setCatalogError] = useState('');

  useEffect(() => {
    void loadBooks().finally(() => setLoading(false));
    void loadCatalog().then(setCatalog);
  }, [loadBooks]);

  // los del catálogo que ya se abrieron viven en la biblioteca, con su progreso
  const openCatalog = catalog.filter((c) => !books.some((b) => b.id === catalogBookId(c)));

  const openCatalogBook = async (book: CatalogBook) => {
    setOpening(book.id);
    setCatalogError('');
    try {
      await loadDocument(await fetchCatalogBook(book), { bookId: catalogBookId(book) });
    } catch (e) {
      setCatalogError(e instanceof Error ? e.message : 'No se pudo abrir el libro');
      setOpening(null);
    }
  };

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
    <div className="flex min-h-svh flex-col">
      <SystemBar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
        <header className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <h1 className="text-4xl font-extralight tracking-[-0.03em] sm:text-5xl">Biblioteca</h1>
            <p className="mt-2 text-xs tracking-[0.04em] text-reader-muted">
              {books.length} {books.length === 1 ? 'libro' : 'libros'} en este dispositivo
            </p>
          </div>
          <button
            type="button"
            onClick={() => setScreen('import')}
            className="rm-pill rm-pill-primary shrink-0"
          >
            <Icon name="plus" />
            Importar
          </button>
        </header>

        <StatsBanner />

        {loading ? (
          <p className="py-16 text-center text-reader-muted">Cargando…</p>
        ) : books.length === 0 && openCatalog.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <p className="text-reader-muted">Tu biblioteca está vacía</p>
            <button
              type="button"
              onClick={() => setScreen('import')}
              className="rm-pill rm-pill-ghost"
            >
              Importar tu primer libro
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {resumeHint && readingNowBook && readingNowStats && (
              <section>
                <h2 className="rm-label mb-4">Leyendo ahora</h2>
                <button
                  type="button"
                  onClick={() => void openBook(resumeHint.bookId)}
                  className="rm-window flex w-full items-center gap-5 p-4 text-left transition-transform active:scale-[0.995] sm:gap-8 sm:p-6"
                >
                  <BookCover book={readingNowBook} size="hero" />
                  <div className="min-w-0 flex-1">
                    <p className="rm-label text-reader-accent">Continuar</p>
                    <h3 className="mt-1.5 text-2xl font-light leading-tight tracking-[-0.02em] sm:text-3xl">
                      {readingNowBook.title}
                    </h3>
                    {readingNowBook.author && (
                      <p className="mt-1 text-sm text-reader-muted">{readingNowBook.author}</p>
                    )}
                    <div className="mt-4">
                      <div className="h-[3px] overflow-hidden rounded-full bg-reader-border">
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
                    <span className="rm-pill rm-pill-primary mt-5">
                      <Icon name="play" />
                      Reanudar
                    </span>
                  </div>
                </button>
              </section>
            )}

            {shelfBooks.length > 0 && (
              <section>
                <h2 className="rm-label mb-4">
                  {resumeHint ? 'Más en tu biblioteca' : 'Tus libros'}
                </h2>
                <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
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

            {resumeHint && shelfBooks.length === 0 && openCatalog.length === 0 && (
              <p className="text-center text-sm text-reader-muted">
                Solo tienes este libro por ahora.
              </p>
            )}

            {openCatalog.length > 0 && (
              <section>
                <h2 className="rm-label">Biblioteca abierta</h2>
                <p className="mb-4 mt-1 text-xs text-reader-muted">
                  Clásicos de dominio público, listos para leer.
                </p>
                {catalogError && (
                  <p className="mb-4 text-sm text-reader-accent">{catalogError}</p>
                )}
                <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {openCatalog.map((book) => (
                    <li key={book.id}>
                      <CatalogCard
                        book={book}
                        opening={opening === book.id}
                        onOpen={() => void openCatalogBook(book)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
