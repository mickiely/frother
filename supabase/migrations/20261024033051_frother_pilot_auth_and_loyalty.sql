-- Isolated pilot tables: existing demo/legacy data is not modified.
create schema if not exists frother_private;
revoke all on schema frother_private from public;
grant usage on schema frother_private to authenticated;

create table public.frother_venues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  brand_color text not null default '#16A34A',
  stamps_required integer not null default 9 check (stamps_required between 1 and 100),
  reward_description text not null default 'One complimentary item',
  active boolean not null default true
);
create table public.frother_staff (
  venue_id uuid not null references public.frother_venues(id),
  user_id uuid not null references auth.users(id),
  role text not null check (role in ('staff','owner')),
  active boolean not null default true,
  primary key (venue_id,user_id)
);
create table public.frother_members (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.frother_venues(id),
  user_id uuid not null references auth.users(id),
  name text not null check (char_length(name) between 1 and 80),
  phone text not null check (phone ~ '^\+?[0-9]{8,15}$'),
  email_consent boolean not null default false,
  sms_consent boolean not null default false,
  consent_updated_at timestamptz not null default now(),
  joined_at timestamptz not null default now(),
  unique(venue_id,user_id),
  unique(id,venue_id)
);
create table public.frother_cards (
  member_id uuid primary key,
  venue_id uuid not null,
  stamps integer not null default 0 check (stamps >= 0),
  total_stamps_earned integer not null default 0 check (total_stamps_earned >= 0),
  rewards_redeemed integer not null default 0 check (rewards_redeemed >= 0),
  version integer not null default 0,
  updated_at timestamptz not null default now(),
  foreign key(member_id,venue_id) references public.frother_members(id,venue_id)
);
create table public.frother_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  venue_id uuid not null,
  member_id uuid not null,
  staff_user_id uuid not null references auth.users(id),
  action text not null check (action in ('stamp','redeem')),
  amount integer not null check (amount between 1 and 20),
  created_at timestamptz not null default now(),
  foreign key(member_id,venue_id) references public.frother_members(id,venue_id)
);
create index frother_staff_user_idx on public.frother_staff(user_id);
create index frother_members_user_idx on public.frother_members(user_id);
create index frother_members_venue_idx on public.frother_members(venue_id);
create index frother_cards_venue_idx on public.frother_cards(venue_id);
create index frother_events_member_idx on public.frother_events(member_id);
create index frother_events_venue_idx on public.frother_events(venue_id);
create index frother_events_staff_idx on public.frother_events(staff_user_id);

alter table public.frother_venues enable row level security;
alter table public.frother_staff enable row level security;
alter table public.frother_members enable row level security;
alter table public.frother_cards enable row level security;
alter table public.frother_events enable row level security;
revoke all on public.frother_venues, public.frother_staff, public.frother_members,
  public.frother_cards, public.frother_events from anon, authenticated;
grant select on public.frother_venues to anon, authenticated;
grant select on public.frother_staff, public.frother_members, public.frother_cards,
  public.frother_events to authenticated;

create policy venue_read on public.frother_venues for select to anon,authenticated using(active);
create policy staff_self_read on public.frother_staff for select to authenticated
  using(user_id=(select auth.uid()) and active);
create policy member_read on public.frother_members for select to authenticated using(
  user_id=(select auth.uid()) or venue_id in
    (select venue_id from public.frother_staff where user_id=(select auth.uid()) and active)
);
create policy card_read on public.frother_cards for select to authenticated using(
  member_id in (select id from public.frother_members)
);
create policy event_read on public.frother_events for select to authenticated using(
  member_id in (select id from public.frother_members)
);

-- Privileged mutations are kept outside the exposed API schema. Each checks
-- the verified auth user; clients have no direct write grants to the tables.
create function frother_private.join_venue(p_venue uuid,p_name text,p_phone text,
  p_email_consent boolean,p_sms_consent boolean)
returns uuid language plpgsql security definer set search_path='' as $$
declare member uuid; caller uuid := auth.uid();
begin
  if caller is null then raise exception 'Sign in to join' using errcode='42501'; end if;
  if not exists(select 1 from public.frother_venues where id=p_venue and active) then
    raise exception 'Venue unavailable';
  end if;
  -- Repeat joins return the caller's card; they never claim a phone-number match.
  select id into member from public.frother_members where venue_id=p_venue and user_id=caller;
  if member is not null then return member; end if;
  insert into public.frother_members(venue_id,user_id,name,phone,email_consent,sms_consent)
    values(p_venue,caller,trim(p_name),regexp_replace(p_phone,'[^0-9+]','','g'),
      coalesce(p_email_consent,false),coalesce(p_sms_consent,false))
    on conflict(venue_id,user_id) do nothing returning id into member;
  if member is null then
    select id into member from public.frother_members where venue_id=p_venue and user_id=caller;
  end if;
  insert into public.frother_cards(member_id,venue_id) values(member,p_venue)
    on conflict(member_id) do nothing;
  return member;
