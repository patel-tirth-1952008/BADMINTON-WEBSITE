import { NextRequest } from 'next/server';
import { adminDb, badRequest, json, parseBody, requireAdmin, requireUser } from '@/lib/api';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireUser(request); if (auth.failure) return auth.failure;
    const db = adminDb(); const { data, error } = await db.from('bookings').select('*,courts(*),time_slots(*)').eq('id', params.id).single();
    if (error || !data) return badRequest('Booking not found.', 404);
    if (auth.profile!.role !== 'admin' && data.user_id !== auth.user!.id) return badRequest('You cannot view this booking.', 403);
    return json({ booking: data });
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Unable to load booking.' }, { status: 500 }); }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await parseBody(request);
    const auth = await requireUser(request); if (auth.failure) return auth.failure;
    const db = adminDb(); const { data: existing, error: findError } = await db.from('bookings').select('*').eq('id', params.id).single();
    if (findError || !existing) return badRequest('Booking not found.', 404);
    const isAdmin = auth.profile!.role === 'admin';
    if (!isAdmin && existing.user_id !== auth.user!.id) return badRequest('You cannot update this booking.', 403);
    const allowed = isAdmin ? ['status','payment_status','notes','player_name','player_phone','player_email','num_players'] : ['status'];
    const updates = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
    if (!isAdmin && updates.status !== 'cancelled') return badRequest('Students can only cancel their own booking.', 403);
    if (!Object.keys(updates).length) return badRequest('No valid booking changes were supplied.');
    const { data, error } = await db.from('bookings').update(updates).eq('id', params.id).select('*,courts(*),time_slots(*)').single();
    if (error) throw error; return json({ booking: data });
  } catch (error) { return badRequest(error instanceof Error ? error.message : 'Unable to update booking.'); }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin(request); if (auth.failure) return auth.failure;
    const { error } = await adminDb().from('bookings').delete().eq('id', params.id);
    if (error) throw error; return json({ success: true });
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Unable to delete booking.' }, { status: 500 }); }
}
