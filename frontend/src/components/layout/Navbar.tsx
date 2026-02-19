import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white font-semibold ring-1 ring-white/15">
            M
          </div>
          <span className="text-white font-semibold tracking-tight">Mentora</span>
        </Link>

        {/* Links */}
        <nav className="hidden items-center gap-6 sm:flex">
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

        {/* Actions */}
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
  );
}
