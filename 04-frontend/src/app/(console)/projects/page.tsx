"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutGrid,
  LayoutList,
  Plus,
  Folder,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  FileAudio,
  Play,
  Volume2,
  Download,
  CreditCard,
} from "lucide-react";

interface ProjectItem {
  id: string | number;
  name: string;
  date: string;
  voice: string;
  lang: string;
  duration: string;
  status: "completed" | "draft" | "processing";
  chars: number;
  lastEdited: string;
  isStarred: boolean;
  folder: string;
  tags: string[];
}

export default function Projects() {
  const router = useRouter();

  // Projects State
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [subStatus, setSubStatus] = useState<any>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated && sessionData.token) {
            setSessionToken(sessionData.token);
            
            const projRes = await fetch("http://localhost:5000/api/projects", {
              headers: {
                "Authorization": `Bearer ${sessionData.token}`,
              },
            });
            if (projRes.ok) {
              const projData = await projRes.json();
              if (projData.success && projData.data) {
                const mapped = projData.data.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  date: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                  voice: "ElevenLabs Voice",
                  lang: "English (US)",
                  duration: "0:00",
                  status: (p.status || "Draft").toLowerCase() as any,
                  chars: p.charCount,
                  lastEdited: new Date(p.updatedAt).toLocaleDateString(),
                  isStarred: false,
                  folder: "All Projects",
                  tags: ["#AI"],
                  audioUrl: p.audioUrl ? `http://localhost:5000${p.audioUrl}` : null,
                  scriptText: p.scriptText,
                }));
                setProjects(mapped);
              }
            }

            const subRes = await fetch("http://localhost:5000/api/subscriptions/status", {
              headers: { "Authorization": `Bearer ${sessionData.token}` },
            });
            if (subRes.ok) {
              const subData = await subRes.json();
              if (subData.success) {
                setSubStatus(subData.data);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load projects", err);
        showToast("Error loading projects.", "error");
      }
    }
    loadProjects();
  }, []);

  // Toolbar & Filtering States
  const [searchTerm, setSearchTerm] = useState("");
  const [isGridView, setIsGridView] = useState(false);
  const [sortOption, setSortOption] = useState("edited-desc");
  const [activeFolder, setActiveFolder] = useState("all");
  const [activeTag, setActiveTag] = useState("all");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleStar = (id: string | number) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isStarred: !p.isStarred } : p))
    );
    const item = projects.find((p) => p.id === id);
    if (item) {
      showToast(`${item.name} ${!item.isStarred ? "starred" : "unstarred"}`);
    }
  };

  const handleDeleteProject = async (id: string | number) => {
    if (typeof id === "string") {
      try {
        const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${sessionToken}`,
          },
        });
        if (res.ok) {
          setProjects((prev) => prev.filter((p) => p.id !== id));
          showToast("Project deleted successfully.");
        } else {
          showToast("Failed to delete project on server.", "error");
        }
      } catch (err) {
        showToast("Network error deleting project.", "error");
      }
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast("Project deleted successfully.");
    }
  };

  const handleOpenProject = (p: any) => {
    if (p.status !== "processing") {
      if (typeof window !== "undefined") {
        if (p.audioUrl) {
          const downloadId = p.audioUrl.split("/").pop();
          if (downloadId) {
            localStorage.setItem("voicenova_last_generation_id", downloadId);
          }
        }
        localStorage.setItem("voicenova_studio_script", p.scriptText || "");
        localStorage.setItem("studioVoiceActor", p.voice);
      }
      router.push("/studio");
    } else {
      showToast("Project is currently synthesizing. Please wait.", "error");
    }
  };

  const handleNewProject = () => {
    router.push("/studio");
  };

  // Filter & Sort Logic
  const getFilteredProjects = () => {
    let result = [...projects];

    // Filter by Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.voice.toLowerCase().includes(term) ||
          p.lang.toLowerCase().includes(term)
      );
    }

    // Filter by Folder
    if (activeFolder !== "all") {
      result = result.filter((p) => p.folder === activeFolder);
    }

    // Filter by Tag
    if (activeTag !== "all") {
      result = result.filter((p) => p.tags.includes(activeTag));
    }

    // Sorting
    if (sortOption === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "chars-desc") {
      result.sort((a, b) => b.chars - a.chars);
    }

    return result;
  };

  const filteredProjects = getFilteredProjects();
  const starredProjects = projects.filter((p) => p.isStarred);

  return (
    <div className="dash-workspace">
      
      {/* Search Toolbar */}
      <div className="library-toolbar-row glass-panel" style={{ display: "flex", gap: "16px", marginBottom: "24px", padding: "16px", alignItems: "center" }}>
        <div className="search-bar-wrapper search-toolbar-width" style={{ flex: 1 }}>
          <Search className="search-icon" size={14} />
          <input
            type="text"
            placeholder="Search projects by name or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="toolbar-actions" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            className="btn btn-secondary btn-icon-only"
            onClick={() => setIsGridView(!isGridView)}
            title="Toggle Grid/List View"
          >
            {isGridView ? <LayoutList size={14} /> : <LayoutGrid size={14} />}
          </button>

          <div className="custom-select sort-select-width">
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="edited-desc">Last Edited (Newest)</option>
              <option value="name-asc">Project Name: A-Z</option>
              <option value="chars-desc">Character Count (High)</option>
            </select>
          </div>

          <button className="btn btn-primary btn-glow-hover" onClick={handleNewProject}>
            <Plus size={14} style={{ marginRight: "4px" }} /> <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Folder Row & Tags */}
      <div className="folders-tags-container" style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
        <div className="folders-row" style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "4px" }}>
          <button
            className={`folder-card glass-panel ${activeFolder === "all" ? "active" : ""}`}
            onClick={() => setActiveFolder("all")}
            style={{ minWidth: "150px" }}
          >
            <Folder className="folder-icon" size={16} />
            <div className="folder-meta">
              <span className="folder-name">All Projects</span>
              <span className="folder-count">{projects.length} Projects</span>
            </div>
          </button>

          <button
            className={`folder-card glass-panel ${activeFolder === "Marketing" ? "active" : ""}`}
            onClick={() => setActiveFolder("Marketing")}
            style={{ minWidth: "150px" }}
          >
            <Folder className="folder-icon" size={16} style={{ color: "var(--color-primary)" }} />
            <div className="folder-meta">
              <span className="folder-name">Marketing Clips</span>
              <span className="folder-count">{projects.filter((p) => p.folder === "Marketing").length} Projects</span>
            </div>
          </button>

          <button
            className={`folder-card glass-panel ${activeFolder === "Podcasts" ? "active" : ""}`}
            onClick={() => setActiveFolder("Podcasts")}
            style={{ minWidth: "150px" }}
          >
            <Folder className="folder-icon" size={16} style={{ color: "var(--color-secondary)" }} />
            <div className="folder-meta">
              <span className="folder-name">Podcast Intros</span>
              <span className="folder-count">{projects.filter((p) => p.folder === "Podcasts").length} Projects</span>
            </div>
          </button>

          <button
            className={`folder-card glass-panel ${activeFolder === "Bayan" ? "active" : ""}`}
            onClick={() => setActiveFolder("Bayan")}
            style={{ minWidth: "150px" }}
          >
            <Folder className="folder-icon" size={16} style={{ color: "var(--color-success)" }} />
            <div className="folder-meta">
              <span className="folder-name">Islamic Bayan</span>
              <span className="folder-count">{projects.filter((p) => p.folder === "Bayan").length} Projects</span>
            </div>
          </button>
        </div>

        {/* Tags lists */}
        <div className="tags-filter-bar" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="tags-label" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Tags:</span>
          <div className="tags-list" style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
            <button className={`tag-chip ${activeTag === "all" ? "active" : ""}`} onClick={() => setActiveTag("all")}>All</button>
            <button className={`tag-chip ${activeTag === "#Marketing" ? "active" : ""}`} onClick={() => setActiveTag("#Marketing")}>#Marketing</button>
            <button className={`tag-chip ${activeTag === "#Podcast" ? "active" : ""}`} onClick={() => setActiveTag("#Podcast")}>#Podcast</button>
            <button className={`tag-chip ${activeTag === "#Urdu" ? "active" : ""}`} onClick={() => setActiveTag("#Urdu")}>#Urdu</button>
            <button className={`tag-chip ${activeTag === "#Vortex" ? "active" : ""}`} onClick={() => setActiveTag("#Vortex")}>#Vortex</button>
          </div>
        </div>
      </div>

      {/* Projects layout structured */}
      <div className="library-workspace-layout" style={{ display: "flex", gap: "24px" }}>
        
        {/* Table or Cards catalog grid */}
        <div className="library-center-area" style={{ flex: 2.2 }}>
          {filteredProjects.length === 0 ? (
            <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
              No projects found. Create a new project to start!
            </div>
          ) : isGridView ? (
            <div className="projects-grid-view" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {filteredProjects.map((p) => (
                <div key={p.id} className="project-card glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <FileAudio size={20} style={{ color: "var(--color-primary)" }} />
                      <div>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-text)", cursor: "pointer" }} onClick={() => handleOpenProject(p)}>
                          {p.name}
                        </h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{p.date}</span>
                      </div>
                    </div>
                    <button onClick={() => handleToggleStar(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: p.isStarred ? "#FFCC00" : "var(--color-text-muted)" }}>
                      <Star size={14} fill={p.isStarred ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "12px 0" }}>
                    {p.tags.map((t) => (
                      <span key={t} className="tag-chip" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>{t}</span>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", borderTop: "1px solid rgba(255,255,255,0.03)", paddingTop: "12px", marginTop: "auto" }}>
                    <span>Voice: {p.voice}</span>
                    <button className="btn-text-link" onClick={() => handleOpenProject(p)}>Edit</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-container glass-panel">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Voice Used</th>
                    <th>Lang</th>
                    <th>Duration</th>
                    <th>Chars</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500, color: "var(--color-text)", cursor: "pointer" }} onClick={() => handleOpenProject(p)}>
                        {p.name}
                      </td>
                      <td>{p.voice}</td>
                      <td>{p.lang}</td>
                      <td>{p.duration}</td>
                      <td>{p.chars}</td>
                      <td>
                        <span className={`status-badge status-${p.status}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {(p as any).audioUrl && (
                            <>
                              <button className="table-action-btn" onClick={() => {
                                const audio = new Audio((p as any).audioUrl);
                                audio.play().catch(() => showToast("Could not play audio.", "error"));
                                showToast("Playing project audio...");
                              }}>
                                <Play size={12} fill="currentColor" style={{ color: "var(--color-success)" }} />
                              </button>
                              <button
                                className="table-action-btn"
                                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                onClick={() => {
                                  const audioUrlRaw: string = (p as any).audioUrl as string;
                                  const downloadUrl = audioUrlRaw.includes("?") ? audioUrlRaw + "&download=1" : audioUrlRaw + "?download=1";
                                  showToast("✓ Download started!");
                                  window.location.href = downloadUrl;
                                }}
                              >
                                <Download size={12} style={{ color: "var(--color-secondary)" }} />
                              </button>
                            </>
                          )}
                          <button className="table-action-btn" onClick={() => handleToggleStar(p.id)}>
                            <Star size={12} fill={p.isStarred ? "currentColor" : "none"} style={{ color: p.isStarred ? "#FFCC00" : "" }} />
                          </button>
                          <button className="table-action-btn" onClick={() => handleOpenProject(p)}>
                            <Edit size={12} />
                          </button>
                          <button className="table-action-btn color-red-btn" onClick={() => handleDeleteProject(p.id)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Starred Favorites Widget column */}
        <aside className="library-right-panel" style={{ flex: 0.9 }}>
          {subStatus && (
            <div className="sidebar-widget glass-panel" style={{ padding: "16px", marginBottom: "16px" }}>
              <h3 className="widget-title" style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.9rem", fontWeight: 600, marginBottom: "12px" }}>
                <CreditCard size={14} style={{ color: "var(--color-primary)" }} /> Plan & Usage
              </h3>
              <div style={{ fontSize: "0.85rem", color: "var(--color-text)", marginBottom: "8px" }}>
                <strong style={{ color: "var(--color-primary)" }}>{subStatus.plan}</strong>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "6px" }}>
                Characters Used: {subStatus.creditUsed.toLocaleString()} / {subStatus.creditLimit.toLocaleString()}
              </div>
              <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, (subStatus.creditUsed / subStatus.creditLimit) * 100)}%`, height: "100%", backgroundColor: "var(--color-primary)" }} />
              </div>
            </div>
          )}

          <div className="sidebar-widget glass-panel" style={{ padding: "16px" }}>
            <h3 className="widget-title" style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.9rem", fontWeight: 600, marginBottom: "12px" }}>
              <Star size={14} style={{ color: "#FFCC00" }} /> Starred Favorites
            </h3>
            <div className="mini-profile-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {starredProjects.length === 0 ? (
                <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textAlign: "center", padding: "12px 0" }}>
                  No starred favorites yet.
                </div>
              ) : (
                starredProjects.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileAudio size={14} style={{ color: "var(--color-secondary)" }} />
                      <span>{p.name.substring(0, 16)}{p.name.length > 16 ? "..." : ""}</span>
                    </div>
                    <button className="btn-text-link" onClick={() => handleOpenProject(p)}>Edit</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Toast notification overlay */}
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
