export function htmlToPlainText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const text = doc.body.textContent ?? '';
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/[ \f\v]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
