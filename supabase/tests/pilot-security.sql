-- Integration assertions against actual Postgres permissions. All fixtures roll back.
begin;
do $$
declare v1 uuid; v2 uuid; customer1 uuid:=gen_random_uuid(); customer2 uuid:=gen_random_uuid();
  staff1 uuid:=gen_random_uuid(); staff2 uuid:=gen_random_uuid();
begin
  insert into auth.users(id) values(customer1),(customer2),(staff1),(staff2);
  insert into public.frother_venues(slug,name) values('test-'||gen_random_uuid(),'Security test A') returning id into v1;
  insert into public.frother_venues(slug,name) values('test-'||gen_random_uuid(),'Security test B') returning id into v2;
  insert into public.frother_staff(venue_id,user_id,role) values(v1,staff1,'staff'),(v2,staff2,'owner');
  perform set_config('test.v1',v1::text,true); perform set_config('test.v2',v2::text,true);
  perform set_config('test.c1',customer1::text,true); perform set_config('test.c2',customer2::text,true);
  perform set_config('test.s1',staff1::text,true); perform set_config('test.s2',staff2::text,true);
end $$;
set local role anon;
do $$ begin
  if (select count(*) from public.frother_venues where id=current_setting('test.v1')::uuid)<>1 then raise exception 'FAIL public venue'; end if;
  begin
    perform public.frother_join(current_setting('test.v1')::uuid,'Test','0400000001');
    raise exception 'FAIL anonymous join';
  exception when insufficient_privilege then null; end;
  begin perform * from public.frother_members; raise exception 'FAIL anonymous members';
  exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('test.c1'),true);
do $$ declare m uuid; m2 uuid;
begin
  m:=public.frother_join(current_setting('test.v1')::uuid,'Member A','0400 000 001',false,false);
  m2:=public.frother_join(current_setting('test.v1')::uuid,'Duplicate','0400000001',true,true);
  if m<>m2 then raise exception 'FAIL duplicate join'; end if;
  perform set_config('test.m1',m::text,true);
  if (select stamps from public.frother_cards where member_id=m)<>0 then raise exception 'FAIL initial balance'; end if;
  if (select email_consent or sms_consent from public.frother_members where id=m) then raise exception 'FAIL optional consent'; end if;
  begin update public.frother_cards set stamps=100 where member_id=m; raise exception 'FAIL direct stamp write';
  exception when insufficient_privilege then null; end;
  begin insert into public.frother_staff values(current_setting('test.v1')::uuid,current_setting('test.c1')::uuid,'owner',true); raise exception 'FAIL self elevation';
  exception when insufficient_privilege then null; end;
  begin perform public.frother_loyalty_action(m,'stamp',1,gen_random_uuid(),0); raise exception 'FAIL customer self stamp';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.c2'),true);
do $$ begin
  perform public.frother_join(current_setting('test.v2')::uuid,'Member B','0400000002');
  if exists(select 1 from public.frother_members where id=current_setting('test.m1')::uuid) then raise exception 'FAIL cross customer read'; end if;
  if exists(select 1 from public.frother_cards where member_id=current_setting('test.m1')::uuid) then raise exception 'FAIL cross card read'; end if;
  begin perform public.frother_update_consent(current_setting('test.m1')::uuid,true,true); raise exception 'FAIL cross customer consent';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.s2'),true);
do $$ begin
  if exists(select 1 from public.frother_members where venue_id=current_setting('test.v1')::uuid) then raise exception 'FAIL cross venue staff read'; end if;
  begin perform public.frother_loyalty_action(current_setting('test.m1')::uuid,'stamp',1,gen_random_uuid(),0); raise exception 'FAIL cross venue staff stamp';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.s1'),true);
do $$ declare m uuid:=current_setting('test.m1')::uuid; r uuid:=gen_random_uuid(); redeem uuid:=gen_random_uuid(); c public.frother_cards;
begin
  c:=public.frother_loyalty_action(m,'stamp',9,r,0);
  if c.stamps<>9 or c.version<>1 then raise exception 'FAIL staff award'; end if;
  c:=public.frother_loyalty_action(m,'stamp',9,r,0);
  if c.stamps<>9 then raise exception 'FAIL idempotent stamp'; end if;
  begin perform public.frother_loyalty_action(m,'stamp',1,gen_random_uuid(),0); raise exception 'FAIL stale card award';
  exception when serialization_failure then null; end;
  c:=public.frother_loyalty_action(m,'redeem',1,redeem,1);
  if c.stamps<>0 or c.rewards_redeemed<>1 then raise exception 'FAIL redemption'; end if;
  c:=public.frother_loyalty_action(m,'redeem',1,redeem,1);
  if c.rewards_redeemed<>1 then raise exception 'FAIL idempotent redemption'; end if;
  begin perform public.frother_loyalty_action(m,'redeem',1,gen_random_uuid(),1); raise exception 'FAIL stale double redemption';
  exception when serialization_failure then null; end;
  begin perform public.frother_loyalty_action(m,'redeem',1,gen_random_uuid(),2); raise exception 'FAIL unearned redemption';
  exception when raise_exception then if sqlerrm not like 'No earned reward%' then raise; end if; end;
  begin perform public.frother_loyalty_action(m,'stamp',21,gen_random_uuid(),2); raise exception 'FAIL oversized award';
  exception when raise_exception then if sqlerrm<>'Invalid loyalty action' then raise; end if; end;
  begin perform public.frother_loyalty_action(m,'redeem',1,r,2); raise exception 'FAIL request reuse';
  exception when raise_exception then if sqlerrm<>'Request already used' then raise; end if; end;
  c:=public.frother_loyalty_action(m,'stamp',12,gen_random_uuid(),2);
  c:=public.frother_loyalty_action(m,'redeem',1,gen_random_uuid(),3);
  if c.stamps<>3 or c.rewards_redeemed<>2 then raise exception 'FAIL leftover stamps'; end if;
  if (select count(*) from public.frother_events where member_id=m)<>4 then raise exception 'FAIL atomic audit events'; end if;
  if exists(select 1 from public.frother_members where venue_id=current_setting('test.v2')::uuid) then raise exception 'FAIL staff isolation'; end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.c1'),true);
do $$ begin
  if (select stamps from public.frother_cards where member_id=current_setting('test.m1')::uuid)<>3 then raise exception 'FAIL customer reads saved balance'; end if;
  perform public.frother_update_consent(current_setting('test.m1')::uuid,false,false);
  if (select rewards_redeemed from public.frother_cards where member_id=current_setting('test.m1')::uuid)<>2 then raise exception 'FAIL consent affected rewards'; end if;
end $$;
reset role;
select 'PASS: anonymous access, membership ownership, venue isolation, staff authorization, retry idempotency, stale versions, single redemption, leftover stamps, optional consent and audit events' as result;
rollback;
