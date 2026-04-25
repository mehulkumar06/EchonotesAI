"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { ExternalLink, Loader2, Save } from "lucide-react";

const DRAWIO_ORIGIN = "https://embed.diagrams.net";

const EMPTY_DIAGRAM = `<mxfile host="app.diagrams.net"><diagram name="Page-1" id="echonotes"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>`;

type JsonMsg = { event?: string; xml?: string; error?: string; format?: string };

export default function DrawioWhiteboard() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [diagramXml, setDiagramXml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadFromServer = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.getWhiteboard();
      const xml = (res.data as { diagram_xml?: string }).diagram_xml || "";
      setDiagramXml(xml);
    } catch {
      setDiagramXml("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  const postToIframe = useCallback((payload: object) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify(payload),
      DRAWIO_ORIGIN
    );
  }, []);

  const sendLoad = useCallback(() => {
    const xml = diagramXml.trim() ? diagramXml : EMPTY_DIAGRAM;
    postToIframe({
      action: "load",
      xml,
      autosave: 1,
      dark: 1,
      modified: "unsavedChanges",
    });
  }, [diagramXml, postToIframe]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== DRAWIO_ORIGIN) return;
      let msg: JsonMsg;
      try {
        msg = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (msg.error) {
        setStatus(String(msg.error));
        return;
      }
      if (msg.event === "init") {
        sendLoad();
        setStatus("");
      }
      if (msg.event === "export" && msg.xml) {
        (async () => {
          setSaving(true);
          try {
            await apiClient.saveWhiteboard(msg.xml!);
            setStatus("Saved");
          } catch {
            setStatus("Save failed");
          } finally {
            setSaving(false);
          }
        })();
      }
      if (msg.event === "autosave" && msg.xml) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
          setSaving(true);
          try {
            await apiClient.saveWhiteboard(msg.xml!);
            setStatus("Saved");
          } catch {
            setStatus("Save failed");
          } finally {
            setSaving(false);
          }
        }, 1200);
      }
      if (msg.event === "save" && msg.xml) {
        (async () => {
          setSaving(true);
          try {
            await apiClient.saveWhiteboard(msg.xml!);
            setStatus("Saved");
          } catch {
            setStatus("Save failed");
          } finally {
            setSaving(false);
          }
        })();
      }
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [sendLoad]);

  const requestExportSave = () => {
    postToIframe({ action: "export", format: "xmlsvg" });
  };

  const iframeSrc = `${DRAWIO_ORIGIN}/?embed=1&proto=json&spin=1&dark=1&ui=min&saveAndExit=0`;

  return (
    <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2 flex flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle className="text-lg font-semibold text-neutral-100">
            Visual whiteboard (draw.io)
          </CardTitle>
          <p className="text-sm text-neutral-500 font-normal mt-1 max-w-2xl">
            Open-source diagrams.net editor. Drag shapes freely to map workflows
            and dependencies. Changes autosave to EchoNotes; use Save now to
            force a sync after edits.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {saving && (
            <span className="text-xs text-neutral-500 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </span>
          )}
          {status && !saving && (
            <span className="text-xs text-emerald-400/90">{status}</span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-neutral-700 bg-neutral-950"
            onClick={() => postToIframe({ action: "export", format: "xmlsvg" })}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save now
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            asChild
            className="text-neutral-400"
          >
            <a
              href="https://www.drawio.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              About draw.io
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="h-[520px] flex items-center justify-center text-neutral-500 text-sm">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading board…
          </div>
        ) : (
          <div className="relative w-full h-[min(70vh,720px)] border-t border-neutral-800 bg-neutral-950">
            <iframe
              ref={iframeRef}
              title="draw.io whiteboard"
              src={iframeSrc}
              className="absolute inset-0 w-full h-full border-0"
              allow="clipboard-read; clipboard-write"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
