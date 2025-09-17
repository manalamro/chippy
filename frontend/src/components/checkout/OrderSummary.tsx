import React from "react";

interface Props {
  items: { id: string; quantity: number; product: { title: string; price: number; images?: { url: string }[] } }[];
  total: number;
  t: (key: string) => string;
}

const OrderSummary: React.FC<Props> = ({ items, total, t }) => (
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
);

export default OrderSummary;
