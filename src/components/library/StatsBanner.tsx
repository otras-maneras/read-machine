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
    <div className="-mt-4 mb-10 text-xs tracking-[0.02em] text-reader-muted sm:-mt-6">
      <span className="text-reader-text">{stats.totalWordsRead.toLocaleString()}</span> palabras
      leídas ·{' '}
      <span className="text-reader-text">{formatDuration(stats.totalReadingSeconds)}</span> ·{' '}
      {stats.sessionsCount} sesiones
    </div>
  );
}
