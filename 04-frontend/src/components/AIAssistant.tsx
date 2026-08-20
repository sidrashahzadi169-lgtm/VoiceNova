"use client";

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

  const botAnswers = [
    "To make Nova sound warmer, set speed rate to 0.95x and increase pitch by +5%. This creates a rich narrative cadence.",
    "You can add brief breathing elements by writing '[pause: 0.4s]' inside the text scripts. Try it out!",
    "Yes, you can export speech in French or Spanish! Simply set the Language dropdown selector before hitting synthesize.",
    "To synthesize deep cinematic voices, pick Vortex (Male) and slide Pitch down to -15%.",
    "Your characters quota resets on the 15th of every month. You currently have 54,790 characters remaining.",
  ];

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInputText("");

    // Add typing indicator
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Typing...", isTyping: true },
      ]);
    }, 400);

    // Answer response
    setTimeout(() => {
      setMessages((prev) => {
        // Remove typing indicator and add real answer
        const filtered = prev.filter((m) => !m.isTyping);
        const randomAnswer = botAnswers[Math.floor(Math.random() * botAnswers.length)];
        return [...filtered, { sender: "bot", text: randomAnswer }];
      });
    }, 1600);
  };

  return (
    <div className={`ai-assistant-overlay ${isOpen ? "active" : ""}`} id="aiAssistantOverlay">
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
              className={`chat-message ${msg.sender === "user" ? "user-msg" : "assistant-msg"}`}
            >
              {msg.isTyping ? (
                <p>
                  Typing
                  <span className="dot-blink">.</span>
                  <span className="dot-blink">.</span>
                  <span className="dot-blink">.</span>
                </p>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          ))}
        </div>

        <form className="chat-footer" id="chatFormInput" onSubmit={handleSubmit}>
          <input
            type="text"
            id="chatInputMessage"
            placeholder="Ask to regenerate API keys, disable notifications, or delete old audio..."
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
