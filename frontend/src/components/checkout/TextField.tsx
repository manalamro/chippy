import React from "react";
import { AlertCircle } from "lucide-react";

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  pattern?: string;
  title?: string;
  multiline?: boolean;
  rows?: number;


}

const TextField: React.FC<TextFieldProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  type = "text",
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
      {required && " *"}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-[#A97155] focus:border-[#A97155] ${
        error ? "border-red-300" : "border-gray-300"
      }`}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600 flex items-center">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </p>
    )}
  </div>
);

export default TextField;
