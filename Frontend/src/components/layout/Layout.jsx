import { useState } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Layout.css";

export default function Layout({
  title = "Dashboard",
  subtitle = "",
  badgeCounts = { projects: 6, tasks: 12 },
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout">
      <Sidebar collapsed={collapsed} badgeCounts={badgeCounts} />

      <div className="layout__right">
        <Navbar
          onMenuClick={() => setCollapsed((prev) => !prev)}
          title={title}
          subtitle={subtitle}
        />

        <main className="layout__content">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
