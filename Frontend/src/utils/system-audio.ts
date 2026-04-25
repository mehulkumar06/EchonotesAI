// src/utils/system-audio.ts
export async function getSystemAudioStream() {
  // User must select a screen/window/tab and enable “Share audio” in the prompt
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  });
  // We only need audio; stop video track to save resources
  stream.getVideoTracks().forEach((t) => t.stop());
  return stream;
}
