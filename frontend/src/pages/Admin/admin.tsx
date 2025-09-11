// src/pages/admin/AdminPage.tsx
import React, { useEffect, useState } from "react";
import { useProductStore } from "../../store/productStore";
import { useOrdersStore } from "../../store/ordersStore";
import { useUserStore } from "../../store/userStore";
import ProductForm from "../../components/productForm";
import CategoryForm from "../../components/categoryForm";
import { adminUpdateOrderStatus } from "../../lib/apiClient";

// Generic confirmation modal
interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-[#FAF3E0] rounded-xl shadow-xl p-6 max-w-md w-full border border-[#D9C7A6]">
      <h3 className="text-lg font-semibold text-[#3E2723] mb-2">Confirm Action</h3>
      <p className="mb-4 text-[#5C4A3C]">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors font-medium"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-[#D9534F] text-white hover:bg-[#C9302C] transition-colors font-medium"
          onClick={onConfirm}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

// Modal for updating order status
interface StatusModalProps {
  orderId: number;
  currentStatus: string;
  onUpdate: (newStatus: string) => void;
  onClose: () => void;
}
const StatusModal: React.FC<StatusModalProps> = ({ orderId, currentStatus, onUpdate, onClose }) => {
  const [status, setStatus] = useState(currentStatus);
  
  const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FAF3E0] rounded-xl shadow-xl p-6 max-w-md w-full border border-[#D9C7A6]">
        <h3 className="text-lg font-semibold text-[#3E2723] mb-4">Update Status for Order #{orderId}</h3>
        
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#5C4A3C] mb-2">Order Status</label>
          <select
            className="w-full border border-[#D9C7A6] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#A97155] bg-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors font-medium"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-[#A97155] text-white hover:bg-[#956449] transition-colors font-medium"
            onClick={() => onUpdate(status)}
          >
            Update Status
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
const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-[#FAF3E0] rounded-xl shadow-xl max-w-4xl w-full p-6 border border-[#D9C7A6] overflow-y-auto max-h-[90vh]">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold text-[#3E2723]">Order Details - ID: {order.id}</h2>
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
          <h3 className="font-medium text-[#3E2723] mb-3">Customer Information</h3>
          <p className="mb-1"><span className="font-medium">Name:</span> {order.user_name}</p>
          <p className="mb-1"><span className="font-medium">Email:</span> {order.user_email}</p>
          <p className="mb-1"><span className="font-medium">Phone:</span> {order.address.phone}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-[#E8D9BD]">
          <h3 className="font-medium text-[#3E2723] mb-3">Order Information</h3>
          <p className="mb-1"><span className="font-medium">Status:</span> <span className="capitalize">{order.status}</span></p>
          <p className="mb-1"><span className="font-medium">Payment Status:</span> {order.payment_status}</p>
          <p className="mb-1"><span className="font-medium">Total:</span> ${Number(order.total ?? 0).toFixed(2)}</p>
          <p className="mb-1"><span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleString()}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium text-[#3E2723] mb-3">Shipping Address</h3>
        <div className="bg-white p-4 rounded-lg border border-[#E8D9BD]">
          <p>{order.address.full_name}</p>
          <p>{order.address.street}</p>
          <p>{order.address.city}</p>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium text-[#3E2723] mb-3">Order Items</h3>
        <div className="overflow-x-auto rounded-lg border border-[#E8D9BD]">
          <table className="w-full">
            <thead className="bg-[#E8D9BD]">
              <tr>
                <th className="py-3 px-4 text-left font-medium text-[#3E2723]">Product</th>
                <th className="py-3 px-4 text-center font-medium text-[#3E2723]">Quantity</th>
                <th className="py-3 px-4 text-right font-medium text-[#3E2723]">Price</th>
                <th className="py-3 px-4 text-right font-medium text-[#3E2723]">Subtotal</th>
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

const AdminPage: React.FC = () => {
  const { products, categories, fetchProducts, fetchCategories } = useProductStore();
  const { orders, fetchAdminOrders } = useOrdersStore();
  const logoutUser = useUserStore((state) => state.logoutUser);

  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [statusModalOrder, setStatusModalOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchAdminOrders();
  }, [fetchCategories, fetchProducts, fetchAdminOrders]);

  const handleDeleteProduct = (id: number, title: string) => {
    setConfirmModal({
      message: `Are you sure you want to delete product "${title}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await fetch(`/admin/products/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          fetchProducts();
        } catch (err) {
          console.error(err);
        }
        setConfirmModal(null);
      },
    });
  };

  const handleDeleteCategory = (id: number, name: string) => {
    setConfirmModal({
      message: `Are you sure you want to delete category "${name}"? All products in this category will be moved to "Uncategorized".`,
      onConfirm: async () => {
        try {
          await fetch(`/admin/categories/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          fetchCategories();
        } catch (err) {
          console.error(err);
        }
        setConfirmModal(null);
      },
    });
  };

  const handleUpdateOrderStatus = (order: any) => {
    setStatusModalOrder(order);
  };

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0] flex">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-20 flex flex-col items-center bg-[#A97155] shadow-lg py-6 z-10">
        <div className="flex-1"></div>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-12 h-12 bg-[#FAF3E0] hover:bg-[#E0D8C8] text-[#A97155] rounded-full shadow-md transition-all duration-300 mb-6"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0l4-4m-4 4l4 4m6 4v1a2 2 0 002 2h3a2 2 0 002-2v-1m-7-4V7" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-20 p-8 space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#3E2723]">Admin Dashboard</h1>
          <p className="text-[#5C4A3C]">Manage products, categories, and orders</p>
        </header>

        {/* Products Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-[#E8D9BD]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#3E2723]">Products</h2>
            <button
              onClick={() => { setEditProductId(null); setShowProductForm(true); }}
              className="px-4 py-2.5 rounded-lg bg-[#A97155] text-white hover:bg-[#956449] transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product
            </button>
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-[#E8D9BD]">
            <table className="w-full">
              <thead className="bg-[#E8D9BD]">
                <tr>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">ID</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">Name</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">Category</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">Price</th>
                  <th className="py-3 px-4 text-right font-medium text-[#3E2723]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id} className="border-t border-[#E8D9BD] hover:bg-[#FAF3E0] transition-colors">
                    <td className="py-3 px-4">{prod.id}</td>
                    <td className="py-3 px-4 font-medium">{prod.title}</td>
                    <td className="py-3 px-4">{prod.category_name || "Uncategorized"}</td>
                    <td className="py-3 px-4">${Number(prod.price ?? 0).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 rounded-lg bg-[#E8D9BD] text-[#3E2723] hover:bg-[#D9C7A6] transition-colors"
                          onClick={() => { setEditProductId(prod.id); setShowProductForm(true); }}
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          className="p-2 rounded-lg bg-[#F5D7D7] text-[#D9534F] hover:bg-[#EECECE] transition-colors"
                          onClick={() => handleDeleteProduct(prod.id, prod.title)}
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-[#5C4A3C]">
                      No products found
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
            <h2 className="text-xl font-semibold text-[#3E2723]">Categories</h2>
            <button
              onClick={() => { setEditCategoryId(null); setShowCategoryForm(true); }}
              className="px-4 py-2.5 rounded-lg bg-[#A97155] text-white hover:bg-[#956449] transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Category
            </button>
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-[#E8D9BD]">
            <table className="w-full">
              <thead className="bg-[#E8D9BD]">
                <tr>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">ID</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">Name</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">Slug</th>
                  <th className="py-3 px-4 text-right font-medium text-[#3E2723]">Actions</th>
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
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          className="p-2 rounded-lg bg-[#F5D7D7] text-[#D9534F] hover:bg-[#EECECE] transition-colors"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-[#5C4A3C]">
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Orders Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-[#E8D9BD]">
          <h2 className="text-xl font-semibold text-[#3E2723] mb-6">Orders</h2>
          
          <div className="overflow-x-auto rounded-lg border border-[#E8D9BD]">
            <table className="w-full">
              <thead className="bg-[#E8D9BD]">
                <tr>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">ID</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">Total</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">Status</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">Payment Status</th>
                  <th className="py-3 px-4 text-left font-medium text-[#3E2723]">Created At</th>
                  <th className="py-3 px-4 text-right font-medium text-[#3E2723]">Actions</th>
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
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize">{order.payment_status || "N/A"}</td>
                    <td className="py-3 px-4">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 rounded-lg bg-[#E8D9BD] text-[#3E2723] hover:bg-[#D9C7A6] transition-colors"
                          onClick={() => handleUpdateOrderStatus(order)}
                          title="Update Status"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <button
                          className="p-2 rounded-lg bg-[#D9E1F2] text-[#3E2723] hover:bg-[#C9D1E2] transition-colors"
                          onClick={() => setSelectedOrder(order)}
                          title="View Details"
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
                      No orders found
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
            onUpdate={async (newStatus) => {
              try {
                await adminUpdateOrderStatus(statusModalOrder.id, newStatus);
                fetchAdminOrders();
              } catch (err) {
                console.error(err);
              }
              setStatusModalOrder(null);
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