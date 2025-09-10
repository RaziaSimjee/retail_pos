// FloatingAddButton.jsx
import React from "react";
import { IconButton } from "@material-tailwind/react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function FloatingAddButton({ onClick }) {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <IconButton
        size="lg"
        color="blue"
        className="rounded-full shadow-md p-4 hover:shadow-lg transition-shadow duration-300"
        onClick={onClick} // parent handles what happens
      >
        <PlusIcon className="h-7 w-7" />
      </IconButton>
    </div>
  );
}
