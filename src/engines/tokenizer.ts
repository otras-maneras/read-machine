import type { Token } from './types';

const LINEBREAK = '\n';

export function tokenize(text: string): Token[] {
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, ` ${LINEBREAK} `)
    .replace(/[ \t]+/g, ' ')
    .trim();

  if (!cleaned) return [];

  return cleaned.split(/\s+/).map((text, index) => ({
    text: text === LINEBREAK ? LINEBREAK : text,
    index,
    isParagraphBreak: text === LINEBREAK,
  }));
}

export function countWords(tokens: Token[]): number {
  return tokens.filter((t) => !t.isParagraphBreak).length;
}
