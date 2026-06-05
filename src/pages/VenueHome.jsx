import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getVenue } from '../lib/dataService'
import VenueBrand from '../components/VenueBrand'

export default function VenueHome() {
  const { slug } = useParams()
  const [venue, setVenue] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const v = await getVenue(slug)
      if (!v) { setLoading(false); return }
      setVenue(v)
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return <LoadingScreen />
  if (!venue) return <NotFoundMsg />

  return (
    <div className="min-h-screen frother-shell" style={{ '--brand-color': venue.brandColor }}>
      <div className="frother-hero px-5 pt-10 pb-8">
        <div className="max-w-lg mx-auto">
          <VenueBrand venue={venue} size="md" />
          <p className="mt-6 text-gray-900 font-black text-4xl leading-tight tracking-tight">
            Join rewards
          </p>
          <p className="text-gray-700 text-xl font-black mt-2">
            Buy {venue.loyaltyRule.stampsRequired}, get 1 free.
          </p>
          <p className="text-gray-600 text-base font-bold mt-2">
            No app. No paper card. Staff can help.
          </p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-5 -mt-5">
        <div className="frother-card p-5">
          <p className="text-sm text-gray-500 font-black uppercase tracking-wide mb-2">
            Stamp card
          </p>
          <h1 className="font-black text-3xl leading-tight text-gray-900">
            Buy {venue.loyaltyRule.stampsRequired}, get 1 free.
          </h1>
          <SimpleStampPreview total={venue.loyaltyRule.stampsRequired} />
          <Link
            to={`/venue/${slug}/join`}
            className="frother-button w-full text-white text-lg"
            style={{ backgroundColor: venue.brandColor }}
          >
            Join rewards
          </Link>
          <p className="text-xs text-gray-500 text-center mt-4 font-semibold">
            We only use your mobile to save your stamps.
          </p>
        </div>

        <div className="frother-card p-5 bg-[#FFF8EA]">
          <p className="font-black text-xl text-gray-900">How it works</p>
          <ol className="mt-4 space-y-3">
            {['Tap the sign', 'Enter your first name and mobile', 'See your stamp card', 'Staff add stamps when you visit'].map((step, i) => (
              <li key={step} className="flex items-center gap-3 text-base font-bold text-gray-800">
                <span className="w-8 h-8 rounded-full border-2 border-gray-900 bg-white flex items-center justify-center font-black">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

function SimpleStampPreview({ total }) {
  return (
    <div className="grid grid-cols-5 gap-2 my-5" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-full bg-[#F8F1E4] border-2 border-gray-300 flex items-center justify-center text-gray-300 font-black"
        >
          {i + 1}
        </div>
      ))}
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
