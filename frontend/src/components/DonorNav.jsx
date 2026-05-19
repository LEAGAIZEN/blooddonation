import { useState } from "react";
import { Link } from "react-router-dom";

export default function DonorNav() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="donor-topbar">
      {/* Brand Identity Branding Logo Anchor */}
      <Link className="brand" to="/">DONORHUB</Link>
      
      {/* Changed to an explicit div container to bypass global `.ui-page nav` rules */}
      <div className="donor-nav-links">
        <Link to="/donation">Donate</Link>
        <Link to="/request">Request</Link>
        <Link className="active" to="/dashboard">Dashboard</Link>
      </div>
      
      {/* Consolidated Right Action Controls Row */}
      <div className="right-actions">
        <Link className="btn small primary" to="/donation">Donate Now</Link>
        
        <div className="notification-trigger-wrapper">
          <button 
            className="icon-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Toggle notifications"
          >
            🔔
          </button>

          {/* Popover Dropdown Overlay Pane */}
          {showNotifications && (
            <div className="notifications-popover">
              <div className="pop-head">
                <strong>NOTIFICATIONS</strong>
                <button 
                  className="close-pop-btn" 
                  onClick={() => setShowNotifications(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="pop-body">
                <div className="note-item urgent">
                  <span className="note-status-indicator"></span>
                  <div className="note-content">
                    <strong>URGENT: B+ blood needed at City Hospital.</strong>
                    <small>2 mins ago</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Link className="icon-btn" to="/profile">i</Link>
      </div>
    </header>
  );
}