// src/App.jsx
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { OrgProvider } from "./context/OrgContext";
import AppRoutes from ".routes/AppRoutes.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrgProvider>
          <AppRoutes />
        </OrgProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
