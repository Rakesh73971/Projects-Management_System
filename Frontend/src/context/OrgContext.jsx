import { createContext, useContext } from "react";

const OrgContext = createContext();

export function OrgProvider({ children }) {

  const currentOrg = { name: "Acme Corp" };

  return (
    <OrgContext.Provider value={{ currentOrg }}>
      {children}
    </OrgContext.Provider>
  );
}

export const useOrg = () => useContext(OrgContext);