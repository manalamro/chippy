export interface Address {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  notes: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// نوع مبسط للUI
export type AddressForUI = {
  id: number;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  notes: string;
  is_default: boolean;
};