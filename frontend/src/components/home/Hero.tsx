export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      {/* glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-500/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-120px] h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* If you add /public/logo.png it will show, otherwise it stays clean */}
            <div className="h-10 w-10 rounded-xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center text-white font-semibold">
              M
            </div>
            <span className="text-white/90 font-semibold tracking-tight">
              Mentora
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button className="rounded-xl px-4 py-2 text-white/80 hover:text-white transition">
              Features
            </button>
            <button className="rounded-xl px-4 py-2 text-white/80 hover:text-white transition">
              Pricing
            </button>
            <button className="rounded-xl bg-white px-4 py-2 text-slate-950 font-semibold hover:bg-white/90 transition">
              Get Started
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 ring-1 ring-white/15">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              AI + Medical • Privacy-first • Bangladesh-ready
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl leading-[1.05]">
              Your AI Companion for{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Mental Wellness
              </span>
            </h1>

            <p className="mt-5 text-lg text-white/70 md:text-xl max-w-xl">
              Mentora combines 24/7 AI support, expert mentorship, and medical consultation
              to help you manage stress, build resilience, and grow—securely.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button className="rounded-2xl bg-white px-6 py-3 text-slate-950 font-semibold shadow-lg shadow-white/10 hover:bg-white/90 transition">
                Start Free
              </button>
              <button className="rounded-2xl bg-white/10 px-6 py-3 text-white ring-1 ring-white/20 hover:bg-white/15 transition">
                View Demo
              </button>
            </div>

            {/* trust */}
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-300/80" />
                Crisis escalation ready
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-300/80" />
                Encrypted chat sessions
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-300/80" />
                Bengali-first UX
              </div>
            </div>

            {/* quick stats */}
            <div className="mt-10 grid grid-cols-3 gap-3 max-w-lg">
              {[
                { k: "24/7", v: "AI Support" },
                { k: "150+", v: "Features" },
                { k: "Bangla", v: "Focused" },
              ].map((s) => (
                <div
                  key={s.v}
                  className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
                >
                  <div className="text-white font-bold text-xl">{s.k}</div>
                  <div className="text-white/60 text-sm mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Feature cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "AI Chatbot",
                desc: "Mood detection, coping strategies, weekly reports.",
              },
              {
                title: "Mentorship",
                desc: "Book verified mentors, 1:1 or group sessions.",
              },
              {
                title: "Medical",
                desc: "Doctor directory, telemedicine, prescriptions.",
              },
              {
                title: "Safety",
                desc: "SOS button, crisis protocol, emergency contacts.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 hover:bg-white/10 transition"
              >
                <div className="text-white font-semibold">{f.title}</div>
                <p className="mt-2 text-white/65 text-sm leading-relaxed">
                  {f.desc}
                </p>
                <div className="mt-4 text-sm font-semibold text-cyan-200">
                  Learn more →
                </div>
              </div>
            ))}

            <div className="sm:col-span-2 rounded-2xl bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 p-6 ring-1 ring-white/10">
              <div className="text-white font-semibold">Built for Bangladesh</div>
              <p className="mt-2 text-white/65 text-sm leading-relaxed">
                Exam stress support, festival mental health tips, low-bandwidth mode, and local
                payment-friendly ecosystem.
              </p>
              <button className="mt-4 rounded-2xl bg-white/10 px-5 py-2.5 text-white ring-1 ring-white/20 hover:bg-white/15 transition">
                Explore Bangladesh features
              </button>
            </div>
          </div>
        </div>

        {/* bottom CTA strip */}
        <div className="mt-16 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-white font-semibold">Ready to start your wellness journey?</div>
 extraction: <div className="text-white/65 text-sm mt-1">
              Create an account and get your personalized plan in minutes.
            </div>
          </div>
          <button className="rounded-2xl bg-cyan-300 px-6 py-3 text-slate-950 font-semibold hover:bg-cyan-200 transition">
            Create Account
          </button>
        </div>
      </div>
    </section>
  );
}
