import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { cardOf, client, getMyMembership, getMyStaffAccess, getPilotMembers, getPilotVenue, joinPilot, loyaltyAction, updateConsent } from '../lib/pilotService'

export default function PilotPage({ staffMode = false }) {
  const { slug } = useParams()
  const [venue, setVenue] = useState(null)
  const [user, setUser] = useState(null)
  const userId = useRef(null)
  const activeSlug = useRef(slug)
  const [initializing, setInitializing] = useState(true)
  const [member, setMember] = useState(null)
  const [staff, setStaff] = useState(null)
  const [members, setMembers] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const actionLock = useRef(false)
  const pendingAction = useRef(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState('login')
  const [recovery, setRecovery] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', emailConsent: false, smsConsent: false })

  useEffect(() => {
    let active = true
    activeSlug.current = slug
    setInitializing(true)
    setVenue(null)
    setMember(null); setStaff(null); setMembers([]); setSelectedId(null)
    pendingAction.current = null
    setError('')
    async function load() {
      try {
        const [v, session] = await Promise.all([getPilotVenue(slug), client().auth.getSession()])
        if (session.error) throw session.error
        if (active) { setVenue(v); userId.current = session.data.session?.user?.id || null; setUser(session.data.session?.user || null) }
      } catch (err) { if (active) setError(err.message) }
      finally { if (active) setInitializing(false) }
    }
    load()
    const subscription = supabase?.auth.onAuthStateChange((event, session) => {
      if (!active) return
      userId.current = session?.user?.id || null
      setUser(session?.user || null)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      // Clear all private state immediately when the account changes/signs out.
      setMember(null); setStaff(null); setMembers([]); setSelectedId(null)
      pendingAction.current = null
    })
    return () => { active = false; subscription?.data.subscription.unsubscribe() }
  }, [slug])

  const refresh = useCallback(async () => {
    if (!venue || !user) return
    const [membership, access] = await Promise.all([
      getMyMembership(venue.id, user.id), getMyStaffAccess(venue.id, user.id),
    ])
    const rows = staffMode && access ? await getPilotMembers(venue.id) : []
    if (userId.current !== user.id || activeSlug.current !== venue.slug) return
    setMember(membership); setStaff(access); setMembers(rows)
  }, [venue, user, staffMode])

  useEffect(() => {
    let cancelled = false
    if (!venue || !user) return
    setBusy(true)
    refresh().catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setBusy(false) })
    return () => { cancelled = true }
  }, [refresh, venue, user])

  async function run(task) {
    if (actionLock.current) return
    actionLock.current = true; setBusy(true); setError(''); setMessage('')
    try { await task() } catch (err) { setError(err.message || 'Unable to complete this action. Please try again.') }
    finally { actionLock.current = false; setBusy(false) }
  }

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  function authenticate(e) {
    e.preventDefault()
    run(async () => {
      const auth = client().auth
      const email = form.email.trim()
      let response
      if (recovery) {
        response = await auth.updateUser({ password: form.password })
        if (response.error) throw response.error
        setRecovery(false); setMessage('Password updated. You can now open your card.')
      } else if (mode === 'reset') {
        response = await auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/pilot/${slug}` })
        if (response.error) throw response.error
        setMessage('If this account exists, a recovery email will arrive. Check spam too.')
      } else if (mode === 'signup') {
        response = await auth.signUp({ email, password: form.password, options: { emailRedirectTo: `${window.location.origin}/pilot/${slug}` } })
        if (response.error) throw response.error
        if (!response.data.session) setMessage('Check your email to confirm your account, then sign in here to join rewards.')
      } else {
        response = await auth.signInWithPassword({ email, password: form.password })
        if (response.error) throw response.error
      }
      setForm(f => ({ ...f, password: '' }))
    })
  }

  const selected = members.find(m => m.id === selectedId)
  function act(action, amount = 1) {
    run(async () => {
      const fingerprint = `${selected.id}:${action}:${amount}:${cardOf(selected)?.version}`
      // Retain the same id after a network failure so retry cannot double-award.
      if (pendingAction.current?.fingerprint !== fingerprint) {
        pendingAction.current = { fingerprint, id: crypto.randomUUID() }
      }
      try {
        await loyaltyAction(selected, action, amount, pendingAction.current.id)
        pendingAction.current = null
        await refresh()
        setMessage(action === 'redeem' ? 'Reward redeemed. Remaining stamps are saved.' : `${amount} stamp${amount > 1 ? 's' : ''} saved.`)
      } catch (err) {
        // A transport failure may happen after the database commits. Keep the
        // displayed version and request id so retry remains the same operation.
        if (err.code) {
          pendingAction.current = null
          await refresh().catch(() => {})
        }
        throw err
      }
    })
  }

  const brand = venue?.brand_color || '#16A34A'
  return (
    <main className="min-h-screen frother-shell pb-12" style={{ '--brand-color': brand }}>
      <header className="frother-hero px-5 pt-8 pb-10">
        <div className="max-w-lg mx-auto">
          <Link to="/" className="font-black tracking-tight text-3xl">FROTHER.</Link>
          <p className="text-xs font-black uppercase tracking-widest mt-3">Connected loyalty pilot</p>
          <h1 className="text-3xl font-black mt-2">{venue?.name || 'Your regular spot.'}</h1>
          <p className="font-semibold mt-2">{staffMode ? 'Confirm the purchase. Add a stamp. Keep them coming back.' : 'Your stamp card, saved for next time.'}</p>
        </div>
      </header>
      <div className="max-w-lg mx-auto px-4 -mt-5 space-y-4">
        {error && <p role="alert" className="frother-card p-4 bg-red-50 text-red-900">{error}</p>}
        {message && <p role="status" className="frother-card p-4 bg-green-50 text-green-900">{message}</p>}
        {initializing ? <p role="status" className="frother-card p-5">Opening venue…</p> : !venue ? (
          <section className="frother-card p-5"><h2 className="font-black text-xl">Pilot unavailable</h2><p className="mt-2">Check the venue link or try again shortly.</p><Link className="underline block mt-4" to="/venue/demo-cafe">Open the sample demonstration</Link></section>
        ) : (!user || recovery) ? (
          <section className="frother-card p-5 space-y-4">
            <h2 className="font-black text-2xl">{recovery ? 'Choose a new password' : staffMode ? 'Staff sign in' : mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Recover your account' : 'Open your rewards'}</h2>
            <p className="text-sm text-gray-600">{staffMode ? 'Use your individual account. The venue owner must grant access; demo PINs do not work here.' : 'Use email and password to reopen your card on this phone or another device.'}</p>
            <form onSubmit={authenticate} className="space-y-4">
              {!recovery && <Input label="Email" name="email" type="email" value={form.email} onChange={change} autoComplete="email" />}
              {(mode !== 'reset' || recovery) && <Input label="Password" name="password" type="password" minLength={mode === 'signup' || recovery ? 12 : 1} value={form.password} onChange={change} autoComplete={mode === 'signup' || recovery ? 'new-password' : 'current-password'} />}
              {(mode === 'signup' || recovery) && <p className="text-sm text-gray-600">Use at least 12 characters.</p>}
              <button disabled={busy} className="frother-button w-full bg-gray-900 text-white disabled:opacity-50">{busy ? 'Please wait…' : recovery ? 'Save password' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send recovery email' : 'Sign in'}</button>
            </form>
            {!recovery && <div className="flex flex-wrap gap-4 text-sm font-bold">
              <button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setMessage('') }}>{mode === 'signup' ? 'Already have an account? Sign in' : 'Create an account'}</button>
              <button onClick={() => { setMode(mode === 'reset' ? 'login' : 'reset'); setError(''); setMessage('') }}>{mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}</button>
            </div>}
          </section>
        ) : (
          <>
            <div className="flex flex-wrap justify-between gap-3 text-sm font-bold px-2">
              <span className="break-all">{user.email}</span>
              <button disabled={busy} onClick={() => run(async () => { const { error: err } = await client().auth.signOut(); if (err) throw err })}>Sign out</button>
            </div>
            <button disabled={busy} onClick={() => run(refresh)} className="underline text-sm font-bold px-2">Refresh saved balance</button>
            {staffMode ? !staff ? (
              <section className="frother-card p-5"><h2 className="text-xl font-black">Staff access required</h2><p className="mt-2">This account has no staff permission for this venue. Ask the owner to grant access.</p></section>
            ) : (
              <>
                <section className="frother-card p-5 space-y-3">
                  <h2 className="font-black text-2xl">Staff counter</h2>
                  <p className="text-sm">{staff.role === 'owner' ? 'Owner' : 'Staff'} account · {members.length}{members.length === 500 ? '+' : ''} members loaded</p>
                  <label className="block font-bold text-sm">Find a customer<input className="frother-input p-3 mt-2" type="search" placeholder="Name or mobile" value={query} onChange={e => setQuery(e.target.value)} /></label>
                  {members.filter(m => `${m.name} ${m.phone}`.toLowerCase().includes(query.toLowerCase())).map(m => <button key={m.id} onClick={() => { setSelectedId(m.id); pendingAction.current = null }} disabled={busy} className={`w-full border-2 rounded-xl p-3 text-left ${m.id === selectedId ? 'border-green-700 bg-green-50' : 'border-gray-200'}`}><strong>{m.name}</strong><span className="block text-sm">{m.phone} · {cardOf(m)?.stamps || 0} stamps</span></button>)}
                  {!members.length && <p>No members yet. Customers join through the venue link.</p>}
                </section>
                {selected && <section className="frother-card p-5 space-y-4">
                  <h2 className="font-black text-2xl">{selected.name}</h2>
                  <Card venue={venue} member={selected} />
                  <p className="font-bold text-sm">Confirm the customer and eligible purchase before adding stamps. Confirm the reward handover before redeeming.</p>
                  <div className="grid grid-cols-3 gap-2">{[1, 2, 3].map(n => <button key={n} disabled={busy} onClick={() => act('stamp', n)} className="frother-button bg-green-700 text-white disabled:opacity-40">Add {n}</button>)}</div>
                  <button disabled={busy || (cardOf(selected)?.stamps || 0) < venue.stamps_required} onClick={() => act('redeem')} className="frother-button w-full bg-yellow-300 text-gray-900 disabled:opacity-40">Redeem one reward</button>
                </section>}
              </>
            ) : member ? (
              <section className="frother-card p-5 space-y-4">
                <h2 className="font-black text-2xl">Hey, {member.name}.</h2>
                <Card venue={venue} member={member} />
                <p className="text-sm font-semibold">Show staff your name and mobile: {member.phone}. Staff confirm the purchase and save your stamps. Tapping the sign never adds stamps.</p>
                <ConsentEditor key={member.id + member.consent_updated_at} member={member} busy={busy} onSave={(email, sms) => run(async () => { await updateConsent(member.id, email, sms); await refresh(); setMessage('Communication preferences saved.') })} />
              </section>
            ) : (
              <section className="frother-card p-5 space-y-4">
                <h2 className="font-black text-2xl">Join this venue</h2>
                <p>Buy {venue.stamps_required}, receive: {venue.reward_description}.</p>
                <form className="space-y-4" onSubmit={e => { e.preventDefault(); run(async () => { await joinPilot(venue.id, form); await refresh(); setMessage('You’re in. Your card is saved.') }) }}>
                  <Input label="First name" name="name" maxLength={80} value={form.name} onChange={change} autoComplete="given-name" />
                  <Input label="Mobile (for staff lookup)" name="phone" type="tel" value={form.phone} onChange={change} autoComplete="tel" />
                  <p className="text-sm text-gray-600">We store your name, mobile, account identity, loyalty activity and preferences in FROTHER’s Australian database. Your email is used for account access and recovery. Authorised venue staff can see your membership and loyalty activity. The mobile number is not verified and cannot recover or claim a card.</p>
                  <p className="text-sm font-bold">Marketing is optional. Saying no does not affect stamps or rewards. Automated campaigns are not enabled in this pilot.</p>
                  <Check label="Email offers (optional)" name="emailConsent" checked={form.emailConsent} onChange={change} />
                  <Check label="SMS offers (optional)" name="smsConsent" checked={form.smsConsent} onChange={change} />
                  <button disabled={busy} className="frother-button w-full bg-green-700 text-white disabled:opacity-40">{busy ? 'Saving…' : 'Join rewards'}</button>
                </form>
              </section>
            )}
          </>
        )}
        <nav className="flex justify-between gap-4 text-sm font-bold px-2">
          <Link to={`/pilot/${slug}${staffMode ? '' : '/staff'}`}>{staffMode ? 'Customer page' : 'Staff counter'}</Link>
          <Link to="/venue/demo-cafe">Sample demo</Link>
        </nav>
        <p className="text-xs text-gray-600 px-2">Pilot · Staff-issued stamps only. No POS connection, Wallet pass, location reminders or automated marketing. {slug === 'pilot-cafe' ? 'This is a test venue; rewards have no cash or product value.' : ''}</p>
      </div>
    </main>
  )
}

function Card({ venue, member }) {
  const card = cardOf(member)
  if (!card) return <p role="alert">Card unavailable. Refresh or ask staff for help.</p>
  const ready = card.stamps >= venue.stamps_required
  return <div className="rounded-2xl border-2 border-gray-900 bg-[#FFF8EA] p-5">
    <p className="text-5xl font-black">{card.stamps}<span className="text-lg text-gray-600"> / {venue.stamps_required}</span></p>
    <p className="font-black mt-3">{ready ? 'Reward ready — show staff.' : `${venue.stamps_required - card.stamps} more until your reward.`}</p>
    <p className="mt-2 text-sm">{venue.reward_description}</p>
    <p className="text-xs text-gray-600 mt-3">{card.rewards_redeemed} redeemed · Updated {new Date(card.updated_at).toLocaleString('en-AU')}</p>
  </div>
}

function Input({ label, ...props }) {
  return <label className="block text-sm font-bold">{label}<input {...props} required className="frother-input p-3 mt-2" /></label>
}
function Check({ label, ...props }) {
  return <label className="flex items-start gap-3 text-sm"><input {...props} type="checkbox" className="w-5 h-5 shrink-0" />{label}</label>
}
function ConsentEditor({ member, busy, onSave }) {
  const [email, setEmail] = useState(member.email_consent)
  const [sms, setSms] = useState(member.sms_consent)
  return <form className="border-t pt-4 space-y-3" onSubmit={e => { e.preventDefault(); onSave(email, sms) }}>
    <h3 className="font-black">Communication preferences</h3>
    <p className="text-sm">Optional. Your rewards work either way. Automated campaigns are not enabled.</p>
    <Check label="Email offers" checked={email} onChange={e => setEmail(e.target.checked)} />
    <Check label="SMS offers" checked={sms} onChange={e => setSms(e.target.checked)} />
    <button disabled={busy} className="underline font-bold text-sm">Save preferences</button>
  </form>
}
