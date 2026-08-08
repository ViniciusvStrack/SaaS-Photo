"use client";

import { type InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", ...props }, ref) => {
    const generatedId = useId();
    const inputId = props.id || generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs text-noir-400 mb-1.5 font-medium">{label}</label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`
            w-full bg-white/[0.03] border rounded-lg px-4 py-2.5 text-sm text-white 
            placeholder:text-noir-600 focus:outline-none transition-all
            ${error 
              ? "border-red-500/50 focus:border-red-500" 
              : "border-white/10 focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
            }
            ${className}
          `}
          {...props}
        />
        {error && <p id={errorId} role="alert" className="mt-1 text-xs text-red-400">{error}</p>}
        {hint && !error && <p id={hintId} className="mt-1 text-xs text-noir-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
