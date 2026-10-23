import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RSVPEngine } from '../../engines/rsvp-engine';
import type { Token } from '../../engines/types';
import { useReaderStore } from '../../stores/reader-store';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useFullscreen } from '../../hooks/useFullscreen';
import { WordDisplay } from './WordDisplay';
import { TraditionalView } from './TraditionalView';
import { ControlBar } from './ControlBar';
import { ProgressBar } from './ProgressBar';
import { ChapterTitleCard } from './ChapterTitleCard';
import { SettingsDrawer } from '../settings/SettingsDrawer';
import { BookmarksPanel } from './BookmarksPanel';
import { SystemBar } from '../ui/SystemBar';
import { Icon } from '../ui/Icon';

function tokensAtIndex(tokens: Token[], index: number): Token[] {
  const token = tokens[index];
  return token ? [token] : [];
}

const modeLabel = {
  hybrid: 'Híbrido',
  rsvp: 'RSVP',
  bionic: 'Bionic',
};

export function ReaderView() {
  const {
    tokens,
    wordIndex,
    isPlaying,
    preferences,
    bookTitle,
    chapters,
    chapterOffsets,
    currentChapterIndex,
    readerLayout,
    settingsOpen,
    bookmarksOpen,
    tokenizing,
    setPlaying,
    setWordIndex,
    setScreen,
    setWpm,
    setReadingMode,
    setReaderLayout,
    setSettingsOpen,
    setBookmarksOpen,
    setChapter,
    persistProgress,
  } = useReaderStore();

  const { toggle: toggleFullscreen } = useFullscreen();
  const engineRef = useRef<RSVPEngine | null>(null);
  const wasPlayingRef = useRef(false);
  const prevLayoutRef = useRef(readerLayout);
  const [displayTokens, setDisplayTokens] = useState<Token[]>(() =>
    tokensAtIndex(tokens, wordIndex),
  );
  const [chapterOverlay, setChapterOverlay] = useState<{
    title: string;
    index: number;
  } | null>(null);

  const chapterBreakpoints = useMemo(
    () =>
      chapters.map((ch, i) => ({
        offset: chapterOffsets[i] ?? 0,
        title: ch.title,
      })),
    [chapters, chapterOffsets],
  );

  const dismissChapterOverlay = useCallback(() => {
    setChapterOverlay(null);
    if (wasPlayingRef.current) {
      engineRef.current?.continueAfterChapterTitle();
    }
  }, []);

  useEffect(() => {
    if (!chapterOverlay) return;
    const id = setTimeout(dismissChapterOverlay, 3200);
    return () => clearTimeout(id);
  }, [chapterOverlay, dismissChapterOverlay]);

  useEffect(() => {
    if (!isPlaying) {
      setDisplayTokens(tokensAtIndex(tokens, wordIndex));
    }
  }, [tokens, wordIndex, isPlaying, preferences.readingMode, preferences.bionicWordsPerChunk]);

  useEffect(() => {
    if (readerLayout !== 'rsvp') return;

    if (!engineRef.current) {
      engineRef.current = new RSVPEngine(preferences, {
        onWord: (chunk) => {
          setDisplayTokens(chunk.tokens);
          const last = chunk.tokens[chunk.tokens.length - 1];
          if (last) setWordIndex(last.index);
        },
        onChapterTitle: (title, index) => {
          wasPlayingRef.current = true;
          const offset = useReaderStore.getState().chapterOffsets[index] ?? 0;
          useReaderStore.setState({ currentChapterIndex: index, wordIndex: offset });
          setChapterOverlay({ title, index });
        },
        onComplete: () => {
          setPlaying(false);
          void persistProgress();
        },
      });
    }

    engineRef.current.setChapters(chapterBreakpoints);
    engineRef.current.updatePreferences(preferences);
  }, [
    preferences,
    readerLayout,
    chapterBreakpoints,
    setWordIndex,
    setPlaying,
    persistProgress,
  ]);

  useEffect(() => {
    if (readerLayout !== 'rsvp' || isPlaying) return;
    engineRef.current?.loadTokens(tokens, wordIndex);
  }, [tokens, wordIndex, readerLayout, isPlaying, currentChapterIndex]);

  useEffect(() => {
    const prev = prevLayoutRef.current;
    prevLayoutRef.current = readerLayout;
    if (prev === 'scroll' && readerLayout === 'rsvp' && isPlaying) {
      engineRef.current?.loadTokens(tokens, wordIndex);
    }
  }, [readerLayout, isPlaying, tokens, wordIndex]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || readerLayout !== 'rsvp') return;
    if (chapterOverlay) return;

    if (isPlaying) engine.play();
    else engine.pause();
  }, [isPlaying, readerLayout, chapterOverlay]);

  useEffect(() => {
    return () => {
      engineRef.current?.pause();
    };
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (chapterOverlay) {
      wasPlayingRef.current = true;
      dismissChapterOverlay();
      setPlaying(true);
      return;
    }
    setPlaying(!isPlaying);
  }, [chapterOverlay, dismissChapterOverlay, isPlaying, setPlaying]);

  const handleSeek = useCallback(
    (delta: number) => {
      engineRef.current?.seek(delta);
      const idx = engineRef.current?.getCurrentIndex() ?? wordIndex;
      setWordIndex(idx);
      setDisplayTokens(tokensAtIndex(tokens, idx));
      void persistProgress();
    },
    [tokens, wordIndex, setWordIndex, persistProgress],
  );

  const handleRestart = useCallback(() => {
    engineRef.current?.stop();
    engineRef.current?.loadTokens(tokens, 0);
    setWordIndex(0);
    setDisplayTokens(tokensAtIndex(tokens, 0));
    setPlaying(false);
    setChapterOverlay(null);
  }, [tokens, setWordIndex, setPlaying]);

  const handleEscape = useCallback(() => {
    if (chapterOverlay) {
      dismissChapterOverlay();
      return;
    }
    setPlaying(false);
    void persistProgress();
    setScreen('library');
  }, [chapterOverlay, dismissChapterOverlay, setPlaying, persistProgress, setScreen]);

  useKeyboard(
    handleTogglePlay,
    handleSeek,
    (delta) => setWpm(preferences.wpm + delta),
    handleEscape,
  );

  useEffect(() => {
    const id = setInterval(() => {
      if (isPlaying) void persistProgress();
    }, 5000);
    return () => clearInterval(id);
  }, [isPlaying, persistProgress]);

  const progress =
    tokens.length > 0 ? ((wordIndex + 1) / tokens.length) * 100 : 0;

  return (
    <div className="flex h-[100dvh] min-h-svh flex-col overflow-hidden">
      <SystemBar
        left={
          <button
            type="button"
            onClick={handleEscape}
            className="rm-bar-btn"
            title="Volver a la biblioteca"
          >
            <Icon name="back" />
            <span className="hidden sm:inline">Biblioteca</span>
          </button>
        }
        center={
          <span className="hidden sm:inline">
            <span className="text-reader-text">{bookTitle}</span>
            {' · '}
            {readerLayout === 'rsvp' ? modeLabel[preferences.readingMode] : 'Página'}
          </span>
        }
        right={
          chapters.length > 1 && (
            <select
              value={currentChapterIndex}
              onChange={(e) => void setChapter(Number(e.target.value))}
              className="rm-select w-36 sm:w-44"
              title="Capítulo"
            >
              {chapters.map((ch, i) => (
                <option key={ch.id} value={i}>
                  {ch.title}
                </option>
              ))}
            </select>
          )
        }
      />

      <p className="truncate px-4 pb-2 text-center text-xs text-reader-text sm:hidden">
        {bookTitle}
      </p>

      {tokens.length > 0 && (
        <ProgressBar
          progress={progress}
          wordIndex={wordIndex}
          tokens={tokens}
          wpm={preferences.wpm}
          mode={preferences.readingMode}
          chapterOffsets={chapterOffsets}
          currentChapterIndex={currentChapterIndex}
          compact={readerLayout === 'scroll'}
        />
      )}

      <main className="relative min-h-0 flex-1 overflow-hidden">
        {tokenizing ? (
          <div className="flex h-full items-center justify-center text-reader-muted">
            Preparando el texto…
          </div>
        ) : readerLayout === 'scroll' ? (
          <TraditionalView />
        ) : (
          <div className="flex h-full items-center justify-center px-2 sm:px-4">
            <WordDisplay
              tokens={displayTokens}
              mode={preferences.readingMode}
              preferences={preferences}
              fontSize={preferences.fontSize}
            />
          </div>
        )}

        {chapterOverlay && readerLayout === 'rsvp' && (
          <ChapterTitleCard
            title={chapterOverlay.title}
            chapterNumber={chapterOverlay.index}
            onDismiss={dismissChapterOverlay}
          />
        )}
      </main>

      <div className="safe-bottom shrink-0">
        <ControlBar
          isPlaying={isPlaying}
          wpm={preferences.wpm}
          mode={preferences.readingMode}
          layout={readerLayout}
          bionicWordsPerChunk={preferences.bionicWordsPerChunk}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onRestart={handleRestart}
          onWpmChange={setWpm}
          onModeChange={setReadingMode}
          onLayoutChange={setReaderLayout}
          onSettings={() => setSettingsOpen(true)}
          onBookmarks={() => setBookmarksOpen(true)}
          onFullscreen={() => void toggleFullscreen()}
          onBack={handleEscape}
        />
      </div>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <BookmarksPanel open={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />
    </div>
  );
}
