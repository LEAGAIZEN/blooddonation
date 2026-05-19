import '../styles/admin-global.css';

export default function AdminFooter() {
  return (
    <footer className="global-system-footer">
      <div className="footer-bottom-row">
        <span className="footer-brand-title" style={{marginRight: '2rem'}}>DONORHUB.</span>
        <span className="copyright-notice">© {new Date().getFullYear()} BACKROW LABS. ALL RIGHTS RESERVED.</span>
        
        <div className="compliance-badges" style={{marginLeft: 'auto', display: 'flex', gap: '1.5rem'}}>
          <span className="badge-item">CONTACT US</span>
          <span className="badge-item">PRIVACY POLICY</span>
          <span className="badge-item">TERMS OF SERVICE</span>
          <span className="badge-item">FAQ</span>
        </div>
      </div>
    </footer>
  );
}