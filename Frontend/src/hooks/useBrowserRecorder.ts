// src/hooks/useBrowserRecorder.ts
import { useRef, useState } from "react";
import { getSystemAudioStream } from "@/utils/system-audio";

export type RecorderMode = "mic" | "system";

export function useBrowserRecorder(defaultMime: string = "audio/webm") {
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);

  const start = async (mode: RecorderMode = "mic") => {
    let stream: MediaStream;
    if (mode === "system") {
      // Tab/System audio via Screen Capture API
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      // Keep only audio
      stream.getVideoTracks().forEach((t) => t.stop());
    } else {
      // Microphone
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    const rec = new MediaRecorder(stream, { mimeType: defaultMime });
    chunksRef.current = [];
    rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
    };
    rec.start();
    mediaRef.current = rec;
    setRecording(true);
  };

  const stop = async () => {
    const rec = mediaRef.current;
    if (!rec) return null;
    await new Promise<void>((resolve) => {
      rec.onstop = () => resolve();
      rec.stop();
    });
    setRecording(false);
    return new Blob(chunksRef.current, { type: rec.mimeType });
  };

  return { recording, start, stop };
}
