import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function Layout() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // User role from localStorage
  const userInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;
  const allowedRoles = ["admin", "manager", "cashier"];
  const showSidebar = userInfo && allowedRoles.includes(userInfo.user?.role?.toLowerCase());

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
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
        isMobile={isMobile || isTablet}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 relative">
        {showSidebar && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            isMobile={isMobile}
            isTablet={isTablet}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />
        )}

        <main
          className="flex-1 transition-all duration-300 overflow-auto"
          style={{ marginLeft: isDesktop && showSidebar ? sidebarWidth : 0 }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}