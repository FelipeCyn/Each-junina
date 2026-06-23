import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Festa Junina - Controle de Gastos",
  description: "Sistema de monitoramento de gastos da Festa Junina",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.className} bg-amber-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
