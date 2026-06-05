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
            Froffers worth coming back for.
          </p>
          <p className="mt-2 text-base font-semibold text-gray-600">
            No apps. No lost cards. No counter chaos.
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

      <PilotLeadForm />

      {/* Two sides */}
      <section className="px-4 py-14 max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-2">
          Two sides. One simple system.
        </h2>
        <p className="text-center text-base font-medium text-gray-600 mb-10">
          Frother works for the customer walking in and the venue running the place.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Customer card */}
          <div className="frother-card p-8 bg-white flex flex-col">
            <span className="frother-public-kicker text-[10px] px-3 py-1 self-start">Customer</span>
            <h3 className="font-black text-2xl text-gray-900 mt-4 leading-tight">
              What customers see
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 flex-1">
              {[
                'Tap QR or NFC at the counter',
                'Join in seconds — name and mobile only',
                'Digital stamp card, right in their browser',
                'Claim rewards and Froffers when they hit the goal',
                'No app. No plastic card. No account drama.',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm font-medium text-gray-700">
                  <span className="mt-0.5 text-[#16A34A] font-black shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/venue/demo-cafe"
              className="frother-button bg-[#F4B84A] text-gray-900 mt-7 text-sm w-full"
            >
              Try customer view
            </Link>
          </div>

          {/* Venue card */}
          <div className="frother-card p-8 bg-white flex flex-col">
            <span className="frother-public-kicker text-[10px] px-3 py-1 self-start">Venue</span>
            <h3 className="font-black text-2xl text-gray-900 mt-4 leading-tight">
              What the venue sees
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 flex-1">
              {[
                'Staff look up customers by name or mobile',
                'Add stamps and redeem rewards from the staff dashboard',
                'Admin sets reward rules and runs Froffers',
                "Regulars Radar shows who's active, quiet, close to reward, or needs a nudge",
                'Built for cafes, pubs, restaurants and takeaways',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm font-medium text-gray-700">
                  <span className="mt-0.5 text-[#16A34A] font-black shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/admin/demo-cafe"
              className="frother-button bg-[#16A34A] text-[#FFF8EA] mt-7 text-sm w-full"
            >
              View business demo
            </Link>
          </div>
        </div>

        {/* How it flows */}
        <div className="mt-8 frother-card p-6 bg-white">
          <p className="text-center text-xs font-black text-gray-500 uppercase tracking-widest mb-6">
            How it flows
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center">
            {[
              ['1', 'Customer taps'],
              ['2', 'Staff adds stamps'],
              ['3', 'Regulars come back'],
              ['4', 'Venue sees who to nudge'],
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
                  <span className="text-gray-300 font-black text-2xl sm:mb-5 rotate-90 sm:rotate-0">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

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
