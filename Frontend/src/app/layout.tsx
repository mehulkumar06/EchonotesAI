import AppShell from "@/components/AppShell";
import "./globals.css";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "EchoNotes",
  description: "Local, privacy-first meeting assistant (UI demo)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 antialiased">
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/70 backdrop-blur">
            <div className="mx-auto w-full max-w-6xl px-6 py-4 flex items-center justify-between">
              <div className="text-lg font-semibold tracking-wide">EchoNotes</div>
            </div>
          </header>

          {/* Client wrapper controls sidebar width and main expansion */}
          <AppShell>{children}</AppShell>

          <footer className="border-t border-neutral-800">
            <div className="mx-auto w-full max-w-6xl px-6 py-4 text-sm text-neutral-400">
              EchoNotes — local, privacy-first UI demo
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
