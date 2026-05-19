import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function PublicNav({ active }) { 
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <header className="site-nav public-nav">
      <Link className="brand" to="/">DONORHUB</Link>
      
      <nav className="desktop-links">
        <Link to="/" className={active === 'home' ? 'active' : ''}>Home</Link>
        <Link to="/donation" className={active === 'donate' ? 'active' : ''}>Donate</Link>
        <Link to="/request" className={active === 'request' ? 'active' : ''}>Request</Link>
      </nav>

      <div className="nav-right">
        {/* Notification Bell */}
        <div className="notif-wrapper">
          <button className="icon-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B82323" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          {isNotifOpen && (
            <div className="notif-dropdown">
              <p className="notif-header">Notifications</p>
              <div className="notif-item">No new alerts.</div>
            </div>
          )}
        </div>
        
        {/* Profile Avatar Dropdown */}
        <div className="notif-wrapper">
          <button className="profile-avatar-btn" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
              alt="Profile" 
              className="avatar-img"
            />
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown notif-dropdown">
              <div className="profile-header">
                <strong>Jane Doe</strong>
                <span>jane@example.com</span>
              </div>
              <div className="menu-divider"></div>
              <Link to="/dashboard" className="dropdown-link">Dashboard</Link>
              <Link to="/settings" className="dropdown-link">Settings</Link>
              <div className="menu-divider"></div>
              <button onClick={handleLogout} className="dropdown-link text-red">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}