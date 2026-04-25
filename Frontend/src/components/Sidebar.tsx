"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, Home, NotebookTabs, Settings, Info, ChevronLeft, ChevronRight, Search, CheckSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { title: string; href: string; icon: React.ElementType };
const items: Item[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "My Notes", href: "/notes", icon: NotebookTabs },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "About", href: "/about", icon: Info },
];

export default function Sidebar({
  open,
  onToggle,
  className,
}: {
  open: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-neutral-900/40 backdrop-blur-xl border-r border-white/5 transition-all duration-300",
        open ? "w-60" : "w-[68px]",
        className
      )}
    >
      {/* Brand & Toggle */}
      <div className={cn("flex items-center h-16 shrink-0", open ? "px-5" : "justify-center")}>
        {open ? (
          <div className="flex items-center gap-2 transition-opacity duration-300">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
              EchoNotes
            </span>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
        )}
      </div>

      {/* Toggle Button (Absolute) */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400 shadow-lg hover:text-white transition-colors"
      >
        {open ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>



      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1 py-2">
        {items.map(({ title, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 outline-none",
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.02)]"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]"
              )}
              title={!open ? title : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-indigo-400" : "text-neutral-500 group-hover:text-neutral-300"
                )}
              />
              <span
                className={cn(
                  "truncate transition-all duration-300",
                  open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 hidden w-0"
                )}
              >
                {title}
              </span>

              {isActive && open && (
                <div className="ml-auto w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / CTA */}
      <div className="p-4 border-t border-white/5 bg-gradient-to-t from-neutral-950/50 to-transparent">
        {open ? (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-recorder"))}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/20 hover:shadow-red-900/40 hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            <Mic className="h-4 w-4 animate-pulse" />
            <span>Start Recording</span>
          </button>
        ) : (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-recorder"))}
            className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg hover:shadow-red-500/30 hover:scale-105 transition-all"
            title="Start Recording"
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
      </div>
    </aside>
  );
}
