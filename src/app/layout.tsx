import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "NoirFrame — A plataforma completa para fotógrafos profissionais",
  description: "Gerencie portfólio, agenda, clientes, galerias, blog e toda sua operação fotográfica em um só lugar. Feito para fotógrafos que querem se destacar.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NoirFrame",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
      </head>
      <body className="bg-noir-deep text-white antialiased">
        <AuthProvider>
          <DataProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
