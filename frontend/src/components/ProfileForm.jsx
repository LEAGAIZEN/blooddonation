import React from "react";

export default function ProfileForm({
  isEditing,
  setIsEditing,
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  bloodGroup,
  setBloodGroup,
  age,
  setAge,
  weight,
  setWeight,
  errorMessage,
  setErrorMessage,
  handleSaveProfile
}) {
  return (
    <section className="dp-form-card">
      <form onSubmit={handleSaveProfile}>
        <div className="dp-form-grid">
          <div className="dp-input-group">
            <label>FULL NAME</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} readOnly={!isEditing} />
          </div>
          <div className="dp-input-group">
            <label>EMAIL ADDRESS</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} readOnly={!isEditing} />
          </div>
          <div className="dp-input-group">
            <label>PHONE NUMBER</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} readOnly={!isEditing} />
          </div>
          <div className="dp-input-group">
            <label>BLOOD GROUP</label>
            <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} disabled={!isEditing}>
              <option value="A Negative (A-)">A Negative (A-)</option>
              <option value="A Positive (A+)">A Positive (A+)</option>
              <option value="O Positive (O+)">O Positive (O+)</option>
              <option value="O Negative (O-)">O Negative (O-)</option>
              <option value="B Positive (B+)">B Positive (B+)</option>
              <option value="B Negative (B-)">B Negative (B-)</option>
              <option value="AB Positive (AB+)">AB Positive (AB+)</option>
              <option value="AB Negative (AB-)">AB Negative (AB-)</option>
            </select>
          </div>
          <div className="dp-input-group">
            <label>AGE</label>
            <input type="text" value={age} onChange={e => setAge(e.target.value)} readOnly={!isEditing} />
          </div>
          <div className="dp-input-group">
            <label>WEIGHT (KG)</label>
            <input type="text" value={weight} onChange={e => setWeight(e.target.value)} readOnly={!isEditing} />
          </div>
        </div>

        <div className="dp-eligibility-box">
          <div className="dp-eligibility-header"><span>LAST DONATION DATE</span><strong>October 14, 2023</strong></div>
          <div className="dp-progress-track"><div className="dp-progress-fill" style={{ width: "75%" }}></div></div>
          <p>Next eligibility: January 14, 2024</p>
        </div>

        {/* INLINE ERROR TEXT BOX */}
        {errorMessage && <div className="dp-inline-error">{errorMessage}</div>}

        {/* ACTION TOGGLE BUTTONS */}
        <div className="dp-form-actions">
          {!isEditing ? (
            <button type="button" className="dp-update-btn" onClick={() => setIsEditing(true)}>Update Profile</button>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" className="dp-update-btn cancel-btn" onClick={() => { setIsEditing(false); setErrorMessage(""); }}>Cancel</button>
              <button type="submit" className="dp-update-btn save-btn">Save Changes</button>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}