import type { Metadata } from "next";
import { Providers } from "./providers";
import "@/globals.css";

export const metadata: Metadata = {
  title: "Registros.io",
  description: "Base backend com Prisma, PostgreSQL e validacoes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
