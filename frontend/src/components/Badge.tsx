import React from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}> = ({ children, variant = "default", className = "" }) => {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
};

export default Badge;


