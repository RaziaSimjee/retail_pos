import React from "react";
import { Link } from "react-router-dom";
import { Menu, MenuItem, IconButton, Typography } from "@material-tailwind/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import storeLogo from "../assets/images/ClothesLogo.png";

export default function Topbar({ role, toggleSidebar, sidebarWidth }) {
  // Dropdown items per role
  const menuItems = {
    public: [
      { label: "Login", to: "/login" },
      { label: "Register", to: "/register" },
    ],
    cashier: [
      { label: "Orders", to: "/orders" },
      { label: "Logout", to: "/logout" },
    ],
    customer: [
      { label: "Orders", to: "/orders" },
      { label: "Profile", to: "/profile" },
      { label: "Loyalty Program", to: "/loyalty" },
      { label: "Logout", to: "/logout" },
    ],
    admin: [{ label: "Logout", to: "/logout" }],
    manager: [{ label: "Logout", to: "/logout" }],
  };

  const dropdownItems = menuItems[role] || menuItems.public;

  // Shift logo+heading for admin or manager
  const marginLeft = (role === "admin" || role === "manager") ? sidebarWidth : 0;

  return (
    <header
      className="bg-white shadow flex items-center justify-between px-4 md:px-6 py-4 transition-all duration-300 z-50"
    >
      {/* Left side: logo + heading */}
      <div
        className="flex items-center gap-3 transition-all duration-300"
        style={{ marginLeft }}
      >
        {/* Mobile Hamburger */}
        <IconButton
          variant="text"
          size="lg"
          onClick={toggleSidebar}
          className="md:hidden"
        >
          <Bars3Icon className="h-8 w-8 stroke-2" />
        </IconButton>

        <img src={storeLogo} alt="logo" className="h-8 w-8" />
        <Typography variant="h5" className="font-bold text-gray-800">
          Essential Fashion Shop
        </Typography>
      </div>

      {/* Right side: dropdown menu */}
      <div className="flex items-center gap-3">
        <Menu placement="bottom-end">
          <MenuItem className="cursor-pointer">
            <div className="flex flex-col">
              {dropdownItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="px-2 py-1 hover:bg-gray-200 rounded"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}
