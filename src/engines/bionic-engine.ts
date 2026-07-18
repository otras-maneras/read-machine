import type { BionicConfig, BionicSegment, HybridSegments } from './types';
import { ANCHOR_COLUMN } from './orp-calculator';

export function computeBoldLength(word: string, config: BionicConfig): number {
  const clean = word.replace(/[^\p{L}\p{N}]/gu, '');
  const len = clean.length;
  if (len === 0) return 0;

  if (config.ingRule && /ing$/i.test(clean) && len > 3) {
    return len - 3;
  }

  let boldLen: number;
  if (len < 4) {
    boldLen = 1;
  } else if (len < 5) {
    boldLen = Math.floor(len * config.ratio);
  } else {
    boldLen = Math.ceil(len * config.ratio);
  }

  if (config.adjustToConsonant && boldLen > 6) {
    const nonVowels = [...clean.matchAll(/[^aeiouáéíóúüñAEIOUÁÉÍÓÚÜÑ]/gi)];
    const closest = nonVowels.sort(
      (a, b) => Math.abs(a.index! - boldLen) - Math.abs(b.index! - boldLen),
    )[0];
    if (closest && Math.abs(closest.index! - boldLen) < 2) {
      boldLen = closest.index! + 1;
    }
  }

  boldLen += config.parsingOffset;
  boldLen = Math.max(1, Math.min(boldLen, len));

  if (config.maxBoldLength) {
    boldLen = Math.min(boldLen, config.maxBoldLength);
  }

  return boldLen;
}

export function applyBionic(word: string, config: BionicConfig): BionicSegment {
  const clean = word.replace(/[^\p{L}\p{N}]/gu, '');
  if (clean.length <= 1) return { bold: word, normal: '' };

  const boldLen = computeBoldLength(word, config);
  return {
    bold: word.slice(0, boldLen),
    normal: word.slice(boldLen),
  };
}

export function shouldSkipBionic(word: string, config: BionicConfig): boolean {
  const lower = word.toLowerCase().replace(/[^\p{L}]/gu, '');
  return config.excludeWords.includes(lower);
}

export function computeHybridSegments(
  word: string,
  config: BionicConfig,
  orpIndex: number,
): HybridSegments {
  const bionicLen = shouldSkipBionic(word, config)
    ? 0
    : computeBoldLength(word, config);
  const effectiveBionicEnd = Math.min(bionicLen, orpIndex);

  return {
    bionicBold: word.slice(0, effectiveBionicEnd),
    bionicNormal: word.slice(effectiveBionicEnd, orpIndex),
    orpChar: word.charAt(orpIndex),
    suffix: word.slice(orpIndex + 1),
    leftPadding: Math.max(0, ANCHOR_COLUMN - orpIndex),
  };
}

export function getFontWeights(config: BionicConfig): { bold: number; light: number } {
  const base = 400;
  const bold = Math.min(900, base + config.weightContrast * 100);
  const light = base;
  return { bold, light };
}

export function getLightOpacity(config: BionicConfig): number {
  if (config.opacityContrast <= 1) return 1;
  return 1 - (config.opacityContrast - 1) * 0.15;
}
