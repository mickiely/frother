const now = () => new Date().toISOString()

// ── Venues ────────────────────────────────────────────────────────────────────

export const venues = {
  'demo-cafe': {
    id: 'venue-1',
    name: 'Demo Cafe',
    slug: 'demo-cafe',
    description: 'Your neighbourhood coffee spot',
    brandColor: '#16A34A',
    staffPin: '1234',
    adminPin: '9999',
    loyaltyRule: {
      stampsRequired: 9,
      rewardDescription: 'Free coffee of your choice',
    },
  },
}

// ── Froffers ──────────────────────────────────────────────────────────────────

export const froffers = [
  {
    id: 'frof-1',
    venueId: 'venue-1',
    title: '2-for-1 Steak Night',
    description: 'Every Tuesday from 6pm. Show this to your server.',
    emoji: '🥩',
    active: true,
    expiresAt: '2026-07-31',
  },
  {
    id: 'frof-2',
    venueId: 'venue-1',
    title: 'Free Muffin with Coffee',
    description: 'With any large coffee. One per customer per day.',
    emoji: '🧁',
    active: true,
    expiresAt: '2026-07-31',
  },
  {
    id: 'frof-3',
    venueId: 'venue-1',
    title: 'Tradie Lunch Deal',
    description: '$15 burger, chips and drink before 2pm weekdays.',
    emoji: '🍔',
    active: true,
    expiresAt: '2026-06-30',
  },
]

// ── Customers ─────────────────────────────────────────────────────────────────
//
//  cust-1  Alex      quick profile,  7 stamps  — collecting, recent visitor
//  cust-2  Sam       quick profile,  3 stamps  — collecting, recent visitor
//  cust-3  Jordan    quick profile,  9 stamps  — REWARD LOCKED (profile required)
//  cust-4  Morgan    full profile,   9 stamps  — REWARD READY; morning coffee regular
//  cust-5  Riley     full profile,   8 stamps  — 1 STAMP AWAY; dinner/steak night fan
//  cust-6  Casey     full profile,   5 stamps  — lunch regular; email + SMS consent
//  cust-7  Blake     quick profile,  2 stamps  — DORMANT (52 days since last visit)

