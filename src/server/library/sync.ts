import type { LibrarySnapshot } from '@/types/library';

const libraryUrl = process.env.VERTYX_LIBRARY_API_URL?.replace(/\/$/, '');
const libraryKey = process.env.VERTYX_LIBRARY_API_KEY;

function headers(request?: Request) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(libraryKey ? { Authorization: `Bearer ${libraryKey}` } : {}),
    ...(request?.headers.get('cookie') ? { Cookie: request.headers.get('cookie') ?? '' } : {}),
  };
}

export function hasLibrarySyncProvider() {
  return Boolean(libraryUrl);
}

export async function readLibrarySnapshot(request: Request): Promise<LibrarySnapshot | undefined> {
  if (!libraryUrl) return undefined;
  const response = await fetch(`${libraryUrl}/library`, { headers: headers(request), cache: 'no-store' });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`Library provider responded with ${response.status}`);
  return response.json() as Promise<LibrarySnapshot>;
}

export async function writeLibrarySnapshot(snapshot: LibrarySnapshot, request: Request): Promise<void> {
  if (!libraryUrl) return;
  const response = await fetch(`${libraryUrl}/library`, {
    method: 'PUT',
    headers: headers(request),
    body: JSON.stringify(snapshot),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Library provider responded with ${response.status}`);
}
