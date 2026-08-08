import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeria de Fotos",
  description: "Visualize e selecione suas fotos favoritas",
  robots: "noindex, nofollow", // Don't index client galleries
};

export default function PublicGalleryLayout({ children }: { children: ReactNode }) {
  return children;
}
