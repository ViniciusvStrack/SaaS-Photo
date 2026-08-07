import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "NoirFrame — O sistema operacional para fotógrafos profissionais",
  description: "Gerencie portfólio, agenda, clientes, galerias, contratos, propostas e entregas em uma plataforma premium. Do primeiro contato à entrega final, tudo no mesmo lugar.",
  openGraph: {
    title: "NoirFrame — O sistema operacional para fotógrafos profissionais",
    description: "Do primeiro contato à entrega final, tudo no mesmo lugar. Portfólio, CRM, galerias privadas, contratos, financeiro e IA para fotógrafos.",
    type: "website",
    siteName: "NoirFrame",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoirFrame — Fotógrafos profissionais merecem ferramentas profissionais",
    description: "A plataforma completa para fotógrafos que querem vender, organizar e entregar melhor.",
  },
};

export default function Home() {
  return <LandingPage />;
}
