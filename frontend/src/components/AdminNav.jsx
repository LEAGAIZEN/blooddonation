import React, { useState } from "react";
import { Link } from "react-router-dom";

function AdminNav({ active }) { 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <header className="site-nav public-nav">
      <Link className="brand" to="/">DONORHUB</Link>
      
      <nav className="desktop-links">
        <Link to="/" className={active === 'home' ? 'active' : ''}>Home</Link>
        <Link to="/donation" className={active === 'donate' ? 'active' : ''}>Donate</Link>
        <Link to="/request" className={active === 'request' ? 'active' : ''}>Request</Link>
      </nav>

      <div className="nav-right">
        {/* Notification Section */}
        <div className="notif-wrapper">
          <button 
            className={`icon-btn ${isNotifOpen ? 'active' : ''}`} 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
          >
            🔔
          </button>

          {isNotifOpen && (
            <div className="notif-dropdown">
              <p className="notif-header">Notifications</p>
              <div className="notif-item">No new alerts for now.</div>
            </div>
          )}
        </div>
        
        {/* Hamburger Menu Section */}
        <button className="menu-trigger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {isMenuOpen && (
          <div className="nav-dropdown">
            <Link to="/login" className="dropdown-link">Login</Link>
            <Link to="/signup" className="dropdown-link">Sign Up</Link>
            <div className="menu-divider"></div>
            <Link to="/about" className="dropdown-link">About Us</Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default AdminNav;