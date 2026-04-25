// src/components/TranscriptViewer.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface TranscriptViewerProps {
    transcript: string;
    rawTranscript?: string;
}

export default function TranscriptViewer({ transcript, rawTranscript }: TranscriptViewerProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(transcript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="border-neutral-800 bg-neutral-900/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Transcript</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="gap-2"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                Copy
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg bg-neutral-950 p-4 max-h-96 overflow-y-auto">
                    <p className="text-neutral-300 whitespace-pre-wrap leading-relaxed">
                        {transcript}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
