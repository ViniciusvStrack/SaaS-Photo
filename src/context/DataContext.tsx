"use client";

import type { ReactNode } from "react";

/**
 * Compatibility boundary for the former local mock-data store.
 *
 * Application screens now read from the real API through `useApi`, so keeping
 * the old context mounted only added its full mock dataset and localStorage
 * synchronization to every route. The provider remains as a lightweight
 * boundary until the protected root layout can remove it safely.
 */
export function DataProvider({ children }: { children: ReactNode }) {
  return children;
}
