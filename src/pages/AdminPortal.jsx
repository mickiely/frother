import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getVenue } from '../lib/dataService'
import VenueBrand from '../components/VenueBrand'
import StatsTab from '../components/admin/StatsTab'
import FroffersTab from '../components/admin/FroffersTab'
import CustomersTab from '../components/admin/CustomersTab'
import SegmentsTab from '../components/admin/SegmentsTab'

const TABS = [
  { id: 'members',   label: 'Customers' },
  { id: 'rewards',   label: 'Rewards ready' },
  { id: 'stats',     label: 'Recent stamps' },
  { id: 'segments',  label: 'Quiet regulars' },
  { id: 'froffers',  label: 'Offers' },
]

export default function AdminPortal() {
  const { venueSlug } = useParams()
  const [venue, setVenue] = useState(null)
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [activeTab, setActiveTab] = useState('members')

  useEffect(() => {
    getVenue(venueSlug).then(setVenue)
  }, [venueSlug])

  function handlePin(e) {
    e.preventDefault()
    if (!venue) return
    if (pin === venue.adminPin) {
      setAuthed(true)
    } else {
      setPinError('Wrong PIN.')
      setPin('')
    }
  }

  if (!venue) return null

  if (!authed) {
    return (
      <div className="min-h-screen frother-shell flex flex-col">
        <div className="px-5 pt-10 pb-6 frother-admin-hero">
          <Link to={`/venue/${venueSlug}`} className="text-gray-500 text-sm mb-4 block font-bold">← Venue</Link>
          <VenueBrand venue={venue} size="md" />
          <p className="text-gray-900 font-black text-xl mt-3">Venue view</p>
          <p className="text-gray-500 text-sm font-medium mt-1">See what is happening behind the counter.</p>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="frother-card p-6 w-full max-w-xs">
            <h2 className="font-black text-2xl mb-5 text-center">Admin PIN</h2>
            <form onSubmit={handlePin}>
              <label htmlFor="admin-pin" className="sr-only">Admin PIN</label>
              <input
                id="admin-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={e => { setPin(e.target.value); setPinError('') }}
                placeholder="Enter PIN"
                className="frother-input px-4 py-4 text-2xl text-center tracking-widest mb-3"
                autoFocus
              />
              {pinError && <p className="text-red-500 text-sm text-center mb-3">{pinError}</p>}
              <button type="submit" className="frother-button w-full bg-gray-900 text-white">
                Enter
              </button>
            </form>
            <p className="text-xs text-gray-400 text-center mt-4">Demo PIN: 9999</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen frother-shell">
      <div className="frother-admin-hero px-5 pt-10 pb-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <VenueBrand venue={venue} size="sm" />
            <p className="text-gray-900 font-black text-base mt-1.5">Venue view</p>
          </div>
          <button onClick={() => setAuthed(false)} className="text-gray-500 text-xs font-bold">Sign out</button>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.id ? 'bg-white text-gray-900 border-2 border-gray-900 shadow-[2px_2px_0_#16A34A]' : 'text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto">
        {activeTab === 'stats'     && <StatsTab venue={venue} />}
        {activeTab === 'members'   && <CustomersTab venue={venue} />}
        {activeTab === 'rewards'   && <SegmentsTab venue={venue} />}
        {activeTab === 'segments'  && <SegmentsTab venue={venue} />}
        {activeTab === 'froffers'  && <FroffersTab venue={venue} />}
      </div>
    </div>
  )
}
