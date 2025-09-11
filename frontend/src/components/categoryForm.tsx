// src/pages/admin/components/CategoryForm.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

type CategoryFormProps = {
  onClose: () => void;
  onSuccess: () => void;
  category?: { id: number; name: string; slug: string };
};

const CategoryForm: React.FC<CategoryFormProps> = ({ onClose, onSuccess, category }) => {
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      if (category) {
        await axios.put(
          `/admin/categories/${category.id}`,
          { name, slug },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `/admin/categories`,
          { name, slug },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
      >
        <h2 className="text-2xl font-bold text-[#3E2723] mb-4">
          {category ? "Update Category" : "Add Category"}
        </h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-gradient-to-r from-[#A97155] to-[#D9A441] text-white"
          >
            {category ? "Update" : "Add"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default CategoryForm;
