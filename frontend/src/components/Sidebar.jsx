import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  IconButton,
  List,
  ListItem,
  Typography,
} from "@material-tailwind/react";

import {
  HomeIcon,
  CubeTransparentIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";

import {
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import storeLogo from "../assets/images/ClothesLogo.png";

export default function Sidebar({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
  isMobile,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  const sidebarLinks = [
    { to: "/", label: "Dashboard", icon: HomeIcon },
    {
      label: "Inventory",
      icon: CubeTransparentIcon,
      subItems: [
        { to: "/brands", label: "Brands" },
        { to: "/colors", label: "Colors" },
        { to: "/sizes", label: "Sizes" },
        { to: "/products", label: "Products" },
        { to: "/product-variants", label: "Product Variants" },
        { to: "/suppliers", label: "Suppliers" },
      ],
    },
    { to: "/orders", label: "Orders", icon: ClipboardDocumentListIcon },
    { to: "/loyalty", label: "Loyalty Program", icon: ClipboardDocumentListIcon },
    {
      label: "Users",
      icon: UsersIcon,
      subItems: [
        { to: "/users/cashiers", label: "Cashiers" },
        { to: "/users/managers", label: "Managers" },
        { to: "/users/customers", label: "Customers" },
      ],
    },
  ];

  const toggleDropdown = (label) =>
    setOpenDropdown(openDropdown === label ? null : label);

  const isActive = (to) => location.pathname === to;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 transform transition-all duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isCollapsed && !isMobile ? "w-16" : "w-[280px]"}`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          {isMobile && (
            <div className="flex justify-end p-4 md:hidden">
              <IconButton
                variant="text"
                size="lg"
                onClick={() => setIsMobileOpen(false)}
                className="hover:bg-gray-300"
              >
                <XMarkIcon className="h-6 w-6 stroke-2 text-gray-700" />
              </IconButton>
            </div>
          )}

          {/* Desktop collapse button */}
          {!isMobile && (
            <div className="flex justify-end p-2">
              <IconButton
                variant="text"
                size="lg"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hover:bg-gray-300"
              >
                {isCollapsed ? (
                  <ArrowRightIcon className="h-5 w-5 stroke-2 text-gray-700" />
                ) : (
                  <ArrowLeftIcon className="h-5 w-5 stroke-2 text-gray-700" />
                )}
              </IconButton>
            </div>
          )}

          {/* Logo */}
          <div className="mb-6 flex items-center gap-4 px-4 transition-all duration-300">
            <img
              src={storeLogo}
              alt="store logo"
              className="h-8 w-8 transition-all duration-300"
            />
            {(!isCollapsed || isMobile) && (
              <Typography
                variant="h5"
                className="text-gray-800 font-bold tracking-wide"
              >
                EFS Store
              </Typography>
            )}
          </div>

          {/* Menu */}
          <List className="flex-1 px-1 space-y-1">
            {sidebarLinks.map((link) => (
              <div key={link.label} className="relative group">
                {link.subItems ? (
                  <>
                    {/* Parent dropdown item */}
                    <ListItem
                      className={`rounded-lg flex items-center cursor-pointer
                        ${
                          isCollapsed && !isMobile
                            ? "px-2 py-2 w-16 justify-center"
                            : "px-3 py-2"
                        }
                        hover:bg-gray-300 transition-all`}
                      onClick={() => toggleDropdown(link.label)}
                    >
                      <link.icon className="h-5 w-5 text-blue-600" />
                      {(!isCollapsed || isMobile) && (
                        <span className="ml-2 flex-1">{link.label}</span>
                      )}
                      {(!isCollapsed || isMobile) && (
                        <>
                          {openDropdown === link.label ? (
                            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                          )}
                        </>
                      )}
                    </ListItem>

                    {/* Dropdown sub-items */}
                    {openDropdown === link.label &&
                      (!isCollapsed || isMobile) && (
                        <List className={`space-y-1 ${isMobile ? "pl-6" : "pl-8"}`}>
                          {link.subItems.map((sub) => (
                            <Link
                              key={sub.label}
                              to={sub.to}
                              onClick={() => isMobile && setIsMobileOpen(false)}
                              className={`block rounded-lg px-3 py-1 text-sm transition-colors ${
                                isActive(sub.to)
                                  ? "bg-blue-100 text-blue-700"
                                  : "text-gray-600 hover:bg-gray-300"
                              }`}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </List>
                      )}
                  </>
                ) : (
                  /* Simple parent link */
                  <Link
                    to={link.to}
                    onClick={() => isMobile && setIsMobileOpen(false)}
                    className={`rounded-lg flex items-center cursor-pointer
                      ${
                        isCollapsed && !isMobile
                          ? "px-2 py-2 w-16 justify-center"
                          : "px-3 py-2"
                      }
                      transition-all ${
                        isActive(link.to)
                          ? "bg-blue-100 text-blue-700"
                          : "hover:bg-gray-300"
                      }`}
                  >
                    <link.icon className="h-5 w-5 text-blue-600" />
                    {(!isCollapsed || isMobile) && (
                      <span className="ml-2 flex-1">{link.label}</span>
                    )}
                  </Link>
                )}

                {/* Tooltip for collapsed sidebar */}
                {isCollapsed && !isMobile && (
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
