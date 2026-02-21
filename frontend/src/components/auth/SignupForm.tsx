"use client";

import { useState } from "react";

type FormState = {
  name: string;
  email: string;
  password: string;
};

export default function SignupForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation (ফ্রন্টএন্ডে quick check)
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.email.trim()) return setError("Email is required.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      // Backend API call
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Signup failed.");
      }

      setSuccess("Account created! You can log in now.");
      setForm({ name: "", email: "", password: "" });
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-white/80">Full name</label>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Your name"
          className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/40 outline-none focus:border-white/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/80">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="you@example.com"
          className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/40 outline-none focus:border-white/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/80">Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="••••••••"
          className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/40 outline-none focus:border-white/20"
        />
        <p className="mt-1 text-xs text-white/50">Use at least 6 characters.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      <button
        disabled={loading}
        className="h-11 w-full rounded-xl bg-white text-slate-900 font-medium transition hover:bg-white/90 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}