import { RegisterForm } from "@/components/auth/register-form";
import { Logo } from "@/components/logo";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-12">
          <Logo />
          <p className="mt-6 text-sm text-ink-400 font-mono uppercase tracking-widest">
            Request Admin Access
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}