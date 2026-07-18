import { tokenize } from '../engines/tokenizer';
import type { Token } from '../engines/types';

const WORKER_THRESHOLD = 30_000;

export async function tokenizeAsync(text: string): Promise<Token[]> {
  if (text.length < WORKER_THRESHOLD) {
    return tokenize(text);
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./tokenize.worker.ts', import.meta.url),
      { type: 'module' },
    );
    worker.onmessage = (e: MessageEvent<{ tokens: Token[] }>) => {
      resolve(e.data.tokens);
      worker.terminate();
    };
    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };
    worker.postMessage({ text });
  });
}
