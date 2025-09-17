import React from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import TextField from "./TextField";

interface Props {
  data: { cardNumber: string; cardName: string; expDate: string; cvv: string };
  errors?: { cardNumber?: string; cardName?: string; expDate?: string; cvv?: string };
  generalError?: string;
  isLoading: boolean;
  onChange: (field: string, value: string) => void;
  onBack: () => void;
  t: (key: string) => string;
}

const PaymentForm: React.FC<Props> = ({
  data,
  errors = {},
  generalError,
  isLoading,
  onChange,
  onBack,
  t,
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium text-gray-900">{t("checkout.paymentInfo")}</h3>

    {generalError && (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-sm text-red-700">{generalError}</p>
        </div>
      </div>
    )}

    <TextField
      id="cardNumber"
      label={t("checkout.cardNumber")}
      value={data.cardNumber}
      onChange={(v) => {
        const formatted = v.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
        if (formatted.replace(/\s/g, "").length <= 19) onChange("cardNumber", formatted);
      }}
      placeholder="0000 0000 0000 0000"
      error={errors.cardNumber}
      required
    />

    <TextField
      id="cardName"
      label={t("checkout.cardName")}
      value={data.cardName}
      onChange={(v) => onChange("cardName", v)}
      error={errors.cardName}
      required
    />

    <TextField
      id="expDate"
      label={t("checkout.expDate")}
      value={data.expDate}
      onChange={(v) => {
        let value = v.replace(/\D/g, "");
        if (value.length >= 2) value = value.substring(0, 2) + "/" + value.substring(2, 4);
        onChange("expDate", value);
      }}
      placeholder="MM/YY"
      error={errors.expDate}
      required
    />

    <TextField
      id="cvv"
      label={t("checkout.cvv")}
      value={data.cvv}
      onChange={(v) => {
        const value = v.replace(/\D/g, "");
        if (value.length <= 4) onChange("cvv", value);
      }}
      placeholder="123"
      error={errors.cvv}
      required
    />

    <div className="flex justify-between mt-6">
      <button
        type="button"
        onClick={onBack}
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

export default PaymentForm;
