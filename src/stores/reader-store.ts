import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  BookRecord,
  Bookmark,
  Chapter,
  GlobalStats,
  ParsedDocument,
  ReaderLayout,
  ReadingMode,
  Theme,
  Token,
  UserPreferences,
} from '../engines/types';
import { DEFAULT_PREFERENCES } from '../engines/types';
import {
  computeChapterOffsets,
  findChapterForWordIndex,
} from '../utils/chapter-offsets';
import {
  endReadingSession,
  recordSessionProgress,
  startReadingSession,
} from '../services/session-stats';
import { tokenizeAsync } from '../workers/tokenize-async';
import {
  addBookmark as dbAddBookmark,
  deleteBook,
  deleteBookmark as dbDeleteBookmark,
  getBook,
  listBookmarks,
  listBooks,
  loadGlobalStats,
  loadLastSession,
  loadPreferences,
  saveBook,
  savePreferences,
  saveSession,
} from '../storage/db';

export type AppScreen = 'library' | 'import' | 'reader';

const THEME_COLORS: Record<Theme, string> = {
  dark: '#0a0a09',
  light: '#faf9f7',
  sepia: '#f4ecd8',
  paper: '#f3ead8',
};

function applyTheme(theme: Theme): void {
  document.body.className = `theme-${theme}`;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
}

export interface ResumeHint {
  bookId: string;
  title: string;
  wordIndex: number;
}

interface ReaderState {
  screen: AppScreen;
  books: BookRecord[];
  resumeHint: ResumeHint | null;
  activeBookId: string | null;
  bookTitle: string;
  chapters: Chapter[];
  chapterOffsets: number[];
  currentChapterIndex: number;
  text: string;
  tokens: Token[];
  currentToken: Token | null;
  wordIndex: number;
  isPlaying: boolean;
  readerLayout: ReaderLayout;
  settingsOpen: boolean;
  bookmarksOpen: boolean;
  bookmarks: Bookmark[];
  globalStats: GlobalStats | null;
  tokenizing: boolean;
  preferences: UserPreferences;
  initialized: boolean;
  lastPersistedWordIndex: number;

  init: () => Promise<void>;
  loadBooks: () => Promise<void>;
  loadBookmarks: () => Promise<void>;
  loadDocument: (doc: ParsedDocument, options?: { bookId?: string; sourceFile?: File }) => Promise<void>;
  openBook: (id: string) => Promise<void>;
  deleteBookById: (id: string) => Promise<void>;
  setChapter: (index: number) => Promise<void>;
  setText: (text: string) => Promise<void>;
  setScreen: (screen: AppScreen) => void;
  setPlaying: (playing: boolean) => void;
  setWordIndex: (index: number) => void;
  setWordIndexFromScroll: (index: number) => void;
  setCurrentToken: (token: Token | null) => void;
  setReaderLayout: (layout: ReaderLayout) => void;
  startRsvpFromWord: () => void;
  setSettingsOpen: (open: boolean) => void;
  setBookmarksOpen: (open: boolean) => void;
  setWpm: (wpm: number) => void;
  setReadingMode: (mode: ReadingMode) => void;
  setTheme: (theme: Theme) => void;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  addBookmark: () => Promise<void>;
  jumpToBookmark: (id: string) => void;
  removeBookmark: (id: string) => Promise<void>;
  persistProgress: () => Promise<void>;
}

