import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell, UploadCloud } from "lucide-react";
import axios from "axios";
import "../styles/request.css";

export default function Request() {

  const navigate = useNavigate();

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────

  const [isEmergency, setIsEmergency] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const dropdownRef = useRef(null);

  // ─────────────────────────────────────────────
  // PROFILE MENU CLOSE
  // ─────────────────────────────────────────────

  useEffect(() => {

    function handleClickOutside(event) {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);

  // ─────────────────────────────────────────────
  // FORM DATA
  // ─────────────────────────────────────────────

  const [formData, setFormData] = useState({
    recipientName: "",
    contactNumber: "",
    hospitalName: "",
    bloodGroup: "",
    unitsNeeded: "",
    reason: "",
    agreed: false,
  });

  // ─────────────────────────────────────────────
  // INPUT CHANGE
  // ─────────────────────────────────────────────

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked
    } = e.target;

    if (errorMessage) {
      setErrorMessage("");
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ─────────────────────────────────────────────
  // FILE UPLOAD
  // ─────────────────────────────────────────────

  const handleFileUpload = (e) => {

    const file = e.target.files[0];

    if (file) {

      setFileName(file.name);
      setSelectedFile(file);
    }
  };

  // ─────────────────────────────────────────────
  // SUBMIT FORM
  // ─────────────────────────────────────────────

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!formData.agreed) {

      alert(
        "Please agree to Terms & Conditions."
      );

      return;
    }

    setIsSubmitting(true);

    const payload = new FormData();

    payload.append(
      "isEmergency",
      isEmergency
    );

    Object.keys(formData).forEach((key) => {

      payload.append(
        key,
        formData[key]
      );
    });

    if (selectedFile) {

      payload.append(
        "document",
        selectedFile
      );
    }

    try {

      // ─────────────────────────────────────────────
      // FASTAPI REQUEST
      // ─────────────────────────────────────────────

      await axios.post(
        "/request",
        payload
      );

      alert(
        "Blood request submitted successfully!"
      );

      navigate("/dashboard");

    } catch (error) {

      console.error(
        "FastAPI Error:",
        error
      );

      alert(
        "Submission failed. Check backend console."
      );

    } finally {

      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <div className="request-page">

      {/* NAVBAR */}

      <header className="form-navbar">

        <Link className="brand" to="/">
          DONORHUB
        </Link>

        <nav className="center-links">
          <Link to="/">Home</Link>
          <Link to="/donation">
            Donate
          </Link>

          <Link
            to="/request"
            className="active"
          >
            Request
          </Link>
        </nav>

        <div className="nav-right">

          <button className="icon-btn">
            <Bell
              size={22}
              strokeWidth={2}
              color="#C92A2A"
            />
          </button>

          <div
            className="profile-menu-container"
            ref={dropdownRef}
          >

            <div
              className="nav-avatar"
              onClick={() =>
                setIsProfileOpen(
                  !isProfileOpen
                )
              }
            ></div>

            {isProfileOpen && (

              <div className="profile-dropdown-menu">

                <div className="user-info-header">
                  <strong>Demo User</strong>
                  <span>
                    donorhub@example.com
                  </span>
                </div>

                <div className="menu-links">
                  <Link to="/dashboard">
                    Dashboard
                  </Link>

                  <Link to="/settings">
                    Settings
                  </Link>
                </div>

                <button
                  onClick={() =>
                    navigate("/login")
                  }
                  className="logout-btn"
                >
                  Logout
                </button>

              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="request-container">

        <div className="request-header-center">

          <div className="medical-icon-box">
            🩸
          </div>

          <span className="red-eyebrow">
            MEDICAL ASSISTANCE
          </span>

          <h1>
            Request Blood Support
          </h1>

          <p>
            Immediate vital resource allocation
            for patients in need.
          </p>
        </div>

        {errorMessage && (
          <div className="error-banner">
            {errorMessage}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="request-form-card"
        >

          {/* EMERGENCY */}

          <div className="emergency-banner">

            <div className="alert-text">

              <span className="alert-icon">
                ⚠️
              </span>

              <div>
                <strong>
                  Is this an emergency?
                </strong>

                <p>
                  Emergency requests are
                  prioritized.
                </p>
              </div>
            </div>

            <label className="ios-toggle">

              <input
                type="checkbox"
                checked={isEmergency}
                onChange={() =>
                  setIsEmergency(
                    !isEmergency
                  )
                }
              />

              <span className="slider"></span>

            </label>
          </div>

          {/* INPUTS */}

          <div className="input-grid mt-2rem">

            <div className="input-block">
              <label>
                RECIPIENT NAME
              </label>

              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                placeholder="Full legal name"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-block">
              <label>
                CONTACT NUMBER
              </label>

              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                placeholder="+977 98XXXXXXXX"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-block full-width mt-1rem">

            <label>HOSPITAL NAME</label>

            <input
              type="text"
              name="hospitalName"
              value={formData.hospitalName}
              placeholder="Medical facility"
              onChange={handleChange}
              required
            />
          </div>

          {/* BLOOD GROUP */}

          <div className="input-grid unit-row mt-1rem">

            <div className="input-block">

              <label>
                BLOOD GROUP NEEDED
              </label>

              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Group
                </option>

                {[
                  "A+",
                  "A-",
                  "B+",
                  "B-",
                  "AB+",
                  "AB-",
                  "O+",
                  "O-",
                ].map((type) => (

                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-block">

              <label>
                UNITS NEEDED
              </label>

              <input
                type="number"
                name="unitsNeeded"
                value={formData.unitsNeeded}
                placeholder="0"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* FILE */}

          <div className="input-block full-width mt-2rem">

            <label>
              DOCTOR RECOMMENDATION
            </label>

            <div className="dashed-upload">

              <input
                type="file"
                id="file-upload"
                hidden
                onChange={handleFileUpload}
                accept=".pdf,.png,.jpg,.jpeg"
              />

              <label htmlFor="file-upload">

                <UploadCloud
                  color="#A8A2A2"
                  size={28}
                />

                <strong>
                  {fileName ||
                    "Click to upload"}
                </strong>

                <p>
                  PDF, PNG or JPG
                </p>

              </label>
            </div>
          </div>

          {/* REASON */}

          <div className="input-block full-width mt-1rem">

            <label>
              REASON FOR REQUEST
            </label>

            <textarea
              name="reason"
              value={formData.reason}
              placeholder="Explain the emergency..."
              rows="4"
              onChange={handleChange}
              required
            />
          </div>

          {/* TERMS */}

          <div className="form-footer mt-2rem">

            <label className="agree-checkbox left-align">

              <input
                type="checkbox"
                name="agreed"
                checked={formData.agreed}
                onChange={handleChange}
              />

              <span>
                I agree to Terms &
                Conditions.
              </span>
            </label>

            <button
              type="submit"
              className="submit-form-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Processing..."
                : "Submit Request"}
            </button>
          </div>
        </form>
      </main>

      {/* TERMS MODAL */}

      {showTerms && (

        <div
          className="terms-modal-overlay"
          onClick={() =>
            setShowTerms(false)
          }
        >

          <div
            className="terms-modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h2>
              Terms & Conditions
            </h2>

            <div className="terms-text-box">

              <p>
                1. Requests are verified
                before approval.
              </p>

              <p>
                2. Blood is only for
                medical use.
              </p>

              <p>
                3. Stock availability may
                vary.
              </p>
            </div>

            <button
              className="submit-form-btn"
              onClick={() =>
                setShowTerms(false)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}

      <footer className="form-footer-nav">

        <div className="footer-brand">

          <strong>
            DONORHUB.
          </strong>

          <p>
            © 2026 BACKROW LABS.
          </p>
        </div>

        <div className="footer-links">

          <a href="#">
            CONTACT
          </a>

          <a href="#">
            PRIVACY
          </a>

          <a href="#">
            TERMS
          </a>

          <a href="#">
            FAQ
          </a>
        </div>
      </footer>
    </div>
  );
}