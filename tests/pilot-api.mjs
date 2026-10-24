import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import assert from 'node:assert/strict'
const fixture=JSON.parse(fs.readFileSync(process.env.FROTHER_TEST_FIXTURE || '/tmp/frother-e2e.json','utf8'))
const url=process.env.VITE_SUPABASE_URL || 'https://togyppwnxwxfvmcbvbdt.supabase.co'
const key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY
assert.ok(key,'Set VITE_SUPABASE_PUBLISHABLE_KEY to the public project key')
const make=()=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
const customer=make(),secondDevice=make(),staff=make(),anon=make()
const check=async query=>{const r=await query;if(r.error)throw r.error;return r.data}
for(const [c,email] of [[customer,fixture.customerEmail],[secondDevice,fixture.customerEmail],[staff,fixture.staffEmail]]) await check(c.auth.signInWithPassword({email,password:fixture.password}))
console.log('PASS customer and staff password authentication; separate customer sessions')
const denied=await anon.rpc('frother_join',{p_venue:fixture.venueId,p_name:'Denied',p_phone:'0400000000'})
assert.ok(denied.error)
const memberId=await check(customer.rpc('frother_join',{p_venue:fixture.venueId,p_name:'Browser Test',p_phone:'0400000011'}))
const read=c=>check(c.from('frother_members').select('*,frother_cards(*)').eq('id',memberId).single())
const card=m=>Array.isArray(m.frother_cards)?m.frother_cards[0]:m.frother_cards
let m=await read(secondDevice)
assert.equal(card(m).stamps,0)
assert.equal(m.email_consent,false);assert.equal(m.sms_consent,false)
console.log('PASS authenticated join, separate-session saved balance, nested card mapping and optional consent')
const selfAward=await customer.rpc('frother_loyalty_action',{p_member:memberId,p_action:'stamp',p_amount:9,p_request:crypto.randomUUID(),p_expected_version:0})
assert.equal(selfAward.error?.code,'42501')
const tamper=await customer.from('frother_cards').update({stamps:999}).eq('member_id',memberId)
assert.equal(tamper.error?.code,'42501')
console.log('PASS customer cannot award stamps or directly update balances')
const request=crypto.randomUUID()
const params={p_member:memberId,p_action:'stamp',p_amount:9,p_request:request,p_expected_version:0}
await check(staff.rpc('frother_loyalty_action',params));await check(staff.rpc('frother_loyalty_action',params))
m=await read(secondDevice);assert.equal(card(m).stamps,9);assert.equal(card(m).version,1)
console.log('PASS staff stamp award and retry idempotency across API requests')
const redeemed=await Promise.all([1,2].map(()=>staff.rpc('frother_loyalty_action',{p_member:memberId,p_action:'redeem',p_amount:1,p_request:crypto.randomUUID(),p_expected_version:1})))
assert.equal(redeemed.filter(r=>!r.error).length,1)
assert.equal(redeemed.find(r=>r.error).error.code,'40001')
m=await read(secondDevice);assert.equal(card(m).stamps,0);assert.equal(card(m).rewards_redeemed,1)
console.log('PASS simultaneous redemption requests: exactly one succeeds; saved customer balance updates')
await check(customer.rpc('frother_update_consent',{p_member:memberId,p_email:true,p_sms:false}));m=await read(secondDevice);assert.equal(m.email_consent,true)
await check(customer.rpc('frother_update_consent',{p_member:memberId,p_email:false,p_sms:false}));m=await read(secondDevice);assert.equal(m.email_consent,false)
console.log('PASS consent changes persist across sessions and can be withdrawn')
await check(secondDevice.auth.signOut())
assert.ok((await secondDevice.from('frother_members').select('*').eq('id',memberId)).error)
console.log('PASS sign-out blocks private record access')
for(const c of [customer,staff]) await c.auth.signOut()
