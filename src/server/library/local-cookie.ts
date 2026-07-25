import { readLibraryFromRequest, sanitizeLibrarySnapshot } from '@/server/session/cookies';
import type { LibrarySnapshot } from '@/types/library';

export function readLocalLibrarySnapshot(request: Request): LibrarySnapshot {
  return sanitizeLibrarySnapshot(readLibraryFromRequest(request) ?? {});
}
