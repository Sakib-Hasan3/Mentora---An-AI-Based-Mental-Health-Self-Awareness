import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen w-full relative overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 -z-10">
        {/* base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

        {/* glow blobs */}
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-pulse" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Sign up to get started.
            </p>
          </div>

          {/* Glass card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
            <SignupForm />

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/70">
              <span>Already have an account?</span>
              <Link
                className="text-white underline underline-offset-4 hover:text-white/90"
                href="/auth/login"
              >
                Log in
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-white/50">
            By signing up, you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  );
}