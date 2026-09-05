import { redirect } from "next/navigation";
import AppLayout from "@/components/Layout";
import { getCurrentUser } from "@/lib/auth";
import { CommandMenu } from "@/components/ui/CommandMenu";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppLayout
      user={{
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      }}
    >
      <CommandMenu userRole={user.role} />
      {children}
    </AppLayout>
  );
}
