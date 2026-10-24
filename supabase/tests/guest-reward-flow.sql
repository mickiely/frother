begin;
do $$ declare v uuid; other uuid; customer uuid:=gen_random_uuid(); staff uuid:=gen_random_uuid(); unverified uuid:=gen_random_uuid();
begin
  insert into auth.users(id,email,email_confirmed_at) values(customer,customer::text||'@example.invalid',now()),
    (staff,staff::text||'@example.invalid',now()),(unverified,unverified::text||'@example.invalid',null);
  insert into public.frother_venues(slug,name) values('test-'||gen_random_uuid(),'Guest test') returning id into v;
  insert into public.frother_venues(slug,name) values('test-'||gen_random_uuid(),'Other guest test') returning id into other;
  insert into public.frother_staff(venue_id,user_id,role) values(v,staff,'staff');
  perform set_config('test.v',v::text,true); perform set_config('test.other',other::text,true);
  perform set_config('test.customer',customer::text,true); perform set_config('test.staff',staff::text,true);
  perform set_config('test.unverified',unverified::text,true);
  perform set_config('test.token',encode(extensions.gen_random_bytes(32),'hex'),true);
end $$;
set local role anon;
do $$ declare card jsonb; repeated jsonb;
begin
  card:=public.frother_guest_card(current_setting('test.v')::uuid,current_setting('test.token'),true);
  repeated:=public.frother_guest_card(current_setting('test.v')::uuid,current_setting('test.token'),true);
  if card->>'id'<>repeated->>'id' then raise exception 'FAIL duplicate guest cards'; end if;
  perform set_config('test.member',card->>'id',true);
  if (card->'frother_cards'->0->>'stamps')::int<>0 then raise exception 'FAIL tap awards stamp'; end if;
  if card ? 'phone' or card ? 'email' or card ? 'verified_email' or card ? 'token_hash' then raise exception 'FAIL guest information leak'; end if;
  begin perform public.frother_guest_card(current_setting('test.v')::uuid,repeat('b',64),false); raise exception 'FAIL guessed recovery';
  exception when insufficient_privilege then null; end;
  begin perform public.frother_guest_card(current_setting('test.other')::uuid,current_setting('test.token'),false); raise exception 'FAIL cross venue recovery';
  exception when insufficient_privilege then null; end;
  begin perform * from public.frother_members; raise exception 'FAIL guest table access';
  exception when insufficient_privilege then null; end;
  begin perform public.frother_loyalty_action(current_setting('test.member')::uuid,'stamp',9,gen_random_uuid(),0); raise exception 'FAIL guest self stamp';
  exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('test.customer'),true);
do $$ begin
  begin perform public.frother_claim_guest(current_setting('test.v')::uuid,current_setting('test.token'),'Customer','0400000001'); raise exception 'FAIL premature profile claim';
  exception when raise_exception then if sqlerrm not like 'Keep collecting stamps.%' then raise; end if; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.staff'),true);
do $$ declare c public.frother_cards;
begin
  c:=public.frother_loyalty_action(current_setting('test.member')::uuid,'stamp',12,gen_random_uuid(),0);
  if c.stamps<>12 then raise exception 'FAIL guest staff stamps'; end if;
  begin perform public.frother_loyalty_action(current_setting('test.member')::uuid,'redeem',1,gen_random_uuid(),1); raise exception 'FAIL unregistered redemption';
  exception when raise_exception then if sqlerrm not like 'Complete your details%' then raise; end if; end;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ declare c jsonb;
begin
  c:=public.frother_guest_card(current_setting('test.v')::uuid,current_setting('test.token'),false);
  if (c->'frother_cards'->0->>'stamps')::int<>12 then raise exception 'FAIL guest saved balance'; end if;
  begin perform public.frother_claim_guest(current_setting('test.v')::uuid,current_setting('test.token'),'Customer','0400000001'); raise exception 'FAIL unverified anonymous claim';
  exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('test.unverified'),true);
do $$ begin
  begin perform public.frother_claim_guest(current_setting('test.v')::uuid,current_setting('test.token'),'Customer','0400000001'); raise exception 'FAIL unconfirmed email claim';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.customer'),true);
do $$ declare member uuid;
begin
  begin perform public.frother_claim_guest(current_setting('test.v')::uuid,repeat('b',64),'Customer','0400000001'); raise exception 'FAIL claim guessed token';
  exception when insufficient_privilege then null; end;
  member:=public.frother_claim_guest(current_setting('test.v')::uuid,current_setting('test.token'),'Customer','0400000001',false,false);
  if member<>current_setting('test.member')::uuid then raise exception 'FAIL card replaced'; end if;
  if (select user_id from public.frother_members where id=member)<>auth.uid() then raise exception 'FAIL account binding'; end if;
  if (select verified_email from public.frother_members where id=member) is null then raise exception 'FAIL verified email missing'; end if;
  if (select email_consent or sms_consent from public.frother_members where id=member) then raise exception 'FAIL forced consent'; end if;
  if (select stamps from public.frother_cards where member_id=member)<>12 then raise exception 'FAIL lost guest stamps'; end if;
  if public.frother_claim_guest(current_setting('test.v')::uuid,current_setting('test.token'),'Ignored','0400000001')<>member then raise exception 'FAIL repeat claim'; end if;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
  begin perform public.frother_guest_card(current_setting('test.v')::uuid,current_setting('test.token'),false); raise exception 'FAIL claimed key still opens card';
  exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('test.staff'),true);
do $$ declare c public.frother_cards;
begin
  c:=public.frother_loyalty_action(current_setting('test.member')::uuid,'redeem',1,gen_random_uuid(),1);
  if c.stamps<>3 or c.rewards_redeemed<>1 then raise exception 'FAIL unlocked redemption'; end if;
  begin perform public.frother_loyalty_action(current_setting('test.member')::uuid,'redeem',1,gen_random_uuid(),1); raise exception 'FAIL duplicate redemption';
  exception when raise_exception then if sqlerrm not like 'Card changed.%' then raise; end if; end;
end $$;
reset role;
select 'PASS: open guest card, idempotent reload, private recovery, staff stamps, reward registration gate, verified email binding, stamp preservation, optional consent, revoked guest key and one redemption' as result;
rollback;
