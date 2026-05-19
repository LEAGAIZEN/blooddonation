import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react"; 
import "../styles/donordashboard.css";

// --- INLINE NAVBAR ---
function DashboardNavbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="dash-nav">
      <Link className="brand" to="/">DONORHUB</Link>
      
      <nav className="center-links">
        <Link to="/donation">Donate</Link>
        <Link to="/request">Request</Link>
        <Link to="/dashboard" className="active">Dashboard</Link>
      </nav>
      
      <div className="nav-right">
        <Link to="/donation" className="btn-donate-now">Donate Now</Link>
        <button className="icon-btn"><Bell size={20} strokeWidth={2.5} color="#1A1A1A" /></button>
        
        <div className="profile-menu-container" ref={dropdownRef}>
          <div className="nav-avatar" onClick={() => setIsProfileOpen(!isProfileOpen)}></div>
          
          {isProfileOpen && (
            <div className="profile-dropdown-menu">
              <div className="user-info-header">
                <strong>{/* Ideally fetch user name here too, keeping generic for now */}Donor User</strong>
                <span>Settings</span>
              </div>
              <div className="menu-links">
                <Link to="/settings">Settings</Link>
              </div>
              <button onClick={() => navigate('/login')} className="logout-btn">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// --- INLINE MULTI-COLUMN FOOTER ---
function DashboardFooter() {
  return (
    <footer className="dash-footer">
      <div className="footer-main">
        <div className="footer-brand-col">
          <div className="brand">DONORHUB.</div>
          <p>Empowering communities through life-saving donations. Your small act makes a massive impact.</p>
        </div>
        <div className="footer-links-col">
          <div className="link-group">
            <strong>COMPANY</strong>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/careers">Careers</Link>
          </div>
          <div className="link-group">
            <strong>RESOURCES</strong>
            <Link to="/faq">FAQ</Link>
            <Link to="/help">Help Center</Link>
            <Link to="/guidelines">Guidelines</Link>
          </div>
          <div className="link-group">
            <strong>LEGAL</strong>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 BACKROW LABS. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}

// --- MAIN DASHBOARD CONTENT ---
export default function DonorDashboard() {
  const [available, setAvailable] = useState(false);
  const [donorData, setDonorData] = useState(null);
  const [history, setHistory] = useState([]);
  const [camps, setCamps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // 1. Fetch Profile Stats
        const profileRes = await fetch("/users/me", { headers });
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileRes.json();
        setDonorData(profileData);
        setAvailable(profileData.is_available);

        // 2. Fetch Donation History
        const historyRes = await fetch("/donations/my-history", { headers });
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setHistory(historyData);
        }

        // 3. Fetch Camps
        const campsRes = await fetch("/camps/upcoming", { headers });
        if (campsRes.ok) {
          const campsData = await campsRes.json();
          setCamps(campsData);
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const toggleAvailability = async () => {
    const newStatus = !available;
    setAvailable(newStatus); 

    try {
      const res = await fetch("/users/update-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ is_available: newStatus }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status code: ${res.status}`);
      }
      
    } catch (error) {
      console.warn("Availability update failed:", error);
    }
  };

  if (isLoading) return <div className="loader" style={{padding: '50px', textAlign: 'center', fontFamily: 'Inter'}}>Loading Dashboard...</div>;

  return (
    <div className="dashboard-page">
      <DashboardNavbar />

      <main className="content-wrap donor-dashboard">
        <section className="dashboard-head split">
          <div>
            <h1>Welcome, {donorData?.fullName || "Donor"}!</h1>
            <p>Your contribution keeps the pulse of the community beating.</p>

            <div className="availability-toggle">
              <span>Emergency Availability</span>
              <div
                className={`toggle-pill ${available ? "active" : ""}`}
                onClick={toggleAvailability}
                style={{ cursor: "pointer" }}
              >
                <span>{available ? "✓" : "✕"}</span>
              </div>
            </div>
          </div>

          <div className="member-card">
            <div className="mini-title">MEMBER SINCE</div>
            <strong>{donorData?.memberSince || "—"}</strong>
          </div>
        </section>

        <section className="stats-grid four">
          <article className="white-card metric-card">
            <div className="metric-icon">◔</div>
            <div className="metric-title">TOTAL VOLUME</div>
            <strong>{donorData?.totalDonations || 0} <span>Donations</span></strong>
          </article>

          <article className="soft-card metric-card">
            <div className="metric-icon heart">♥</div>
            <div className="metric-title">IMPACT</div>
            <strong>{donorData?.livesSaved || 0} <span>Lives Saved</span></strong>
          </article>

          <article className="white-card metric-card">
            <div className="metric-icon">🩸</div>
            <div className="metric-title">STATUS</div>
            <strong>{donorData?.status || "—"}</strong>
          </article>

          <article className="accent-card metric-card inverse">
            <div className="metric-icon">☑</div>
            <div className="metric-title">NEXT ELIGIBILITY</div>
            <strong>{donorData?.nextEligibility || "—"}</strong>
          </article>
        </section>

        <section className="cta-grid two-wide">
          <article className="accent-card cta-card big">
            <h2>Start a Donation</h2>
            <p>Find the nearest center and book your next appointment in seconds.</p>
            <Link className="btn white smallish" to="/donation">Schedule Now →</Link>
          </article>

          <article className="soft-card cta-card">
            <h2>Request Blood</h2>
            <p>In urgent need? Raise a request for your patient or family member.</p>
            <Link className="btn primary smallish" to="/request">Request Emergency ✱</Link>
          </article>
        </section>

        <section className="lower-grid">
          <div>
            <div className="section-top">
              <h3>Donation History</h3>
              <Link to="/history">VIEW ALL</Link>
            </div>

            <div className="table-card">
              <div className="table-head five">
                <span>DATE</span>
                <span>CENTER</span>
                <span>TYPE</span>
                <span>STATUS</span>
              </div>

              {history.length > 0 ? history.map((item, index) => (
                <div className="table-row five" key={index}>
                  <span>{item.date}</span>
                  <span>{item.center}</span>
                  <span className="chip pale">{item.type}</span>
                  <span className={`status ${item.status === 'Completed' ? 'blue' : 'gray'}`}>
                    ● {item.status}
                  </span>
                </div>
              )) : (
                <div style={{padding: '30px', textAlign: 'center', color: '#888', fontSize: '13px', fontWeight: '600'}}>
                  No donation history found.
                </div>
              )}
            </div>
          </div>

          <aside className="sidebar-panel">
            <h3>Local Donation Camps</h3>
            {camps.length > 0 ? camps.map((camp, index) => (
              <div className={`camp-list-card ${index % 2 === 0 ? 'teal' : 'brown'}`} key={camp.id}>
                <div className="date-badge">
                  {camp.month} <strong>{camp.day}</strong>
                </div>
                <div>
                  <strong>{camp.location}</strong>
                  <small>{camp.time} • {camp.distance}</small>
                  <Link to={`/camps/${camp.id}`}>JOIN CAMP ›</Link>
                </div>
              </div>
            )) : (
               <div style={{padding: '20px', background: '#FFFFFF', border: '1px solid #F5E6E6', borderRadius: '12px', textAlign: 'center', color: '#888', fontSize: '13px', fontWeight: '600'}}>
                No upcoming camps available.
              </div>
            )}
          </aside>
        </section>
      </main>

      <DashboardFooter />
    </div>
  );
}