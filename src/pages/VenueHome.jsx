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
    <div className="min-h-screen frother-shell" style={{ '--brand-color': venue.brandColor }}>
      {/* Header */}
      <div className="frother-hero text-white px-5 pt-12 pb-10">
        <div className="max-w-lg mx-auto">
          <div className="frother-sticker text-xs px-3 py-1 mb-5 rotate-[-2deg]">Frother demo</div>
          <h1 className="text-4xl font-black leading-none tracking-tight">Demo Cafe Rewards</h1>
          <p className="mt-3 text-white/90 text-lg font-bold leading-snug">Tap in. Stack stamps. Score free coffee.</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-6 -mt-6">
        {/* Loyalty card preview */}
        <div className="frother-card p-5">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h2 className="font-black text-2xl leading-tight">Loyalty Card</h2>
            <span className="frother-sticker text-xs px-3 py-1 rotate-[2deg]">No app</span>
          </div>
          <p className="text-gray-600 text-sm mb-5 font-medium">
            Buy {venue.loyaltyRule.stampsRequired} coffees, get your {venue.loyaltyRule.rewardDescription.toLowerCase()}.
          </p>
          <div className="grid grid-cols-5 gap-2 mb-5">
            {Array.from({ length: venue.loyaltyRule.stampsRequired }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-full bg-[#F7F3EA] border-2 border-gray-200 flex items-center justify-center"
              />
            ))}
          </div>
          <Link
            to={`/venue/${slug}/join`}
            className="frother-button w-full text-white text-lg"
            style={{ backgroundColor: venue.brandColor }}
          >
            Join Rewards
          </Link>
          <p className="text-xs text-gray-500 text-center mt-4 font-semibold">
            10 seconds. No app. No card. Staff can look you up.
          </p>
        </div>

        {/* Returning member */}
        <div className="text-center">
          <p className="text-sm text-gray-500 font-medium">
            Already a member?{' '}
            <Link to={`/staff/${slug}`} className="brand-text font-black" style={{ color: venue.brandColor }}>
              Ask staff to look you up
            </Link>
          </p>
        </div>

        {/* Froffers */}
        {froffers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-2xl tracking-tight">Today's Froffers</h2>
              <span className="frother-sticker text-[10px] px-2.5 py-1 rotate-[2deg]">Fresh</span>
            </div>
            <div className="space-y-3">
              {froffers.map(f => (
                <FrofferCard key={f.id} froffer={f} />
              ))}
            </div>
          </div>
        )}

        {/* Footer links */}
        <div className="flex justify-center gap-6 pt-2 pb-8 text-sm text-gray-500 font-bold">
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
