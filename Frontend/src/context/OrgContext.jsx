import { createContext, useContext, useState } from "react";

const OrgContext = createContext();

export function OrgProvider({ children }) {
  const [currentOrg, setCurrentOrg] = useState(null);

  return (
    <OrgContext.Provider value={{ currentOrg, setCurrentOrg }}>
      {children}
    </OrgContext.Provider>
  );
}

export const useOrg = () => useContext(OrgContext);
