import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerAPI } from "../services/authService";
import "./Register.css";

// ── Icons ─────────────────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);

const LockIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
  </svg>
);

const CodeIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const EyeIcon = ({ off }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {off ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const AlertIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ── Password strength helper ──────────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; 
}

function strengthClass(score, index) {
  if (score === 0) return "";
  if (score <= 1) return index < 1 ? "weak" : "";
  if (score <= 2) return index < 2 ? "medium" : "";
  if (score <= 3) return index < 3 ? "medium" : "";
  return "strong";
}

// ── Register page ─────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    designation: "", 
    tech_stack: "", 
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pwStrength = getStrength(form.password);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await registerAPI(form);

      console.log("Registered:", data);

      navigate("/login");
    } catch (err) {
      const message =
        err?.response?.data?.detail || err?.message || "Registration failed";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Logo */}
        <div className="register-logo">
          <div className="register-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
            </svg>
          </div>
          <span className="register-logo-text">Planflow</span>
        </div>

        {/* Heading */}
        <h1 className="register-heading">Create your account</h1>
        <p className="register-subheading">Join your team on Planflow</p>

        {/* Error */}
        {error && (
          <div className="register-error">
            <AlertIcon />
            {error}
          </div>
        )}

        {/* Form */}
        <form className="register-form" onSubmit={handleSubmit} noValidate>
          {/* Name + Email */}
          <div className="register-row">
            {/* User.name */}
            <div className="register-field">
              <label className="register-label" htmlFor="name">
                Full name
              </label>
              <div className="register-input-wrap">
                <span className="register-input-icon">
                  <UserIcon />
                </span>
                <input
                  id="name"
                  className="register-input"
                  type="text"
                  name="name"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  autoFocus
                />
              </div>
            </div>

            {/* User.email */}
            <div className="register-field">
              <label className="register-label" htmlFor="email">
                Email
              </label>
              <div className="register-input-wrap">
                <span className="register-input-icon">
                  <MailIcon />
                </span>
                <input
                  id="email"
                  className="register-input"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="register-field">
            <label className="register-label" htmlFor="password">
              Password
            </label>
            <div className="register-input-wrap">
              <span className="register-input-icon">
                <LockIcon />
              </span>
              <input
                id="password"
                className="register-input"
                type={showPw ? "text" : "password"}
                name="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="register-pw-toggle"
                onClick={() => setShowPw((p) => !p)}
                tabIndex={-1}
              >
                <EyeIcon off={showPw} />
              </button>
            </div>

            {/* Password strength indicator */}
            {form.password && (
              <div className="register-strength">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`register-strength-bar ${strengthClass(pwStrength, i)}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="register-divider" />

          {/* Designation + Tech stack */}
          <div className="register-row">
            {/* User.designation */}
            <div className="register-field">
              <label className="register-label" htmlFor="designation">
                Designation <span>(optional)</span>
              </label>
              <div className="register-input-wrap">
                <span className="register-input-icon">
                  <BriefcaseIcon />
                </span>
                <input
                  id="designation"
                  className="register-input"
                  type="text"
                  name="designation"
                  placeholder="Backend Developer"
                  value={form.designation}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* User.tech_stack */}
            <div className="register-field">
              <label className="register-label" htmlFor="tech_stack">
                Tech stack <span>(optional)</span>
              </label>
              <div className="register-input-wrap">
                <span className="register-input-icon">
                  <CodeIcon />
                </span>
                <input
                  id="tech_stack"
                  className="register-input"
                  type="text"
                  name="tech_stack"
                  placeholder="Python, React, Postgres"
                  value={form.tech_stack}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button className="register-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                Creating account
                <span className="register-spinner" />
              </>
            ) : (
              "Create account"
            )}
          </button>

          {/* Terms */}
          <p className="register-terms">
            By signing up you agree to our <a href="/terms">Terms</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </form>

        {/* Footer */}
        <p className="register-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
