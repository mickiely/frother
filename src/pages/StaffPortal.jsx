import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getVenue, searchCustomers, addStamp, redeemReward, getFroffers } from '../lib/dataService'
import VenueBrand from '../components/VenueBrand'
import StampCard from '../components/StampCard'
import FrofferCard from '../components/FrofferCard'

const STAFF_ID = 'staff-1'

export default function StaffPortal() {
  const { venueSlug } = useParams()
  const [venue, setVenue] = useState(null)
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [view, setView] = useState('search') // 'search' | 'froffers'
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [froffers, setFroffers] = useState([])
  const [toast, setToast] = useState('')

  useEffect(() => {
    getVenue(venueSlug).then(setVenue)
  }, [venueSlug])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  async function handleSearch(q) {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    const r = await searchCustomers(venue.id, q)
    setResults(r)
  }

  async function handleAddStamp() {
    const updated = await addStamp(selected.id, STAFF_ID, venue.loyaltyRule.stampsRequired)
    setSelected(updated)
    const justEarned = updated.stamps >= venue.loyaltyRule.stampsRequired &&
      selected.stamps < venue.loyaltyRule.stampsRequired
    if (justEarned && updated.profileStatus !== 'full') {
      showToast('☕ Stamp added — reward earned but profile required')
    } else {
      showToast('✅ Stamp added!')
    }
  }

  async function handleRedeemReward() {
    const updated = await redeemReward(selected.id, STAFF_ID)
    setSelected(updated)
    showToast('🏆 Reward redeemed!')
  }

  async function loadFroffers() {
    const f = await getFroffers(venue.id)
    setFroffers(f)
    setView('froffers')
  }

  function handlePin(e) {
    e.preventDefault()
    if (!venue) return
    if (pin === venue.staffPin) {
      setAuthed(true)
    } else {
      setPinError('Wrong PIN. Try again.')
      setPin('')
    }
  }

  if (!venue) return null

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col" style={{ '--brand-color': venue.brandColor }}>
        <div className="text-white px-5 pt-10 pb-6" style={{ backgroundColor: venue.brandColor }}>
          <Link to={`/venue/${venueSlug}`} className="text-white/70 text-sm mb-4 block">← Venue</Link>
          <VenueBrand venue={venue} size="md" />
          <p className="text-white/80 text-sm mt-1">Staff Portal</p>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full max-w-xs">
            <h2 className="font-bold text-xl mb-5 text-center">Staff PIN</h2>
            <form onSubmit={handlePin}>
              <label htmlFor="staff-pin" className="sr-only">Staff PIN</label>
              <input
                id="staff-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={e => { setPin(e.target.value); setPinError('') }}
                placeholder="Enter PIN"
                className="w-full border border-gray-200 rounded-xl px-4 py-4 text-2xl text-center tracking-widest focus:outline-none mb-3"
                autoFocus
              />
              {pinError && <p className="text-red-500 text-sm text-center mb-3">{pinError}</p>}
              <button
                type="submit"
                className="w-full text-white font-bold py-3.5 rounded-xl"
                style={{ backgroundColor: venue.brandColor }}
              >
                Enter
              </button>
            </form>
            <p className="text-xs text-gray-400 text-center mt-4">Demo PIN: 1234</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ '--brand-color': venue.brandColor }}>
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm z-50 shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}

      <div className="text-white px-5 pt-10 pb-4" style={{ backgroundColor: venue.brandColor }}>
        <div className="flex justify-between items-start">
          <div>
            <VenueBrand venue={venue} size="sm" />
            <p className="text-white/70 text-xs mt-0.5">Staff Portal</p>
          </div>
          <button onClick={() => setAuthed(false)} className="text-white/60 text-xs">Sign out</button>
        </div>
        <div className="flex gap-2 mt-4">
          <TabBtn active={view !== 'froffers'} onClick={() => setView('search')}>
            Customers
          </TabBtn>
          <TabBtn active={view === 'froffers'} onClick={loadFroffers}>
            Froffers
          </TabBtn>
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {view === 'froffers' ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium">Active today</p>
            {froffers.map(f => <FrofferCard key={f.id} froffer={f} showRedeem />)}
            {froffers.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">No active Froffers</p>
            )}
          </div>
        ) : selected ? (
          <CustomerView
            customer={selected}
            venue={venue}
            onBack={() => { setSelected(null); setQuery(''); setResults([]) }}
            onAddStamp={handleAddStamp}
            onRedeemReward={handleRedeemReward}
          />
        ) : (
          <div className="space-y-3">
            <label htmlFor="staff-customer-search" className="sr-only">Search customers</label>
            <input
              id="staff-customer-search"
              type="search"
              placeholder="Search by name or phone..."
              value={query}
              onChange={e => handleSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:outline-none bg-white"
              autoFocus
            />
            {results.length > 0 && (
              <div className="space-y-2">
                {results.map(c => {
                  const isRewardEarned = c.stamps >= venue.loyaltyRule.stampsRequired
                  const isLocked = isRewardEarned && c.profileStatus !== 'full'
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className="w-full bg-white rounded-xl border border-gray-100 px-4 py-3.5 text-left flex justify-between items-center shadow-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{c.name}{c.lastName ? ` ${c.lastName}` : ''}</p>
                        <p className="text-sm text-gray-400">{c.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg" style={{ color: venue.brandColor }}>{c.stamps}</p>
                        <p className="text-xs text-gray-400">
                          {isLocked ? '🔒 locked' : isRewardEarned ? '🏆 ready' : 'stamps'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            {query.length >= 2 && results.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-6">No customers found</p>
            )}
            {query.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-6">
                Type a name or phone number to search
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Customer detail view ──────────────────────────────────────────────────────

function CustomerView({ customer, venue, onBack, onAddStamp, onRedeemReward }) {
  const required = venue.loyaltyRule.stampsRequired
  const isRewardEarned = customer.stamps >= required
  const isRewardLocked = isRewardEarned && customer.profileStatus !== 'full'
  const isRewardReady = isRewardEarned && customer.profileStatus === 'full'

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-gray-500 flex items-center gap-1">
        ← Back to search
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex justify-between items-start">
        <div>
          <p className="font-bold text-xl">{customer.name}{customer.lastName ? ` ${customer.lastName}` : ''}</p>
          <p className="text-gray-500 text-sm">{customer.phone}</p>
          {customer.email && <p className="text-gray-400 text-xs mt-0.5">{customer.email}</p>}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          customer.profileStatus === 'full'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {customer.profileStatus === 'full' ? '✓ Full profile' : 'Quick profile'}
        </span>
      </div>

      <StampCard
        stamps={customer.stamps}
        required={required}
        brandColor={venue.brandColor}
        rewardDescription={venue.loyaltyRule.rewardDescription}
        isRewardLocked={isRewardLocked}
      />

      {/* Lock notice */}
      {isRewardLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <p className="text-amber-900 text-sm font-semibold">
            Reward earned — profile required before redemption.
          </p>
          <p className="text-amber-700 text-xs mt-0.5">
            Ask the customer to complete their profile at the counter.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onAddStamp}
          className="text-white font-bold py-4 rounded-xl text-base"
          style={{ backgroundColor: venue.brandColor }}
        >
          ☕ Add stamp
        </button>
        <button
          onClick={onRedeemReward}
          disabled={!isRewardReady}
          aria-disabled={!isRewardReady}
          className={`font-bold py-4 rounded-xl text-base transition-all ${
            isRewardReady
              ? 'bg-yellow-400 text-yellow-900'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          🏆 Redeem
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Total stamps earned: {customer.totalStampsEarned} · Rewards redeemed: {customer.rewardsRedeemed}
      </p>
    </div>
  )
}

function TabBtn({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
        active ? 'bg-white text-gray-900' : 'text-white/80'
      }`}
    >
      {children}
    </button>
  )
}
