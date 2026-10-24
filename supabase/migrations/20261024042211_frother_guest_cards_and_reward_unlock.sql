-- Open collection; verified customer details are required only to redeem.
alter table public.frother_members alter column user_id drop not null;
alter table public.frother_members alter column phone drop not null;
alter table public.frother_members add column verified_email text;
alter table public.frother_members add column profile_completed_at timestamptz;
alter table public.frother_members add column card_code text generated always as
  ('F-'||upper(substr(replace(id::text,'-',''),1,12))) stored unique;

create table frother_private.guest_cards (
  member_id uuid primary key references public.frother_members(id),
  token_hash bytea not null unique,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);
create table frother_private.guest_limits (
  ip_hash bytea not null,
  day date not null default current_date,
  cards_started integer not null default 1,
  primary key(ip_hash,day)
);
alter table frother_private.guest_cards enable row level security;
alter table frother_private.guest_limits enable row level security;
revoke all on frother_private.guest_cards,frother_private.guest_limits from public,anon,authenticated;

-- A guest's 256-bit key is a bearer credential. Only its digest is stored.
-- These deliberately unauthenticated helpers use that credential rather than
-- auth.uid(). They return card state only, never customer contact details.
create function frother_private.guest_card(p_venue uuid,p_token text,p_create boolean)
returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.frother_members; c public.frother_cards; digest bytea; claimed timestamptz; member uuid;
  headers jsonb; ip text; starts integer;
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid recovery key' using errcode='42501';
  end if;
  if not exists(select 1 from public.frother_venues where id=p_venue and active) then
    raise exception 'Venue unavailable';
  end if;
  digest:=extensions.digest(p_token,'sha256');
  -- Serialize same-key opens; concurrent retries must never create orphan cards.
  perform pg_advisory_xact_lock(hashtextextended(p_token,0));
  select members.id,guests.claimed_at into member,claimed
    from public.frother_members members join frother_private.guest_cards guests
    on guests.member_id=members.id where guests.token_hash=digest and members.venue_id=p_venue;
  if member is not null then select * into m from public.frother_members where id=member; end if;
  if member is null then
    if p_create is not true then raise exception 'Card not found. Check your recovery key.' using errcode='42501'; end if;
    if exists(select 1 from frother_private.guest_cards where token_hash=digest) then
      raise exception 'This key belongs to another venue' using errcode='42501';
    end if;
    headers:=coalesce(nullif(current_setting('request.headers',true),'')::jsonb,'{}'::jsonb);
    ip:=nullif(split_part(headers->>'x-forwarded-for',',',1),'');
    if ip is not null then
      insert into frother_private.guest_limits(ip_hash,day)
        values(extensions.digest(ip,'sha256'),current_date)
        on conflict(ip_hash,day) do update set cards_started=guest_limits.cards_started+1
        returning cards_started into starts;
      if starts>200 then raise exception 'Too many new cards today. Please ask staff for help.'; end if;
    end if;
    insert into public.frother_members(venue_id,name) values(p_venue,'Guest') returning * into m;
    insert into public.frother_cards(member_id,venue_id) values(m.id,p_venue);
    insert into frother_private.guest_cards(member_id,token_hash) values(m.id,digest);
  elsif claimed is not null or m.user_id is not null then
    raise exception 'This card is registered. Sign in to reopen it.' using errcode='42501';
  end if;
  select * into c from public.frother_cards where member_id=m.id;
  return jsonb_build_object('id',m.id,'card_code',m.card_code,'name','Guest',
    'profile_completed_at',null,'frother_cards',jsonb_build_array(to_jsonb(c)));
end $$;

create function frother_private.claim_guest(p_venue uuid,p_token text,p_name text,p_phone text,
  p_email_consent boolean,p_sms_consent boolean)
returns uuid language plpgsql security definer set search_path='' as $$
declare member uuid; caller uuid:=auth.uid(); email text; confirmed timestamptz;
  linked uuid; card public.frother_cards; required integer;
begin
  if caller is null then raise exception 'Verify your email and sign in to claim' using errcode='42501'; end if;
  select u.email,u.email_confirmed_at into email,confirmed from auth.users u where u.id=caller;
  if email is null or confirmed is null then raise exception 'Verify your email before claiming' using errcode='42501'; end if;
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'Invalid recovery key' using errcode='42501'; end if;
  select m.id,m.user_id into member,linked from public.frother_members m
    join frother_private.guest_cards g on g.member_id=m.id
    where g.token_hash=extensions.digest(p_token,'sha256') and m.venue_id=p_venue
    for update of m;
  if member is null or (linked is not null and linked<>caller) then
    raise exception 'Card unavailable' using errcode='42501';
  end if;
  if linked=caller then return member; end if;
  if exists(select 1 from public.frother_members where venue_id=p_venue and user_id=caller) then
    raise exception 'You already have a registered card here. Ask staff for help combining cards.';
  end if;
  select * into card from public.frother_cards where member_id=member for update;
  select stamps_required into required from public.frother_venues where id=p_venue and active;
  if required is null or card.stamps<required then raise exception 'Keep collecting stamps. Complete details when your first reward is earned.'; end if;
  if p_name is null or char_length(trim(p_name)) not between 1 and 80 or
    p_phone is null or regexp_replace(p_phone,'[^0-9+]','','g') !~ '^\+?[0-9]{8,15}$' then
    raise exception 'Enter your name and a valid mobile number';
  end if;
  update public.frother_members set user_id=caller,name=trim(p_name),
    phone=regexp_replace(p_phone,'[^0-9+]','','g'),verified_email=email,
    profile_completed_at=now(),email_consent=coalesce(p_email_consent,false),
    sms_consent=coalesce(p_sms_consent,false),consent_updated_at=now() where id=member;
  update frother_private.guest_cards set claimed_at=now() where member_id=member;
  return member;
