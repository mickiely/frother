import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getVenue, getCustomer } from '../lib/dataService'
import VenueBrand from '../components/VenueBrand'
import StampCard from '../components/StampCard'

export default function CustomerDashboard() {
  const { slug, customerId } = useParams()
  const [venue, setVenue] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    async function load() {
      const [v, c] = await Promise.all([getVenue(slug), getCustomer(customerId)])
      if (v && c) {
        setVenue(v)
        setCustomer(c)
      }
      setLoading(false)
    }
    load()
  }, [slug, customerId])

  if (loading) return <Loading />
  if (!venue || !customer) return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <p className="text-4xl mb-3">😕</p>
        <h1 className="font-bold text-xl mb-2">Card not found</h1>
        <Link to={`/venue/${slug}`} className="text-sm text-gray-500 underline">
          Back to venue
        </Link>
      </div>
    </div>
  )

  const required = venue.loyaltyRule.stampsRequired
  const isRewardEarned = customer.stamps >= required
  const isRewardLocked = isRewardEarned && customer.profileStatus !== 'full'
  const isRewardReady = isRewardEarned && customer.profileStatus === 'full'

  if (showCard) {
    return (
      <ShowCardScreen
        customer={customer}
        venue={venue}
        required={required}
        isRewardReady={isRewardReady}
        onClose={() => setShowCard(false)}
      />
    )
  }

  return (
    <div className="min-h-screen frother-shell" style={{ '--brand-color': venue.brandColor }}>
      <div className="frother-hero px-5 pt-10 pb-8">
        <Link to={`/venue/${slug}`} className="text-gray-500 text-sm mb-4 block font-bold">
          ← Back
        </Link>
        <VenueBrand venue={venue} size="md" />
        <p className="mt-4 text-gray-900 font-black text-2xl leading-tight tracking-tight">
          Hey, {customer.name}!
        </p>
        <p className="text-gray-700 text-base font-semibold mt-1">
          Buy {required}, get 1 free.
        </p>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4 -mt-5 pb-10">
        <StampCard
          stamps={customer.stamps}
          required={required}
          brandColor={venue.brandColor}
          rewardDescription={venue.loyaltyRule.rewardDescription}
          isRewardLocked={isRewardLocked}
          rewardsRedeemed={customer.rewardsRedeemed}
        />

        {/* Reward locked — needs profile */}
        {isRewardLocked && (
          <div className="frother-card p-5 bg-amber-50">
            <p className="font-black text-amber-900 text-lg mb-1">
              Your free one is ready.
            </p>
            <p className="text-amber-800 text-sm mb-4 font-medium">
              Add a few details to use it. Ask staff if you need help.
            </p>
            <Link
              to={`/venue/${slug}/customer/${customerId}/complete-profile`}
              className="frother-button w-full bg-amber-500 text-white text-base"
            >
              Add details to unlock
            </Link>
          </div>
        )}

        {/* Reward ready */}
        {isRewardReady && (
          <div className="frother-card p-5 bg-[#FFF8EA] text-center">
            <p className="font-black text-3xl text-gray-900">
              Your free one is ready.
            </p>
            <p className="text-base text-gray-600 font-semibold mt-2 mb-5">
              Staff will mark it used.
            </p>
            <button
              onClick={() => setShowCard(true)}
              className="frother-button w-full text-white text-lg"
              style={{ backgroundColor: venue.brandColor }}
            >
              Show staff
            </button>
          </div>
        )}

        {/* Normal — show card button */}
        {!isRewardEarned && (
          <button
            onClick={() => setShowCard(true)}
            className="frother-button w-full text-white text-base"
            style={{ backgroundColor: venue.brandColor }}
          >
            Show my card
          </button>
        )}

        <p className="text-xs text-gray-400 text-center font-medium pt-1">
          Show this screen when you order. Staff can also look you up.
        </p>
      </div>
    </div>
  )
}

/* Full-screen card shown to staff at the counter */
function ShowCardScreen({ customer, venue, required, isRewardReady, onClose }) {
  const bg = isRewardReady ? '#F59E0B' : venue.brandColor

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center text-white p-8 text-center"
      style={{ backgroundColor: bg }}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 text-sm font-bold"
      >
        ✕ Close
      </button>

      {isRewardReady ? (
        <>
          <p className="text-6xl mb-4" aria-hidden="true">🏆</p>
          <h1 className="text-3xl font-black mb-2">{customer.name}</h1>
          <p className="text-white/70 text-base mb-6">{customer.phone}</p>
          <p className="text-2xl font-black mb-1">Your free one is ready.</p>
          <p className="text-white/80 text-base">{venue.loyaltyRule.rewardDescription}</p>
          <p className="mt-4 text-sm text-white/60">Staff will mark it used.</p>
        </>
      ) : (
        <>
          <p className="text-5xl mb-4" aria-hidden="true">☕</p>
          <h1 className="text-3xl font-black mb-2">{customer.name}</h1>
          <p className="text-white/70 text-base mb-6">{customer.phone}</p>
          <div className="bg-white/20 rounded-2xl px-10 py-5 mb-4">
            <p className="text-6xl font-black">{customer.stamps}</p>
            <p className="text-white/80 text-sm mt-1">
              of {required} stamps
            </p>
          </div>
          <p className="text-white/80 text-base">
            {required - customer.stamps} more until your free one.
          </p>
        </>
      )}
    </div>
  )
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  )
}
