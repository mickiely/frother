import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import VenueHome from './pages/VenueHome'
import JoinPage from './pages/JoinPage'
import CustomerDashboard from './pages/CustomerDashboard'
import CompleteProfilePage from './pages/CompleteProfilePage'
import StaffPortal from './pages/StaffPortal'
import AdminPortal from './pages/AdminPortal'
import NotFound from './pages/NotFound'
import PilotPage from './pages/PilotPage'
import NfcEntry from './pages/NfcEntry'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tap/:tagCode" element={<NfcEntry />} />
        <Route path="/pilot/:slug" element={<PilotPage />} />
        <Route path="/pilot/:slug/staff" element={<PilotPage staffMode />} />
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
