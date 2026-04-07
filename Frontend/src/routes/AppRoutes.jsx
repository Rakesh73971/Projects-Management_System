import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import OrganizationDashboard from "../pages/OrganizationDashboard";
import ProjectDashboard from "../pages/ProjectDashboard";
import ProtectedRoute from "../components/ProtectedRoute";

const TaskBoard = () => (
  <div style={{ padding: 24, fontFamily: "sans-serif" }}>
    TaskBoard — coming soon
  </div>
);

const MembersPage = () => (
  <div style={{ padding: 24, fontFamily: "sans-serif" }}>
    Members — coming soon
  </div>
);

const NewProject = () => (
  <div style={{ padding: 24, fontFamily: "sans-serif" }}>
    New Project — coming soon
  </div>
);

const Profile = () => (
  <div style={{ padding: 24, fontFamily: "sans-serif" }}>
    Profile — coming soon
  </div>
);

const Settings = () => (
  <div style={{ padding: 24, fontFamily: "sans-serif" }}>
    Settings — coming soon
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizations"
        element={
          <ProtectedRoute>
            <OrganizationDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/new"
        element={
          <ProtectedRoute>
            <NewProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id/tasks"
        element={
          <ProtectedRoute>
            <TaskBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TaskBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/members"
        element={
          <ProtectedRoute>
            <MembersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
