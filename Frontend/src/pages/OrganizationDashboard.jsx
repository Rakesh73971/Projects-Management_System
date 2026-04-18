import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrg } from "../context/OrgContext";
import Layout from "../components/layout/Layout";
import {
  createOrganization,
  getOrganizations,
  getOrganizationMembers,
} from "../services/orgService";
import "./OrganizationDashboard.css";

// ── Create Org modal ──────────────────────────────────────────────────────────
function CreateOrgModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", description: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onCreate(form); 
    onClose();
  };

  return (
    <div
      className="org-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="org-modal">
        <div className="org-modal-title">Create Organization</div>
        <form className="org-form" onSubmit={handleSubmit}>
          {/* Organization.name */}
          <div className="org-form-field">
            <label className="org-form-label">Organization name *</label>
            <input
              className="org-form-input"
              placeholder="e.g. Acme Corp"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              autoFocus
            />
          </div>

          {/* Organization.description */}
          <div className="org-form-field">
            <label className="org-form-label">Description</label>
            <textarea
              className="org-form-textarea"
              placeholder="What does this organization do?"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>

          <div className="org-modal-actions">
            <button type="button" className="org-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="org-btn org-btn--primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Organization Dashboard ────────────────────────────────────────────────────
export default function OrganizationDashboard() {
  const { currentOrg, setCurrentOrg } = useOrg();
  const navigate = useNavigate();

  const [orgs, setOrgs] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeOrgId, setActiveOrgId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const selectedOrg =
    orgs.find((o) => o.id === activeOrgId) || currentOrg || orgs[0];

  const loadOrganizations = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getOrganizations();
      setOrgs(data);

      if (!currentOrg && data.length > 0) {
        setCurrentOrg(data[0]);
        setActiveOrgId(data[0].id);
      } else if (currentOrg) {
        setActiveOrgId(currentOrg.id);
      } else if (data.length > 0) {
        setActiveOrgId(data[0].id);
      }
    } catch (err) {
      setError(err.message || "Unable to load organizations.");
    } finally {
      setLoading(false);
    }
  };

  const handleOrgClick = (org) => {
    setActiveOrgId(org.id);
    setCurrentOrg(org);
  };

  const handleCreate = async (form) => {
    try {
      const created = await createOrganization(form);
      setOrgs((prev) => [...prev, created]);
      setActiveOrgId(created.id);
      setCurrentOrg(created);
    } catch (err) {
      setError(err.message || "Unable to create organization.");
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await getOrganizationMembers();
        
        const membersWithColor = data.map((m, i) => ({
          ...m,
          bg: [
            "linear-gradient(135deg,#6EE7B7,#3B82F6)",
            "linear-gradient(135deg,#8B5CF6,#3B82F6)",
            "linear-gradient(135deg,#F59E0B,#EF4444)",
            "linear-gradient(135deg,#EF4444,#F59E0B)",
            "linear-gradient(135deg,#6EE7B7,#8B5CF6)",
            "linear-gradient(135deg,#3B82F6,#8B5CF6)",
          ][i % 6],
        }));
        setMembers(membersWithColor);
      } catch (err) {
        console.error("Error loading members:", err);
        setMembers([]);
      }
    };
    if (activeOrgId) {
      loadMembers();
    }
  }, [activeOrgId]);

  return (
    <Layout title="Organizations" subtitle={`${orgs.length} organizations`}>
      <div className="org-page">
        {/* ── Top bar ── */}
        <div className="org-topbar">
          <div className="org-topbar-left">
            <h2>Organizations</h2>
            <p>Manage your teams and members</p>
          </div>
          <div className="org-topbar-actions">
            <button
              className="org-btn org-btn--primary"
              onClick={() => setShowModal(true)}
            >
              + New Organization
            </button>
          </div>
        </div>

        {error && <div className="org-error">{error}</div>}

        {/* ── Org cards ── */}
        <div className="org-grid">
          {loading ? (
            <div className="org-empty">
              <div className="org-empty-icon">⏳</div>
              <p>Loading organizations...</p>
            </div>
          ) : orgs.length === 0 ? (
            <div className="org-empty">
              <div className="org-empty-icon">🏢</div>
              <p>
                No organizations yet.
                <br />
                Create one to get started.
              </p>
            </div>
          ) : (
            orgs.map((org) => (
              <div
                key={org.id}
                className="org-card"
                onClick={() => handleOrgClick(org)}
                style={{
                  borderColor: activeOrgId === org.id ? "#6EE7B7" : undefined,
                  boxShadow:
                    activeOrgId === org.id
                      ? "0 0 0 3px rgba(110,231,183,.15)"
                      : undefined,
                }}
              >
                <div className="org-card-header">
                  <div className="org-card-icon">🏢</div>
                  <span className={`org-status org-status--${org.status}`}>
                    {org.status}
                  </span>
                </div>

                <div className="org-card-name">{org.name}</div>
                <div className="org-card-desc">
                  {org.description || "No description provided."}
                </div>

                <div className="org-card-stats">
                  <div className="org-card-stat">
                    <div className="org-card-stat-val">{org.projects ?? 0}</div>
                    <div className="org-card-stat-label">Projects</div>
                  </div>
                  <div className="org-card-stat">
                    <div className="org-card-stat-val">{org.members ?? 0}</div>
                    <div className="org-card-stat-label">Members</div>
                  </div>

                  <div className="org-card-members">
                    {members.slice(0, 3).map((av, i) => (
                      <div
                        key={i}
                        className="org-member-av"
                        style={{ background: av.bg }}
                        title={av.user?.name}
                      >
                        {av.user?.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                    ))}
                    {(org.members ?? 0) > 3 && (
                      <div className="org-member-av org-member-more">
                        +{(org.members ?? 0) - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Members of selected org ── */}
        <div className="org-members-section">
          <div className="org-members-header">
            <div className="org-members-title">
              {selectedOrg?.name ?? "Organization"} — Members
            </div>
            <button
              className="org-btn org-btn--primary"
              onClick={() => navigate("/members")}
            >
              + Invite Member
            </button>
          </div>

          {members.map((m) => (
            <div key={m.id} className="org-member-row">
              {/* Avatar with User.name initials */}
              <div className="org-member-avatar" style={{ background: m.bg }}>
                {m.user?.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <div className="org-member-info">
                {/* User.name */}
                <div className="org-member-name">{m.user?.name}</div>
                {/* User.designation */}
                <div className="org-member-designation">
                  {m.user?.designation}
                </div>
              </div>

              {/* User.tech_stack */}
              <span className="org-member-stack">{m.user?.tech_stack}</span>

              {/* OrganizationMember.role */}
              <span className={`org-role org-role--${m.role}`}>{m.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Create org modal ── */}
      {showModal && (
        <CreateOrgModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </Layout>
  );
}
