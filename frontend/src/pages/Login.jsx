import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; 
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please fill all fields");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Invalid credentials");

      if (data.access_token) {
        // Admin gets a direct token — redirect to admin panel
        localStorage.setItem("token", data.access_token);
        if (data.user?.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        // Regular user — goes through OTP flow
        if (data.otp) {
          alert(`[Development Mode] Your OTP code is: ${data.otp}`);
        }
        navigate("/otp", { state: { email: data.email || username } });
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="vertical-copy">SECURE PORTAL ACCESS SYSTEM</div>

      <div className="auth-container">
        <div className="auth-logo-stack">
          <div className="brand-header">
            <span className="drop-icon"></span>
            DONORHUB
          </div>
          <p className="tagline">Vital Minimalism in Healthcare</p>
        </div>

        <div className="auth-card">
          <h2>Welcome back</h2>
          <p>Please enter your details to sign in.</p>

          {errorMessage && <div className="error-banner">{errorMessage}</div>}

          <div className="input-group">
            <label>USERNAME</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <div className="label-row">
              <label>PASSWORD</label>
              <Link to="/forgot-password" style={{fontSize: '12px', color: '#C92A2A', textDecoration: 'none', fontWeight: 700}}>Forgot?</Link>
            </div>
            <div className="password-wrapper" style={{position: 'relative'}}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                style={{width: '100%', paddingRight: '45px'}}
              />
              <button 
                type="button"
                className="toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', 
                  right: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: '#888',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleLogin} 
            disabled={isLoading}
          >
            {isLoading ? "AUTHENTICATING..." : "Login"}
          </button>

          <p className="switch-text">
            Don't have an account? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>

      <footer className="auth-footer">
        <div className="footer-left">
          <strong>DONORHUB.</strong>
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