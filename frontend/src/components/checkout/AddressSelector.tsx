import React from "react";
import { MapPin } from "lucide-react";
import type { AddressForUI } from "../../types/address";

interface AddressSelectorProps {
  addresses: AddressForUI[];
  selectedAddressId?: number;
  onSelectAddress: (address: AddressForUI) => void;
  onUseSelectedAddress: () => void;
  onAddNewAddress: () => void;
  t: (key: string) => string;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onUseSelectedAddress,
  onAddNewAddress,
  t
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{t("checkout.selectAddress")}</h3>
      
      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">{t("checkout.noAddresses")}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedAddressId === address.id
                    ? "border-[#A97155] bg-[#F9F5F3]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onSelectAddress(address)}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#A97155] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{address.full_name}</h4>
                      {address.is_default && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {t("checkout.default")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{address.street}</p>
                    <p className="text-sm text-gray-600">{address.city}</p>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                    {address.notes && (
                      <p className="text-sm text-gray-500 mt-2">{address.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedAddressId && (
            <button
              type="button"
              onClick={onUseSelectedAddress}
              className="w-full bg-[#A97155] py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#8f5e43] transition-colors"
            >
              {t("checkout.useThisAddress")}
            </button>
          )}
        </>
      )}

      <button
        type="button"
        onClick={onAddNewAddress}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 hover:border-[#A97155] hover:text-[#A97155] transition-colors"
      >
        + {t("checkout.addNewAddress")}
      </button>
    </div>
  );
};

export default AddressSelector;