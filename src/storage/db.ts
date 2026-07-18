import Dexie, { type EntityTable } from 'dexie';
import type { BookRecord, Bookmark, GlobalStats, Theme, UserPreferences } from '../engines/types';
import { DEFAULT_PREFERENCES } from '../engines/types';

export interface ReadingSession {
  id: string;
  bookId: string | null;
  text: string;
  wordIndex: number;
  chapterIndex: number;
  updatedAt: number;
}

interface PreferencesRow {
  id: 'default';
  data: UserPreferences;
}

class LectorDatabase extends Dexie {
  sessions!: EntityTable<ReadingSession, 'id'>;
  preferences!: EntityTable<PreferencesRow, 'id'>;
  books!: EntityTable<BookRecord, 'id'>;
  bookmarks!: EntityTable<Bookmark, 'id'>;
  stats!: EntityTable<GlobalStats, 'id'>;

  constructor() {
    super('lector-db');
    this.version(1).stores({
      sessions: 'id, updatedAt',
      preferences: 'id',
    });
    this.version(2).stores({
      sessions: 'id, updatedAt, bookId',
      preferences: 'id',
      books: 'id, updatedAt, title',
    });
    this.version(3).stores({
      sessions: 'id, updatedAt, bookId',
      preferences: 'id',
      books: 'id, updatedAt, title',
      bookmarks: 'id, bookId, createdAt',
      stats: 'id',
    });
  }
}

export const db = new LectorDatabase();

const DEFAULT_STATS: GlobalStats = {
  id: 'global',
  totalWordsRead: 0,
  totalReadingSeconds: 0,
  sessionsCount: 0,
};

export async function loadPreferences(): Promise<UserPreferences> {
  const row = await db.preferences.get('default');
  const prefs = row?.data ?? { ...DEFAULT_PREFERENCES };
  const savedTheme = prefs.theme as Theme | 'custom';
  const theme: Theme = savedTheme === 'custom' ? 'dark' : savedTheme;
  return {
    ...DEFAULT_PREFERENCES,
    ...prefs,
    theme,
    bionic: { ...DEFAULT_PREFERENCES.bionic, ...prefs.bionic },
    micropauses: { ...DEFAULT_PREFERENCES.micropauses, ...prefs.micropauses },
    bionicWordsPerChunk:
      prefs.bionicWordsPerChunk ?? DEFAULT_PREFERENCES.bionicWordsPerChunk,
    wordColorNames: prefs.wordColorNames ?? DEFAULT_PREFERENCES.wordColorNames,
    showWordColorNames:
      prefs.showWordColorNames ?? DEFAULT_PREFERENCES.showWordColorNames,
  };
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await db.preferences.put({ id: 'default', data: prefs });
}

export async function loadLastSession(): Promise<ReadingSession | undefined> {
  return db.sessions.orderBy('updatedAt').reverse().first();
}

export async function saveSession(
  session: Omit<ReadingSession, 'id' | 'updatedAt'>,
): Promise<void> {
  await db.sessions.put({
    id: 'current',
    ...session,
    updatedAt: Date.now(),
  });
}

export async function listBooks(): Promise<BookRecord[]> {
  return db.books.orderBy('updatedAt').reverse().toArray();
}

export async function getBook(id: string): Promise<BookRecord | undefined> {
  return db.books.get(id);
}

export async function saveBook(book: BookRecord): Promise<void> {
  await db.books.put(book);
}

export async function deleteBook(id: string): Promise<void> {
  await db.bookmarks.where('bookId').equals(id).delete();
  await db.books.delete(id);
}

export async function listBookmarks(bookId: string): Promise<Bookmark[]> {
  return db.bookmarks.where('bookId').equals(bookId).reverse().sortBy('createdAt');
}

export async function addBookmark(bookmark: Bookmark): Promise<void> {
  await db.bookmarks.put(bookmark);
}

export async function deleteBookmark(id: string): Promise<void> {
  await db.bookmarks.delete(id);
}

export async function loadGlobalStats(): Promise<GlobalStats> {
  const row = await db.stats.get('global');
  return row ?? { ...DEFAULT_STATS };
}

export async function saveGlobalStats(stats: GlobalStats): Promise<void> {
  await db.stats.put(stats);
}
