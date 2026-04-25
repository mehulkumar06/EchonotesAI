"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { RecorderMode, useBrowserRecorder } from "@/hooks/useBrowserRecorder";
import {
  Mic,
  Upload,
  FileText,
  CheckSquare,
  Cpu,
  Loader2,
  Play,
  ArrowRight,
  Sparkles,
  Command,
  LayoutGrid,
} from "lucide-react";
import TranscriptViewer from "@/components/TranscriptViewer";
import SummaryCard from "@/components/SummaryCard";
import TaskList from "@/components/TaskList";
import Link from "next/link";
import { cn } from "@/lib/utils";
import VoiceCommandPanel from "@/components/VoiceCommandPanel";

interface ProcessingResult {
  note_id: number;
  filename: string;
  transcript: string;
  summary: string;
  key_points: string[];
  tasks: Array<{ id: number; task: string; deadline: string | null; status: string }>;
  sentiment?: string;
  language?: string;
}

const MOCK_RESULT: ProcessingResult = {
  note_id: 99999,
  filename: "Weekly_Sync_Demo.webm",
  transcript: "Okay team, let's get started with the weekly sync. First item on the agenda is the new UI deployment. Sarah, what's the status?\n\nSarah: We're on track for Friday release. The tests are passing, and we just need to finalize the mobile responsiveness tweaks.\n\nGreat. Mark, can you ensure the documentation is updated by Thursday? We don't want to release without docs.\n\nMark: Sure, I'll get on that today. I might need some input from the design team on the new assets.\n\nOkay, I'll set up a meeting for you and the design lead tomorrow morning. \n\nAlso, reminder that the quarterly review is next Monday. Please have your reports ready.\n\nAnything else? No? Alright, let's get back to work. Thanks everyone.",
  summary: "The team reviewed the upcoming UI deployment, confirming it is on track for Friday. Documentation needs to be updated by Thursday, and a coordination meeting with design will be set up. The team was also reminded about the quarterly review next Monday.",
  key_points: [
    "UI deployment scheduled for Friday",
    "Mobile responsiveness tweaks are the final blocker",
    "Documentation deadline set for Thursday",
    "Design coordination meeting to be scheduled for tomorrow",
    "Quarterly review reports due for next Monday"
  ],
  tasks: [
    { id: 1, task: "Finalize mobile responsiveness", deadline: "2026-02-16", status: "pending" },
    { id: 2, task: "Update documentation", deadline: "2026-02-15", status: "pending" },
    { id: 3, task: "Prepare quarterly review reports", deadline: "2026-02-19", status: "pending" }
  ],
  sentiment: "Positive",
  language: "English"
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"record" | "upload" | null>(null);
  const [scrollTrigger, setScrollTrigger] = useState(0);
  const [mode, setMode] = useState<RecorderMode>("mic");
  const { recording, start, stop } = useBrowserRecorder("audio/webm");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("Idle");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recordingSectionRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status management
  useEffect(() => {
    if (result) {
      setStatus("Complete");
    } else if (processing) {
      setStatus("Processing...");
    } else if (audioUrl) {
      setStatus("Ready to process");
    } else if (recording) {
      setStatus("Recording");
    } else {
      setStatus("Idle");
    }
  }, [audioUrl, recording, processing, result]);

  // Listen for sidebar record button
  useEffect(() => {
    const handleOpenRecorder = () => {
      setActiveTab("record");
      setScrollTrigger((c) => c + 1);
    };

    window.addEventListener("open-recorder", handleOpenRecorder);
    return () => window.removeEventListener("open-recorder", handleOpenRecorder);
  }, []);

  // Scroll to recording section when active
  useEffect(() => {
    if (activeTab === "record" && recordingSectionRef.current) {
      setTimeout(() => {
        recordingSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [activeTab, scrollTrigger]);

  // Handlers
  const onStartRecording = async () => {
    try {
      setStatus(mode === "mic" ? "Requesting microphone…" : "Select tab/window to share…");
      setResult(null);
      setError(null);
      await start(mode);
      setStatus("Recording");
    } catch (e) {
      console.error(e);
      setStatus("Permission denied");
      setError("Failed to start recording. Please check permissions.");
    }
  };

  const onStopRecording = async () => {
    setStatus("Stopping…");
    const blob = await stop();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    setUploadedFile(null);
    setStatus("Ready to process");
  };

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError("Please upload a valid audio file.");
      return;
    }
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setUploadedFile(file);
    setResult(null);
    setError(null);
    setActiveTab("upload");
  };

  const onProcess = async () => {
    if (!audioUrl) return;
    setProcessing(true);
    setError(null);
    setStatus("Uploading audio...");
    try {
      let fileToUpload: File;
      if (uploadedFile) {
        fileToUpload = uploadedFile;
      } else {
        const res = await fetch(audioUrl);
        const blob = await res.blob();
        fileToUpload = new File(
          [blob],
          mode === "mic" ? "mic_recording.webm" : "system_recording.webm",
          { type: "audio/webm" }
        );
      }
      setStatus("Transcribing with Whisper...");
      const response = await apiClient.transcribeAudio(fileToUpload);
      setStatus("Analyzing with GPT...");
      setResult(response.data);
      setStatus("Complete");
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.detail || "Processing failed. Please try again.");
      setStatus("Error");
    } finally {
      setProcessing(false);
    }
  };

  const onSimulate = async () => {
    setProcessing(true);
    setStatus("Simulating upload...");
    await new Promise(r => setTimeout(r, 800));
    setStatus("Simulating transcription...");
    await new Promise(r => setTimeout(r, 1000));
    setStatus("Simulating analysis...");
    await new Promise(r => setTimeout(r, 800));

    setResult(MOCK_RESULT);
    setStatus("Complete");
    setProcessing(false);
  };

  const onReset = () => {
    setAudioUrl(null);
    setResult(null);
    setError(null);
    setUploadedFile(null);
    setStatus("Idle");
    setActiveTab(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="relative max-w-[1280px] mx-auto min-h-screen pb-20 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse-slow" />
        <div className="absolute top-[30%] left-1/3 w-[600px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] opacity-30 mix-blend-screen animate-pulse-slow delay-700" />
        <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-amber-500/20 rounded-[100%] blur-[60px] opacity-60 mix-blend-screen animate-pulse-slow delay-300" />
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-orange-400/25 rounded-full blur-[50px] opacity-70 mix-blend-color-dodge" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Hero Section */}
      <section className="relative text-center space-y-6 pt-16 md:pt-24 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-medium text-neutral-300 mb-4 animate-in fade-in zoom-in-50 duration-500 delay-100 shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)]">
          <Sparkles className="h-3 w-3 text-indigo-400" />
          <span className="tracking-wide">AI-POWERED MEETING INTELLIGENCE</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-2xl">
          Your AI Meeting <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300 animate-shimmer bg-[length:200%_100%]">Assistant</span>
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed text-balance">
          Record, transcribe, and analyze your meetings instantly.
          Upload audio or capture directly from your browser with <span className="text-neutral-200 font-semibold">privacy-first AI</span>.
        </p>
      </section>

      {/* Main Action Grid */}
      {!result ? (
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 z-10">
          <ActionCard icon={Mic} title="Record Audio" description="Capture microphone or system audio." onClick={() => { setActiveTab("record"); setScrollTrigger(c => c + 1); }} active={activeTab === "record"} color="red" />
          <ActionCard icon={Upload} title="Upload File" description="Process existing audio recordings." onClick={onUploadClick} active={activeTab === "upload"} color="blue" />
          <input type="file" ref={fileInputRef} onChange={onFileSelected} className="hidden" accept="audio/*" />
          <Link href="/notes" className="group h-full w-full block">
            <ActionCard icon={LayoutGrid} title="View Notes" description="Access your past meeting history." color="teal" />
          </Link>
          <Link href="/tasks" className="group h-full w-full block">
            <ActionCard icon={CheckSquare} title="Tasks Dashboard" description="Manage action items and deadlines." color="amber" />
          </Link>
        </div>
      ) : null}

      {/* Active Recording / Preview Area */}
      {(activeTab === "record" || audioUrl) && !result && (
        <div ref={recordingSectionRef} className="relative z-10 animate-in zoom-in-95 duration-500">
          <div className={`absolute inset-0 bg-gradient-to-r ${activeTab === 'record' ? 'from-red-500/10 to-indigo-500/10' : 'from-blue-500/10 to-sky-500/10'} blur-3xl opacity-20 -z-10 rounded-full`} />
          <Card className="border-white/10 bg-neutral-900/60 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <CardHeader className="relative border-b border-white/5 pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                {activeTab === "record" ? (
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    New Recording
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-indigo-400" />
                    File Preview
                  </div>
                )}
              </CardTitle>
              <CardDescription className="text-neutral-500 ml-6">{status}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-8 relative z-10">
              {activeTab === "record" && !audioUrl && (
                <div className="space-y-12">
                  <div className="flex justify-center gap-8">
                    <SourceSelector selected={mode === "mic"} onClick={() => setMode("mic")} icon={Mic} label="Microphone" />
                    <SourceSelector selected={mode === "system"} onClick={() => setMode("system")} icon={Cpu} label="System Audio" />
                  </div>
                  <div className="flex justify-center py-4 pb-16">
                    {!recording ? (
                      <button id="echonotes-record-btn" onClick={onStartRecording} className="group relative flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-b from-red-500 to-red-700 shadow-[0_0_50px_-10px_rgba(239,68,68,0.5)] hover:scale-105 hover:shadow-[0_0_70px_-10px_rgba(239,68,68,0.7)] transition-all duration-300 border-4 border-red-900/30">
                        <Mic className="h-10 w-10 text-white drop-shadow-md group-hover:animate-pulse" />
                        <span className="absolute -bottom-12 text-xs font-bold text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap tracking-wider uppercase">Click to Start</span>
                      </button>
                    ) : (
                      <button onClick={onStopRecording} className="group relative flex items-center justify-center h-24 w-24 rounded-full bg-neutral-900 border-4 border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.3)] hover:scale-105 transition-all duration-300">
                        <div className="h-10 w-10 rounded-lg bg-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
                        <span className="absolute -bottom-12 text-xs font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap tracking-wider uppercase">Stop Recording</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
              {audioUrl && (
                <div className="space-y-8 max-w-2xl mx-auto">
                  <div className="bg-black/40 p-8 rounded-3xl border border-white/10 flex items-center gap-6 shadow-inner backdrop-blur-sm">
                    <div className="h-16 w-16 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                      <Play className="h-7 w-7 text-indigo-400 ml-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate text-xl tracking-tight">{uploadedFile ? uploadedFile.name : `Meeting Recording (${mode})`}</p>
                      <p className="text-sm text-neutral-400 font-mono mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Ready to process • {mode}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 pt-4">
                    <Button variant="ghost" onClick={onReset} disabled={processing} className="text-neutral-400 hover:text-white hover:bg-white/5 px-6">Cancel</Button>
                    <Button variant="outline" onClick={onSimulate} disabled={processing} className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200">
                      Mock Data
                    </Button>
                    <Button onClick={onProcess} disabled={processing} className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[200px] h-12 text-base font-medium shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.7)] transition-all rounded-xl">
                      {processing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{status === "Uploading audio..." ? "Uploading..." : "Processing..."}</> : <><Sparkles className="mr-2 h-5 w-5" />Process Recording</>}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-500/20 bg-red-500/10 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 relative z-10">
          <CardContent className="pt-6 flex items-center gap-3 text-red-400 justify-center">
            <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30">
              <span className="font-bold text-lg">!</span>
            </div>
            {error}
          </CardContent>
        </Card>
      )}

      {/* Processing Results */}
      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">Analysis Complete</h2>
                {result.language && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
                    {result.language}
                  </span>
                )}
              </div>
              <p className="text-neutral-500 mt-1">Here is exactly what happened in your meeting.</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/notes/${result.note_id}`}>
                <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
                  View Full Note <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button onClick={onReset} className="bg-white text-black hover:bg-neutral-200">Start New</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <SummaryCard
                summary={result.summary}
                keyPoints={result.key_points}
                sentiment={result.sentiment}
                noteId={result.note_id}
              />
              <TaskList tasks={result.tasks} />
              <TranscriptViewer transcript={result.transcript} />
            </div>
            <div className="space-y-6">
              <VoiceCommandPanel noteId={result.note_id} />
              <div className="p-6 rounded-2xl border border-white/5 bg-neutral-900/30 backdrop-blur-sm">
                <h3 className="font-semibold text-neutral-200 mb-2">Next Steps</h3>
                <p className="text-sm text-neutral-400">
                  You can now translate this summary, ask questions about the content, or verify the action items extracted.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Showcase Grid (Only show when idle) */}
      {!result && !audioUrl && !activeTab && (
        <div className="pt-16 pb-12 border-t border-white/5 relative z-10">
          <div className="flex items-center gap-3 mb-12 justify-center opacity-80">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-neutral-600" />
            <span className="text-sm font-bold text-neutral-400 uppercase tracking-[0.2em]">Powerful Capabilities</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-neutral-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureHighlight
              icon={Mic}
              title="Smart Recording"
              desc="High-fidelity capture from mic or system audio for virtual meetings."
              color="red"
            />
            <FeatureHighlight
              icon={Sparkles}
              title="AI Analysis"
              desc="Instant summaries, key points, and action items extracted automatically."
              color="blue"
            />
            <FeatureHighlight
              icon={LayoutGrid}
              title="Language & Sentiment"
              desc="Detects language, translates summaries, and analyzes meeting tone."
              color="violet"
            />
            <FeatureHighlight
              icon={Command}
              title="Voice Commands"
              desc="Ask questions about your notes and get spoken answers instantly."
              color="teal"
            />
            <FeatureHighlight
              icon={CheckSquare}
              title="Task Management"
              desc="Track deadlines and action items with a unified, smart dashboard."
              color="amber"
            />
            <FeatureHighlight
              icon={FileText}
              title="Export Ready"
              desc="Download clean, formatted text files of your meetings for easy sharing."
              color="pink"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Sub-components: Color Variants Logic
// ------------------------------------------------------------------

function ActionCard({ icon: Icon, title, description, onClick, active, color = "neutral" }: any) {
  const isActive = active;

  // Dynamic Color Maps
  const colors: any = {
    neutral: {
      bg: "bg-neutral-900/40",
      border: "border-white/5",
      hoverBorder: "hover:border-white/20",
      glow: "hover:shadow-none",
      icon: "text-neutral-400",
      iconBg: "bg-white/5 border-white/5",
      textGlow: "group-hover:text-white"
    },
    red: {
      bg: isActive ? "bg-red-500/10" : "bg-neutral-900/40",
      border: isActive ? "border-red-500/50" : "border-white/5",
      hoverBorder: "hover:border-red-500/50",
      glow: isActive ? "shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]" : "hover:shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]",
      icon: isActive ? "text-red-400" : "text-red-400/80 group-hover:text-red-400",
      iconBg: isActive ? "bg-red-500/20 border-red-500/30" : "bg-red-500/5 border-red-500/10 group-hover:bg-red-500/10 group-hover:border-red-500/20",
      textGlow: "group-hover:text-red-100"
    },
    blue: {
      bg: isActive ? "bg-sky-500/10" : "bg-neutral-900/40",
      border: isActive ? "border-sky-500/50" : "border-white/5",
      hoverBorder: "hover:border-sky-500/50",
      glow: isActive ? "shadow-[0_0_30px_-10px_rgba(14,165,233,0.3)]" : "hover:shadow-[0_0_30px_-10px_rgba(14,165,233,0.3)]",
      icon: isActive ? "text-sky-400" : "text-sky-400/80 group-hover:text-sky-400",
      iconBg: isActive ? "bg-sky-500/20 border-sky-500/30" : "bg-sky-500/5 border-sky-500/10 group-hover:bg-sky-500/10 group-hover:border-sky-500/20",
      textGlow: "group-hover:text-sky-100"
    },
    teal: {
      bg: "bg-neutral-900/40",
      border: "border-white/5",
      hoverBorder: "hover:border-emerald-500/50",
      glow: "hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]",
      icon: "text-emerald-400/80 group-hover:text-emerald-400",
      iconBg: "bg-emerald-500/5 border-emerald-500/10 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20",
      textGlow: "group-hover:text-emerald-100"
    },
    amber: {
      bg: "bg-neutral-900/40",
      border: "border-white/5",
      hoverBorder: "hover:border-amber-500/50",
      glow: "hover:shadow-[0_0_30px_-10px_rgba(245,158,11,0.3)]",
      icon: "text-amber-400/80 group-hover:text-amber-400",
      iconBg: "bg-amber-500/5 border-amber-500/10 group-hover:bg-amber-500/10 group-hover:border-amber-500/20",
      textGlow: "group-hover:text-amber-100"
    }
  };

  const c = colors[color] || colors.neutral;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-300 border h-full group relative overflow-hidden backdrop-blur-sm",
        c.bg, c.border, c.hoverBorder, c.glow,
        // Lift effect on hover
        "hover:-translate-y-1"
      )}
    >
      {/* Top gradient highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-5 h-full relative z-10">
        <div className={cn("p-4 rounded-2xl border transition-all duration-300 shadow-inner", c.iconBg)}>
          <Icon className={cn("h-8 w-8 transition-colors duration-300", c.icon)} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className={cn("font-bold text-lg text-neutral-100 tracking-tight transition-colors duration-300", c.textGlow)}>{title}</h3>
          <p className="text-sm text-neutral-500 mt-2 leading-relaxed font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}


function FeatureHighlight({ icon: Icon, title, desc, color = "neutral" }: any) {
  const colors: any = {
    red: "group-hover:border-red-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.2)] text-red-400 bg-red-500/10 border-red-500/20",
    blue: "group-hover:border-sky-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(14,165,233,0.2)] text-sky-400 bg-sky-500/10 border-sky-500/20",
    teal: "group-hover:border-emerald-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)] text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "group-hover:border-amber-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)] text-amber-400 bg-amber-500/10 border-amber-500/20",
    violet: "group-hover:border-purple-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)] text-purple-400 bg-purple-500/10 border-purple-500/20",
    pink: "group-hover:border-rose-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.2)] text-rose-400 bg-rose-500/10 border-rose-500/20",
    neutral: "text-neutral-400 bg-white/5 border-white/10"
  };

  const c = colors[color];

  return (
    <div className={cn(
      "flex gap-5 p-6 rounded-2xl border border-white/5 bg-neutral-900/30 hover:bg-neutral-800/50 transition-all duration-300 group backdrop-blur-sm",
      "hover:border-white/10", // Base hover border
      typeof color === 'string' && color !== 'neutral' ? colors[color].split(' ').slice(0, 2).join(' ') : "" // Apply glow only on hover
    )}>
      <div className={cn(
        "h-12 w-12 shrink-0 rounded-xl flex items-center justify-center transition-transform duration-300 border shadow-sm",
        "group-hover:scale-110",
        color !== 'neutral' ? colors[color].split(' ').slice(2).join(' ') : colors.neutral
      )}>
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <div>
        <h4 className="font-bold text-base text-neutral-200 mb-1 group-hover:text-white transition-colors">{title}</h4>
        <p className="text-sm text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">{desc}</p>
      </div>
    </div>
  )
}

function SourceSelector({ selected, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all duration-300 w-48",
        selected
          ? "bg-indigo-500/10 border-indigo-500 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] scale-105"
          : "bg-neutral-900/50 border-white/10 hover:border-white/30 hover:bg-neutral-800"
      )}
    >
      <Icon className={cn("h-10 w-10", selected ? "text-indigo-400" : "text-neutral-500")} strokeWidth={1.5} />
      <span className={cn("text-sm font-semibold tracking-wide", selected ? "text-indigo-200" : "text-neutral-400")}>{label}</span>
    </button>
  )
}
