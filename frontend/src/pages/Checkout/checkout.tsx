import React, { useState, useEffect } from "react";
import { Lock, MapPin, User, Truck, CreditCard, ArrowLeft, ArrowRight, Plus, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCartStore } from "../../store/cartStore";
import { useOrdersStore } from "../../store/ordersStore";
import { createAddress, getUserAddresses } from "../../lib/apiClient";
import type { Address, AddressForUI } from "../../types/address";

import CustomerForm from "../../components/checkout/CustomerForm";
import ShippingForm from "../../components/checkout/ShippingForm";
import PaymentForm from "../../components/checkout/PaymentForm";
import OrderSummary from "../../components/checkout/OrderSummary";
import OrderSuccess from "../../components/checkout/OrderSuccess";
import AddressSelector from "../../components/checkout/AddressSelector";

import { validateCustomer, validateShipping, validatePayment } from "../../components/validators";
import type { ValidationErrors } from "../../components/validators";

type Section = "addresses" | "customer" | "shipping" | "payment";
type AddressMode = "select" | "new";

const Checkout: React.FC = () => {
  const { t } = useTranslation();
  const { cart } = useCartStore();
  const items = cart?.items || [];

  const [activeSection, setActiveSection] = useState<Section>("addresses");
  const [addressMode, setAddressMode] = useState<AddressMode>("select");
  const [userAddresses, setUserAddresses] = useState<AddressForUI[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressForUI | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState("");

  const [formData, setFormData] = useState({
    customer: { fullName: "", phone: "" },
    shipping: { street: "", city: "", notes: "" },
    payment: { cardNumber: "", cardName: "", expDate: "", cvv: "" },
  });

  const convertToUIAddress = (address: Address): AddressForUI => ({
    id: address.id,
    full_name: address.full_name,
    phone: address.phone,
    street: address.street,
    city: address.city,
    notes: address.notes,
    is_default: address.is_default
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        const addresses: Address[] = await getUserAddresses();
        
        const uiAddresses: AddressForUI[] = addresses.map(convertToUIAddress);
        setUserAddresses(uiAddresses);
        
        const defaultAddress = uiAddresses.find(addr => addr.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, []);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleInputChange = (section: keyof typeof formData, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));

    if (errors[section]?.[field as keyof ValidationErrors[typeof section]]) {
      setErrors((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: undefined },
      }));
    }

    if (generalError) setGeneralError("");
  };

  const handleSelectAddress = (address: AddressForUI) => {
    setSelectedAddress(address);
  };

  const handleUseSelectedAddress = () => {
    if (selectedAddress) {
      setFormData(prev => ({
        ...prev,
        customer: {
          fullName: selectedAddress.full_name,
          phone: selectedAddress.phone
        },
        shipping: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          notes: selectedAddress.notes || ""
        }
      }));
      setActiveSection("payment");
    }
  };

  const handleAddNewAddress = () => {
    setAddressMode("new");
    setSelectedAddress(null);
    setFormData(prev => ({
      ...prev,
      customer: { fullName: "", phone: "" },
      shipping: { street: "", city: "", notes: "" }
    }));
    setActiveSection("customer");
  };

  const handleNext = (nextSection: Section) => {
    let sectionErrors: ValidationErrors = {};

    if (activeSection === "customer") {
      sectionErrors.customer = validateCustomer(formData.customer, t);
    }
    if (activeSection === "shipping") {
      sectionErrors.shipping = validateShipping(formData.shipping, t);
    }

    const hasErrors = Object.keys(sectionErrors.customer || {}).length > 0 || 
                     Object.keys(sectionErrors.shipping || {}).length > 0;

    if (hasErrors) {
      setErrors(sectionErrors);
    } else {
      setErrors({});
      setActiveSection(nextSection);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart) return;

    let customerErrors = {};
    let shippingErrors = {};
    
    if (addressMode === "new") {
      customerErrors = validateCustomer(formData.customer, t);
      shippingErrors = validateShipping(formData.shipping, t);
    }
    
    const paymentErrors = validatePayment(formData.payment, t);

    const allErrors: ValidationErrors = {};
    if (Object.keys(customerErrors).length) allErrors.customer = customerErrors;
    if (Object.keys(shippingErrors).length) allErrors.shipping = shippingErrors;
    if (Object.keys(paymentErrors).length) allErrors.payment = paymentErrors;

    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
      if (allErrors.customer) setActiveSection("customer");
      else if (allErrors.shipping) setActiveSection("shipping");
      else if (allErrors.payment) setActiveSection("payment");
      return;
    }

    setIsLoading(true);
    setGeneralError("");

    try {
      let addressId: number;

      if (addressMode === "select" && selectedAddress) {
        addressId = selectedAddress.id;
      } else {
        const addressData = {
          full_name: formData.customer.fullName.trim(),
          phone: formData.customer.phone.trim(),
          street: formData.shipping.street.trim(),
          city: formData.shipping.city.trim(),
          notes: formData.shipping.notes.trim() || "",
        };

        const addressRes = await createAddress(addressData);
        addressId = addressRes.id;
      }

      await useOrdersStore.getState().addOrder(addressId, formData.payment);
      useCartStore.getState().clearCart();
      setIsOrderComplete(true);

    } catch (error: any) {
      console.error("Checkout error:", error);
      if (error.response?.status === 400) setGeneralError(t("checkout.invalidDataError"));
      else if (error.response?.status === 402) setGeneralError(t("checkout.paymentFailedError"));
      else if (error.response?.status >= 500) setGeneralError(t("checkout.serverError"));
      else if (error.message?.includes("network") || error.message?.includes("fetch")) setGeneralError(t("checkout.networkError"));
      else setGeneralError(t("checkout.generalError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToOrders = () => (window.location.href = "/orders");

  if (isOrderComplete) return <OrderSuccess t={t} onGoToOrders={handleGoToOrders} />;

  // تتبع مراحل عملية الدفع
  const steps = [
    { id: "addresses", title: t("checkout.addresses"), icon: <MapPin size={18} /> },
    { id: "customer", title: t("checkout.customerInfo"), icon: <User size={18} /> },
    { id: "shipping", title: t("checkout.shipping"), icon: <Truck size={18} /> },
    { id: "payment", title: t("checkout.payment"), icon: <CreditCard size={18} /> },
  ];

  // تحديد الخطوة النشطة
  const activeStepIndex = steps.findIndex(step => step.id === activeSection);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("checkout.title")}</h1>

        {/* شريط التقدم في عملية الدفع */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2 -z-10"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-[#A97155] transform -translate-y-1/2 -z-10 transition-all duration-300" 
              style={{ width: `${(activeStepIndex / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${index <= activeStepIndex ? 'bg-[#A97155] border-[#A97155] text-white' : 'bg-white border-gray-300 text-gray-500'} transition-colors duration-300`}>
                  {index < activeStepIndex ? <Check size={18} /> : step.icon}
                </div>
                <span className={`mt-2 text-sm font-medium ${index <= activeStepIndex ? 'text-[#A97155]' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* قسم تفاصيل الطلب */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100 flex items-center">
                {activeSection === "addresses" && <MapPin className="mr-2" size={24} />}
                {activeSection === "customer" && <User className="mr-2" size={24} />}
                {activeSection === "shipping" && <Truck className="mr-2" size={24} />}
                {activeSection === "payment" && <CreditCard className="mr-2" size={24} />}
                {steps.find(step => step.id === activeSection)?.title}
              </h2>

              <form onSubmit={handleSubmit}>
                {activeSection === "addresses" && (
                  <>
                    {isLoadingAddresses ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#A97155] border-t-transparent mx-auto"></div>
                        <p className="text-gray-500 mt-2">{t("checkout.loadingAddresses")}</p>
                      </div>
                    ) : (
                      <AddressSelector
                        addresses={userAddresses}
                        selectedAddressId={selectedAddress?.id}
                        onSelectAddress={handleSelectAddress}
                        onUseSelectedAddress={handleUseSelectedAddress}
                        onAddNewAddress={handleAddNewAddress}
                        t={t}
                      />
                    )}
                  </>
                )}
                
                {activeSection === "customer" && (
                  <CustomerForm
                    data={formData.customer}
                    errors={errors.customer}
                    onChange={(field, value) => handleInputChange("customer", field, value)}
                    onNext={() => handleNext("shipping")}
                    onBack={() => setActiveSection("addresses")}
                    t={t}
                  />
                )}
                
                {activeSection === "shipping" && (
                  <ShippingForm
                    data={formData.shipping}
                    errors={errors.shipping}
                    onChange={(field, value) => handleInputChange("shipping", field, value)}
                    onBack={() => setActiveSection("customer")}
                    onNext={() => handleNext("payment")}
                    t={t}
                  />
                )}
                
                {activeSection === "payment" && (
                  <PaymentForm
                    data={formData.payment}
                    errors={errors.payment}
                    generalError={generalError}
                    isLoading={isLoading}
                    onChange={(field, value) => handleInputChange("payment", field, value)}
                    onBack={() => {
                      if (addressMode === "select") {
                        setActiveSection("addresses");
                      } else {
                        setActiveSection("shipping");
                      }
                    }}
                    t={t}
                  />
                )}
              </form>
            </div>

            <div className="flex items-center text-sm text-gray-500 bg-white rounded-xl shadow-sm p-4">
              <Lock className="w-4 h-4 mr-2 text-[#A97155]" />
              <span>{t("checkout.securePayment")}</span>
            </div>
          </div>

          {/* ملخص الطلب */}
          <div className="lg:w-1/3">
            <div className="sticky top-6">
              <OrderSummary items={items} total={total} t={t} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;