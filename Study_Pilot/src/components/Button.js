import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  type = 'button', 
  disabled = false,
  className = '' 
}) {
  // Pamata stili, kas attiecas uz visām pogām
  const baseStyles = "px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm";

  // Dažādi stili atkarībā no pogas veida (variant)
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-100",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-rose-100",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-100",
  };

  // Stils, ja poga ir neaktīvā stāvoklī (disabled)
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed hover:bg-indigo-600" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${disabledStyles} ${className}`}
    >
      {children}
    </button>
  );
}