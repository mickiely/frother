import { useEffect, useState } from 'react'

export default function LinkQr({ url, label }) {
  const [image, setImage] = useState('')
  useEffect(() => {
    let active = true
    setImage('')
    import('qrcode').then(({ default: QRCode }) => QRCode.toDataURL(url, { width: 240, margin: 3, errorCorrectionLevel: 'M' }))
      .then(value => { if (active) setImage(value) }).catch(() => {})
    return () => { active = false }
  }, [url])
  return image ? <img src={image} width="240" height="240" className="mx-auto max-w-full rounded-xl" alt={label} /> : <p className="text-sm">Use the printed card number if the QR is unavailable.</p>
}
