import type { Token } from '../engines/types';
import { countWords } from '../engines/tokenizer';

/** Factor aproximado para micropausas y puntuación */
export const MICROPAUSE_TIME_FACTOR = 1.2;

export function countWordsFromIndex(tokens: Token[], fromIndex: number): number {
  return countWords(tokens.slice(fromIndex));
}

export function estimateReadingSeconds(
  words: number,
  wpm: number,
  withMicropauses = true,
): number {
  if (wpm <= 0 || words <= 0) return 0;
  const base = (words / wpm) * 60;
  return withMicropauses ? base * MICROPAUSE_TIME_FACTOR : base;
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0 min';
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))} s`;

  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
}

export function formatProgressPercent(current: number, total: number): string {
  if (total <= 0) return '0%';
  return `${Math.min(100, Math.round((current / total) * 100))}%`;
}
