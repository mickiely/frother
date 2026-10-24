import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { resolveNfcTag } from '../lib/pilotService'

export default function NfcEntry() {
  const { tagCode } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    resolveNfcTag(tagCode).then(tag => {
      if (!active) return
      if (!tag) { setError('This sticker is inactive or unregistered. Ask staff for the current sign.'); return }
      navigate(`/pilot/${encodeURIComponent(tag.slug)}${tag.purpose === 'staff' ? '/staff' : ''}`, { replace: true })
    }).catch(() => { if (active) setError('Unable to open this venue right now. Please try again or ask staff.') })
    return () => { active = false }
  }, [tagCode, navigate])
  return <main className="min-h-screen frother-shell flex items-center justify-center p-5"><section className="frother-card p-6 max-w-lg"><h1 className="font-black text-3xl">FROTHER.</h1><p role={error ? 'alert' : 'status'} className="mt-4">{error || 'Opening your venue…'}</p>{error && <Link to="/" className="underline font-bold block mt-4">Back to FROTHER</Link>}</section></main>
}
