import React, { useState } from "react";
import { CreditCard, Lock, ArrowLeft } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useOrdersStore } from "../../store/ordersStore";
import { createAddress } from "../../lib/apiClient";
import { useTranslation } from "react-i18next";

const Checkout: React.FC = () => {
  const { t } = useTranslation();
  const { cart } = useCartStore();
  const items = cart?.items || [];

  const [activeSection, setActiveSection] = useState<"customer" | "shipping" | "payment">("customer");
  const [formData, setFormData] = useState({
    customer: { fullName: "", phone: "" },
    shipping: { street: "", city: "", country: "", notes: "" },
    payment: { cardNumber: "", cardName: "", expDate: "", cvv: "" },
  });

  const total = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const handleInputChange = (section: keyof typeof formData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart) return;

    try {
      const addressData = {
        full_name: formData.customer.fullName,
        phone: formData.customer.phone,
        street: formData.shipping.street,
        city: formData.shipping.city,
        country: formData.shipping.country,
        notes: formData.shipping.notes || ''
      };

      const addressRes = await createAddress(addressData);
      const addressId = addressRes.id;

      await useOrdersStore.getState().addOrder(addressId, formData.payment);

      alert(t("checkout.successMessage"));
      useCartStore.getState().clearCart();
      setActiveSection("customer");
    } catch (error: any) {
      alert(t("checkout.errorMessage") + error.message);
    }
  };

  const renderCustomerSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{t("checkout.customerInfo")}</h3>
      <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            {t("checkout.fullName")}
          </label>
          <input
            type="text"
            id="fullName"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155]"
            value={formData.customer.fullName}
            onChange={(e) => handleInputChange("customer", "fullName", e.target.value)}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            {t("checkout.phone")}
          </label>
          <input
            type="tel"
            id="phone"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155]"
            value={formData.customer.phone}
            onChange={(e) => handleInputChange("customer", "phone", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={() => setActiveSection("shipping")}
          className="bg-[#A97155] py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#8f5e43]"
        >
          {t("checkout.goToShipping")}
        </button>
      </div>
    </div>
  );

  const renderShippingSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{t("checkout.shippingInfo")}</h3>
      <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="street" className="block text-sm font-medium text-gray-700">
            {t("checkout.address")}
          </label>
          <input
            type="text"
            id="street"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155]"
            value={formData.shipping.street}
            onChange={(e) => handleInputChange("shipping", "street", e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            {t("checkout.city")}
          </label>
          <input
            type="text"
            id="city"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155]"
            value={formData.shipping.city}
            onChange={(e) => handleInputChange("shipping", "city", e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            {t("checkout.country")}
          </label>
          <input
            type="text"
            id="country"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155]"
            value={formData.shipping.country}
            onChange={(e) => handleInputChange("shipping", "country", e.target.value)}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            {t("checkout.notes")}
          </label>
          <input
            type="text"
            id="notes"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155]"
            value={formData.shipping.notes}
            onChange={(e) => handleInputChange("shipping", "notes", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => setActiveSection("customer")}
          className="flex items-center text-sm text-[#A97155] hover:text-[#8f5e43]"
        >
          <ArrowLeft size={16} className="ml-1" />
          {t("checkout.backToCustomer")}
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("payment")}
          className="bg-[#A97155] py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#8f5e43]"
        >
          {t("checkout.goToPayment")}
        </button>
      </div>
    </div>
  );

  const renderPaymentSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{t("checkout.paymentInfo")}</h3>
      <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
            {t("checkout.cardNumber")}
          </label>
          <input
            type="text"
            id="cardNumber"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155]"
            placeholder="0000 0000 0000 0000"
            value={formData.payment.cardNumber}
            onChange={(e) => handleInputChange("payment", "cardNumber", e.target.value)}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
            {t("checkout.cardName")}
          </label>
          <input
            type="text"
            id="cardName"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155]"
            value={formData.payment.cardName}
            onChange={(e) => handleInputChange("payment", "cardName", e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="expDate" className="block text-sm font-medium text-gray-700">
            {t("checkout.expDate")}
          </label>
          <input
            type="text"
            id="expDate"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155]"
            placeholder="MM/YY"
            value={formData.payment.expDate}
            onChange={(e) => handleInputChange("payment", "expDate", e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
            {t("checkout.cvv")}
          </label>
          <input
            type="text"
            id="cvv"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155]"
            placeholder="123"
            value={formData.payment.cvv}
            onChange={(e) => handleInputChange("payment", "cvv", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => setActiveSection("shipping")}
          className="flex items-center text-sm text-[#A97155] hover:text-[#8f5e43]"
        >
          <ArrowLeft size={16} className="ml-1" />
          {t("checkout.backToShipping")}
        </button>
        <button
          type="submit"
          className="bg-[#A97155] py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#8f5e43]"
        >
          {t("checkout.placeOrder")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{t("checkout.title")}</h1>

          <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start mt-8">
            {/* Order summary */}
            <div className="lg:col-start-2">
              <div className="bg-white rounded-lg shadow px-4 py-6 sm:p-6 lg:p-8">
                <h2 className="text-lg font-medium text-gray-900 mb-6">{t("checkout.orderSummary")}</h2>

                <div className="flow-root">
                  <ul className="-my-6 divide-y divide-gray-200">
                    {items.map((item) => (
                      <li key={item.id} className="py-4 flex">
                        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                          <img
                            src={item.product.images?.[0]?.url || "/api/placeholder/64/64"}
                            alt={item.product.title}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>

                        <div className="ml-4 pr-3 flex-1 flex flex-col">
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.product.title}</h3>
                            <p className="ml-4">${(item.product.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="text-gray-500 text-sm">{t("checkout.quantity")} {item.quantity}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                 
                  <div className="flex justify-between text-lg font-bold text-gray-900 mt-6 pt-3 border-t">
                    <p>{t("cart.total")}</p>
                    <p>${total.toFixed(2)}</p>
                  </div>
              </div>
            </div>

            {/* Checkout form */}
            <div className="mt-10 lg:mt-0 lg:col-start-1">
              <div className="bg-white rounded-lg shadow px-4 py-6 sm:p-6 lg:p-8">
                {activeSection === "customer" && renderCustomerSection()}
                {activeSection === "shipping" && renderShippingSection()}
                {activeSection === "payment" && renderPaymentSection()}
              </div>

              <div className="mt-6 flex items-center text-sm text-gray-500">
                <Lock className="w-4 h-4 ml-1" />
                <span>{t("checkout.securePayment")}</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
