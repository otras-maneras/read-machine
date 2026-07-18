import ePub from 'epubjs';
import type { NavItem } from 'epubjs';
import type { Chapter, ParsedDocument } from '../engines/types';
import { htmlToPlainText } from './text-normalizer';

function findNavTitle(toc: NavItem[], href: string): string | undefined {
  for (const item of toc) {
    if (item.href && href.includes(item.href.split('#')[0])) {
      return item.label?.trim();
    }
    if (item.subitems?.length) {
      const found = findNavTitle(item.subitems, href);
      if (found) return found;
    }
  }
  return undefined;
}

async function extractCoverDataUrl(
  book: ReturnType<typeof ePub>,
): Promise<string | undefined> {
  try {
    const url = await book.coverUrl();
    if (!url) return undefined;
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

export async function parseEpub(buffer: ArrayBuffer): Promise<ParsedDocument> {
  const book = ePub(buffer);
  await book.ready;

  const meta = await book.loaded.metadata;
  const navigation = await book.loaded.navigation;
  const spine = book.spine;
  const coverDataUrl = await extractCoverDataUrl(book);

  const chapters: Chapter[] = [];
  const loadSection = book.load.bind(book);

  for (let i = 0; ; i++) {
    const section = spine.get(i);
    if (!section) break;
    if (!section.linear) continue;

    await section.load(loadSection);

    const html =
      section.document?.body?.innerHTML ??
      section.document?.documentElement?.innerHTML ??
      '';
    const text = htmlToPlainText(html);
    if (!text) continue;

    const href = section.href ?? String(i);
    let title =
      findNavTitle(navigation.toc, href) ?? `Capítulo ${chapters.length + 1}`;

    const prev = chapters[chapters.length - 1];
    if (prev?.title === title) {
      title = `${title} · ${chapters.length + 1}`;
    }

    chapters.push({ id: href, title, text });
    section.unload();
  }

  book.destroy();

  if (chapters.length === 0) {
    throw new Error('No se pudo extraer texto del ePub');
  }

  const fullText = chapters.map((c) => c.text).join('\n\n');

  return {
    title: meta.title || 'Sin título',
    author: meta.creator,
    format: 'epub',
    chapters,
    fullText,
    coverDataUrl,
  };
}
