import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function Layout({ children }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Get user info from Redux
  const { userInfo } = useSelector((state) => state.auth);
  const role = userInfo?.user?.role?.toLowerCase() || "public";
  const showSidebar = role === "admin" || role === "manager";

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktop = windowWidth >= 1024;
  const isMobile = windowWidth < 1024;

  // Automatically collapse or hide sidebar on smaller screens
  useEffect(() => {
    if (isDesktop && showSidebar) {
      setIsSidebarCollapsed(false);
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
      setIsSidebarCollapsed(false);
    }
  }, [isDesktop, showSidebar]);

  const sidebarWidth = isDesktop ? (isSidebarCollapsed ? 64 : 280) : 280;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Topbar
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        sidebarWidth={showSidebar ? (isDesktop ? sidebarWidth : 0) : 0}
      />

      <div className="flex flex-1 relative">
        {showSidebar && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            isMobile={isMobile}
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
