import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import OrganizationDashboard from "../pages/OrganizationDashboard";
import ProjectDashboard from "../pages/ProjectDashboard";

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
      <Route path="/dashboard" element={<Home />} />
      <Route path="/organizations" element={<OrganizationDashboard />} />
      <Route path="/projects" element={<ProjectDashboard />} />
      <Route path="/projects/new" element={<NewProject />} />
      <Route path="/projects/:id/tasks" element={<TaskBoard />} />
      <Route path="/tasks" element={<TaskBoard />} />
      <Route path="/members" element={<MembersPage />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
