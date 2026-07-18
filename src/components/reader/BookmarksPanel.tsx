import type { Bookmark } from '../../engines/types';
import { useReaderStore } from '../../stores/reader-store';

interface BookmarksPanelProps {
  open: boolean;
  onClose: () => void;
}

export function BookmarksPanel({ open, onClose }: BookmarksPanelProps) {
  const { bookmarks, jumpToBookmark, removeBookmark, addBookmark, wordIndex } =
    useReaderStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Cerrar marcadores"
      />
      <aside className="relative z-10 flex h-full w-full max-w-sm flex-col bg-reader-surface shadow-xl">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-medium">Marcadores</h2>
          <button type="button" onClick={onClose} className="text-reader-muted">
            ✕
          </button>
        </header>

        <div className="border-b border-white/10 p-4">
          <button
            type="button"
            onClick={() => void addBookmark()}
            className="w-full rounded-lg bg-reader-accent py-2 text-sm font-medium text-white hover:opacity-90"
          >
            + Marcar posición actual (palabra {wordIndex + 1})
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto p-4">
          {bookmarks.length === 0 ? (
            <li className="py-8 text-center text-sm text-reader-muted">
              Sin marcadores todavía
            </li>
          ) : (
            bookmarks.map((bm: Bookmark) => (
              <li
                key={bm.id}
                className="mb-2 flex items-start gap-2 rounded-lg border border-white/10 p-3"
              >
                <button
                  type="button"
                  onClick={() => {
                    jumpToBookmark(bm.id);
                    onClose();
                  }}
                  className="flex-1 text-left"
                >
                  <span className="block text-sm font-medium">{bm.label}</span>
                  <span className="mt-1 line-clamp-2 text-xs text-reader-muted">
                    {bm.excerpt}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void removeBookmark(bm.id)}
                  className="shrink-0 text-reader-muted hover:text-reader-accent"
                  aria-label="Eliminar marcador"
                >
                  ✕
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>
    </div>
  );
}
