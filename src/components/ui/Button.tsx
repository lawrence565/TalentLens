import React from "react";
import type { ButtonProps } from "../../types";

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-primary-500 text-white hover:bg-primary-600",
  secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3 text-base",
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={[
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200",
      "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-60",
      variantClasses[variant],
      sizeClasses[size],
      className,
    ].join(" ")}
  >
    {loading ? "Loading..." : children}
  </button>
);

export default Button;
