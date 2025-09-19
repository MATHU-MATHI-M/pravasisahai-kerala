import React from 'react';
import { Link } from 'react-router-dom';
import Login from './Login';
import './Self.css';

const Self: React.FC = () => {
  return (
    <div className="self-container">
      <h1>Pravasahai - Self Portal</h1>
      <p>Login using your credentials or scan your Health ID QR code.</p>

      <div className="forms-wrapper">
        <div className="form-box">
          <h2>Login</h2>
          <Login />
         
        </div>
      </div>
    </div>
  );
};

export default Self;
