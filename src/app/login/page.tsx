import { Suspense } from "react";
import { redirect } from "next/navigation";
import Login from "@/views/Login";
import { getCurrentUser, isPublicRegistrationEnabled } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
      <Login allowRegistration={isPublicRegistrationEnabled()} />
    </Suspense>
  );
}
