
import { useNavigate } from "react-router-dom";
import { useAuth }     from "../context/AuthContext";
import { useOrg }      from "../context/OrgContext";
import Layout          from "../components/layout/Layout";
import "./Home.css";


const PROJECTS = [
  { id: 1, name: "Platform Redesign",   emoji: "🚀", bg: "#EEF2FF", tasks: 8,  pct: 68, status: "active",    updated: "2h ago" },
  { id: 2, name: "API v3 Migration",    emoji: "🛠️", bg: "#F0FDF4", tasks: 14, pct: 40, status: "active",    updated: "Yesterday" },
  { id: 3, name: "Analytics Dashboard", emoji: "📊", bg: "#FFFBEB", tasks: 5,  pct: 15, status: "planned",   updated: "3d ago" },
  { id: 4, name: "Auth Overhaul",       emoji: "🔒", bg: "#F0F9FF", tasks: 20, pct: 100, status: "completed", updated: "1w ago" },
];

const MY_TASKS = [
  { id: 1, title: "Set up CI/CD pipeline for staging",   priority: "high",   done: false },
  { id: 2, title: "Review PR: auth token refresh logic", priority: "high",   done: false },
  { id: 3, title: "Refactor component library",          priority: "medium", done: false },
  { id: 4, title: "Write unit tests for auth module",    priority: "low",    done: false },
  { id: 5, title: "Update API documentation",            priority: "low",    done: true  },
];

const ACTIVITY = [
  { id: 1, color: "#6EE7B7", text: <><strong>Sara Kim</strong> completed "Validate DB schema migration"</>,     time: "2m ago"  },
  { id: 2, color: "#3B82F6", text: <><strong>Tom Walsh</strong> opened a PR in Platform Redesign</>,            time: "18m ago" },
  { id: 3, color: "#F59E0B", text: <><strong>Arun Raj</strong> moved "API rate limiting" to In Review</>,       time: "1h ago"  },
  { id: 4, color: "#8B5CF6", text: <><strong>Mia Park</strong> joined Acme Corp as a member</>,                 time: "3h ago"  },
  { id: 5, color: "#6EE7B7", text: <><strong>You</strong> created project "Analytics Dashboard"</>,             time: "Yesterday" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const PROG_COLOR = { active: "#6EE7B7", planned: "#F59E0B", completed: "#3B82F6", "on-hold": "#EF4444" };

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
      stroke="white" strokeWidth="2" strokeLinecap="round">
      <path d="M2 5l2.5 2.5L8 3" />
    </svg>
  );
}

// ── Home page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { user }       = useAuth();
  const { currentOrg } = useOrg();
  const navigate       = useNavigate();

  const openTasks   = MY_TASKS.filter((t) => !t.done).length;
  const activeProjs = PROJECTS.filter((p) => p.status === "active").length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Layout
      title="Dashboard"
      subtitle={`${currentOrg?.name ?? "Planflow"} · ${activeProjs} active projects`}
    >
      <div className="home-page">

        {/* ── Welcome banner ── */}
        <div className="home-banner">
          <div className="home-banner-left">
            <h1>
              {greeting()},{" "}
              <span className="home-banner-accent">
                {user?.name?.split(" ")[0] ?? "there"}
              </span>{" "}
              👋
            </h1>
            <p>
              You have <strong>{openTasks} open tasks</strong> across{" "}
              {activeProjs} active projects today.
            </p>
          </div>
          <button
            className="home-banner-btn"
            onClick={() => navigate("/projects")}
          >
            View projects →
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="home-stats">
          {[
            { label: "Total Projects", value: PROJECTS.length,  sub: <><span className="up">{activeProjs} active</span></>,            color: "#6EE7B7" },
            { label: "Open Tasks",     value: openTasks,        sub: <><span className="up">↑ 8</span> this week</>,                   color: "#3B82F6" },
            { label: "Team Members",   value: 11,               sub: "across 2 orgs",                                                  color: "#8B5CF6" },
            { label: "Completion",     value: "87%",            sub: <><span className="up">+4%</span> vs last month</>,               color: "#22C587" },
          ].map((s) => (
            <div
              key={s.label}
              className="home-stat-card"
              style={{ "--stat-color": s.color }}
            >
              <div className="home-stat-label">{s.label}</div>
              <div className="home-stat-value">{s.value}</div>
              <div className="home-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Projects + My Tasks ── */}
        <div className="home-grid">

          {/* Active projects */}
          <div>
            <div className="home-section-head">
              <div className="home-section-title">Active Projects</div>
              <span
                className="home-section-link"
                onClick={() => navigate("/projects")}
              >
                View all →
              </span>
            </div>
            <div className="home-projects">
              {PROJECTS.map((p) => (
                <div
                  key={p.id}
                  className="home-project-row"
                  onClick={() => navigate(`/projects/${p.id}/tasks`)}
                >
                  <div className="home-project-emoji" style={{ background: p.bg }}>
                    {p.emoji}
                  </div>
                  <div className="home-project-info">
                    <div className="home-project-name">{p.name}</div>
                    <div className="home-project-meta">{p.tasks} tasks · {p.updated}</div>
                  </div>
                  <div className="home-project-progress">
                    <div className="home-prog-bar">
                      <div
                        className="home-prog-fill"
                        style={{
                          width:      `${p.pct}%`,
                          background: PROG_COLOR[p.status] ?? "#6EE7B7",
                        }}
                      />
                    </div>
                    <span className="home-prog-pct">{p.pct}%</span>
                  </div>
                  <span className={`home-chip home-chip--${p.status}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* My tasks */}
          <div>
            <div className="home-section-head">
              <div className="home-section-title">My Tasks</div>
              <span
                className="home-section-link"
                onClick={() => navigate("/tasks")}
              >
                View all →
              </span>
            </div>
            <div className="home-tasks">
              {MY_TASKS.map((t) => (
                <div key={t.id} className="home-task-row">
                  <div className={`home-task-check ${t.done ? "done" : ""}`}>
                    {t.done && <CheckIcon />}
                  </div>
                  <span className={`home-task-title ${t.done ? "done" : ""}`}>
                    {t.title}
                  </span>
                  <span className={`home-priority home-priority--${t.priority}`}>
                    {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent activity ── */}
        <div>
          <div className="home-section-head">
            <div className="home-section-title">Recent Activity</div>
          </div>
          <div className="home-activity">
            {ACTIVITY.map((a) => (
              <div key={a.id} className="home-activity-item">
                <div
                  className="home-activity-dot"
                  style={{ background: a.color }}
                />
                <div className="home-activity-text">{a.text}</div>
                <div className="home-activity-time">{a.time}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}