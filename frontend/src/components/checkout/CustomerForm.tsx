import React from "react";
import TextField from "./TextField";

interface Props {
  data: { fullName: string; phone: string };
  errors?: { fullName?: string; phone?: string };
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  t: (key: string) => string;
}

const CustomerForm: React.FC<Props> = ({ data, errors = {}, onChange, onNext, onBack, t }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium text-gray-900">{t("checkout.customerInfo")}</h3>

    <TextField
      id="fullName"
      label={t("checkout.fullName")}
      value={data.fullName}
      onChange={(v) => onChange("fullName", v)}
      error={errors.fullName}
      required
    />

    <TextField
      id="phone"
      label={t("checkout.phone")}
      value={data.phone}
      onChange={(v) => onChange("phone", v)}
      error={errors.phone}
      required
    />

    <div className="flex justify-between mt-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center text-sm text-[#A97155] hover:text-[#8f5e43] transition-colors"
      >
        {t("checkout.back")}
      </button>
      <button
        type="button"
        onClick={onNext}
        className="bg-[#A97155] py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#8f5e43] transition-colors"
      >
        {t("checkout.goToShipping")}
      </button>
    </div>
  </div>
);

export default CustomerForm;