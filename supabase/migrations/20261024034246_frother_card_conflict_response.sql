-- A stale displayed card is an application conflict, not a retryable transaction error.
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
    if p_amount<>1 or card.stamps<required then raise exception 'No earned reward available'; end if;
    update public.frother_cards set stamps=stamps-required,rewards_redeemed=rewards_redeemed+1,
      version=version+1,updated_at=now() where member_id=p_member returning * into card;
  end if;
  insert into public.frother_events(request_id,venue_id,member_id,staff_user_id,action,amount)
    values(p_request,card.venue_id,p_member,auth.uid(),p_action,p_amount);
  return card;
end $$;

