"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [mode, setMode] = useState<"mic" | "system">("mic");
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
        <div className="text-sm text-neutral-300 mb-2">Default source</div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === "mic"} onChange={() => setMode("mic")} />
            Microphone
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode === "system"} onChange={() => setMode("system")} />
            System/Tab audio
          </label>
        </div>
      </div>
    </div>
  );
}
