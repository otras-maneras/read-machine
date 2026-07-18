import * as pdfjs from 'pdfjs-dist';
import type { Chapter, ParsedDocument } from '../engines/types';
import { normalizeText } from './text-normalizer';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export async function parsePdf(buffer: ArrayBuffer): Promise<ParsedDocument> {
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const chapters: Chapter[] = [];
  const pageTexts: string[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const text = normalizeText(
      content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' '),
    );
    if (text) {
      pageTexts.push(text);
      chapters.push({ id: `page-${p}`, title: `Página ${p}`, text });
    }
  }

  const fullText = pageTexts.join('\n\n');

  return {
    title: 'Documento PDF',
    format: 'pdf',
    chapters,
    fullText,
  };
}
