import { useEffect, useState } from 'react';
import type { GlobalStats } from '../../engines/types';
import { formatDuration } from '../../services/session-stats';
import { loadGlobalStats } from '../../storage/db';

export function StatsSection() {
  const [stats, setStats] = useState<GlobalStats | null>(null);

  useEffect(() => {
    void loadGlobalStats().then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <section>
      <h3 className="mb-3 text-sm font-medium text-reader-muted">Estadísticas</h3>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-white/5 p-3">
          <dt className="text-reader-muted">Palabras</dt>
          <dd className="text-lg font-medium tabular-nums">
            {stats.totalWordsRead.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <dt className="text-reader-muted">Tiempo</dt>
          <dd className="text-lg font-medium">{formatDuration(stats.totalReadingSeconds)}</dd>
        </div>
        <div className="rounded-lg bg-white/5 p-3 col-span-2">
          <dt className="text-reader-muted">Sesiones</dt>
          <dd className="text-lg font-medium tabular-nums">{stats.sessionsCount}</dd>
        </div>
      </dl>
    </section>
  );
}