end $$;

create function frother_private.update_consent(p_member uuid,p_email boolean,p_sms boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
  update public.frother_members set email_consent=coalesce(p_email,false),
    sms_consent=coalesce(p_sms,false),consent_updated_at=now()
    where id=p_member and user_id=auth.uid();
  if not found then raise exception 'Card unavailable' using errcode='42501'; end if;
end $$;

create function frother_private.loyalty_action(p_member uuid,p_action text,p_amount integer,
  p_request uuid,p_expected_version integer)
returns public.frother_cards language plpgsql security definer set search_path='' as $$
declare card public.frother_cards; required integer; existing public.frother_events;
begin
  if auth.uid() is null then raise exception 'Staff sign-in required' using errcode='42501'; end if;
  if p_request is null or p_action is null or p_action not in ('stamp','redeem')
    or p_amount is null or p_amount not between 1 and 20 or p_expected_version is null then
    raise exception 'Invalid loyalty action';
  end if;
  select * into card from public.frother_cards where member_id=p_member for update;
  if not found or not exists(select 1 from public.frother_staff
    where venue_id=card.venue_id and user_id=auth.uid() and active) then
    raise exception 'Staff access required for this venue' using errcode='42501';
  end if;
  select stamps_required into required from public.frother_venues where id=card.venue_id and active;
  if required is null then raise exception 'Venue unavailable'; end if;
  select * into existing from public.frother_events where request_id=p_request;
  if found then
    if existing.member_id<>p_member or existing.staff_user_id<>auth.uid()
      or existing.action<>p_action or existing.amount<>p_amount then
      raise exception 'Request already used';
    end if;
    return card;
  end if;
  if card.version<>p_expected_version then
    raise exception 'Card changed. Refresh before trying again.' using errcode='40001';
  end if;
  if p_action='stamp' then
    update public.frother_cards set stamps=stamps+p_amount,
      total_stamps_earned=total_stamps_earned+p_amount,version=version+1,updated_at=now()
      where member_id=p_member returning * into card;
  else
    if p_amount<>1 or card.stamps<required then raise exception 'No earned reward available'; end if;
    update public.frother_cards set stamps=stamps-required,rewards_redeemed=rewards_redeemed+1,
      version=version+1,updated_at=now() where member_id=p_member returning * into card;
  end if;
  insert into public.frother_events(request_id,venue_id,member_id,staff_user_id,action,amount)
    values(p_request,card.venue_id,p_member,auth.uid(),p_action,p_amount);
  return card;
end $$;

revoke all on function frother_private.join_venue(uuid,text,text,boolean,boolean),
  frother_private.update_consent(uuid,boolean,boolean),
  frother_private.loyalty_action(uuid,text,integer,uuid,integer) from public,anon;
grant execute on function frother_private.join_venue(uuid,text,text,boolean,boolean),
  frother_private.update_consent(uuid,boolean,boolean),
  frother_private.loyalty_action(uuid,text,integer,uuid,integer) to authenticated;

create function public.frother_join(p_venue uuid,p_name text,p_phone text,
  p_email_consent boolean default false,p_sms_consent boolean default false)
returns uuid language sql security invoker set search_path='' as $$
  select frother_private.join_venue(p_venue,p_name,p_phone,p_email_consent,p_sms_consent);
$$;
create function public.frother_update_consent(p_member uuid,p_email boolean,p_sms boolean)
returns void language sql security invoker set search_path='' as $$
  select frother_private.update_consent(p_member,p_email,p_sms);
$$;
create function public.frother_loyalty_action(p_member uuid,p_action text,p_amount integer,
  p_request uuid,p_expected_version integer)
returns public.frother_cards language sql security invoker set search_path='' as $$
  select frother_private.loyalty_action(p_member,p_action,p_amount,p_request,p_expected_version);
$$;
revoke all on function public.frother_join(uuid,text,text,boolean,boolean),
  public.frother_update_consent(uuid,boolean,boolean),
  public.frother_loyalty_action(uuid,text,integer,uuid,integer) from public,anon;
grant execute on function public.frother_join(uuid,text,text,boolean,boolean),
  public.frother_update_consent(uuid,boolean,boolean),
  public.frother_loyalty_action(uuid,text,integer,uuid,integer) to authenticated;

insert into public.frother_venues(slug,name,reward_description)
  values('pilot-cafe','FROTHER Pilot — Test Venue','One complimentary item — test reward only');
