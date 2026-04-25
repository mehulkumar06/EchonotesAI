const SETTINGS_KEY = "echonotes_extension_settings";

const el = {
  title: document.getElementById("title"),
  note: document.getElementById("note"),
  selectedText: document.getElementById("selectedText"),
  status: document.getElementById("status"),
  captureBtn: document.getElementById("captureBtn"),
  saveBtn: document.getElementById("saveBtn"),
  apiBaseUrl: document.getElementById("apiBaseUrl"),
  authToken: document.getElementById("authToken"),
  syncEnabled: document.getElementById("syncEnabled"),
  saveSettingsBtn: document.getElementById("saveSettingsBtn"),
  notesList: document.getElementById("notesList"),
  refreshNotesBtn: document.getElementById("refreshNotesBtn"),
  openAppBtn: document.getElementById("openAppBtn")
};

document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings();
  await loadNotes();
});

el.captureBtn.addEventListener("click", async () => {
  setStatus("Capturing selected text...");
  const response = await chrome.runtime.sendMessage({ type: "GET_SELECTION_FROM_ACTIVE_TAB" });
  if (!response?.ok) {
    setStatus(response?.error || "Could not capture selected text.", true);
    return;
  }

  const payload = response.data || {};
  el.selectedText.value = payload.selectedText || "";
  if (!el.title.value && payload.pageTitle) {
    el.title.value = payload.pageTitle;
  }
  setStatus("Selected text captured.");
});

el.saveBtn.addEventListener("click", async () => {
  setStatus("Saving note...");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const payload = {
    title: el.title.value,
    body: el.note.value,
    selectedText: el.selectedText.value,
    sourceUrl: tab?.url || ""
  };

  const response = await chrome.runtime.sendMessage({ type: "SAVE_NOTE", payload });
  if (!response?.ok) {
    setStatus(response?.error || "Failed to save note.", true);
    return;
  }

  const saved = response.data;
  setStatus(
    saved.syncStatus === "synced"
      ? "Saved and synced to backend."
      : `Saved locally (${saved.syncStatus}).`
  );

  el.title.value = "";
  el.note.value = "";
  el.selectedText.value = "";
  await loadNotes();
});

el.saveSettingsBtn.addEventListener("click", async () => {
  const settings = {
    apiBaseUrl: el.apiBaseUrl.value.trim(),
    authToken: el.authToken.value.trim(),
    syncEnabled: Boolean(el.syncEnabled.checked)
  };
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  setStatus("Sync settings saved.");
});

el.refreshNotesBtn.addEventListener("click", loadNotes);

el.openAppBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:3000" });
});

async function loadSettings() {
  const data = await chrome.storage.local.get(SETTINGS_KEY);
  const settings = data[SETTINGS_KEY] || {
    apiBaseUrl: "http://localhost:5167",
    authToken: "",
    syncEnabled: true
  };

  el.apiBaseUrl.value = settings.apiBaseUrl || "http://localhost:5167";
  el.authToken.value = settings.authToken || "";
  el.syncEnabled.checked = Boolean(settings.syncEnabled);
}

async function loadNotes() {
  const response = await chrome.runtime.sendMessage({ type: "GET_NOTES" });
  if (!response?.ok) {
    setStatus(response?.error || "Failed to load notes.", true);
    return;
  }

  const notes = response.data || [];
  el.notesList.innerHTML = "";

  if (notes.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No notes yet. Save one from this popup.";
    el.notesList.appendChild(item);
    return;
  }

  notes.slice(0, 10).forEach((note) => {
    const item = document.createElement("li");

    const title = document.createElement("div");
    title.className = "note-title";
    title.textContent = note.title || "Untitled note";

    const meta = document.createElement("div");
    meta.className = "note-meta";
    meta.textContent = `${formatDate(note.createdAt)} • ${note.syncStatus || "local-only"}`;

    const body = document.createElement("div");
    body.className = "note-body";
    body.textContent = (note.body || note.selectedText || "").slice(0, 180);

    item.appendChild(title);
    item.appendChild(meta);
    item.appendChild(body);
    el.notesList.appendChild(item);
  });
}

function setStatus(message, isError = false) {
  el.status.textContent = message;
  el.status.classList.toggle("error", isError);
}

function formatDate(isoString) {
  if (!isoString) {
    return "Unknown time";
  }
  const date = new Date(isoString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}
