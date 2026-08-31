content = '''"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send } from "lucide-react";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: "bot" | "user";
  text: string;
  isTyping?: boolean;
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello Sidra! Looking to customize configurations? Ask me about regenerating API tokens, clearing local cache files, or toggling dark mode.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInputText("");

    setMessages((prev) => [...prev, { sender: "bot", text: "Typing...", isTyping: true }]);

    try {
      const res = await fetch("/api/ai/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, mode: "chat" })
      });
      const data = await res.json();
      
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isTyping);
        return [...filtered, { sender: "bot", text: data.success ? data.text : (data.message || "I encountered an error.") }];
      });
    } catch (err) {
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isTyping);
        return [...filtered, { sender: "bot", text: "Network error. Please try again." }];
      });
    }
  };

  return (
    <div className={\i-assistant-overlay \\} id="aiAssistantOverlay">
      <div className="assistant-chat-card glass-panel">
        <div className="chat-header">
          <div className="header-user">
            <div className="assistant-avatar">
              <Sparkles size={14} />
            </div>
            <div className="avatar-info">
              <span className="assistant-name">Nova Assistant</span>
              <span className="assistant-status">Online</span>
            </div>
          </div>
          <button className="chat-close-btn" id="chatCloseBtn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="chat-body" id="chatBody" ref={chatBodyRef}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={\chat-message \\}
            >
              {msg.isTyping ? (
                <p>Typing<span className="dot-blink">.</span><span className="dot-blink">.</span><span className="dot-blink">.</span></p>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          ))}
          {messages.length === 1 && (
            <div className="quick-actions" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
              <button onClick={() => setInputText("Write a 30-second Facebook reel script")} style={{ fontSize: "0.75rem", padding: "6px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", color: "white", cursor: "pointer" }}>Write a Script</button>
              <button onClick={() => setInputText("Help me improve my audio script")} style={{ fontSize: "0.75rem", padding: "6px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", color: "white", cursor: "pointer" }}>Improve My Script</button>
              <button onClick={() => setInputText("How do I generate a voice?")} style={{ fontSize: "0.75rem", padding: "6px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", color: "white", cursor: "pointer" }}>Generate Voice</button>
            </div>
          )}
        </div>

        <form className="chat-footer" id="chatFormInput" onSubmit={handleSubmit}>
          <input
            type="text"
            id="chatInputMessage"
            placeholder="Ask AI to help you create..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            required
          />
          <button type="submit" className="chat-send-btn">
            <Send size={16} fill="currentColor" />
          </button>
        </form>
      </div>
    </div>
  );
}
'''

with open('d:/VoiceNova/04-frontend/src/components/AIAssistant.tsx', 'w') as f:
    f.write(content)
