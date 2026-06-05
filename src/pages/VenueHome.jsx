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
      setVenue(v || null)
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return <LoadingScreen />
  if (!venue) return <NotFoundMsg />

  const required = venue.loyaltyRule.stampsRequired

  return (
    <div className="min-h-screen frother-shell" style={{ '--brand-color': venue.brandColor }}>

      {/* Venue-branded header */}
      <div className="frother-hero px-5 pt-10 pb-8">
        <div className="max-w-lg mx-auto">
          <VenueBrand venue={venue} size="md" />
          <p className="mt-5 text-gray-900 font-black text-3xl leading-tight tracking-tight">
            Your stamp card, on your phone.
          </p>
          <p className="text-gray-700 text-xl font-black mt-2">
            Buy {required}, get 1 free.
          </p>
          <p className="text-gray-600 text-base font-semibold mt-1">
            Tap the sign to open this page. Join once, then tap again next time. No app needed.
          </p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-4 -mt-5">

        {/* Stamp card preview */}
        <div className="frother-card p-6 bg-[#FFFBF0]">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-1">
            Stamp card
          </p>
          <p className="font-black text-2xl text-gray-900 mb-4">
            Buy {required}, get 1 free
          </p>

          {/* Empty stamp circles */}
          <div
            className="grid gap-2 mb-5"
            style={{ gridTemplateColumns: `repeat(${Math.min(required, 5)}, 1fr)` }}
            aria-label={`${required} stamp slots`}
          >
            {Array.from({ length: required }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-gray-300 font-black text-sm"
              >
                {i + 1}
              </div>
            ))}
          </div>

          <Link
            to={`/venue/${slug}/join`}
            className="frother-button w-full text-white text-lg"
            style={{ backgroundColor: venue.brandColor }}
          >
            Join rewards
          </Link>
          <p className="text-sm text-gray-500 text-center mt-4 font-semibold">
            Ask staff if you need help.
          </p>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-gray-400 text-center font-medium leading-relaxed px-2">
          Frother only saves your name and mobile so staff can find your card.
        </p>

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
