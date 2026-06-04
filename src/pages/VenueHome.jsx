import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getVenue, getFroffers } from '../lib/dataService'
import VenueBrand from '../components/VenueBrand'
import FrofferCard from '../components/FrofferCard'

export default function VenueHome() {
  const { slug } = useParams()
  const [venue, setVenue] = useState(null)
  const [froffers, setFroffers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const v = await getVenue(slug)
      if (!v) { setLoading(false); return }
      const f = await getFroffers(v.id)
      setVenue(v)
      setFroffers(f)
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return <LoadingScreen />
  if (!venue) return <NotFoundMsg />

  return (
    <div className="min-h-screen" style={{ '--brand-color': venue.brandColor }}>
      {/* Header */}
      <div className="brand-bg text-white px-5 pt-12 pb-8">
        <h1 className="text-3xl font-bold leading-tight">Demo Cafe Rewards</h1>
        <p className="mt-2 text-white/85 text-base">Tap in. Stack stamps. Score free coffee.</p>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Loyalty card preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-lg mb-1">☕ Loyalty Card</h2>
          <p className="text-gray-500 text-sm mb-4">
            Buy {venue.loyaltyRule.stampsRequired} coffees, get your {venue.loyaltyRule.rewardDescription.toLowerCase()}.
          </p>
          <div className="grid grid-cols-5 gap-2 mb-5">
            {Array.from({ length: venue.loyaltyRule.stampsRequired }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-full bg-gray-100 flex items-center justify-center"
              />
            ))}
          </div>
          <Link
            to={`/venue/${slug}/join`}
            className="block text-center text-white font-bold py-3.5 rounded-xl text-base w-full"
            style={{ backgroundColor: venue.brandColor }}
          >
            Join Rewards
          </Link>
          <p className="text-xs text-gray-400 text-center mt-3">
            10 seconds. No app. No card. Staff can look you up.
          </p>
        </div>

        {/* Returning member */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Already a member?{' '}
            <Link to={`/staff/${slug}`} className="brand-text font-semibold" style={{ color: venue.brandColor }}>
              Ask staff to look you up
            </Link>
          </p>
        </div>

        {/* Froffers */}
        {froffers.length > 0 && (
          <div>
            <h2 className="font-bold text-lg mb-3">Today's Froffers</h2>
            <div className="space-y-3">
              {froffers.map(f => (
                <FrofferCard key={f.id} froffer={f} />
              ))}
            </div>
          </div>
        )}

        {/* Footer links */}
        <div className="flex justify-center gap-6 pt-2 pb-8 text-sm text-gray-400">
          <Link to={`/staff/${slug}`} className="hover:text-gray-600">Staff</Link>
          <Link to={`/admin/${slug}`} className="hover:text-gray-600">Admin</Link>
        </div>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )
}

function NotFoundMsg() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-4xl mb-3">☕</p>
      <h1 className="text-xl font-bold mb-2">Venue not found</h1>
      <p className="text-gray-500 text-sm">Check the link and try again.</p>
    </div>
  )
}
