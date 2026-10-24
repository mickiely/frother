import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import LinkQr from '../components/LinkQr'
import NfcRegistry from '../components/NfcRegistry'
import { supabase } from '../lib/supabase'
import { cardOf, claimGuest, client, getGuestCard, getMyMembership, getMyStaffAccess, getPilotMembers, getPilotVenue, loyaltyAction, updateConsent } from '../lib/pilotService'
import { clearGuestKey, existingGuestKey, getOrCreateGuestKey, saveGuestKey } from '../lib/guestStorage'

export default function PilotPage({ staffMode = false }) {
  const { slug } = useParams()
  const [venue, setVenue] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recovery, setRecovery] = useState(false)
  useEffect(() => {
    let active = true
    setLoading(true); setError(''); setVenue(null)
    Promise.all([getPilotVenue(slug), client().auth.getSession()]).then(([v, session]) => {
      if (session.error) throw session.error
      if (active) { setVenue(v); setUser(session.data.session?.user || null) }
    }).catch(err => { if (active) setError(err.message) }).finally(() => { if (active) setLoading(false) })
    const listener = supabase?.auth.onAuthStateChange((event, session) => {
      if (active) { setUser(session?.user || null); if (event === 'PASSWORD_RECOVERY') setRecovery(true) }
    })
    return () => { active = false; listener?.data.subscription.unsubscribe() }
  }, [slug])
  return <main className="min-h-screen frother-shell pb-12" style={{ '--brand-color': venue?.brand_color || '#16A34A' }}>
    <header className="frother-hero px-5 pt-8 pb-10"><div className="max-w-lg mx-auto">
      <Link to="/" className="font-black tracking-tight text-3xl">FROTHER.</Link>
      <p className="text-xs font-black uppercase tracking-widest mt-3">{staffMode ? 'Staff counter' : 'Tap. Collect. Claim.'}</p>
      <h1 className="text-3xl font-black mt-2">{venue?.name || 'Your regular spot.'}</h1>
      <p className="font-semibold mt-2">{staffMode ? 'Confirm the purchase. Add a stamp. Keep them coming back.' : 'Start collecting now. Add your details when your first reward is ready.'}</p>
    </div></header>
    <div className="max-w-lg mx-auto px-4 -mt-5 space-y-4">
      {error && <Notice error>{error}</Notice>}
      {loading ? <section className="frother-card p-5" role="status">Opening venue…</section> : !venue ? <section className="frother-card p-5"><h2 className="font-black text-xl">Pilot unavailable</h2><p>Check your venue link or try again shortly.</p></section> : recovery ? <AccountPanel slug={slug} recovery onRecovered={() => setRecovery(false)} /> : staffMode ? <StaffCounter key={venue.id + (user?.id || '')} venue={venue} user={user} /> : <CustomerCard key={venue.id + (user?.id || '')} venue={venue} user={user} />}
      <nav className="flex justify-between gap-4 text-sm font-bold px-2"><Link to={`/pilot/${slug}${staffMode ? '' : '/staff'}`}>{staffMode ? 'Customer page' : 'Staff counter'}</Link><Link to="/venue/demo-cafe">Sample demo</Link></nav>
      <p className="text-xs text-gray-600 px-2">Pilot · Staff-issued stamps. No Wallet, location reminders, automated campaigns or POS connection. {slug === 'pilot-cafe' ? 'Test venue: rewards have no product or cash value.' : ''}</p>
    </div>
  </main>
}