export const customers = [
  {
    id: 'cust-1',
    venueId: 'venue-1',
    name: 'Alex',
    lastName: '',
    phone: '0412 345 678',
    email: '',
    joinedAt: '2026-03-10',
    profileStatus: 'quick',
    profileCompletedAt: null,
    stamps: 7,
    totalStampsEarned: 16,
    rewardsRedeemed: 1,
    rewardLockedAt: null,
    birthday: '', ageRange: '', suburb: '', postcode: '',
    offerCategories: [], preferredVisitTimes: [],
    emailConsent: false, smsConsent: false, privacyAccepted: false,
    // Timestamps
    quickJoinedAt: '2026-03-10T09:12:00Z',
    lastStampAt: '2026-05-28T09:30:00Z',
    lastRewardEarnedAt: null,
    lastRewardRedeemedAt: '2026-04-15T09:00:00Z',
    lastFrofferViewedAt: null,
    lastFrofferClaimedAt: null,
    lastFrofferRedeemedAt: null,
    lastSeenAt: '2026-05-28T09:30:00Z',
    events: [
      { type: 'quick_join_completed', ts: '2026-03-10T09:12:00Z' },
      { type: 'stamp_added', ts: '2026-05-20T09:00:00Z' },
      { type: 'stamp_added', ts: '2026-05-28T09:30:00Z' },
    ],
  },
  {
    id: 'cust-2',
    venueId: 'venue-1',
    name: 'Sam',
    lastName: '',
    phone: '0423 456 789',
    email: '',
    joinedAt: '2026-04-01',
    profileStatus: 'quick',
    profileCompletedAt: null,
    stamps: 3,
    totalStampsEarned: 3,
    rewardsRedeemed: 0,
    rewardLockedAt: null,
    birthday: '', ageRange: '', suburb: '', postcode: '',
    offerCategories: [], preferredVisitTimes: [],
    emailConsent: false, smsConsent: false, privacyAccepted: false,
    quickJoinedAt: '2026-04-01T08:30:00Z',
    lastStampAt: '2026-05-25T08:45:00Z',
    lastRewardEarnedAt: null,
    lastRewardRedeemedAt: null,
    lastFrofferViewedAt: null,
    lastFrofferClaimedAt: null,
    lastFrofferRedeemedAt: null,
    lastSeenAt: '2026-05-25T08:45:00Z',
    events: [
      { type: 'quick_join_completed', ts: '2026-04-01T08:30:00Z' },
      { type: 'stamp_added', ts: '2026-05-25T08:45:00Z' },
    ],
  },
  {
    id: 'cust-3',
    venueId: 'venue-1',
    name: 'Jordan',
    lastName: '',
    phone: '0434 567 890',
    email: '',
    joinedAt: '2026-02-15',
    profileStatus: 'quick',
    profileCompletedAt: null,
    stamps: 9,
    totalStampsEarned: 27,
    rewardsRedeemed: 2,
    rewardLockedAt: '2026-05-20T10:45:00Z',
    birthday: '', ageRange: '', suburb: '', postcode: '',
    offerCategories: [], preferredVisitTimes: [],
    emailConsent: false, smsConsent: false, privacyAccepted: false,
    quickJoinedAt: '2026-02-15T07:55:00Z',
    lastStampAt: '2026-05-20T10:45:00Z',
    lastRewardEarnedAt: '2026-05-20T10:45:00Z',
    lastRewardRedeemedAt: '2026-04-10T10:00:00Z',
    lastFrofferViewedAt: null,
    lastFrofferClaimedAt: null,
    lastFrofferRedeemedAt: null,
    lastSeenAt: '2026-05-20T10:45:00Z',
    events: [
      { type: 'quick_join_completed', ts: '2026-02-15T07:55:00Z' },
      { type: 'reward_earned', ts: '2026-05-20T10:45:00Z' },
      { type: 'reward_locked_profile_required', ts: '2026-05-20T10:45:00Z' },
    ],
  },
  {
    id: 'cust-4',
    venueId: 'venue-1',
    name: 'Morgan',
    lastName: 'Lee',
    phone: '0445 678 901',
    email: 'morgan@example.com',
    joinedAt: '2026-01-10',
    profileStatus: 'full',
    profileCompletedAt: '2026-05-25T14:20:00Z',
    stamps: 9,
    totalStampsEarned: 18,
    rewardsRedeemed: 1,
    rewardLockedAt: null,
    birthday: '1990-06-15', ageRange: '35–44', suburb: 'Fitzroy', postcode: '3065',
    offerCategories: ['Coffee', 'Breakfast', 'Sweet Treats'],
    preferredVisitTimes: ['8–10am', '10am–12pm'],
    emailConsent: true, smsConsent: false, privacyAccepted: true,
    quickJoinedAt: '2026-01-10T08:00:00Z',
    lastStampAt: '2026-05-30T09:15:00Z',
    lastRewardEarnedAt: '2026-05-24T09:30:00Z',
    lastRewardRedeemedAt: '2026-03-20T09:00:00Z',
    lastFrofferViewedAt: '2026-05-28T08:55:00Z',
    lastFrofferClaimedAt: '2026-05-28T08:55:00Z',
    lastFrofferRedeemedAt: null,
    lastSeenAt: '2026-05-30T09:15:00Z',
    events: [
      { type: 'quick_join_completed', ts: '2026-01-10T08:00:00Z' },
      { type: 'reward_earned', ts: '2026-05-24T09:30:00Z' },
      { type: 'reward_locked_profile_required', ts: '2026-05-24T09:30:00Z' },
      { type: 'profile_completion_started', ts: '2026-05-25T14:18:00Z' },
      { type: 'profile_completed', ts: '2026-05-25T14:20:00Z' },
      { type: 'reward_unlocked_after_profile', ts: '2026-05-25T14:20:00Z' },
      { type: 'stamp_added', ts: '2026-05-30T09:15:00Z' },
    ],
  },
  {
    id: 'cust-5',
    venueId: 'venue-1',
    name: 'Riley',
    lastName: 'Walsh',
    phone: '0456 789 012',
    email: 'riley@example.com',
    joinedAt: '2026-01-20',
    profileStatus: 'full',
    profileCompletedAt: '2026-02-01T19:00:00Z',
    stamps: 8,
    totalStampsEarned: 17,
    rewardsRedeemed: 1,
    rewardLockedAt: null,
    birthday: '1988-11-22', ageRange: '35–44', suburb: 'Collingwood', postcode: '3066',
    offerCategories: ['Steak Night', 'Dinner', 'Drinks'],
    preferredVisitTimes: ['After 5pm', '2–5pm'],
    emailConsent: true, smsConsent: true, privacyAccepted: true,
    quickJoinedAt: '2026-01-20T18:30:00Z',
    lastStampAt: '2026-05-29T18:30:00Z',
    lastRewardEarnedAt: '2026-03-15T19:00:00Z',
    lastRewardRedeemedAt: '2026-03-22T18:45:00Z',
    lastFrofferViewedAt: '2026-05-27T18:00:00Z',
    lastFrofferClaimedAt: '2026-05-27T18:00:00Z',
    lastFrofferRedeemedAt: '2026-05-27T19:30:00Z',
    lastSeenAt: '2026-05-29T18:30:00Z',
    events: [
      { type: 'quick_join_completed', ts: '2026-01-20T18:30:00Z' },
      { type: 'profile_completed', ts: '2026-02-01T19:00:00Z' },
      { type: 'reward_earned', ts: '2026-03-15T19:00:00Z' },
      { type: 'reward_redeemed', ts: '2026-03-22T18:45:00Z' },
      { type: 'stamp_added', ts: '2026-05-29T18:30:00Z' },
    ],
  },
  {
    id: 'cust-6',
    venueId: 'venue-1',
    name: 'Casey',
    lastName: 'Brown',
    phone: '0467 890 123',
    email: 'casey@example.com',
    joinedAt: '2026-02-10',
    profileStatus: 'full',
    profileCompletedAt: '2026-02-12T12:30:00Z',
    stamps: 5,
    totalStampsEarned: 14,
    rewardsRedeemed: 1,
    rewardLockedAt: null,
    birthday: '1995-03-08', ageRange: '25–34', suburb: 'Brunswick', postcode: '3056',
    offerCategories: ['Lunch', 'Kids', 'Coffee'],
    preferredVisitTimes: ['12–2pm', '10am–12pm'],
    emailConsent: true, smsConsent: true, privacyAccepted: true,
    quickJoinedAt: '2026-02-10T12:00:00Z',
    lastStampAt: '2026-05-27T12:30:00Z',
    lastRewardEarnedAt: '2026-04-05T12:00:00Z',
    lastRewardRedeemedAt: '2026-04-12T12:00:00Z',
    lastFrofferViewedAt: '2026-05-26T12:00:00Z',
    lastFrofferClaimedAt: null,
    lastFrofferRedeemedAt: null,
    lastSeenAt: '2026-05-27T12:30:00Z',
    events: [
      { type: 'quick_join_completed', ts: '2026-02-10T12:00:00Z' },
      { type: 'profile_completed', ts: '2026-02-12T12:30:00Z' },
      { type: 'reward_earned', ts: '2026-04-05T12:00:00Z' },
      { type: 'reward_redeemed', ts: '2026-04-12T12:00:00Z' },
      { type: 'stamp_added', ts: '2026-05-27T12:30:00Z' },
    ],
  },
  {
    id: 'cust-7',
    venueId: 'venue-1',
    name: 'Blake',
    lastName: '',
    phone: '0478 901 234',
    email: '',
    joinedAt: '2026-01-05',
    profileStatus: 'quick',
    profileCompletedAt: null,
    stamps: 2,
    totalStampsEarned: 2,
    rewardsRedeemed: 0,
    rewardLockedAt: null,
    birthday: '', ageRange: '', suburb: '', postcode: '',
    offerCategories: [], preferredVisitTimes: [],
    emailConsent: false, smsConsent: false, privacyAccepted: false,
    quickJoinedAt: '2026-01-05T08:00:00Z',
    lastStampAt: '2026-04-10T08:00:00Z',
    lastRewardEarnedAt: null,
    lastRewardRedeemedAt: null,
    lastFrofferViewedAt: null,
    lastFrofferClaimedAt: null,
    lastFrofferRedeemedAt: null,
    lastSeenAt: '2026-04-10T08:00:00Z', // 52 days ago — dormant
    events: [
      { type: 'quick_join_completed', ts: '2026-01-05T08:00:00Z' },
      { type: 'stamp_added', ts: '2026-04-10T08:00:00Z' },
    ],
  },
]

