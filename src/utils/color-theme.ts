import colorNames from '../data/colornames.json';

export interface NamedColor {
  hexCode: string;
  name: string;
}

const COLOR_LOOKUP = new Map(
  colorNames.map((color) => [color.hexCode.toLowerCase(), color.name]),
);

const COLOR_BY_WORD = new Map<string, NamedColor>();

for (const color of colorNames) {
  const tokens = color.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3);

  for (const token of tokens) {
    COLOR_BY_WORD.set(token, color);
  }
}

export function normalizeHex(hex: string): string {
  const clean = hex.replace('#', '').trim();
  return `#${clean.padStart(6, '0').slice(0, 6)}`;
}

export function colorHex(color: NamedColor): string {
  return normalizeHex(color.hexCode);
}

function hashWord(word: string): number {
  const normalized = word
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]/g, '');

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function lookupColorName(hex: string): string | undefined {
  return COLOR_LOOKUP.get(normalizeHex(hex).slice(1).toLowerCase());
}

export function getColorForWord(word: string): NamedColor {
  const key = word
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]/g, '');

  if (key && COLOR_BY_WORD.has(key)) {
    return COLOR_BY_WORD.get(key)!;
  }

  const index = hashWord(word) % colorNames.length;
  return colorNames[index];
}

export function getRandomNamedColor(): NamedColor {
  return colorNames[Math.floor(Math.random() * colorNames.length)];
}
