# EchoNotes AI Chrome Extension (Companion)

This folder contains a standalone Chrome Extension that complements your existing EchoNotes AI web app.

It does **not** modify the existing app code, and can run independently.

## Features

- Quick note capture from a popup UI.
- Optional selected-text capture from the current browser tab.
- Local note persistence via Chrome Storage API.
- Optional backend sync (if your backend supports a compatible notes `POST` endpoint).
- Quick button to open the EchoNotes AI web app on `http://localhost:3000`.

## Folder Structure

- `manifest.json` - Manifest V3 configuration.
- `popup.html` - Popup UI.
- `popup.css` - Popup styling.
- `popup.js` - Popup logic and user interactions.
- `background.js` - Service worker for storage + API sync orchestration.
- `content.js` - Content script to read selected text from web pages.

## Integration Approach

### 1) Storage-first (always works)

The extension always saves notes in `chrome.storage.local` under:

- `echonotes_extension_notes`

This gives reliable offline/local behavior regardless of backend state.

### 2) API sync (optional)

When "Enable API sync" is enabled in popup settings, the extension tries:

1. `POST {API_BASE_URL}/extension/notes`
2. `POST {API_BASE_URL}/notes`

If both fail or are unavailable, notes remain local with a sync status label.

> Your current backend appears to expose `GET /notes` but may not expose `POST /notes`.  
> If you add `POST /extension/notes` (recommended), sync will work seamlessly.

## Run Instructions

1. Start your existing EchoNotes AI backend (example):
   - `uvicorn main:app --reload --port 5167`
2. Start your existing frontend:
   - `npm run dev` (typically on `http://localhost:3000`)
3. Open Chrome and go to `chrome://extensions`.
4. Enable **Developer mode**.
5. Click **Load unpacked** and select:
   - `E:/Capstone/EchonotesAI/chrome-extension`
6. Pin and open **EchoNotes AI Companion** from the extensions toolbar.

## How to Use

1. Open any web page.
2. (Optional) Select text on the page.
3. Open the extension popup.
4. Click **Capture selection** to pull selected text into the popup.
5. Add a title/note, then click **Save note**.
6. Configure API sync in **Sync settings** if your backend supports sync endpoints.

## Recommended Backend Endpoint (Optional)

If you want robust extension sync, add an endpoint like:

- `POST /extension/notes`

Suggested payload:

```json
{
  "title": "string",
  "content": "string",
  "selected_text": "string",
  "source_url": "string",
  "created_at": "ISO string"
}
```

Return at least:

```json
{
  "id": 123
}
```

This allows the extension to mark notes as fully synced.
