export function contentHref(item: { id: string }): string {
  return `/title/${item.id}`;
}

export function contentIdFromLegacyHref(href: string, fallback: string): string {
  return new URLSearchParams(href.split('?')[1]).get('id') ?? fallback;
}
