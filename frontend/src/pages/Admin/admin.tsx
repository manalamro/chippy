// src/pages/admin/AdminPage.tsx
import React, { useEffect, useState } from "react";
import { useProductStore } from "../../store/productStore";
import { useOrdersStore } from "../../store/ordersStore";
import { useUserStore } from "../../store/userStore";
import ProductForm from "../../components/productForm";
import CategoryForm from "../../components/categoryForm";
import { adminUpdateOrderStatus } from "../../lib/apiClient";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

// Generic confirmation modal
interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FAF3E0] rounded-xl shadow-xl p-6 max-w-md w-full border border-[#D9C7A6]">
        <h3 className="text-lg font-semibold text-[#3E2723] mb-2">{t("confirmAction")}</h3>
        <p className="mb-4 text-[#5C4A3C]">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors font-medium"
            onClick={onCancel}
          >
            {t("cancel")}
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-[#D9534F] text-white hover:bg-[#C9302C] transition-colors font-medium"
            onClick={onConfirm}
          >
            {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for updating order status
interface StatusModalProps {
  orderId: number;
  currentStatus: string;
  onUpdate: (newStatus: string) => void;
  onClose: () => void;
}
const StatusModal: React.FC<StatusModalProps> = ({ orderId, currentStatus, onUpdate, onClose }) => {
  const [status, setStatus] = useState(currentStatus);
  const { t, i18n } = useTranslation();
  
  const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FAF3E0] rounded-xl shadow-xl p-6 max-w-md w-full border border-[#D9C7A6]">
        <h3 className="text-lg font-semibold text-[#3E2723] mb-4">
          {t("updateStatus")} #{orderId}
        </h3>
        
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#5C4A3C] mb-2">{t("orderStatus")}</label>
          <select
            className="w-full border border-[#D9C7A6] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#A97155] bg-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>
                {t(`orderStatus.${option}`)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors font-medium"
            onClick={onClose}
          >
            {t("cancel")}
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-[#A97155] text-white hover:bg-[#956449] transition-colors font-medium"
            onClick={() => onUpdate(status)}
          >
            {t("updateStatus")}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for order details
interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
}
const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FAF3E0] rounded-xl shadow-xl max-w-4xl w-full p-6 border border-[#D9C7A6] overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-[#3E2723]">
            {t("orderDetails")} - ID: {order.id}
          </h2>
          <button
            onClick={onClose}
            className="text-[#5C4A3C] hover:text-[#3E2723] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg border border-[#E8D9BD]">
            <h3 className="font-medium text-[#3E2723] mb-3">{t("customerInfo")}</h3>
            <p className="mb-1"><span className="font-medium">{t("name")}:</span> {order.user_name}</p>
            <p className="mb-1"><span className="font-medium">{t("email")}:</span> {order.user_email}</p>
            <p className="mb-1"><span className="font-medium">{t("phone")}:</span> {order.address.phone}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-[#E8D9BD]">
            <h3 className="font-medium text-[#3E2723] mb-3">{t("orderInfo")}</h3>
            <p className="mb-1"><span className="font-medium">{t("status")}:</span> <span className="capitalize">{t(`orderStatus.${order.status}`)}</span></p>
            <p className="mb-1"><span className="font-medium">{t("paymentStatus")}:</span> {order.payment_status}</p>
            <p className="mb-1"><span className="font-medium">{t("total")}:</span> ${Number(order.total ?? 0).toFixed(2)}</p>
            <p className="mb-1"><span className="font-medium">{t("date")}:</span> {new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium text-[#3E2723] mb-3">{t("shippingAddress")}</h3>
          <div className="bg-white p-4 rounded-lg border border-[#E8D9BD]">
            <p>{order.address.full_name}</p>
            <p>{order.address.street}</p>
            <p>{order.address.city}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-[#3E2723] mb-3">{t("orderItems")}</h3>
          <div className="overflow-x-auto rounded-lg border border-[#E8D9BD]">
            <table className="w-full">
              <thead className="bg-[#E8D9BD]">
                <tr>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">{t("product")}</th>
                  <th className="py-3 px-4 text-center font-medium text-[#3E2723]">{t("quantity")}</th>
                  <th className="py-3 px-4 text-right font-medium text-[#3E2723]">{t("price")}</th>
                  <th className="py-3 px-4 text-right font-medium text-[#3E2723]">{t("subtotal")}</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, idx: number) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF3E0]'}>
                    <td className="py-3 px-4">{item.title}</td>
                    <td className="py-3 px-4 text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">${Number(item.unit_price).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">${(item.quantity * item.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPage: React.FC = () => {
  const { products, categories, fetchProducts, fetchCategories, deleteProduct, deleteCategory } = useProductStore();
  const { orders, fetchAdminOrders } = useOrdersStore();
  const logoutUser = useUserStore((state) => state.logoutUser);
  const { t, i18n } = useTranslation();

  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [statusModalOrder, setStatusModalOrder] = useState<any | null>(null);

  // Set document direction based on selected language
  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchAdminOrders();
  }, [fetchCategories, fetchProducts, fetchAdminOrders]);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang); // save selection
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const handleDeleteProduct = (id: number, title: string) => {
    setConfirmModal({
      message: t("confirmDeleteProduct", { title }),
      onConfirm: async () => {
        try {
          await deleteProduct(id);
          fetchProducts();
        } catch (err) {
          console.error(err);
        }
        setConfirmModal(null);
      },
    });
  };

  const handleDeleteCategory = (id: number, name: string) => {
    // Check if there are products linked to this category
    const linkedProducts = products.filter(p => p.category_id === id);
  
    if (linkedProducts.length > 0) {
      // If there are linked products, show a warning message
      setConfirmModal({
        message: t("cannotDeleteCategoryWithProducts", { name, count: linkedProducts.length }),
        onConfirm: () => setConfirmModal(null), // Do nothing on confirm, just close the message
      });
    } else {
      // If no linked products, allow deletion
      setConfirmModal({
        message: t("confirmDeleteCategory", { name }),
        onConfirm: async () => {
          try {
            await deleteCategory(id);
            fetchCategories();
            fetchProducts();
          } catch (err) {
            console.error(err);
          }
          setConfirmModal(null);
        },
      });
    }
  };
  

  const handleUpdateOrderStatus = (order: any) => {
    setStatusModalOrder(order);
  };

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen  flex">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-20 flex flex-col items-center bg-[#A97155] shadow-lg py-6 z-10">
        <div className="flex-1"></div>
        
        {/* Language Toggle Button */}
        <button
          onClick={toggleLanguage}
          className="flex flex-col items-center justify-center w-12 h-12 bg-[#FAF3E0] hover:bg-[#E0D8C8] text-[#A97155] rounded-full shadow-md transition-all duration-300 mb-4"
          title={t("changeLanguage")}
        >
          <Globe className="w-6 h-6" />
          <span className="text-xs mt-1">{i18n.language === "en" ? "العربية" : "English"}</span>
        </button>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-12 h-12 bg-[#FAF3E0] hover:bg-[#E0D8C8] text-[#A97155] rounded-full shadow-md transition-all duration-300 mb-6"
          title={t("logout")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0l4-4m-4 4l4 4m6 4v1a2 2 0 002 2h3a2 2 0 002-2v-1m-7-4V7" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-20 p-8 space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#3E2723]">{t("adminDashboard")}</h1>
          <p className="text-[#5C4A3C]">{t("adminSubtitle")}</p>
        </header>

        {/* Products Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-[#E8D9BD]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#3E2723]">{t("products")}</h2>
            <button
              onClick={() => { setEditProductId(null); setShowProductForm(true); }}
              className="px-4 py-2.5 rounded-lg bg-[#A97155] text-white hover:bg-[#956449] transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t("addProduct")}
            </button>
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-[#E8D9BD]">
            <table className="w-full">
              <thead className="bg-[#E8D9BD]">
                <tr>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">{t("PRODUCTS.MANAGEMENT.ID")}</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">{t("PRODUCTS.MANAGEMENT.TITLE")}</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">{t("category")}</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">{t("price")}</th>
                  <th className="py-3 px-4 text-right font-medium text-[#3E2723]">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id} className="border-t border-[#E8D9BD] hover:bg-[#FAF3E0] transition-colors">
                    <td className="py-3 px-4">{prod.id}</td>
                    <td className="py-3 px-4 font-medium">{prod.title}</td>
                    <td className="py-3 px-4">{prod.category_name || t("uncategorized")}</td>
                    <td className="py-3 px-4">${Number(prod.price ?? 0).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 rounded-lg bg-[#E8D9BD] text-[#3E2723] hover:bg-[#D9C7A6] transition-colors"
                          onClick={() => { setEditProductId(prod.id); setShowProductForm(true); }}
                          title={t("edit")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="p-2 rounded-lg bg-[#F5D7D7] text-[#D9534F] hover:bg-[#EECECE] transition-colors"
                          onClick={() => handleDeleteProduct(prod.id, prod.title)}
                          title={t("delete")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a2 2 0 012 2v2H8V5a2 2 0 012-2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-[#5C4A3C]">
                      {t("noProductsFound")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-[#E8D9BD]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#3E2723]">{t("categories")}</h2>
            <button
              onClick={() => { setEditCategoryId(null); setShowCategoryForm(true); }}
              className="px-4 py-2.5 rounded-lg bg-[#A97155] text-white hover:bg-[#956449] transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t("addCategory")}
            </button>
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-[#E8D9BD]">
            <table className="w-full">
              <thead className="bg-[#E8D9BD]">
                <tr>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">{t("PRODUCTS.MANAGEMENT.ID")}</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">{t("name")}</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">{t("slug")}</th>
                  <th className="py-3 px-4 text-right font-medium text-[#3E2723]">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-t border-[#E8D9BD] hover:bg-[#FAF3E0] transition-colors">
                    <td className="py-3 px-4">{cat.id}</td>
                    <td className="py-3 px-4 font-medium">{cat.name}</td>
                    <td className="py-3 px-4 text-[#5C4A3C]">{cat.slug}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 rounded-lg bg-[#E8D9BD] text-[#3E2723] hover:bg-[#D9C7A6] transition-colors"
                          onClick={() => { setEditCategoryId(cat.id); setShowCategoryForm(true); }}
                          title={t("edit")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="p-2 rounded-lg bg-[#F5D7D7] text-[#D9534F] hover:bg-[#EECECE] transition-colors"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          title={t("delete")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a2 2 0 012 2v2H8V5a2 2 0 012-2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-[#5C4A3C]">
                      {t("noCategoriesFound")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Orders Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-[#E8D9BD]">
          <h2 className="text-xl font-semibold text-[#3E2723] mb-6">{t("orders")}</h2>
          
          <div className="overflow-x-auto rounded-lg border border-[#E8D9BD]">
            <table className="w-full">
              <thead className="bg-[#E8D9BD]">
                <tr>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">{t("PRODUCTS.MANAGEMENT.ID")}</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">{t("total")}</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">{t("status")}</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">{t("paymentStatus")}</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">{t("createdAt")}</th>
                  <th className="py-3 px-4 text-right font-medium text-[#3E2723]">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-[#E8D9BD] hover:bg-[#FAF3E0] transition-colors">
                    <td className="py-3 px-4 font-medium">#{order.id}</td>
                    <td className="py-3 px-4">${Number(order.total ?? 0).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t(`orderStatus.${order.status}`)}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize">{order.payment_status || t("nA")}</td>
                    <td className="py-3 px-4">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 rounded-lg bg-[#E8D9BD] text-[#3E2723] hover:bg-[#D9C7A6] transition-colors"
                          onClick={() => handleUpdateOrderStatus(order)}
                          title={t("updateStatus")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <button
                          className="p-2 rounded-lg bg-[#D9E1F2] text-[#3E2723] hover:bg-[#C9D1E2] transition-colors"
                          onClick={() => setSelectedOrder(order)}
                          title={t("viewDetails")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#5C4A3C]">
                      {t("noOrdersFound")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Forms */}
        {showProductForm && (
          <ProductForm
            categories={categories}
            product={editProductId ? products.find(p => p.id === editProductId) : undefined}
            onClose={() => { setShowProductForm(false); setEditProductId(null); }}
            onSuccess={() => fetchProducts()}
          />
        )}

        {showCategoryForm && (
          <CategoryForm
            category={editCategoryId ? categories.find(c => c.id === editCategoryId) : undefined}
            onClose={() => { setShowCategoryForm(false); setEditCategoryId(null); }}
            onSuccess={() => fetchCategories()}
          />
        )}

        {/* Modals */}
        {confirmModal && (
          <ConfirmationModal
            message={confirmModal.message}
            onConfirm={confirmModal.onConfirm}
            onCancel={() => setConfirmModal(null)}
          />
        )}

        {statusModalOrder && (
          <StatusModal
            orderId={statusModalOrder.id}
            currentStatus={statusModalOrder.status}
            onUpdate={(newStatus) => {
              adminUpdateOrderStatus(statusModalOrder.id, newStatus)
                .then(() => fetchAdminOrders())
                .finally(() => setStatusModalOrder(null));
            }}
            onClose={() => setStatusModalOrder(null)}
          />
        )}

        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPage;