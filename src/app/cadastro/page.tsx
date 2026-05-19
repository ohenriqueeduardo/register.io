import { redirect } from "next/navigation";
import Register from "@/views/Register";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CadastroPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return <Register />;
}
