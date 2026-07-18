import type { Chapter } from '../engines/types';
import { tokenize } from '../engines/tokenizer';

/**
 * Índice del primer token de cada capítulo en `tokenize(fullText)`,
 * donde fullText = capítulos unidos con `\n\n` (igual que en parsers).
 */
export function computeChapterOffsets(chapters: Chapter[]): number[] {
  if (chapters.length === 0) return [0];

  return chapters.map((_, i) => {
    if (i === 0) return 0;
    const prefix = chapters
      .slice(0, i)
      .map((c) => c.text)
      .join('\n\n');
    return tokenize(prefix).length;
  });
}

export function findChapterForWordIndex(offsets: number[], wordIndex: number): number {
  for (let i = offsets.length - 1; i >= 0; i--) {
    if (wordIndex >= offsets[i]) return i;
  }
  return 0;
}
