import React, { useState } from "react";
import { CreditCard, Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useOrdersStore } from "../../store/ordersStore";
import { createAddress } from "../../lib/apiClient";
import { useTranslation } from "react-i18next";

interface ValidationErrors {
  customer?: {
    fullName?: string;
    phone?: string;
  };
  shipping?: {
    street?: string;
    city?: string;
    country?: string;
  };
  payment?: {
    cardNumber?: string;
    cardName?: string;
    expDate?: string;
    cvv?: string;
  };
}

const Checkout: React.FC = () => {
  const { t } = useTranslation();
  const { cart } = useCartStore();
  const items = cart?.items || [];

  const [activeSection, setActiveSection] = useState<"customer" | "shipping" | "payment">("customer");
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState<string>("");
  
  const [formData, setFormData] = useState({
    customer: { fullName: "", phone: "" },
    shipping: { street: "", city: "", country: "", notes: "" },
    payment: { cardNumber: "", cardName: "", expDate: "", cvv: "" },
  });

  const total = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // Validation functions
  const validateCustomer = () => {
    const customerErrors: ValidationErrors['customer'] = {};
    
    if (!formData.customer.fullName.trim()) {
      customerErrors.fullName = t("validation.fullNameRequired");
    } else if (formData.customer.fullName.trim().length < 2) {
      customerErrors.fullName = t("validation.fullNameTooShort");
    }
    
    if (!formData.customer.phone.trim()) {
      customerErrors.phone = t("validation.phoneRequired");
    } else if (!/^\+?[\d\s\-\(\)]{8,}$/.test(formData.customer.phone.trim())) {
      customerErrors.phone = t("validation.phoneInvalid");
    }
    
    return customerErrors;
  };

  const validateShipping = () => {
    const shippingErrors: ValidationErrors['shipping'] = {};
    
    if (!formData.shipping.street.trim()) {
      shippingErrors.street = t("validation.streetRequired");
    }
    
    if (!formData.shipping.city.trim()) {
      shippingErrors.city = t("validation.cityRequired");
    }
    
    if (!formData.shipping.country.trim()) {
      shippingErrors.country = t("validation.countryRequired");
    }
    
    return shippingErrors;
  };

  const validatePayment = () => {
    const paymentErrors: ValidationErrors['payment'] = {};
    
    // Card number validation (simple check for 13-19 digits)
    const cardNumber = formData.payment.cardNumber.replace(/\s/g, '');
    if (!cardNumber) {
      paymentErrors.cardNumber = t("validation.cardNumberRequired");
    } else if (!/^\d{13,19}$/.test(cardNumber)) {
      paymentErrors.cardNumber = t("validation.cardNumberInvalid");
    }
    
    if (!formData.payment.cardName.trim()) {
      paymentErrors.cardName = t("validation.cardNameRequired");
    }
    
    // Expiry date validation (MM/YY format)
    if (!formData.payment.expDate) {
      paymentErrors.expDate = t("validation.expDateRequired");
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.payment.expDate)) {
      paymentErrors.expDate = t("validation.expDateInvalid");
    } else {
      // Check if card is not expired
      const [month, year] = formData.payment.expDate.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      now.setDate(1); // Set to first day of current month for comparison
      
      if (expiry < now) {
        paymentErrors.expDate = t("validation.cardExpired");
      }
    }
    
    if (!formData.payment.cvv) {
      paymentErrors.cvv = t("validation.cvvRequired");
    } else if (!/^\d{3,4}$/.test(formData.payment.cvv)) {
      paymentErrors.cvv = t("validation.cvvInvalid");
    }
    
    return paymentErrors;
  };

  const handleInputChange = (section: keyof typeof formData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Clear errors when user starts typing
    if (errors[section]?.[field as keyof ValidationErrors[typeof section]]) {
      setErrors(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: undefined
        }
      }));
    }

    // Clear general error
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleSectionNavigation = (targetSection: "customer" | "shipping" | "payment") => {
    let currentErrors: ValidationErrors = {};

    // Validate current section before moving forward
    if (activeSection === "customer" && (targetSection === "shipping" || targetSection === "payment")) {
      const customerErrors = validateCustomer();
      if (Object.keys(customerErrors).length > 0) {
        currentErrors.customer = customerErrors;
      }
    }

    if (activeSection === "shipping" && targetSection === "payment") {
      const shippingErrors = validateShipping();
      if (Object.keys(shippingErrors).length > 0) {
        currentErrors.shipping = shippingErrors;
      }
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    setErrors({});
    setActiveSection(targetSection);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart) return;

    // Validate all sections
    const customerErrors = validateCustomer();
    const shippingErrors = validateShipping();
    const paymentErrors = validatePayment();

    const allErrors: ValidationErrors = {};
    if (Object.keys(customerErrors).length > 0) allErrors.customer = customerErrors;
    if (Object.keys(shippingErrors).length > 0) allErrors.shipping = shippingErrors;
    if (Object.keys(paymentErrors).length > 0) allErrors.payment = paymentErrors;

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      // Navigate to first section with errors
      if (allErrors.customer) setActiveSection("customer");
      else if (allErrors.shipping) setActiveSection("shipping");
      else if (allErrors.payment) setActiveSection("payment");
      return;
    }

    setIsLoading(true);
    setGeneralError("");

    try {
      const addressData = {
        full_name: formData.customer.fullName.trim(),
        phone: formData.customer.phone.trim(),
        street: formData.shipping.street.trim(),
        city: formData.shipping.city.trim(),
        country: formData.shipping.country.trim(),
        notes: formData.shipping.notes.trim() || ''
      };

      const addressRes = await createAddress(addressData);
      const addressId = addressRes.id;

      await useOrdersStore.getState().addOrder(addressId, formData.payment);

      // Clear cart and show success
      useCartStore.getState().clearCart();
      setIsOrderComplete(true);

    } catch (error: any) {
      console.error('Checkout error:', error);
      
      // Handle different types of errors
      if (error.response?.status === 400) {
        setGeneralError(t("checkout.invalidDataError"));
      } else if (error.response?.status === 402) {
        setGeneralError(t("checkout.paymentFailedError"));
      } else if (error.response?.status >= 500) {
        setGeneralError(t("checkout.serverError"));
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setGeneralError(t("checkout.networkError"));
      } else {
        setGeneralError(t("checkout.generalError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToOrders = () => {
    // Navigate to orders page - you'll need to implement this based on your routing
    window.location.href = '/orders'; // or use your router navigation
  };

  // Success screen
  if (isOrderComplete) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-lg px-6 py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("checkout.orderSuccessTitle")}
            </h2>
            <p className="text-gray-600 mb-6">
              {t("checkout.orderSuccessMessage")}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleGoToOrders}
                className="w-full bg-[#A97155] py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#8f5e43] transition-colors"
              >
                {t("checkout.viewMyOrders")}
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-white py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t("checkout.continueShopping")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderError = (error: string | undefined) => {
    if (!error) return null;
    return (
      <p className="mt-1 text-sm text-red-600 flex items-center">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </p>
    );
  };

  const renderCustomerSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{t("checkout.customerInfo")}</h3>
      <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            {t("checkout.fullName")} *
          </label>
          <input
            type="text"
            id="fullName"
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155] ${
              errors.customer?.fullName ? 'border-red-300' : 'border-gray-300'
            }`}
            value={formData.customer.fullName}
            onChange={(e) => handleInputChange("customer", "fullName", e.target.value)}
            required
          />
          {renderError(errors.customer?.fullName)}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            {t("checkout.phone")} *
          </label>
          <input
            type="tel"
            id="phone"
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155] ${
              errors.customer?.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            value={formData.customer.phone}
            onChange={(e) => handleInputChange("customer", "phone", e.target.value)}
            required
          />
          {renderError(errors.customer?.phone)}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={() => handleSectionNavigation("shipping")}
          className="bg-[#A97155] py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#8f5e43] transition-colors"
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
            {t("checkout.address")} *
          </label>
          <input
            type="text"
            id="street"
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155] ${
              errors.shipping?.street ? 'border-red-300' : 'border-gray-300'
            }`}
            value={formData.shipping.street}
            onChange={(e) => handleInputChange("shipping", "street", e.target.value)}
            required
          />
          {renderError(errors.shipping?.street)}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            {t("checkout.city")} *
          </label>
          <input
            type="text"
            id="city"
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155] ${
              errors.shipping?.city ? 'border-red-300' : 'border-gray-300'
            }`}
            value={formData.shipping.city}
            onChange={(e) => handleInputChange("shipping", "city", e.target.value)}
            required
          />
          {renderError(errors.shipping?.city)}
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            {t("checkout.country")} *
          </label>
          <input
            type="text"
            id="country"
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155] ${
              errors.shipping?.country ? 'border-red-300' : 'border-gray-300'
            }`}
            value={formData.shipping.country}
            onChange={(e) => handleInputChange("shipping", "country", e.target.value)}
            required
          />
          {renderError(errors.shipping?.country)}
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
          className="flex items-center text-sm text-[#A97155] hover:text-[#8f5e43] transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          {t("checkout.backToCustomer")}
        </button>
        <button
          type="button"
          onClick={() => handleSectionNavigation("payment")}
          className="bg-[#A97155] py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#8f5e43] transition-colors"
        >
          {t("checkout.goToPayment")}
        </button>
      </div>
    </div>
  );

  const renderPaymentSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{t("checkout.paymentInfo")}</h3>
      
      {/* General error display */}
      {generalError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{generalError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
            {t("checkout.cardNumber")} *
          </label>
          <input
            type="text"
            id="cardNumber"
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155] ${
              errors.payment?.cardNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0000 0000 0000 0000"
            value={formData.payment.cardNumber}
            onChange={(e) => {
              // Format card number with spaces
              const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
              if (value.replace(/\s/g, '').length <= 19) {
                handleInputChange("payment", "cardNumber", value);
              }
            }}
            maxLength={23}
            required
          />
          {renderError(errors.payment?.cardNumber)}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
            {t("checkout.cardName")} *
          </label>
          <input
            type="text"
            id="cardName"
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155] ${
              errors.payment?.cardName ? 'border-red-300' : 'border-gray-300'
            }`}
            value={formData.payment.cardName}
            onChange={(e) => handleInputChange("payment", "cardName", e.target.value)}
            required
          />
          {renderError(errors.payment?.cardName)}
        </div>

        <div>
          <label htmlFor="expDate" className="block text-sm font-medium text-gray-700">
            {t("checkout.expDate")} *
          </label>
          <input
            type="text"
            id="expDate"
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155] ${
              errors.payment?.expDate ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="MM/YY"
            value={formData.payment.expDate}
            onChange={(e) => {
              // Format expiry date
              let value = e.target.value.replace(/\D/g, '');
              if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
              }
              handleInputChange("payment", "expDate", value);
            }}
            maxLength={5}
            required
          />
          {renderError(errors.payment?.expDate)}
        </div>

        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
            {t("checkout.cvv")} *
          </label>
          <input
            type="text"
            id="cvv"
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#A97155] focus:border-[#A97155] ${
              errors.payment?.cvv ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="123"
            value={formData.payment.cvv}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 4) {
                handleInputChange("payment", "cvv", value);
              }
            }}
            maxLength={4}
            required
          />
          {renderError(errors.payment?.cvv)}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => setActiveSection("shipping")}
          disabled={isLoading}
          className="flex items-center text-sm text-[#A97155] hover:text-[#8f5e43] transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={16} className="mr-1" />
          {t("checkout.backToShipping")}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-[#A97155] py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#8f5e43] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              {t("checkout.processing")}
            </>
          ) : (
            t("checkout.placeOrder")
          )}
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
                <Lock className="w-4 h-4 mr-1" />
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