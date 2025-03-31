import React from "react";

export function CardContent({ children }) {
  return <div className="p-4">{children}</div>;
}

export function Card({ children, className }) { // Named export
  return (
    <div className={`p-4 border rounded-lg shadow-md bg-white ${className}`}>
      {children}
    </div>
  );
}
