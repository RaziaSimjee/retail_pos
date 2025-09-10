import React, { useState } from "react";
import FloatingAddButton from "../components/FloatingAddButton.jsx";
import {
  useGetColorsQuery,
  useDeleteColorMutation,
  useUpdateColorMutation,
  useCreateColorMutation,
} from "../slices/colorApiSlice.js";
import ColorModal from "../components/ColorModal.jsx";

const ColorsAdminScreen = () => {
  const { data, isLoading, isError, refetch } = useGetColorsQuery({
    skip: 0,
    take: 100,
  });

  const [deleteColor, { isLoading: isDeleting }] = useDeleteColorMutation();
  const [updateColor, { isLoading: isUpdating }] = useUpdateColorMutation();
  const [createColor, { isLoading: isCreating }] = useCreateColorMutation();

  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | null
  const [currentColor, setCurrentColor] = useState(null);

  const emptyColor = {
    colorName: "",
    imageURL: "",
    description: "",
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this color?")) {
      try {
        await deleteColor({ id }).unwrap();
        refetch();
        alert("Color deleted successfully!");
      } catch (error) {
        console.error("Failed to delete the color:", error);
        alert("Failed to delete the color.");
      }
    }
  };

  const handleEdit = (color) => {
    setCurrentColor(color);
    setModalMode("edit");
  };

  const handleAdd = () => {
    setCurrentColor(emptyColor);
    setModalMode("add");
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (modalMode === "add") {
        await createColor(formData).unwrap();
        alert("Color created successfully!");
      } else {
        await updateColor({
          id: currentColor.colorID,
          ...formData,
        }).unwrap();
        alert("Color updated successfully!");
      }
      refetch();
      setModalMode(null);
    } catch (error) {
      console.error("Error saving color:", error);
      alert("Failed to save color.");
    }
  };

  if (isLoading)
    return <p className="text-center mt-4 text-gray-400">Loading colors...</p>;
  if (isError)
    return (
      <p className="text-center mt-4 text-red-500">Failed to load colors</p>
    );

  return (
    <div className="relative p-6 bg-gray-50 min-h-screen">
      {!modalMode && <FloatingAddButton onClick={handleAdd} />}

      <h1 className="text-4xl font-bold mb-8 text-gray-900">Colors</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.map((color) => (
          <div
            key={color.colorID}
            className="flex flex-col bg-white rounded-3xl shadow-md hover:shadow-xl transition overflow-hidden border-2 border-gray-200 hover:border-blue-400"
          >
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={color.imageURL || "https://via.placeholder.com/300x200"}
                alt={color.colorName}
                onError={(e) => {
                  if (e.target.src !== "https://via.placeholder.com/300x200") {
                    e.target.src = "https://via.placeholder.com/300x200";
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex justify-between items-center">
                  {color.colorName}
                  <span className="text-sm font-thin text-gray-400">ID: {color.colorID}</span>
                </h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {color.description}
                </p>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(color)}
                  className="flex-1 bg-blue-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(color.colorID)}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-red-600 transition font-medium disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalMode && (
        <ColorModal
          mode={modalMode}
          color={currentColor}
          onClose={() => setModalMode(null)}
          onSubmit={handleModalSubmit}
          isLoading={modalMode === "add" ? isCreating : isUpdating}
        />
      )}
    </div>
  );
};

export default ColorsAdminScreen;
