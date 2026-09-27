# RallyPoint Badminton Academy

A full-stack Next.js 14 badminton academy application using Supabase for authentication, PostgreSQL, Storage and Realtime, plus Resend for booking emails.

## What is included

- Live court booking flow with database-priced regular/peak slots, unique double-booking protection and a Supabase Realtime availability subscription.
- Student registration/login, protected progress dashboard and role-protected admin panel.
- Database-driven programs, enrollments, coaches, courts, pricing, gallery, contact inquiries, attendance and skill progress.
- Admin workflows for bookings, students, enrollment approval, pricing, courts, coaches, gallery uploads, contact inquiries, reminders and academy settings.
- Resend confirmation email delivery and a secured Vercel cron endpoint for booking reminders.
- Responsive amber/white design system with no blue or purple styling.

## Local setup

1. Create a Supabase project.
2. In its **SQL Editor**, run [`supabase/schema.sql`](./supabase/schema.sql) in full. This creates the schema, policies, Storage bucket, Realtime publication and catalog seed data.
3. Copy `.env.example` to `.env.local` and set each value from Supabase, Resend and a long random `CRON_SECRET`.
4. Create an administrator through `/register`, then promote it once in the Supabase SQL editor:

   ```sql
   update public.profiles set role = 'admin' where email = 'your-admin-email@example.com';
   ```

5. Install and run the app:

   ```bash
   npm install
   npm run dev
   ```

Open `http://localhost:3000`.

## Email and cron

- Add and verify a sending domain in Resend and set `RESEND_FROM_EMAIL` to a valid sender, such as `RallyPoint Badminton Academy <bookings@yourdomain.com>`.
- The included `vercel.json` invokes `/api/reminders/send` every 30 minutes. Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`; match that secret in the Vercel environment variables.
- Reminder content, send window and enable state are editable in **Admin → Reminders**.

## Deploy to Vercel

1. Push this repository to GitHub, GitLab or Bitbucket.
2. Import it into Vercel as a Next.js project.
3. Add every `.env.local` value in Vercel Project Settings → Environment Variables.
4. Deploy. The cron configuration in `vercel.json` is applied automatically.

## Verification

The source has been checked with:

```bash
npm run typecheck
npm run build
```
