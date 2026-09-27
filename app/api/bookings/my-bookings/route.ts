import { NextRequest } from 'next/server';
import { adminDb, json, requireUser } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request); if (auth.failure) return auth.failure;
    const { data, error } = await adminDb().from('bookings').select('*,courts(*),time_slots(*)').eq('user_id', auth.user!.id).order('booking_date', { ascending: false });
    if (error) throw error; return json({ bookings: data || [] });
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Unable to load bookings.' }, { status: 500 }); }
}
