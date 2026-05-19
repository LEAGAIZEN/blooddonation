import '../styles/admin-global.css';

export default function AdminFooter() {
  return (
    <footer className="global-system-footer">
      <div className="footer-top-row">
        
        {/* Brand/Mission Column */}
        <div className="footer-brand-column">
          <h3 className="footer-brand-title">DonorHub</h3>
          <p className="footer-brand-tagline">
            Securing the vital lifeline of our community through technology, 
            coordination, and institutional transparency.
          </p>
        </div>
        
        {/* Navigation Map Column Groups */}
        <div className="footer-directory-links">
          <div className="directory-group">
            <h4>SYSTEMS</h4>
            <a href="#status">Network Status</a>
            <a href="#docs">API Documentation</a>
            <a href="#safety">Safety Protocols</a>
          </div>
          
          <div className="directory-group">
            <h4>GOVERNANCE</h4>
            <a href="#privacy">Privacy Policy</a>
            <a href="#ethics">Ethics Committee</a>
            <a href="#compliance">Compliance</a>
          </div>
        </div>

        {/* Highlighted Hotline Block Widget */}
        <div className="footer-contact-card">
          <span className="contact-meta-heading">EMERGENCY HOTLINE</span>
          <span className="contact-tel-number">0-800-VITAL-HUB</span>
        </div>
      </div>

      <hr className="footer-horizontal-divider" />

      {/* Copyright and Legal Badges Line */}
      <div className="footer-bottom-row">
        <span className="copyright-notice">
          © {new Date().getFullYear()} DONORHUB MEDICAL ADMINISTRATION. ALL RIGHTS RESERVED.
        </span>
        <div className="compliance-badges">
          <span className="badge-item">SECURITY AUDITED</span>
          <span className="badge-item">DATA INTEGRITY VERIFIED</span>
        </div>
      </div>
    </footer>
  );
}