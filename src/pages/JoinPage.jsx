import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getVenue, joinVenue } from '../lib/dataService'
import VenueBrand from '../components/VenueBrand'

export default function JoinPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [venue, setVenue] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getVenue(slug).then(setVenue)
  }, [slug])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('First name is required')
    if (!form.phone.trim()) return setError('Mobile number is required')

    setSubmitting(true)
    try {
      const customer = await joinVenue(venue.id, form)
      navigate(`/venue/${slug}/customer/${customer.id}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (!venue) return null

  return (
    <div className="min-h-screen bg-gray-50" style={{ '--brand-color': venue.brandColor }}>
      <div className="text-white px-5 pt-10 pb-8" style={{ backgroundColor: venue.brandColor }}>
        <Link to={`/venue/${slug}`} className="text-white/70 text-sm mb-5 block">← Back</Link>
        <VenueBrand venue={venue} size="md" />
        <p className="mt-4 text-white font-bold text-xl leading-snug">
          Join in 10 seconds.
        </p>
        <p className="text-white/80 text-base">
          Just name and mobile. No app, no card.
        </p>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-5">
            Buy {venue.loyaltyRule.stampsRequired} coffees, get your{' '}
            {venue.loyaltyRule.rewardDescription.toLowerCase()}.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              id="quick-join-first-name"
              label="First name"
              type="text"
              placeholder="Alex"
              value={form.name}
              onChange={v => setForm(f => ({ ...f, name: v }))}
              required
              autoFocus
            />
            <Field
              id="quick-join-mobile"
              label="Mobile number"
              type="tel"
              placeholder="0412 345 678"
              value={form.phone}
              onChange={v => setForm(f => ({ ...f, phone: v }))}
              required
            />
            <Field
              id="quick-join-email"
              label="Email (optional)"
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={v => setForm(f => ({ ...f, email: v }))}
            />

            {error && (
              <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white font-bold py-4 rounded-xl text-base disabled:opacity-50 mt-2"
              style={{ backgroundColor: venue.brandColor }}
            >
              {submitting ? 'Joining...' : "Join — it's free"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            We only use your details for this loyalty program.
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ id, label, type, placeholder, value, onChange, required, autoFocus }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span aria-hidden="true" className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        aria-label={label}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        autoFocus={autoFocus}
        className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-offset-1"
      />
    </div>
  )
}
