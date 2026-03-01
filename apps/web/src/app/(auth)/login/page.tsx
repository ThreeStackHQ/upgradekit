export const dynamic = 'force-dynamic';

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { Github, Zap } from "lucide-react";

export const metadata = {
  title: "Sign In",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-zinc-950 to-orange-950/20 pointer-events-none" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)`,
          backgroundSize: "50px 50px"
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25 mb-4">
            <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">UpgradeKit</h1>
          <p className="mt-1 text-sm text-zinc-400">Feature gates for indie SaaS</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-zinc-50">Welcome back</h2>
            <p className="mt-1 text-sm text-zinc-400">Sign in to manage your feature gates</p>
          </div>

          <div className="space-y-3">
            {/* GitHub OAuth */}
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-zinc-50 rounded-xl font-medium text-sm transition-all duration-200 group"
              >
                <Github className="w-4 h-4" />
                Continue with GitHub
              </button>
            </form>

            {/* Google OAuth */}
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#1a1a1a" opacity="0.7"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#1a1a1a" opacity="0.7"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#1a1a1a" opacity="0.5"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#1a1a1a" opacity="0.6"/>
                </svg>
                Continue with Google
              </button>
            </form>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 text-center">
              By signing in, you agree to our{" "}
              <a href="#" className="text-amber-500 hover:text-amber-400 transition-colors">Terms</a>
              {" "}and{" "}
              <a href="#" className="text-amber-500 hover:text-amber-400 transition-colors">Privacy Policy</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs text-zinc-600">
          UpgradeKit by{" "}
          <span className="text-amber-600">ThreeStack</span>
        </p>
      </div>
    </div>
  );
}
