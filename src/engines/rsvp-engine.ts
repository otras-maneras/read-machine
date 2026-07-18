import { MicropauseService } from './micropause-service';
import type { Token, UserPreferences, WordChunk } from './types';

export interface ChapterBreakpoint {
  offset: number;
  title: string;
}

export interface RSVPEngineCallbacks {
  onWord: (chunk: WordChunk) => void;
  onChapterTitle?: (title: string, chapterIndex: number) => void;
  onComplete: () => void;
}

export class RSVPEngine {
  private tokens: Token[] = [];
  private chapters: ChapterBreakpoint[] = [];
  private currentIndex = 0;
  private playing = false;
  private waitingChapterTitle = false;
  private shownChapterOffsets = new Set<number>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private sessionWordsRead = 0;
  private micropause: MicropauseService;
  private preferences: UserPreferences;
  private callbacks: RSVPEngineCallbacks;

  constructor(preferences: UserPreferences, callbacks: RSVPEngineCallbacks) {
    this.preferences = preferences;
    this.callbacks = callbacks;
    this.micropause = new MicropauseService(preferences.micropauses);
  }

  setChapters(chapters: ChapterBreakpoint[]): void {
    this.chapters = chapters;
  }

  loadTokens(tokens: Token[], startIndex = 0): void {
    const jumped =
      this.tokens.length !== tokens.length ||
      Math.abs(this.currentIndex - startIndex) > 0;
    this.tokens = tokens;
    this.currentIndex = Math.min(startIndex, Math.max(0, tokens.length - 1));
    this.sessionWordsRead = 0;
    this.waitingChapterTitle = false;
    if (jumped) this.shownChapterOffsets.clear();
  }

  /** Evita repetir la tarjeta de capítulo al reanudar en el mismo inicio. */
  markChapterTitleShown(offset: number): void {
    this.shownChapterOffsets.add(offset);
  }

  play(): void {
    if (this.playing) return;
    if (this.currentIndex >= this.tokens.length) {
      this.currentIndex = 0;
    }
    this.playing = true;
    this.tick();
  }

  pause(): void {
    this.playing = false;
    this.clearTimer();
  }

  stop(): void {
    this.pause();
    this.currentIndex = 0;
    this.sessionWordsRead = 0;
    this.waitingChapterTitle = false;
  }

  seek(delta: number): void {
    this.currentIndex = Math.max(
      0,
      Math.min(this.tokens.length - 1, this.currentIndex + delta),
    );
    this.waitingChapterTitle = false;
    if (!this.playing) {
      this.emitCurrent();
    }
  }

  continueAfterChapterTitle(): void {
    this.waitingChapterTitle = false;
    this.playing = true;
    this.tick();
  }

  getProgress(): number {
    return this.tokens.length > 0
      ? (this.currentIndex / this.tokens.length) * 100
      : 0;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getTotalTokens(): number {
    return this.tokens.length;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  updatePreferences(preferences: UserPreferences): void {
    const wasPlaying = this.playing;
    this.preferences = preferences;
    this.micropause.updateConfig(preferences.micropauses);
    if (wasPlaying && !this.waitingChapterTitle) {
      this.clearTimer();
      this.tick();
    }
  }

  private getChunkSize(): number {
    if (this.preferences.readingMode === 'bionic') {
      return Math.max(1, Math.min(12, this.preferences.bionicWordsPerChunk));
    }
    return 1;
  }

  private chapterIndexAt(offset: number): number | null {
    for (let i = this.chapters.length - 1; i >= 0; i--) {
      if (this.chapters[i].offset === offset) return i;
    }
    return null;
  }

  private maybeShowChapterTitle(): boolean {
    const chapterIndex = this.chapterIndexAt(this.currentIndex);
    if (chapterIndex === null || chapterIndex === 0 || !this.callbacks.onChapterTitle) {
      return false;
    }

    const offset = this.chapters[chapterIndex]?.offset;
    if (offset !== undefined && this.shownChapterOffsets.has(offset)) return false;

    if (offset !== undefined) this.shownChapterOffsets.add(offset);

    this.waitingChapterTitle = true;
    this.clearTimer();
    this.callbacks.onChapterTitle(
      this.chapters[chapterIndex].title,
      chapterIndex,
    );
    return true;
  }

  private tick(): void {
    if (!this.playing || this.currentIndex >= this.tokens.length) {
      this.playing = false;
      if (this.currentIndex >= this.tokens.length) {
        this.callbacks.onComplete();
      }
      return;
    }

    if (this.maybeShowChapterTitle()) return;

    const chunk = this.collectChunk();
    let delay = chunk.delay;

    if (this.preferences.enableSlowStart && this.sessionWordsRead < 5) {
      delay *= 1 + (5 - this.sessionWordsRead) / 5;
    }

    this.callbacks.onWord({
      tokens: chunk.tokens,
      delay,
      isEnd: this.currentIndex >= this.tokens.length,
    });

    this.timer = setTimeout(() => this.tick(), delay);
  }

  private collectChunk(): { tokens: Token[]; delay: number } {
    const chunkSize = this.getChunkSize();
    const chunkTokens: Token[] = [];
    let delay = 0;

    while (chunkTokens.length < chunkSize && this.currentIndex < this.tokens.length) {
      const token = this.tokens[this.currentIndex];
      chunkTokens.push(token);

      if (token.isParagraphBreak) {
        delay += this.calculateDelay('');
        this.currentIndex++;
        break;
      }

      delay += this.calculateDelay(token.text);
      this.sessionWordsRead++;
      this.currentIndex++;

      if (chunkTokens.length >= chunkSize) break;
    }

    if (delay === 0 && chunkTokens.length > 0) {
      delay = this.calculateDelay(chunkTokens[0]?.text ?? '');
    }

    return { tokens: chunkTokens, delay };
  }

  private emitCurrent(): void {
    if (this.tokens.length === 0) return;

    const chunkSize = this.getChunkSize();
    const chunkTokens: Token[] = [];
    let delay = 0;
    let i = this.currentIndex;

    while (chunkTokens.length < chunkSize && i < this.tokens.length) {
      const token = this.tokens[i];
      chunkTokens.push(token);

      if (token.isParagraphBreak) {
        delay += this.calculateDelay('');
        break;
      }

      delay += this.calculateDelay(token.text);
      i++;

      if (chunkTokens.length >= chunkSize) break;
    }

    this.callbacks.onWord({
      tokens: chunkTokens,
      delay: delay || this.calculateDelay(''),
      isEnd: this.currentIndex >= this.tokens.length - 1,
    });
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private calculateDelay(text: string): number {
    const baseDelay = (60 / this.preferences.wpm) * 1000;
    return baseDelay * this.micropause.calculateMultiplier(text);
  }
}
