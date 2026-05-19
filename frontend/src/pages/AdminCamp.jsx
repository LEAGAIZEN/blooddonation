import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, Pencil, MoreVertical, Truck, Box, UserCheck, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import axios from 'axios'; 
import '../styles/admincamp.css';

export default function AdminCamp() {
  const [activeTab, setActiveTab] = useState('UPCOMING');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [camps, setCamps] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Tracks form submission
  
  const [newCamp, setNewCamp] = useState({ title: '', location: '', day: '', month: '' });

  // NEW: Modern Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500); 
  };

  // 1. FETCH CAMPS FROM BACKEND ON PAGE LOAD
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/admin/camps", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCamps(response.data);
      } catch (error) {
        console.error("Failed to load camps from FastAPI:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCamps();
  }, []);

  // 2. SEND NEW CAMP DATA TO BACKEND
  const handleAddCamp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const campPayload = {
      day: newCamp.day,
      month: newCamp.month.toUpperCase(),
      title: newCamp.title,
      location: newCamp.location,
      donors: 0,
      time: "09:00 AM - 05:00 PM",
      type: "UPCOMING",
      status: "NEWLY ADDED"
    };

    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post("/admin/camps", campPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCamps([response.data, ...camps]);
      
      setIsModalOpen(false);
      setNewCamp({ title: '', location: '', day: '', month: '' });
      showToast("Camp successfully scheduled!", "success");
      
    } catch (error) {
      console.error("Failed to save camp to database:", error);
      // REPLACED: Ugly alert() is now a sleek error toast
      showToast("Failed to schedule camp. Check connection to backend.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="camp-page-container">
      
      {/* ========================================================
          FOOLPROOF INLINE-STYLED TOAST NOTIFICATION 
          ======================================================== */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '30px',
          right: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 24px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '700',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          zIndex: 99999, // Forces it to float above the modal
          backgroundColor: toast.type === 'success' ? '#EBFBEE' : toast.type === 'error' ? '#FFF5F5' : toast.type === 'danger' ? '#C92A2A' : '#F8F9FA',
          color: toast.type === 'success' ? '#2B8A3E' : toast.type === 'error' ? '#C92A2A' : toast.type === 'danger' ? '#FFFFFF' : '#1A1A1A',
          border: `1px solid ${toast.type === 'success' ? '#B2F2BB' : toast.type === 'error' ? '#FEE2E2' : toast.type === 'danger' ? '#A61E1E' : '#E5E7EB'}`,
          transition: 'all 0.3s ease'
        }}>
          {toast.type === 'success' && <CheckCircle size={18} />}
          {(toast.type === 'error' || toast.type === 'danger') && <AlertCircle size={18} />}
          {toast.type === 'info' && <Info size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="camp-page-header">
        <div className="header-text">
          <span className="mini-label">VITAL CONTROL CENTER</span>
          <h1>Camp Management</h1>
          <p>Orchestrate life-saving opportunities. Manage locations, logistics, and donor outreach for upcoming blood drives.</p>
        </div>
        <button className="btn-schedule-red" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Schedule New Camp
        </button>
      </div>

      {/* TAB NAVIGATION */}
      <div className="active-schedule-bar">
        <h3>Active Schedule</h3>
        <div className="tab-group">
          <button className={`tab-btn ${activeTab === 'UPCOMING' ? 'active' : ''}`} onClick={() => setActiveTab('UPCOMING')}>UPCOMING</button>
          <button className={`tab-btn ${activeTab === 'PAST' ? 'active' : ''}`} onClick={() => setActiveTab('PAST')}>PAST CAMPS</button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="camp-main-layout">
        <div className="camp-cards-list">
          {isLoading ? (
            <p style={{padding: '20px', color: '#666'}}>Loading camps from database...</p>
          ) : camps.filter(c => c.type === activeTab).length > 0 ? (
            camps.filter(c => c.type === activeTab).map(camp => (
              <article key={camp.id} className="camp-entry-card">
                <div className="date-tile">
                  <span className="d-day">{camp.day}</span>
                  <span className="d-month">{camp.month}</span>
                </div>
                
                <div className="camp-info-main">
                  <div className="info-top-row">
                    {camp.status && <span className="priority-badge">{camp.status}</span>}
                    <span className="time-text">◷ {camp.time}</span>
                  </div>
                  <h3>{camp.title}</h3>
                  <div className="info-bottom-row">
                    <span className="loc-item"><MapPin size={14}/> {camp.location}</span>
                    <span className="donor-item"><Users size={14}/> {camp.donors} Registered Donors</span>
                  </div>
                </div>

                <div className="camp-entry-actions">
                  {/* REPLACED: Ugly alerts replaced with Info Toasts */}
                  <button className="action-btn" onClick={() => showToast(`Edit mode for ${camp.title} coming soon.`, 'info')}><Pencil size={18} /></button>
                  <button className="action-btn" onClick={() => showToast(`Options panel for ${camp.title}`, 'info')}><MoreVertical size={18} /></button>
                </div>
              </article>
            ))
          ) : (
            <p style={{padding: '20px', color: '#666'}}>No camps found for this category.</p>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="camp-sidebar">
          <div className="sidebar-card logistics">
            <h3>Upcoming Logistics</h3>
            <div className="logistics-item">
              <div className="log-icon icon-red"><Truck size={18}/></div>
              <div className="log-text"><strong>Mobile Unit 42 Maintenance</strong><span>Due in 2 days</span></div>
            </div>
            <div className="logistics-item">
              <div className="log-icon icon-blue"><Box size={18}/></div>
              <div className="log-text"><strong>Refill Storage Kits</strong><span>15 units needed</span></div>
            </div>
            <div className="logistics-item">
              <div className="log-icon icon-pink"><UserCheck size={18}/></div>
              <div className="log-text"><strong>Volunteer Assignment</strong><span>3 staff pending</span></div>
            </div>
          </div>
          <div className="sidebar-card alert-banner">
             <div className="alert-content">
                <span className="alert-label">INVENTORY ALERT</span>
                <h4>O-Negative Supply Low</h4>
                <p>Prioritize outreach for upcoming camps.</p>
             </div>
          </div>
        </aside>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule New Blood Drive</h2>
              <button className="close-x" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleAddCamp}>
              <div className="form-group">
                <label>Camp Title</label>
                <input type="text" placeholder="e.g. City Mall Drive" required value={newCamp.title} onChange={(e) => setNewCamp({...newCamp, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" placeholder="Street name, District" required value={newCamp.location} onChange={(e) => setNewCamp({...newCamp, location: e.target.value})} />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Day</label>
                  <input type="text" placeholder="25" required value={newCamp.day} onChange={(e) => setNewCamp({...newCamp, day: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Month</label>
                  <input type="text" placeholder="DEC" required value={newCamp.month} onChange={(e) => setNewCamp({...newCamp, month: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', border: '1px solid #E5E7EB', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>Cancel</button>
                
                {/* Updated submit button to show loading state */}
                <button type="submit" className="btn-confirm-red" disabled={isSubmitting} style={{ flex: 2, padding: '14px', border: 'none', background: isSubmitting ? '#FCA5A5' : '#C92A2A', color: 'white', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: '800' }}>
                  {isSubmitting ? "Scheduling..." : "Confirm Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}