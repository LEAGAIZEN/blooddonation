import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from 'lucide-react';
import "../styles/signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bloodGroup: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage("");
  };

  const handleSignup = async () => {
    const { fullName, email, phone, bloodGroup, password, confirmPassword } = formData;

    if (!fullName || !email || !phone || !bloodGroup || !password || !confirmPassword) {
      setErrorMessage("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, bloodGroup, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to create account.");

      // Removed alert - Redirect to OTP with state
      if (data.otp) {
        alert(`[Development Mode] Your OTP code is: ${data.otp}`);
      }
      navigate("/otp", { state: { email: formData.email } });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <div className="brand-header">
          <span className="drop-icon">🩸</span>
          <span className="brand-name">DONORHUB</span>
        </div>

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join our community of life-savers and start your journey today.</p>

        {errorMessage && <div className="error-text">{errorMessage}</div>}

        <div className="form-grid">
          <div className="input-group">
            <label>FULL NAME</label>
            <input type="text" name="fullName" placeholder="Enter your name" onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>EMAIL</label>
            <input type="email" name="email" placeholder="name@example.com" onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>PHONE NUMBER</label>
            <input type="text" name="phone" placeholder="+1 (555) 000-0000" onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>BLOOD GROUP</label>
            <select name="bloodGroup" onChange={handleChange}>
              <option value="">Select Group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Password with Toggle */}
          <div className="input-group">
            <label>PASSWORD</label>
            <div style={{position: 'relative'}}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="••••••••" 
                onChange={handleChange} 
                style={{width: '100%'}}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888'}}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password with Toggle */}
          <div className="input-group">
            <label>CONFIRM PASSWORD</label>
            <div style={{position: 'relative'}}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                placeholder="••••••••" 
                onChange={handleChange} 
                style={{width: '100%'}}
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888'}}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <button className="signup-btn" onClick={handleSignup} disabled={isLoading}>
          {isLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
        </button>

        <p className="switch-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>

      <div className="badge-strip">
        <div className="badge-item"><span>🛡</span> SECURE DATA</div>
        <div className="badge-item"><span>🤲</span> VITAL IMPACT</div>
        <div className="badge-item"><span>📍</span> SMART MATCHING</div>
      </div>

      <footer className="auth-footer">
        <div className="footer-left">
          <div className="footer-logo">DONORHUB.</div>
          <p>© 2026 BACKROW LABS. ALL RIGHTS RESERVED.</p>
        </div>
        <div className="footer-right">
          <Link to="/contact">CONTACT US</Link>
          <Link to="/privacy">PRIVACY POLICY</Link>
          <Link to="/terms">TERMS OF SERVICE</Link>
          <Link to="/faq">FAQ</Link>
        </div>
      </footer>
    </div>
  );
}