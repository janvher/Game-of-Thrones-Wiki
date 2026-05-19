/** Strip tags and decode WordPress / HTML entities (e.g. &#8217; → '). */
export function cleanRenderedText(html: string): string {
  const stripped = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return decodeHtmlEntities(stripped);
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);?/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/g, "'");
}
