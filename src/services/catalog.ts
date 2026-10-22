import type { Chapter, ParsedDocument } from '../engines/types';

/** Libro de la biblioteca abierta (dominio público), servido en /libros/. */
export interface CatalogBook {
  id: string;
  title: string;
  author: string;
  year: string;
  file: string;
}

const BASE = '/libros/';

/** Id en IndexedDB: fijo por libro, así no se duplica al abrirlo de nuevo. */
export const catalogBookId = (book: CatalogBook) => `catalogo:${book.id}`;
export const catalogCoverUrl = (book: CatalogBook) => `${BASE}portadas/${book.id}.jpg`;

export async function loadCatalog(): Promise<CatalogBook[]> {
  try {
    const response = await fetch(`${BASE}catalogo.json`);
    if (!response.ok) return [];
    return (await response.json()) as CatalogBook[];
  } catch {
    return [];
  }
}

// Las ediciones de Project Gutenberg traen licencia y avisos en inglés antes y
// después de la obra, delimitados por estas marcas.
const START = /\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^*]*\*{3}/i;
const END = /\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^*]*\*{3}/i;

function stripGutenberg(chapters: Chapter[]): Chapter[] {
  let started = !chapters.some((c) => START.test(c.text));
  const out: Chapter[] = [];
  for (const chapter of chapters) {
    let text = chapter.text;
    if (!started) {
      const m = text.match(START);
      if (!m || m.index === undefined) continue;
      text = text.slice(m.index + m[0].length);
      started = true;
    }
    const end = text.match(END);
    if (end?.index !== undefined) text = text.slice(0, end.index);
    text = text.trim();
    if (text) out.push({ ...chapter, text });
    if (end) break;
  }
  return out.length ? out : chapters;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Descarga y procesa un libro del catálogo, con título, autor y portada propios. */
export async function fetchCatalogBook(book: CatalogBook): Promise<ParsedDocument> {
  const response = await fetch(BASE + book.file);
  if (!response.ok) throw new Error(`No se pudo descargar «${book.title}»`);
  const { parseEpub } = await import('../parsers/epub-parser');
  const doc = await parseEpub(await response.arrayBuffer());
  const chapters = stripGutenberg(doc.chapters);
  const cover = await fetch(catalogCoverUrl(book))
    .then((r) => (r.ok ? r.blob() : null))
    .then((b) => (b ? blobToDataUrl(b) : undefined))
    .catch(() => undefined);
  return {
    ...doc,
    title: book.title,
    author: book.author,
    chapters,
    fullText: chapters.map((c) => c.text).join('\n\n'),
    coverDataUrl: cover ?? doc.coverDataUrl,
  };
}
