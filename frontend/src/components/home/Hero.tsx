import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Animated gradient wash */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500/25 via-indigo-500/25 to-fuchsia-500/25 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute -bottom-48 left-1/3 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-indigo-500/15 blur-3xl animate-[pulse_7s_ease-in-out_infinite]" />
      </div>

      {/* Floating glow orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-24 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl animate-[float_7s_ease-in-out_infinite]" />
        <div className="absolute right-14 top-40 h-36 w-36 rounded-full bg-indigo-400/20 blur-2xl animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-24 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-fuchsia-400/10 blur-3xl animate-[float_9s_ease-in-out_infinite]" />
      </div>

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:52px_52px]" />

      {/* Content */}
      <div className="relative z-10">
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white font-semibold ring-1 ring-white/15">
                M
              </div>
              <span className="text-white font-semibold tracking-tight">
                Mentora
              </span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <a href="#features" className="text-sm text-white/70 hover:text-white transition">
                Features
              </a>
              <a href="#why" className="text-sm text-white/70 hover:text-white transition">
                Why Mentora
              </a>
              <a href="#cta" className="text-sm text-white/70 hover:text-white transition">
                Get Started
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="rounded-xl px-4 py-2 text-sm text-white/80 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-white/90 transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Body */}
        <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-6 py-14">
          <div className="grid w-full items-center gap-12 lg:grid-cols-2">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 ring-1 ring-white/15 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                AI + Medical • Privacy-first • Bangladesh-ready
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl xl:text-7xl leading-[1.05]">
                Your AI Companion for{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-200 bg-clip-text text-transparent">
                  Mental Wellness
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg text-white/70 md:text-xl">
                Mentora combines 24/7 AI support, mentorship, and medical consultation
                to help you manage stress, build resilience, and grow—securely.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#cta"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-white/10 hover:bg-white/90 transition"
                >
                  Start Free
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/15 transition"
                >
                  View Features
                </a>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3 max-w-lg">
                {[
                  { k: "24/7", v: "Support" },
                  { k: "150+", v: "Features" },
                  { k: "Bangla", v: "Focused" },
                ].map((s) => (
                  <div
                    key={s.v}
                    className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur"
                  >
                    <div className="text-white text-xl font-extrabold">{s.k}</div>
                    <div className="mt-1 text-xs text-white/65">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Glassmorphism cards */}
            <div className="relative">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "AI Chatbot",
                    desc: "Mood tracking, coping prompts, weekly summaries.",
                  },
                  {
                    title: "Mentorship",
                    desc: "Book verified mentors with flexible slots.",
                  },
                  {
                    title: "Medical",
                    desc: "Telemedicine, prescriptions, reminders.",
                  },
                  {
                    title: "Safety",
                    desc: "SOS, crisis protocol, emergency contacts.",
                  },
                ].map((c) => (
                  <div
                    key={c.title}
                    className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-white/15 transition"
                  >
                    <div className="text-white font-semibold">{c.title}</div>
                    <p className="mt-2 text-sm text-white/70 leading-relaxed">
                      {c.desc}
                    </p>
                    <div className="mt-4 text-sm font-semibold text-cyan-200">
                      Learn more →
                    </div>
                  </div>
                ))}

                <div className="sm:col-span-2 rounded-3xl bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 p-6 ring-1 ring-white/15 backdrop-blur">
                  <div className="text-white font-semibold">Built for Bangladesh 🇧🇩</div>
                  <p className="mt-2 text-sm text-white/70 leading-relaxed">
                    Exam season support, festival wellness tips, and low-bandwidth experience—so it works everywhere.
                  </p>
                  <a
                    href="#features"
                    className="mt-4 inline-flex items-center justify-center rounded-2xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/15 transition"
                  >
                    Explore Bangladesh features →
                  </a>
                </div>
              </div>

              {/* extra floating highlight */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl" />
            </div>
          </div>
        </div>
      </div>

      
    </section>
  );
}