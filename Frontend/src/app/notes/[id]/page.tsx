"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Loader2, Download } from "lucide-react";
import TranscriptViewer from "@/components/TranscriptViewer";
import SummaryCard from "@/components/SummaryCard";
import TaskList from "@/components/TaskList";
import VoiceCommandPanel from "@/components/VoiceCommandPanel";

interface NoteDetail {
    id: number;
    filename: string;
    transcript: string;
    raw_transcript: string;
    summary: string;
    key_points: string[];
    sentiment?: string;
    language?: string;
    translated_summary?: string;
    created_at: string;
}

interface Task {
    id: number;
    task: string;
    deadline: string | null;
    status: string;
}

const MOCK_NOTE_ID = 99999;

const MOCK_NOTE_DETAIL: NoteDetail = {
    id: MOCK_NOTE_ID,
    filename: "Weekly_Sync_Demo.webm",
    transcript:
        "Okay team, let's get started with the weekly sync. First item on the agenda is the new UI deployment. Sarah, what's the status?\n\nSarah: We're on track for Friday release. The tests are passing, and we just need to finalize the mobile responsiveness tweaks.\n\nGreat. Mark, can you ensure the documentation is updated by Thursday? We don't want to release without docs.\n\nMark: Sure, I'll get on that today. I might need some input from the design team on the new assets.\n\nOkay, I'll set up a meeting for you and the design lead tomorrow morning.\n\nAlso, reminder that the quarterly review is next Monday. Please have your reports ready.\n\nAnything else? No? Alright, let's get back to work. Thanks everyone.",
    raw_transcript:
        "Okay team, let's get started with the weekly sync. First item on the agenda is the new UI deployment. Sarah, what's the status?\n\nSarah: We're on track for Friday release. The tests are passing, and we just need to finalize the mobile responsiveness tweaks.\n\nGreat. Mark, can you ensure the documentation is updated by Thursday? We don't want to release without docs.\n\nMark: Sure, I'll get on that today. I might need some input from the design team on the new assets.\n\nOkay, I'll set up a meeting for you and the design lead tomorrow morning.\n\nAlso, reminder that the quarterly review is next Monday. Please have your reports ready.\n\nAnything else? No? Alright, let's get back to work. Thanks everyone.",
    summary:
        "The team reviewed the upcoming UI deployment, confirming it is on track for Friday. Documentation needs to be updated by Thursday, and a coordination meeting with design will be set up. The team was also reminded about the quarterly review next Monday.",
    key_points: [
        "UI deployment scheduled for Friday",
        "Mobile responsiveness tweaks are the final blocker",
        "Documentation deadline set for Thursday",
        "Design coordination meeting to be scheduled for tomorrow",
        "Quarterly review reports due for next Monday",
    ],
    sentiment: "Positive",
    language: "English",
    created_at: new Date().toISOString(),
};

const MOCK_NOTE_TASKS: Task[] = [
    { id: 1, task: "Finalize mobile responsiveness", deadline: "2026-02-16", status: "pending" },
    { id: 2, task: "Update documentation", deadline: "2026-02-15", status: "pending" },
    { id: 3, task: "Prepare quarterly review reports", deadline: "2026-02-19", status: "pending" },
];

export default function NoteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const noteId = parseInt(params.id as string);

    const [note, setNote] = useState<NoteDetail | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchNoteDetails();
    }, [noteId]);

    const fetchNoteDetails = async () => {
        try {
            setLoading(true);
            const [noteResponse, tasksResponse] = await Promise.all([
                apiClient.getNote(noteId),
                apiClient.getTasksByNote(noteId),
            ]);
            setNote(noteResponse.data);
            setTasks(tasksResponse.data);
        } catch (error) {
            console.error("Failed to fetch note details:", error);
            if (noteId === MOCK_NOTE_ID) {
                setNote(MOCK_NOTE_DETAIL);
                setTasks(MOCK_NOTE_TASKS);
            } else {
                setNote(null);
                setTasks([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this note?")) return;

        try {
            setDeleting(true);
            await apiClient.deleteNote(noteId);
            router.push("/notes");
        } catch (error) {
            console.error("Failed to delete note:", error);
            alert("Failed to delete note");
        } finally {
            setDeleting(false);
        }
    };

    const handleExport = () => {
        if (!note) return;

        const content = `
Title: ${note.filename}
Date: ${new Date(note.created_at).toLocaleString()}
Language: ${note.language || 'Unknown'}
--------------------------------------------------

SUMMARY
--------------------------------------------------
${note.summary || 'No summary available.'}
${note.translated_summary ? `\n\nTRANSLATED SUMMARY\n--------------------------------------------------\n${note.translated_summary}` : ''}

KEY POINTS
--------------------------------------------------
${Array.isArray(note.key_points) ? note.key_points.map((p: string) => `- ${p}`).join('\n') : 'No key points available.'}

ACTION ITEMS
--------------------------------------------------
${tasks.length > 0 ? tasks.map(t => `[${t.status === 'completed' ? 'x' : ' '}] ${t.task} ${t.deadline ? `(Due: ${t.deadline})` : ''}`).join('\n') : 'No action items.'}

TRANSCRIPT
--------------------------------------------------
${note.transcript}
        `.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
            </div>
        );
    }

    if (!note) {
        return (
            <div className="text-center py-12">
                <p className="text-neutral-400">Note not found</p>
                <Button onClick={() => router.push("/notes")} className="mt-4">
                    Back to Notes
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/notes")}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold">{note.filename}</h1>
                        <p className="text-sm text-neutral-500 flex items-center gap-2">
                            {formatDate(note.created_at)}
                            {note.language && (
                                <span className="bg-neutral-800 px-2 py-0.5 rounded text-xs text-neutral-400">
                                    {note.language}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="gap-2"
                    >
                        {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                    </Button>
                </div>
            </div>

            {/* Voice Commands */}
            <VoiceCommandPanel noteId={noteId} />

            {/* Summary */}
            <SummaryCard
                summary={note.summary}
                keyPoints={note.key_points}
                sentiment={note.sentiment}
                noteId={note.id}
            />

            {/* Tasks */}
            <TaskList tasks={tasks} onTaskUpdate={fetchNoteDetails} />

            {/* Transcript */}
            <TranscriptViewer transcript={note.transcript} rawTranscript={note.raw_transcript} />
        </div>
    );
}
