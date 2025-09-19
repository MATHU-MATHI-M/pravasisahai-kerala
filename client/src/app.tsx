import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Self from "./pages/Self";
import ClinicsHospitalsRegister from "./pages/ClincsHospitalRegister";
import ClinicLogin from "./pages/ClinicLogin";
import ClinicDashboard from "./pages/ClinicDashboard";
import RegisterMigrant from "./pages/RegisterMigrant";

import NGO from "./pages/NGO";
import Employer from "./pages/Employer";
import PatientEntry from './pages/PatientEntry.tsx';
import EmployerRegister from './pages/EmployerRegister';
import EmployerLogin from './pages/EmployerLogin';
import EmployerDashboard from './pages/EmployerDashboard';
import Notifications from './pages/Notifications';
import GovDashboards from './pages/GovDashboards';
import NGODashboard from './pages/NGODashboard';
import NGORegister from './pages/NGORegister';
import NGOLogin from './pages/NGOLogin';
import GovernmentRegister from './pages/GovernmentRegister';
import GovernmentLogin from './pages/GovernmentLogin';
import NGOScanner from './pages/NGOScanner';
import GovernmentScanner from './pages/GovernmentScanner';

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="register-container"><h2>{title}</h2><p>Coming soon.</p></div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to Home */}
        <Route path="/" element={<Home />} />

        {/* Other routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/self" element={<Self />} />
        <Route path="/register-migrant" element={<RegisterMigrant />} />
    
        <Route path="/ngo" element={<NGO />} />
        <Route path="/employer" element={<Employer />} />
        <Route path="/self" element={<Self />} />
        <Route path ="/healthcare-provider" element={<ClinicsHospitalsRegister/>}/>
        <Route path ="/patient-entry" element={<PatientEntry/>}/>
        {/* Catch-all route to redirect unknown paths to Home */}
        <Route path ="/clinic-login" element={<ClinicLogin/>}/>
        <Route path ="/clinic-dashboard" element={<ClinicDashboard/>}/>

        <Route path="/employer-register" element={<EmployerRegister/>}/>
        <Route path="/employer-login" element={<EmployerLogin/>}/>
        <Route path="/employer-dashboard" element={<EmployerDashboard/>}/>

        <Route path="/ngo-register" element={<NGORegister/>}/>
        <Route path="/ngo-login" element={<NGOLogin/>}/>
        <Route path="/ngo-dashboard" element={<NGODashboard/>}/>
        <Route path="/ngo-scanner" element={<NGOScanner/>}/>

        <Route path="/government-register" element={<GovernmentRegister/>}/>
        <Route path="/government-login" element={<GovernmentLogin/>}/>
        <Route path="/government-dashboard" element={<GovDashboards/>}/>
        <Route path="/government-scanner" element={<GovernmentScanner/>}/>

        <Route path="/notifications" element={<Notifications/>}/>

        <Route path="/about" element={<Placeholder title="About"/>}/>
        <Route path="/contact" element={<Placeholder title="Contact"/>}/>
        <Route path="/help" element={<Placeholder title="Help Center"/>}/>
        <Route path="/privacy" element={<Placeholder title="Privacy"/>}/>
        <Route path="/terms" element={<Placeholder title="Terms"/>}/>
        <Route path="/government" element={<Placeholder title="Government"/>}/>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
