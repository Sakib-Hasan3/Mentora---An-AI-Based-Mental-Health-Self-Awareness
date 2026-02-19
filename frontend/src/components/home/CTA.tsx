import Link from "next/link";

export default function CTA() {
  return (
    <section id="cta" className="bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 pb-16 md:pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 p-8 ring-1 ring-white/10 md:p-10">
          {/* subtle glow */}
          <div className="pointer-events-none absolute -top-16 left-10 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-10 h-72 w-72 rounded-full bg-indigo-400/15 blur-3xl" />

          <div className="relative grid gap-8 md:grid-cols-3 md:items-center">
            {/* Text */}
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-cyan-200/90">
                Start your journey
              </p>

              <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                Ready to build a healthier, calmer, more focused life?
              </h3>

              <p className="mt-3 text-white/65">
                Create your Mentora account to get personalized support—AI chat, mentorship,
                and medical tools—organized in one place.
              </p>

              {/* Trust bullets */}
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Privacy-first
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-300" />
                  Bengali-friendly
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-300" />
                  Crisis escalation ready
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="relative flex flex-col gap-3 md:items-end">
              <Link
                href="/auth/signup"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-white/10 transition hover:bg-white/90 md:w-auto"
              >
                Create Account
              </Link>

              <Link
                href="/auth/login"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15 md:w-auto"
              >
                Login
              </Link>

              <p className="mt-2 text-xs text-white/50 md:text-right">
                Takes less than 2 minutes to get started.
              </p>
            </div>
          </div>
        </div>

        {/* Simple footer line */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-sm text-white/55 md:flex-row">
          <p>© {new Date().getFullYear()} Mentora. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a className="hover:text-white transition" href="#features">
              Features
            </a>
            <a className="hover:text-white transition" href="#why">
              Why Mentora
            </a>
            <a className="hover:text-white transition" href="#cta">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
