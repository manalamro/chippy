import React, { useState } from "react";
import { motion } from "framer-motion";
import { useProductStore } from "../store/productStore";

type ProductFormProps = {
  onClose: () => void;
  onSuccess: () => void;
  product?: {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    category_id: number;
    images?: { id: number; url: string; alt: string }[];
  };
  categories: { id: number; name: string }[];
};

type ImageInput = {
  url: string;
  alt: string;
};

const ProductForm: React.FC<ProductFormProps> = ({ onClose, onSuccess, product, categories }) => {
  const [title, setTitle] = useState(product?.title || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price || 0);
  const [stock, setStock] = useState(product?.stock || 0);
  const [categoryId, setCategoryId] = useState<number | "">(product?.category_id || "");
  const [images, setImages] = useState<ImageInput[]>(
    product?.images?.map(img => ({ url: img.url, alt: img.alt })) || []
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { createProduct, updateProduct } = useProductStore();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!slug.trim()) newErrors.slug = "Slug is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (price < 0) newErrors.price = "Price cannot be negative";
    if (stock < 0) newErrors.stock = "Stock cannot be negative";
    if (categoryId === "") newErrors.categoryId = "Category is required";
    
    // Validate images
    images.forEach((image, index) => {
      if (image.url && !isValidUrl(image.url)) {
        newErrors[`image_${index}`] = "Please enter a valid URL";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = { 
        title, 
        slug, 
        description, 
        price, 
        stock, 
        category_id: categoryId,
        images: images.filter(img => img.url.trim() !== "")
      };
      
      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong!");
    }
  };

  const addImageField = () => {
    setImages([...images, { url: "", alt: "" }]);
  };

  const removeImageField = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const updateImageField = (index: number, field: keyof ImageInput, value: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    setImages(newImages);
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
        className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
      >
        <h2 className="text-2xl font-bold text-[#3E2723] mb-4">
          {product ? "Update Product" : "Add Product"}
        </h2>

        {/* Title */}
        <label className="block mb-1 font-semibold text-[#3E2723]">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full p-2 mb-3 border rounded ${errors.title ? "border-red-500" : ""}`}
        />
        {errors.title && <p className="text-red-500 text-sm mb-2">{errors.title}</p>}

        {/* Slug */}
        <label className="block mb-1 font-semibold text-[#3E2723]">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={`w-full p-2 mb-3 border rounded ${errors.slug ? "border-red-500" : ""}`}
        />
        {errors.slug && <p className="text-red-500 text-sm mb-2">{errors.slug}</p>}

        {/* Description */}
        <label className="block mb-1 font-semibold text-[#3E2723]">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`w-full p-2 mb-3 border rounded ${errors.description ? "border-red-500" : ""}`}
          rows={4}
        />
        {errors.description && <p className="text-red-500 text-sm mb-2">{errors.description}</p>}

        {/* Price */}
        <label className="block mb-1 font-semibold text-[#3E2723]">Price</label>
        <input
          type="number"
          value={price}
          min={0}
          step={0.01}
          onChange={(e) => setPrice(Number(e.target.value))}
          className={`w-full p-2 mb-3 border rounded ${errors.price ? "border-red-500" : ""}`}
        />
        {errors.price && <p className="text-red-500 text-sm mb-2">{errors.price}</p>}

        {/* Stock */}
        <label className="block mb-1 font-semibold text-[#3E2723]">Stock</label>
        <input
          type="number"
          value={stock}
          min={0}
          step={1}
          onChange={(e) => setStock(Number(e.target.value))}
          className={`w-full p-2 mb-3 border rounded ${errors.stock ? "border-red-500" : ""}`}
        />
        {errors.stock && <p className="text-red-500 text-sm mb-2">{errors.stock}</p>}

        {/* Category */}
        <label className="block mb-1 font-semibold text-[#3E2723]">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className={`w-full p-2 mb-4 border rounded ${errors.categoryId ? "border-red-500" : ""}`}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="text-red-500 text-sm mb-2">{errors.categoryId}</p>}

        {/* Images Section */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-[#3E2723]">Product Images</label>
          
          {images.map((image, index) => (
            <div key={index} className="mb-3 p-3 border rounded bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Image {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Image URL *</label>
                  <input
                    type="url"
                    value={image.url}
                    onChange={(e) => updateImageField(index, 'url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full p-2 border rounded text-sm ${
                      errors[`image_${index}`] ? "border-red-500" : ""
                    }`}
                  />
                  {errors[`image_${index}`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`image_${index}`]}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => updateImageField(index, 'alt', e.target.value)}
                    placeholder="Description of the image"
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addImageField}
            className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded border-dashed border-2 border-gray-300 w-full"
          >
            + Add Image
          </button>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
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
            {product ? "Update" : "Add"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default ProductForm;