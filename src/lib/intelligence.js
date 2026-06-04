/**
 * Customer intelligence — suggested offers, preference summaries, segmentation.
 * All logic is computed from existing customer + froffer data.
 * No external services required.
 *
 * TODO (POS integration):
 *   - Replace preferredVisitTimes with actual transaction timestamps from Square
 *   - Replace offerCategories with Square item category purchase history
 *   - Map Square customer_id to Frother customer_id for cross-system lookup
 *   - Derive "favourite category" from most-purchased Square item category
 *   - Derive "most common visit day/time" from Square order timestamps
 *   - Track campaign attribution via Square order_id on redemption events
 */

const DORMANT_DAYS = 30

function daysSince(isoString) {
  if (!isoString) return Infinity
  return (Date.now() - new Date(isoString).getTime()) / 86_400_000
}

// ── Suggested next offer ──────────────────────────────────────────────────────

export function getSuggestedOffer(customer, froffers, stampsRequired) {
  const isRewardLocked = customer.stamps >= stampsRequired && customer.profileStatus !== 'full'
  const stampsAway = stampsRequired - customer.stamps
  const cats = customer.offerCategories || []
  const times = customer.preferredVisitTimes || []
  const isDormant = daysSince(customer.lastSeenAt) > DORMANT_DAYS

  // Priority 1 — profile required to unlock reward
  if (isRewardLocked) {
    return {
      type: 'profile',
      headline: 'Complete profile to unlock reward',
      detail: 'They\'ve earned a free coffee — they just need to finish their profile.',
      cta: 'Profile unlock reminder',
      urgency: 'high',
    }
  }

  // Priority 2 — one stamp away, nudge with a morning double-stamp offer
  if (stampsAway === 1) {
    const isMorning = times.some(t => ['Before 8am', '8–10am'].includes(t))
    return {
      type: 'stamp',
      headline: isMorning ? 'Double stamp before 10am — one away!' : 'One stamp away from a free coffee',
      detail: 'A small nudge could bring them in today.',
      cta: 'Double stamp offer',
      urgency: 'high',
    }
  }

  // Priority 3 — dormant customer
  if (isDormant) {
    return {
      type: 'comeback',
      headline: 'We miss you — come back for a treat',
      detail: `Hasn't been in for ${Math.floor(daysSince(customer.lastSeenAt))} days.`,
      cta: 'Comeback offer',
      urgency: 'medium',
    }
  }

  // Priority 4 — preference-matched froffer
  const matchFroffer = (keywords) =>
    froffers.find(f => f.active && keywords.some(k => (f.title + ' ' + f.description).toLowerCase().includes(k)))

  if (cats.some(c => ['Steak Night', 'Dinner'].includes(c))) {
    const f = matchFroffer(['steak', 'dinner'])
    if (f) return { type: 'froffer', headline: f.title, detail: f.description, cta: `Send ${f.title}`, urgency: 'low', froffer: f }
  }
  if (cats.some(c => ['Lunch', 'Kids'].includes(c))) {
    const f = matchFroffer(['lunch', 'tradie', 'burger'])
    if (f) return { type: 'froffer', headline: f.title, detail: f.description, cta: `Send ${f.title}`, urgency: 'low', froffer: f }
  }
  if (cats.some(c => ['Coffee', 'Breakfast', 'Sweet Treats'].includes(c))) {
    const f = matchFroffer(['coffee', 'muffin', 'breakfast'])
    if (f) return { type: 'froffer', headline: f.title, detail: f.description, cta: `Send ${f.title}`, urgency: 'low', froffer: f }
  }

  // Priority 5 — most popular active froffer as default
  if (froffers.length > 0) {
    const f = froffers.find(f => f.active) || froffers[0]
    return { type: 'froffer', headline: f.title, detail: f.description, cta: `Send ${f.title}`, urgency: 'low', froffer: f }
  }

  return { type: 'none', headline: 'No offer available', detail: '', cta: null, urgency: 'low' }
}

// ── Customer preference summary ───────────────────────────────────────────────