export const redemptions = []

// ── Mutable in-memory state ───────────────────────────────────────────────────

let _customers = customers.map(c => ({ ...c }))
let _froffers = [...froffers]

export function getMockState() {
  return { customers: _customers, froffers: _froffers }
}

// ── Stamp + reward logic ──────────────────────────────────────────────────────

export function addMockStamp(customerId, stampsRequired) {
  const ts = now()
  _customers = _customers.map(c => {
    if (c.id !== customerId) return c
    const newStamps = c.stamps + 1
    const events = [...c.events, { type: 'stamp_added', ts }]
    const justEarned = newStamps >= stampsRequired && c.stamps < stampsRequired
    const base = {
      ...c,
      stamps: newStamps,
      totalStampsEarned: c.totalStampsEarned + 1,
      lastStampAt: ts,
      lastSeenAt: ts,
      events,
    }
    if (justEarned) {
      events.push({ type: 'reward_earned', ts })
      if (c.profileStatus !== 'full') {
        events.push({ type: 'reward_locked_profile_required', ts })
        return { ...base, rewardLockedAt: ts, lastRewardEarnedAt: ts }
      }
      return { ...base, lastRewardEarnedAt: ts }
    }
    return base
  })
  return _customers.find(c => c.id === customerId)
}

export function redeemMockReward(customerId) {
  const ts = now()
  _customers = _customers.map(c => {
    if (c.id !== customerId) return c
    return {
      ...c,
      stamps: 0,
      rewardsRedeemed: c.rewardsRedeemed + 1,
      rewardLockedAt: null,
      lastRewardRedeemedAt: ts,
      lastSeenAt: ts,
      events: [...c.events, { type: 'reward_redeemed', ts }],
    }
  })
  return _customers.find(c => c.id === customerId)
}

