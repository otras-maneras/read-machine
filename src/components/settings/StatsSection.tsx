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

  const items = [
    { label: 'Palabras', value: stats.totalWordsRead.toLocaleString() },
    { label: 'Tiempo', value: formatDuration(stats.totalReadingSeconds) },
    { label: 'Sesiones', value: stats.sessionsCount.toLocaleString() },
  ];

  return (
    <section>
      <h3 className="rm-label mb-2 px-1">Tu lectura</h3>
      <dl className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <div key={item.label} className="rm-field rounded-xl px-3 py-2.5">
            <dt className="text-[11px] text-reader-muted">{item.label}</dt>
            <dd className="mt-0.5 text-lg font-light tabular-nums tracking-tight">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
