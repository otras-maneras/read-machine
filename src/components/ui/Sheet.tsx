import { useEffect, type ReactNode } from 'react';

/**
 * Ventana modal al estilo de otrasmaneras: cabecera con título centrado y punto de cierre.
 * En pantallas anchas flota a la derecha; en el celular es una hoja que sube desde abajo.
 */
export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-start sm:p-3 sm:pt-12">
      <button
        type="button"
        className="rm-scrim absolute inset-0"
        onClick={onClose}
        aria-label={`Cerrar ${title.toLowerCase()}`}
      />
      <aside
        className="rm-window rm-pop rm-sheet relative z-10 flex max-h-[85svh] w-full flex-col overflow-hidden sm:max-h-[calc(100svh-4rem)] sm:max-w-sm"
        role="dialog"
        aria-label={title}
      >
        <header className="rm-win-head">
          <button type="button" className="rm-win-close" onClick={onClose} aria-label="Cerrar" />
          <span className="truncate">{title}</span>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </aside>
    </div>
  );
}
