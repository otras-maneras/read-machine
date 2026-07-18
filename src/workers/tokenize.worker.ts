import { tokenize } from '../engines/tokenizer';

self.onmessage = (e: MessageEvent<{ text: string }>) => {
  const tokens = tokenize(e.data.text);
  self.postMessage({ tokens });
};
