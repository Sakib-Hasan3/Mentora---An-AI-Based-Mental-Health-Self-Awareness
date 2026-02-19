import "./globals.css";

export const metadata = {
  title: "Mentora",
  description: "AI-powered mental wellness, mentorship, and medical consultation platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
