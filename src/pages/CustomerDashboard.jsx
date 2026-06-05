import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getVenue, getCustomer } from '../lib/dataService'
import VenueBrand from '../components/VenueBrand'
import StampCard from '../components/StampCard'

export default function CustomerDashboard() {
  const { slug, customerId } = useParams()
  const navigate = useNavigate()
  const [venue, setVenue] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

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
        <Link to={`/venue/${slug}`} className="text-sm text-gray-500 underline">Back to venue</Link>
      </div>
    </div>
  )

  const required = venue.loyaltyRule.stampsRequired
  const isRewardEarned = customer.stamps >= required
  const isRewardLocked = isRewardEarned && customer.profileStatus !== 'full'
  const isRewardReady = isRewardEarned && customer.profileStatus === 'full'

  return (
    <div className="min-h-screen frother-shell" style={{ '--brand-color': venue.brandColor }}>
      <div className="frother-hero px-5 pt-10 pb-8">
        <Link to={`/venue/${slug}`} className="text-gray-500 text-sm mb-4 block font-bold">← Back</Link>
        <VenueBrand venue={venue} size="md" />
        <p className="mt-5 text-gray-900 font-black text-3xl leading-tight tracking-tight">
          {venue.name}
        </p>
        <p className="text-gray-700 text-xl font-black mt-1">
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

        {/* Reward locked — complete profile CTA */}
        {isRewardLocked && (
          <div className="frother-card p-4 bg-amber-50 border-amber-200">
            <p className="font-black text-amber-900 text-base mb-1">
              Your free one is ready.
            </p>
            <p className="text-amber-800 text-sm mb-3 font-medium">
              Add a few details before you use it.
            </p>
            <Link
              to={`/venue/${slug}/customer/${customerId}/complete-profile`}
              className="frother-button w-full bg-amber-500 text-white text-base"
            >
              Add details
            </Link>
          </div>
        )}

        {isRewardReady && (
          <div className="frother-card p-5 bg-[#FFF8EA] text-center">
            <p className="font-black text-2xl text-gray-900">Your free one is ready.</p>
            <p className="text-base text-gray-700 font-bold mt-2">Show this to staff.</p>
          </div>
        )}
      </div>
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
