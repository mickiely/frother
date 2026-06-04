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
          <div className="frother-sticker text-xs px-3 py-1 mb-5 rotate-[-2deg]">Tap in. Stack stamps. Froth on.</div>
          <p className="text-white/75 text-sm font-black uppercase tracking-wider mb-2">Demo Cafe Rewards</p>
          <h1 className="text-4xl sm:text-5xl font-black leading-none tracking-tight">Get your regulars frothing.</h1>
          <p className="mt-4 text-white/90 text-xl font-black leading-snug">No apps. No lost cards. No counter chaos.</p>
          <p className="mt-4 text-white/85 text-sm font-semibold leading-relaxed">
            Replace paper stamp cards with tap-to-join loyalty, Froffers and Regulars Radar for your venue.
          </p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-6 -mt-6">
        {/* Loyalty card preview */}
        <div className="frother-card p-5">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h2 className="font-black text-2xl leading-tight">Tap-to-join loyalty</h2>
            <span className="frother-sticker text-xs px-3 py-1 rotate-[2deg]">No app</span>
          </div>
          <p className="text-gray-600 text-sm mb-5 font-medium">
            Customers scan a QR or tap NFC, join with name and mobile, then start collecting stamps immediately.
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
            10 seconds. No app. No lost cards. Staff can look you up.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <PitchPill title="No app" body="Runs in the browser from QR or NFC." />
          <PitchPill title="No lost cards" body="Digital stamps replace paper cards." />
          <PitchPill title="Staff lookup" body="Find customers by name or mobile." />
          <PitchPill title="Fast counter" body="Customers collect before full profile." />
        </div>

        <div className="frother-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">For cafe owners</p>
              <h2 className="font-black text-2xl leading-tight">Get your regulars frothing.</h2>
            </div>
            <span className="frother-sticker text-[10px] px-2.5 py-1 rotate-[2deg]">Pilot</span>
          </div>
          <p className="text-sm text-gray-600 font-medium leading-relaxed mt-3">
            Paper cards give you no data. Frother keeps loyalty simple while showing customer names, reward status, profile completion and who needs a nudge.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniFeature label="Froffers" value="Specials worth coming back for." />
            <MiniFeature label="Regulars Radar" value="Who is close, quiet or ready." />
          </div>
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

        <div className="frother-card p-5 bg-[#111827] text-white">
          <p className="text-xs font-black text-[#F4B84A] uppercase tracking-wider mb-1">Frother Pilot Setup</p>
          <h2 className="font-black text-2xl leading-tight">$499 setup. $99/month for pilot venues.</h2>
          <p className="text-sm text-white/75 font-medium leading-relaxed mt-3">
            Includes a branded rewards page, QR/NFC tap-to-join setup, staff dashboard, admin dashboard, Froffers, Regulars Radar, basic staff training and first month support.
          </p>
        </div>

        {/* Footer links */}
        <div className="flex justify-center gap-6 pt-2 pb-8 text-sm text-gray-500 font-bold">
          <Link to={`/staff/${slug}`} className="hover:text-gray-600">Staff</Link>
          <Link to={`/admin/${slug}`} className="hover:text-gray-600">Admin</Link>
        </div>
      </div>
    </div>
  )
}

function PitchPill({ title, body }) {
  return (
    <div className="frother-card p-4">
      <p className="font-black text-gray-900 text-sm">{title}</p>
      <p className="text-xs text-gray-500 font-semibold mt-1 leading-snug">{body}</p>
    </div>
  )
}

function MiniFeature({ label, value }) {
  return (
    <div className="bg-[#F7F3EA] border-2 border-gray-900/10 rounded-2xl p-3">
      <p className="font-black text-gray-900 text-sm">{label}</p>
      <p className="text-xs text-gray-600 font-semibold mt-1 leading-snug">{value}</p>
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