function CustomerCard({ venue, user }) {
  const [member, setMember] = useState(null)
  const [token, setToken] = useState('')
  const [registered, setRegistered] = useState(false)
  const [otherCard, setOtherCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const mounted = useRef(true)
  const preferRegistered = useRef(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showClaim, setShowClaim] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [restore, setRestore] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', emailConsent: false, smsConsent: false })
  const refresh = useCallback(async () => {
    const saved = user ? await getMyMembership(venue.id, user.id) : null
    if (!mounted.current) return
    if (saved) {
      const oldKey = existingGuestKey(venue.id)
      const guest = oldKey ? await getGuestCard(venue.id, oldKey, false).catch(err => {
        if (err.message?.includes('This card is registered.')) return null
        throw err // A failed request must never discard a guest's recovery key.
      }) : null
      if (!mounted.current) return
      if (guest && guest.id !== saved.id && cardOf(guest)?.stamps > 0) {
        if (preferRegistered.current) { setMember(saved); setRegistered(true); setOtherCard(null); return }
        setMember(guest); setRegistered(false); setToken(oldKey); setOtherCard(saved)
        setMessage('This browser has a guest card with stamps as well as your registered card. Both are kept. Ask staff for help combining them.')
        return
      }
      setMember(saved); setRegistered(true); setOtherCard(null); clearGuestKey(venue.id); setToken(''); return
    }
    const key = getOrCreateGuestKey(venue.id)
    const guest = await getGuestCard(venue.id, key, true)
    if (mounted.current) {
      setToken(key); setMember(guest); setRegistered(false)
      if (user && cardOf(guest)?.stamps >= venue.stamps_required) setShowClaim(true)
    }
  }, [venue.id, user?.id])
  useEffect(() => {
    mounted.current = true
    refresh().catch(err => { if (mounted.current) setError(err.message) }).finally(() => { if (mounted.current) setLoading(false) })
    return () => { mounted.current = false }
  }, [refresh])
  useEffect(() => {
    const check = () => {
      if (document.visibilityState === 'visible' && !lock.current) refresh().catch(() => {})
    }
    const timer = window.setInterval(check, 15000)
    window.addEventListener('focus', check)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', check) }
  }, [refresh])
  async function run(task) {
    if (lock.current) return
    lock.current = true; setBusy(true); setError(''); setMessage('')
    try { await task() } catch (err) { setError(err.message) }
    finally { lock.current = false; if (mounted.current) setBusy(false) }
  }
  const ready = (cardOf(member)?.stamps || 0) >= venue.stamps_required
  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  return <>
    {error && <Notice error>{error}</Notice>}{message && <Notice>{message}</Notice>}
    {otherCard && <button className="frother-button bg-white text-gray-900 w-full" onClick={() => { preferRegistered.current = true; setMember(otherCard); setRegistered(true); setOtherCard(null); setShowClaim(false) }}>Open my registered card instead</button>}
    {loading ? <section className="frother-card p-5" role="status">Opening your saved stamp card…</section> : member && <section className="frother-card p-5 space-y-4">
      <h2 className="font-black text-2xl">{registered ? `Hey, ${member.name}.` : 'Your stamp card is open.'}</h2>
      <Card venue={venue} member={member} />
      <div className="rounded-xl border-2 border-gray-900 bg-white p-4 text-center"><p className="text-xs font-black uppercase">Show staff your card number</p><p className="font-black text-xl tracking-wider mt-1">{member.card_code}</p></div>
      <details className="border-2 rounded-xl p-3 text-center"><summary className="font-bold cursor-pointer">Show QR for staff</summary><LinkQr url={`${window.location.origin}/pilot/${venue.slug}/staff?card=${encodeURIComponent(member.card_code)}`} label="Staff lookup QR — no private recovery key" /><p className="text-xs">Staff scan this with their device camera to open your card in the counter. Staff sign-in is still required.</p></details>
      <p className="font-semibold text-sm">Staff confirm your purchase and add stamps. Tapping the sign never awards stamps.</p>
      <button disabled={busy} onClick={() => run(refresh)} className="frother-button w-full bg-green-700 text-white disabled:opacity-40">Refresh my stamps</button>
      {!registered && <>
        <p className="text-sm font-semibold">No registration to collect. Your name, mobile and verified email are required to claim your first reward. Marketing is optional.</p>
        {ready && <button disabled={busy} onClick={() => setShowClaim(true)} className="frother-button w-full bg-yellow-300 text-gray-900">Complete details to claim</button>}
        <details className="border-t pt-3"><summary className="font-bold text-sm cursor-pointer">Keep or recover this guest card</summary>
          <p className="text-sm mt-3">This card is saved in this browser. Before registering, keep your private recovery key somewhere safe. Clearing browser data or changing phones without that key can lose access. Your visible card number cannot recover or claim the card.</p>
          <button className="underline text-sm font-bold mt-3" onClick={() => run(async () => { await navigator.clipboard.writeText(token); setMessage('Recovery key copied. Keep it private: anyone with it can open this guest card.') })}>Copy private recovery key</button>
        </details>
      </>}
      {registered && <ConsentEditor key={member.id + member.consent_updated_at} member={member} busy={busy} onSave={(email, sms) => run(async () => { await updateConsent(member.id, email, sms); await refresh(); setMessage('Preferences saved. Rewards are unaffected.') })} />}
    </section>}
    {!registered && !loading && <details className="frother-card p-5"><summary className="font-bold cursor-pointer">Restore a guest card</summary><form className="space-y-3 mt-4" onSubmit={e => { e.preventDefault(); run(async () => {
      const key = restore.trim().toLowerCase()
      if (!/^[a-f0-9]{64}$/.test(key)) throw new Error('Enter your full 64-character recovery key.')
      const restored = await getGuestCard(venue.id, key, false)
      saveGuestKey(venue.id, key); setToken(key); setMember(restored); setShowClaim(false); setRestore(''); setMessage('Your guest card is restored.')
    }) }}><Input label="Private recovery key" type="password" value={restore} onChange={e => setRestore(e.target.value)} autoComplete="off" /><button disabled={busy} className="frother-button bg-gray-900 text-white w-full">Restore card</button></form></details>}
    {!registered && ready && showClaim && <>
      {!user ? <AccountPanel slug={venue.slug} claim /> : <section className="frother-card p-5 space-y-4">
        <h2 className="font-black text-2xl">Complete details. Claim your reward.</h2>
        <p className="text-sm">Verified account: <strong className="break-all">{user.email}</strong></p>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); run(async () => {
          await claimGuest(venue.id, token, form); clearGuestKey(venue.id); await refresh(); setShowClaim(false); setMessage('Details saved. Your reward is unlocked—show staff to redeem it.')
        }) }}>
          <Input label="First name" name="name" value={form.name} onChange={change} maxLength={80} autoComplete="given-name" />
          <Input label="Mobile" name="phone" value={form.phone} onChange={change} type="tel" autoComplete="tel" />
          <p className="text-sm text-gray-600">Your name, mobile and verified email link this card to your account and allow staff to find it. FROTHER stores membership and loyalty activity in its Australian database. Authorised venue staff can see your membership. Mobile is for lookup, not verified identity or account recovery.</p>
          <p className="font-bold text-sm">Offers are optional. Your reward unlocks with both boxes unchecked.</p>
          <Check label="Email offers (optional)" name="emailConsent" checked={form.emailConsent} onChange={change} />
          <Check label="SMS offers (optional)" name="smsConsent" checked={form.smsConsent} onChange={change} />
          <button disabled={busy} className="frother-button bg-yellow-300 text-gray-900 w-full disabled:opacity-40">{busy ? 'Saving…' : 'Save details and unlock reward'}</button>
        </form>
      </section>}
    </>}
    {!registered && !user && <section className="frother-card p-5"><button onClick={() => setShowLogin(v => !v)} className="underline font-bold text-sm">Already registered? Recover your card</button>{showLogin && <div className="mt-4"><AccountPanel slug={venue.slug} /></div>}</section>}
    {user && <SessionBar user={user} />}
  </>
}

