import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { env } from "@/lib/utils/env";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-muted)]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xl font-bold">
            {env.appName.slice(0, 1)}
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{env.appName}</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {env.companyName}
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
