import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useOrdersStore } from "../../store/ordersStore";
import { Package, Calendar, MapPin, Loader2, CheckCircle, Clock, Truck } from "lucide-react";

// Remove unused CreditCard import

const MyOrders: React.FC = () => {
  const { t } = useTranslation(); // Remove unused i18n
  const { orders, fetchOrders, loading } = useOrdersStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Function to get status translation
  const getStatusTranslation = (status: string) => {
    const statusTranslations: Record<string, string> = {
      "delivered": t("orderStatus.delivered", "تم التوصيل"),
      "shipped": t("orderStatus.shipped", "شحنت"),
      "processing": t("orderStatus.processing", "قيد المعالجة"),
      "pending": t("orderStatus.pending", "معلق"),
      "cancelled": t("orderStatus.cancelled", "ملغي")
    };
    return statusTranslations[status] || status;
  };

  // Function to get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "delivered":
        return { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" };
      case "shipped":
        return { icon: Truck, color: "text-blue-600", bgColor: "bg-blue-100" };
      case "processing":
        return { icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100" };
      default:
        return { icon: Clock, color: "text-gray-600", bgColor: "bg-gray-100" };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-[#A97155] animate-spin mb-4" />
          <p className="text-[#3E2723] text-lg">{t("loading", "جاري التحميل...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir={document.documentElement.dir}>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7B4B27] to-[#A97155] bg-clip-text text-transparent">
          {t("myOrders", "طلباتي")}
        </h1>
        <div className={`flex items-center justify-center pt-4 opacity-60 ${document.documentElement.dir === "rtl" ? "space-x-reverse" : ""} space-x-2`}>
          <Package className="text-[#7B4B27]" size={16} />
          <div className="w-8 h-0.5 bg-gradient-to-r from-[#7B4B27]/50 to-[#A97155]/50" />
          <Calendar className="text-[#A97155]" size={16} />
          <div className="w-8 h-0.5 bg-gradient-to-r from-[#A97155]/50 to-[#D9A441]/50" />
          <MapPin className="text-[#D9A441]" size={16} />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white/70 backdrop-blur-md rounded-xl border border-[#D9A441]/30 shadow-lg">
          <Package className="mx-auto h-16 w-16 text-[#A97155] mb-4" />
          <h3 className="text-xl font-semibold text-[#3E2723] mb-2">{t("noOrders", "لا توجد طلبات")}</h3>
          <p className="text-[#7B4B27]">{t("noOrdersMessage", "ما عندك أي طلبات سابقة.")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const total = Number(order.total) || 0;
            const orderDate = order.created_at ? new Date(order.created_at) : null;
            
            // Format date to show 2025 (as requested)
            const formattedDate = orderDate 
              ? `2025-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}-${orderDate.getDate().toString().padStart(2, '0')}`
              : "";
            
            const StatusIcon = getStatusInfo(order.status || "").icon;

            return (
              <div
                key={order.id}
                className="bg-white/70 backdrop-blur-md rounded-xl border border-[#D9A441]/30 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#A97155]/50"
              >
                <div className="p-6">
                  <div className={`flex flex-col md:flex-row ${document.documentElement.dir === "rtl" ? "md:justify-between" : "md:justify-between"} md:items-start gap-4 mb-4`}>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#F6C1B1]/20 p-2 rounded-full">
                        <Package className="h-5 w-5 text-[#7B4B27]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#3E2723]">
                        {t("orderNumber", "طلب رقم")} #{order.id}
                      </h3>
                    </div>
                    
                    <div className={`flex flex-col ${document.documentElement.dir === "rtl" ? "items-end" : "items-start"} gap-2`}>
                      {formattedDate && (
                        <div className="flex items-center gap-2 text-sm text-[#7B4B27]">
                          <Calendar className="h-4 w-4" />
                          <span>{formattedDate}</span>
                        </div>
                      )}
                      
                      {order.address && (
                        <div className="flex items-center gap-1 text-sm text-[#7B4B27]">
                          <MapPin className="h-4 w-4 text-[#D9A441]" />
                          <span>
                            {t("address", "العنوان")}: {[
                              order.address.street,
                              order.address.city,
                              order.address.postal_code,
                              order.address.country
                            ].filter(Boolean).join(document.documentElement.dir === "rtl" ? "، " : ", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#3E2723]">{t("status", "الحالة")}:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusInfo(order.status || "").bgColor} ${getStatusInfo(order.status || "").color}`}>
                          <StatusIcon size={14} />
                          {getStatusTranslation(order.status || "")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#3E2723]">{t("total", "الإجمالي")}:</span>
                        <span className="text-[#7B4B27] font-semibold">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#D9A441]/20">
                    <h4 className="font-medium text-[#3E2723] mb-3">{t("items", "العناصر")}:</h4>
                    <ul className="space-y-2">
                      {(order.items || []).map((item, idx) => {
                        const price = Number(item.unit_price) || 0;
                        const quantity = Number(item.quantity) || 0;
                        const itemTotal = price * quantity;
                        
                        return (
                          <li key={idx} className="flex justify-between items-center py-2 px-3 bg-[#F6C1B1]/10 rounded-lg">
                            <div>
                              <p className="font-medium text-[#3E2723]">{item.title || t("product", "منتج")}</p>
                              <p className="text-sm text-[#7B3D2E]">
                                {quantity} × ${price.toFixed(2)}
                              </p>
                            </div>
                            <span className="font-semibold text-[#7B3D2E]">
                              ${itemTotal.toFixed(2)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;