import React, { useState } from "react";
import { IconButton, Typography, Button } from "@material-tailwind/react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function FloatingAddButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Add Button */}
      <div className="fixed bottom-8 right-8 z-50"> {/* increased margin */}
        <IconButton
          size="lg"
          color="blue"
          className="rounded-full shadow-md p-4 hover:shadow-lg transition-shadow duration-300"
          onClick={() => setIsOpen(true)}
        >
          <PlusIcon className="h-7 w-7" /> {/* slightly bigger icon */}
        </IconButton>
      </div>

      {/* Modal / Popup */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
              {/* Close button */}
              <IconButton
                variant="text"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 hover:bg-gray-200"
              >
                <XMarkIcon className="h-5 w-5 stroke-2 text-gray-700" />
              </IconButton>

              {/* Modal content */}
              <Typography variant="h5" className="font-bold mb-4">
                Add New Item
              </Typography>

              {/* Example form content */}
              <form className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Enter name"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <textarea
                  placeholder="Enter description"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <Button type="submit" color="blue">
                  Save
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
