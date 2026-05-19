import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/admindashboard.css";

export default function AdminDashboard() {
  const [inventory, setInventory] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      try {
        const [invRes, userRes] = await Promise.all([
          axios.get('/admin/inventory', config),
          axios.get('/admin/users', config)
        ]);
        
        setInventory(invRes.data);
        setPersonnel(userRes.data);
      } catch (error) {
        // STRIPPED OUT DUMMY DATA: Now it logs the error and leaves the arrays empty 
        // so the UI accurately reflects a disconnected or empty database.
        console.error("Failed to load admin dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStockStatus = (units) => {
    if (units <= 5) return { label: "LOW STOCK", class: "low-stock", critical: true };
    if (units <= 10) return { label: "LOW", class: "normal", critical: false };
    if (units <= 15) return { label: "NORMAL", class: "normal", critical: false };
    return { label: "STABLE", class: "stable", critical: false };
  };

  if (isLoading) return <div className="admin-loader" style={{padding: '50px', textAlign: 'center'}}>Loading Dashboard...</div>;

  return (
    <div className="admin-dashboard-content">
      <div className="admin-page-header">
        <h1>Vital Inventory</h1>
        <p>Real-time monitoring of blood bank reserves by DonorHub.</p>
      </div>

      <section className="admin-inventory-grid">
        {inventory.length > 0 ? (
          inventory.map((item) => {
            const status = getStockStatus(item.units);
            return (
              <article key={item.bloodType} className={`admin-stock-card ${status.critical ? 'border-critical' : ''}`}>
                <div className="stock-card-top">
                  <span className="blood-type-txt">{item.bloodType}</span>
                  <span className={`status-chip ${status.class}`}>{status.label}</span>
                </div>
                <div className="stock-card-middle">
                  <span className="units-count-num">{item.units}</span>
                  <span className="units-label-text">Units</span>
                </div>
                <div className="stock-progress-bar-bg">
                  <div className={`stock-progress-bar-fill ${status.class}`} style={{ width: `${Math.min((item.units / 40) * 100, 100)}%` }} />
                </div>
                {status.critical && <p className="critical-warning-msg">⚠ URGENT REPLENISHMENT REQUIRED</p>}
              </article>
            );
          })
        ) : (
          <div style={{gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #eee', color: '#666'}}>
            No inventory data available in the database.
          </div>
        )}
      </section>

      <section className="admin-camp-banner">
        <div className="banner-left-content">
          <h2>Camp Management</h2>
          <p>Organize and schedule new blood donation camps in your area.</p>
        </div>
        <Link className="schedule-camp-btn" to="/admin/camp">📅 SCHEDULE NEW CAMP</Link>
      </section>

      <section className="admin-table-card">
        <div className="table-card-header">
          <h3>Registered Personnel</h3>
          <Link className="manage-users-btn" to="/admin/user">MANAGE USERS</Link>
        </div>
        
        <div className="table-header-row">
          <div className="col-header flex-2">NAME</div>
          <div className="col-header flex-1">BLOOD TYPE</div>
          <div className="col-header flex-2">ROLE</div>
          <div className="col-header flex-1 text-right">STATUS</div>
        </div>

        {personnel.length > 0 ? (
          personnel.map((user) => (
            <div className="table-body-row" key={user.email}>
              <div className="col-cell flex-2 name-profile-cell">
                <div className="user-avatar-initials">{user.fullName.charAt(0)}</div>
                <div className="user-text-details">
                  <div className="user-profile-name">{user.fullName}</div>
                  <div className="user-profile-email">{user.email}</div>
                </div>
              </div>
              <div className="col-cell flex-1"><span className="blood-badge-chip">{user.bloodGroup}</span></div>
              <div className="col-cell flex-2">{user.role}</div>
              <div className="col-cell flex-1 text-right status-text-display">
                <span className="active-dot">●</span> {user.status}
              </div>
            </div>
          ))
        ) : (
           <div style={{padding: '30px', textAlign: 'center', color: '#888', fontSize: '13px', fontWeight: '600'}}>
             No registered personnel found.
           </div>
        )}
      </section>
    </div>
  );
}