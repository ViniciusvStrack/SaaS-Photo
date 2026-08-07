"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-noir-500">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-white mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-noir-500 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </motion.div>
  );
}
