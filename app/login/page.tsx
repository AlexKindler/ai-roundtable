import { LoginForm } from "@/components/auth/login-form";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Sign In — AI Roundtable",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            AI Roundtable
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access multi-LLM deliberation
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-muted-foreground/60">
          By signing in, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
