create table public.frother_nfc_tags (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.frother_venues(id),
  code text not null unique default encode(extensions.gen_random_bytes(12),'hex'),
  label text not null check(char_length(trim(label)) between 1 and 80),
  location text not null default '' check(char_length(location)<=120),
  purpose text not null default 'customer' check(purpose in ('customer','staff')),
  status text not null default 'active' check(status in ('active','disabled')),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);
create index frother_nfc_venue_idx on public.frother_nfc_tags(venue_id);
create index frother_nfc_creator_idx on public.frother_nfc_tags(created_by);
create unique index frother_nfc_label_idx on public.frother_nfc_tags(venue_id,lower(label));
alter table public.frother_nfc_tags enable row level security;
revoke all on public.frother_nfc_tags from public,anon,authenticated;
grant select,insert on public.frother_nfc_tags to authenticated;
grant update(label,location,purpose,status) on public.frother_nfc_tags to authenticated;
create policy tag_staff_read on public.frother_nfc_tags for select to authenticated using(
  venue_id in(select venue_id from public.frother_staff where user_id=(select auth.uid()) and active)
);
create policy tag_owner_create on public.frother_nfc_tags for insert to authenticated with check(
  created_by=(select auth.uid()) and venue_id in
    (select venue_id from public.frother_staff where user_id=(select auth.uid()) and role='owner' and active)
);
create policy tag_owner_update on public.frother_nfc_tags for update to authenticated using(
  venue_id in(select venue_id from public.frother_staff where user_id=(select auth.uid()) and role='owner' and active)
) with check(
  venue_id in(select venue_id from public.frother_staff where user_id=(select auth.uid()) and role='owner' and active)
);

-- Public routing only: an NFC URL is not a customer/staff credential.
create function frother_private.resolve_tag(p_code text)
returns jsonb language sql stable security definer set search_path='' as $$
  select jsonb_build_object('slug',v.slug,'purpose',t.purpose)
  from public.frother_nfc_tags t join public.frother_venues v on v.id=t.venue_id
  where t.code=p_code and t.status='active' and v.active;
$$;
revoke all on function frother_private.resolve_tag(text) from public,anon,authenticated;
grant execute on function frother_private.resolve_tag(text) to anon,authenticated;
create function public.frother_resolve_tag(p_code text)
returns jsonb language sql stable security invoker set search_path='' as $$
  select frother_private.resolve_tag(p_code);
$$;
revoke all on function public.frother_resolve_tag(text) from public,anon,authenticated;
grant execute on function public.frother_resolve_tag(text) to anon,authenticated;
