import { useEffect, useState } from 'react';
import type { GlobalStats } from '../../engines/types';
import { formatDuration } from '../../services/session-stats';
import { loadGlobalStats } from '../../storage/db';

export function StatsBanner() {
  const [stats, setStats] = useState<GlobalStats | null>(null);

  useEffect(() => {
    void loadGlobalStats().then(setStats);
  }, []);

  if (!stats || stats.sessionsCount === 0) return null;

  return (
    <div className="mx-4 mb-2 rounded-xl border border-reader-border bg-reader-surface/60 px-4 py-2.5 text-xs text-reader-muted sm:mx-0">
      <span className="text-reader-text">{stats.totalWordsRead.toLocaleString()}</span> palabras
      leídas ·{' '}
      <span className="text-reader-text">{formatDuration(stats.totalReadingSeconds)}</span> ·{' '}
      {stats.sessionsCount} sesiones
    </div>
  );
}
