import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/dashboard/page.tsx', 'r') as f:
    content = f.read()

# Add states for the new dropdowns
state_injections = '''const [aiPrompt, setAiPrompt] = useState("");
  const [aiContentType, setAiContentType] = useState("General Voice-over");
  const [aiTone, setAiTone] = useState("Professional");
  const [aiLength, setAiLength] = useState("Medium");
  const [aiLanguage, setAiLanguage] = useState("English");'''

content = re.sub(r'const \[aiPrompt, setAiPrompt\] = useState\(""\);', state_injections, content)

# Rewrite handleAIWriter
new_handle = '''const handleAIWriter = async () => {
    const desc = aiPrompt.trim();
    if (!desc) {
      showToast("Please describe the script first!", "error");
      return;
    }
    
    setIsSynthesizing(true);
    showToast("Generating script with AI...");
    
    try {
      const fullPrompt = Content Type: \\\nTone: \\\nLength: \\\nLanguage: \\\n\\nTopic/Description: \;
      
      const res = await fetch("/api/ai/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt })
      });
      const data = await res.json();
      
      if (data.success) {
        // Clear editor and simulate typing the new script
        setEditorText("");
        simulateAITyping(data.text);
      } else {
        showToast(data.message || "AI failed to generate script", "error");
      }
    } catch (err) {
      showToast("Network error contacting AI provider", "error");
    } finally {
      setIsSynthesizing(false);
    }
  };'''

content = re.sub(r'const handleAIWriter = \(\) => \{.*?(?=const insertPause = \(\) =>)', new_handle + '\n\n  ', content, flags=re.DOTALL)

# Rewrite the UI
old_ui = '''<div className="script-assistant-row" style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <input
                    type="text"
                    placeholder="Describe the script (e.g., 'A 30-second Facebook Reel promoting voice cloning')..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn btn-primary btn-sm btn-glow-hover" onClick={handleAIWriter}>
                    <Wand2 size={12} style={{ marginRight: "4px" }} /> <span>Write with AI</span>
                  </button>
                </div>'''

new_ui = '''<div className="script-assistant-controls" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                  <textarea
                    placeholder="Describe what you want to create (e.g., 'A promotional script for VoiceNova')..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={2}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "white", resize: "none" }}
                  />
                  
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <select value={aiContentType} onChange={(e) => setAiContentType(e.target.value)} className="custom-select" style={{ flex: 1, minWidth: "120px", padding: "8px", fontSize: "0.85rem" }}>
                      <option>General Voice-over</option>
                      <option>Facebook Reel</option>
                      <option>TikTok</option>
                      <option>YouTube</option>
                      <option>Advertisement</option>
                      <option>Podcast</option>
                      <option>Audiobook</option>
                    </select>
                    
                    <select value={aiTone} onChange={(e) => setAiTone(e.target.value)} className="custom-select" style={{ flex: 1, minWidth: "120px", padding: "8px", fontSize: "0.85rem" }}>
                      <option>Professional</option>
                      <option>Friendly</option>
                      <option>Emotional</option>
                      <option>Energetic</option>
                      <option>Calm</option>
                      <option>Storytelling</option>
                      <option>Persuasive</option>
                    </select>
                    
                    <select value={aiLength} onChange={(e) => setAiLength(e.target.value)} className="custom-select" style={{ flex: 1, minWidth: "100px", padding: "8px", fontSize: "0.85rem" }}>
                      <option>Short</option>
                      <option>Medium</option>
                      <option>Long</option>
                    </select>
                    
                    <select value={aiLanguage} onChange={(e) => setAiLanguage(e.target.value)} className="custom-select" style={{ flex: 1, minWidth: "100px", padding: "8px", fontSize: "0.85rem" }}>
                      <option>English</option>
                      <option>Urdu</option>
                      <option>Spanish</option>
                      <option>Arabic</option>
                    </select>
                  </div>

                  <button type="button" className="btn btn-primary btn-full btn-glow-hover" onClick={handleAIWriter} disabled={isSynthesizing}>
                    <Wand2 size={14} style={{ marginRight: "6px" }} /> <span>Write with AI</span>
                  </button>
                </div>'''

content = content.replace(old_ui, new_ui)

with open('d:/VoiceNova/04-frontend/src/app/(console)/dashboard/page.tsx', 'w') as f:
    f.write(content)

print("Dashboard UI and handleAIWriter replaced.")
