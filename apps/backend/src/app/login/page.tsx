import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-12">
          <Logo />
          <p className="mt-6 text-sm text-ink-400 font-mono uppercase tracking-widest">
            Admin Panel
          </p>
        </div>
        <Suspense fallback={<div className="text-ink-400 text-center">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}