end $$;

-- Preserve the already-supported registered join API, but require verified email
-- and genuine contact details. It cannot unlock someone else's guest card.
create or replace function frother_private.join_venue(p_venue uuid,p_name text,p_phone text,
  p_email_consent boolean,p_sms_consent boolean)
returns uuid language plpgsql security definer set search_path='' as $$
declare member uuid; caller uuid:=auth.uid(); email text;
begin
  if caller is null then raise exception 'Sign in to join' using errcode='42501'; end if;
  select u.email into email from auth.users u where u.id=caller and u.email_confirmed_at is not null;
  if email is null then raise exception 'Verify your email before joining' using errcode='42501'; end if;
  if not exists(select 1 from public.frother_venues where id=p_venue and active) then raise exception 'Venue unavailable'; end if;
  if p_name is null or char_length(trim(p_name)) not between 1 and 80 or
    p_phone is null or regexp_replace(p_phone,'[^0-9+]','','g') !~ '^\+?[0-9]{8,15}$' then
    raise exception 'Enter your name and a valid mobile number';
  end if;
  insert into public.frother_members(venue_id,user_id,name,phone,verified_email,profile_completed_at,email_consent,sms_consent)
    values(p_venue,caller,trim(p_name),regexp_replace(p_phone,'[^0-9+]','','g'),email,now(),
      coalesce(p_email_consent,false),coalesce(p_sms_consent,false))
    on conflict(venue_id,user_id) do nothing returning id into member;
  if member is null then select id into member from public.frother_members where venue_id=p_venue and user_id=caller; end if;
  insert into public.frother_cards(member_id,venue_id) values(member,p_venue) on conflict(member_id) do nothing;
  return member;
end $$;

update public.frother_members m set verified_email=u.email,profile_completed_at=now()
  from auth.users u where m.user_id=u.id and u.email_confirmed_at is not null
  and u.email is not null and m.phone is not null;

grant usage on schema frother_private to anon;
revoke all on function frother_private.guest_card(uuid,text,boolean) from public,anon,authenticated;
revoke all on function frother_private.claim_guest(uuid,text,text,text,boolean,boolean) from public,anon,authenticated;
grant execute on function frother_private.guest_card(uuid,text,boolean) to anon,authenticated;
grant execute on function frother_private.claim_guest(uuid,text,text,text,boolean,boolean) to authenticated;

create function public.frother_guest_card(p_venue uuid,p_token text,p_create boolean default false)
returns jsonb language sql security invoker set search_path='' as $$
  select frother_private.guest_card(p_venue,p_token,p_create);
$$;
create function public.frother_claim_guest(p_venue uuid,p_token text,p_name text,p_phone text,
  p_email_consent boolean default false,p_sms_consent boolean default false)
returns uuid language sql security invoker set search_path='' as $$
  select frother_private.claim_guest(p_venue,p_token,p_name,p_phone,p_email_consent,p_sms_consent);
$$;
revoke all on function public.frother_guest_card(uuid,text,boolean) from public,anon,authenticated;
revoke all on function public.frother_claim_guest(uuid,text,text,text,boolean,boolean) from public,anon,authenticated;
grant execute on function public.frother_guest_card(uuid,text,boolean) to anon,authenticated;
grant execute on function public.frother_claim_guest(uuid,text,text,text,boolean,boolean) to authenticated;
create or replace function frother_private.loyalty_action(p_member uuid,p_action text,p_amount integer,
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
    raise exception 'Card changed. Refresh before trying again.' using errcode='P0001';
  end if;
  if p_action='stamp' then
    update public.frother_cards set stamps=stamps+p_amount,
      total_stamps_earned=total_stamps_earned+p_amount,version=version+1,updated_at=now()
      where member_id=p_member returning * into card;
  else
    if not exists(select 1 from public.frother_members m where m.id=p_member
      and m.user_id is not null and m.profile_completed_at is not null
      and m.verified_email is not null) then
      raise exception 'Complete your details and verify your email before claiming this reward';
    end if;
    if p_amount<>1 or card.stamps<required then raise exception 'No earned reward available'; end if;
    update public.frother_cards set stamps=stamps-required,rewards_redeemed=rewards_redeemed+1,
      version=version+1,updated_at=now() where member_id=p_member returning * into card;
  end if;
  insert into public.frother_events(request_id,venue_id,member_id,staff_user_id,action,amount)
    values(p_request,card.venue_id,p_member,auth.uid(),p_action,p_amount);
  return card;
end $$;

