import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, MoreVertical, ChevronDown, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import '../styles/user-record.css';

export default function AdminUserRecords() {
  const [users, setUsers] = useState([]);
  const [localSearch, setLocalSearch] = useState("");
  const [bloodFilter, setBloodFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("Any Status");
  
  // Dynamic Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 4;

  const [openMenuId, setOpenMenuId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const menuRef = useRef(null);
  const API_URL = '/admin/users';

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500); 
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Backend Connection Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddOrEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      blood: formData.get('blood'),
      status: editingUser ? editingUser.status : "Active"
    };

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editingUser) {
        await axios.put(`${API_URL}/${editingUser.id}`, userData, config);
        showToast("User updated successfully!", "success");
      } else {
        await axios.post(API_URL, userData, config);
        showToast("New user record created!", "success");
      }
      fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      showToast("Failed to save record. Check backend connection.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record permanently?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.filter(u => u.id !== id));
      showToast("Record deleted.", "info");
      setOpenMenuId(null);
    } catch (err) {
      showToast("Delete failed.", "error");
    }
  };

  // --- LOGIC: FILTERING & PAGINATION ---
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(localSearch.toLowerCase()) || 
                          user.email?.toLowerCase().includes(localSearch.toLowerCase());
    const matchesBlood = bloodFilter === "All Types" || user.blood === bloodFilter;
    const matchesStatus = statusFilter === "Any Status" || user.status === statusFilter;
    return matchesSearch && matchesBlood && matchesStatus;
  });

  // Dynamic Pagination Calculations
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
  const currentUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  if (isLoading) return <div className="admin-loader" style={{padding: '50px', textAlign: 'center'}}>Synchronizing Database...</div>;

  return (
    <div className="user-records-container">
      {/* Sleek Toast Notification */}
      {toast && (
        <div className={`modern-toast ${toast.type}`} style={{ 
          position: 'fixed', top: '30px', right: '40px', zIndex: 99999,
          backgroundColor: toast.type === 'success' ? '#EBFBEE' : '#FFF5F5',
          color: toast.type === 'success' ? '#2B8A3E' : '#C92A2A',
          border: `1px solid ${toast.type === 'success' ? '#B2F2BB' : '#FEE2E2'}`,
          padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700'
        }}>
          {toast.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="user-page-header">
        <div className="header-text">
          <h1>Community Records</h1>
          <p>Oversee the life-saving network across the DonorHub ecosystem.</p>
        </div>
        <button className="btn-add-record" onClick={() => { setEditingUser(null); setIsModalOpen(true); }}>
          Add New Record
        </button>
      </div>

      <section className="user-filters-row">
        <div className="filter-search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Filter by name, email, or ID..." 
            value={localSearch} 
            onChange={(e) => {setLocalSearch(e.target.value); setCurrentPage(1);}} 
          />
        </div>
        
        <div className="filter-dropdown-card">
          <label>BLOOD TYPE</label>
          <div className="select-wrapper">
            <select value={bloodFilter} onChange={(e) => {setBloodFilter(e.target.value); setCurrentPage(1);}}>
              <option>All Types</option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={14} className="custom-arrow" />
          </div>
        </div>

        <div className="filter-dropdown-card">
          <label>STATUS</label>
          <div className="select-wrapper">
            <select value={statusFilter} onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}>
              <option>Any Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Inactive</option>
            </select>
            <ChevronDown size={14} className="custom-arrow" />
          </div>
        </div>
      </section>

      <section className="user-table-card">
        <div className="table-header-grid">
          <div>USER IDENTITY</div><div>CLASSIFICATION</div><div>VITAL SIGN</div><div>INTEGRITY</div><div className="text-right">UTILITY</div>
        </div>

        <div className="table-rows">
          {currentUsers.map((user) => (
            <div key={user.id} className="table-row-grid">
              <div className="user-identity-cell">
                <div className="avatar-square-placeholder">{user.name?.charAt(0)}</div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
              <div><span className={`tag ${user.role?.toLowerCase()}`}>{user.role}</span></div>
              <div><span className="blood-box-pink">{user.blood}</span></div>
              <div className="integrity-cell">
                <span className={`status-dot ${user.status?.toLowerCase()}`}>●</span>
                <span className="status-label">{user.status}</span>
              </div>
              <div className="utility-cell text-right" style={{position: 'relative'}}>
                <button className="btn-more" onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}>
                   <MoreVertical size={18} />
                </button>
                {openMenuId === user.id && (
                  <div className="floating-menu" ref={menuRef} style={{position: 'absolute', right: 0, top: '35px', zIndex: 10, background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: '150px', overflow: 'hidden'}}>
                    <button onClick={() => { setEditingUser(user); setIsModalOpen(true); setOpenMenuId(null); }} style={{display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontWeight: '600', fontSize: '13px'}}>Edit Profile</button>
                    <button onClick={() => handleDelete(user.id)} style={{display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#C92A2A'}}>Delete Record</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="table-footer-pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', borderTop: '1px solid #F5E6E6' }}>
          <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>
            Showing {currentUsers.length} of {filteredUsers.length} community members
          </span>
          
          <div className="pagination-controls" style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
              disabled={currentPage === 1}
              className="page-btn"
            >&lt;</button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button 
                key={num} 
                className={`page-btn ${currentPage === num ? "active" : ""}`} 
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
              disabled={currentPage === totalPages}
              className="page-btn"
            >&gt;</button>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '450px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>{editingUser ? "Edit Profile" : "Add New Record"}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleAddOrEdit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>Full Name</label>
                <input name="name" defaultValue={editingUser?.name} required style={{ width: '100%', padding: '14px', border: '1px solid #E5E7EB', borderRadius: '10px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>Email Address</label>
                <input name="email" type="email" defaultValue={editingUser?.email} required style={{ width: '100%', padding: '14px', border: '1px solid #E5E7EB', borderRadius: '10px', boxSizing: 'border-box' }} />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '24px' }}>
                  <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>Role</label><select name="role" defaultValue={editingUser?.role || "DONOR"} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }}><option value="DONOR">DONOR</option><option value="SEEKER">SEEKER</option><option value="ADMIN">ADMIN</option></select></div>
                  <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>Blood Type</label><select name="blood" defaultValue={editingUser?.blood || "O+" } style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }}>{["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <button type="submit" className="submit-btn" disabled={isSubmitting} style={{ width: '100%', padding: '16px', background: isSubmitting ? '#FCA5A5' : '#C92A2A', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                {isSubmitting ? "Saving..." : "Save Record"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}