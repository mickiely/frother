// Original routes are a sample demonstration only. Connected records use pilotService.
import { computeSegments } from './intelligence'
import { venues, getMockState, addMockStamp, redeemMockReward, addMockCustomer,
  completeMockProfile, saveMockFroffer, deleteMockFroffer, getMockStats } from './mockData'

export async function getVenue(slug) { return venues[slug] || null }
export async function saveVenue(venueId, updates) {
  const venue = Object.values(venues).find(v => v.id === venueId)
  if (!venue) throw new Error('Demo venue not found')
  Object.assign(venue, updates)
  return updates
}
export async function getCustomers(venueId) { return getMockState().customers.filter(c => c.venueId === venueId) }
export async function getCustomer(customerId) { return getMockState().customers.find(c => c.id === customerId) || null }
export async function searchCustomers(venueId, query) {
  const q = query.toLowerCase()
  return (await getCustomers(venueId)).filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q))
}
export async function joinVenue(venueId, data) { return addMockCustomer(venueId, data) }
export async function completeProfile(customerId, profileData, stampsRequired) { return completeMockProfile(customerId, profileData, stampsRequired) }
export async function addStamp(customerId, staffId, stampsRequired) { return addMockStamp(customerId, stampsRequired) }
export async function redeemReward(customerId) { return redeemMockReward(customerId) }
export async function getFroffers(venueId) { return getMockState().froffers.filter(f => f.venueId === venueId && f.active) }
export async function getAllFroffers(venueId) { return getMockState().froffers.filter(f => f.venueId === venueId) }
export async function saveFroffer(venueId, froffer) { return saveMockFroffer(venueId, froffer) }
export async function deleteFroffer(frofferId) { return deleteMockFroffer(frofferId) }
export async function getSegments(venueId, stampsRequired) { return computeSegments(await getCustomers(venueId), stampsRequired) }
export async function getStats(venueId) { return getMockStats(venueId) }
