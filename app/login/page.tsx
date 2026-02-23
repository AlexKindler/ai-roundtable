import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In — AI Roundtable",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">AI Roundtable</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access multi-LLM deliberation
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
