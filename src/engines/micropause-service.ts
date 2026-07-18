import type { MicropauseConfig } from './types';

interface MicropauseStrategy {
  getMultiplier(word: string): number;
}

class SentencePunctuationStrategy implements MicropauseStrategy {
  private multiplier: number;

  constructor(multiplier: number) {
    this.multiplier = multiplier;
  }

  getMultiplier(word: string): number {
    return /[.!?]$/.test(word) ? this.multiplier : 1;
  }
}

class OtherPunctuationStrategy implements MicropauseStrategy {
  private multiplier: number;

  constructor(multiplier: number) {
    this.multiplier = multiplier;
  }

  getMultiplier(word: string): number {
    return /[;:,]$/.test(word) ? this.multiplier : 1;
  }
}

class NumberStrategy implements MicropauseStrategy {
  private multiplier: number;

  constructor(multiplier: number) {
    this.multiplier = multiplier;
  }

  getMultiplier(word: string): number {
    return /\d/.test(word) ? this.multiplier : 1;
  }
}

class LongWordStrategy implements MicropauseStrategy {
  private multiplier: number;

  constructor(multiplier: number) {
    this.multiplier = multiplier;
  }

  getMultiplier(word: string): number {
    return word.length > 8 ? this.multiplier : 1;
  }
}

class ParagraphBreakStrategy implements MicropauseStrategy {
  private multiplier: number;

  constructor(multiplier: number) {
    this.multiplier = multiplier;
  }

  getMultiplier(word: string): number {
    return word === '\n' || word.includes('\n') ? this.multiplier : 1;
  }
}

export class MicropauseService {
  private strategies: MicropauseStrategy[];
  private enabled: boolean;

  constructor(config: MicropauseConfig) {
    this.enabled = config.enabled;
    this.strategies = [
      new SentencePunctuationStrategy(config.punctuation),
      new OtherPunctuationStrategy(config.otherPunctuation),
      new NumberStrategy(config.numbers),
      new LongWordStrategy(config.longWords),
      new ParagraphBreakStrategy(config.paragraph),
    ];
  }

  calculateMultiplier(word: string): number {
    if (!this.enabled) return 1;
    let total = 1;
    for (const strategy of this.strategies) {
      total *= strategy.getMultiplier(word);
    }
    return total;
  }

  updateConfig(config: MicropauseConfig): void {
    this.enabled = config.enabled;
    this.strategies = [
      new SentencePunctuationStrategy(config.punctuation),
      new OtherPunctuationStrategy(config.otherPunctuation),
      new NumberStrategy(config.numbers),
      new LongWordStrategy(config.longWords),
      new ParagraphBreakStrategy(config.paragraph),
    ];
  }
}
