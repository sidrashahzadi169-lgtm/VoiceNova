"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Mic,
  CreditCard,
  BarChart3,
  MessageSquare,
  Cpu,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Search,
  Plus,
  Trash2,
  Edit,
  Star,
  CheckCircle,
  Menu,
} from "lucide-react";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  plan: string;
  registered: string;
  status: "Active" | "Suspended";
}

interface AdminVoice {
  id: number;
  name: string;
  gender: string;
  lang: string;
  accent: string;
  style: string;
  featured: boolean;
}

interface AdminPayment {
  invoice: string;
  client: string;
  date: string;
  amt: string;
  gateway: string;
  status: "Paid" | "Refund Pending" | "Refunded";
}

interface AdminTicket {
  id: string;
  client: string;
  subject: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "Resolved";
}

export default function AdminConsole() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "users" | "voices" | "payments" | "analytics" | "tickets" | "system" | "settings"
  >("dashboard");

  // Mobile sidebar
  const [sidebarActive, setSidebarActive] = useState(false);

  // Mocks Data States
  const [users, setUsers] = useState<AdminUser[]>([
    { id: 1, name: "Sidra Rehman", email: "sidra.rehman@voicenova.ai", plan: "Pro Plan", registered: "July 1, 2026", status: "Active" },
    { id: 2, name: "Alex Morgan", email: "alex.morgan@example.com", plan: "Free Plan", registered: "June 30, 2026", status: "Active" },
    { id: 3, name: "Sarah Jenkins", email: "sarah.j@agency.co", plan: "Enterprise", registered: "June 28, 2026", status: "Active" },
    { id: 4, name: "Omar Farooq", email: "omar.f@domain.pk", plan: "Pro Plan", registered: "June 25, 2026", status: "Suspended" },
    { id: 5, name: "Ayesha Khan", email: "ayesha@startup.io", plan: "Starter Plan", registered: "June 20, 2026", status: "Active" },
  ]);

  const [voices, setVoices] = useState<AdminVoice[]>([
    { id: 1, name: "Nova", gender: "Female", lang: "English", accent: "United States (US)", style: "Narration", featured: true },
    { id: 2, name: "Aero", gender: "Male", lang: "English", accent: "United Kingdom (UK)", style: "Podcast", featured: true },
    { id: 3, name: "Amina", gender: "Female", lang: "Urdu", accent: "Pakistan (PK)", style: "Storytelling", featured: false },
    { id: 4, name: "Tareq", gender: "Male", lang: "Arabic", accent: "United Arab Emirates (AE)", style: "News", featured: false },
  ]);

  const [payments, setPayments] = useState<AdminPayment[]>([
    { invoice: "INV-2026-006", client: "Sidra Rehman", date: "June 15, 2026", amt: "$29.00 USD", gateway: "Stripe", status: "Paid" },
    { invoice: "INV-2026-005", client: "Sarah Jenkins", date: "June 12, 2026", amt: "$99.00 USD", gateway: "Stripe", status: "Paid" },
    { invoice: "INV-2026-004", client: "Omar Farooq", date: "June 10, 2026", amt: "$29.00 USD", gateway: "PayPal", status: "Refund Pending" },
  ]);

  const [tickets, setTickets] = useState<AdminTicket[]>([
    { id: "T-101", client: "Omar Farooq", subject: "Invoice mismatch error on renewal", priority: "High", status: "Open" },
    { id: "T-102", client: "Alex Morgan", subject: "Custom cloning model training failed", priority: "Medium", status: "Open" },
    { id: "T-103", client: "Ayesha Khan", subject: "Incorrect rate calculation on credits upgrade", priority: "Low", status: "Resolved" },
  ]);

  // Search & Filter states
  const [userSearch, setUserSearch] = useState("");
  const [userPlanFilter, setUserPlanFilter] = useState("all");

  const [voiceSearch, setVoiceSearch] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // User Actions
  const handleToggleSuspend = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === "Active" ? "Suspended" : "Active";
          showToast(`User ${u.name} set to ${nextStatus}`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleChangePlan = (id: number) => {
    const nextPlan = prompt("Enter new plan type (Free Plan, Starter Plan, Pro Plan, Enterprise):");
    if (nextPlan && nextPlan.trim() !== "") {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, plan: nextPlan.trim() } : u))
      );
      showToast("User plan updated successfully.");
    }
  };

  const handleDeleteUser = (id: number) => {
    if (confirm("Permanently delete this user account?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast("User account deleted.");
    }
  };

  // Voice Actions
  const handleAddVoice = () => {
    const name = prompt("Enter Voice Actor Name:");
    if (!name) return;
    const lang = prompt("Enter language (e.g. English, Urdu):", "English");
    const gender = prompt("Enter gender (Male/Female):", "Female");

    const newVoice: AdminVoice = {
      id: Date.now(),
      name: name.trim(),
      gender: gender ? gender.trim() : "Female",
      lang: lang ? lang.trim() : "English",
      accent: "Global",
      style: "Narration",
      featured: false,
    };
    setVoices((prev) => [...prev, newVoice]);
    showToast("New voice added to library database.");
  };

  const handleToggleVoiceFeatured = (id: number) => {
    setVoices((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const nextFeatured = !v.featured;
          showToast(nextFeatured ? `${v.name} featured` : `${v.name} unfeatured`);
          return { ...v, featured: nextFeatured };
        }
        return v;
      })
    );
  };

  const handleDeleteVoice = (id: number) => {
    if (confirm("Remove voice from library catalog?")) {
      setVoices((prev) => prev.filter((v) => v.id !== id));
      showToast("Voice actor profile removed.");
    }
  };

  // Refund Payments
  const handleApproveRefund = (invoiceId: string) => {
    if (confirm("Approve and trigger refund transaction for invoice?")) {
      setPayments((prev) =>
        prev.map((p) => (p.invoice === invoiceId ? { ...p, status: "Refunded" } : p))
      );
      showToast("Refund transaction successfully approved!");
    }
  };

  // Ticket Actions
  const handleResolveTicket = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Resolved" } : t))
    );
    showToast("Ticket resolved successfully.");
  };

  // Render Functions
  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchPlan = userPlanFilter === "all" || u.plan.toLowerCase().includes(userPlanFilter.toLowerCase());
    return matchSearch && matchPlan;
  });

  const filteredVoices = voices.filter((v) =>
    v.name.toLowerCase().includes(voiceSearch.toLowerCase()) || v.lang.toLowerCase().includes(voiceSearch.toLowerCase())
  );

  return (
    <div className="dashboard-layout" style={{ minHeight: "100vh" }}>
      
      {/* Side Navigation for Admin */}
      <aside className={`dash-sidebar ${sidebarActive ? "active" : ""}`} id="dashSidebar">
        <div className="sidebar-brand-wrapper">
          <a href="#" className="logo">
            <span className="logo-text">NovaAdmin</span>
          </a>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Admin Console</div>
          <button className={`sidebar-link-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => { setActiveTab("dashboard"); setSidebarActive(false); }}>
            <LayoutDashboard size={14} /> <span>Dashboard</span>
          </button>
          <button className={`sidebar-link-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => { setActiveTab("users"); setSidebarActive(false); }}>
            <Users size={14} /> <span>Users</span>
          </button>
          <button className={`sidebar-link-btn ${activeTab === "voices" ? "active" : ""}`} onClick={() => { setActiveTab("voices"); setSidebarActive(false); }}>
            <Mic size={14} /> <span>AI Voices</span>
          </button>
          <button className={`sidebar-link-btn ${activeTab === "payments" ? "active" : ""}`} onClick={() => { setActiveTab("payments"); setSidebarActive(false); }}>
            <CreditCard size={14} /> <span>Payments</span>
          </button>
          <button className={`sidebar-link-btn ${activeTab === "analytics" ? "active" : ""}`} onClick={() => { setActiveTab("analytics"); setSidebarActive(false); }}>
            <BarChart3 size={14} /> <span>Analytics</span>
          </button>
          <button className={`sidebar-link-btn ${activeTab === "tickets" ? "active" : ""}`} onClick={() => { setActiveTab("tickets"); setSidebarActive(false); }}>
            <MessageSquare size={14} /> <span>Support Tickets</span>
          </button>
          <button className={`sidebar-link-btn ${activeTab === "system" ? "active" : ""}`} onClick={() => { setActiveTab("system"); setSidebarActive(false); }}>
            <Cpu size={14} /> <span>System Status</span>
          </button>
          <button className={`sidebar-link-btn ${activeTab === "settings" ? "active" : ""}`} onClick={() => { setActiveTab("settings"); setSidebarActive(false); }}>
            <SettingsIcon size={14} /> <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link-btn logout-link" onClick={() => router.push("/")}>
            <LogOut size={14} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="dash-main">
        
        {/* Top Header */}
        <header className="dash-header">
          <div className="header-left">
            <button className="sidebar-toggle" onClick={() => setSidebarActive(!sidebarActive)}>
              <Menu size={16} />
            </button>
            <div className="studio-breadcrumbs">
              <span className="bread-root">Enterprise Admin</span>
              <span className="bread-sep">/</span>
              <span className="bread-active" style={{ textTransform: "capitalize" }}>{activeTab} Overview</span>
            </div>
          </div>

          <div className="header-right" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div className="admin-health-badge" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", background: "rgba(255,255,255,0.02)", padding: "6px 12px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="avatar-status-dot" style={{ position: "static", display: "inline-block", background: "#22C55E", width: "8px", height: "8px" }}></span>
              <span>API Nodes Online</span>
            </div>
          </div>
        </header>

        {/* Scrollable workspace */}
        <div className="dash-workspace">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="dashboard-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <div className="stat-card glass-panel" style={{ padding: "20px" }}>
                  <span className="stat-label">Total Registered Users</span>
                  <span className="stat-num" style={{ fontSize: "1.6rem", fontWeight: 700 }}>1,245 Users</span>
                </div>
                <div className="stat-card glass-panel" style={{ padding: "20px" }}>
                  <span className="stat-label">Total SaaS Revenue</span>
                  <span className="stat-num" style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--color-secondary)" }}>$14,520 USD</span>
                </div>
                <div className="stat-card glass-panel" style={{ padding: "20px" }}>
                  <span className="stat-label">Active Support Tickets</span>
                  <span className="stat-num" style={{ fontSize: "1.6rem", fontWeight: 700 }}>{tickets.filter(t => t.status === "Open").length} Open</span>
                </div>
              </div>

              {/* Quick links */}
              <div className="glass-panel" style={{ padding: "24px" }}>
                <h3>Quick Administrative Shortcuts</h3>
                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  <button className="btn btn-primary" onClick={() => setActiveTab("users")}>Manage Users</button>
                  <button className="btn btn-secondary" onClick={() => setActiveTab("tickets")}>Check Help Desk Tickets</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === "users" && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", gap: "16px" }}>
                <div className="search-bar-wrapper" style={{ flex: 1 }}>
                  <Search className="search-icon" size={14} />
                  <input type="text" placeholder="Search user accounts by name or email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                </div>
                <div className="custom-select" style={{ width: "160px" }}>
                  <select value={userPlanFilter} onChange={(e) => setUserPlanFilter(e.target.value)}>
                    <option value="all">All Plans</option>
                    <option value="free">Free Plan</option>
                    <option value="starter">Starter Plan</option>
                    <option value="pro">Pro Plan</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="table-container">
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Billing Level</th>
                      <th>Registered</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.plan}</td>
                        <td>{u.registered}</td>
                        <td>
                          <span className={`status-badge status-${u.status === "Active" ? "completed" : "draft"}`}>{u.status}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button className="btn btn-outline btn-xs" onClick={() => handleToggleSuspend(u.id)}>{u.status === "Active" ? "Suspend" : "Activate"}</button>
                            <button className="btn btn-secondary btn-xs" onClick={() => handleChangePlan(u.id)}>Plan</button>
                            <button className="table-action-btn color-red-btn" onClick={() => handleDeleteUser(u.id)}><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: AI VOICES */}
          {activeTab === "voices" && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", gap: "16px" }}>
                <div className="search-bar-wrapper" style={{ flex: 1 }}>
                  <Search className="search-icon" size={14} />
                  <input type="text" placeholder="Search voices by name or language..." value={voiceSearch} onChange={(e) => setVoiceSearch(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={handleAddVoice}><Plus size={14} style={{ marginRight: "4px" }} /> Add Voice</button>
              </div>

              <div className="table-container">
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Voice Name</th>
                      <th>Gender</th>
                      <th>Language</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVoices.map((v) => (
                      <tr key={v.id}>
                        <td><div className="voice-avatar" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))", width: "24px", height: "24px", fontSize: "0.6rem" }}>{v.name.substring(0, 2).toUpperCase()}</div></td>
                        <td><strong>{v.name}</strong></td>
                        <td>{v.gender}</td>
                        <td>{v.lang}</td>
                        <td>
                          <button onClick={() => handleToggleVoiceFeatured(v.id)} style={{ background: "none", border: "none", cursor: "pointer", color: v.featured ? "#FFCC00" : "var(--color-text-muted)" }}>
                            <Star size={12} fill={v.featured ? "currentColor" : "none"} />
                          </button>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button className="table-action-btn" onClick={() => { const nn = prompt("Rename voice actor:", v.name); if (nn) { setVoices(prev => prev.map(item => item.id === v.id ? { ...item, name: nn } : item)); showToast("Voice name updated."); } }}><Edit size={12} /></button>
                            <button className="table-action-btn color-red-btn" onClick={() => handleDeleteVoice(v.id)}><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <div className="table-container">
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Client Name</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Gateway</th>
                      <th>Status</th>
                      <th>Refund Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.invoice}>
                        <td><strong>{p.invoice}</strong></td>
                        <td>{p.client}</td>
                        <td>{p.date}</td>
                        <td>{p.amt}</td>
                        <td>{p.gateway}</td>
                        <td><span className="status-pill status-pill-success">{p.status}</span></td>
                        <td>
                          {p.status === "Refund Pending" ? (
                            <button className="btn btn-outline btn-xs" onClick={() => handleApproveRefund(p.invoice)}>Approve Refund</button>
                          ) : (
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <h3>Enterprise System Telemetry Analytics</h3>
              <div style={{ height: "200px", width: "100%", background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "16px", border: "1px solid rgba(255,255,255,0.04)", marginTop: "20px" }}>
                <svg viewBox="0 0 500 150" width="100%" height="100%">
                  <path d="M0,120 Q50,90 100,100 T200,60 T300,70 T400,30 T500,15" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0,130 Q50,110 100,120 T200,80 T300,90 T400,50 T500,25" fill="none" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          )}

          {/* TAB 6: SUPPORT TICKETS */}
          {activeTab === "tickets" && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <div className="table-container">
                <table className="projects-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Client Name</th>
                      <th>Subject</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t.id}>
                        <td><strong>{t.id}</strong></td>
                        <td>{t.client}</td>
                        <td>{t.subject}</td>
                        <td>{t.priority}</td>
                        <td>
                          <span className={`status-badge status-${t.status === "Open" ? "draft" : "completed"}`}>{t.status}</span>
                        </td>
                        <td>
                          {t.status === "Open" && (
                            <button className="btn btn-outline btn-xs" onClick={() => handleResolveTicket(t.id)}>Resolve</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: SYSTEM STATUS */}
          {activeTab === "system" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="glass-panel" style={{ padding: "24px" }}>
                <h3>Compute Nodes Core Load</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                      <span>Core Node 1 (Speech Synthesis Engine)</span>
                      <span>42% Load</span>
                    </div>
                    <div className="progress-bar-track" style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                      <div style={{ height: "100%", width: "42%", background: "var(--color-secondary)", borderRadius: "3px" }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                      <span>Core Node 2 (Voice Training Model Grid)</span>
                      <span>85% Load</span>
                    </div>
                    <div className="progress-bar-track" style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                      <div style={{ height: "100%", width: "85%", background: "var(--color-primary)", borderRadius: "3px" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === "settings" && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <h3>Global Admin Panel Settings</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block" }}>Platform Maintenance Mode</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Locks user login panels and freezes API routing.</span>
                  </div>
                  <label className="pricing-switch">
                    <input type="checkbox" onChange={(e) => showToast(`Maintenance mode ${e.target.checked ? "activated" : "deactivated"}`)} />
                    <span className="pricing-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

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
