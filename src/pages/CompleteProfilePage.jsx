import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getVenue, getCustomer, completeProfile } from '../lib/dataService'
import VenueBrand from '../components/VenueBrand'

const AGE_RANGES = ['Under 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+', 'Prefer not to say']

const OFFER_CATEGORIES = [
  'Coffee', 'Breakfast', 'Lunch', 'Dinner', 'Kids',
  'Sweet Treats', 'Drinks', 'Steak Night', 'Happy Hour',
]

const VISIT_TIMES = [
  'Before 8am', '8–10am', '10am–12pm', '12–2pm', '2–5pm', 'After 5pm',
]

export default function CompleteProfilePage() {
  const { slug, customerId } = useParams()
  const navigate = useNavigate()
  const [venue, setVenue] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const [form, setForm] = useState({
    lastName: '',
    email: '',
    birthday: '',
    ageRange: '',
    suburb: '',
    postcode: '',
    offerCategories: [],
    preferredVisitTimes: [],
    emailConsent: false,
    smsConsent: false,
    privacyAccepted: false,
  })

  useEffect(() => {
    async function load() {
      const [v, c] = await Promise.all([getVenue(slug), getCustomer(customerId)])
      if (v && c) {
        // Already completed — redirect back
        if (c.profileStatus === 'full') {
          navigate(`/venue/${slug}/customer/${customerId}`, { replace: true })
          return
        }
        setVenue(v)
        setCustomer(c)
        // Pre-fill email if provided at quick join
        setForm(f => ({ ...f, email: c.email || '', lastName: c.lastName || '' }))
      }
      setLoading(false)
    }
    load()
  }, [slug, customerId, navigate])

  function toggleMulti(field, value) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter(v => v !== value)
        : [...f[field], value],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email.trim()) return setError('Email address is required')
    if (!form.privacyAccepted) return setError('Please accept the privacy policy to continue')

    setSubmitting(true)
    try {
      await completeProfile(
        customerId,
        form,
        venue.loyaltyRule.stampsRequired
      )
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) return null
  if (!venue || !customer) return null

  const required = venue.loyaltyRule.stampsRequired
  const rewardWasLocked = customer.stamps >= required

  if (done) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ backgroundColor: rewardWasLocked ? '#F59E0B' : venue.brandColor }}
      >
        <div className="text-7xl mb-5">{rewardWasLocked ? '🏆' : '✅'}</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {rewardWasLocked ? 'Reward unlocked!' : 'Profile complete!'}
        </h1>
        <p className="text-white/85 mb-8">
          {rewardWasLocked
            ? 'Show staff to redeem your free coffee.'
            : "You're all set. Thanks for completing your profile."}
        </p>
        <button
          onClick={() => navigate(`/venue/${slug}/customer/${customerId}`)}
          className="bg-white font-bold px-8 py-3.5 rounded-xl text-base"
          style={{ color: rewardWasLocked ? '#92400E' : venue.brandColor }}
        >
          {rewardWasLocked ? 'Show my reward' : 'Back to my card'}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen frother-shell" style={{ '--brand-color': venue.brandColor }}>
      <div className="frother-hero text-white px-5 pt-10 pb-7">
        <Link to={`/venue/${slug}/customer/${customerId}`} className="text-white/70 text-sm mb-4 block">
          ← Back
        </Link>
        <VenueBrand venue={venue} size="sm" />
        <p className="text-white font-black text-3xl mt-4 leading-tight tracking-tight">
          {rewardWasLocked ? '🔒 Unlock your free coffee' : 'Complete your profile'}
        </p>
        <p className="text-white/85 text-sm mt-2 font-semibold">
          Tell us a little more so we can send better offers, not boring spam.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 max-w-lg mx-auto space-y-5 pb-12 -mt-5">

        {/* Name */}
        <Section title="About you">
          <Field id="profile-last-name" label="Last name (optional)" type="text" placeholder="Rivera"
            value={form.lastName} onChange={v => setForm(f => ({ ...f, lastName: v }))} />
          <Field
            id="profile-email"
            label="Email"
            type="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={v => setForm(f => ({ ...f, email: v }))}
            required={!customer.email}
          />
          <Field id="profile-birthday" label="Birthday (optional)" type="date"
            value={form.birthday} onChange={v => setForm(f => ({ ...f, birthday: v }))} />
        </Section>

        {/* Age range */}
        <Section title="Age range (optional)">
          <ChipSelect
            options={AGE_RANGES}
            selected={form.ageRange ? [form.ageRange] : []}
            onToggle={v => setForm(f => ({ ...f, ageRange: f.ageRange === v ? '' : v }))}
            single
            brandColor={venue.brandColor}
          />
        </Section>

        {/* Location */}
        <Section title="Where are you based? (optional)">
          <div className="grid grid-cols-2 gap-3">
            <Field id="profile-suburb" label="Suburb" type="text" placeholder="Fitzroy"
              value={form.suburb} onChange={v => setForm(f => ({ ...f, suburb: v }))} />
            <Field id="profile-postcode" label="Postcode" type="text" placeholder="3065" inputMode="numeric"
              value={form.postcode} onChange={v => setForm(f => ({ ...f, postcode: v }))} />
          </div>
        </Section>

        {/* Offer categories */}
        <Section title="What do you love? (optional)">
          <ChipSelect
            options={OFFER_CATEGORIES}
            selected={form.offerCategories}
            onToggle={v => toggleMulti('offerCategories', v)}
            brandColor={venue.brandColor}
          />
        </Section>

        {/* Visit times */}
        <Section title="When do you usually visit? (optional)">
          <ChipSelect
            options={VISIT_TIMES}
            selected={form.preferredVisitTimes}
            onToggle={v => toggleMulti('preferredVisitTimes', v)}
            brandColor={venue.brandColor}
          />
        </Section>

        {/* Consents */}
        <Section title="Stay in the loop">
          <div className="space-y-3">
            <ConsentRow
              checked={form.emailConsent}
              onChange={v => setForm(f => ({ ...f, emailConsent: v }))}
              label="Send me email offers and updates"
            />
            <ConsentRow
              checked={form.smsConsent}
              onChange={v => setForm(f => ({ ...f, smsConsent: v }))}
              label="Send me SMS offers (max once a week)"
            />
            <ConsentRow
              checked={form.privacyAccepted}
              onChange={v => setForm(f => ({ ...f, privacyAccepted: v }))}
              label="I accept the privacy policy"
              required
            />
          </div>
        </Section>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="frother-button w-full text-white text-base"
          style={{ backgroundColor: venue.brandColor }}
        >
          {submitting
            ? 'Saving...'
            : rewardWasLocked
              ? 'Save and unlock my reward'
              : 'Save profile'}
        </button>
      </form>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="frother-card p-4 space-y-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  )
}

function Field({ id, label, type, placeholder, value, onChange, required, inputMode }) {
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
        inputMode={inputMode}
        className="frother-input px-4 py-3 text-sm"
      />
    </div>
  )
}

function ChipSelect({ options, selected, onToggle, brandColor, single = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`px-3 py-2 rounded-full text-sm font-bold border-2 transition-all ${
              active ? 'text-white border-transparent shadow-[2px_2px_0_#111827]' : 'bg-white border-gray-200 text-gray-700'
            }`}
            style={active ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function ConsentRow({ checked, onChange, label, required }) {
  const id = `profile-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`

  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        required={required}
        className="mt-0.5 w-5 h-5 rounded flex-shrink-0 cursor-pointer"
      />
      <span className="text-sm text-gray-700 leading-snug">
        {label}
        {required && <span aria-hidden="true" className="text-red-400 ml-0.5">*</span>}
      </span>
    </label>
  )
}
