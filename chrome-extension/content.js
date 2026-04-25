chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "GET_SELECTION") {
    sendResponse({ ok: false, error: "Unknown message type" });
    return;
  }

  try {
    const selected = (window.getSelection()?.toString() || "").trim();
    sendResponse({
      ok: true,
      data: {
        selectedText: selected,
        sourceUrl: window.location.href,
        pageTitle: document.title || ""
      }
    });
  } catch (error) {
    sendResponse({ ok: false, error: "Unable to capture selected text." });
  }
});
