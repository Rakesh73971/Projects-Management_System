import { createContext, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const user = { name: "Rakes", email: "rakes@example.com", designation: "Developer", tech_stack: "React, FastAPI" };

  const logout = () => console.log("Logged out!");

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);