import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { OrgProvider } from "./context/OrgContext";

import Layout from "./components/layout/Layout";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrgProvider>
          <Routes>
            <Route path="/" element={<Layout />} />
            <Route path="/dashboard" element={<Layout />} />
          </Routes>
        </OrgProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}


ReactDOM.createRoot(document.getElementById("root")).render(<App />);

export default App;
