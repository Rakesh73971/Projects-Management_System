
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((seg, i) => <path key={i} d={seg} />) : <path d={d} />}
  </svg>
);

const MENU_ICON   = ["M3 12h18","M3 6h18","M3 18h18"];
const SEARCH_ICON = "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35";
const BELL_ICON   = ["M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 01-3.46 0"];
const PLUS_ICON   = ["M12 5v14","M5 12h14"];
const CHEVRON     = "M6 9l6 6 6-6";

// Replace with real API data
const MOCK_NOTIFICATIONS = [
  { id: 1, text: "Sara Kim completed 'Validate DB schema'",          time: "2m ago",  read: false },
  { id: 2, text: "Tom Walsh assigned you a task in Platform Redesign", time: "18m ago", read: false },
  { id: 3, text: "New member joined Acme Corp",                      time: "1h ago",  read: true  },
];

export default function Navbar({ onMenuClick, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchVal,   setSearchVal]   = useState("");

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <header className="navbar">

      {/* Hamburger */}
      <button className="navbar__menu-btn" onClick={onMenuClick}>
        <Icon d={MENU_ICON} size={15} />
      </button>

      {/* Title */}
      <div className="navbar__title-wrap">
        <div className="navbar__title">{title}</div>
        {subtitle && <div className="navbar__subtitle">{subtitle}</div>}
      </div>

      {/* Search */}
      <div className="navbar__search">
        <span className="navbar__search-icon">
          <Icon d={SEARCH_ICON} size={13} />
        </span>
        <input
          className="navbar__search-input"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Search tasks, projects…"
        />
      </div>

      {/* Notifications */}
      <div className="navbar__notif-wrap" ref={notifRef}>
        <button
          className="navbar__notif-btn"
          onClick={() => { setNotifOpen((p) => !p); setProfileOpen(false); }}
        >
          <Icon d={BELL_ICON} size={16} />
          {unreadCount > 0 && <span className="navbar__notif-dot" />}
        </button>

        {notifOpen && (
          <div className="navbar__notif-dropdown">
            <div className="navbar__notif-header">
              <span className="navbar__notif-heading">Notifications</span>
              {unreadCount > 0 && (
                <span className="navbar__notif-mark-all">Mark all read</span>
              )}
            </div>
            {MOCK_NOTIFICATIONS.map((n) => (
              <div key={n.id} className={`navbar__notif-item navbar__notif-item--${n.read ? "read" : "unread"}`}>
                {!n.read && <span className="navbar__notif-dot-inline" />}
                <div style={{ flex: 1, paddingLeft: n.read ? 17 : 0 }}>
                  <div className="navbar__notif-text">{n.text}</div>
                  <div className="navbar__notif-time">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* + New */}
      <button className="navbar__new-btn" onClick={() => navigate("/projects/new")}>
        <Icon d={PLUS_ICON} size={13} />
        New
      </button>

      {/* Profile */}
      <div className="navbar__profile-wrap" ref={profileRef}>
        <div
          className="navbar__profile-pill"
          onClick={() => { setProfileOpen((p) => !p); setNotifOpen(false); }}
        >
          <div className="navbar__profile-avatar">{initials}</div>
          <span className="navbar__profile-name">{user?.name?.split(" ")[0] ?? "User"}</span>
          <span className="navbar__profile-chevron"><Icon d={CHEVRON} size={13} /></span>
        </div>

        {profileOpen && (
          <div className="navbar__profile-dropdown">
            <div className="navbar__profile-info">
              <div className="navbar__profile-info-name">{user?.name}</div>
              <div className="navbar__profile-info-email">{user?.email}</div>
              {/* User.tech_stack from your model */}
              {user?.tech_stack && (
                <span className="navbar__profile-tech-stack">{user.tech_stack}</span>
              )}
            </div>
            {[{ label: "Profile", path: "/profile" }, { label: "Settings", path: "/settings" }].map((item) => (
              <div
                key={item.path}
                className="navbar__dropdown-item"
                onClick={() => { navigate(item.path); setProfileOpen(false); }}
              >
                {item.label}
              </div>
            ))}
            <div className="navbar__dropdown-divider">
              <div
                className="navbar__dropdown-item navbar__dropdown-item--danger"
                onClick={() => { logout(); navigate("/login"); }}
              >
                Logout
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}