import { NextResponse } from 'next/server';
import { moderateSubmission } from '@/server/infrastructure/actions';
import type { ModerationAction } from '@/types/infrastructure';

const actions: ModerationAction[] = ['approve', 'reject', 'review', 'hide', 'publish'];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json().catch(() => ({})) as { action?: ModerationAction };
  if (!body.action || !actions.includes(body.action)) return NextResponse.json({ ok: false, ready: true, message: 'Acción de moderación inválida.' }, { status: 400 });
  const { id } = await params;
  return moderateSubmission(request, id, body.action);
}