function AccountPanel({ slug, claim = false, recovery = false, onRecovered }) {
  const [mode, setMode] = useState(claim ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  async function submit(e) {
    e.preventDefault(); if (lock.current) return
    lock.current = true; setBusy(true); setError(''); setMessage('')
    try {
      let response
      const redirectTo = `${window.location.origin}/pilot/${slug}`
      if (recovery) response = await client().auth.updateUser({ password })
      else if (mode === 'signup') response = await client().auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectTo } })
      else if (mode === 'reset') response = await client().auth.resetPasswordForEmail(email.trim(), { redirectTo })
      else response = await client().auth.signInWithPassword({ email: email.trim(), password })
      if (response.error) throw response.error
      if (recovery) { onRecovered(); return }
      if (mode === 'signup' && !response.data.session) setMessage('Check your email to verify your account. Then return here, sign in, and complete your details. Keep this browser or your recovery key so your stamps stay linked.')
      if (mode === 'reset') setMessage('If the account exists, a recovery email will arrive. Check spam too.')
      setPassword('')
    } catch (err) { setError(err.message) }
    finally { lock.current = false; setBusy(false) }
  }
  return <section className="frother-card p-5 space-y-4">
    <h2 className="font-black text-2xl">{recovery ? 'Choose a new password' : mode === 'signup' ? 'Your reward is earned.' : mode === 'reset' ? 'Recover your account' : 'Sign in'}</h2>
    <p className="text-sm">{claim ? 'First, verify your email to protect your earned stamps. Then add your name and mobile to unlock the reward. You only do this once.' : 'Use your registered email and password. Staff need individual venue permission.'}</p>
    {error && <Notice error>{error}</Notice>}{message && <Notice>{message}</Notice>}
    <form className="space-y-4" onSubmit={submit}>
      {!recovery && <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />}
      {(mode !== 'reset' || recovery) && <Input label="Password" type="password" minLength={recovery || mode === 'signup' ? 12 : 1} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'signup' || recovery ? 'new-password' : 'current-password'} />}
      {(mode === 'signup' || recovery) && <p className="text-sm text-gray-600">Use at least 12 characters.</p>}
      <button disabled={busy} className="frother-button bg-gray-900 text-white w-full disabled:opacity-40">{busy ? 'Please wait…' : recovery ? 'Save password' : mode === 'signup' ? 'Create account to verify email' : mode === 'reset' ? 'Send recovery email' : 'Sign in'}</button>
    </form>
    {!recovery && <div className="flex flex-wrap gap-4 text-sm font-bold">
      {claim && <button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setMessage('') }}>{mode === 'signup' ? 'Already have an account? Sign in' : 'Create an account'}</button>}
      <button onClick={() => { setMode(mode === 'reset' ? 'login' : 'reset'); setError(''); setMessage('') }}>{mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}</button>
    </div>}
  </section>
}

