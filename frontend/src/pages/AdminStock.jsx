import { useState, useEffect } from 'react';
import axios from 'axios';
import { Filter, Menu, X, CheckCircle, AlertCircle, Info } from 'lucide-react'; 
import '../styles/adminstock.css'; 

export default function AdminStock() {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Table Control States
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sortOrder, setSortOrder] = useState(null); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [newBatch, setNewBatch] = useState({ type: "", units: "", collected: "" });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500); 
  };

  useEffect(() => {
    const fetchStock = async () => {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const res = await axios.get('/admin/inventory', config);
        setInventory(res.data);
      } catch (error) {
        console.error("Database connection failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStock();
  }, []);

  // --- TABLE LOGIC: Filter, Sort, and Paginate ---
  let processedInventory = [...inventory];

  if (searchTerm) {
    processedInventory = processedInventory.filter(item => 
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (sortOrder === 'asc') {
    processedInventory.sort((a, b) => a.units - b.units);
  } else if (sortOrder === 'desc') {
    processedInventory.sort((a, b) => b.units - a.units);
  }

  const totalPages = Math.ceil(processedInventory.length / itemsPerPage);
  const paginatedInventory = processedInventory.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const toggleSort = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    showToast(`Sorting by Units: ${newOrder === 'desc' ? 'High to Low' : 'Low to High'}`, 'info');
  };
  // ------------------------------------------------

  const getStatus = (units) => {
    const percentage = Math.min((units / 1000) * 100, 100);
    if (percentage < 10) return { label: "CRITICAL STOCK", isDanger: true, isModerate: false, percentage };
    if (percentage < 20) return { label: "LOW STOCK", isDanger: true, isModerate: false, percentage };
    if (percentage < 50) return { label: "MODERATE", isDanger: false, isModerate: true, percentage };
    return { label: "HEALTHY SUPPLY", isDanger: false, isModerate: false, percentage };
  };

  const handleAddBatchClick = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNewBatch({ type: "", units: "", collected: "" });
  };
  
  const handleExport = () => {
    if (inventory.length === 0) return showToast("No data available to export.", "error");
    showToast("Generating CSV Inventory Report...", "info");

    const headers = ["ID,Blood Type,Units (ml),Collection Date,Expiry Date"];
    const rows = inventory.map(item => `"${item.id || 'N/A'}","${item.type}","${item.units}","${item.collected}","${item.expiry || 'Pending'}"`);
    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `DonorHub_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => showToast("Export downloaded successfully!", "success"), 1000);
  };

  const handleDispatch = () => showToast("Emergency protocol initiated! Central Hub notified.", "danger");

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/admin/inventory', 
        { type: newBatch.type, units: Number(newBatch.units), collected: newBatch.collected },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInventory([response.data, ...inventory]);
      closeModal();
      showToast(`${newBatch.type} batch successfully added to inventory!`, "success");
    } catch (error) {
      showToast("Failed to connect to database. Try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="admin-loader" style={{padding: '50px', textAlign: 'center'}}>Loading Stock Data...</div>;

  return (
    <div className="stock-page-container">
      
      {toast && (
        <div style={{
          position: 'fixed', top: '30px', right: '40px', display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', zIndex: 99999,
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)', transition: 'all 0.3s ease',
          backgroundColor: toast.type === 'success' ? '#EBFBEE' : toast.type === 'error' ? '#FFF5F5' : toast.type === 'danger' ? '#C92A2A' : '#F8F9FA',
          color: toast.type === 'success' ? '#2B8A3E' : toast.type === 'error' ? '#C92A2A' : toast.type === 'danger' ? '#FFFFFF' : '#1A1A1A',
          border: `1px solid ${toast.type === 'success' ? '#B2F2BB' : toast.type === 'error' ? '#FEE2E2' : toast.type === 'danger' ? '#A61E1E' : '#E5E7EB'}`,
        }}>
          {toast.type === 'success' && <CheckCircle size={18} />}
          {(toast.type === 'error' || toast.type === 'danger') && <AlertCircle size={18} />}
          {toast.type === 'info' && <Info size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="stock-page-header">
        <div className="stock-header-text">
          <span className="stock-mini-title">INVENTORY MANAGEMENT</span>
          <h1>Stock Vitality</h1>
          <p>Real-time oversight of life-saving assets. Monitor blood group distribution, track expiration timelines, and manage critical reserves.</p>
        </div>
        <div className="stock-header-actions">
          <button className="btn-add-batch" onClick={handleAddBatchClick}>+ Add New Batch</button>
          <button className="btn-export" onClick={handleExport}>Export Report</button>
        </div>
      </div>

      <section className="stock-summary-grid">
        <div className="summary-card critical-card">
          <span className="summary-label">Critical Reserves</span>
          <div className="critical-metric"><span className="metric-large">12%</span><span className="metric-small">Low Inventory Alert</span></div>
          <p>O- and AB+ groups require immediate replenishment.</p>
        </div>
        <div className="summary-card standard-card">
          <span className="summary-label">Total Units</span>
          <div className="standard-metric"><span className="metric-large">{inventory.reduce((acc, curr) => acc + curr.units, 0)}</span><span className="metric-unit">ml</span></div>
          <p className="trend-up">↗ +5.2% from last month</p>
        </div>
        <div className="summary-card standard-card">
          <span className="summary-label">Upcoming Expirations</span>
          <div className="standard-metric"><span className="metric-large">14</span><span className="metric-unit">batches</span></div>
          <p className="trend-danger">◷ Action required in 48h</p>
        </div>
      </section>

      <section className="stock-table-card">
        <div className="table-header-flex">
          <h2>Inventory Details</h2>
          <div className="filter-icons-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Dynamic Search Input */}
            {showSearch && (
              <input 
                type="text" 
                placeholder="Search Blood Type..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="inline-search-input fade-in"
              />
            )}
            <button className="square-icon-btn" onClick={() => setShowSearch(!showSearch)} title="Filter">
              <Filter size={16} color={showSearch ? "#C92A2A" : "#666"} />
            </button>
            <button className="square-icon-btn" onClick={toggleSort} title="Sort by Units">
              <Menu size={16} color={sortOrder ? "#C92A2A" : "#666"} />
            </button>
          </div>
        </div>

        <div className="table-grid-header">
          <div>BLOOD TYPE</div>
          <div>INVENTORY STATUS</div>
          <div>UNITS AVAILABLE</div>
          <div>COLLECTION DATE</div>
          <div>EXPIRY DATE</div>
        </div>

        <div className="table-rows-container">
          {paginatedInventory.length > 0 ? (
            paginatedInventory.map((item) => {
              const statusInfo = getStatus(item.units);
              return (
                <div key={item.id} className="table-grid-row fade-in">
                  <div><span className="blood-type-box">{item.type}</span></div>
                  <div className="status-cell">
                    <div className="status-progress-bg">
                      <div className={`status-progress-fill ${statusInfo.isDanger ? 'danger' : statusInfo.isModerate ? 'moderate' : 'healthy'}`} style={{ width: `${statusInfo.percentage}%` }} />
                    </div>
                    <span className={`status-label ${statusInfo.isDanger ? 'danger-text' : ''}`}>{statusInfo.label}</span>
                  </div>
                  <div><span className={`units-text ${statusInfo.isDanger ? 'danger-text' : ''}`}>{item.units} ml</span></div>
                  <div className="date-text">{item.collected}</div>
                  <div className={`date-text ${statusInfo.isDanger ? 'danger-text' : ''}`}>{item.expiry || "Pending..."}</div>
                </div>
              );
            })
          ) : (
            <div className="empty-state-message">No inventory batches found.</div>
          )}
        </div>

        <div className="table-footer">
          <span>SHOWING {paginatedInventory.length} OF {processedInventory.length} BATCHES</span>
          <div className="pagination-group">
            <button 
              className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`} 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >‹ Previous</button>
            <button 
              className={`page-btn ${currentPage >= totalPages ? 'disabled' : 'active'}`} 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >Next ›</button>
          </div>
        </div>
      </section>

      <section className="stock-bottom-grid">
        <div className="storage-section">
          <h2>Storage Conditions</h2>
          <div className="storage-cards-wrapper">
            <div className="storage-card">
              <div className="storage-icon icon-blue">🌡</div>
              <div className="storage-info"><span className="storage-val">2.4°C</span><span className="storage-lbl">COOLER 01 TEMP</span></div>
            </div>
            <div className="storage-card">
              <div className="storage-icon icon-red">💧</div>
              <div className="storage-info"><span className="storage-val">42%</span><span className="storage-lbl">FACILITY HUMIDITY</span></div>
            </div>
          </div>
        </div>
        <div className="dispatch-card">
          <span className="dispatch-lbl">EMERGENCY DISPATCH</span>
          <h3 className="dispatch-title">Request urgent delivery from Central Hub</h3>
          <button className="btn-dispatch-black" onClick={handleDispatch}>Initiate Protocol</button>
        </div>
      </section>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Blood Batch</h2>
              <button className="close-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label>Blood Type</label>
                <select required value={newBatch.type} onChange={(e) => setNewBatch({...newBatch, type: e.target.value})}>
                  <option value="">Select Type...</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>
              <div className="form-group">
                <label>Units (ml)</label>
                <input type="number" placeholder="e.g. 450" required value={newBatch.units} onChange={(e) => setNewBatch({...newBatch, units: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Collection Date</label>
                <input type="date" required value={newBatch.collected} onChange={(e) => setNewBatch({...newBatch, collected: e.target.value})} />
              </div>
              <button type="submit" className="submit-batch-btn" disabled={isSubmitting}>
                {isSubmitting ? "Saving Data..." : "Save Batch Data"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}