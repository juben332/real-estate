-- ─────────────────────────────────────────────
-- Hearth & Hollow — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────

-- PROFILES (extends auth.users)
create table public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  name       text,
  role       text default 'client' check (role in ('client', 'admin')),
  created_at timestamptz default now()
);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- PROPERTIES
create table public.properties (
  id         text primary key,
  name       text    not null,
  location   text    not null,
  price      integer not null,
  tagline    text,
  blurb      text,
  beds       integer default 1,
  baths      integer default 1,
  guests     integer default 2,
  amenities  jsonb   default '[]'::jsonb,
  hue        text    default '#2A3B2D',
  accent     text    default '#C4622D',
  active     boolean default true,
  created_at timestamptz default now()
);

-- BOOKINGS
create table public.bookings (
  id                        uuid default gen_random_uuid() primary key,
  user_id                   uuid references auth.users on delete cascade,
  property_id               text,
  range_start               date not null,
  range_end                 date not null,
  nights                    integer not null,
  total                     numeric not null,
  confirmation_code         text    not null,
  status                    text default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  stripe_payment_intent_id  text,
  created_at                timestamptz default now()
);

-- ─── Row Level Security ───────────────────────

alter table public.profiles   enable row level security;
alter table public.properties enable row level security;
alter table public.bookings   enable row level security;

-- Profiles: users manage their own; admins see all
create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);
create policy "admin profiles"     on public.profiles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Properties: anyone can read active ones; admins do everything
create policy "read active properties" on public.properties for select using (active = true);
create policy "admin properties"       on public.properties for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Bookings: users see their own; admins see all
create policy "own bookings read"   on public.bookings for select using (user_id = auth.uid());
create policy "own bookings insert" on public.bookings for insert with check (user_id = auth.uid());
create policy "own bookings update" on public.bookings for update using (user_id = auth.uid());
create policy "admin bookings"      on public.bookings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ─── Seed properties ──────────────────────────

insert into public.properties (id, name, location, price, tagline, blurb, beds, baths, guests, amenities, hue, accent) values
(
  'pine', 'The Pine Loft', 'Asheville, North Carolina', 168,
  'A sunlit A-frame tucked into the treeline',
  'Floor-to-ceiling glass, a wood stove that ticks through the night, and a deck that hangs over the forest floor. Mornings here smell like resin and coffee.',
  2, 1, 4,
  '["Wood-burning stove","Outdoor soaking tub","Fast Wi-Fi","Trailhead on-site","Full kitchen","EV charger"]',
  '#2A3B2D', '#C4622D'
),
(
  'marsh', 'Marsh House', 'Beaufort, South Carolina', 214,
  'Low-country light and salt air, all day long',
  'A restored tidewater cottage with wraparound porches, paddle access from the dock, and rocking chairs that have earned their creak.',
  3, 2, 6,
  '["Private dock","Two kayaks","Screened porch","Outdoor shower","Gas grill","Beach cruisers"]',
  '#1F4E5F', '#E0A458'
),
(
  'kiln', 'The Kiln', 'Hudson, New York', 192,
  'A converted pottery studio in town',
  'Brick walls, north-facing skylights, and a record player with a small but serious collection. Steps from the antique shops on Warren Street.',
  1, 1, 2,
  '["Record library","Walk to dining","Heated floors","Espresso bar","Reading nook","Smart TV"]',
  '#7A3B2E', '#D9A566'
),
(
  'dune', 'Dune Cabin', 'Truro, Massachusetts', 236,
  'Where the road ends and the grass begins',
  'A weathered-shingle hideaway behind the dunes. Outdoor shower, hammock, and a five-minute barefoot walk to the Atlantic.',
  2, 1, 4,
  '["Ocean path","Outdoor shower","Hammock","Beach gear","Fire pit","Bikes included"]',
  '#3D5A6C', '#E8C07D'
);