function StaffCounter({ venue, user }) {
  const [searchParams] = useSearchParams()
  const [staff, setStaff] = useState(null)
  const [members, setMembers] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState(searchParams.get('card') || '')
  const [quantity, setQuantity] = useState('1')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const lock = useRef(false)
  const pending = useRef(null)
  const mounted = useRef(true)
  const refresh = useCallback(async () => {
    if (!user) return
    const access = await getMyStaffAccess(venue.id, user.id)
    const rows = access ? await getPilotMembers(venue.id) : []
    if (mounted.current) { setStaff(access); setMembers(rows) }
  }, [venue.id, user?.id])
  useEffect(() => {
    mounted.current = true
    refresh().catch(err => { if (mounted.current) setError(err.message) }).finally(() => { if (mounted.current) setLoading(false) })
    return () => { mounted.current = false }
  }, [refresh])
  useEffect(() => {
    const code = searchParams.get('card')
    if (!code) return
    setQuery(code)
    const match = members.find(m => m.card_code === code)
    if (match) setSelectedId(match.id)
  }, [searchParams, members])
  async function run(task) {
    if (lock.current) return
    lock.current = true; setBusy(true); setError(''); setMessage('')
    try { await task() } catch (err) { if (mounted.current) setError(err.message) }
    finally { lock.current = false; if (mounted.current) setBusy(false) }
  }
  const selected = members.find(m => m.id === selectedId)
  function act(action, amount = 1) {
    run(async () => {
      const fingerprint = `${selected.id}:${action}:${amount}:${cardOf(selected)?.version}`
      if (pending.current?.fingerprint !== fingerprint) pending.current = { fingerprint, id: crypto.randomUUID() }
      try {
        await loyaltyAction(selected, action, amount, pending.current.id)
        pending.current = null; setQuantity('1'); await refresh()
        setMessage(action === 'redeem' ? 'Reward redeemed. Remaining stamps are saved.' : `${amount} stamp${amount > 1 ? 's' : ''} saved.`)
      } catch (err) { if (err.code) { pending.current = null; await refresh().catch(() => {}) } throw err }
    })
  }
  if (!user) return <AccountPanel slug={venue.slug} />
  return <>
    <SessionBar user={user} />{error && <Notice error>{error}</Notice>}{message && <Notice>{message}</Notice>}
    {loading ? <p role="status" className="frother-card p-5">Checking staff access…</p> : !staff ? <section className="frother-card p-5"><h2 className="font-black text-xl">Staff access required</h2><p>This account has no counter permission for this venue. Ask the owner to grant access.</p></section> : <>
      <section className="frother-card p-5 space-y-3"><h2 className="font-black text-2xl">Staff counter</h2>
        <p className="text-sm">{staff.role === 'owner' ? 'Owner' : 'Staff'} · {members.length}{members.length === 500 ? '+' : ''} cards loaded</p>
        <button className="underline font-bold text-sm" disabled={busy} onClick={() => run(refresh)}>Refresh customer list</button>
        <label className="block font-bold text-sm">Find a customer<input className="frother-input p-3 mt-2" type="search" placeholder="Card number, name or mobile" value={query} onChange={e => setQuery(e.target.value)} /></label>
        {members.filter(m => `${m.card_code} ${m.name} ${m.phone || ''}`.toLowerCase().includes(query.trim().toLowerCase())).map(m => <button key={m.id} onClick={() => { setSelectedId(m.id); pending.current = null }} disabled={busy} className={`w-full border-2 rounded-xl p-3 text-left ${m.id === selectedId ? 'border-green-700 bg-green-50' : 'border-gray-200'}`}><strong>{m.name}</strong><span className="block text-sm">{m.card_code} · {m.phone || 'Guest card'} · {cardOf(m)?.stamps || 0} stamps</span></button>)}
        {!members.length && <p>No cards yet. Customers open a card through the venue link.</p>}
      </section>
      {selected && <section className="frother-card p-5 space-y-4"><h2 className="font-black text-2xl">{selected.name}</h2><p className="font-bold">{selected.card_code}</p><Card venue={venue} member={selected} />
        <p className="font-bold text-sm">Confirm this card and count the paid eligible coffees. One coffee = one stamp. Reward coffees do not earn stamps.</p>
        <div className="grid grid-cols-3 gap-2">{[1, 2, 3].map(n => <button key={n} disabled={busy} onClick={() => act('stamp', n)} className="frother-button bg-green-700 text-white disabled:opacity-40">Add {n}</button>)}</div>
        <form className="space-y-3 border-t pt-4" onSubmit={e => { e.preventDefault(); const count = Number(quantity); if (Number.isInteger(count) && count >= 1 && count <= 20) act('stamp', count) }}>
          <label className="block text-sm font-bold">More than 3? Eligible coffees on this card<input type="number" min="1" max="20" step="1" required className="frother-input p-3 mt-1" value={quantity} onChange={e => setQuantity(e.target.value)} /></label>
          <button disabled={busy || !Number.isInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > 20} className="frother-button bg-gray-900 text-white w-full disabled:opacity-40">Confirm {quantity || '0'} stamps</button>
        </form>
        <p className="text-xs text-gray-600">Three paid coffees on one card: Add 3 once. For a split order, allocate only the agreed quantity to each card; do not give every card the whole order. This pilot does not reconcile orders with the till.</p>
        {!selected.profile_completed_at && <p className="rounded-xl p-3 bg-amber-50 text-sm font-bold">Keep awarding eligible stamps. Before the first redemption, the customer must complete their details and verify email on their phone.</p>}
        <button disabled={busy || !selected.profile_completed_at || (cardOf(selected)?.stamps || 0) < venue.stamps_required} onClick={() => act('redeem')} className="frother-button bg-yellow-300 text-gray-900 w-full disabled:opacity-40">Redeem one reward</button>
      </section>}
      {staff.role === 'owner' && <NfcRegistry venue={venue} />}
    </>}
  </>
}

