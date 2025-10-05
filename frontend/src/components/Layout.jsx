import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function Layout({ children }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const userInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;

  const role = userInfo?.user?.role?.toLowerCase() || "public";

  const allowedRoles = ["admin", "manager"];
  const showSidebar = allowedRoles.includes(role);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktop = windowWidth >= 1024;

  useEffect(() => {
    if (isDesktop && showSidebar) {
      setIsSidebarCollapsed(false);
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isDesktop, showSidebar]);

  const sidebarWidth = isDesktop ? (isSidebarCollapsed ? 64 : 280) : 280;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Topbar
        role={role}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        sidebarWidth={
          isDesktop && showSidebar ? (isSidebarCollapsed ? 64 : 280) : 0
        }
      />

      <div className="flex flex-1 relative">
        {showSidebar && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />
        )}

        <main
          className="flex-1 transition-all duration-300 overflow-auto"
          style={{ marginLeft: isDesktop && showSidebar ? sidebarWidth : 0 }}
        >
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
