import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getVenue, saveVenue } from '../lib/dataService'
import VenueBrand from '../components/VenueBrand'
import StatsTab from '../components/admin/StatsTab'
import FroffersTab from '../components/admin/FroffersTab'
import CustomersTab from '../components/admin/CustomersTab'
import SegmentsTab from '../components/admin/SegmentsTab'
import CampaignsTab from '../components/admin/CampaignsTab'

const TABS = [
  { id: 'stats',     label: 'Stats' },
  { id: 'members',   label: 'Members' },
  { id: 'segments',  label: 'Regulars Radar' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'froffers',  label: 'Froffers' },
  { id: 'settings',  label: 'Settings' },
]

export default function AdminPortal() {
  const { venueSlug } = useParams()
  const [venue, setVenue] = useState(null)
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [activeTab, setActiveTab] = useState('stats')

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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="px-5 pt-10 pb-6 bg-gray-900 text-white">
          <Link to={`/venue/${venueSlug}`} className="text-white/50 text-sm mb-4 block">← Venue</Link>
          <VenueBrand venue={venue} size="md" />
          <p className="text-white/60 text-sm mt-1">Admin Portal</p>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full max-w-xs">
            <h2 className="font-bold text-xl mb-5 text-center">Admin PIN</h2>
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
                className="w-full border border-gray-200 rounded-xl px-4 py-4 text-2xl text-center tracking-widest focus:outline-none mb-3"
                autoFocus
              />
              {pinError && <p className="text-red-500 text-sm text-center mb-3">{pinError}</p>}
              <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl">
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-5 pt-10 pb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <VenueBrand venue={venue} size="sm" />
            <p className="text-white/50 text-xs mt-0.5">Admin</p>
          </div>
          <button onClick={() => setAuthed(false)} className="text-white/40 text-xs">Sign out</button>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.id ? 'bg-white text-gray-900' : 'text-white/60'
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
        {activeTab === 'segments'  && <SegmentsTab venue={venue} />}
        {activeTab === 'campaigns' && <CampaignsTab venue={venue} />}
        {activeTab === 'froffers'  && <FroffersTab venue={venue} />}
        {activeTab === 'settings'  && <SettingsTab venue={venue} onSave={setVenue} />}
      </div>
    </div>
  )
}

// ── Settings (small enough to stay in the shell) ───────────────────────────────

function SettingsTab({ venue, onSave }) {
  const [form, setForm] = useState({
    name: venue.name,
    description: venue.description,
    brandColor: venue.brandColor,
    stampsRequired: venue.loyaltyRule.stampsRequired,
    rewardDescription: venue.loyaltyRule.rewardDescription,
  })
  const [saved, setSaved] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    const updated = {
      ...venue,
      name: form.name,
      description: form.description,
      brandColor: form.brandColor,
      loyaltyRule: {
        stampsRequired: Number(form.stampsRequired),
        rewardDescription: form.rewardDescription,
      },
    }
    await saveVenue(venue.id, updated)
    onSave(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const field = (key, label, placeholder, type = 'text') => (
    <div key={key}>
      <label htmlFor={`settings-${key}`} className="text-sm font-semibold text-gray-700 mb-1.5 block">{label}</label>
      <input id={`settings-${key}`} type={type} placeholder={placeholder} value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none" />
    </div>
  )

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {field('name', 'Venue name', 'Demo Cafe')}
      {field('description', 'Tagline', 'Your neighbourhood coffee spot')}

      <div>
        <label htmlFor="settings-brand-color" className="text-sm font-semibold text-gray-700 mb-1.5 block">Brand colour</label>
        <div className="flex items-center gap-3">
          <input id="settings-brand-color" type="color" value={form.brandColor}
            onChange={e => setForm(f => ({ ...f, brandColor: e.target.value }))}
            className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer" />
          <label htmlFor="settings-brand-color-text" className="sr-only">Brand colour hex value</label>
          <input id="settings-brand-color-text" type="text" value={form.brandColor}
            onChange={e => setForm(f => ({ ...f, brandColor: e.target.value }))}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none font-mono" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <p className="font-semibold text-sm text-gray-700">Loyalty rule</p>
        {field('stampsRequired', 'Stamps required', '9', 'number')}
        {field('rewardDescription', 'Reward description', 'Free coffee of your choice')}
      </div>

      <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl">
        {saved ? '✓ Saved!' : 'Save changes'}
      </button>
    </form>
  )
}
