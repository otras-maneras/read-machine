import { nanoid } from 'nanoid';
import type { BookFormat, ParsedDocument } from '../engines/types';
import { normalizeText } from './text-normalizer';

export async function parseFile(file: File): Promise<ParsedDocument> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const buffer = await file.arrayBuffer();

  if (ext === 'epub') {
    const { parseEpub } = await import('./epub-parser');
    return parseEpub(buffer);
  }

  if (ext === 'pdf') {
    const { parsePdf } = await import('./pdf-parser');
    return parsePdf(buffer);
  }

  const text = normalizeText(await file.text());
  const format: BookFormat = ext === 'md' || ext === 'markdown' ? 'md' : 'txt';

  return {
    title: file.name.replace(/\.[^.]+$/, ''),
    format,
    chapters: [{ id: nanoid(), title: 'Contenido', text }],
    fullText: text,
  };
}

export function parsePastedText(text: string, title = 'Texto pegado'): ParsedDocument {
  const normalized = normalizeText(text);
  return {
    title,
    format: 'paste',
    chapters: [{ id: nanoid(), title: 'Contenido', text: normalized }],
    fullText: normalized,
  };
}
