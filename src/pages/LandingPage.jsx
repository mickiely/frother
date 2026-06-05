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
            <a
              href="#pilot-lead"
              className="frother-button bg-[#16A34A] text-[#FFF8EA] px-4 text-sm hidden sm:inline-flex"
              style={{ minHeight: '42px' }}
            >
              Start a pilot
            </a>
            <Link
              to="/venue/demo-cafe"
              className="frother-button bg-[#F4B84A] text-gray-900 px-5 text-sm"
              style={{ minHeight: '42px' }}
            >
              See demo
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
            <a
              href="#pilot-lead"
              className="frother-button bg-[#16A34A] text-[#FFF8EA] px-7 text-base"
            >
              Start a pilot
            </a>
            <Link
              to="/venue/demo-cafe"
              className="frother-button bg-[#FFF8EA] text-gray-900 px-7 text-base"
            >
              See demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOR CUSTOMERS ──────────────────────────────────── */}
      <section className="px-4 pt-16 pb-6 max-w-5xl mx-auto">
        <span
          className="frother-public-kicker"
          style={{ fontSize: '0.7rem' }}
        >
          For customers
        </span>
        <h2 className="mt-4 text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
          For customers
        </h2>
        <p className="mt-2 text-base font-semibold text-gray-600 max-w-lg leading-relaxed">
          Like a paper stamp card, but harder to lose.
        </p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            'Tap the counter sign',
            'Enter your name and mobile',
            'See your stamp card',
            'Collect stamps when you buy',
            'Show staff when your reward is ready',
          ].map(item => (
            <li
              key={item}
              className="frother-card p-5 flex items-start gap-4"
              style={{ backgroundColor: '#FFFBF0' }}
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[#16A34A] font-black border-2 border-gray-900 text-base bg-white"
                style={{ boxShadow: '2px 2px 0 #111827' }}
              >
                ✓
              </span>
              <span className="text-base font-bold text-gray-900 leading-snug pt-0.5">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Link
            to="/venue/demo-cafe/join"
            className="frother-button bg-[#F4B84A] text-gray-900 px-8 text-base"
          >
            Try customer view
          </Link>
        </div>
      </section>

      {/* ── FOR STAFF ──────────────────────────────────────── */}
      <section className="px-4 pt-6 pb-4 max-w-5xl mx-auto">
        <div className="frother-card p-6 sm:p-8 bg-white">
          <span
            className="frother-public-kicker"
            style={{ backgroundColor: '#16A34A', color: '#FFF8EA', fontSize: '0.7rem' }}
          >
            For staff
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
            For staff
          </h2>
          <p className="mt-1.5 text-base font-semibold text-gray-600 leading-relaxed">
            The counter stays simple.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              'Find a customer by name or mobile',
              'Add a stamp',
              'Redeem a reward',
              'Help anyone who gets stuck',
            ].map(item => (
              <li key={item} className="flex items-start gap-2.5 text-base font-medium text-gray-800 leading-snug">
                <span className="mt-0.5 text-[#16A34A] font-black shrink-0 text-lg">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <Link
              to="/staff/demo-cafe"
              className="frother-button bg-[#16A34A] text-[#FFF8EA] px-7 text-base"
            >
              View staff demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOR VENUES ─────────────────────────────────────── */}
      <section className="px-4 pt-4 pb-14 max-w-5xl mx-auto">
        <div className="frother-card p-6 sm:p-8 bg-white">
          <span
            className="frother-public-kicker"
            style={{ backgroundColor: '#111827', color: '#FFF8EA', fontSize: '0.7rem' }}
          >
            For venues
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
            For venues
          </h2>
          <p className="mt-1.5 text-base font-semibold text-gray-600 leading-relaxed max-w-xl">
            The business sees the useful bits without making customers do extra work.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              'See who is coming back',
              'See who has a reward ready',
              'Spot quiet regulars',
              'Update simple offers',
              'Keep paper-card regulars moving to phone cards',
            ].map(item => (
              <li key={item} className="flex items-start gap-2.5 text-base font-medium text-gray-800 leading-snug">
                <span className="mt-0.5 text-[#16A34A] font-black shrink-0 text-lg">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <Link
              to="/admin/demo-cafe"
              className="frother-button bg-[#111827] text-[#FFF8EA] px-7 text-base"
            >
              View business demo
            </Link>
          </div>
        </div>
      </section>

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
              See demo
            </Link>
            <Link
              to="/venue/demo-cafe/join"
              className="frother-button px-8 text-base"
              style={{
                backgroundColor: 'transparent',
                borderColor: 'rgba(255,248,234,0.5)',
                boxShadow: '4px 4px 0 rgba(255,248,234,0.15)',
                color: '#FFF8EA',
              }}
            >
              Try the join flow
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
