// src/components/NoteCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText } from "lucide-react";
import Link from "next/link";

interface NoteCardProps {
    id: number;
    filename: string;
    summary: string | null;
    created_at: string;
    sentiment?: string;
    language?: string;
}

const sentimentColor: Record<string, string> = {
    Positive: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    Neutral: "text-neutral-400 border-neutral-500/30 bg-neutral-500/10",
    Tense: "text-red-400 border-red-500/30 bg-red-500/10",
    Urgent: "text-amber-400 border-amber-500/30 bg-amber-500/10",
};

export default function NoteCard({ id, filename, summary, created_at, sentiment, language }: NoteCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Link href={`/notes/${id}`}>
            <Card className="border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900/70 transition-colors cursor-pointer">
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-sky-500 shrink-0" />
                                <CardTitle className="text-base truncate">{filename}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                {language && (
                                    <span className="bg-neutral-800 border-neutral-700 border px-1.5 py-0.5 rounded text-[10px] text-neutral-400 font-medium">
                                        {language}
                                    </span>
                                )}
                                {sentiment && (
                                    <span className={`border px-1.5 py-0.5 rounded text-[10px] font-medium ${sentimentColor[sentiment] || sentimentColor.Neutral}`}>
                                        {sentiment}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 shrink-0 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(created_at)}</span>
                        </div>
                    </div>
                </CardHeader>
                {summary && (
                    <CardContent>
                        <p className="text-sm text-neutral-400 line-clamp-2 mt-2">{summary}</p>
                    </CardContent>
                )}
            </Card>
        </Link>
    );
}
