import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, Menu, Droplet, FileText, Search, Heart, Star, ArrowRight, CheckCircle } from "lucide-react";
import API from "../api/api";
import "../styles/home.css";

function Navbar({ active }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Closes notification dropdown when clicking anywhere else on the screen
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="site-nav public-nav">
      <Link className="brand" to="/">DONORHUB</Link>
      
      <nav className="desktop-links">
        <Link className={active === 'home' ? 'active' : ''} to="/">Home</Link>
        <Link className={active === 'donate' ? 'active' : ''} to="/donation">Donate</Link>
        <Link className={active === 'request' ? 'active' : ''} to="/request">Request</Link>
      </nav>

      <div className="nav-right">
        {/* Functional Notification Bell */}
        <div className="notif-wrapper" ref={notifRef} style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
            <Bell size={22} strokeWidth={2} color="#C92A2A" />
          </button>

          {isNotifOpen && (
            <div className="public-notif-dropdown">
              <div className="notif-header">
                <span>NOTIFICATIONS</span>
              </div>
              <div className="notif-body">
                <CheckCircle size={24} color="#D1D5DB" />
                <p className="notif-title">No new updates</p>
                <p className="notif-sub">Check back later for donation alerts.</p>
              </div>
            </div>
          )}
        </div>
        
        <button className="menu-trigger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu size={24} strokeWidth={2} color="#C92A2A" />
        </button>

        {isMenuOpen && (
          <div className="nav-dropdown">
            <Link to="/login" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
            <Link to="/signup" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
            <div className="menu-divider"></div>
            <Link to="/admin/dashboard" className="dropdown-link" onClick={() => setIsMenuOpen(false)}>Admin Portal</Link>
          </div>
        )}
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="footer-left">
        <span className="footer-logo">DONORHUB.</span>
        <p>© 2024 BACKROW LABS. ALL RIGHTS RESERVED.</p>
      </div>
      <div className="footer-right">
        <Link to="/contact">CONTACT US</Link>
        <Link to="/privacy">PRIVACY POLICY</Link>
        <Link to="/terms">TERMS OF SERVICE</Link>
        <Link to="/faq">FAQ</Link>
      </div>
    </footer>
  );
}

export default function Home() {
  useEffect(() => {
    const testBackend = async () => {
      try {
        const res = await API.get("/");
        console.log("Backend Connected:", res.data);
      } catch (err) {
        console.error("Backend Error:", err);
      }
    };
    testBackend();
  }, []);

  return (
    <div className="public-page-wrapper">
      <div className="hero-background-wrapper">
        <Navbar active="home" />

        <section className="hero-section">
          <div className="hero-content">
            <div className="eyebrow-pill">
              <span className="asterisk">✱</span> EVERY DROP MATTERS
            </div>
            <h1>Donate <br /> Blood, <br /> <span className="text-red">Save Lives.</span></h1>
            <p>
              Your contribution is the pulse of our community. Join a network of donors 
              providing vital lifelines to those in urgent need. Simple, safe, and sophisticated.
            </p>
            <div className="hero-buttons">
              <Link className="btn-primary" to="/signup">
                Become a Donor <ArrowRight size={18} strokeWidth={2.5} />
              </Link>
              <Link className="btn-soft" to="/request">Request Blood</Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="image-frame">
              <img src="/blood-bag-photo.jpg" alt="Blood Bag" className="hero-img" />
              <div className="floating-stat">
                <div className="heart-box"><Heart size={20} fill="#C92A2A" color="#C92A2A"/></div>
                <div className="stat-info">
                  <strong>450ml</strong>
                  <span>AVG. DONATION</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="features-background-wrapper">
        <section className="features-grid">
          <article className="feature-card soft-pink-card">
            <div className="feat-icon red-icon"><Droplet size={28} strokeWidth={2} /></div>
            <h3>DONATE</h3>
            <p>Schedule a convenient time at our vital centers. We ensure the most comfortable experience for our lifesavers.</p>
            <Link to="/donation" className="feat-link link-red">Find a Center <ArrowRight size={16} strokeWidth={2.5}/></Link>
          </article>

          <article className="feature-card solid-white-card">
            <div className="feat-icon blue-icon"><FileText size={28} strokeWidth={2} /></div>
            <h3>REQUEST</h3>
            <p>Urgent need for a patient? Submit a request immediately to our priority network for rapid response.</p>
            <Link to="/request" className="feat-link link-blue">Submit Request <ArrowRight size={16} strokeWidth={2.5}/></Link>
          </article>

          <article className="feature-card soft-pink-card">
            <div className="feat-icon red-icon"><Search size={28} strokeWidth={2} /></div>
            <h3>SEARCH STOCKS</h3>
            <p>Real-time inventory of blood types across all partner hospitals and regional blood banks.</p>
            <Link to="/admin/stock" className="feat-link link-red">Live Inventory <ArrowRight size={16} strokeWidth={2.5}/></Link>
          </article>
        </section>
      </div>

      <div className="testimonial-background-wrapper">
        <section className="testimonial-section">
          <div className="testimonial-card">
            <div className="stars">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="#C92A2A" color="#C92A2A"/>)}
            </div>
            <p className="quote-text">
              "The process was seamless and incredibly professional. Knowing my single donation could help three different people makes the experience priceless. DonorHub makes it easy to be a hero."
            </p>
            <div className="author-row">
              <div className="author-avatar">JV</div>
              <div className="author-details">
                <strong>Julian Vance</strong>
                <span>REGULAR DONOR</span>
              </div>
            </div>
            <div className="quote-mark">”</div>
          </div>
        </section>
      </div>

      <PublicFooter />
    </div>
  );
}