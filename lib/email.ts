import { Resend } from 'resend';

export async function sendBookingEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) throw new Error('Email delivery is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL.');
  const resend = new Resend(key);
  const { error } = await resend.emails.send({ from, to: [to], subject, text });
  if (error) throw new Error(error.message);
}
