import React, { useState } from "react";
import { motion } from "framer-motion";
import { useProductStore } from "../store/productStore";
import { useTranslation } from "react-i18next";

type CategoryFormProps = {
  onClose: () => void;
  onSuccess: () => void;
  category?: { id: number; name: string; slug: string };
};

const CategoryForm: React.FC<CategoryFormProps> = ({ onClose, onSuccess, category }) => {
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const { t } = useTranslation();
  
  const { createCategory, updateCategory } = useProductStore();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = t("CATEGORIES.ERROR.NAME_REQUIRED");
    if (!slug.trim()) newErrors.slug = t("CATEGORIES.ERROR.SLUG_REQUIRED");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (category) {
        await updateCategory(category.id, { name, slug });
      } else {
        await createCategory({ name, slug });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Category form error:", err);
      
      // Handle different types of errors
      if (err.response?.data?.message) {
        setApiError(err.response.data.message);
      } else if (err.message) {
        setApiError(err.message);
      } else if (err.response?.status === 409) {
        setApiError(t("error.categoryExists"));
      } else if (err.response?.status === 400) {
        setApiError(t("error.invalidData"));
      } else {
        setApiError(t("error.generic"));
      }
    } finally {
      setIsSubmitting(false);
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
          {category ? t("CATEGORIES.UPDATE_CATEGORY") : t("CATEGORIES.ADD_CATEGORY")}
        </h2>

        {/* API Error Display */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            <p className="text-sm">{apiError}</p>
          </div>
        )}

        <label className="block mb-1 font-semibold text-[#3E2723]">{t("name")}</label>
        <input
          type="text"
          placeholder={t("name")}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: "" });
            setApiError("");
          }}
          className={`w-full p-2 mb-3 border rounded ${errors.name ? "border-red-500" : "border-gray-300"}`}
          required
          disabled={isSubmitting}
        />
        {errors.name && <p className="text-red-500 text-sm mb-2">{errors.name}</p>}

        <label className="block mb-1 font-semibold text-[#3E2723]">{t("slug")}</label>
        <input
          type="text"
          placeholder={t("slug")}
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            if (errors.slug) setErrors({ ...errors, slug: "" });
            setApiError("");
          }}
          className={`w-full p-2 mb-4 border rounded ${errors.slug ? "border-red-500" : "border-gray-300"}`}
          required
          disabled={isSubmitting}
        />
        {errors.slug && <p className="text-red-500 text-sm mb-2">{errors.slug}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-gradient-to-r from-[#A97155] to-[#D9A441] text-white disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("messages.saving") : (category ? t("update") : t("add"))}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default CategoryForm;