import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getVenue, searchCustomers, addStamp, redeemReward } from '../lib/dataService'
import VenueBrand from '../components/VenueBrand'
import StampCard from '../components/StampCard'

const STAFF_ID = 'staff-1'

export default function StaffPortal() {
  const { venueSlug } = useParams()
  const [venue, setVenue] = useState(null)
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    getVenue(venueSlug).then(setVenue)
  }, [venueSlug])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function handleSearch(q) {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    const r = await searchCustomers(venue.id, q)
    setResults(r)
  }

  async function handleAddStamps(count) {
    let updated = selected
    for (let i = 0; i < count; i++) {
      updated = await addStamp(updated.id, STAFF_ID, venue.loyaltyRule.stampsRequired)
    }
    setSelected(updated)
    const rewardReady = updated.stamps >= venue.loyaltyRule.stampsRequired &&
      updated.profileStatus === 'full'
    if (rewardReady) {
      showToast(`Reward ready. Tell ${updated.name} their free one is ready.`)
    } else {
      const label = count === 1 ? 'stamp' : 'stamps'
      showToast(`Added ${count} ${label} for ${updated.name}.`)
    }
  }

  async function handleRedeemReward() {
    const updated = await redeemReward(selected.id, STAFF_ID)
    setSelected(updated)
    showToast('Reward redeemed!')
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
      <div className="min-h-screen frother-shell flex flex-col" style={{ '--brand-color': venue.brandColor }}>
        <div className="frother-hero px-5 pt-10 pb-6">
          <Link to={`/venue/${venueSlug}`} className="text-gray-500 text-sm mb-4 block font-bold">Back</Link>
          <VenueBrand venue={venue} size="md" />
          <p className="text-gray-900 font-black text-xl mt-3">Staff counter</p>
          <p className="text-gray-500 text-sm font-medium mt-1">Find a customer, add a stamp, or mark a reward used.</p>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="frother-card p-6 w-full max-w-xs">
            <h2 className="font-black text-2xl mb-5 text-center">Staff PIN</h2>
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
                className="frother-input px-4 py-4 text-2xl text-center tracking-widest mb-3"
                autoFocus
              />
              {pinError && <p className="text-red-500 text-sm text-center mb-3">{pinError}</p>}
              <button
                type="submit"
                className="frother-button w-full text-white"
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
    <div className="min-h-screen frother-shell" style={{ '--brand-color': venue.brandColor }}>
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm z-50 shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}

      <div className="frother-hero px-5 pt-10 pb-5">
        <div className="flex justify-between items-start">
          <div>
            <VenueBrand venue={venue} size="sm" />
            <p className="text-gray-900 font-black text-base mt-1.5">Staff counter</p>
          </div>
          <button onClick={() => setAuthed(false)} className="text-gray-500 text-xs font-bold">Sign out</button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {['Find customer', 'Add stamp', 'Redeem reward'].map(item => (
            <div key={item} className="bg-white/75 border-2 border-gray-900 rounded-xl px-2 py-2 text-center text-xs font-black text-gray-900">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {selected ? (
          <CustomerView
            customer={selected}
            venue={venue}
            onBack={() => { setSelected(null); setQuery(''); setResults([]) }}
            onAddStamps={handleAddStamps}
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
              className="frother-input px-4 py-4 text-base"
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
                      className="w-full frother-card px-4 py-4 text-left flex justify-between items-center"
                    >
                      <div>
                        <p className="font-black text-gray-900 text-lg">{c.name}{c.lastName ? ` ${c.lastName}` : ''}</p>
                        <p className="text-sm text-gray-500 font-medium">{c.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-2xl" style={{ color: venue.brandColor }}>{c.stamps}</p>
                        <p className="text-xs text-gray-500 font-bold">
                          {isLocked ? 'locked' : isRewardEarned ? 'ready' : 'stamps'}
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

function CustomerView({ customer, venue, onBack, onAddStamps, onRedeemReward }) {
  const required = venue.loyaltyRule.stampsRequired
  const isRewardEarned = customer.stamps >= required
  const isRewardLocked = isRewardEarned && customer.profileStatus !== 'full'
  const isRewardReady = isRewardEarned && customer.profileStatus === 'full'

  const [showCustom, setShowCustom] = useState(false)
  const [customCount, setCustomCount] = useState('')
  const [adding, setAdding] = useState(false)

  async function doAdd(count) {
    setAdding(true)
    setShowCustom(false)
    setCustomCount('')
    await onAddStamps(count)
    setAdding(false)
  }

  function handleCustomSave() {
    const n = parseInt(customCount, 10)
    if (!n || n < 1 || n > 20) return
    doAdd(n)
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-gray-500 flex items-center gap-1">
        Back to search
      </button>

      <div className="frother-card p-4 flex justify-between items-start">
        <div>
          <p className="font-black text-2xl tracking-tight">{customer.name}{customer.lastName ? ` ${customer.lastName}` : ''}</p>
          <p className="text-gray-500 text-sm">{customer.phone}</p>
          {customer.email && <p className="text-gray-400 text-xs mt-0.5">{customer.email}</p>}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          customer.profileStatus === 'full'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {customer.profileStatus === 'full' ? 'Full profile' : 'Quick profile'}
        </span>
      </div>

      <StampCard
        stamps={customer.stamps}
        required={required}
        brandColor={venue.brandColor}
        rewardDescription={venue.loyaltyRule.rewardDescription}
        isRewardLocked={isRewardLocked}
        rewardsRedeemed={customer.rewardsRedeemed}
      />

      {/* Lock notice */}
      {isRewardLocked && (
        <div className="frother-card bg-amber-50 border-amber-200 px-4 py-3">
          <p className="text-amber-900 text-sm font-semibold">
            Reward earned — profile required before redemption.
          </p>
          <p className="text-amber-700 text-xs mt-0.5">
            Ask the customer to complete their profile at the counter.
          </p>
        </div>
      )}

      {/* Multi-stamp quick buttons */}
      {!isRewardEarned && (
        <div className="frother-card p-4 space-y-3">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wide">Add stamps</p>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3].map(n => (
              <button
                key={n}
                onClick={() => doAdd(n)}
                disabled={adding}
                className="frother-button text-white text-sm py-3 disabled:opacity-50"
                style={{ backgroundColor: venue.brandColor }}
              >
                Add {n}
              </button>
            ))}
            <button
              onClick={() => setShowCustom(v => !v)}
              disabled={adding}
              className="frother-button bg-gray-100 text-gray-900 text-sm py-3 disabled:opacity-50"
            >
              Custom
            </button>
          </div>

          {showCustom && (
            <div className="flex gap-2 items-center pt-1">
              <label htmlFor="custom-stamp-count" className="sr-only">Number of stamps</label>
              <input
                id="custom-stamp-count"
                type="number"
                min={1}
                max={20}
                value={customCount}
                onChange={e => setCustomCount(e.target.value)}
                placeholder="1-20"
                className="frother-input px-3 py-2.5 text-base w-24 text-center"
                autoFocus
              />
              <button
                onClick={handleCustomSave}
                disabled={adding || !customCount || parseInt(customCount, 10) < 1}
                className="frother-button text-white text-sm flex-1 disabled:opacity-50"
                style={{ backgroundColor: venue.brandColor }}
              >
                Save stamps
              </button>
            </div>
          )}

          <p className="text-xs text-gray-400 font-medium">
            Bought more than one coffee? Add the matching number of stamps.
          </p>
        </div>
      )}

      {/* Redeem row — always visible */}
      <div className={`grid gap-3 ${isRewardEarned ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {isRewardEarned && (
          <button
            onClick={() => doAdd(1)}
            disabled={adding}
            className="frother-button text-white text-base disabled:opacity-50"
            style={{ backgroundColor: venue.brandColor }}
          >
            Add stamp
          </button>
        )}
        <button
          onClick={onRedeemReward}
          disabled={!isRewardReady || adding}
          aria-disabled={!isRewardReady}
          className={`frother-button text-base transition-all ${
            isRewardReady
              ? 'bg-yellow-400 text-yellow-900'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
          }`}
        >
          Redeem reward
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Total stamps earned: {customer.totalStampsEarned} &middot; Rewards redeemed: {customer.rewardsRedeemed}
      </p>
    </div>
  )
}
