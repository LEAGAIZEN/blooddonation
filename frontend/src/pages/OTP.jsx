import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/otp.css"; 

export default function OTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30); 
  const [errorMessage, setErrorMessage] = useState("");
  const inputRefs = useRef([]); 

  // Send OTP function
  const sendOtp = async () => {
    try {
      const response = await fetch("/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to send OTP");
      if (data.otp) {
        alert(`[Development Mode] Your resent OTP code is: ${data.otp}`);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Send OTP on mount (disabled because backend automatically sends it on /login and /signup)
  useEffect(() => {
    // if (email) sendOtp();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Handle Digit Input
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    if (errorMessage) setErrorMessage("");

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace focus
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length < 6) {
      setErrorMessage("Please enter complete 6-digit OTP");
      return;
    }
    setErrorMessage(""); 

    try {
      const response = await fetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: finalOtp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Verification failed");

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
      }
      // Redirect based on role returned by the server
      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(30);
      setErrorMessage("");
      sendOtp();
    }
  };

  return (
    <div className="ui-page auth-page otp-bg">
      
      <header className="otp-header">
        <div className="brand">DONORHUB</div>
      </header>

      <main className="otp-main-content">
        <div className="auth-card otp-card">
          <div className="otp-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="m9 11 2 2 4-4"></path>
            </svg>
          </div>

          <h2>Verify Account</h2>
          <p>Enter the 6-digit code sent to <strong>{email}</strong></p>

          {errorMessage && (
            <div className="form-error-msg">
              {errorMessage}
            </div>
          )}

          <div className="otp-row">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="otp-input"
                type="text"
                inputMode="numeric"
              />
            ))}
          </div>

          <button className="btn primary block" onClick={handleVerify}>
            VERIFY
          </button>

          <div className="resend-section">
            <p className="switch-copy">Didn't receive the code?</p>
            <button 
              className={`resend-link ${timer > 0 ? "disabled" : ""}`} 
              onClick={handleResend}
              disabled={timer > 0}
            >
              {timer > 0 ? `RESEND IN ${timer}S` : "RESEND CODE"}
            </button>
          </div>
        </div>
      </main>

      <p className="secure-note">
        SECURE VERIFICATION POWERED BY DONORHUB ENCRYPTION PROTOCOLS.
      </p>

      <footer className="footer-shell auth-footer">
        <div className="footer-brand">
          <div className="brand">DONORHUB.</div>
          <p>© 2024 BACKROW LABS. ALL RIGHTS RESERVED.</p>
        </div>
        
        <div className="footer-links">
          <a href="#contact">CONTACT US</a>
          <a href="#privacy">PRIVACY POLICY</a>
          <a href="#terms">TERMS OF SERVICE</a>
          <a href="#faq">FAQ</a>
        </div>
      </footer>
    </div>
  );
}