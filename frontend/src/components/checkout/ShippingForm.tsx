import React from "react";
import { ArrowLeft } from "lucide-react";
import TextField from "./TextField";

interface Props {
  data: { street: string; city: string; notes: string };
  errors?: { street?: string; city?: string };
  onChange: (field: string, value: string) => void;
  onBack: () => void;
  onNext: () => void;
  t: (key: string) => string;
}

const ShippingForm: React.FC<Props> = ({ data, errors = {}, onChange, onBack, onNext, t }) => {
  
  const handleChange = (field: string, value: string) => {
    onChange(field, value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{t("checkout.shippingInfo")}</h3>

      <TextField
        id="street"
        label={t("checkout.street")}
        value={data.street}
        onChange={(v) => handleChange("street", v)}
        error={errors.street}
        required={true}
        pattern="[a-zA-Z\u0600-\u06FF\s]*"
        title={t("validation.textOnly")}
      />

      <TextField
        id="city"
        label={t("checkout.city")}
        value={data.city}
        onChange={(v) => handleChange("city", v)}
        error={errors.city}
        required={true}
        pattern="[a-zA-Z\u0600-\u06FF\s]*"
        title={t("validation.textOnly")}
      />

      <TextField
        id="notes"
        label={t("checkout.notes")}
        value={data.notes}
        onChange={(v) => handleChange("notes", v)}
        multiline={true}
        rows={3}
      />

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-sm text-[#A97155] hover:text-[#8f5e43] transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          {t("checkout.backToCustomer")}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="bg-[#A97155] py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#8f5e43] transition-colors"
        >
          {t("checkout.goToPayment")}
        </button>
      </div>
    </div>
  );
};

export default ShippingForm;