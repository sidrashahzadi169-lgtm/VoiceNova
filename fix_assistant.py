import re

with open('d:/VoiceNova/04-frontend/src/components/AIAssistant.tsx', 'r') as f:
    content = f.read()

# Replace the fake hardcoded response logic in handleSubmit
bad_submit = '''const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInputText("");

    // Add typing indicator
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text: "", isTyping: true }]);
      
      // Simulate network request
      setTimeout(() => {
        const randAns = botAnswers[Math.floor(Math.random() * botAnswers.length)];
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { sender: "bot", text: randAns };
          return newMsgs;
        });
      }, 1500);
    }, 300);
  };'''

good_submit = '''const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInputText("");

    setMessages((prev) => [...prev, { sender: "bot", text: "", isTyping: true }]);
    
    try {
      const res = await fetch("/api/ai/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, mode: "chat" })
      });
      const data = await res.json();
      
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { sender: "bot", text: data.success ? data.text : (data.message || "I encountered an error.") };
        return newMsgs;
      });
    } catch (err) {
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { sender: "bot", text: "Network error. Please try again." };
        return newMsgs;
      });
    }
  };'''

content = content.replace(bad_submit, good_submit)

# Also update the Quick Actions to send to AI
bad_quick = '''<div className="quick-action-pill" onClick={() => setInputText("How do I clone a voice?")}>
              Write a Script
            </div>
            <div className="quick-action-pill" onClick={() => setInputText("Help me improve my audio")}>
              Improve My Script
            </div>
            <div className="quick-action-pill" onClick={() => setInputText("What are neural nodes?")}>
              Generate Voice
            </div>'''

good_quick = '''<div className="quick-action-pill" onClick={() => setInputText("Write a 30-second Facebook reel script about VoiceNova")}>
              Write a Script
            </div>
            <div className="quick-action-pill" onClick={() => setInputText("Can you help me improve this script to make it sound more persuasive?")}>
              Improve My Script
            </div>
            <div className="quick-action-pill" onClick={() => setInputText("How do I generate a voice using VoiceNova?")}>
              Generate Voice
            </div>'''

content = content.replace(bad_quick, good_quick)

with open('d:/VoiceNova/04-frontend/src/components/AIAssistant.tsx', 'w') as f:
    f.write(content)

print("AIAssistant updated")
