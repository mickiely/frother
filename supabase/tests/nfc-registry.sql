begin;
do $$ declare v uuid; v2 uuid; owner_id uuid:=gen_random_uuid(); staff_id uuid:=gen_random_uuid(); other_id uuid:=gen_random_uuid();
begin
 insert into auth.users(id) values(owner_id),(staff_id),(other_id);
 insert into public.frother_venues(slug,name) values('test-'||gen_random_uuid(),'Tag test') returning id into v;
 insert into public.frother_venues(slug,name) values('test-'||gen_random_uuid(),'Other tag test') returning id into v2;
 insert into public.frother_staff(venue_id,user_id,role) values(v,owner_id,'owner'),(v,staff_id,'staff'),(v2,other_id,'owner');
 perform set_config('test.tagv',v::text,true);perform set_config('test.tagv2',v2::text,true);
 perform set_config('test.tagowner',owner_id::text,true);perform set_config('test.tagstaff',staff_id::text,true);perform set_config('test.tagother',other_id::text,true);
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('test.tagowner'),true);
do $$ declare t public.frother_nfc_tags;
begin
 insert into public.frother_nfc_tags(venue_id,label,location) values(current_setting('test.tagv')::uuid,'Front counter','Till 1') returning * into t;
 perform set_config('test.tagcode',t.code,true);perform set_config('test.tagid',t.id::text,true);
 begin update public.frother_nfc_tags set venue_id=current_setting('test.tagv2')::uuid where id=t.id;raise exception 'FAIL move venue';exception when insufficient_privilege then null;end;
 begin insert into public.frother_nfc_tags(venue_id,label) values(current_setting('test.tagv2')::uuid,'Other');raise exception 'FAIL cross venue create';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.tagstaff'),true);
do $$ begin
 if (select count(*) from public.frother_nfc_tags where id=current_setting('test.tagid')::uuid)<>1 then raise exception 'FAIL staff read';end if;
 begin insert into public.frother_nfc_tags(venue_id,label) values(current_setting('test.tagv')::uuid,'Staff created');raise exception 'FAIL staff create';exception when insufficient_privilege then null;end;
 update public.frother_nfc_tags set status='disabled' where id=current_setting('test.tagid')::uuid;
 if exists(select 1 from public.frother_nfc_tags where id=current_setting('test.tagid')::uuid and status='disabled') then raise exception 'FAIL staff disabled';end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.tagother'),true);
do $$ begin if exists(select 1 from public.frother_nfc_tags where id=current_setting('test.tagid')::uuid) then raise exception 'FAIL cross venue read';end if;end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ declare r jsonb;
begin
 r:=public.frother_resolve_tag(current_setting('test.tagcode'));
 if r is null or r->>'purpose'<>'customer' then raise exception 'FAIL public routing';end if;
 if r ? 'created_by' or r ? 'venue_id' then raise exception 'FAIL registry leak';end if;
 if public.frother_resolve_tag('missing') is not null then raise exception 'FAIL unknown tag';end if;
 begin perform * from public.frother_nfc_tags;raise exception 'FAIL public registry listing';exception when insufficient_privilege then null;end;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('test.tagowner'),true);
update public.frother_nfc_tags set status='disabled' where id=current_setting('test.tagid')::uuid;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin if public.frother_resolve_tag(current_setting('test.tagcode')) is not null then raise exception 'FAIL disabled tag';end if;end $$;
reset role;
select 'PASS: owner registry creation, venue isolation, immutable tag/venue IDs, staff read-only access, public route without private data, and disabled tag handling' as result;
rollback;
