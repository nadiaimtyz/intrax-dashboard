import React from "react";

export function Card({ children, className }) {
  return <div className={`rounded-lg shadow p-4 bg-white ${className}`}>{children}</div>;
}

export function CardContent({ children }) {
  return <div className="p-2">{children}</div>;
}
