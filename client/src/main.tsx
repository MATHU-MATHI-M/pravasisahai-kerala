// src/main.tsx or src/index.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Pages
import App from './pages/App'           // Home / main layout
import Home from './pages/Home'         // Home content page
import Register from './pages/Register'
import Verify from './pages/Verify'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Self from './pages/Self'
import ClinicsHospitalsRegister from './pages/ClincsHospitalRegister';
import ClinicLogin from './pages/ClinicLogin'
import ClinicDashboard from "./pages/ClinicDashboard";
import PatientEntry from "./pages/PatientEntry";
import EmployerRegister from './pages/EmployerRegister';
import EmployerLogin from './pages/EmployerLogin';
import EmployerDashboard from './pages/EmployerDashboard';
import NGORegister from './pages/NGORegister';
import NGOLogin from './pages/NGOLogin';
import NGODashboard from './pages/NGODashboard';
import GovernmentRegister from './pages/GovernmentRegister';
import GovernmentLogin from './pages/GovernmentLogin';
import GovDashboards from './pages/GovDashboards';
import Notifications from './pages/Notifications';
import NGOScanner from './pages/NGOScanner';
import GovernmentScanner from './pages/GovernmentScanner';

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Main layout wrapper */}
        <Route path="/" element={<App />}>
          {/* Default home page */}
          <Route index element={<Home />} />

          {/* Other pages */}
          <Route path="register" element={<Register />} />
          <Route path="verify" element={<Verify />} />
          <Route path="login" element={<Login />} />
          <Route path="dashboard/:health_id" element={<Dashboard />} />
          <Route path="profile/:health_id" element={<Profile />} />
          <Route path="self" element={<Self />} />
          <Route path="healthcare-provider" element={<ClinicsHospitalsRegister/>}/>
          <Route path="clinic-login" element={<ClinicLogin/>}/>
          <Route path="clinic-dashboard/:hospital_id" element={<ClinicDashboard/>}/>
          <Route path="patient-entry/:health_id" element={<PatientEntry/>}/>

          <Route path="employer-register" element={<EmployerRegister />} />
          <Route path="employer-login" element={<EmployerLogin />} />
          <Route path="employer-dashboard" element={<EmployerDashboard />} />

          <Route path="ngo-register" element={<NGORegister />} />
          <Route path="ngo-login" element={<NGOLogin />} />
          <Route path="ngo-dashboard" element={<NGODashboard />} />
          <Route path="ngo-scanner" element={<NGOScanner />} />

          <Route path="government-register" element={<GovernmentRegister />} />
          <Route path="government-login" element={<GovernmentLogin />} />
          <Route path="government-dashboard" element={<GovDashboards />} />
          <Route path="government-scanner" element={<GovernmentScanner />} />

          <Route path="notifications" element={<Notifications />} />

          {/* Catch-all unknown paths redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
