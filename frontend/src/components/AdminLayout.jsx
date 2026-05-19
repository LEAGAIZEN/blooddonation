import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { User, LogOut, Bell, Search, Mail, Phone, CheckCircle } from "lucide-react";
import '../styles/admin-global.css';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Profile Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // NEW: Notification Dropdown State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const isActive = (path) => (location.pathname === path ? "active" : "");

  // Path Checks
  const isCampPage = location.pathname === '/admin/camp' || location.pathname === '/camp';
  const isSpecialNav = ['/admin/stock', '/stock', '/admin/user', '/user'].includes(location.pathname);

  // Close dropdowns if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Shared Profile Dropdown Menu
  const ProfileDropdown = () => (
    <div className="profile-dropdown-card">
      <div className="dropdown-user-header">
        <div className="dropdown-avatar-large"><div className="avatar-fallback-art"></div></div>
        <div className="dropdown-user-meta">
          <span className="dropdown-name">BackRow Admin</span>
          <span className="dropdown-email">admin@donorhub.org</span>
        </div>
      </div>
      <div className="dropdown-menu-links">
        <Link to="/admin/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
          <User size={18} /> <span>User Details</span>
        </Link>
        <button className="dropdown-logout-btn" onClick={() => navigate("/login")}>
          <LogOut size={18} className="logout-red" /> <span>Logout</span>
        </button>
      </div>
    </div>
  );

  // NEW: Modern Notification Dropdown Menu
  const NotificationDropdown = () => (
    <div style={{
      position: 'absolute',
      top: '50px',
      right: '-10px',
      background: '#FFFFFF',
      boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
      borderRadius: '16px',
      width: '320px',
      zIndex: 10000,
      border: '1px solid #E5E7EB',
      overflow: 'hidden',
      animation: 'slideUp 0.2s ease forwards' // Assumes you have this in global css, or it will just snap in cleanly
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F5E6E6', background: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notifications</h4>
      </div>
      <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: '#F3F4F6', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <CheckCircle size={24} color="#9CA3AF" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '14px', color: '#1A1A1A', fontWeight: '800' }}>You're all caught up!</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666', fontWeight: '500' }}>No new system alerts or inventory warnings at this time.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-site-container">
      
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <Link to="/admin/dashboard" className="admin-brand-logo">DonorHub</Link>
        </div>
        
        <nav className="admin-nav-center">
          <Link to="/admin/dashboard" className={isActive("/admin/dashboard")}>Dashboard</Link>
          <Link to="/admin/user" className={isActive("/admin/user")}>User</Link>
          <Link to="/admin/camp" className={isActive("/admin/camp")}>Camp</Link>
          <Link to="/admin/stock" className={isActive("/admin/stock")}>Stock</Link>
        </nav>
        
        <div className="admin-nav-right-group">
          {isSpecialNav && (
            <div className="admin-search-bar">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder={location.pathname.includes('user') ? "Quick search..." : "Search inventory..."} />
            </div>
          )}

          {/* REPLACED: Notification Bell with Dropdown Wrapper */}
          <div className="notification-wrapper" ref={notifRef} style={{ position: 'relative' }}>
            <button 
              className="nav-icon-btn" 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
            >
              <Bell size={20} />
            </button>
            {isNotifOpen && <NotificationDropdown />}
          </div>
          
          <div className="admin-nav-right-wrapper" ref={dropdownRef}>
            <div className="admin-profile-trigger-circle" onClick={(e) => { e.preventDefault(); setIsDropdownOpen(!isDropdownOpen); }}>
              <User size={20} />
            </div>
            {isDropdownOpen && <ProfileDropdown />}
          </div>
        </div>
      </header>

      <main className="admin-content-outlet">
        {children || <Outlet />}
      </main>

      {isCampPage ? (
        <footer className="camp-extended-footer">
          <div className="footer-top-grid">
            <div className="footer-brand-col">
              <span className="footer-logo">DonorHub</span>
              <p>Streamlining the vital link between generous donors and the healthcare systems that need them most. Precision logistics for human kindness.</p>
            </div>
            <div className="footer-links-col">
              <h4>PLATFORM</h4>
              <Link to="/admin/dashboard">Admin Portal</Link>
              <Link to="/dashboard">Donor Mobile App</Link>
              <Link to="/integration">Hospital Integration</Link>
              <Link to="/api">Stock API</Link>
            </div>
            <div className="footer-contact-col">
              <h4>CONTACT</h4>
              <div className="contact-link"><Mail size={16}/> logistics@donorhub.org</div>
              <div className="contact-link"><Phone size={16}/> +1 (800) VITAL-BLOOD</div>
            </div>
          </div>
          <div className="footer-bottom-bar">
            <span className="copy-text">© 2026 DonorHub Medical Logistics. All rights reserved.</span>
            <div className="legal-links">
              <Link to="/privacy">Privacy Protocol</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/access">Accessibility</Link>
            </div>
          </div>
        </footer>
      ) : (
        <footer className="admin-footer">
          <div className="footer-left-side">
            <span className="footer-logo">DONORHUB.</span>
            <p className="footer-copyright">© 2026 BACKROW LABS. ALL RIGHTS RESERVED.</p>
          </div>
          <div className="footer-right-links">
            <Link to="/contact">CONTACT US</Link>
            <Link to="/privacy">PRIVACY POLICY</Link>
            <Link to="/terms">TERMS OF SERVICE</Link>
            <Link to="/faq">FAQ</Link>
          </div>
        </footer>
      )}
    </div>
  );
}