// ── Profile completion ────────────────────────────────────────────────────────

export function completeMockProfile(customerId, data, stampsRequired) {
  const ts = now()
  _customers = _customers.map(c => {
    if (c.id !== customerId) return c
    const events = [...c.events, { type: 'profile_completed', ts }]
    const rewardWasLocked = c.rewardLockedAt !== null || (c.stamps >= stampsRequired && c.profileStatus !== 'full')
    if (rewardWasLocked) events.push({ type: 'reward_unlocked_after_profile', ts })
    return {
      ...c, ...data,
      profileStatus: 'full',
      profileCompletedAt: ts,
      rewardLockedAt: null,
      lastSeenAt: ts,
      events,
    }
  })
  return _customers.find(c => c.id === customerId)
}

// ── Customer CRUD ─────────────────────────────────────────────────────────────

export function addMockCustomer(venueId, data) {
  const ts = now()
  const customer = {
    id: `cust-${Date.now()}`,
    venueId,
    name: data.name,
    lastName: '',
    phone: data.phone,
    email: data.email || '',
    joinedAt: ts.slice(0, 10),
    profileStatus: 'quick',
    profileCompletedAt: null,
    stamps: 0,
    totalStampsEarned: 0,
    rewardsRedeemed: 0,
    rewardLockedAt: null,
    birthday: '', ageRange: '', suburb: '', postcode: '',
    offerCategories: [], preferredVisitTimes: [],
    emailConsent: false, smsConsent: false, privacyAccepted: false,
    quickJoinedAt: ts,
    lastStampAt: null,
    lastRewardEarnedAt: null,
    lastRewardRedeemedAt: null,
    lastFrofferViewedAt: null,
    lastFrofferClaimedAt: null,
    lastFrofferRedeemedAt: null,
    lastSeenAt: ts,
    events: [{ type: 'quick_join_completed', ts }],
  }
  _customers = [..._customers, customer]
  return customer
}

// ── Froffers ──────────────────────────────────────────────────────────────────

export function saveMockFroffer(venueId, froffer) {
  if (froffer.id) {
    _froffers = _froffers.map(f => f.id === froffer.id ? { ...f, ...froffer } : f)
  } else {
    _froffers = [..._froffers, { ...froffer, id: `frof-${Date.now()}`, venueId }]
  }
}

export function deleteMockFroffer(frofferId) {
  _froffers = _froffers.filter(f => f.id !== frofferId)
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export function getMockStats(venueId) {
  const venue = Object.values(venues).find(v => v.id === venueId)
  const required = venue?.loyaltyRule?.stampsRequired ?? 9
  const custs = _customers.filter(c => c.venueId === venueId)
  const full = custs.filter(c => c.profileStatus === 'full')
  const quick = custs.filter(c => c.profileStatus === 'quick')
  const allEvents = custs.flatMap(c => c.events)
  const countEvent = type => allEvents.filter(e => e.type === type).length
  function freq(arr) {
    return arr.reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc }, {})
  }
  return {
    totalMembers: custs.length,
    quickJoins: quick.length,
    fullProfiles: full.length,
    profileCompletionRate: custs.length > 0 ? Math.round((full.length / custs.length) * 100) : 0,
    stampsIssued: custs.reduce((s, c) => s + c.totalStampsEarned, 0),
    rewardsRedeemed: custs.reduce((s, c) => s + c.rewardsRedeemed, 0),
    lockedRewards: custs.filter(c => c.stamps >= required && c.profileStatus !== 'full').length,
    unlockedAfterProfile: countEvent('reward_unlocked_after_profile'),
    offersRedeemed: redemptions.length,
    emailConsent: full.filter(c => c.emailConsent).length,
    smsConsent: full.filter(c => c.smsConsent).length,
    byAgeRange: freq(full.map(c => c.ageRange).filter(Boolean)),
    bySuburb: freq(full.map(c => c.suburb).filter(Boolean)),
    byPostcode: freq(full.map(c => c.postcode).filter(Boolean)),
    offerCategoryFreq: freq(full.flatMap(c => c.offerCategories)),
    visitTimeFreq: freq(full.flatMap(c => c.preferredVisitTimes)),
  }
}
