import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getVenue, getCustomer, getFroffers } from '../lib/dataService'
import VenueBrand from '../components/VenueBrand'
import StampCard from '../components/StampCard'
import FrofferCard from '../components/FrofferCard'

export default function CustomerDashboard() {
  const { slug, customerId } = useParams()
  const navigate = useNavigate()
  const [venue, setVenue] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [froffers, setFroffers] = useState([])
  const [showCardScreen, setShowCardScreen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [v, c] = await Promise.all([getVenue(slug), getCustomer(customerId)])
      if (v && c) {
        const f = await getFroffers(v.id)
        setVenue(v)
        setCustomer(c)
        setFroffers(f)
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
        <Link to={`/venue/${slug}`} className="text-sm text-gray-500 underline">Back to venue</Link>
      </div>
    </div>
  )

  const required = venue.loyaltyRule.stampsRequired
  const isRewardEarned = customer.stamps >= required
  const isRewardLocked = isRewardEarned && customer.profileStatus !== 'full'
  const isRewardReady = isRewardEarned && customer.profileStatus === 'full'

  if (showCardScreen) {
    return (
      <CardScreen
        customer={customer}
        venue={venue}
        isRewardEarned={isRewardEarned}
        isRewardLocked={isRewardLocked}
        isRewardReady={isRewardReady}
        onClose={() => setShowCardScreen(false)}
        onCompleteProfile={() => navigate(`/venue/${slug}/customer/${customerId}/complete-profile`)}
      />
    )
  }

  return (
    <div className="min-h-screen frother-shell" style={{ '--brand-color': venue.brandColor }}>
      <div className="frother-hero px-5 pt-10 pb-8">
        <Link to={`/venue/${slug}`} className="text-gray-500 text-sm mb-4 block font-bold">← Back</Link>
        <VenueBrand venue={venue} size="md" />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-gray-900 font-black text-2xl tracking-tight">Hey, {customer.name}! 👋</p>
          <ProfileBadge status={customer.profileStatus} />
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4 -mt-5">
        <StampCard
          stamps={customer.stamps}
          required={required}
          brandColor={venue.brandColor}
          rewardDescription={venue.loyaltyRule.rewardDescription}
          isRewardLocked={isRewardLocked}
          rewardsRedeemed={customer.rewardsRedeemed}
        />

        {/* Reward locked — complete profile CTA */}
        {isRewardLocked && (
          <div className="frother-card p-4 bg-amber-50 border-amber-200">
            <p className="font-black text-amber-900 text-base mb-1">
              ☕ You've earned your free coffee!
            </p>
            <p className="text-amber-800 text-sm mb-3 font-medium">
              Complete your profile to unlock it.
            </p>
          </div>
        )}

        {isRewardLocked ? (
          <Link
            to={`/venue/${slug}/customer/${customerId}/complete-profile`}
            className="frother-button w-full bg-amber-500 text-white text-base"
          >
            Complete profile to unlock reward
          </Link>
        ) : (
          <button
            onClick={() => setShowCardScreen(true)}
            className={`frother-button w-full text-base text-white ${
              isRewardReady ? 'shadow-lg' : ''
            }`}
            style={{
              backgroundColor: isRewardReady ? '#F59E0B' : venue.brandColor,
            }}
          >
            {isRewardReady ? '🏆 Show reward to staff' : '📱 Show card to staff'}
          </button>
        )}

        {/* Froffers */}
        {froffers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-2xl tracking-tight">Today's Froffers</h2>
              <span className="frother-sticker text-[10px] px-2.5 py-1">Froffers</span>
            </div>
            <div className="space-y-3">
              {froffers.map(f => <FrofferCard key={f.id} froffer={f} />)}
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-500 font-semibold pt-2 pb-8">
          Member since{' '}
          {new Date(customer.joinedAt).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
        </div>
      </div>
    </div>
  )
}

// ── Profile status badge ──────────────────────────────────────────────────────

function ProfileBadge({ status }) {
  if (status === 'full') {
    return (
      <span className="frother-sticker frother-sticker-green text-[10px] px-2.5 py-1">
        ✓ Full profile
      </span>
    )
  }
  return (
    <span className="frother-sticker text-[10px] px-2.5 py-1">
      Quick profile
    </span>
  )
}

// ── Full-screen card / reward screen shown to staff ───────────────────────────

function CardScreen({ customer, venue, isRewardEarned, isRewardLocked, isRewardReady, onClose, onCompleteProfile }) {
  let bg = venue.brandColor
  if (isRewardReady) bg = '#F59E0B'
  if (isRewardLocked) bg = '#6B7280'

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center text-white p-8 text-center"
      style={{ backgroundColor: bg }}
    >
      <button onClick={onClose} className="absolute top-8 right-6 text-white/70 text-sm">✕ Close</button>

      <div className="text-7xl mb-5">
        {isRewardReady ? '🏆' : isRewardLocked ? '🔒' : '☕'}
      </div>
      <h1 className="text-3xl font-bold mb-1">{customer.name}{customer.lastName ? ` ${customer.lastName}` : ''}</h1>
      <p className="text-white/70 text-base mb-6">{customer.phone}</p>

      {isRewardReady && (
        <>
          <p className="text-2xl font-bold mb-2">Reward ready!</p>
          <p className="text-white/90">{venue.loyaltyRule.rewardDescription}</p>
          <p className="mt-3 text-sm text-white/60">Show this screen to staff to redeem</p>
        </>
      )}

      {isRewardLocked && (
        <>
          <div className="bg-white/10 rounded-2xl px-8 py-4 mb-4">
            <p className="text-4xl font-bold">{customer.stamps}</p>
            <p className="text-white/70 text-sm mt-1">stamps earned</p>
          </div>
          <p className="font-bold text-lg mb-1">Reward earned!</p>
          <p className="text-white/80 text-sm mb-5">
            Complete your profile to unlock your free coffee.
          </p>
          <button
            onClick={onCompleteProfile}
            className="bg-white text-gray-900 font-bold px-6 py-3 rounded-xl text-sm"
          >
            Complete profile
          </button>
        </>
      )}

      {!isRewardEarned && (
        <>
          <div className="bg-white/20 rounded-2xl px-8 py-5 mb-4">
            <p className="text-5xl font-bold">{customer.stamps}</p>
            <p className="text-white/80 text-sm mt-1">stamps</p>
          </div>
          <p className="text-white/80">
            {venue.loyaltyRule.stampsRequired - customer.stamps} more for a free coffee
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
