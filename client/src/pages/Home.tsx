import React from "react";
import { Link } from "react-router-dom";
import { FaUser, FaFileMedical, FaBuilding, FaHandsHelping, FaUserTie } from "react-icons/fa";
import "./Home.css";

const Home: React.FC = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <h1>Migrant Health Record Management Portal</h1>
          <p>
            A business-grade platform for managing migrant health records. Register, login, and manage health data for patients, employers, NGOs, and government authorities.
          </p>
          <img src="/hero-image.png" alt="Migrant health" className="hero-image" />
        </div>
      </header>

      {/* Quick Links */}
      <section className="quick-links">
        <h2>Quick Access</h2>
        <div className="cards-container">
          <div className="card card-green">
            <FaUser size={36} />
            <span>Patient</span>
            <Link to="/register" className="cta-link">Register</Link>
            <Link to="/login" className="cta-link">Login</Link>
          </div>
          <div className="card card-blue">
            <FaUserTie size={36} />
            <span>Employer</span>
            <Link to="/employer-register" className="cta-link">Register</Link>
            <Link to="/employer-login" className="cta-link">Login</Link>
          </div>
          <div className="card card-green">
            <FaHandsHelping size={36} />
            <span>NGO</span>
            <Link to="/ngo-register" className="cta-link">Register</Link>
            <Link to="/ngo-login" className="cta-link">Login</Link>
          </div>
          <div className="card card-blue">
            <FaBuilding size={36} />
            <span>Government</span>
            <Link to="/government-register" className="cta-link">Register</Link>
            <Link to="/government-login" className="cta-link">Login</Link>
          </div>
          <div className="card card-green">
            <FaFileMedical size={36} />
            <span>Healthcare Provider</span>
            <Link to="/healthcare-provider" className="cta-link">Register/Login</Link>
          </div>
        </div>
      </section>

      {/* About App */}
      <section className="about-app">
        <h2>About This App</h2>
        <p>
          This platform streamlines healthcare management for migrant workers. It provides
          record keeping, checkup scheduling, area monitoring, and controlled access
          for employers, self, NGOs, and government authorities, ensuring timely
          interventions and better health outcomes.
        </p>
      </section>
    </div>
  );
};

export default Home;
