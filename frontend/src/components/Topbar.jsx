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

  // Role-based links
  const renderLinks = () => {
    switch (role) {
      case "admin":
      case "manager":
        return (
          <>
            <button
              onClick={() => navigate("/profile")}
              className="px-3 py-2 rounded hover:bg-gray-100 text-gray-800"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className={`px-3 py-2 rounded text-gray-800 hover:bg-gray-100 ${
                isLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {isLoading ? "Logging out..." : "Logout"}
            </button>
          </>
        );
      case "cashier":
        return (
          <>
            <button
              onClick={() => navigate("/orders")}
              className="px-3 py-2 rounded hover:bg-gray-100 text-gray-800"
            >
              Orders
            </button>
            <button
              onClick={() => navigate("/catalog")}
              className="px-3 py-2 rounded hover:bg-gray-100 text-gray-800"
            >
              Catalog
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="px-3 py-2 rounded hover:bg-gray-100 text-gray-800"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className={`px-3 py-2 rounded text-gray-800 hover:bg-gray-100 ${
                isLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {isLoading ? "Logging out..." : "Logout"}
            </button>
          </>
        );
      case "customer":
        return (
          <>
            <button
              onClick={() => navigate("/orders")}
              className="px-3 py-2 rounded hover:bg-gray-100 text-gray-800"
            >
              Orders
            </button>
            <button
              onClick={() => navigate("/catalog")}
              className="px-3 py-2 rounded hover:bg-gray-100 text-gray-800"
            >
              Catalog
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="px-3 py-2 rounded hover:bg-gray-100 text-gray-800"
            >
              Profile
            </button>

            {/* Loyalty Program Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setLoyaltyOpen(!loyaltyOpen)}
                className="px-3 py-2 rounded hover:bg-gray-100 text-gray-800 flex items-center gap-1"
              >
                Loyalty Program {loyaltyOpen ? "▾" : "▸"}
              </button>
              {loyaltyOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      navigate("/wallets");
                      setLoyaltyOpen(false);
                    }}
                  >
                    Wallets
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      navigate("/rewards");
                      setLoyaltyOpen(false);
                    }}
                  >
                    Rewards
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      navigate("/spendings");
                      setLoyaltyOpen(false);
                    }}
                  >
                    Spendings
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoading}
              className={`px-3 py-2 rounded text-gray-800 hover:bg-gray-100 ${
                isLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {isLoading ? "Logging out..." : "Logout"}
            </button>
          </>
        );
      default:
        // public
        return (
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
        );
    }
  };

  return (
    <header className="bg-white shadow flex items-center justify-between px-4 md:px-6 py-4 z-50">
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

      <div className="flex items-center gap-3">{renderLinks()}</div>
    </header>
  );
}
