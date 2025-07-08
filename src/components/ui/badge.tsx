import React from "react";

export function Badge({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { className?: string }) {
  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
} 