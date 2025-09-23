import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IconButton, List, ListItem, Typography } from "@material-tailwind/react";
import { HomeIcon, CubeTransparentIcon, ClipboardDocumentListIcon, UsersIcon } from "@heroicons/react/24/solid";
import { ChevronRightIcon, ChevronDownIcon, ArrowLeftIcon, ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import storeLogo from "../assets/images/ClothesLogo.png";

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobile, isTablet, isOpen, setIsOpen }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  const useOverlay = isMobile || isTablet;

  const sidebarLinks = [
    { to: "/", label: "Dashboard", icon: HomeIcon },
    {
      label: "Inventory",
      icon: CubeTransparentIcon,
      subItems: [
        { to: "/brands", label: "Brands" },
        { to: "/categories", label: "Categories" },
        { to: "/colors", label: "Colors" },
        { to: "/productsizes", label: "Sizes" },
        { to: "/products", label: "Products" },
        { to: "/productvariants", label: "Product Variants" },
        { to: "/suppliers", label: "Suppliers" },
      ],
    },
    { to: "/orders", label: "Orders", icon: ClipboardDocumentListIcon },
        {
      label: "Loyalty Program",
      icon: CubeTransparentIcon,
      subItems: [
        { to: "/wallets", label: "Wallets" },
        { to: "/rules", label: "Rules" },
        { to: "/spendings", label: "Spending" },
        { to: "/rewards", label: "Rewards" },

      ],
    },
    {
      label: "Users",
      icon: UsersIcon,
      subItems: [
        { to: "/users/cashier", label: "Cashiers" },
        { to: "/users/manager", label: "Managers" },
        { to: "/users/customer", label: "Customers" },
      ],
    },
  ];

  const toggleDropdown = (label) => setOpenDropdown(openDropdown === label ? null : label);
  const isActive = (to) => location.pathname === to;

  const showText = (!isCollapsed && !useOverlay) || (useOverlay && isOpen);

  if (useOverlay && !isOpen) return null; // overlay closed

  return (
    <>
      {/* Overlay */}
      {useOverlay && isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 transform transition-all duration-300
          ${useOverlay ? (isOpen ? "translate-x-0 w-72" : "-translate-x-full") : ""}
          ${!useOverlay ? (isCollapsed ? "w-16" : "w-72") : ""}`}
      >
        <div className="flex flex-col h-full">
          {/* Collapse button for desktop */}
          {!useOverlay && (
            <div className="flex justify-end p-2">
              <IconButton
                variant="text"
                size="lg"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hover:bg-gray-200"
              >
                {isCollapsed ? <ArrowRightIcon className="h-5 w-5 stroke-2 text-gray-700" /> :
                  <ArrowLeftIcon className="h-5 w-5 stroke-2 text-gray-700" />}
              </IconButton>
            </div>
          )}

          {/* Overlay close button */}
          {useOverlay && isOpen && (
            <div className="flex justify-end p-4">
              <IconButton
                variant="text"
                size="lg"
                onClick={() => setIsOpen(false)}
                className="hover:bg-gray-200"
              >
                <XMarkIcon className="h-6 w-6 stroke-2 text-gray-700" />
              </IconButton>
            </div>
          )}

          {/* Logo */}
          <div className={`flex items-center gap-3 px-4 mb-6 transition-all duration-300
            ${!showText ? "justify-center" : "justify-start"} ${useOverlay && "mt-4"}`}>
            <img src={storeLogo} alt="store logo" className="h-8 w-8" />
            {showText && <Typography className="font-bold text-gray-800 text-lg">EFS Store</Typography>}
          </div>

          {/* Menu */}
          <List className="flex-1 px-1 space-y-1">
            {sidebarLinks.map((link) => (
              <div key={link.label} className="relative group">
                {link.subItems ? (
                  <>
                    <ListItem
                      className={`rounded-lg flex items-center cursor-pointer
                      ${!showText ? "px-0 py-2 w-16 justify-center" : "px-3 py-2"}
                      hover:bg-gray-300 transition-all`}
                      onClick={() => toggleDropdown(link.label)}
                    >
                      <link.icon className="h-5 w-5 text-blue-600" />
                      {showText && <span className="ml-2 flex-1">{link.label}</span>}
                      {showText && (openDropdown === link.label ? <ChevronDownIcon className="h-4 w-4 text-gray-400" /> : <ChevronRightIcon className="h-4 w-4 text-gray-400" />)}
                    </ListItem>

                    {openDropdown === link.label && showText && (
                      <List className="space-y-1 pl-8">
                        {link.subItems.map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.to}
                            onClick={() => useOverlay && setIsOpen(false)}
                            className={`block rounded-lg px-3 py-1 text-sm transition-colors ${isActive(sub.to) ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-300"}`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </List>
                    )}
                  </>
                ) : (
                  <Link
                    to={link.to}
                    onClick={() => useOverlay && setIsOpen(false)}
                    className={`rounded-lg flex items-center cursor-pointer
                    ${!showText ? "px-0 py-2 w-16 justify-center" : "px-3 py-2"}
                    transition-all ${isActive(link.to) ? "bg-blue-100 text-blue-700" : "hover:bg-gray-300"}`}
                  >
                    <link.icon className="h-5 w-5 text-blue-600" />
                    {showText && <span className="ml-2 flex-1">{link.label}</span>}
                  </Link>
                )}

                {!showText && (
                  <span className="absolute top-1/2 left-16 -translate-y-1/2 px-2 py-1 bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    {link.label}
                  </span>
                )}
              </div>
            ))}
          </List>
        </div>
      </aside>
    </>
  );
}