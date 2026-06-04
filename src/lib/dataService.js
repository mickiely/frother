/**
 * Data service — uses Supabase when configured, mock data otherwise.
 * Swap out the mock implementations below once Supabase is connected.
 */
import { supabase, isSupabaseConfigured } from './supabase'
import { computeSegments } from './intelligence'
import {
  venues,
  getMockState,
  addMockStamp,
  redeemMockReward,
  addMockCustomer,
  completeMockProfile,
  saveMockFroffer,
  deleteMockFroffer,
  getMockStats,
} from './mockData'

// ── Venues ────────────────────────────────────────────────────────────────────

export async function getVenue(slug) {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('venues').select('*').eq('slug', slug).single()
    return data
  }
  return venues[slug] || null
}

export async function saveVenue(venueId, updates) {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('venues').update(updates).eq('id', venueId).select().single()
    return data
  }
  const key = Object.keys(venues).find(k => venues[k].id === venueId)
  Object.assign(venues[key], updates)
  return updates
}

// ── Customers ─────────────────────────────────────────────────────────────────

export async function getCustomers(venueId) {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('customers').select('*, loyalty_cards(*)').eq('venue_id', venueId)
    return data
  }
  return getMockState().customers.filter(c => c.venueId === venueId)
}

export async function getCustomer(customerId) {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('customers').select('*, loyalty_cards(*)').eq('id', customerId).single()
    return data
  }
  return getMockState().customers.find(c => c.id === customerId) || null
}

export async function searchCustomers(venueId, query) {
  const q = query.toLowerCase()
  if (isSupabaseConfigured) {
    const { data } = await supabase
      .from('customers')
      .select('*, loyalty_cards(*)')
      .eq('venue_id', venueId)
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    return data
  }
  return getMockState().customers.filter(
    c => c.venueId === venueId && (c.name.toLowerCase().includes(q) || c.phone.includes(q))
  )
}

export async function joinVenue(venueId, data) {
  if (isSupabaseConfigured) {
    const { data: customer } = await supabase
      .from('customers')
      .insert({ venue_id: venueId, ...data })
      .select()
      .single()
    await supabase.from('loyalty_cards').insert({
      customer_id: customer.id,
      venue_id: venueId,
      stamps: 0,
      profile_status: 'quick',
    })
    return customer
  }
  return addMockCustomer(venueId, data)
}

export async function completeProfile(customerId, profileData, stampsRequired) {
  if (isSupabaseConfigured) {
    const ts = new Date().toISOString()
    const { data } = await supabase
      .from('customers')
      .update({ ...profileData, profile_status: 'full', profile_completed_at: ts })
      .eq('id', customerId)
      .select()
      .single()
    await supabase.from('loyalty_events').insert({
      customer_id: customerId,
      type: 'profile_completed',
    })
    // unlock reward if it was locked
    const card = await supabase.from('loyalty_cards').select('*').eq('customer_id', customerId).single()
    if (card.data?.stamps >= stampsRequired) {
      await supabase.from('loyalty_events').insert({
        customer_id: customerId,
        type: 'reward_unlocked_after_profile',
      })
    }
    return data
  }
  return completeMockProfile(customerId, profileData, stampsRequired)
}

// ── Loyalty ───────────────────────────────────────────────────────────────────

export async function addStamp(customerId, staffId, stampsRequired) {
  if (isSupabaseConfigured) {
    await supabase.from('loyalty_events').insert({
      customer_id: customerId,
      type: 'stamp',
      staff_id: staffId,
    })
    const { data } = await supabase.rpc('increment_stamps', {
      p_customer_id: customerId,
      p_stamps_required: stampsRequired,
    })
    return data
  }
  return addMockStamp(customerId, stampsRequired)
}

export async function redeemReward(customerId, staffId) {
  if (isSupabaseConfigured) {
    await supabase.from('loyalty_events').insert({
      customer_id: customerId,
      type: 'reward_redeemed',
      staff_id: staffId,
    })
    const { data } = await supabase.rpc('redeem_reward', { p_customer_id: customerId })
    return data
  }
  return redeemMockReward(customerId)
}

// ── Froffers ──────────────────────────────────────────────────────────────────

export async function getFroffers(venueId) {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('offers').select('*').eq('venue_id', venueId).eq('active', true)
    return data
  }
  return getMockState().froffers.filter(f => f.venueId === venueId && f.active)
}

export async function getAllFroffers(venueId) {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('offers').select('*').eq('venue_id', venueId)
    return data
  }
  return getMockState().froffers.filter(f => f.venueId === venueId)
}

export async function saveFroffer(venueId, froffer) {
  if (isSupabaseConfigured) {
    if (froffer.id) {
      const { data } = await supabase.from('offers').update(froffer).eq('id', froffer.id).select().single()
      return data
    }
    const { data } = await supabase.from('offers').insert({ ...froffer, venue_id: venueId }).select().single()
    return data
  }
  return saveMockFroffer(venueId, froffer)
}

export async function deleteFroffer(frofferId) {
  if (isSupabaseConfigured) {
    await supabase.from('offers').delete().eq('id', frofferId)
    return
  }
  return deleteMockFroffer(frofferId)
}

// ── Segments ──────────────────────────────────────────────────────────────────

export async function getSegments(venueId, stampsRequired) {
  // TODO (Supabase): query each segment with server-side filtering
  const customers = await getCustomers(venueId)
  return computeSegments(customers, stampsRequired)
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function getStats(venueId) {
  if (isSupabaseConfigured) {
    const [
      { count: totalMembers },
      { count: stampsIssued },
      { count: rewardsRedeemed },
      { count: quickJoins },
      { count: fullProfiles },
    ] = await Promise.all([
      supabase.from('customers').select('*', { count: 'exact', head: true }).eq('venue_id', venueId),
      supabase.from('loyalty_events').select('*', { count: 'exact', head: true }).eq('venue_id', venueId).eq('type', 'stamp'),
      supabase.from('loyalty_events').select('*', { count: 'exact', head: true }).eq('venue_id', venueId).eq('type', 'reward_redeemed'),
      supabase.from('customers').select('*', { count: 'exact', head: true }).eq('venue_id', venueId).eq('profile_status', 'quick'),
      supabase.from('customers').select('*', { count: 'exact', head: true }).eq('venue_id', venueId).eq('profile_status', 'full'),
    ])
    return {
      totalMembers,
      quickJoins,
      fullProfiles,
      profileCompletionRate: totalMembers > 0 ? Math.round((fullProfiles / totalMembers) * 100) : 0,
      stampsIssued,
      rewardsRedeemed,
      lockedRewards: 0,
      unlockedAfterProfile: 0,
      offersRedeemed: 0,
      emailConsent: 0,
      smsConsent: 0,
      byAgeRange: {},
      bySuburb: {},
      byPostcode: {},
      offerCategoryFreq: {},
      visitTimeFreq: {},
    }
  }
  return getMockStats(venueId)
}
