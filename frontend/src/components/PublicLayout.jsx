import { Outlet } from "react-router-dom";
import Topbar from "./Topbar.jsx";

export default function PublicLayout() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Topbar /> {/* Topbar handles logged-out menu */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}