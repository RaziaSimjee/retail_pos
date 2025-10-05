import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { IconButton, Typography } from "@material-tailwind/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import storeLogo from "../assets/images/ClothesLogo.png";
import { useLogoutMutation } from "../slices/usersApiSlice.js";
import { logout as logoutAction } from "../slices/authSlice";

export default function Topbar({ toggleSidebar, sidebarWidth }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [loyaltyOpen, setLoyaltyOpen] = useState(false);

  const userInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;
  const role = userInfo?.user?.role?.toLowerCase() || "public";

  const [logout, { isLoading }] = useLogoutMutation();

  const links = [
    { label: "Orders", to: "/orders" },
    { label: "Profile", to: "/profile" },
  ];

  const loyaltySubLinks = [
    { label: "Wallets", to: "/wallets" },
    { label: "Rewards", to: "/rewards" },
    { label: "Spendings", to: "/spendings" },
  ];

  const marginLeft = role === "admin" || role === "manager" ? sidebarWidth : 0;
  const canToggleSidebar = role === "admin" || role === "manager";

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(logoutAction());
      if (role === "admin" || role === "manager") {
        navigate("/login");
      } else {
        navigate("/catalog");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setLoyaltyOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow flex items-center justify-between px-4 md:px-6 py-4 z-50">
      {/* Left side */}
      <div className="flex items-center gap-3" style={{ marginLeft }}>
        {canToggleSidebar && (
          <IconButton
            variant="text"
            size="lg"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Bars3Icon className="h-8 w-8 stroke-2" />
          </IconButton>
        )}
        <img src={storeLogo} alt="logo" className="h-8 w-8" />
        <Typography variant="h5" className="font-bold text-gray-800">
          Essential Fashion Shop
        </Typography>
      </div>

      {/* Right side links */}
      <div className="flex items-center gap-3 relative">
        {links.map((link) => (
          <button
            key={link.label}
            onClick={() => navigate(link.to)}
            className="px-3 py-2 rounded hover:bg-gray-100 text-gray-800"
          >
            {link.label}
          </button>
        ))}

        {/* Loyalty Program dropdown */}
        {role === "customer" && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLoyaltyOpen(!loyaltyOpen)}
              className="px-3 py-2 rounded hover:bg-gray-100 text-gray-800 flex items-center gap-1"
            >
              Loyalty Program {loyaltyOpen ? "▾" : "▸"}
            </button>
            {loyaltyOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50">
                {loyaltySubLinks.map((sub) => (
                  <button
                    key={sub.label}
                    onClick={() => {
                      navigate(sub.to);
                      setLoyaltyOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        {role !== "public" && (
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`px-3 py-2 rounded text-gray-800 hover:bg-gray-100 ${
              isLoading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {isLoading ? "Logging out..." : "Logout"}
          </button>
        )}

        {/* Login/Register for public */}
        {role === "public" && (
          <>
            <button
              onClick={() => navigate("/login")}
              className="px-3 py-2 rounded hover:bg-gray-100 text-gray-800"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-3 py-2 rounded hover:bg-gray-100 text-gray-800"
            >
              Register
            </button>
          </>
        )}
      </div>
    </header>
  );
}
