"use client";

import { STATUS_COLORS, STATUS_LABELS } from "@/data/mock-data";

interface BadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ status, size = "sm", className = "" }: BadgeProps) {
  const colorClass = STATUS_COLORS[status] || "bg-noir-600/40 text-noir-400";
  const label = STATUS_LABELS[status] || status;
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${colorClass} ${sizeClass} ${className}`}>
      {label}
    </span>
  );
}
