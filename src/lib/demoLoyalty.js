import { customers, venues } from './mockData.js'

export const DEMO_KEY = 'frother-demo-customers-v1'
export const DEMO_RULE = venues['demo-cafe'].loyaltyRule
export function freshDemoCustomers() {
  return customers.map((customer, index) => ({
    id: customer.id, name: customer.name, lastName: customer.lastName,
    phone: `02 5550 010${index}`, email: customer.email,
    suburb: customer.suburb, profileStatus: customer.profileStatus,
    stamps: customer.stamps, rewardsRedeemed: customer.rewardsRedeemed,
    purchases: [2, 3, 3, 5, 4, 4, 1][index],
  }))
}
export function searchDemoCustomers(customers, query) {
  const text = query.trim().toLowerCase()
  const digits = text.replace(/\D/g, '')
  return customers.filter(c => !text || `${c.name} ${c.lastName} ${c.phone} ${c.email}`.toLowerCase().includes(text) ||
    (/^[\d\s()+-]+$/.test(text) && digits && c.phone.replace(/\D/g, '').includes(digits)))
}
export function updateDemoCustomer(customer, action) {
  if (action.type === 'stamp' && Number.isInteger(action.count) && action.count >= 1 && action.count <= 20) {
    return { ...customer, stamps: customer.stamps + action.count, purchases: customer.purchases + 1 }
  }
  if (action.type === 'redeem' && customer.profileStatus === 'full' && customer.stamps >= DEMO_RULE.stampsRequired) {
    return { ...customer, stamps: customer.stamps - DEMO_RULE.stampsRequired, rewardsRedeemed: customer.rewardsRedeemed + 1 }
  }
  if (action.type === 'profile') {
    return { ...customer, lastName: action.lastName.trim(), suburb: action.suburb.trim(), profileStatus: 'full' }
  }
  return customer
}
export function readDemoCustomers(serialized) {
  try {
    const stored = JSON.parse(serialized)
    const seed = freshDemoCustomers()
    if (!Array.isArray(stored) || stored.length !== seed.length) return seed
    return seed.map(sample => {
      const c = stored.find(item => item?.id === sample.id)
      if (!c || !['stamps', 'purchases', 'rewardsRedeemed'].every(key => Number.isSafeInteger(c[key]) && c[key] >= 0) ||
        !['quick', 'full'].includes(c.profileStatus) || typeof c.lastName !== 'string' || typeof c.suburb !== 'string') return sample
      return { ...sample, stamps: c.stamps, purchases: c.purchases, rewardsRedeemed: c.rewardsRedeemed,
        profileStatus: c.profileStatus, lastName: c.lastName.slice(0, 60), suburb: c.suburb.slice(0, 80) }
    })
  } catch { return freshDemoCustomers() }
}
