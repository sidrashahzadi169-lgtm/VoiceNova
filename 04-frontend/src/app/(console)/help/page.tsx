"use client";

import React, { useState } from "react";
import {
  Search,
  PlayCircle,
  CreditCard,
  Sliders,
  Code2,
  BookOpen,
  Video,
  Play,
  HelpCircle,
  ChevronDown,
  MessageSquare,
  Mail,
  Send,
} from "lucide-react";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export default function HelpCenter() {
  const [searchVal, setSearchVal] = useState("");

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Submit Support Ticket state
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketPriority, setTicketPriority] = useState("Medium");

  const [faqs, setFaqs] = useState<FaqItem[]>([
    {
      id: 1,
      question: "How do I clone my custom voice model?",
      answer: "Go to Voice Library, click Cloned Voices, and upload at least 5 minutes of high-quality, noise-free voice clips. The system generates your cloning settings automatically.",
    },
    {
      id: 2,
      question: "What is the API key requests quota limit?",
      answer: "Free plans have a limit of 10,000 monthly characters. Pro tiers allow up to 100,000 monthly characters. Enterprise options are fully customizable.",
    },
    {
      id: 3,
      question: "Can I refund invoice payments?",
      answer: "Yes, you can request invoice refunds within 14 days of purchase. Head to Billing and click Request Refund next to the invoice item.",
    },
  ]);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Support Ticket Registered! Ref: VN-${Math.floor(1000 + Math.random() * 9000)}`);
    setTicketSubject("");
    setTicketMessage("");
  };

  // Perform search filtering
  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchVal.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className="dash-workspace">
      
      {/* Search Banner Jumbotron */}
      <div className="upgrade-cta-banner glass-panel" style={{ textAlign: "center", padding: "48px 24px", position: "relative", overflow: "hidden", marginBottom: "28px" }}>
        <div className="profile-cover-glow" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: "350px", height: "350px" }} />
        
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", marginBottom: "8px", position: "relative", zIndex: 2 }}>How can we help you today?</h2>
        <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)", marginBottom: "24px", position: "relative", zIndex: 2 }}>Search our knowledge base for voice cloning setups, synthesis guides, or developer API integrations.</p>
        
        <div className="search-bar-wrapper" style={{ maxWidth: "560px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Search className="search-icon" size={14} />
          <input
            type="text"
            placeholder="Type keywords e.g., 'voice cloning', 'API authentication', 'refunds'..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            style={{ background: "rgba(15,23,42,0.8)" }}
          />
        </div>
      </div>

      {/* Categories stats cards */}
      <div className="dashboard-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <div className="stat-card glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <PlayCircle size={24} style={{ color: "var(--color-secondary)", marginBottom: "12px" }} />
          <span className="stat-num" style={{ fontSize: "0.95rem", margin: 0 }}>Getting Started</span>
          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "4px" }}>Platform guides, core interface tours.</span>
        </div>

        <div className="stat-card glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <CreditCard size={24} style={{ color: "var(--color-primary)", marginBottom: "12px" }} />
          <span className="stat-num" style={{ fontSize: "0.95rem", margin: 0 }}>Billing & Quotas</span>
          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "4px" }}>Invoices, Stripe, renewals.</span>
        </div>

        <div className="stat-card glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <Sliders size={24} style={{ color: "#22C55E", marginBottom: "12px" }} />
          <span className="stat-num" style={{ fontSize: "0.95rem", margin: 0 }}>Voice Studio</span>
          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "4px" }}>Sliders, stability, and tags.</span>
        </div>

        <div className="stat-card glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <Code2 size={24} style={{ color: "var(--color-secondary)", marginBottom: "12px" }} />
          <span className="stat-num" style={{ fontSize: "0.95rem", margin: 0 }}>Developer API</span>
          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "4px" }}>Auth headers, endpoints.</span>
        </div>
      </div>

      {/* Split columns */}
      <div className="library-workspace-layout" style={{ display: "flex", gap: "24px" }}>
        
        {/* Left Column content guides, FAQ */}
        <div className="library-center-area" style={{ flex: 2, display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Timeline stepper */}
          <div className="glass-panel settings-card-group" style={{ padding: "24px" }}>
            <h3 className="settings-group-title" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <BookOpen size={16} style={{ color: "var(--color-secondary)" }} /> Getting Started Guide
            </h3>
            
            <div className="timeline-stepper" style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>1</div>
                <div>
                  <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "white" }}>Configure Studio Settings</h4>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: "2px" }}>Go to the Voice Studio, select your voice actor, and set the pitch/stability slider variables.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>2</div>
                <div>
                  <h4 style={{ fontSize: "0.88rem", fontWeight: 700, color: "white" }}>Paste Script Text</h4>
                  <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: "2px" }}>Type or import text drafts (up to 10,000 characters), and insert pauses using <code>[pause: 0.5s]</code> syntax tags.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Videos */}
          <div className="glass-panel settings-card-group" style={{ padding: "24px" }}>
            <h3 className="settings-group-title" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <Video size={16} style={{ color: "var(--color-primary)" }} /> Video Tutorial Academy
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
              <div className="glass-panel" style={{ padding: "12px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.04)", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ position: "relative", width: "100%", height: "110px", background: "linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(0,194,255,0.15) 100%)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <button className="btn btn-primary btn-icon-only" style={{ borderRadius: "50%", width: "36px", height: "36px" }} onClick={() => showToast("Playing voice cloning tutorial video...")}><Play size={14} fill="currentColor" /></button>
                </div>
                <div>
                  <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "white" }}>Voice Cloning Workflow</h4>
                  <span style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>Duration: 4 mins • Basic Course</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "12px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.04)", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ position: "relative", width: "100%", height: "110px", background: "linear-gradient(135deg, rgba(0,194,255,0.15) 0%, rgba(34,197,94,0.1) 100%)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <button className="btn btn-primary btn-icon-only" style={{ borderRadius: "50%", width: "36px", height: "36px" }} onClick={() => showToast("Playing API tutorial video...")}><Play size={14} fill="currentColor" /></button>
                </div>
                <div>
                  <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "white" }}>Developer API Key Bindings</h4>
                  <span style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>Duration: 6 mins • Advanced Course</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="glass-panel settings-card-group" style={{ padding: "24px" }}>
            <h3 className="settings-group-title" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <HelpCircle size={16} style={{ color: "var(--color-secondary)" }} /> Frequently Asked Questions
            </h3>
            
            <div className="faq-accordion-list" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
              {filteredFaqs.length === 0 ? (
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textAlign: "center", padding: "12px" }}>
                  No FAQs matching keywords. Try other terms.
                </div>
              ) : (
                filteredFaqs.map((f) => (
                  <div
                    key={f.id}
                    className="faq-accordion-item glass-panel"
                    style={{ background: "rgba(255,255,255,0.01)", borderColor: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "8px", cursor: "pointer" }}
                    onClick={() => setActiveFaq(activeFaq === f.id ? null : f.id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ fontSize: "0.82rem", fontWeight: 700, color: "white" }}>{f.question}</h4>
                      <ChevronDown
                        size={14}
                        style={{
                          transform: activeFaq === f.id ? "rotate(180deg)" : "rotate(0)",
                          transition: "transform 0.3s ease",
                        }}
                      />
                    </div>
                    {activeFaq === f.id && (
                      <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: "10px" }}>
                        {f.answer}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column ticket submissions */}
        <aside className="library-right-panel" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Submit Support Ticket */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 600, display: "flex", gap: "6px", alignItems: "center", marginBottom: "16px" }}>
              <MessageSquare size={14} style={{ color: "var(--color-secondary)" }} /> Support Ticket
            </h3>
            
            <form onSubmit={handleTicketSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label htmlFor="ticketSub">Subject</label>
                <input
                  type="text"
                  id="ticketSub"
                  placeholder="e.g. Credit balance issue"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ticketMsg">Detailed Description</label>
                <textarea
                  id="ticketMsg"
                  rows={4}
                  placeholder="Describe your issue..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ticketPri">Priority</label>
                <div className="custom-select">
                  <select id="ticketPri" value={ticketPriority} onChange={(e) => setTicketPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-glow-hover">
                <Send size={12} style={{ marginRight: "4px" }} /> Submit Ticket
              </button>
            </form>
          </div>

          {/* Contact Direct support channels */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 600, display: "flex", gap: "6px", alignItems: "center", marginBottom: "12px" }}>
              <Mail size={14} style={{ color: "var(--color-primary)" }} /> Direct Support Channels
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              <span>Email: support@voicenova.ai</span>
              <span>Response SLA: &lt; 24 Hours</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Toast popup */}
      {toast && (
        <div
          className={`glass-panel toast toast-${toast.type}`}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "12px 24px",
            borderRadius: "8px",
            zIndex: 5000,
            borderLeft: `4px solid ${toast.type === "success" ? "var(--color-success)" : "var(--color-error)"}`,
            boxShadow: "var(--shadow-soft)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "slideIn 0.3s ease forwards",
          }}
        >
          <span style={{ fontWeight: 600 }}>{toast.type === "success" ? "✓" : "✗"}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
