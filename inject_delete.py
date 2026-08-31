import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/downloads/page.tsx', 'r') as f:
    content = f.read()

delete_func = '''const handleDelete = async (entry: HistoryEntry) => {
    if (!confirm("Are you sure you want to delete this audio?")) return;
    try {
      const res = await fetch(https://voice-nova-sooty.vercel.app/api/elevenlabs/audio/\, {
        method: "DELETE",
        headers: { "Authorization": Bearer \ }
      });
      if (res.ok) {
        showToast("Audio deleted successfully!");
        setHistory(prev => prev.filter(h => h.downloadId !== entry.downloadId));
        if (playingId === entry.downloadId) {
          audioRef.current?.pause();
          setPlayingId(null);
        }
      } else {
        showToast("Failed to delete audio.", "error");
      }
    } catch (err) {
      showToast("Network error while deleting.", "error");
    }
  };'''

# Insert delete func before handleDownload
content = content.replace('const handleDownload = (entry: HistoryEntry) => {', delete_func + '\n\n  const handleDownload = (entry: HistoryEntry) => {')

# Add delete button UI next to download button
ui_find = '''{/* Download Button */}
                <button'''

ui_repl = '''{/* Delete Button */}
                <button
                  onClick={() => handleDelete(entry)}
                  title="Delete audio"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "36px", height: "36px", borderRadius: "8px", border: "none",
                    background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", cursor: "pointer",
                    transition: "all 0.2s ease", marginRight: "8px"
                  }}
                >
                  <Trash2 size={16} />
                </button>

                {/* Download Button */}
                <button'''

content = content.replace(ui_find, ui_repl)

with open('d:/VoiceNova/04-frontend/src/app/(console)/downloads/page.tsx', 'w') as f:
    f.write(content)
print("Downloads delete feature injected")
