import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import CTA from "@/components/home/CTA";

export default function Home() {
  return (
    <main className="bg-slate-950">
      <Navbar />
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}
