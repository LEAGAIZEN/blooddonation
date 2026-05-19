import { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/adminprofile.css"; 
import { User, Mail, ShieldCheck, MapPin } from "lucide-react";

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    accessLevel: "Loading...",
    hub: "Loading..."
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState(null); // Replaces the ugly alert()

  // 1. Fetch real profile data on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        // Using standard users/me, assuming admins use the same auth flow
        const response = await axios.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProfile({
          fullName: response.data.fullName || "",
          email: response.data.email || "",
          accessLevel: response.data.role || "Level 4 (Full Audit)",
          hub: response.data.hub || "Central District"
        });
      } catch (error) {
        console.error("Failed to load admin profile:", error);
        setMessage({ type: "error", text: "Could not load profile data. Check connection." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (message) setMessage(null); // Clear messages when typing
  };

  // 2. Send updates to the backend
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      
      // Update endpoint for user data
      await axios.put("/users/update-profile", {
        fullName: profile.fullName,
        email: profile.email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: "success", text: "Profile synchronized with central database successfully!" });
    } catch (error) {
      console.error("Update failed:", error);
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div style={{padding: '50px', textAlign: 'center', color: '#666'}}>Loading Profile...</div>;
  }

  return (
    <div className="admin-profile-container">
      <div className="profile-header-section">
        <h1>Administrative Profile</h1>
        <p>Manage your account credentials, security settings, and system access levels.</p>
      </div>

      <div className="admin-profile-grid">
        {/* LEFT COLUMN: Identity Card */}
        <div className="profile-identity-card">
          <div className="profile-avatar-navy">
            {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="identity-meta">
            <h2>{profile.fullName || "Admin User"}</h2>
            <span className="admin-status-pill">SUPERUSER ACCESS</span>
          </div>
          <div className="identity-stats">
            <div className="stat-item">
              <span className="stat-val">Admin</span>
              <span className="stat-lbl">Role</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-val">Active</span>
              <span className="stat-lbl">Status</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Form Details */}
        <div className="profile-details-card">
          <h3>Account Information</h3>
          
          {/* Custom Message Banner instead of alert() */}
          {message && (
            <div style={{
              padding: '12px', 
              marginBottom: '20px', 
              borderRadius: '6px', 
              fontSize: '13px', 
              fontWeight: '600',
              backgroundColor: message.type === 'success' ? '#EBFBEE' : '#FFF5F5',
              color: message.type === 'success' ? '#2B8A3E' : '#C92A2A',
              border: `1px solid ${message.type === 'success' ? '#B2F2BB' : '#FEE2E2'}`
            }}>
              {message.text}
            </div>
          )}

          <form className="admin-details-form" onSubmit={handleUpdate}>
            <div className="admin-input-group">
              <label><User size={14}/> FULL NAME</label>
              <input 
                type="text" 
                name="fullName"
                value={profile.fullName} 
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div className="admin-input-group">
              <label><Mail size={14}/> EMAIL ADDRESS</label>
              <input 
                type="email" 
                name="email"
                value={profile.email} 
                onChange={handleChange}
                placeholder="admin@donorhub.org"
                required
              />
            </div>

            <div className="admin-input-row">
              <div className="admin-input-group">
                <label><ShieldCheck size={14}/> ACCESS LEVEL</label>
                <input type="text" value={profile.accessLevel} readOnly className="readonly-input" />
              </div>
              <div className="admin-input-group">
                <label><MapPin size={14}/> PRIMARY HUB</label>
                <input type="text" value={profile.hub} readOnly className="readonly-input" />
              </div>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="btn-update-profile-final" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}