export interface ValidationErrors {
    customer?: {
      fullName?: string;
      phone?: string;
    };
    shipping?: {
      street?: string;
      city?: string;
    };
    payment?: {
      cardNumber?: string;
      cardName?: string;
      expDate?: string;
      cvv?: string;
    };
  }
  
  // Customer validation
  export const validateCustomer = (data: { fullName: string; phone: string }, t: (key: string) => string) => {
    const errors: ValidationErrors["customer"] = {};
  
    if (!data.fullName.trim()) errors.fullName = t("validation.fullNameRequired");
    else if (data.fullName.trim().length < 2) errors.fullName = t("validation.fullNameTooShort");
    else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(data.fullName.trim())) errors.fullName = t("validation.textOnly");
  
    if (!data.phone.trim()) errors.phone = t("validation.phoneRequired");
    else if (!/^\+?[\d\s\-\(\)]{8,}$/.test(data.phone.trim())) errors.phone = t("validation.phoneInvalid");
  
    return errors;
  };
  
  // Shipping validation
export const validateShipping = (data: { street: string; city: string }, t: (key: string) => string) => {
    const errors: ValidationErrors["shipping"] = {};
  
    if (!data.street.trim()) errors.street = t("validation.streetRequired");
    else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(data.street.trim())) errors.street = t("validation.textOnly");
  
    if (!data.city.trim()) errors.city = t("validation.cityRequired");
    else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(data.city.trim())) errors.city = t("validation.textOnly");
  
    return errors;
  };
  
  // Payment validation
  export const validatePayment = (data: { cardNumber: string; cardName: string; expDate: string; cvv: string }, t: (key: string) => string) => {
    const errors: ValidationErrors["payment"] = {};
  
    const cardNumber = data.cardNumber.replace(/\s/g, "");
    if (!cardNumber) errors.cardNumber = t("validation.cardNumberRequired");
    else if (!/^\d{13,19}$/.test(cardNumber)) errors.cardNumber = t("validation.cardNumberInvalid");
  
    if (!data.cardName.trim()) errors.cardName = t("validation.cardNameRequired");
    else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(data.cardName.trim())) errors.cardName = t("validation.textOnly");
  
    if (!data.expDate) errors.expDate = t("validation.expDateRequired");
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expDate)) errors.expDate = t("validation.expDateInvalid");
    else {
      const [month, year] = data.expDate.split("/");
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      now.setDate(1);
      if (expiry < now) errors.expDate = t("validation.cardExpired");
    }
  
    if (!data.cvv) errors.cvv = t("validation.cvvRequired");
    else if (!/^\d{3,4}$/.test(data.cvv)) errors.cvv = t("validation.cvvInvalid");
  
    return errors;
  };