export function getCustomerSummary(customer, stampsRequired) {
  const cats = customer.offerCategories || []
  const times = customer.preferredVisitTimes || []
  const isRewardLocked = customer.stamps >= stampsRequired && customer.profileStatus !== 'full'
  const isRewardReady = customer.stamps >= stampsRequired && customer.profileStatus === 'full'
  const stampsToReward = Math.max(0, stampsRequired - customer.stamps)
  const dormant = daysSince(customer.lastSeenAt) > DORMANT_DAYS

  // TODO (POS): Replace with actual transaction-derived visit day distribution from Square orders
  const visitDayNote = customer.profileStatus === 'full'
    ? null
    : 'Track once POS connected'

  return {
    favouriteCategory: cats[0] || null,
    mostCommonVisitTime: times[0] || null,
    visitDayNote,
    stampsToReward,
    totalStampsEarned: customer.totalStampsEarned,
    totalFroffersViewed: 0,    // TODO: increment on froffer_viewed event
    totalFroffersClaimed: 0,   // TODO: increment on froffer_claimed event
    totalFroffersRedeemed: 0,  // TODO: increment on froffer_redeemed event
    rewardsRedeemed: customer.rewardsRedeemed,
    isRewardLocked,
    isRewardReady,
    isDormant: dormant,
    daysSinceLastSeen: dormant ? Math.floor(daysSince(customer.lastSeenAt)) : null,
    loyaltyStatus: isRewardLocked ? 'locked'
      : isRewardReady ? 'ready'
      : customer.stamps > 0 ? 'collecting'
      : 'new',
  }
}

// ── Segmentation ──────────────────────────────────────────────────────────────

export function computeSegments(customers, stampsRequired) {
  const morningTimes = ['Before 8am', '8–10am']
  const lunchTimes = ['12–2pm', '10am–12pm']
  const dinnerCats = ['Dinner', 'Steak Night']

  return {
    quickNotRegistered: {
      label: 'Quick joins not fully registered',
      desc: 'Joined with name + mobile only — haven\'t completed their profile yet.',
      hint: 'Who needs a nudge to complete their profile?',
      customers: customers.filter(c => c.profileStatus === 'quick'),
    },
    rewardLocked: {
      label: 'Reward locked — profile needed',
      desc: 'Earned a reward but can\'t redeem it until they complete their profile.',
      hint: 'Reward earned. Just needs their details.',
      customers: customers.filter(c => c.stamps >= stampsRequired && c.profileStatus !== 'full'),
    },
    oneStampAway: {
      label: 'One stamp away from a reward',
      desc: 'Close to their free coffee — a small reason to come in could push them over.',
      hint: 'Who\'s close to a reward?',
      customers: customers.filter(c => c.stamps === stampsRequired - 1),
    },
    morningRegulars: {
      label: 'Morning coffee regulars',
      desc: 'Prefer visiting before 10am — likely coffee-first customers.',
      hint: 'Regulars worth chasing',
      customers: customers.filter(c =>
        c.preferredVisitTimes?.some(t => morningTimes.includes(t))
      ),
    },
    lunchRegulars: {
      label: 'Lunch regulars',
      desc: 'Visit mainly between 10am and 2pm — lunch and coffee crowd.',
      hint: 'Regulars worth chasing',
      customers: customers.filter(c =>
        c.preferredVisitTimes?.some(t => lunchTimes.includes(t))
      ),
    },
    dinnerFans: {
      label: 'Dinner & steak night fans',
      desc: 'Love dinner and steak night offers — ideal for evening promotions.',
      hint: 'What offers are actually working?',
      customers: customers.filter(c =>
        c.offerCategories?.some(cat => dinnerCats.includes(cat))
      ),
    },
    smsConsent: {
      label: 'SMS consent customers',
      desc: 'Opted in to SMS marketing — highest response rate channel.',
      hint: 'Best channel for urgent offers',
      customers: customers.filter(c => c.smsConsent),
    },
    emailConsent: {
      label: 'Email consent customers',
      desc: 'Opted in to email marketing — good for longer offers and newsletters.',
      hint: 'Good for regular campaigns',
      customers: customers.filter(c => c.emailConsent),
    },
    dormant: {
      label: 'Dormant customers',
      desc: `Haven't visited in over ${DORMANT_DAYS} days — worth a comeback offer.`,
      hint: 'Who needs a nudge?',
      customers: customers.filter(c => daysSince(c.lastSeenAt) > DORMANT_DAYS),
    },
  }
}
