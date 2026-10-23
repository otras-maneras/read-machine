import { useEffect, useMemo, useRef, useState } from 'react';
import {
  applyBionic,
  getFontWeights,
  getLightOpacity,
  shouldSkipBionic,
} from '../../engines/bionic-engine';
import type { Token } from '../../engines/types';
import { useReaderStore } from '../../stores/reader-store';
import { colorHex, getColorForWord } from '../../utils/color-theme';
import { Icon } from '../ui/Icon';

interface WordSpan {
  text: string;
  index: number;
}

function chapterRepeatsTitle(chapter: { title: string; text: string }): boolean {
  const title = chapter.title.trim().toLowerCase();
  if (!title) return false;
  const firstPara = chapter.text.trim().split(/\n{2,}/)[0]?.trim().toLowerCase() ?? '';
  return firstPara === title || firstPara.startsWith(title);
}

function groupTokensIntoParagraphs(chapterTokens: Token[]) {
  const paragraphs: { startIndex: number; words: WordSpan[] }[] = [];
  let current: { startIndex: number; words: WordSpan[] } | null = null;

  for (const token of chapterTokens) {
    if (token.isParagraphBreak) {
      if (current && current.words.length > 0) paragraphs.push(current);
      current = null;
      continue;
    }
    if (!current) {
      current = { startIndex: token.index, words: [] };
    }
    current.words.push({ text: token.text, index: token.index });
  }

  if (current && current.words.length > 0) paragraphs.push(current);
  return paragraphs;
}

export function TraditionalView() {
  const {
    tokens,
    chapters,
    currentChapterIndex,
    chapterOffsets,
    wordIndex,
    preferences,
    setWordIndex,
    setWordIndexFromScroll,
    startRsvpFromWord,
  } = useReaderStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastChapterRef = useRef<number>(-1);
  const [tappedIndex, setTappedIndex] = useState<number | null>(null);

  const chapter = chapters[currentChapterIndex];
  const chapterStart = chapterOffsets[currentChapterIndex] ?? 0;
  const chapterEnd = chapterOffsets[currentChapterIndex + 1] ?? tokens.length;

  const showChapterHeading = chapter && !chapterRepeatsTitle(chapter);

  const bionicEnabled =
    preferences.bionicInScroll &&
    (preferences.readingMode === 'bionic' || preferences.readingMode === 'hybrid');

  const { bold, light } = getFontWeights(preferences.bionic);
  const lightOpacity = getLightOpacity(preferences.bionic);

  const paragraphs = useMemo(() => {
    const slice = tokens.slice(chapterStart, chapterEnd);
    return groupTokensIntoParagraphs(slice);
  }, [tokens, chapterStart, chapterEnd]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const marks = container.querySelectorAll('[data-token-index]');
        const targetY = container.getBoundingClientRect().top + 120;
        let closest = chapterStart;
        let minDist = Infinity;
        marks.forEach((el) => {
          const idx = Number((el as HTMLElement).dataset.tokenIndex);
          if (Number.isNaN(idx)) return;
          const dist = Math.abs(el.getBoundingClientRect().top - targetY);
          if (dist < minDist) {
            minDist = dist;
            closest = idx;
          }
        });
        setWordIndexFromScroll(closest);
      });
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [paragraphs, chapterStart, setWordIndexFromScroll]);

  useEffect(() => {
    if (lastChapterRef.current === currentChapterIndex) return;
    lastChapterRef.current = currentChapterIndex;
    setTappedIndex(null);
    const container = scrollRef.current;
    if (!container) return;
    const target = Math.max(chapterStart, wordIndex);
    const el = container.querySelector(`[data-token-index="${target}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
    } else {
      container.scrollTo({ top: 0 });
    }
  }, [currentChapterIndex, wordIndex, chapterStart]);

  const handleWordTap = (index: number) => {
    setWordIndex(index);
    setTappedIndex(index);
  };

  const handleStartRsvp = () => {
    startRsvpFromWord();
    setTappedIndex(null);
  };

  if (!chapter) {
    return (
      <div className="flex h-full items-center justify-center text-reader-muted">
        Sin contenido
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="relative h-full overflow-y-auto overscroll-contain">
      <div
        className="reading-text mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8"
        style={{ fontSize: preferences.scrollFontSize, lineHeight: 1.85 }}
      >
        {showChapterHeading && (
          <h2 className="mb-6 font-[family-name:var(--font-ui)] text-xs font-medium uppercase tracking-[0.08em] text-reader-muted">{chapter.title}</h2>
        )}

        {paragraphs.map((para) => (
          <p key={para.startIndex} data-token-index={para.startIndex} className="mb-6">
            {para.words.map((w) => {
              const isTapped = tappedIndex === w.index;
              const wordColor = preferences.wordColorNames
                ? colorHex(getColorForWord(w.text))
                : undefined;
              return (
                <span
                  key={w.index}
                  data-token-index={w.index}
                  onClick={() => handleWordTap(w.index)}
                  className={`cursor-pointer rounded-sm px-px transition-colors hover:bg-reader-accent/15 ${
                    isTapped ? 'bg-reader-accent/25 ring-1 ring-reader-accent/50' : ''
                  }`}
                  style={wordColor ? { color: wordColor } : undefined}
                  title={
                    preferences.wordColorNames && preferences.showWordColorNames
                      ? getColorForWord(w.text).name
                      : undefined
                  }
                >
                  {bionicEnabled && !shouldSkipBionic(w.text, preferences.bionic)
                    ? renderBionic(w.text, bold, light, lightOpacity, preferences)
                    : w.text}{' '}
                </span>
              );
            })}
          </p>
        ))}
      </div>

      {tappedIndex !== null && (
        <div className="pointer-events-none sticky bottom-4 z-10 flex justify-center px-4">
          <button
            type="button"
            onClick={handleStartRsvp}
            className="rm-window pointer-events-auto flex items-center gap-3 rounded-full py-2 pl-2 pr-5 text-sm text-reader-text transition-transform active:scale-[0.98]"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-reader-text text-reader-bg [&_svg]:h-4 [&_svg]:w-4"
              aria-hidden
            >
              <Icon name="play" />
            </span>
            Lectura rápida desde aquí
          </button>
        </div>
      )}
    </div>
  );
}

function renderBionic(
  word: string,
  bold: number,
  light: number,
  lightOpacity: number,
  preferences: { bionic: Parameters<typeof applyBionic>[1] },
) {
  const seg = applyBionic(word, preferences.bionic);
  return (
    <>
      <span style={{ fontWeight: bold }}>{seg.bold}</span>
      <span style={{ fontWeight: light, opacity: lightOpacity }}>{seg.normal}</span>
    </>
  );
}