async function applyTokens(
  text: string,
  set: (partial: Partial<ReaderState>) => void,
): Promise<Token[]> {
  set({ tokenizing: true });
  const tokens = await tokenizeAsync(text);
  set({ tokens, tokenizing: false });
  return tokens;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  screen: 'library',
  books: [],
  resumeHint: null,
  activeBookId: null,
  bookTitle: '',
  chapters: [],
  chapterOffsets: [],
  currentChapterIndex: 0,
  text: '',
  tokens: [],
  currentToken: null,
  wordIndex: 0,
  isPlaying: false,
  readerLayout: 'rsvp',
  settingsOpen: false,
  bookmarksOpen: false,
  bookmarks: [],
  globalStats: null,
  tokenizing: false,
  preferences: DEFAULT_PREFERENCES,
  initialized: false,
  lastPersistedWordIndex: 0,

  init: async () => {
    const [prefs, session, books, globalStats] = await Promise.all([
      loadPreferences(),
      loadLastSession(),
      listBooks(),
      loadGlobalStats(),
    ]);

    const savedTheme = prefs.theme as Theme | 'custom';
    const theme: Theme = savedTheme === 'custom' ? 'dark' : savedTheme;
    applyTheme(theme);

    if (session?.bookId) {
      const book = await getBook(session.bookId);
      if (book) {
        set({
          preferences: prefs,
          books,
          globalStats,
          initialized: true,
          screen: 'library',
          resumeHint: {
            bookId: book.id,
            title: book.title,
            wordIndex: session.wordIndex ?? book.wordIndex,
          },
        });
        return;
      }
    }

    set({ preferences: prefs, books, globalStats, initialized: true, resumeHint: null });
  },

  loadBooks: async () => {
    const [books, globalStats] = await Promise.all([listBooks(), loadGlobalStats()]);
    set({ books, globalStats });
  },

  loadBookmarks: async () => {
    const { activeBookId } = get();
    if (!activeBookId) return;
    const bookmarks = await listBookmarks(activeBookId);
    set({ bookmarks });
  },

  loadDocument: async (doc, options) => {
    const id = options?.bookId ?? nanoid();
    const tokens = await applyTokens(doc.fullText, set);

    const record: BookRecord = {
      id,
      title: doc.title,
      author: doc.author,
      format: doc.format,
      fullText: doc.fullText,
      chapters: doc.chapters,
      coverDataUrl: doc.coverDataUrl,
      sourceFile: options?.sourceFile,
      sourceFileName: options?.sourceFile?.name,
      wordIndex: 0,
      chapterIndex: 0,
      readerLayout: 'rsvp',
      totalWordsRead: 0,
      totalReadingSeconds: 0,
      updatedAt: Date.now(),
    };

    try {
      await saveBook(record);
    } catch (e) {
      throw new Error(
        e instanceof Error
          ? `No se pudo guardar en biblioteca: ${e.message}`
          : 'No se pudo guardar en biblioteca (espacio insuficiente)',
      );
    }
    const books = await listBooks();

    set({
      books,
      resumeHint: null,
      activeBookId: id,
      bookTitle: doc.title,
      chapters: doc.chapters,
      chapterOffsets: computeChapterOffsets(doc.chapters),
      currentChapterIndex: 0,
      text: doc.fullText,
      tokens,
      wordIndex: 0,
      currentToken: tokens[0] ?? null,
      isPlaying: false,
      bookmarks: [],
      lastPersistedWordIndex: 0,
      screen: 'reader',
    });
    startReadingSession(0);
  },

  openBook: async (id) => {
    const book = await getBook(id);
    if (!book) return;

    const [tokens, bookmarks] = await Promise.all([
      applyTokens(book.fullText, set),
      listBookmarks(id),
    ]);

    set({
      activeBookId: book.id,
      bookTitle: book.title,
      chapters: book.chapters,
      chapterOffsets: computeChapterOffsets(book.chapters),
      currentChapterIndex: book.chapterIndex,
      text: book.fullText,
      tokens,
      wordIndex: book.wordIndex,
      currentToken: tokens[book.wordIndex] ?? null,
      isPlaying: false,
      readerLayout: book.readerLayout,
      bookmarks,
      lastPersistedWordIndex: book.wordIndex,
      resumeHint: null,
      screen: 'reader',
    });
    startReadingSession(book.wordIndex);
  },

  deleteBookById: async (id) => {
    await deleteBook(id);
    await get().loadBooks();
  },

  setChapter: async (index) => {
    const { chapterOffsets, tokens } = get();
    const wordIndex = chapterOffsets[index] ?? 0;
    set({
      currentChapterIndex: index,
      wordIndex,
      currentToken: tokens[wordIndex] ?? null,
      isPlaying: false,
    });
    await get().persistProgress();
  },

  setText: async (text) => {
    const tokens = await applyTokens(text, set);
    set({
      text,
      tokens,
      wordIndex: 0,
      currentToken: tokens[0] ?? null,
      isPlaying: false,
      chapters: [{ id: nanoid(), title: 'Contenido', text }],
      chapterOffsets: [0],
      currentChapterIndex: 0,
      activeBookId: null,
      bookTitle: 'Texto sin guardar',
      bookmarks: [],
      lastPersistedWordIndex: 0,
    });
    startReadingSession(0);
  },

  setScreen: (screen) => {
    if (screen !== 'reader') {
      endReadingSession(get().wordIndex);
      void recordSessionProgress(get().wordIndex);
    }
    set({ screen, isPlaying: false });
  },

  setPlaying: (isPlaying) => {
    if (isPlaying) {
      startReadingSession(get().wordIndex);
    } else {
      void recordSessionProgress(get().wordIndex);
      startReadingSession(get().wordIndex);
    }
    set({ isPlaying });
  },

  setWordIndex: (wordIndex) => {
    const { tokens, chapterOffsets } = get();
    set({
      wordIndex,
      currentToken: tokens[wordIndex] ?? null,
      currentChapterIndex: findChapterForWordIndex(chapterOffsets, wordIndex),
    });
  },

  setWordIndexFromScroll: (wordIndex) => {
    if (get().readerLayout !== 'scroll') return;
    const { tokens, chapterOffsets } = get();
    if (wordIndex === get().wordIndex) return;
    set({
      wordIndex,
      currentToken: tokens[wordIndex] ?? null,
      currentChapterIndex: findChapterForWordIndex(chapterOffsets, wordIndex),
    });
  },

  setCurrentToken: (currentToken) => set({ currentToken }),

  setReaderLayout: (readerLayout) => {
    const { tokens, wordIndex, readerLayout: current } = get();
    set({
      readerLayout,
      isPlaying: false,
      currentToken: tokens[wordIndex] ?? null,
    });
    if (readerLayout === 'rsvp' && current === 'scroll') {
      startReadingSession(wordIndex);
    }
    void get().persistProgress();
  },

  startRsvpFromWord: () => {
    const { tokens, wordIndex } = get();
    set({
      readerLayout: 'rsvp',
      isPlaying: true,
      currentToken: tokens[wordIndex] ?? null,
    });
    startReadingSession(wordIndex);
  },

  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),

  setBookmarksOpen: (bookmarksOpen) => set({ bookmarksOpen }),

  setWpm: (wpm) => {
    const clamped = Math.max(100, Math.min(2000, wpm));
    get().updatePreferences({ wpm: clamped });
  },

  setReadingMode: (readingMode) => get().updatePreferences({ readingMode }),

  setTheme: (theme) => {
    applyTheme(theme);
    get().updatePreferences({ theme });
  },

  updatePreferences: (partial) => {
    const preferences = { ...get().preferences, ...partial };
    set({ preferences });
    if (partial.theme) {
      applyTheme(preferences.theme);
    }
    void savePreferences(preferences);
  },

  addBookmark: async () => {
    const { activeBookId, wordIndex, currentChapterIndex, tokens, bookmarks } = get();
    if (!activeBookId) return;

    const excerpt = tokens
      .slice(wordIndex, wordIndex + 12)
      .filter((t) => !t.isParagraphBreak)
      .map((t) => t.text)
      .join(' ');

    const bookmark: Bookmark = {
      id: nanoid(),
      bookId: activeBookId,
      wordIndex,
      chapterIndex: currentChapterIndex,
      label: `Marcador · palabra ${wordIndex + 1}`,
      excerpt: excerpt || '…',
      createdAt: Date.now(),
    };

    await dbAddBookmark(bookmark);
    set({ bookmarks: [bookmark, ...bookmarks] });
  },

  jumpToBookmark: (id) => {
    const bm = get().bookmarks.find((b) => b.id === id);
    if (!bm) return;
    const { tokens } = get();
    set({
      wordIndex: bm.wordIndex,
      currentChapterIndex: bm.chapterIndex,
      currentToken: tokens[bm.wordIndex] ?? null,
      isPlaying: false,
    });
    void get().persistProgress();
  },

  removeBookmark: async (id) => {
    await dbDeleteBookmark(id);
    set({ bookmarks: get().bookmarks.filter((b) => b.id !== id) });
  },

  persistProgress: async () => {
    const {
      activeBookId,
      text,
      wordIndex,
      currentChapterIndex,
      readerLayout,
      chapters,
      lastPersistedWordIndex,
    } = get();

    const wordsDelta = Math.max(0, wordIndex - lastPersistedWordIndex);

    await saveSession({
      bookId: activeBookId,
      text,
      wordIndex,
      chapterIndex: currentChapterIndex,
    });

    if (activeBookId) {
      const book = await getBook(activeBookId);
      if (book) {
        await saveBook({
          ...book,
          wordIndex,
          chapterIndex: currentChapterIndex,
          readerLayout,
          chapters,
          totalWordsRead: book.totalWordsRead + wordsDelta,
          updatedAt: Date.now(),
        });
        set({ lastPersistedWordIndex: wordIndex });
        await get().loadBooks();
      }
    }
  },
}));
