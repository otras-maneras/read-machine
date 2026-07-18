export type ReadingMode = 'rsvp' | 'bionic' | 'hybrid';
export type Theme = 'dark' | 'light' | 'sepia' | 'paper';
export type ReaderLayout = 'rsvp' | 'scroll';
export type BookFormat = 'paste' | 'txt' | 'md' | 'epub' | 'pdf';

export interface Chapter {
  id: string;
  title: string;
  text: string;
}

export interface ParsedDocument {
  title: string;
  author?: string;
  format: BookFormat;
  chapters: Chapter[];
  fullText: string;
  coverDataUrl?: string;
}

export interface BookRecord {
  id: string;
  title: string;
  author?: string;
  format: BookFormat;
  fullText: string;
  chapters: Chapter[];
  coverDataUrl?: string;
  sourceFile?: Blob;
  sourceFileName?: string;
  wordIndex: number;
  chapterIndex: number;
  readerLayout: ReaderLayout;
  totalWordsRead: number;
  totalReadingSeconds: number;
  updatedAt: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  wordIndex: number;
  chapterIndex: number;
  label: string;
  excerpt: string;
  createdAt: number;
}

export interface GlobalStats {
  id: 'global';
  totalWordsRead: number;
  totalReadingSeconds: number;
  sessionsCount: number;
}

export interface MicropauseConfig {
  enabled: boolean;
  punctuation: number;
  otherPunctuation: number;
  longWords: number;
  paragraph: number;
  numbers: number;
}

export interface BionicConfig {
  ratio: number;
  maxBoldLength: number | null;
  parsingOffset: number;
  weightContrast: number;
  opacityContrast: number;
  excludeWords: string[];
  adjustToConsonant: boolean;
  ingRule: boolean;
}

export interface UserPreferences {
  wpm: number;
  readingMode: ReadingMode;
  theme: Theme;
  fontSize: number;
  scrollFontSize: number;
  bionicWordsPerChunk: number;
  bionic: BionicConfig;
  micropauses: MicropauseConfig;
  enableSlowStart: boolean;
  orpColor: string;
  bionicInScroll: boolean;
  wordColorNames: boolean;
  showWordColorNames: boolean;
}

export interface Token {
  text: string;
  index: number;
  isParagraphBreak: boolean;
}

export interface WordChunk {
  tokens: Token[];
  delay: number;
  isEnd: boolean;
}

export interface ORPResult {
  index: number;
  prefix: string;
  orpChar: string;
  suffix: string;
  leftPadding: number;
}

export interface BionicSegment {
  bold: string;
  normal: string;
}

export interface HybridSegments {
  bionicBold: string;
  bionicNormal: string;
  orpChar: string;
  suffix: string;
  leftPadding: number;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  wpm: 400,
  readingMode: 'hybrid',
  theme: 'dark',
  fontSize: 48,
  scrollFontSize: 20,
  bionicWordsPerChunk: 3,
  orpColor: '#e85d4c',
  enableSlowStart: true,
  bionicInScroll: true,
  wordColorNames: false,
  showWordColorNames: true,
  bionic: {
    ratio: 0.5,
    maxBoldLength: null,
    parsingOffset: 0,
    weightContrast: 3,
    opacityContrast: 1,
    excludeWords: ['is', 'and', 'as', 'if', 'the', 'of', 'to', 'be', 'for', 'this', 'a', 'an'],
    adjustToConsonant: true,
    ingRule: true,
  },
  micropauses: {
    enabled: true,
    punctuation: 2.5,
    otherPunctuation: 1.5,
    longWords: 1.4,
    paragraph: 2.5,
    numbers: 1.8,
  },
};

export const DEFAULT_TEXT =
  'En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.';
