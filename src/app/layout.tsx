import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "@/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Registros | register.io",
  description:
    "Plataforma administrativa moderna para catalogar, organizar e classificar registros empresariais com total transparência.",
  icons: {
    icon: "/system-logo.svg",
    shortcut: "/system-logo.svg",
    apple: "/system-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
