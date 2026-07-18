interface ChapterTitleCardProps {
  title: string;
  chapterNumber: number;
  onDismiss: () => void;
}

function shortenTitle(title: string, max = 120): string {
  const trimmed = title.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function ChapterTitleCard({
  title,
  chapterNumber,
  onDismiss,
}: ChapterTitleCardProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
      <button
        type="button"
        className="absolute inset-0 bg-reader-bg/80 backdrop-blur-sm"
        onClick={onDismiss}
        aria-label="Continuar lectura"
      />
      <div className="relative z-10 mx-auto w-full max-w-lg rounded-2xl border border-reader-border bg-reader-surface px-6 py-8 text-center shadow-2xl shadow-black/25 sm:px-10 sm:py-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-reader-muted">
          Capítulo {chapterNumber + 1}
        </p>
        <h2 className="reading-text mt-4 text-balance text-2xl font-medium leading-snug text-reader-text sm:text-3xl">
          {shortenTitle(title)}
        </h2>
        <p className="mt-6 text-xs text-reader-muted">Toca o pulsa Espacio para continuar</p>
      </div>
    </div>
  );
}
