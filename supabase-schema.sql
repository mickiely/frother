-- Frother — Supabase schema
-- Run this in the Supabase SQL editor to set up the database.

create table venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  brand_color text default '#2D6A4F',
  staff_pin text not null default '1234',
  admin_pin text not null default '9999',
  loyalty_stamps_required int not null default 9,
  loyalty_reward_description text not null default 'Free coffee of your choice',
  created_at timestamptz default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  joined_at timestamptz default now()
);

create table loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  stamps int not null default 0,
  total_stamps_earned int not null default 0,
  rewards_redeemed int not null default 0,
  updated_at timestamptz default now()
);

create table staff_users (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  name text not null,
  pin text not null,
  role text not null default 'staff',
  created_at timestamptz default now()
);

create table offers (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  title text not null,
  description text,
  emoji text default '🎁',
  active boolean not null default true,
  expires_at date,
  created_at timestamptz default now()
);

create table loyalty_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  staff_id uuid references staff_users(id),
  type text not null check (type in ('stamp', 'reward_redeem', 'offer_redeem')),
  notes text,
  created_at timestamptz default now()
);

create table redemptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  offer_id uuid references offers(id) on delete cascade,
  venue_id uuid references venues(id) on delete cascade,
  redeemed_at timestamptz default now()
);

-- Stored procedure: add a stamp
create or replace function increment_stamps(p_customer_id uuid)
returns loyalty_cards language plpgsql as $$
begin
  update loyalty_cards
  set stamps = stamps + 1,
      total_stamps_earned = total_stamps_earned + 1,
      updated_at = now()
  where customer_id = p_customer_id;
  return query select * from loyalty_cards where customer_id = p_customer_id;
end;
$$;

-- Stored procedure: redeem reward
create or replace function redeem_reward(p_customer_id uuid)
returns loyalty_cards language plpgsql as $$
begin
  update loyalty_cards
  set stamps = 0,
      rewards_redeemed = rewards_redeemed + 1,
      updated_at = now()
  where customer_id = p_customer_id;
  return query select * from loyalty_cards where customer_id = p_customer_id;
end;
$$;

-- Seed demo venue
insert into venues (name, slug, description, brand_color, staff_pin, admin_pin)
values ('Demo Cafe', 'demo-cafe', 'Your neighbourhood coffee spot', '#2D6A4F', '1234', '9999');

-- Seed Froffers
insert into offers (venue_id, title, description, emoji, expires_at)
select id, '2-for-1 Steak Night', 'Every Tuesday from 6pm. Show this to your server.', '🥩', '2026-07-31'
from venues where slug = 'demo-cafe';

insert into offers (venue_id, title, description, emoji, expires_at)
select id, 'Free Muffin', 'With any large coffee. One per customer per day.', '🧁', '2026-07-31'
from venues where slug = 'demo-cafe';

insert into offers (venue_id, title, description, emoji, expires_at)
select id, 'Tradie Lunch Deal', '$15 burger, chips and drink before 2pm weekdays.', '🍔', '2026-06-30'
from venues where slug = 'demo-cafe';
