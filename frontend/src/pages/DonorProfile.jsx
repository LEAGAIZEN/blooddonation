import React, { useState, useEffect } from "react";
import DonorNav from "../components/DonorNav";
import ProfileForm from "../components/ProfileForm"; // <-- Import your new component here
import "../styles/donor-profile.css"; 

export default function DonorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // State variables
  const [fullName, setFullName] = useState("prazz");
  const [email, setEmail] = useState("prazzkira@gmail.com");
  const [phone, setPhone] = useState("0209209424");
  const [bloodGroup, setBloodGroup] = useState("A Negative (A-)");
  const [age, setAge] = useState("24");
  const [weight, setWeight] = useState("4");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const token = localStorage.getItem("token");

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 1);
  };

  useEffect(() => {
    fetch("/users/me", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.fullName) setFullName(data.fullName);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.bloodGroup) setBloodGroup(data.bloodGroup);
        if (data.age) setAge(data.age);
        if (data.weight) setWeight(data.weight);
        if (data.profileImageUrl) setProfileImageUrl(data.profileImageUrl);
      })
      .catch(err => console.log("Using default mock values."));
  }, [token]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImageUrl(URL.createObjectURL(file)); 
    const formData = new FormData();
    formData.append("avatar", file);

    fetch("/users/update-avatar", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    }).catch(err => console.log("Avatar background sync failed."));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setErrorMessage(""); 

    fetch("/users/update-profile", {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ fullName, email, phone, bloodGroup, age, weight })
    })
      .then(res => {
        if (res.ok) {
          setIsEditing(false); 
        } else {
          setErrorMessage("Failed to save changes. Please try again.");
        }
      })
      .catch(err => {
        setErrorMessage("⚠️ Connection error: Changes saved locally, but server is offline.");
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; 
  };

  return (
    <div className="dp-page-wrapper">
      {/* HEADER NAVIGATION */}
      <header className="dp-custom-header">
        <DonorNav />
        <div className="dp-header-profile-zone">
          <div className="dp-mini-avatar-trigger" onClick={() => setShowDropdown(!showDropdown)}>
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="Mini Profile" className="dp-mini-img" />
            ) : (
              <div className="dp-mini-placeholder">{getInitials(fullName)}</div>
            )}
            <span className="dp-dropdown-arrow">▼</span>
          </div>
          {showDropdown && (
            <div className="dp-profile-dropdown">
              <a href="/settings" className="dp-dropdown-item">⚙️ Settings</a>
              <button onClick={handleLogout} className="dp-dropdown-item dp-logout-btn">🚪 Logout</button>
            </div>
          )}
        </div>
      </header>
      
      <main className="dp-main-container">
        <header className="dp-page-header">
          <h1>Donor Profile</h1>
          <p>Manage your vital information and donation history.</p>
        </header>
        
        <div className="dp-content-split">
          {/* LEFT SIDEBAR */}
          <aside className="dp-sidebar-card">
            <div className="dp-avatar-section">
              <div className="dp-avatar-ring">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="User Profile" />
                ) : (
                  <div className="dp-avatar-initials-fallback">{getInitials(fullName)}</div>
                )}
                <label htmlFor="file-input" className="dp-edit-avatar-btn">✎</label>
                <input id="file-input" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
              </div>
              <h2>{fullName}</h2>
              <p>{bloodGroup.toUpperCase()} DONOR</p>
            </div>
            <div className="dp-contribution-box">
              <span className="dp-stat-label">TOTAL BLOOD CONTRIBUTED</span>
              <div className="dp-stat-value">1,800<span>ml</span></div>
            </div>
          </aside>

          {/* LINKED PROFILE FORM COMPONENT */}
          <ProfileForm 
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            bloodGroup={bloodGroup}
            setBloodGroup={setBloodGroup}
            age={age}
            setAge={setAge}
            weight={weight}
            setWeight={setWeight}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            handleSaveProfile={handleSaveProfile}
          />
        </div>

        {/* METRICS ROW */}
        <section className="dp-stats-row">
          <div className="dp-stat-block"><div>⏱️</div><span>DONATIONS</span><strong>04</strong></div>
          <div className="dp-stat-block"><div>❤️</div><span>LIVES SAVED</span><strong>12</strong></div>
          <div className="dp-stat-block"><div>🎖️</div><span>LEVEL</span><strong>Silver</strong></div>
          <div className="dp-stat-block"><div>📅</div><span>SINCE</span><strong>2021</strong></div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer-shell">
        <div className="footer-brand">
          <div className="brand">DONORHUB.</div>
          <p>© 2026 BACKROW LABS. ALL RIGHTS RESERVED.</p>
        </div>
        <div className="footer-links">
          <a href="#">CONTACT US</a>
          <a href="#">PRIVACY POLICY</a>
          <a href="#">TERMS OF SERVICE</a>
          <a href="#">FAQ</a>
        </div>
      </footer>
    </div>
  );
}