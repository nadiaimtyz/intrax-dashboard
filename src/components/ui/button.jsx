import React from "react";

export function Button({ children, onClick, className, type = "button", ...props }) {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`px-4 py-2 rounded bg-[#6C5CE7] text-white hover:bg-[#5f27cd] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
