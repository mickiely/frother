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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <FrotherLogo />
          <Link
            to="/venue/demo-cafe"
            className="frother-button bg-[#F4B84A] text-gray-900 px-5 text-sm"
            style={{ minHeight: '42px' }}
          >
            See demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="frother-public-hero">
        {/* Illustrated background */}
        <img
          src="/frother-hero.jpg"
          alt=""
          aria-hidden="true"
          className="frother-public-hero-image"
        />
        {/* Cream centre overlay — wider than the venue page so illustration shows at edges */}
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
        {/* Content */}
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
            Customers tap the counter sign and get a simple stamp card on their phone.
          </p>
          <p className="mt-3 text-base font-semibold text-gray-700 leading-relaxed max-w-md">
            Venues keep the old-school reward, but finally see who&apos;s coming back.
          </p>
          <p className="mt-3 text-base font-black text-gray-900">
            Buy 9. Get 1 free. No app. No lost cards.
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

      {/* Two sides */}
      <section className="px-4 pt-14 pb-10 max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-2">
          Two sides. One simple system.
        </h2>
        <p className="text-center text-base font-medium text-gray-600 mb-10">
          One counter sign. One old-school reward. Two very plain views.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Customer card — warm, friendly, non-technical */}
          <div
            className="frother-card p-8 flex flex-col"
            style={{ backgroundColor: '#FFFBF0' }}
          >
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
              What the customer sees
            </p>
            <span className="frother-public-kicker text-[10px] px-3 py-1 self-start">Customer side</span>
            <h3 className="font-black text-2xl text-gray-900 mt-4 leading-tight">
              Customer side
            </h3>
            <p className="mt-1.5 text-sm font-semibold text-gray-500 leading-snug">
              A stamp card on their phone.
            </p>
            <p className="mt-4 text-3xl font-black text-gray-900 leading-none">
              Buy 9. Get 1 free.
            </p>

            <div className="mt-5 rounded-3xl border-2 border-gray-900 bg-[#FFF8EA] p-5 text-center shadow-[4px_4px_0_#111827]">
              <p className="text-2xl font-black text-gray-900 leading-none">BUY 9, GET 1 FREE</p>
              <div className="mt-4 mx-auto grid h-24 w-24 place-items-center rounded-2xl border-2 border-dashed border-gray-900 bg-white">
                <span className="text-3xl font-black text-[#16A34A]">Tap</span>
              </div>
              <p className="mt-4 text-sm font-black text-gray-900">NO APP REQUIRED</p>
              <p className="mt-1 text-xs font-bold text-gray-500">Staff can help</p>
            </div>

            <ul className="mt-5 flex flex-col gap-3 flex-1">
              {[
                'Tap the sign',
                'Enter name + mobile',
                'See stamp card',
                'Staff add stamps',
                'Redeem when full',
              ].map((item, index) => (
                <li key={item} className="flex items-start gap-3 text-base font-black text-gray-900 leading-snug">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-gray-900 bg-[#F4B84A] text-xs">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm font-black text-gray-600">
              No app. No password. Staff can look them up.
            </p>
            <Link
              to="/venue/demo-cafe/join"
              className="frother-button bg-[#F4B84A] text-gray-900 mt-8 text-sm w-full"
            >
              Try customer view
            </Link>
          </div>

          {/* Venue card — operational, still friendly */}
          <div className="frother-card p-8 bg-white flex flex-col">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
              What the venue sees
            </p>
            <span
              className="frother-public-kicker text-[10px] px-3 py-1 self-start"
              style={{ backgroundColor: '#16A34A', color: '#FFF8EA', borderColor: '#111827' }}
            >
              Venue side
            </span>
            <h3 className="font-black text-2xl text-gray-900 mt-4 leading-tight">
              Venue side
            </h3>
            <p className="mt-1.5 text-sm font-semibold text-gray-500 leading-snug">
              The same simple reward, with better visibility.
            </p>
            <ul className="mt-5 flex flex-col gap-3 flex-1">
              {[
                'Staff look up customers',
                'Add stamps at the counter',
                'See who is close to a reward',
                'Spot quiet regulars',
                'Send better offers later',
              ].map((item, index) => (
                <li key={item} className="flex items-start gap-3 text-base font-bold text-gray-800 leading-snug">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-gray-900 bg-[#16A34A] text-xs font-black text-[#FFF8EA]">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm font-black text-gray-600">
              Customers see the simple card. You see the useful bits.
            </p>
            <Link
              to="/admin/demo-cafe"
              className="frother-button bg-[#16A34A] text-[#FFF8EA] mt-8 text-sm w-full"
            >
              View business demo
            </Link>
          </div>
        </div>

        {/* How it works strip */}
        <div className="mt-6 frother-card p-6 bg-white">
          <p className="text-center text-xs font-black text-gray-500 uppercase tracking-widest mb-6">
            How it works
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center">
            {[
              ['1', 'Customer taps'],
              ['2', 'Staff stamps'],
              ['3', 'Reward gets earned'],
              ['4', 'Venue knows who to nudge'],
            ].map(([num, label], i, arr) => (
              <div key={num} className="flex flex-col sm:flex-row items-center">
                <div className="flex flex-col items-center px-5 py-2">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center font-black text-gray-900 text-sm border-2 border-gray-900"
                    style={{ backgroundColor: '#F4B84A', boxShadow: '3px 3px 0 #111827' }}
                  >
                    {num}
                  </span>
                  <span className="mt-2 text-sm font-bold text-gray-800 text-center leading-tight max-w-[90px]">
                    {label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <span className="text-gray-300 font-black text-2xl sm:mb-5 rotate-90 sm:rotate-0">
                    →
                  </span>
                )}
              </div>
            ))}
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
            body="Customers scan a QR or tap NFC, join with name and mobile, and start collecting stamps."
          />
          <FeatureCard
            kicker="Specials"
            title="Froffers"
            body="Turn quiet times into targeted specials people actually come back for."
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
            Includes a branded rewards page, QR/NFC tap-to-join setup, staff dashboard,
            admin dashboard, Froffers, Regulars Radar, basic staff training and first
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
          <div className="flex gap-5 text-sm font-bold text-gray-500">
            <Link to="/staff/demo-cafe" className="hover:text-gray-700 transition-colors">
              Staff
            </Link>
            <Link to="/admin/demo-cafe" className="hover:text-gray-700 transition-colors">
              Admin
            </Link>
          </div>
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
