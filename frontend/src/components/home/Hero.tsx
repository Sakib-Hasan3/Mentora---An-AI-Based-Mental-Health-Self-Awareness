import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl" />

      <div className="relative z-10 max-w-3xl px-6 text-center">
        {/* Logo */}
        <div className="mx-auto mb-6 w-24">
          <Image
            src="/logo.png"
            alt="Mentora Logo"
            width={96}
            height={96}
            priority
            className="drop-shadow-lg"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          Your AI Companion for{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mental Wellness
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg md:text-xl text-gray-700">
          Mentora combines AI, mentorship, and medical support to help you live a healthier,
          more balanced life.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button className="rounded-xl bg-blue-600 px-6 py-3 text-white shadow-lg transition hover:bg-blue-700">
            Get Started
          </button>

          <button className="rounded-xl border border-blue-600 px-6 py-3 text-blue-700 transition hover:bg-blue-50">
            Learn More
          </button>
        </div>

        {/* Trust line */}
        <p className="mt-6 text-sm text-gray-600">
          AI-powered • Secure • Bangladesh-focused
        </p>
      </div>
    </section>
  );
}
