"use client";

import { type SelectHTMLAttributes, forwardRef, useId } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", ...props }, ref) => {
    const generatedId = useId();
    const selectId = props.id || generatedId;
    const errorId = `${selectId}-error`;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs text-noir-400 mb-1.5 font-medium">{label}</label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full bg-white/[0.03] border rounded-lg px-4 py-2.5 text-sm text-white 
            focus:outline-none transition-all appearance-none cursor-pointer
            ${error 
              ? "border-red-500/50 focus:border-red-500" 
              : "border-white/10 focus:border-gold/40"
            }
            ${className}
          `}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
          }}
          {...props}
        >
          {placeholder && (
            <option value="" className="bg-noir-950">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-noir-950">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p id={errorId} role="alert" className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
