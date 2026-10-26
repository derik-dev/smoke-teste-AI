import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/600-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smoke Tester — teste seu site como um usuário real",
  description:
    "Cole a URL e uma IA navega pelo seu site num navegador de verdade, no desktop e no celular, e entrega um relatório pronto para mandar ao cliente.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
