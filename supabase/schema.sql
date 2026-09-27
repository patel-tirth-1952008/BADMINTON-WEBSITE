-- RallyPoint Badminton Academy: run this entire file in Supabase SQL Editor.
create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('student','admin');
exception when duplicate_object then null; end $$;
do $$ begin create type public.court_surface as enum ('wooden','synthetic','mat','cement'); exception when duplicate_object then null; end $$;
do $$ begin create type public.pricing_category as enum ('court_booking','coaching_program','membership'); exception when duplicate_object then null; end $$;
do $$ begin create type public.duration_kind as enum ('per_hour','per_session','monthly','quarterly','yearly'); exception when duplicate_object then null; end $$;
do $$ begin create type public.booking_state as enum ('pending','confirmed','cancelled','completed','no_show'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_state as enum ('pending','paid','refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type public.program_level as enum ('beginner','intermediate','advanced','professional','kids'); exception when duplicate_object then null; end $$;
do $$ begin create type public.enrollment_state as enum ('pending','approved','rejected','active','completed','dropped'); exception when duplicate_object then null; end $$;
do $$ begin create type public.attendance_state as enum ('present','absent','late','excused'); exception when duplicate_object then null; end $$;
do $$ begin create type public.gallery_category as enum ('courts','training','tournaments','events','general'); exception when duplicate_object then null; end $$;
do $$ begin create type public.inquiry_state as enum ('unread','read','replied'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role public.user_role not null default 'student',
  avatar_url text,
  dob date,
  gender text check (gender in ('male','female','non_binary','prefer_not_to_say') or gender is null),
  emergency_contact text,
  address text,
  joined_date date not null default current_date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  court_number text not null unique,
  court_type public.court_surface not null,
  is_ac boolean not null default false,
  is_active boolean not null default true,
  description text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pricing (
  id uuid primary key default gen_random_uuid(),
  category public.pricing_category not null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  duration_type public.duration_kind not null,
  is_peak_hour boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(category, name, duration_type, is_peak_hour)
);

create table if not exists public.time_slots (
  id uuid primary key default gen_random_uuid(),
  start_time time not null,
  end_time time not null,
  is_peak boolean not null default false,
  is_active boolean not null default true,
  slot_label text not null unique,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  court_id uuid not null references public.courts(id) on delete restrict,
  time_slot_id uuid not null references public.time_slots(id) on delete restrict,
  booking_date date not null,
  status public.booking_state not null default 'pending',
  amount numeric(10,2) not null check (amount >= 0),
  payment_status public.payment_state not null default 'pending',
  player_name text not null,
  player_phone text not null,
  player_email text not null,
  num_players integer not null default 2 check (num_players between 1 and 8),
  notes text,
  reminder_sent boolean not null default false,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(court_id, time_slot_id, booking_date)
);

create table if not exists public.coaches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  specialization text not null,
  experience_years integer not null default 0 check (experience_years >= 0),
  achievements text[] not null default '{}',
  certifications text[] not null default '{}',
  bio text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  level public.program_level not null,
  description text not null,
  features text[] not null default '{}',
  age_group text,
  batch_time text,
  batch_days text,
  max_students integer not null default 20 check (max_students > 0),
  current_students integer not null default 0 check (current_students >= 0),
  price_monthly numeric(10,2) not null check (price_monthly >= 0),
  price_quarterly numeric(10,2) not null check (price_quarterly >= 0),
  price_yearly numeric(10,2) not null check (price_yearly >= 0),
  coach_id uuid references public.coaches(id) on delete set null,
  is_active boolean not null default true,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  program_id uuid not null references public.programs(id) on delete restrict,
  student_name text not null,
  student_email text not null,
  student_phone text not null,
  student_age integer check (student_age between 3 and 100),
  experience_level text,
  preferred_batch text,
  payment_plan public.duration_kind not null check (payment_plan in ('monthly','quarterly','yearly')),
  amount numeric(10,2) not null check (amount >= 0),
  status public.enrollment_state not null default 'pending',
  start_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  coach_id uuid references public.coaches(id) on delete set null,
  date date not null default current_date,
  smash_rating smallint not null check (smash_rating between 1 and 10),
  drop_shot_rating smallint not null check (drop_shot_rating between 1 and 10),
  net_play_rating smallint not null check (net_play_rating between 1 and 10),
  footwork_rating smallint not null check (footwork_rating between 1 and 10),
  serve_rating smallint not null check (serve_rating between 1 and 10),
  defense_rating smallint not null check (defense_rating between 1 and 10),
  stamina_rating smallint not null check (stamina_rating between 1 and 10),
  game_sense_rating smallint not null check (game_sense_rating between 1 and 10),
  overall_rating numeric(4,2) not null check (overall_rating between 1 and 10),
  coach_remarks text,
  areas_to_improve text,
  achievements text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid references public.programs(id) on delete set null,
  date date not null,
  status public.attendance_state not null,
  check_in_time timestamptz,
  check_out_time timestamptz,
  created_at timestamptz not null default now(),
  unique(student_id, date, program_id)
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text not null,
  category public.gallery_category not null default 'general',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  content text not null,
  rating smallint not null check (rating between 1 and 5),
  avatar_url text,
  is_featured boolean not null default false,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status public.inquiry_state not null default 'unread',
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_settings (
  id uuid primary key default gen_random_uuid(),
  academy_name text not null,
  tagline text not null,
  description text,
  phone text,
  email text,
  whatsapp_number text,
  address text,
  google_maps_url text,
  google_maps_embed text,
  operating_hours jsonb not null default '{}'::jsonb,
  social_links jsonb not null default '{}'::jsonb,
  logo_url text,
  hero_image_url text,
  booking_reminder_hours integer not null default 2 check (booking_reminder_hours between 1 and 72),
  reminder_enabled boolean not null default true,
  max_advance_booking_days integer not null default 7 check (max_advance_booking_days between 1 and 90),
  cancellation_hours integer not null default 4 check (cancellation_hours between 0 and 72),
  reminder_template text not null default 'Hi {player_name}, reminder: court booking today at {time} on {court}. See you there! - {academy}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reminder_type text not null default 'booking',
  sent_at timestamptz not null default now(),
  status text not null check (status in ('sent','failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists bookings_date_court_idx on public.bookings(booking_date, court_id);
create index if not exists bookings_user_idx on public.bookings(user_id);
create index if not exists enrollment_user_idx on public.enrollments(user_id);
create index if not exists progress_student_date_idx on public.student_progress(student_id, date desc);
create index if not exists attendance_student_date_idx on public.attendance(student_id, date desc);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and is_active = true);
$$;

create or replace function public.prevent_profile_role_escalation() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.role is distinct from new.role and auth.role() <> 'service_role' then
    raise exception 'Role cannot be changed by this user';
  end if;
  return new;
end; $$;

create or replace function public.sync_program_student_count() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    update public.programs set current_students = (select count(*) from public.enrollments where program_id = old.program_id and status in ('approved','active')) where id = old.program_id;
    return old;
  end if;
  update public.programs set current_students = (select count(*) from public.enrollments where program_id = new.program_id and status in ('approved','active')) where id = new.program_id;
  if tg_op = 'UPDATE' and old.program_id <> new.program_id then
    update public.programs set current_students = (select count(*) from public.enrollments where program_id = old.program_id and status in ('approved','active')) where id = old.program_id;
  end if;
  return new;
end; $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles for each row execute procedure public.touch_updated_at();
drop trigger if exists profile_role_guard on public.profiles;
create trigger profile_role_guard before update on public.profiles for each row execute procedure public.prevent_profile_role_escalation();

do $$ declare t text; begin
  foreach t in array array['courts','pricing','bookings','coaches','programs','enrollments','student_progress','gallery','testimonials','contact_inquiries','academy_settings'] loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute procedure public.touch_updated_at()', t, t);
  end loop;
end $$;
drop trigger if exists enrollment_program_count on public.enrollments;
create trigger enrollment_program_count after insert or update or delete on public.enrollments for each row execute procedure public.sync_program_student_count();

alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.enrollments enable row level security;
alter table public.student_progress enable row level security;
alter table public.attendance enable row level security;
alter table public.courts enable row level security;
alter table public.pricing enable row level security;
alter table public.time_slots enable row level security;
alter table public.coaches enable row level security;
alter table public.programs enable row level security;
alter table public.gallery enable row level security;
alter table public.testimonials enable row level security;
alter table public.contact_inquiries enable row level security;
alter table public.academy_settings enable row level security;
alter table public.reminder_logs enable row level security;

-- Remove prior policies when this script is re-run.
drop policy if exists "profiles own or admin read" on public.profiles;
drop policy if exists "profiles own update" on public.profiles;
drop policy if exists "profiles admin manage" on public.profiles;
create policy "profiles own or admin read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles own update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles admin manage" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "bookings own or admin" on public.bookings;
drop policy if exists "bookings own insert" on public.bookings;
create policy "bookings own or admin" on public.bookings for select using (user_id = auth.uid() or public.is_admin());
create policy "bookings own insert" on public.bookings for insert with check (user_id = auth.uid());
create policy "bookings own update or admin" on public.bookings for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "enrollments own or admin" on public.enrollments;
drop policy if exists "enrollments own insert" on public.enrollments;
create policy "enrollments own or admin" on public.enrollments for select using (user_id = auth.uid() or public.is_admin());
create policy "enrollments own insert" on public.enrollments for insert with check (user_id = auth.uid());
create policy "enrollments admin update" on public.enrollments for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "progress own or admin" on public.student_progress;
drop policy if exists "progress admin manage" on public.student_progress;
create policy "progress own or admin" on public.student_progress for select using (student_id = auth.uid() or public.is_admin());
create policy "progress admin manage" on public.student_progress for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "attendance own or admin" on public.attendance;
drop policy if exists "attendance admin manage" on public.attendance;
create policy "attendance own or admin" on public.attendance for select using (student_id = auth.uid() or public.is_admin());
create policy "attendance admin manage" on public.attendance for all using (public.is_admin()) with check (public.is_admin());

-- Public catalog policies; API uses the service key for administrative writes.
drop policy if exists "courts public read" on public.courts; create policy "courts public read" on public.courts for select using (is_active or public.is_admin());
drop policy if exists "pricing public read" on public.pricing; create policy "pricing public read" on public.pricing for select using (is_active or public.is_admin());
drop policy if exists "slots public read" on public.time_slots; create policy "slots public read" on public.time_slots for select using (is_active or public.is_admin());
drop policy if exists "coaches public read" on public.coaches; create policy "coaches public read" on public.coaches for select using (is_active or public.is_admin());
drop policy if exists "programs public read" on public.programs; create policy "programs public read" on public.programs for select using (is_active or public.is_admin());
drop policy if exists "gallery public read" on public.gallery; create policy "gallery public read" on public.gallery for select using (true);
drop policy if exists "testimonials public approved read" on public.testimonials; create policy "testimonials public approved read" on public.testimonials for select using (is_approved or public.is_admin());
drop policy if exists "settings public read" on public.academy_settings; create policy "settings public read" on public.academy_settings for select using (true);
drop policy if exists "contact admin only" on public.contact_inquiries; create policy "contact admin only" on public.contact_inquiries for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "logs admin only" on public.reminder_logs; create policy "logs admin only" on public.reminder_logs for select using (public.is_admin());

-- Supabase Storage bucket for coach, court, gallery and setting images.
insert into storage.buckets (id, name, public) values ('academy-media', 'academy-media', true) on conflict (id) do update set public = true;
drop policy if exists "academy media public read" on storage.objects;
create policy "academy media public read" on storage.objects for select using (bucket_id = 'academy-media');
drop policy if exists "academy media admin write" on storage.objects;
create policy "academy media admin write" on storage.objects for all using (bucket_id = 'academy-media' and public.is_admin()) with check (bucket_id = 'academy-media' and public.is_admin());

-- Booking changes must be published for the live availability client subscription.
do $$ begin alter publication supabase_realtime add table public.bookings; exception when duplicate_object then null; end $$;

-- Catalog seed data. Create an authenticated account through the web registration flow,
-- then promote its profile once via: update public.profiles set role='admin' where email='admin@example.com';
insert into public.courts (name, court_number, court_type, is_ac, description) values
  ('Court A', 'A', 'synthetic', true, 'Premium synthetic surface with tournament-grade lighting.'),
  ('Court B', 'B', 'synthetic', true, 'Climate-controlled training court for every season.'),
  ('Court C', 'C', 'wooden', false, 'Springy wooden court with natural airflow.'),
  ('Court D', 'D', 'wooden', false, 'Spacious wooden court for group practice.')
on conflict (court_number) do update set name=excluded.name, court_type=excluded.court_type, is_ac=excluded.is_ac, description=excluded.description;

insert into public.time_slots (start_time, end_time, is_peak, slot_label) values
 ('06:00','07:00',false,'6:00 AM – 7:00 AM'),('07:00','08:00',true,'7:00 AM – 8:00 AM'),('08:00','09:00',true,'8:00 AM – 9:00 AM'),('09:00','10:00',false,'9:00 AM – 10:00 AM'),
 ('10:00','11:00',false,'10:00 AM – 11:00 AM'),('11:00','12:00',false,'11:00 AM – 12:00 PM'),('12:00','13:00',false,'12:00 PM – 1:00 PM'),('13:00','14:00',false,'1:00 PM – 2:00 PM'),
 ('14:00','15:00',false,'2:00 PM – 3:00 PM'),('15:00','16:00',false,'3:00 PM – 4:00 PM'),('16:00','17:00',true,'4:00 PM – 5:00 PM'),('17:00','18:00',true,'5:00 PM – 6:00 PM'),
 ('18:00','19:00',true,'6:00 PM – 7:00 PM'),('19:00','20:00',true,'7:00 PM – 8:00 PM'),('20:00','21:00',false,'8:00 PM – 9:00 PM'),('21:00','22:00',false,'9:00 PM – 10:00 PM')
on conflict (slot_label) do update set is_peak=excluded.is_peak;

insert into public.pricing (category,name,description,price,duration_type,is_peak_hour) values
 ('court_booking','Regular court hour','Court reservation during regular hours',300,'per_hour',false),
 ('court_booking','Peak court hour','Court reservation during peak hours',500,'per_hour',true),
 ('coaching_program','Kids monthly','Monthly Kids Smash price',2000,'monthly',false),
 ('coaching_program','Beginner monthly','Monthly Foundation Flight price',2500,'monthly',false),
 ('coaching_program','Intermediate monthly','Monthly Match Ready price',3000,'monthly',false),
 ('coaching_program','Advanced monthly','Monthly Performance Squad price',4000,'monthly',false)
on conflict (category,name,duration_type,is_peak_hour) do update set price=excluded.price, description=excluded.description, is_active=true;

insert into public.coaches (name,email,phone,specialization,experience_years,achievements,certifications,bio) values
 ('Arjun Mehta','arjun@rallypoint.example','+91 90000 10001','Singles strategy and high-performance coaching',12,array['Former state champion','National circuit semifinalist'],array['BWF Level 2 Coach','First Aid Certified'],'Arjun builds calm, intelligent competitors through efficient movement and tactical clarity.'),
 ('Nisha Shah','nisha@rallypoint.example','+91 90000 10002','Doubles tactics and junior development',9,array['State doubles medalist','Coached 40+ district finalists'],array['BWF Level 1 Coach','Youth Safeguarding Certified'],'Nisha makes technical foundations engaging for children and ambitious club players.')
on conflict (email) do update set specialization=excluded.specialization, experience_years=excluded.experience_years, achievements=excluded.achievements, certifications=excluded.certifications, bio=excluded.bio;

insert into public.programs (name,level,description,features,age_group,batch_time,batch_days,max_students,price_monthly,price_quarterly,price_yearly,coach_id) values
 ('Kids Smash','kids','A joyful first step to badminton built around movement, coordination and confidence.',array['Age-appropriate drills','Fun fitness','Monthly progress notes'],'6–10 years','4:30 PM – 5:30 PM','Mon, Wed, Fri',16,2000,5400,20000,(select id from public.coaches where email='nisha@rallypoint.example')),
 ('Foundation Flight','beginner','Master the correct grip, serve, footwork and stroke basics in a supportive group.',array['Fundamental technique','Rules and scoring','Small coaching groups'],'11+ years','5:30 PM – 6:30 PM','Mon, Wed, Fri',20,2500,6750,25000,(select id from public.coaches where email='nisha@rallypoint.example')),
 ('Match Ready','intermediate','Turn reliable technique to tactical rallies, controlled attacks and match confidence.',array['Tactical patterns','Conditioning plan','Monthly game analysis'],'13+ years','6:30 PM – 7:30 PM','Tue, Thu, Sat',18,3000,8100,30000,(select id from public.coaches where email='arjun@rallypoint.example')),
 ('Performance Squad','advanced','Intensive development for competitive players seeking regional and national performance.',array['Advanced strategy','Video feedback','Tournament preparation'],'15+ years','7:30 PM – 9:00 PM','Tue, Thu, Sat',12,4000,10800,40000,(select id from public.coaches where email='arjun@rallypoint.example'))
on conflict (name) do update set description=excluded.description, features=excluded.features, age_group=excluded.age_group, batch_time=excluded.batch_time, batch_days=excluded.batch_days, max_students=excluded.max_students, price_monthly=excluded.price_monthly, price_quarterly=excluded.price_quarterly, price_yearly=excluded.price_yearly, coach_id=excluded.coach_id;

insert into public.academy_settings (academy_name,tagline,description,phone,email,whatsapp_number,address,google_maps_url,operating_hours,social_links) select
 'RallyPoint Badminton Academy','Train with purpose. Play with confidence.','A focused, welcoming home for players who want to enjoy badminton and keep getting better.','+91 90000 10000','hello@rallypoint.example','919000010000','Ahmedabad, Gujarat, India','https://maps.google.com',
 '{"Monday":"6:00 AM – 10:00 PM","Tuesday":"6:00 AM – 10:00 PM","Wednesday":"6:00 AM – 10:00 PM","Thursday":"6:00 AM – 10:00 PM","Friday":"6:00 AM – 10:00 PM","Saturday":"6:00 AM – 10:00 PM","Sunday":"6:00 AM – 10:00 PM"}'::jsonb,
 '{"instagram":"","facebook":"","youtube":""}'::jsonb
where not exists (select 1 from public.academy_settings);

insert into public.testimonials (name,role,content,rating,is_featured,is_approved) values
 ('Rohan Patel','Parent of a Kids Smash student','My daughter looks forward to every session. The coaches are patient, attentive and exceptionally encouraging.',5,true,true),
 ('Aditi Desai','Match Ready player','I improved my footwork and match awareness within weeks. Every drill has a purpose.',5,true,true),
 ('Kunal Shah','Court member','Clean courts, easy booking and a genuinely friendly community. It is my favourite place to play.',5,true,true)
on conflict do nothing;