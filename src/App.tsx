import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Logout from './pages/Logout'
import Dashboard from './pages/Dashboard'
import MediTrack from './pages/MediTrack'
import PantryIQ from './pages/PantryIQ'
import DocuVault from './pages/DocuVault'
import PolicyWatch from './pages/PolicyWatch'
import UtilityDesk from './pages/UtilityDesk'
import HomeCare from './pages/HomeCare'
import FamilyPulse from './pages/FamilyPulse'
import AIAssistant from './pages/AIAssistant'
import AppShell from './components/AppShell'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/logout" element={<Logout />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meditrack" element={<MediTrack />} />
          <Route path="/pantryiq" element={<PantryIQ />} />
          <Route path="/docuvault" element={<DocuVault />} />
          <Route path="/policywatch" element={<PolicyWatch />} />
          <Route path="/utilitydesk" element={<UtilityDesk />} />
          <Route path="/homecare" element={<HomeCare />} />
          <Route path="/familypulse" element={<FamilyPulse />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
