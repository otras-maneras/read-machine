import { loadGlobalStats, saveGlobalStats } from '../storage/db';

let sessionStart = 0;
let sessionWordsStart = 0;
let active = false;

export function startReadingSession(wordIndex: number): void {
  sessionStart = Date.now();
  sessionWordsStart = wordIndex;
  active = true;
}

export function endReadingSession(wordIndex: number): void {
  if (!active) return;
  active = false;
  void recordSessionProgress(wordIndex);
}

export async function recordSessionProgress(currentWordIndex: number): Promise<void> {
  if (!active && sessionStart === 0) return;

  const elapsed = sessionStart > 0 ? Math.floor((Date.now() - sessionStart) / 1000) : 0;
  const wordsRead = Math.max(0, currentWordIndex - sessionWordsStart);

  if (wordsRead === 0 && elapsed < 5) return;

  const stats = await loadGlobalStats();
  await saveGlobalStats({
    ...stats,
    totalWordsRead: stats.totalWordsRead + wordsRead,
    totalReadingSeconds: stats.totalReadingSeconds + elapsed,
    sessionsCount: stats.sessionsCount + (wordsRead > 0 || elapsed >= 10 ? 1 : 0),
  });

  sessionStart = Date.now();
  sessionWordsStart = currentWordIndex;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}
