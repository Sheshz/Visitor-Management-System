import React from "react";

export function CardContent({ children }) {
  return <div className="p-4">{children}</div>;
}


const Card = ({ children, className }) => {
  return (
    <div className={`p-4 border rounded-lg shadow-md bg-white ${className}`}>
      {children}
    </div>
  );
};

export default Card;
