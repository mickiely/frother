import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import VenueHome from './pages/VenueHome'
import JoinPage from './pages/JoinPage'
import CustomerDashboard from './pages/CustomerDashboard'
import CompleteProfilePage from './pages/CompleteProfilePage'
import StaffPortal from './pages/StaffPortal'
import AdminPortal from './pages/AdminPortal'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<FrotherDemo />} />
        <Route path="/venue/:slug" element={<VenueHome />} />
        <Route path="/venue/:slug/join" element={<JoinPage />} />
        <Route path="/venue/:slug/customer/:customerId" element={<CustomerDashboard />} />
        <Route path="/venue/:slug/customer/:customerId/complete-profile" element={<CompleteProfilePage />} />
        <Route path="/staff/:venueSlug" element={<StaffPortal />} />
        <Route path="/admin/:venueSlug" element={<AdminPortal />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

function FrotherDemo() {
  const [stamps, setStamps] = useState(() => {
    try { return Math.max(0, Math.min(99, Number(localStorage.getItem('frother-demo-stamps')) || 0)) }
    catch { return 0 }
  })
  const [redeemed, setRedeemed] = useState(0)
  const [view, setView] = useState('customer')
  const threshold = 6
  function setCount(next) {
    const safe = Math.max(0, Math.min(99, next))
    setStamps(safe)
    try { localStorage.setItem('frother-demo-stamps', String(safe)) } catch {}
  }
  return <main className="min-h-screen p-5 sm:p-10" style={{background:'#F8F1E4', color:'#111827'}}>
    <div className="max-w-lg mx-auto">
      <Link to="/" className="underline font-bold">← FROTHER home</Link>
      <div className="mt-6 p-4 border-4 border-black bg-[#F4B84A] shadow-[6px_6px_0_#111827]">
        <p className="font-black text-sm uppercase tracking-wider">FROTHER · Interactive demonstration</p>
        <h1 className="text-4xl font-black mt-2">TAP. STAMP. REPEAT.</h1>
        <p className="font-semibold mt-2">No account, phone number or password needed.</p>
        <p className="text-sm mt-2">DEMO ONLY — sample stamps stored on this device. No real rewards, purchases or customer records.</p>
      </div>
      <div className="flex gap-2 mt-8">
        {['customer','staff'].map(v=><button key={v} onClick={()=>setView(v)} aria-pressed={view===v} className="flex-1 border-2 border-black p-3 font-black" style={{background:view===v?'#10B981':'white'}}>{v==='customer'?'Customer card':'Staff simulator'}</button>)}
      </div>
      {view==='customer' ? <section className="bg-white border-4 border-black p-6 mt-4 shadow-[5px_5px_0_#111827]">
        <p className="font-bold uppercase text-sm">Demo Café · Loyalty card</p>
        <h2 className="font-black text-3xl mt-2">{stamps} / {threshold} stamps</h2>
        <div className="grid grid-cols-3 gap-3 my-6">{Array.from({length:threshold},(_,i)=><div key={i} className="aspect-square border-2 border-black rounded-full flex items-center justify-center text-2xl" style={{background:i<stamps%threshold || stamps>=threshold?'#F4B84A':'#F8F1E4'}}>{i<stamps%threshold || stamps>=threshold?'☕':'○'}</div>)}</div>
        <p className="font-semibold">{stamps>=threshold?'Reward ready! Ask staff to redeem it.':`${threshold-stamps} more stamps until your reward.`}</p>
        <p className="text-sm mt-3">In the real product, only authenticated staff can award stamps. Switch to Staff simulator to see the flow.</p>
      </section> : <section className="bg-white border-4 border-black p-6 mt-4 shadow-[5px_5px_0_#111827]">
        <p className="font-bold uppercase text-sm">Staff simulator · No real transactions</p>
        <h2 className="text-3xl font-black mt-3">Award stamps</h2>
        <p className="mt-2">Enter coffees purchased by tapping a quantity.</p>
        <div className="grid grid-cols-3 gap-3 my-5">{[1,2,3].map(n=><button key={n} onClick={()=>setCount(stamps+n)} className="p-4 border-2 border-black font-black bg-[#10B981]">+{n} {n===1?'coffee':'coffees'}</button>)}</div>
        <button disabled={stamps<threshold} onClick={()=>{setCount(stamps-threshold);setRedeemed(r=>r+1)}} className="w-full p-4 border-2 border-black font-black bg-[#F4B84A] disabled:opacity-40">Redeem 1 reward (6 stamps)</button>
        <p className="mt-3 font-bold">Current stamps: {stamps} · Rewards redeemed this visit: {redeemed}</p>
      </section>}
      <button className="underline mt-7 text-sm font-bold" onClick={()=>{setCount(0);setRedeemed(0);setView('customer')}}>Reset demonstration</button>
      <p className="text-xs mt-5 text-gray-600">This standalone demo intentionally does not connect to Supabase, SMS, or the live staff portal. NFC/QR can point here for a safe walkthrough until the real guest-card flow is ready.</p>
    </div>
  </main>
}
