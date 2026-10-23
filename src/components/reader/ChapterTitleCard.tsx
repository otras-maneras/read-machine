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
        className="rm-scrim absolute inset-0 backdrop-blur-sm"
        onClick={onDismiss}
        aria-label="Continuar lectura"
      />
      <div className="rm-window rm-pop relative z-10 mx-auto w-full max-w-lg overflow-hidden text-center">
        <div className="rm-win-head">
          <span>Capítulo {chapterNumber + 1}</span>
        </div>
        <div className="px-6 py-9 sm:px-10">
          <h2 className="reading-text text-balance text-2xl leading-snug text-reader-text sm:text-3xl">
            {shortenTitle(title)}
          </h2>
          <p className="mt-6 text-xs text-reader-muted">Toca o pulsa Espacio para continuar</p>
        </div>
      </div>
    </div>
  );
}
