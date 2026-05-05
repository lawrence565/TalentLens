import React from "react";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "error";
  className?: string;
}

const variantClasses: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "border-gray-200 bg-white",
  error: "border-red-200 bg-red-50",
};

const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className = "",
}) => (
  <div
    className={[
      "rounded-lg border p-6 shadow-sm",
      variantClasses[variant],
      className,
    ].join(" ")}
  >
    {children}
  </div>
);

export default Card;
