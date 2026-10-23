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
    <div className="px-4 pb-1 sm:px-5">
      <div className="relative h-[3px] rounded-full bg-reader-border">
        {markers.map((left, i) => (
          <span
            key={i}
            className="absolute -top-[2px] h-[7px] w-px bg-reader-muted/50"
            style={{ left: `${left}%` }}
          />
        ))}
        <div
          className="h-full rounded-full bg-reader-accent transition-[width] duration-200 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-[11px] tabular-nums text-reader-muted">
        <span>
          <span className="text-reader-text">
            {formatProgressPercent(wordIndex + 1, tokens.length)}
          </span>
          {!compact && (
            <span className="hidden sm:inline">
              {' · '}
              {(wordIndex + 1).toLocaleString()} / {tokens.length.toLocaleString()}
            </span>
          )}
        </span>
        <span>
          {!compact && chapterOffsets.length > 1 && (
            <>
              Capítulo <span className="text-reader-text">{chapterEta}</span>
              {' · '}
            </>
          )}
          Libro <span className="text-reader-text">{bookEta}</span>
        </span>
      </div>
    </div>
  );
}
