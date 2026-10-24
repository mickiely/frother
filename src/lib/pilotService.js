import { supabase, guestSupabase } from './supabase'

export function client() {
  if (!supabase) throw new Error('The pilot is not connected yet. Please use the demonstration or contact the venue.')
  return supabase
}

async function result(query) {
  const { data, error } = await query
  if (error) throw error
  return data
}

export function getPilotVenue(slug) {
  return result(client().from('frother_venues').select('*').eq('slug', slug).maybeSingle())
}

export function getMyStaffAccess(venueId, userId) {
  return result(client().from('frother_staff').select('role').eq('venue_id', venueId).eq('user_id', userId).eq('active', true).maybeSingle())
}

export function getMyMembership(venueId, userId) {
  return result(client().from('frother_members').select('*,frother_cards(*)').eq('venue_id', venueId).eq('user_id', userId).maybeSingle())
}

export function getPilotMembers(venueId) {
  // Venue scoped by query AND RLS; text filtering cannot widen the database query.
  return result(client().from('frother_members').select('*,frother_cards(*)').eq('venue_id', venueId).order('name').limit(500))
}

export function joinPilot(venueId, form) {
  return result(client().rpc('frother_join', {
    p_venue: venueId, p_name: form.name.trim(), p_phone: form.phone,
    p_email_consent: form.emailConsent, p_sms_consent: form.smsConsent,
  }))
}

export function updateConsent(memberId, emailConsent, smsConsent) {
  return result(client().rpc('frother_update_consent', { p_member: memberId, p_email: emailConsent, p_sms: smsConsent }))
}

export function getGuestCard(venueId, token, create = false) {
  if (!guestSupabase) throw new Error('The pilot is not connected yet.')
  return result(guestSupabase.rpc('frother_guest_card', { p_venue: venueId, p_token: token, p_create: create }))
}

export function claimGuest(venueId, token, form) {
  return result(client().rpc('frother_claim_guest', {
    p_venue: venueId, p_token: token, p_name: form.name.trim(), p_phone: form.phone,
    p_email_consent: form.emailConsent, p_sms_consent: form.smsConsent,
  }))
}

export function getNfcTags(venueId) {
  return result(client().from('frother_nfc_tags').select('*').eq('venue_id', venueId).order('created_at'))
}
export function createNfcTag(venueId, form) {
  return result(client().from('frother_nfc_tags').insert({ venue_id: venueId, label: form.label.trim(), location: form.location.trim(), purpose: form.purpose }).select().single())
}
export function setNfcTagStatus(venueId, id, status) {
  return result(client().from('frother_nfc_tags').update({ status }).eq('venue_id', venueId).eq('id', id).select().single())
}
export function resolveNfcTag(code) {
  if (!guestSupabase) throw new Error('The venue link is not connected yet.')
  return result(guestSupabase.rpc('frother_resolve_tag', { p_code: code }))
}

export function cardOf(member) {
  const cards = member?.frother_cards
  return (Array.isArray(cards) ? cards[0] : cards) || null
}

export async function loyaltyAction(member, action, amount, requestId) {
  const card = cardOf(member)
  if (!card) throw new Error('Card unavailable. Refresh and try again.')
  return result(client().rpc('frother_loyalty_action', {
    p_member: member.id, p_action: action, p_amount: amount,
    p_request: requestId, p_expected_version: card.version,
  }))
}
