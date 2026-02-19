const FEATURES = [
  {
    title: "AI Mental Health Chatbot",
    desc: "24/7 Bangla/English support with mood detection, coping prompts, and weekly insights.",
    tag: "AI Support",
  },
  {
    title: "Mentorship Booking",
    desc: "Find verified mentors by specialty, language, price, and availability—book in minutes.",
    tag: "Mentorship",
  },
  {
    title: "Medical Consultation",
    desc: "Doctor directory, telemedicine, prescriptions, and reminders—organized in one place.",
    tag: "Healthcare",
  },
  {
    title: "Safety & Crisis Protocol",
    desc: "SOS access, risk detection, emergency contacts, and professional escalation flow.",
    tag: "Safety",
  },
  {
    title: "Progress Tracking",
    desc: "Mood, stress, sleep, and goals—visual timeline and wellness score to measure improvement.",
    tag: "Tracking",
  },
  {
    title: "Community Support",
    desc: "Anonymous circles, moderated support groups, Q&A, and accountability partners.",
    tag: "Community",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        {/* Section heading */}
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-cyan-200/90">
            What you get
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            A complete wellness ecosystem—built for real life
          </h2>
          <p className="mt-4 text-white/65">
            Mentora blends AI assistance, human expertise, and medical support
            into one simple platform—privacy-first, culturally aware, and easy to use.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:bg-white/8 hover:ring-white/20"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/10">
                <span className="h-2 w-2 rounded-full bg-cyan-300/80" />
                {f.tag}
              </div>

              <h3 className="mt-4 text-lg font-semibold text-white">
                {f.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-white/65">
                {f.desc}
              </p>

              <div className="mt-5 text-sm font-semibold text-cyan-200 transition group-hover:text-cyan-100">
                Learn more →
              </div>
            </div>
          ))}
        </div>

        {/* Trust stats + Bangladesh focus */}
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {/* Stats */}
          <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <h3 className="text-white font-semibold">Designed to scale</h3>
            <p className="mt-2 text-sm text-white/65">
              Built for reliability: fast UI, secure flows, and modular features.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { k: "24/7", v: "Support" },
                { k: "150+", v: "Features" },
                { k: "Bangla", v: "Focus" },
              ].map((s) => (
                <div
                  key={s.v}
                  className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
                >
                  <div className="text-white text-xl font-extrabold">{s.k}</div>
                  <div className="mt-1 text-xs text-white/60">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bangladesh focus */}
          <div
            id="why"
            className="rounded-2xl bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 p-6 ring-1 ring-white/10 lg:col-span-2"
          >
            <h3 className="text-white font-semibold">Built for Bangladesh 🇧🇩</h3>
            <p className="mt-2 text-sm text-white/65 leading-relaxed">
              Exam-season stress support, festival wellness tips, low-bandwidth mode,
              and localized content—so people actually use it and benefit from it.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "Exam stress (HSC/University)",
                "Festival mental wellness tips",
                "Low data + offline-ready",
                "Privacy-first (anonymous options)",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/75 ring-1 ring-white/10"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-6">
              <a
                href="#cta"
                className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15"
              >
                Explore how it works →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