function Card({ venue, member }) {
  const card = cardOf(member)
  if (!card) return <p role="alert">Card unavailable. Refresh or ask staff for help.</p>
  const ready = card.stamps >= venue.stamps_required
  const locked = ready && !member.profile_completed_at
  return <div className="rounded-2xl border-2 border-gray-900 bg-[#FFF8EA] p-5">
    <p className="text-5xl font-black">{card.stamps}<span className="text-lg text-gray-600"> / {venue.stamps_required}</span></p>
    <p className="font-black mt-3">{locked ? 'Reward earned — complete details to claim.' : ready ? 'Reward ready — show staff.' : `${venue.stamps_required - card.stamps} more until your reward.`}</p>
    <p className="mt-2 text-sm">{venue.reward_description}</p><p className="text-xs text-gray-600 mt-3">{card.rewards_redeemed} redeemed · Updated {new Date(card.updated_at).toLocaleString('en-AU')}</p>
  </div>
}
function SessionBar({ user }) {
  const [error, setError] = useState('')
  return <div className="text-sm font-bold px-2 space-y-2"><div className="flex flex-wrap justify-between gap-3"><span className="break-all">{user.email}</span><button onClick={async () => { const { error: err } = await client().auth.signOut(); if (err) setError(err.message) }}>Sign out</button></div>{error && <p role="alert">{error}</p>}</div>
}
function Notice({ children, error = false }) { return <p role={error ? 'alert' : 'status'} className={`frother-card p-4 ${error ? 'bg-red-50 text-red-900' : 'bg-green-50 text-green-900'}`}>{children}</p> }
function Input({ label, ...props }) { return <label className="block text-sm font-bold">{label}<input {...props} required className="frother-input p-3 mt-2" /></label> }
function Check({ label, ...props }) { return <label className="flex items-start gap-3 text-sm"><input {...props} type="checkbox" className="w-5 h-5 shrink-0" />{label}</label> }
function ConsentEditor({ member, busy, onSave }) {
  const [email, setEmail] = useState(member.email_consent)
  const [sms, setSms] = useState(member.sms_consent)
  return <form className="border-t pt-4 space-y-3" onSubmit={e => { e.preventDefault(); onSave(email, sms) }}><h3 className="font-black">Communication preferences</h3><p className="text-sm">Optional. Rewards work either way. Automated campaigns are not enabled.</p><Check label="Email offers" checked={email} onChange={e => setEmail(e.target.checked)} /><Check label="SMS offers" checked={sms} onChange={e => setSms(e.target.checked)} /><button disabled={busy} className="underline font-bold text-sm">Save preferences</button></form>
}
