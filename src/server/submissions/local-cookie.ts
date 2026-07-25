import { decodeJsonCookie, parseCookieHeader, SUBMISSIONS_COOKIE } from '@/server/session/cookies';
import type { ContentSubmission } from '@/types/submission';

export function readLocalSubmissions(request: Request): ContentSubmission[] {
  const value = parseCookieHeader(request.headers.get('cookie')).get(SUBMISSIONS_COOKIE);
  const submissions = decodeJsonCookie<ContentSubmission[]>(value);
  return Array.isArray(submissions) ? submissions.slice(0, 12) : [];
}
