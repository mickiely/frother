import { useEffect, useState } from 'react'
import { createNfcTag, getNfcTags, setNfcTagStatus } from '../lib/pilotService'
import LinkQr from './LinkQr'

export default function NfcRegistry({ venue }) {
  const [tags, setTags] = useState([])
  const [form, setForm] = useState({ label: '', location: '', purpose: 'customer' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [expanded, setExpanded] = useState(null)
  const origin = (import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '')
  useEffect(() => {
    let active = true
    getNfcTags(venue.id).then(rows => { if (active) setTags(rows) }).catch(err => { if (active) setError(err.message) })
    return () => { active = false }
  }, [venue.id])
  async function run(task) {
    if (busy) return
    setBusy(true); setError(''); setMessage('')
    try { await task(); setTags(await getNfcTags(venue.id)) }
    catch (err) { setError(err.code === '23505' ? 'That label is already registered at this venue.' : err.message) }
    finally { setBusy(false) }
  }
  return <details className="frother-card p-5 space-y-4">
    <summary className="cursor-pointer font-black text-xl">Venue NFC registry</summary>
    <p className="text-sm mt-3">One entry per physical sticker. Customer tags open the venue card; staff tags open the authenticated counter. Neither type awards stamps.</p>
    {error && <p role="alert" className="text-red-800">{error}</p>}{message && <p role="status" className="text-green-800">{message}</p>}
    <form className="space-y-3" onSubmit={e => { e.preventDefault(); run(async () => { await createNfcTag(venue.id, form); setForm({ label: '', location: '', purpose: 'customer' }); setMessage('Sticker registered. Test its link before writing the NFC tag.') }) }}>
      <label className="block font-bold text-sm">Sticker label<input required maxLength={80} className="frother-input p-3 mt-1" placeholder="Front counter 01" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} /></label>
      <label className="block font-bold text-sm">Location<input maxLength={120} className="frother-input p-3 mt-1" placeholder="Main till" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></label>
      <label className="block font-bold text-sm">Opens<select className="frother-input p-3 mt-1" value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}><option value="customer">Customer stamp card</option><option value="staff">Staff counter — sign-in required</option></select></label>
      <button disabled={busy} className="frother-button w-full bg-gray-900 text-white disabled:opacity-40">Register sticker</button>
    </form>
    {!tags.length && <p className="text-sm">No stickers registered for this venue yet.</p>}
    {tags.map(tag => {
      const url = `${origin}/tap/${tag.code}`
      return <section key={tag.id} className="border-2 rounded-xl p-4 space-y-3">
        <h3 className="font-black">{tag.label} · {tag.status}</h3><p className="text-sm">{tag.location || 'Location not set'} · {tag.purpose === 'staff' ? 'Staff counter' : 'Customer entry'}</p>
        <p className="text-xs font-bold">Write this website URL to the NFC sticker:</p><p className="break-all text-xs">{url}</p>
        <div className="flex flex-wrap gap-3 text-sm font-bold">
          <button disabled={busy} onClick={() => run(async () => { await navigator.clipboard.writeText(url); setMessage('Sticker URL copied.') })}>Copy URL</button>
          <a className="underline" href={`${window.location.origin}/tap/${tag.code}`} target="_blank" rel="noreferrer">Test link</a>
          <button onClick={() => setExpanded(expanded === tag.id ? null : tag.id)}>Show QR backup</button>
          <button disabled={busy} onClick={() => run(async () => { await setNfcTagStatus(venue.id, tag.id, tag.status === 'active' ? 'disabled' : 'active'); setMessage(tag.status === 'active' ? 'Sticker disabled. Its URL will stop opening the venue.' : 'Sticker activated.') })}>{tag.status === 'active' ? 'Disable sticker' : 'Activate sticker'}</button>
        </div>
        {expanded === tag.id && <LinkQr url={url} label={`QR backup for ${tag.label}`} />}
      </section>
    })}
    <p className="text-xs text-gray-600">Program physical stickers after the /tap route is published on the URL's domain. The Test link uses this preview. Registered URLs identify a venue/station, not a customer or a verified purchase.</p>
  </details>
}
