import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import StampCard from '../components/StampCard'
import { DEMO_KEY, DEMO_RULE, freshDemoCustomers, readDemoCustomers, searchDemoCustomers, updateDemoCustomer } from '../lib/demoLoyalty'

const button = 'frother-button px-4 py-3 text-sm'

export default function FrotherDemo() {
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'staff' ? 'staff' : 'customer'
  const [customers, setCustomers] = useState(() => {
    try { return readDemoCustomers(localStorage.getItem(DEMO_KEY)) } catch { return freshDemoCustomers() }
  })
  const [selectedId, setSelectedId] = useState('cust-1')
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const [storageWarning, setStorageWarning] = useState('')
  const [editing, setEditing] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const customer = customers.find(c => c.id === selectedId)
  const matches = searchDemoCustomers(customers, query)
  const required = DEMO_RULE.stampsRequired
  const earned = customer.stamps >= required
  const locked = earned && customer.profileStatus !== 'full'

  useEffect(() => {
    function sync(event) {
      if (event.key === DEMO_KEY) setCustomers(readDemoCustomers(event.newValue))
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  function save(next) {
    setCustomers(next)
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(next)); setStorageWarning('') }
    catch { setStorageWarning('Browser storage is unavailable. This demo will reset when you reload.') }
  }
  function update(action) {
    // Read the latest saved state so a stale tab does not undo another tab's purchase.
    let current = customers
    try { const stored = localStorage.getItem(DEMO_KEY); if (stored) current = readDemoCustomers(stored) } catch {}
    save(current.map(c => c.id === selectedId ? updateDemoCustomer(c, action) : c))
  }
  function choose(id) { setSelectedId(id); setEditing(false); setShowCard(false); setMessage('') }
  function switchView(next) { setParams({ view: next }); setEditing(false); setShowCard(false); setMessage('') }

  return <main className="min-h-screen p-4 sm:p-8" style={{ background: '#F8F1E4', color: '#111827' }}>
    <div className="max-w-5xl mx-auto">
      <Link to="/" className="underline font-bold">← FROTHER home</Link>
      <header className="frother-card bg-[#F4B84A] p-5 sm:p-8 mt-6">
        <div className="flex items-center gap-3"><img src="/frother-logo.png" alt="Frother mascot" width="64" height="64" className="w-16 h-16 object-contain shrink-0" /><p className="text-xs font-black uppercase tracking-wider">Demo Café · Interactive demonstration</p></div>
        <h1 className="text-3xl sm:text-5xl font-black mt-3">Tap. Stamp. Froth on.</h1>
        <p className="mt-3 font-semibold">Try both sides of the counter. No account needed.</p>
        <p className="text-sm mt-2">Fictional customers only. Changes stay in this browser. No real purchases, rewards, calls or SMS.</p>
      </header>
      <nav aria-label="Demo views" className="grid grid-cols-2 gap-3 my-6">
        {['customer', 'staff'].map(mode => <button key={mode} onClick={() => switchView(mode)} aria-pressed={view === mode}
          className={`${button} ${view === mode ? 'bg-[#16A34A] text-white' : 'bg-white'}`}>{mode === 'customer' ? 'Customer card' : 'Staff simulator'}</button>)}
      </nav>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <aside className="min-w-0">
          <div className="frother-card bg-white p-4">
            <h2 className="text-xl font-black">{view === 'staff' ? 'Find a customer' : 'Choose a sample customer'}</h2>
            <label htmlFor="demo-search" className="block text-sm font-bold mt-4 mb-2">Search by name or phone</label>
            <input id="demo-search" type="search" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Try Alex or 0255500100" className="frother-input px-3 py-3" />
            <p className="text-xs text-gray-600 mt-3">Alex: collecting · Jordan: profile needed · Morgan: reward ready · Riley: one away.</p>
            <ul className="mt-4 space-y-2 max-h-72 overflow-y-auto p-1 lg:max-h-none" aria-label="Sample customers">
              {matches.map(c => <li key={c.id}><button onClick={() => choose(c.id)} aria-pressed={selectedId === c.id}
                className={`w-full text-left border-2 border-gray-900 rounded-xl p-3 ${selectedId === c.id ? 'bg-[#F4B84A]' : 'bg-[#FFF8EA]'}`}>
                <span className="font-black block">{c.name} {c.lastName}</span>
                <span className="text-sm block">{c.phone}</span>
                <span className="text-xs font-bold block mt-1">{c.stamps} stamps · {c.stamps >= required ? c.profileStatus === 'full' ? 'Reward ready' : 'Profile needed' : `${required - c.stamps} to reward`}</span>
              </button></li>)}
            </ul>
            {matches.length === 0 && <p role="status" className="py-5 text-sm">No customers found. Try another name or phone.</p>}
          </div>
        </aside>
        <section className="min-w-0 space-y-4" aria-label="Selected customer">
          <div className="frother-card bg-white p-5">
            <p className="text-xs uppercase font-bold">{view === 'staff' ? 'Staff counter · Demo only' : 'Your sample card'}</p>
            <h2 className="text-3xl font-black mt-2 break-words">{customer.name} {customer.lastName}</h2>
            <p className="mt-1 text-sm">{customer.phone}</p>
            <p className="text-sm break-words">{customer.email || 'No email on this sample profile'}</p>
            {customer.suburb && <p className="text-sm">{customer.suburb}</p>}
            <p className="text-xs font-bold mt-3">{customer.profileStatus === 'full' ? 'Full profile' : 'Guest / quick profile'} · {customer.purchases} qualifying purchases · {customer.rewardsRedeemed} rewards redeemed</p>
            <button className="underline text-sm font-bold mt-3" onClick={() => setEditing(v => !v)}>{editing ? 'Cancel profile edit' : customer.profileStatus === 'full' ? 'View / edit demo profile' : 'Complete demo profile'}</button>
          </div>
          {editing && <DemoProfile key={customer.id} customer={customer} onSave={data => { update({ type: 'profile', ...data }); setEditing(false); setMessage('Demo profile saved. Earned rewards are now unlocked.') }} />}
          <StampCard stamps={customer.stamps} required={required} brandColor="#16A34A" rewardDescription={DEMO_RULE.rewardDescription}
            isRewardLocked={locked} rewardsRedeemed={customer.rewardsRedeemed} />
          {customer.stamps > required && <p className="text-sm font-bold">Total balance: {customer.stamps} stamps. Each redemption uses {required}; extra stamps stay on the card.</p>}
          {customer.profileStatus !== 'full' && (customer.purchases >= 3 || locked) && <div className="frother-card bg-amber-50 p-4">
            <h3 className="font-black">{locked ? 'Complete your profile to unlock this reward.' : 'Three purchases in. Make this card yours.'}</h3>
            <p className="text-sm mt-2">{locked ? 'Keep collecting stamps. A full profile is required before staff can redeem.' : 'You can keep collecting as a guest. Complete your profile before redeeming your first reward.'}</p>
            <button className={`${button} bg-[#F4B84A] mt-3 w-full`} onClick={() => setEditing(true)}>Add demo details</button>
          </div>}
          {view === 'staff' ? <div className="frother-card bg-white p-4">
            <h3 className="text-xl font-black">Confirm purchase, then add stamps</h3>
            <p className="text-sm mt-2">One coffee = one stamp. Each button records one qualifying purchase.</p>
            <div className="grid grid-cols-3 gap-2 my-4">{[1, 2, 3].map(n => <button key={n} className={`${button} bg-[#16A34A] text-white px-1`} onClick={() => { update({ type: 'stamp', count: n }); setMessage(`Added ${n} ${n === 1 ? 'stamp' : 'stamps'} for ${customer.name}.`) }}>Add {n}</button>)}</div>
            <button disabled={!earned || locked} className={`${button} bg-[#F4B84A] w-full disabled:opacity-40`} onClick={() => { update({ type: 'redeem' }); setMessage(`Reward redeemed for ${customer.name}. Extra stamps kept.`) }}>Redeem reward ({required} stamps)</button>
            <p className="text-xs mt-3">This is an open simulator. Real venue stamping requires staff authentication.</p>
          </div> : <div className="space-y-3">
            <button className={`${button} bg-[#F4B84A] w-full`} onClick={() => setShowCard(v => !v)}>{showCard ? 'Hide counter card' : 'Show my card to staff'}</button>
            {showCard && <div className="frother-card p-6 bg-[#111827] text-white text-center" role="region" aria-label="Counter card">
              <p className="text-xs uppercase">Demo Café · Sample customer</p><p className="font-black text-3xl mt-3">{customer.name} {customer.lastName}</p><p className="mt-2">{customer.phone}</p>
              <p className="text-4xl font-black my-4">{customer.stamps} stamps</p><p>{earned ? locked ? 'Profile needed before redemption' : 'Reward ready — staff can redeem' : `${required - customer.stamps} to your free coffee`}</p>
            </div>}
            <button className="underline text-sm font-bold" onClick={() => switchView('staff')}>Try staff stamping for {customer.name} →</button>
          </div>}
          <p role="status" aria-live="polite" className="font-bold text-sm min-h-6">{message}</p>
          {storageWarning && <p role="alert" className="text-sm">{storageWarning}</p>}
        </section>
      </div>
      <footer className="mt-8 pb-6 border-t-2 border-gray-900 pt-5">
        <button className="underline font-bold text-sm" onClick={() => { save(freshDemoCustomers()); choose('cust-1'); setQuery(''); setMessage('All sample customers reset.') }}>Reset demonstration</button>
        <p className="text-xs text-gray-600 mt-3">Public walkthrough only. NFC / QR entry and owner administration are separate venue features; this simulator does not verify a live venue setup.</p>
      </footer>
    </div>
  </main>
}

function DemoProfile({ customer, onSave }) {
  return <form className="frother-card bg-white p-5 space-y-3" onSubmit={e => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    onSave({ lastName: data.get('lastName'), suburb: data.get('suburb') })
  }}>
    <h3 className="text-xl font-black">Demo profile · {customer.name}</h3>
    <p className="text-sm">Use fictional details only. This saves on your device and does not create an account or subscribe anyone to marketing.</p>
    <label className="block text-sm font-bold">Surname<input name="lastName" required maxLength={60} defaultValue={customer.lastName || 'Sample'} className="frother-input px-3 py-3 mt-1" /></label>
    <label className="block text-sm font-bold">Suburb<input name="suburb" maxLength={80} defaultValue={customer.suburb || 'Berry'} className="frother-input px-3 py-3 mt-1" /></label>
    <button type="submit" className={`${button} bg-[#16A34A] text-white w-full`}>Save demo profile</button>
  </form>
}
