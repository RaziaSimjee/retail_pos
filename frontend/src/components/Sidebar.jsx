import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  IconButton,
  List,
  ListItem,
  Typography,
  Tooltip,
} from "@material-tailwind/react";
import {
  FaHome,
  FaBoxes,
  FaClipboardList,
  FaUsers,
  FaCoins,
  FaTags,
  FaMoneyBillWave,
} from "react-icons/fa";
import {
  AiOutlineDown,
  AiOutlineRight,
  AiOutlineArrowLeft,
  AiOutlineClose,
} from "react-icons/ai";
import storeLogo from "../assets/images/ClothesLogo.png";

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobile,
  isTablet,
  isOpen,
  setIsOpen,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const useOverlay = isMobile || isTablet;

  const sidebarLinks = [
    { to: "/dashboard", label: "Dashboard", icon: <FaHome /> },
    {
      label: "Inventory",
      icon: <FaBoxes />,
      subItems: [
        { to: "/brands", label: "Brands" },
        { to: "/categories", label: "Categories" },
        { to: "/colors", label: "Colors" },
        { to: "/productsizes", label: "Sizes" },
        { to: "/products", label: "Products" },
        { to: "/productvariants", label: "Product Variants" },
        { to: "/serialnumbers", label: "Serial Numbers" },
        { to: "/suppliers", label: "Suppliers" },
                { to: "/supplierpayments", label: "Supplier Payments" },
                { to: "/purchaseorders", label: "Purchase Orders" },
        { to: "/purchaseitems", label: "Purchase Items" },
      ],
    },
    { to: "/catalog", label: "Catalog", icon: <FaTags /> },

    { to: "/orders", label: "Orders", icon: <FaClipboardList /> },
    {
      label: "Loyalty Program",
      icon: <FaCoins />,
      subItems: [
        { to: "/wallets", label: "Wallets" },
        { to: "/rules", label: "Rules" },
        { to: "/spendings", label: "Spending" },
        { to: "/rewards", label: "Rewards" },
      ],
    },
    {
      label: "Users",
      icon: <FaUsers />,
      subItems: [
        { to: "/users/cashier", label: "Cashiers" },
        { to: "/users/manager", label: "Managers" },
        { to: "/users/customer", label: "Customers" },
      ],
    },
  ];

  const toggleDropdown = (label) =>
    setOpenDropdown(openDropdown === label ? null : label);
  const isActive = (to) => location.pathname === to;

  // Show text in expanded sidebar or overlay open
  const showText = (!isCollapsed && !useOverlay) || (useOverlay && isOpen);

  const sidebarWidth = !useOverlay ? (isCollapsed ? 64 : 280) : 280;

  if (useOverlay && !isOpen) return null;

  return (
    <>
      {/* Overlay */}
      {useOverlay && isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className="fixed top-0 left-0 h-full bg-white shadow-lg z-50 transform transition-all duration-300 border-r border-gray-200 overflow-x-hidden"
        style={{
          width: sidebarWidth,
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        }}
      >
        <div className="flex flex-col h-full pb-6 overflow-hidden">
          {/* Collapse button for desktop */}
          {!useOverlay && (
            <div className="flex justify-end p-2 flex-shrink-0">
              <IconButton
                variant="text"
                size="lg"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hover:bg-gray-200"
              >
                {isCollapsed ? (
                  <AiOutlineRight size={20} />
                ) : (
                  <AiOutlineArrowLeft size={20} />
                )}
              </IconButton>
            </div>
          )}

          {/* Overlay close button */}
          {useOverlay && isOpen && (
            <div className="flex justify-end p-4 flex-shrink-0">
              <IconButton
                variant="text"
                size="lg"
                onClick={() => setIsOpen(false)}
                className="hover:bg-gray-200"
              >
                <AiOutlineClose size={24} />
              </IconButton>
            </div>
          )}

          {/* Logo */}
          <div
            className={`flex items-center gap-3 px-3 mb-6 flex-shrink-0 transition-all duration-300
              ${isCollapsed ? "justify-center" : "justify-start"} ${
              useOverlay && "mt-4"
            }`}
            style={{ height: 26 }}
          >
            <img src={storeLogo} alt="store logo" className="h-8 w-8" />
            {!isCollapsed && (
              <Typography className="font-bold text-gray-800 text-lg">
                EFS Store
              </Typography>
            )}
          </div>

          {/* Scrollable menu */}
          <div
            className={`flex-1 px-1 overflow-y-auto overflow-x-hidden ${
              isCollapsed ? "overflow-y-hidden" : ""
            }`}
          >
            <List className="space-y-1">
              {sidebarLinks.map((link) => (
                <div key={link.label} className="relative group">
                  {/* Submenu */}
                  {link.subItems ? (
                    <>
                      {!showText ? (
                        <Tooltip
                          content={link.label}
                          placement="right"
                          offset={8}
                        >
                          <ListItem
                            className="rounded-lg flex items-center cursor-pointer px-1 py-2 w-16 justify-start hover:bg-gray-300 transition-all"
                            onClick={() => toggleDropdown(link.label)}
                          >
                            <span className="text-blue-600 text-lg">
                              {link.icon}
                            </span>
                          </ListItem>
                        </Tooltip>
                      ) : (
                        <ListItem
                          className="rounded-lg flex items-center cursor-pointer px-3 py-2 hover:bg-gray-300 transition-all"
                          onClick={() => toggleDropdown(link.label)}
                        >
                          <span className="text-blue-600 text-lg">
                            {link.icon}
                          </span>
                          <span className="ml-2 flex-1">{link.label}</span>
                          {openDropdown === link.label ? (
                            <AiOutlineDown size={16} />
                          ) : (
                            <AiOutlineRight size={16} />
                          )}
                        </ListItem>
                      )}

                      {openDropdown === link.label && showText && (
                        <List className="space-y-1 pl-6">
                          {link.subItems.map((sub) => (
                            <Link
                              key={sub.label}
                              to={sub.to}
                              onClick={() => useOverlay && setIsOpen(false)}
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
                    // Single link
                    <>
                      {!showText ? (
                        <Tooltip
                          content={link.label}
                          placement="right"
                          offset={8}
                        >
                          <Link
                            to={link.to}
                            onClick={() => useOverlay && setIsOpen(false)}
                            className="rounded-lg flex items-center cursor-pointer px-1 py-2 w-16 justify-start hover:bg-gray-300 transition-all"
                          >
                            <span className="text-blue-600 text-lg">
                              {link.icon}
                            </span>
                          </Link>
                        </Tooltip>
                      ) : (
                        <Link
                          to={link.to}
                          onClick={() => useOverlay && setIsOpen(false)}
                          className={`rounded-lg flex items-center cursor-pointer px-2 py-2 transition-all ${
                            isActive(link.to)
                              ? "bg-blue-100 text-blue-700"
                              : "hover:bg-gray-300"
                          }`}
                        >
                          <span className="text-blue-600 text-lg">
                            {link.icon}
                          </span>
                          <span className="ml-2 flex-1">{link.label}</span>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              ))}
            </List>
          </div>
        </div>
      </aside>
    </>
  );
}
