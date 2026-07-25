import { readProfileFromRequest } from '@/server/session/cookies';
import type { ProfileAssetKind } from '@/types/infrastructure';

export const PROFILE_ASSET_LIMITS: Record<ProfileAssetKind, { maxBytes: number; path: string }> = {
  avatar: { maxBytes: 4_000_000, path: 'avatars' },
  banner: { maxBytes: 4_500_000, path: 'banners' },
  cover: { maxBytes: 4_500_000, path: 'covers' },
};

const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];

type BlobPut = (pathname: string, body: File, options: { access: 'public'; addRandomSuffix: boolean; contentType: string }) => Promise<{ url: string; pathname: string; contentType?: string; size?: number }>;

function isAssetKind(value: unknown): value is ProfileAssetKind {
  return value === 'avatar' || value === 'banner' || value === 'cover';
}

function safeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'asset';
}

async function loadBlobPut(): Promise<BlobPut | undefined> {
  try {
    const mod = await import('@vercel/blob') as { put?: BlobPut };
    return mod.put;
  } catch {
    return undefined;
  }
}

export async function uploadProfileAsset(request: Request): Promise<Response> {
  const profile = readProfileFromRequest(request);
  if (!profile) return Response.json({ ok: false, ready: true, message: 'Necesitas una sesión para subir archivos.' }, { status: 401 });

  const form = await request.formData().catch(() => undefined);
  const file = form?.get('file');
  const kind = form?.get('kind');
  if (!(file instanceof File) || !isAssetKind(kind)) return Response.json({ ok: false, ready: true, message: 'Archivo o tipo de asset inválido.' }, { status: 400 });
  if (!acceptedTypes.includes(file.type)) return Response.json({ ok: false, ready: true, message: 'Formato no soportado. Usa JPG, PNG o WebP.' }, { status: 415 });

  const limit = PROFILE_ASSET_LIMITS[kind];
  if (file.size > limit.maxBytes) return Response.json({ ok: false, ready: true, message: `El archivo supera el límite de ${(limit.maxBytes / 1_000_000).toFixed(1)} MB.` }, { status: 413 });

  const put = await loadBlobPut();
  const hasBlobEnv = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
  if (!put || !hasBlobEnv) return Response.json({ ok: false, ready: false, kind, message: 'Vercel Blob aún no está configurado para guardar este archivo.', next: 'Conecta un Blob store y expón BLOB_STORE_ID/VERCEL_OIDC_TOKEN o BLOB_READ_WRITE_TOKEN.' }, { status: 202 });

  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const pathname = `profiles/${profile.id}/${limit.path}/${Date.now()}-${safeName(file.name)}.${extension}`;
  const blob = await put(pathname, file, { access: 'public', addRandomSuffix: true, contentType: file.type });
  return Response.json({ ok: true, ready: true, kind, url: blob.url, pathname: blob.pathname, contentType: file.type, size: file.size, message: `${kind} guardado en Vercel Blob.` });
}
