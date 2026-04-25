const NOTES_KEY = "echonotes_extension_notes";
const SETTINGS_KEY = "echonotes_extension_settings";

const DEFAULT_SETTINGS = {
  apiBaseUrl: "http://localhost:5167",
  syncEnabled: true,
  authToken: ""
};

chrome.runtime.onInstalled.addListener(async () => {
  const { [SETTINGS_KEY]: settings } = await chrome.storage.local.get(SETTINGS_KEY);
  if (!settings) {
    await chrome.storage.local.set({ [SETTINGS_KEY]: DEFAULT_SETTINGS });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message?.type) {
    sendResponse({ ok: false, error: "Invalid message type" });
    return;
  }

  if (message.type === "GET_SELECTION_FROM_ACTIVE_TAB") {
    handleGetSelection(sendResponse);
    return true;
  }

  if (message.type === "SAVE_NOTE") {
    handleSaveNote(message.payload)
      .then((result) => sendResponse({ ok: true, data: result }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === "GET_NOTES") {
    getLocalNotes()
      .then((notes) => sendResponse({ ok: true, data: notes }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  sendResponse({ ok: false, error: "Unknown message type" });
});

async function handleGetSelection(sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      sendResponse({ ok: false, error: "No active tab found" });
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, { type: "GET_SELECTION" });
    if (!response?.ok) {
      sendResponse({ ok: false, error: response?.error || "No selection available" });
      return;
    }
    sendResponse({ ok: true, data: response.data });
  } catch (error) {
    sendResponse({
      ok: false,
      error: "Cannot read selection from this page. Reload the page and try again."
    });
  }
}

async function handleSaveNote(payload) {
  const now = new Date().toISOString();
  const note = {
    id: crypto.randomUUID(),
    title: (payload?.title || "").trim() || "Untitled note",
    body: (payload?.body || "").trim(),
    selectedText: (payload?.selectedText || "").trim(),
    sourceUrl: payload?.sourceUrl || "",
    createdAt: now,
    updatedAt: now,
    syncStatus: "local-only"
  };

  if (!note.body && !note.selectedText) {
    throw new Error("Please write a note or capture selected text.");
  }

  const notes = await getLocalNotes();
  notes.unshift(note);
  await chrome.storage.local.set({ [NOTES_KEY]: notes });

  const syncResult = await trySyncNote(note);
  if (syncResult.synced) {
    note.syncStatus = "synced";
    note.remoteId = syncResult.remoteId || null;
  } else {
    note.syncStatus = syncResult.reason;
  }

  const latest = await getLocalNotes();
  const index = latest.findIndex((n) => n.id === note.id);
  if (index >= 0) {
    latest[index] = note;
    await chrome.storage.local.set({ [NOTES_KEY]: latest });
  }

  return note;
}

async function getLocalNotes() {
  const data = await chrome.storage.local.get(NOTES_KEY);
  return Array.isArray(data[NOTES_KEY]) ? data[NOTES_KEY] : [];
}

async function getSettings() {
  const data = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(data[SETTINGS_KEY] || {}) };
}

async function trySyncNote(note) {
  const settings = await getSettings();
  if (!settings.syncEnabled) {
    return { synced: false, reason: "sync-disabled" };
  }

  const baseUrl = (settings.apiBaseUrl || "").trim();
  if (!baseUrl) {
    return { synced: false, reason: "missing-api-url" };
  }

  const headers = { "Content-Type": "application/json" };
  if (settings.authToken) {
    headers.Authorization = `Bearer ${settings.authToken}`;
  }

  const candidates = [
    {
      url: `${baseUrl.replace(/\/$/, "")}/extension/notes`,
      body: {
        title: note.title,
        content: note.body,
        selected_text: note.selectedText,
        source_url: note.sourceUrl,
        created_at: note.createdAt
      }
    },
    {
      url: `${baseUrl.replace(/\/$/, "")}/notes`,
      body: {
        filename: `extension-note-${note.id}.txt`,
        transcript: note.body || note.selectedText,
        summary: note.title,
        key_points: note.selectedText ? [note.selectedText] : [],
        tasks: []
      }
    }
  ];

  for (const endpoint of candidates) {
    try {
      const response = await fetch(endpoint.url, {
        method: "POST",
        headers,
        body: JSON.stringify(endpoint.body)
      });

      if (response.ok) {
        let remoteId = null;
        try {
          const data = await response.json();
          remoteId = data?.id || data?.note_id || null;
        } catch (_err) {
          remoteId = null;
        }
        return { synced: true, remoteId };
      }

      if (response.status >= 400 && response.status < 500 && response.status !== 404 && response.status !== 405) {
        return { synced: false, reason: `sync-failed-${response.status}` };
      }
    } catch (_error) {
      return { synced: false, reason: "api-unreachable" };
    }
  }

  return { synced: false, reason: "no-supported-endpoint" };
}
