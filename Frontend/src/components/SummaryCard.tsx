// src/components/SummaryCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { Loader2, Languages } from "lucide-react";

interface SummaryCardProps {
    summary: string;
    keyPoints: string[];
    sentiment?: string;
    noteId?: number; // Optional for pages where we might not have ID or want translation
}

const sentimentColor: Record<string, string> = {
    Positive: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Neutral: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
    Tense: "bg-red-500/20 text-red-400 border-red-500/30",
    Urgent: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const MOCK_NOTE_ID = 99999;

const MOCK_TRANSLATIONS: Record<string, string> = {
    Hindi: `टीम ने आगामी UI डिप्लॉयमेंट की समीक्षा की और पुष्टि की कि यह शुक्रवार तक समय पर पूरा हो जाएगा। डॉक्यूमेंटेशन को गुरुवार तक अपडेट करना आवश्यक है, और डिजाइन टीम के साथ समन्वय बैठक आयोजित की जाएगी। टीम को अगले सोमवार होने वाली तिमाही समीक्षा के बारे में भी याद दिलाया गया।

मुख्य बिंदु
• UI डिप्लॉयमेंट शुक्रवार के लिए निर्धारित है
• मोबाइल रिस्पॉन्सिवनेस में सुधार अंतिम बाधा है
• डॉक्यूमेंटेशन की अंतिम तिथि गुरुवार है
• डिजाइन समन्वय बैठक कल निर्धारित की जाएगी
• तिमाही समीक्षा रिपोर्ट अगले सोमवार तक जमा करनी है`,
    Marathi: `टीमने आगामी UI डिप्लॉयमेंटचा आढावा घेतला आणि ते शुक्रवारपर्यंत वेळेत पूर्ण होईल याची खात्री केली। डॉक्युमेंटेशन गुरुवारपर्यंत अपडेट करणे आवश्यक आहे आणि डिझाइन टीमसोबत समन्वय बैठक आयोजित केली जाईल। टीमला पुढील सोमवार होणाऱ्या तिमाही आढाव्याचीही आठवण करून देण्यात आली।

मुख्य मुद्दे
• UI डिप्लॉयमेंट शुक्रवारसाठी नियोजित आहे
• मोबाईल रिस्पॉन्सिव्हनेस सुधारणा ही शेवटची अडचण आहे
• डॉक्युमेंटेशनची अंतिम मुदत गुरुवार आहे
• डिझाइन समन्वय बैठक उद्यासाठी नियोजित केली जाईल
• तिमाही आढावा अहवाल पुढील सोमवारपर्यंत सादर करायचा आहे`,
    French: `L’équipe a examine le deploiement UI a venir et a confirme qu’il est en bonne voie pour vendredi. La documentation doit etre mise a jour d’ici jeudi, et une reunion de coordination avec l’equipe de design sera organisee. L’equipe a egalement ete rappelee de la revue trimestrielle prevue lundi prochain.

Points Cles
• Le deploiement UI est prevu pour vendredi
• Les ajustements de la responsivite mobile sont le dernier blocage
• La date limite de la documentation est fixee a jeudi
• Une reunion de coordination avec le design sera planifiee pour demain
• Les rapports de revue trimestrielle sont dus pour lundi prochain`,
    Spanish: `El equipo reviso el proximo despliegue de la UI y confirmo que esta en marcha para el viernes. La documentacion debe actualizarse antes del jueves y se organizara una reunion de coordinacion con el equipo de diseno. Tambien se recordo al equipo sobre la revision trimestral del proximo lunes.

Puntos Clave
• El despliegue de la UI esta programado para el viernes
• Los ajustes de responsividad movil son el ultimo bloqueo
• La fecha limite de documentacion es el jueves
• La reunion de coordinacion con diseno se programara para manana
• Los informes de revision trimestral deben entregarse el proximo lunes`,
};

const MOCK_KEY_TAKEAWAYS: Record<string, string[]> = {
    Hindi: [
        "UI डिप्लॉयमेंट शुक्रवार के लिए निर्धारित है",
        "मोबाइल रिस्पॉन्सिवनेस में सुधार अंतिम बाधा है",
        "डॉक्यूमेंटेशन की अंतिम तिथि गुरुवार है",
        "डिजाइन समन्वय बैठक कल निर्धारित की जाएगी",
        "तिमाही समीक्षा रिपोर्ट अगले सोमवार तक जमा करनी है",
    ],
    Marathi: [
        "UI डिप्लॉयमेंट शुक्रवारसाठी नियोजित आहे",
        "मोबाईल रिस्पॉन्सिव्हनेस सुधारणा ही शेवटची अडचण आहे",
        "डॉक्युमेंटेशनची अंतिम मुदत गुरुवार आहे",
        "डिझाइन समन्वय बैठक उद्यासाठी नियोजित केली जाईल",
        "तिमाही आढावा अहवाल पुढील सोमवारपर्यंत सादर करायचा आहे",
    ],
    French: [
        "Le deploiement UI est prevu pour vendredi",
        "Les ajustements de la responsivite mobile sont le dernier blocage",
        "La date limite de la documentation est fixee a jeudi",
        "Une reunion de coordination avec le design sera planifiee pour demain",
        "Les rapports de revue trimestrielle sont dus pour lundi prochain",
    ],
    Spanish: [
        "El despliegue de la UI esta programado para el viernes",
        "Los ajustes de responsividad movil son el ultimo bloqueo",
        "La fecha limite de documentacion es el jueves",
        "La reunion de coordinacion con diseno se programara para manana",
        "Los informes de revision trimestral deben entregarse el proximo lunes",
    ],
};

export default function SummaryCard({ summary, keyPoints, sentiment = "Neutral", noteId }: SummaryCardProps) {
    const [targetLang, setTargetLang] = useState<string>("Hindi");
    const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);
    const [translating, setTranslating] = useState(false);
    const isMockMode = noteId === MOCK_NOTE_ID;

    const getMockTranslation = (lang: string) => {
        if (lang === "English") return summary;
        return MOCK_TRANSLATIONS[lang] || null;
    };
    const displayKeyPoints =
        isMockMode && targetLang !== "English"
            ? MOCK_KEY_TAKEAWAYS[targetLang] || keyPoints
            : keyPoints;

    const handleTranslate = async () => {
        if (!noteId) return;
        if (isMockMode) {
            setTranslatedSummary(getMockTranslation(targetLang));
            return;
        }
        setTranslating(true);
        try {
            const res = await apiClient.translateNote(noteId, targetLang);
            if (res.data.translated_summary) {
                setTranslatedSummary(res.data.translated_summary);
            }
        } catch (error) {
            console.error("Translation failed", error);
        } finally {
            setTranslating(false);
        }
    };

    return (
        <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
                    AI Summary
                </CardTitle>
                <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 text-xs font-medium rounded-full border ${sentimentColor[sentiment] || sentimentColor.Neutral}`}>
                        {sentiment}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">

                {/* Summary Section */}
                <div className="space-y-3">
                    <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mt-1">Executive Summary</h3>

                        {/* Translation Controls (Only if noteId is present) */}
                        {noteId && (
                            <div className="flex items-center gap-2">
                                <Select
                                    value={targetLang}
                                    onValueChange={(value) => {
                                        setTargetLang(value);
                                        if (isMockMode) {
                                            setTranslatedSummary(getMockTranslation(value));
                                        }
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-28 text-xs bg-neutral-800 border-neutral-700 text-neutral-300">
                                        <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="English">English</SelectItem>
                                        <SelectItem value="Hindi">Hindi</SelectItem>
                                        <SelectItem value="Marathi">Marathi</SelectItem>
                                        <SelectItem value="French">French</SelectItem>
                                        <SelectItem value="Spanish">Spanish</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
                                    onClick={handleTranslate}
                                    disabled={translating}
                                >
                                    {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                                </Button>
                            </div>
                        )}
                    </div>

                    <p className="text-neutral-300 leading-relaxed text-base">{summary || "No summary available."}</p>

                    {/* Translated Summary Block */}
                    {translatedSummary && (
                        <div className="mt-4 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Languages className="h-3 w-3 text-indigo-400" />
                                <span className="text-xs font-bold text-indigo-300 uppercase">Translated to {targetLang}</span>
                            </div>
                            <p className="text-indigo-100 leading-relaxed text-base">{translatedSummary}</p>
                        </div>
                    )}
                </div>

                <Separator className="bg-neutral-800/50" />

                {/* Key Points Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Key Takeaways</h3>
                    {displayKeyPoints && displayKeyPoints.length > 0 ? (
                        <ul className="grid gap-3">
                            {displayKeyPoints.map((point, index) => (
                                <li key={index} className="flex gap-3 text-neutral-300 text-sm leading-relaxed p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className="text-indigo-400 font-bold shrink-0">•</span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-neutral-500 text-sm italic">No key points extracted yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
