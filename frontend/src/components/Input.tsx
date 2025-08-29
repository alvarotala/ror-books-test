import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export const Input: React.FC<InputProps> = ({
  label,
  hint,
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
          "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200",
          className,
        ].join(" ")}
        {...props}
      />
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
};

export default Input;


