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
    <div className="min-h-screen frother-shell" style={{ '--brand-color': venue.brandColor }}>
      <div className="frother-hero px-5 pt-10 pb-8">
        <Link to={`/venue/${slug}`} className="text-gray-500 text-sm mb-5 block font-bold">← Back</Link>
        <VenueBrand venue={venue} size="md" />
        <p className="mt-5 text-gray-900 font-black text-3xl leading-tight tracking-tight">
          Join rewards
        </p>
        <p className="text-gray-600 text-base font-bold mt-1">
          Buy {venue.loyaltyRule.stampsRequired}, get 1 free. No app required.
        </p>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto -mt-5">
        <div className="frother-card p-5">
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

            {error && (
              <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="frother-button w-full text-white text-base mt-2"
              style={{ backgroundColor: venue.brandColor }}
            >
              {submitting ? 'Joining...' : 'Join rewards'}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-5 font-semibold">
            Need help? Ask staff.
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
        className="frother-input px-4 py-3.5 text-base"
      />
    </div>
  )
}
