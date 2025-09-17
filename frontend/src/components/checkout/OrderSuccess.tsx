import React from "react";
import { CheckCircle } from "lucide-react";

interface Props {
  t: (key: string) => string;
  onGoToOrders: () => void;
}

const OrderSuccess: React.FC<Props> = ({ t, onGoToOrders }) => (
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
            onClick={onGoToOrders}
            className="w-full bg-[#A97155] py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#8f5e43] transition-colors"
          >
            {t("checkout.viewMyOrders")}
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-white py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t("checkout.continueShopping")}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default OrderSuccess;
