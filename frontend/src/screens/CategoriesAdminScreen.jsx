import React, { useState } from "react";
import FloatingAddButton from "../components/FloatingAddButton.jsx";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  useCreateCategoryMutation,
} from "../slices/categoryApiSlice.js";
import CategoryModal from "../components/CategoryModal.jsx";

const CategoriesAdminScreen = () => {
  const { data, isLoading, isError, refetch } = useGetCategoriesQuery({
    skip: 0,
    take: 100,
  });

  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();

  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | null
  const [currentCategory, setCurrentCategory] = useState(null);

  const emptyCategory = {
    categoryName: "",
    imageURL: "",
    description: "",
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory({ id }).unwrap();
        refetch();
        alert("Category deleted successfully!");
      } catch (error) {
        console.error("Failed to delete the category:", error);
        alert("Failed to delete the category.");
      }
    }
  };

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setModalMode("edit");
  };

  const handleAdd = () => {
    setCurrentCategory(emptyCategory);
    setModalMode("add");
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (modalMode === "add") {
        await createCategory(formData).unwrap();
        alert("Category created successfully!");
      } else {
        await updateCategory({
          id: currentCategory.categoryID,
          ...formData,
        }).unwrap();
        alert("Category updated successfully!");
      }
      refetch();
      setModalMode(null);
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category.");
    }
  };

  if (isLoading)
    return (
      <p className="text-center mt-4 text-gray-400">Loading categories...</p>
    );
  if (isError)
    return (
      <p className="text-center mt-4 text-red-500">Failed to load categories</p>
    );

  return (
    <div className="relative p-6 bg-gray-50 min-h-screen">
      {!modalMode && <FloatingAddButton onClick={handleAdd} />}

      <h1 className="text-4xl font-bold mb-8 text-gray-900">Categories</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.map((category) => (
          <div
            key={category.categoryID}
            className="flex flex-col bg-white rounded-3xl shadow-md hover:shadow-xl transition overflow-hidden border-2 border-gray-200 hover:border-blue-400"
          >
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={category.imageURL || "https://via.placeholder.com/300x200"}
                alt={category.categoryName}
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
                  <span>{category.categoryName}</span>
                  <span className="text-sm font-thin text-gray-400">
                    ID: {category.categoryID}
                  </span>
                </h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {category.description}
                </p>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 bg-blue-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.categoryID)}
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
        <CategoryModal
          mode={modalMode}
          category={currentCategory}
          onClose={() => setModalMode(null)}
          onSubmit={handleModalSubmit}
          isLoading={modalMode === "add" ? isCreating : isUpdating}
        />
      )}
    </div>
  );
};

export default CategoriesAdminScreen;
