import { Link } from 'react-router-dom'
import PilotLeadForm from '../components/PilotLeadForm'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F1E4' }}>

      {/* Nav */}
      <nav
        className="px-6 py-4 border-b-2 border-gray-900"
        style={{ backgroundColor: '#F8F1E4' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <FrotherLogo />
          <div className="flex items-center gap-2">
            <Link
              to="/venue/demo-cafe"
              className="frother-button bg-[#F4B84A] text-gray-900 px-5 text-sm"
              style={{ minHeight: '42px' }}
            >
              See customer demo
            </Link>
            <Link
              to="/admin/demo-cafe"
              className="frother-button bg-white text-gray-900 px-4 text-sm hidden sm:inline-flex"
              style={{ minHeight: '42px' }}
            >
              Venue demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="frother-public-hero">
        <img
          src="/frother-hero.jpg"
          alt=""
          aria-hidden="true"
          className="frother-public-hero-image"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: [
              'linear-gradient(90deg,',
              '  rgba(255,248,234,0.06) 0%,',
              '  rgba(255,248,234,0.93) 24%,',
              '  rgba(255,248,234,0.93) 76%,',
              '  rgba(255,248,234,0.06) 100%',
              '),',
              'linear-gradient(180deg,',
              '  rgba(255,248,234,0.6) 0%,',
              '  rgba(255,248,234,0.2) 100%',
              ')',
            ].join(' '),
          }}
        />
        <div className="frother-public-hero-content px-5">
          <span className="frother-public-kicker">
            Cafes · Pubs · Restaurants · Takeaways
          </span>
          <h1 className="mt-5 text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tight text-gray-900">
            Tap in.<br />
            Stack stamps.<br />
            Froth on.
          </h1>
          <p className="mt-5 text-lg sm:text-xl font-black text-gray-900 leading-snug max-w-sm">
            Your stamp card, on your phone.
          </p>
          <p className="mt-2 text-base font-semibold text-gray-600">
            No app. No paper card. Staff can help.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/venue/demo-cafe"
              className="frother-button bg-[#F4B84A] text-gray-900 px-7 text-base"
            >
              See customer demo
            </Link>
            <Link
              to="/admin/demo-cafe"
              className="frother-button bg-[#FFF8EA] text-gray-900 px-7 text-base"
            >
              Venue demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── TWO ENTRY POINT CARDS ──────────────────────────── */}
      <section className="px-4 pt-12 pb-6 max-w-5xl mx-auto">
        <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">

          {/* Customer card — big, warm, simple */}
          <div
            className="frother-card p-8 sm:p-10 flex flex-col"
            style={{ backgroundColor: '#FFFBF0' }}
          >
            <span
              className="frother-public-kicker self-start"
              style={{ fontSize: '0.7rem' }}
            >
              Customer
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
              I am a customer
            </h2>
            <p className="mt-3 text-lg font-semibold text-gray-700 leading-relaxed">
              See your stamp card.
            </p>
            <p className="mt-2 text-base font-medium text-gray-500 leading-relaxed">
              Tap in, collect stamps, get a free one when your card is full.
              No app to download.
            </p>
            <div className="mt-auto pt-8">
              <Link
                to="/venue/demo-cafe"
                className="frother-button bg-[#F4B84A] text-gray-900 px-8 text-lg w-full sm:w-auto"
              >
                Open stamp card
              </Link>
            </div>
          </div>

          {/* Venue card — compact, clearly business */}
          <div className="frother-card p-7 bg-white flex flex-col">
            <span
              className="frother-public-kicker self-start"
              style={{ backgroundColor: '#111827', color: '#FFF8EA', fontSize: '0.7rem' }}
            >
              Venue
            </span>
            <h2 className="mt-5 text-2xl font-black text-gray-900 leading-tight">
              I run a venue
            </h2>
            <p className="mt-2 text-base font-medium text-gray-600 leading-relaxed">
              See how staff and owners use Frother.
            </p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {[
                'Staff find customers at the counter',
                'Owners see who is coming back',
                'No paper cards to manage',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm font-medium text-gray-700 leading-snug">
                  <span className="mt-0.5 text-[#16A34A] font-black shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-7 flex flex-col gap-2.5">
              <Link
                to="/admin/demo-cafe"
                className="frother-button bg-[#111827] text-[#FFF8EA] px-6 text-base w-full"
              >
                View venue demo
              </Link>
              <a
                href="#pilot-lead"
                className="frother-button bg-[#16A34A] text-[#FFF8EA] px-6 text-sm w-full"
              >
                Start a pilot
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Pilot lead form — venue owners only */}
      <PilotLeadForm />

      {/* Feature cards */}
      <section className="px-4 py-12 max-w-5xl mx-auto" id="features">
        <div className="grid gap-5 sm:grid-cols-3">
          <FeatureCard
            kicker="Loyalty"
            title="Tap-to-join loyalty"
            body="Customers tap or scan at the counter, join with name and mobile, and start collecting stamps."
          />
          <FeatureCard
            kicker="Specials"
            title="Froffers"
            body="Turn quiet times into simple offers that bring people back."
          />
          <FeatureCard
            kicker="Insights"
            title="Regulars Radar"
            body="See who is close to a reward, who has gone quiet, and who needs a nudge."
          />
        </div>
      </section>

      {/* Pilot pricing */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <div
          className="frother-card p-8 text-center"
          style={{ backgroundColor: '#111827' }}
        >
          <span className="frother-public-kicker">Frother Pilot</span>
          <h2
            className="mt-5 text-3xl lg:text-4xl font-black leading-tight"
            style={{ color: '#FFF8EA' }}
          >
            $499 setup. $99/month for pilot venues.
          </h2>
          <p
            className="mt-3 text-sm font-medium leading-relaxed max-w-md mx-auto"
            style={{ color: 'rgba(255,248,234,0.65)' }}
          >
            Includes a branded rewards page, QR and NFC setup, staff view,
            venue admin view, Froffers, Regulars Radar, basic staff training and first
            month support.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/venue/demo-cafe"
              className="frother-button bg-[#F4B84A] text-gray-900 px-8 text-base"
            >
              See customer demo
            </Link>
            <Link
              to="/admin/demo-cafe"
              className="frother-button px-8 text-base"
              style={{
                backgroundColor: 'transparent',
                borderColor: 'rgba(255,248,234,0.5)',
                boxShadow: '4px 4px 0 rgba(255,248,234,0.15)',
                color: '#FFF8EA',
              }}
            >
              View venue demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t-2 border-gray-900/20 px-6 py-6"
        style={{ backgroundColor: '#F8F1E4' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <FrotherLogo small />
          <p className="text-sm font-semibold text-gray-400">
            Cafes · Pubs · Restaurants · Takeaways
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ kicker, title, body }) {
  return (
    <div className="frother-card p-6 bg-white">
      <span className="frother-public-kicker text-[10px] px-3 py-1">{kicker}</span>
      <h3 className="font-black text-xl text-gray-900 leading-tight mt-4">{title}</h3>
      <p className="text-sm text-gray-600 font-medium leading-relaxed mt-2">{body}</p>
    </div>
  )
}

function FrotherLogo({ small = false }) {
  const markSize = small ? 'w-7 h-7' : 'w-9 h-9'
  const textSize = small ? 'text-lg' : 'text-2xl'
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${markSize} frother-logo-mark`} aria-hidden="true">
        <span className="frother-logo-letter" style={{ fontSize: small ? '1rem' : '1.35rem' }}>
          F
        </span>
      </div>
      <span className={`${textSize} frother-wordmark`}>Frother</span>
    </div>
  )
}
