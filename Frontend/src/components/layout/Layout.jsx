
import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar  from "./Navbar";
import Footer  from "./Footer";
import "./Layout.css";

export default function Layout({
  children,
  title       = "Dashboard",
  subtitle    = "",
  badgeCounts = { projects: 6, tasks: 12 },
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout">

      {/* Dark sticky sidebar */}
      <Sidebar collapsed={collapsed} badgeCounts={badgeCounts} />

      {/* Right column: Navbar → content → Footer */}
      <div className="layout__right">

        <Navbar
          onMenuClick={() => setCollapsed((prev) => !prev)}
          title={title}
          subtitle={subtitle}
        />

        <main className="layout__content">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}