import React from "react";
import { IconButton, Typography } from "@material-tailwind/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import storeLogo from "../assets/images/ClothesLogo.png";

export default function Topbar({ isMobile, isOpen, toggleSidebar }) {
  return (
    <header className="bg-white shadow flex items-center justify-between px-4 md:px-6 py-4 transition-all duration-300">
      {/* Left: Hamburger only on mobile/tablet */}
      {isMobile && (
        <IconButton
          variant="text"
          size="lg"
          onClick={toggleSidebar}
          className="mr-2"
        >
          <Bars3Icon className="h-8 w-8 stroke-2" />
        </IconButton>
      )}

      {/* Right side: Heading + Logo always visible */}
      <div className="flex items-center gap-3 ml-auto">
        <Typography variant="h5" className="font-bold text-gray-800">
          Essential Fashion Shop
        </Typography>
        <img src={storeLogo} alt="Store Logo" className="h-8 w-8" />
      </div>
    </header>
  );
}
