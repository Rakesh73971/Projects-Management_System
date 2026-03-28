
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">

      {/* Left: logo + copyright */}
      <div className="footer__left">
        <div className="footer__logo-icon">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
          </svg>
        </div>
        <span className="footer__copyright">
          © {year} Planflow. All rights reserved.
        </span>
      </div>

      {/* Right: links */}
      <div className="footer__links">
        {["Docs", "Support", "Privacy"].map((link) => (
          <span key={link} className="footer__link">{link}</span>
        ))}
      </div>
    </footer>
  );
}