import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/studio/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

state_find = 'const [isSynthesizing, setIsSynthesizing] = useState(false);'
state_repl = '''const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  
  const handleConvertRoman = async () => {
    if (!scriptText || scriptText.trim().length === 0) {
      showToast("Please enter some Roman Urdu text first.", "error");
      return;
    }
    setIsConverting(true);
    try {
      const activeToken = sessionToken;
      const res = await fetch("https://voice-nova-sooty.vercel.app/api/ai/convert-roman", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": Bearer \
        },
        body: JSON.stringify({ text: scriptText })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScriptText(data.text);
        showToast("Converted to Urdu successfully!");
      } else {
        showToast(data.message || "Failed to convert.", "error");
      }
    } catch (err) {
      showToast("Network error during conversion.", "error");
    } finally {
      setIsConverting(false);
    }
  };'''
content = content.replace(state_find, state_repl)

ui_find = '''<button className="editor-action-btn" id="pasteClipboardBtn" onClick={handlePaste}>
                  <Clipboard size={14} style={{ marginRight: "4px" }} /> <span>Paste</span>
                </button>
              </div>'''

ui_repl = '''<button className="editor-action-btn" id="pasteClipboardBtn" onClick={handlePaste}>
                  <Clipboard size={14} style={{ marginRight: "4px" }} /> <span>Paste</span>
                </button>
                <button 
                  className="editor-action-btn" 
                  onClick={handleConvertRoman}
                  disabled={isConverting}
                  style={{ background: "rgba(108,99,255,0.15)", color: "#00C2FF", border: "1px solid rgba(0,194,255,0.2)" }}
                >
                  {isConverting ? <Loader2 size={14} className="animate-spin" style={{ marginRight: "4px" }} /> : <Sparkles size={14} style={{ marginRight: "4px" }} />}
                  <span>Roman Urdu to Urdu</span>
                </button>
              </div>'''
content = content.replace(ui_find, ui_repl)

with open('d:/VoiceNova/04-frontend/src/app/(console)/studio/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Roman Urdu injected into Studio")
