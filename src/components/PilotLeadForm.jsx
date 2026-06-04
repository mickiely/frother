import { useState } from 'react'

export default function PilotLeadForm() {
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('submitting')

    const formData = new FormData(e.currentTarget)
    try {
      const response = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      })

      if (!response.ok) throw new Error('Form submission failed')
      e.currentTarget.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="pilot-lead" className="px-4 py-12 max-w-3xl mx-auto scroll-mt-6">
      <div className="frother-card p-5 sm:p-7">
        <div className="mb-5">
          <span className="frother-sticker frother-sticker-green text-[10px] px-2.5 py-1 mb-4">Pilot setup</span>
          <h2 className="font-black text-3xl sm:text-4xl leading-tight">Want your regulars frothing?</h2>
          <p className="text-sm sm:text-base text-gray-600 font-semibold leading-relaxed mt-3">
            Pilot Frother in your venue. We&apos;ll help set up the tap-to-join loyalty flow, Froffers, and Regulars Radar without turning your counter into tech support.
          </p>
          <p className="text-xs text-gray-500 font-black mt-3">
            No app downloads. No lost cards. No counter chaos.
          </p>
        </div>

        {status === 'success' ? (
          <div className="rounded-2xl border-2 border-gray-900 bg-[#F4B84A] p-4 shadow-[3px_3px_0_#111827]">
            <p className="font-black text-gray-900">
              Sweet. You&apos;re on the pilot list. We&apos;ll be in touch.
            </p>
          </div>
        ) : (
          <form
            name="frother-pilot"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input type="hidden" name="form-name" value="frother-pilot" />
            <p className="hidden">
              <label htmlFor="pilot-bot-field">
                Don&apos;t fill this out:
                <input id="pilot-bot-field" name="bot-field" tabIndex="-1" autoComplete="off" />
              </label>
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="pilot-venue-name" label="Venue name" name="venue-name" required />
              <Field id="pilot-contact-name" label="Contact name" name="contact-name" required />
              <Field id="pilot-mobile" label="Mobile" name="mobile" type="tel" required />
              <Field id="pilot-email" label="Email" name="email" type="email" required />
              <SelectField
                id="pilot-venue-type"
                label="Venue type"
                name="venue-type"
                required
                options={['Cafe', 'Pub', 'Restaurant', 'Takeaway', 'Other']}
              />
              <Field id="pilot-suburb" label="Suburb" name="suburb" required />
            </div>

            <SelectField
              id="pilot-current-loyalty"
              label="Current loyalty setup"
              name="current-loyalty-setup"
              options={['Paper stamp cards', 'Square Loyalty', 'Lightspeed / POS loyalty', 'No loyalty setup', 'Other']}
            />

            <fieldset>
              <legend className="block text-sm font-black text-gray-800 mb-2">Biggest problem</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  'Lost paper cards',
                  'Quiet days',
                  'Staff forget',
                  'No customer data',
                  'Hard to promote specials',
                  'Too much setup/admin',
                ].map(problem => (
                  <label key={problem} className="flex items-start gap-3 rounded-2xl border-2 border-gray-900/10 bg-[#FFF8EA] px-3 py-2.5 text-sm font-bold text-gray-700">
                    <input
                      type="checkbox"
                      name="biggest-problem"
                      value={problem}
                      className="mt-0.5 h-5 w-5 rounded border-gray-900 text-[#16A34A] focus:ring-[#16A34A]"
                    />
                    <span>{problem}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="pilot-notes" className="block text-sm font-black text-gray-800 mb-1.5">Notes (optional)</label>
              <textarea
                id="pilot-notes"
                name="notes"
                rows={4}
                className="frother-input min-h-[112px] px-4 py-3 text-base resize-y"
                placeholder="Tell us what you want Frother to help with."
              />
            </div>

            {status === 'error' && (
              <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                Something went wrong. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="frother-button w-full text-white text-base"
              style={{ backgroundColor: '#16A34A' }}
            >
              {status === 'submitting' ? 'Sending...' : 'Request pilot setup'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

function Field({ id, label, name, type = 'text', required = false }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-black text-gray-800 mb-1.5">
        {label}
        {required && <span aria-hidden="true" className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        className="frother-input px-4 py-3 text-base"
      />
    </div>
  )
}

function SelectField({ id, label, name, options, required = false }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-black text-gray-800 mb-1.5">
        {label}
        {required && <span aria-hidden="true" className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue=""
        className="frother-input px-4 py-3 text-base"
      >
        <option value="" disabled>Select one</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  )
}
