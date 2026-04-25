"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* We remove the simplified centering and use a flex row for full height sidebar */}
      <div className="flex flex-1 h-full overflow-hidden">

        {/* Sidebar Container */}
        <div
          className={`shrink-0 h-full transition-[width] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${open ? "w-[240px]" : "w-[72px]"}`}
        >
          <Sidebar open={open} onToggle={() => setOpen((v) => !v)} className="h-full rounded-none border-r border-neutral-800/50 bg-neutral-900/30 backdrop-blur-md" />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 h-full overflow-y-auto bg-neutral-950/50 scroll-smooth">
          <div className="mx-auto w-full max-w-[1400px] p-6 md:p-8 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
