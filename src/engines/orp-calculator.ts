import type { ORPResult } from './types';

export const ANCHOR_COLUMN = 4;

export function calculateORP(rawWord: string): ORPResult {
  const match = rawWord.match(/^([\p{L}\p{N}]+)(.*)$/u);
  const word = match?.[1] ?? rawWord;
  const trailing = match?.[2] ?? '';
  const len = word.length;

  let index: number;
  if (len <= 1) index = 0;
  else if (len <= 4) index = 1;
  else if (len <= 7) index = 2;
  else if (len <= 10) index = 3;
  else if (len <= 13) index = 4;
  else index = Math.min(5, Math.floor(len * 0.35));

  const prefix = word.slice(0, index);
  const orpChar = word.charAt(index) || '';
  const suffix = word.slice(index + 1) + trailing;
  const leftPadding = Math.max(0, ANCHOR_COLUMN - index);

  return { index, prefix, orpChar, suffix, leftPadding };
}
