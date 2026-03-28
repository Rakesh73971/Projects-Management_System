
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useOrg }  from "../../context/OrgContext";
import "./Sidebar.css";

const Icon = ({ d, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((seg, i) => <path key={i} d={seg} />) : <path d={d} />}
  </svg>
);

const NAV_ITEMS = [
  { label: "Dashboard",     path: "/dashboard",     icon: ["M3 3h7v7H3z","M14 3h7v7h-7z","M3 14h7v7H3z","M14 14h7v7h-7z"] },
  { label: "Organizations", path: "/organizations", icon: ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z","M9 22V12h6v10"] },
  { label: "Projects",      path: "/projects",      icon: ["M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"], badge: "projects" },
  { label: "Task Board",    path: "/tasks",         icon: ["M9 11l3 3L22 4","M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7"], badge: "tasks" },
  { label: "Members",       path: "/members",       icon: ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M23 21v-2a4 4 0 00-3-3.87","M9 7a4 4 0 100 8 4 4 0 000-8z","M16 3.13a4 4 0 010 7.75"] },
];

const SETTINGS_ICON = ["M12 15a3 3 0 100-6 3 3 0 000 6z","M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"];
const LOGOUT_ICON  = ["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4","M16 17l5-5-5-5","M21 12H9"];

export default function Sidebar({ collapsed, badgeCounts = {} }) {
  const { user, logout } = useAuth();
  const { currentOrg }   = useOrg();
  const navigate         = useNavigate();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>

      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
          </svg>
        </div>
        <span className="sidebar__logo-text">Planflow</span>
      </div>

      {/* Org chip — Organization.name */}
      <div className="sidebar__org" onClick={() => navigate("/organizations")}>
        <div className="sidebar__org-label">Organization</div>
        <div className="sidebar__org-name">{currentOrg?.name ?? "Select org"} ▾</div>
      </div>

      {/* Nav links */}
      <nav className="sidebar__nav">
        <div className="sidebar__nav-section">Workspace</div>

        {NAV_ITEMS.map((item) => (
          <NavLink key={item.path} to={item.path} style={{ textDecoration: "none" }}>
            {({ isActive }) => (
              <div className={`sidebar__nav-item${isActive ? " active" : ""}`}>
                <span className="sidebar__nav-icon"><Icon d={item.icon} size={17} /></span>
                <span className="sidebar__nav-text">{item.label}</span>
                {item.badge && badgeCounts[item.badge] > 0 && (
                  <span className="sidebar__nav-badge">{badgeCounts[item.badge]}</span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Settings + User */}
      <div className="sidebar__bottom">
        <NavLink to="/settings" style={{ textDecoration: "none" }}>
          <div className="sidebar__settings">
            <Icon d={SETTINGS_ICON} size={16} />
            <span className="sidebar__settings-text">Settings</span>
          </div>
        </NavLink>

        {/* User row — User.name + User.designation */}
        <div className="sidebar__user">
          <div className="sidebar__avatar">{initials}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user?.name ?? "User"}</div>
            <div className="sidebar__user-role">{user?.designation ?? "Member"}</div>
          </div>
          <button className="sidebar__logout-btn" onClick={() => { logout(); navigate("/login"); }} title="Logout">
            <Icon d={LOGOUT_ICON} size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}