const prefix = 'frother:guest-card:'
export function saveGuestKey(venueId, key) {
  if (!/^[a-f0-9]{64}$/.test(key)) throw new Error('Enter the full 64-character recovery key.')
  try { localStorage.setItem(prefix + venueId, key) }
  catch { throw new Error('This browser cannot save your card. Enable browser storage or use another browser.') }
}
export function getOrCreateGuestKey(venueId) {
  let key
  try { key = localStorage.getItem(prefix + venueId) }
  catch { throw new Error('This browser cannot save your card. Enable browser storage or use another browser.') }
  if (key) {
    if (!/^[a-f0-9]{64}$/.test(key)) throw new Error('Your saved card key is invalid. Use your private recovery key to restore it.')
    return key
  }
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  key = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  saveGuestKey(venueId, key)
  return key
}
export function existingGuestKey(venueId) {
  try { return localStorage.getItem(prefix + venueId) }
  catch { return null }
}
export function clearGuestKey(venueId) {
  try { localStorage.removeItem(prefix + venueId) } catch { /* Registered account remains available. */ }
}
