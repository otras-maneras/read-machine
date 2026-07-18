import { useEffect } from 'react';
import { useReaderStore } from '../stores/reader-store';

export function useKeyboard(
  onTogglePlay: () => void,
  onSeek: (delta: number) => void,
  onWpmChange: (delta: number) => void,
  onEscape: () => void,
): void {
  const isPlaying = useReaderStore((s) => s.isPlaying);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          onTogglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onSeek(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          onSeek(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          onWpmChange(25);
          break;
        case 'ArrowDown':
          e.preventDefault();
          onWpmChange(-25);
          break;
        case 'Escape':
          e.preventDefault();
          onEscape();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlaying, onTogglePlay, onSeek, onWpmChange, onEscape]);
}
