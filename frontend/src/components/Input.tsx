import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  className = "",
  ...props
}) => {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </span>
      )}
      <input
        className={[
          "w-full rounded-md border bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm transition focus:outline-none",
          error ? "border-red-500 focus:ring-2 focus:ring-red-200" : "border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>
      )}
    </label>
  );
};

export default Input;


