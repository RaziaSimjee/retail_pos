import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Menu,
  MenuItem,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import storeLogo from "../assets/images/ClothesLogo.png";
import { useLogoutMutation } from "../slices/usersApiSlice.js";
import { logout as logoutAction } from "../slices/authSlice";

export default function Topbar({ toggleSidebar, sidebarWidth }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;
  const role = userInfo?.user?.role?.toLowerCase() || "public";

  const [logout, { isLoading }] = useLogoutMutation();

  const menuItems = {
    public: [
      { label: "Login", to: "/login" },
      { label: "Register", to: "/register" },
    ],
    cashier: [
      { label: "Orders", to: "/orders" },
      { label: "Profile", to: "/profile" },
      { label: "Logout", action: "logout" },
    ],
    customer: [
      { label: "Orders", to: "/orders" },
      { label: "Profile", to: "/profile" },
      { label: "Loyalty Program", to: "/loyalty" },
      { label: "Logout", action: "logout" },
    ],
    admin: [
      { label: "Logout", action: "logout" },
      { label: "Profile", to: "/profile" },
    ],
    manager: [
      { label: "Logout", action: "logout" },
      { label: "Profile", to: "/profile" },
    ],
  };

  const dropdownItems = menuItems[role] || menuItems.public;

  const marginLeft = role === "admin" || role === "manager" ? sidebarWidth : 0;
  const canToggleSidebar = role === "admin" || role === "manager";

  const handleItemClick = async (item) => {
    if (isLoading) return;

    if (item.action === "logout") {
      try {
        await logout().unwrap();
        dispatch(logoutAction());

        // Redirect based on role
        if (role === "admin" || role === "manager") {
          navigate("/login");
        } else {
          navigate("/catalog");
        }
        // else keep them on current page (e.g., catalog)
      } catch (err) {
        console.error("Logout failed:", err);
      }
    } else if (item.to) {
      navigate(item.to);
    }
  };

  return (
    <header className="bg-white shadow flex items-center justify-between px-4 md:px-6 py-4 transition-all duration-300 z-50">
      <div
        className="flex items-center gap-3 transition-all duration-300"
        style={{ marginLeft }}
      >
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

      <div className="flex items-center gap-3">
        <Menu placement="bottom-end">
          <MenuItem className="cursor-pointer">
            <div className="flex flex-col">
              {dropdownItems.map((item) => (
                <div
                  key={item.label}
                  onClick={() => handleItemClick(item)}
                  className={`px-2 py-1 rounded cursor-pointer hover:bg-gray-200 ${
                    isLoading ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {isLoading && item.action === "logout"
                    ? "Logging out..."
                    : item.label}
                </div>
              ))}
            </div>
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}
