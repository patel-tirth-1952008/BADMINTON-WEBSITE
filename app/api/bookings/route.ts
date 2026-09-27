import { NextRequest } from 'next/server';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { adminDb, badRequest, json, parseBody, requireAdmin, currentUser } from '@/lib/api';
import { bookingSchema } from '@/lib/utils/validators';
import { sendBookingEmail } from '@/lib/email';
import { money } from '@/lib/utils/helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request); if (auth.failure) return auth.failure;
    const page = Math.max(Number(request.nextUrl.searchParams.get('page') || 1), 1);
    const pageSize = Math.min(Math.max(Number(request.nextUrl.searchParams.get('pageSize') || 10), 1), 100);
    const date = request.nextUrl.searchParams.get('date'); const courtId = request.nextUrl.searchParams.get('courtId'); const status = request.nextUrl.searchParams.get('status');
    let query = adminDb().from('bookings').select('*,courts(*),time_slots(*)', { count: 'exact' }).order('booking_date', { ascending: false }).order('created_at', { ascending: false });
    if (date) query = query.eq('booking_date', date); if (courtId) query = query.eq('court_id', courtId); if (status) query = query.eq('status', status);
    const { data, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
    if (error) throw error; return json({ bookings: data || [], total: count || 0, page, pageSize });
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Unable to load bookings.' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const input = bookingSchema.parse(await parseBody(request));
    const bookingDate = new Date(`${input.booking_date}T00:00:00`);
    const db = adminDb();
    const { data: settings, error: settingsError } = await db.from('academy_settings').select('*').limit(1).single();
    if (settingsError || !settings) throw settingsError || new Error('Academy settings are unavailable.');
    const advance = differenceInCalendarDays(bookingDate, startOfDay(new Date()));
    if (advance < 0 || advance > settings.max_advance_booking_days) return badRequest(`Bookings are available from today through the next ${settings.max_advance_booking_days} days.`);
    const [{ data: court, error: courtError }, { data: slot, error: slotError }] = await Promise.all([
      db.from('courts').select('*').eq('id', input.court_id).eq('is_active', true).single(),
      db.from('time_slots').select('*').eq('id', input.time_slot_id).eq('is_active', true).single(),
    ]);
    if (courtError || !court || slotError || !slot) return badRequest('The selected court or time slot is no longer available.');
    const { data: existing, error: existingError } = await db.from('bookings').select('id').eq('court_id', input.court_id).eq('time_slot_id', input.time_slot_id).eq('booking_date', input.booking_date).maybeSingle();
    if (existingError) throw existingError;
    if (existing) return badRequest('That time slot was just booked. Please choose another slot.', 409);
    const { data: rate, error: rateError } = await db.from('pricing').select('price').eq('category', 'court_booking').eq('duration_type', 'per_hour').eq('is_peak_hour', slot.is_peak).eq('is_active', true).single();
    if (rateError || !rate) return badRequest('Court pricing has not been configured.', 503);
    const { user } = await currentUser(request);
    const { data: booking, error: insertError } = await db.from('bookings').insert({ ...input, notes: input.notes || null, user_id: user?.id || null, amount: rate.price, status: 'confirmed', payment_status: 'pending' }).select('*,courts(*),time_slots(*)').single();
    if (insertError) {
      if (insertError.code === '23505') return badRequest('That time slot was just booked. Please choose another slot.', 409);
      throw insertError;
    }
    let emailWarning: string | null = null;
    try {
      await sendBookingEmail({ to: booking.player_email, subject: `Booking confirmed · ${settings.academy_name}`, text: `Hi ${booking.player_name}, your booking is confirmed for ${booking.booking_date}, ${booking.time_slots.slot_label}, ${booking.courts.name}. Amount due: ${money(booking.amount)}. We look forward to seeing you! — ${settings.academy_name}` });
    } catch (mailError) { emailWarning = mailError instanceof Error ? mailError.message : 'Confirmation email could not be sent.'; }
    return json({ booking, emailWarning }, { status: 201 });
  } catch (error) { return badRequest(error instanceof Error ? error.message : 'Unable to create booking.'); }
}
