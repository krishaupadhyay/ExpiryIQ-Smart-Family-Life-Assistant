import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

// ✅ Import AuthProvider
import { AuthProvider } from './context/AuthContext'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Logout from './pages/Logout'
import Profiles from './pages/ProfileSelection'

import Dashboard from './pages/Dashboard'
import MediTrack from './pages/MediTrack'
import PantryIQ from './pages/PantryIQ'
import DocuVault from './pages/DocuVault'
import PolicyWatch from './pages/PolicyWatch'
import UtilityDesk from './pages/UtilityDesk'
import HomeCare from './pages/HomeCare'
import FamilyPulse from './pages/FamilyPulse'
import AIAssistant from './pages/AIAssistant'

// Components
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import PublicOnlyRoute from './components/PublicOnlyRoute'


export default function App() {

  return (

    // {/* ✅ Wrap entire app with AuthProvider */}
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          {/* PUBLIC LANDING PAGE */}
          <Route
            path="/"
            element={<Landing />}
          />


          {/* ✅ ONLY LOGGED-OUT USERS (Login/Signup) */}
          <Route element={<PublicOnlyRoute />}>

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/signup"
              element={<Signup />}
            />

          </Route>


          {/* LOGOUT */}
          <Route
            path="/logout"
            element={<Logout />}
          />


          {/* ✅ ONLY LOGGED-IN USERS (Protected Routes) */}
          <Route element={<ProtectedRoute />}>

            {/* Profile Selection */}
            <Route
              path="/profiles"
              element={<Profiles />}
            />

            {/* App with Sidebar */}
            <Route element={<AppShell />}>

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/meditrack"
                element={<MediTrack />}
              />

              <Route
                path="/pantryiq"
                element={<PantryIQ />}
              />

              <Route
                path="/docuvault"
                element={<DocuVault />}
              />

              <Route
                path="/policywatch"
                element={<PolicyWatch />}
              />

              <Route
                path="/utilitydesk"
                element={<UtilityDesk />}
              />

              <Route
                path="/homecare"
                element={<HomeCare />}
              />

              <Route
                path="/familypulse"
                element={<FamilyPulse />}
              />

              <Route
                path="/ai-assistant"
                element={<AIAssistant />}
              />

            </Route>

          </Route>


          {/* UNKNOWN URL */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>

      </BrowserRouter>
    </AuthProvider>

  )
}