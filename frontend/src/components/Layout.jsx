import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function Layout() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Update windowWidth on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Device detection
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // Auto collapse/open sidebar on desktop
  useEffect(() => {
    if (isDesktop) {
      setIsSidebarCollapsed(false);
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false); // overlay closed by default on mobile/tablet
    }
  }, [isDesktop]);

  // Sidebar width for desktop
  const sidebarWidth = isDesktop ? (isSidebarCollapsed ? 64 : 280) : 280;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Topbar */}
      <Topbar
        isMobile={isMobile || isTablet}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobile={isMobile}
          isTablet={isTablet}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Main content */}
        <main
          className="flex-1 transition-all duration-300 overflow-auto"
          style={{
            marginLeft: isDesktop ? sidebarWidth : 0,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
