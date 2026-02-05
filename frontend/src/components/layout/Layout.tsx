import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import WhatsAppButton from "../WhatsAppButton"; // <- Assure-toi que le chemin est correct

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <main className="flex-1 pt-[73px]">{children}</main>
      <Footer />

      {/* Bouton WhatsApp flottant */}
      <WhatsAppButton />
    </div>
  );
}
