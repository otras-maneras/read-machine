import { countWords } from '../../engines/tokenizer';
import {
  countWordsFromIndex,
  estimateReadingSeconds,
  formatDuration,
  formatProgressPercent,
} from '../../utils/reading-time';
import type { ReadingMode, Token } from '../../engines/types';

interface ProgressBarProps {
  progress: number;
  wordIndex: number;
  tokens: Token[];
  wpm: number;
  mode: ReadingMode;
  chapterOffsets: number[];
  currentChapterIndex: number;
  compact?: boolean;
}

export function ProgressBar({
  progress,
  wordIndex,
  tokens,
  wpm,
  chapterOffsets,
  currentChapterIndex,
  compact = false,
}: ProgressBarProps) {
  const remainingWords = countWordsFromIndex(tokens, wordIndex);
  const chapterEnd = chapterOffsets[currentChapterIndex + 1] ?? tokens.length;
  const chapterRemaining =
    wordIndex < chapterEnd ? countWords(tokens.slice(wordIndex, chapterEnd)) : 0;

  const bookEta = formatDuration(estimateReadingSeconds(remainingWords, wpm));
  const chapterEta = formatDuration(estimateReadingSeconds(chapterRemaining, wpm));

  const markers =
    chapterOffsets.length > 1 && tokens.length > 0
      ? chapterOffsets.slice(1).map((offset) => (offset / tokens.length) * 100)
      : [];

  return (
    <div className="px-3 pt-1">
      <div className="rounded-xl border border-reader-border bg-reader-surface/70 px-3 py-2 backdrop-blur-sm">
        {!compact && (
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-reader-muted">
            <span className="font-bold tabular-nums text-reader-text">
              {formatProgressPercent(wordIndex + 1, tokens.length)}
            </span>
            <span className="tabular-nums">
              {(wordIndex + 1).toLocaleString()} / {tokens.length.toLocaleString()}
            </span>
            <span>
              Libro <span className="text-reader-text">{bookEta}</span>
            </span>
            {chapterOffsets.length > 1 && (
              <span>
                Cap. <span className="text-reader-text">{chapterEta}</span>
              </span>
            )}
          </div>
        )}

        <div className="relative h-2.5 overflow-hidden rounded-full bg-black/10">
          {markers.map((left, i) => (
            <span
              key={i}
              className="absolute top-0 bottom-0 w-px bg-reader-text/25"
              style={{ left: `${left}%` }}
            />
          ))}
          <div
            className="relative h-full rounded-full bg-reader-accent transition-[width] duration-200 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {compact && (
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-reader-muted">
            <span>{formatProgressPercent(wordIndex + 1, tokens.length)}</span>
            <span>{bookEta} restantes</span>
          </div>
        )}
      </div>
    </div>
  );
}
