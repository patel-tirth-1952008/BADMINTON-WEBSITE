import { NextRequest } from 'next/server';
import { adminDb, badRequest, json } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get('date');
    const courtId = request.nextUrl.searchParams.get('courtId');
    if (!date || !courtId) return badRequest('A date and court are required.');
    const db = adminDb();
    const [{ data: slots, error: slotError }, { data: bookings, error: bookingError }] = await Promise.all([
      db.from('time_slots').select('*').eq('is_active', true).order('start_time'),
      db.from('bookings').select('id,time_slot_id,status').eq('booking_date', date).eq('court_id', courtId),
    ]);
    if (slotError || bookingError) throw slotError || bookingError;
    return json({ slots, bookedSlotIds: (bookings || []).map((booking) => booking.time_slot_id), bookings: bookings || [] });
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Unable to check availability.' }, { status: 500 }); }
}
