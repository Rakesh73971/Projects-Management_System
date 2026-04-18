import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrg } from "../context/OrgContext";
import Layout from "../components/layout/Layout";
import { createProject, getProjects } from "../services/projectService";
import "./ProjectDashboard.css";

const STATUS_FILTERS = ["All", "active", "planned", "completed", "on-hold"];

const PROG_COLOR = {
  active: "linear-gradient(to right,#6EE7B7,#3B82F6)",
  planned: "#F59E0B",
  completed: "#22C587",
  "on-hold": "#EF4444",
};

// ── Create Project modal ──────────────────────────────────────────────────────
function CreateProjectModal({ onClose, onCreate, orgId }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "planned",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onCreate({ ...form, organizationId: orgId }); 
    onClose();
  };

  return (
    <div
      className="proj-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="proj-modal">
        <div className="proj-modal-title">New Project</div>
        <form className="proj-form" onSubmit={handleSubmit}>
          {/* Project.name */}
          <div className="proj-form-field">
            <label className="proj-form-label">Project name *</label>
            <input
              className="proj-form-input"
              placeholder="e.g. Platform Redesign"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              autoFocus
            />
          </div>

          {/* Project.description */}
          <div className="proj-form-field">
            <label className="proj-form-label">Description</label>
            <textarea
              className="proj-form-textarea"
              placeholder="What is this project about?"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>

          {/* Project.status */}
          <div className="proj-form-field">
            <label className="proj-form-label">Status</label>
            <select
              className="proj-form-select"
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value }))
              }
            >
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="proj-modal-actions">
            <button type="button" className="proj-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="proj-btn proj-btn--primary">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectDashboard() {
  const { currentOrg } = useOrg();
  const navigate = useNavigate();

  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = projects
    .filter((p) => {
      const orgMatch = currentOrg ? p.organizationId === currentOrg.id : true;
      const statusMatch = filter === "All" || p.status === filter;
      return orgMatch && statusMatch;
    })
    .map((project) => ({
      ...project,
      tasks: project.tasks ?? 0,
      pct: project.pct ?? 0,
      emoji: project.emoji || "📁",
      bg: project.bg || "#EEF2FF",
      updated: project.updatedAt
        ? new Date(project.updatedAt).toLocaleDateString()
        : "Unknown",
    }));

  const stats = [
    { label: "Total", value: projects.length, color: "#6EE7B7" },
    {
      label: "Active",
      value: projects.filter((p) => p.status === "active").length,
      color: "#3B82F6",
    },
    {
      label: "Planned",
      value: projects.filter((p) => p.status === "planned").length,
      color: "#F59E0B",
    },
    {
      label: "Completed",
      value: projects.filter((p) => p.status === "completed").length,
      color: "#22C587",
    },
  ];

  const handleCreate = async (form) => {
    if (!currentOrg?.id) {
      setError("Please select an organization before creating a project.");
      return;
    }

    try {
      const created = await createProject({
        ...form,
        organizationId: currentOrg.id,
      });
      setProjects((prev) => [...prev, created]);
      setShowModal(false);
    } catch (err) {
      setError(err.message || "Unable to create project.");
    }
  };

  return (
    <Layout
      title="Projects"
      subtitle={`${currentOrg?.name ?? "All orgs"} · ${projects.length} projects`}
    >
      <div className="proj-page">
        {/* ── Top bar ── */}
        <div className="proj-topbar">
          <div className="proj-topbar-left">
            <h2>Projects</h2>
            <p>{currentOrg?.name ?? "All organizations"}</p>
          </div>
          <div className="proj-topbar-right">
            <button
              className="proj-btn proj-btn--primary"
              onClick={() => setShowModal(true)}
            >
              + New Project
            </button>
          </div>
        </div>

        {error && <div className="proj-error">{error}</div>}

        {/* ── Stat cards ── */}
        <div className="proj-stats">
          {stats.map((s) => (
            <div
              key={s.label}
              className="proj-stat"
              style={{ "--stat-color": s.color }}
            >
              <div className="proj-stat-label">{s.label} Projects</div>
              <div className="proj-stat-val">{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Filter tabs + table ── */}
        <div>
          {/* Tabs */}
          <div style={{ marginBottom: 12 }}>
            <div className="proj-tabs">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  className={`proj-tab ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f === "All" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="proj-table-wrap">
            {/* Table header */}
            <div className="proj-table-head">
              <span>Project</span>
              <span>Tasks</span>
              <span>Status</span>
              <span>Progress</span>
              <span>Updated</span>
              <span></span>
            </div>

            {/* Rows */}
            {loading ? (
              <div className="proj-empty">
                <div className="proj-empty-icon">⏳</div>
                <p>Loading projects…</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="proj-empty">
                <div className="proj-empty-icon">📂</div>
                <p>No {filter !== "All" ? filter : ""} projects found.</p>
              </div>
            ) : (
              filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="proj-row"
                  onClick={() => navigate(`/projects/${p.id}/tasks`)}
                >
                  {/* Name + description */}
                  <div className="proj-row-name">
                    <div
                      className="proj-row-emoji"
                      style={{ background: p.bg }}
                    >
                      {p.emoji}
                    </div>
                    <div>
                      {/* Project.name */}
                      <div className="proj-row-title">{p.name}</div>
                      {/* Project.description */}
                      <div className="proj-row-desc">{p.description}</div>
                    </div>
                  </div>

                  {/* Task count */}
                  <div className="proj-row-tasks">{p.tasks} tasks</div>

                  {/* Project.status */}
                  <span className={`proj-chip proj-chip--${p.status}`}>
                    {p.status}
                  </span>

                  {/* Progress bar */}
                  <div className="proj-row-progress">
                    <div className="proj-prog-bar">
                      <div
                        className="proj-prog-fill"
                        style={{
                          width: `${p.pct}%`,
                          background: PROG_COLOR[p.status] ?? "#6EE7B7",
                        }}
                      />
                    </div>
                    <span className="proj-prog-pct">{p.pct}%</span>
                  </div>

                  {/* Updated */}
                  <div style={{ fontSize: 11, color: "var(--proj-muted)" }}>
                    {p.updated}
                  </div>

                  {/* Action */}
                  <button
                    className="proj-row-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${p.id}/tasks`);
                    }}
                  >
                    Open →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
          orgId={currentOrg?.id ?? 1}
        />
      )}
    </Layout>
  );
}
