import type { Bookmark } from '../../engines/types';
import { useReaderStore } from '../../stores/reader-store';
import { Icon } from '../ui/Icon';
import { Sheet } from '../ui/Sheet';

interface BookmarksPanelProps {
  open: boolean;
  onClose: () => void;
}

export function BookmarksPanel({ open, onClose }: BookmarksPanelProps) {
  const { bookmarks, jumpToBookmark, removeBookmark, addBookmark, wordIndex } =
    useReaderStore();

  if (!open) return null;

  return (
    <Sheet title="Marcadores" onClose={onClose}>
      <div className="flex flex-col gap-4 p-4 pb-8">
        <button
          type="button"
          onClick={() => void addBookmark()}
          className="rm-pill rm-pill-primary w-full"
        >
          <Icon name="bookmark" />
          Marcar la palabra {(wordIndex + 1).toLocaleString()}
        </button>

        {bookmarks.length === 0 ? (
          <p className="py-10 text-center text-sm text-reader-muted">Sin marcadores todavía</p>
        ) : (
          <ul className="rm-group">
            {bookmarks.map((bm: Bookmark) => (
              <li key={bm.id} className="rm-row items-start py-3">
                <button
                  type="button"
                  onClick={() => {
                    jumpToBookmark(bm.id);
                    onClose();
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block text-sm">{bm.label}</span>
                  <span className="reading-text mt-1 line-clamp-2 text-xs text-reader-muted">
                    {bm.excerpt}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void removeBookmark(bm.id)}
                  className="rm-icon-btn -mr-2 -mt-1.5 h-8 w-8 text-reader-muted hover:text-reader-accent [&_svg]:h-4 [&_svg]:w-4"
                  aria-label="Eliminar marcador"
                >
                  <Icon name="close" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Sheet>
  );
}
