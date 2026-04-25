// src/components/VoiceCommandPanel.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Loader2, Volume2 } from "lucide-react";
import { apiClient } from "@/lib/api";

interface VoiceCommandPanelProps {
    noteId: number;
}

export default function VoiceCommandPanel({ noteId }: VoiceCommandPanelProps) {
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [command, setCommand] = useState("");
    const [response, setResponse] = useState("");
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                await processCommand(blob);
                stream.getTracks().forEach((track) => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setRecording(true);
            setResponse("");
        } catch (error) {
            console.error("Failed to start recording:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
            setRecording(false);
        }
    };

    const processCommand = async (audioBlob: Blob) => {
        setProcessing(true);
        try {
            // First, transcribe the command using Whisper
            const formData = new FormData();
            formData.append("file", audioBlob, "command.webm");

            // Use the transcribe endpoint just to get the command text
            const transcribeResponse = await apiClient.transcribeAudio(
                new File([audioBlob], "command.webm", { type: "audio/webm" })
            );

            const commandText = transcribeResponse.data.transcript;
            setCommand(commandText);

            // Now send the command to the voice-command endpoint
            const commandResponse = await apiClient.processVoiceCommand(commandText, noteId);
            setResponse(commandResponse.data.response);

            // Optionally speak the response
            speakResponse(commandResponse.data.response);
        } catch (error: any) {
            console.error("Failed to process command:", error);
            setResponse("Sorry, I couldn't process that command.");
        } finally {
            setProcessing(false);
        }
    };

    const speakResponse = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <Card className="border-neutral-800 bg-neutral-900/50">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Voice Commands
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-neutral-400">
                    Ask questions about this meeting using your voice
                </p>

                {/* Record Button */}
                <div className="flex items-center gap-3">
                    {!recording && !processing ? (
                        <Button
                            onClick={startRecording}
                            className="bg-sky-600 hover:bg-sky-500 gap-2"
                        >
                            <Mic className="h-4 w-4" />
                            Ask a Question
                        </Button>
                    ) : recording ? (
                        <Button
                            onClick={stopRecording}
                            variant="destructive"
                            className="gap-2"
                        >
                            <Mic className="h-4 w-4 animate-pulse" />
                            Stop Recording
                        </Button>
                    ) : (
                        <Button disabled className="gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                        </Button>
                    )}
                </div>

                {/* Command Display */}
                {command && (
                    <div className="rounded-lg bg-neutral-950 p-3 border border-neutral-800">
                        <p className="text-xs text-neutral-500 mb-1">Your Question:</p>
                        <p className="text-neutral-200">{command}</p>
                    </div>
                )}

                {/* Response Display */}
                {response && (
                    <div className="rounded-lg bg-sky-950/30 p-3 border border-sky-800/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Volume2 className="h-4 w-4 text-sky-400" />
                            <p className="text-xs text-sky-400">AI Response:</p>
                        </div>
                        <p className="text-neutral-200 leading-relaxed">{response}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
