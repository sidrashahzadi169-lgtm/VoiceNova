"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  BarChart3,
  Download,
  Activity,
  Calendar,
} from "lucide-react";

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30"); // days
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated && sessionData.token) {
            
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - parseInt(dateRange, 10));

            const res = await fetch(`https://voice-nova-sooty.vercel.app/api/analytics/usage?start=${startDate.toISOString().split("T")[0]}&end=${endDate.toISOString().split("T")[0]}`, {
              headers: { "Authorization": `Bearer ${sessionData.token}` },
            });
            
            if (res.ok) {
              const resData = await res.json();
              if (resData.success) {
                setData(resData.data);
              }
            }
          }
        }
      } catch (err) {
        showToast("Error loading analytics data.", "error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [dateRange]);

  const exportCSV = () => {
    if (!data || !data.charts?.dailyUsage) return;
    
    const headers = ["Date", "Characters Used"];
    const rows = data.charts.dailyUsage.map((d: any) => `${d.date},${d.chars}`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `voicenova_usage_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV exported successfully!");
  };

  // Helper for generating dynamic SVG chart path based on actual data
  const generateChartPath = () => {
    if (!data?.charts?.dailyUsage || data.charts.dailyUsage.length === 0) return "";
    const daily = data.charts.dailyUsage;
    const maxChars = Math.max(...daily.map((d: any) => d.chars), 100);
    
    const width = 500;
    const height = 150;
    
    const points = daily.map((d: any, index: number) => {
      const x = (index / (daily.length - 1 || 1)) * width;
      const y = height - (d.chars / maxChars) * (height - 20) - 10;
      return `${x},${y}`;
    });

    return `M0,150 L${points[0]} ` + points.map((p: string) => `L${p}`).join(" ") + ` L${width},150 Z`;
  };

  const generateLinePath = () => {
    if (!data?.charts?.dailyUsage || data.charts.dailyUsage.length === 0) return "";
    const daily = data.charts.dailyUsage;
    const maxChars = Math.max(...daily.map((d: any) => d.chars), 100);
    
    const width = 500;
    const height = 150;
    
    const points = daily.map((d: any, index: number) => {
      const x = (index / (daily.length - 1 || 1)) * width;
      const y = height - (d.chars / maxChars) * (height - 20) - 10;
      return `${x},${y}`;
    });

    return `M${points[0]} ` + points.map((p: string) => `L${p}`).join(" ");
  };

  const getPoints = () => {
    if (!data?.charts?.dailyUsage || data.charts.dailyUsage.length === 0) return [];
    const daily = data.charts.dailyUsage;
    const maxChars = Math.max(...daily.map((d: any) => d.chars), 100);
    const width = 500;
    const height = 150;
    
    return daily.map((d: any, index: number) => {
      const x = (index / (daily.length - 1 || 1)) * width;
      const y = height - (d.chars / maxChars) * (height - 20) - 10;
      return { cx: x, cy: y };
    });
  };

  return (
    <div className="dash-workspace">
      
      {/* Filters Row */}
      <div className="library-toolbar-row glass-panel" style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", padding: "16px", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.2rem", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <BarChart3 size={20} style={{ color: "var(--color-primary)" }} /> Usage Analytics
        </h2>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div className="custom-select sort-select-width" style={{ minWidth: "150px" }}>
            <Calendar size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", pointerEvents: "none" }} />
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{ paddingLeft: "32px" }}>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={exportCSV} disabled={!data || loading}>
            <Download size={14} style={{ marginRight: "6px" }} /> Export CSV
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--color-text-muted)" }}>Loading analytics...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="dashboard-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            <div className="stat-card glass-panel" style={{ padding: "20px" }}>
              <span className="stat-label" style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Total Characters Used</span>
              <span className="stat-num" style={{ display: "block", fontSize: "1.4rem", fontWeight: 700, marginTop: "8px" }}>
                {data?.metrics?.totalCharsUsedInPeriod?.toLocaleString() || 0}
              </span>
            </div>

            <div className="stat-card glass-panel" style={{ padding: "20px" }}>
              <span className="stat-label" style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Total Generations</span>
              <span className="stat-num" style={{ display: "block", fontSize: "1.4rem", fontWeight: 700, marginTop: "8px", color: "var(--color-success)" }}>
                {data?.metrics?.totalGenerations?.toLocaleString() || 0}
              </span>
            </div>

            <div className="stat-card glass-panel" style={{ padding: "20px" }}>
              <span className="stat-label" style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Remaining Credits</span>
              <span className="stat-num" style={{ display: "block", fontSize: "1.4rem", fontWeight: 700, marginTop: "8px" }}>
                {data?.subscription?.remaining?.toLocaleString() || 0}
              </span>
            </div>

            <div className="stat-card glass-panel" style={{ padding: "20px" }}>
              <span className="stat-label" style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Active Plan</span>
              <span className="stat-num" style={{ display: "block", fontSize: "1.4rem", fontWeight: 700, marginTop: "8px", color: "var(--color-secondary)" }}>
                {data?.subscription?.plan || "None"}
              </span>
            </div>
          </div>

          {/* Split Workspace Layout */}
          <div className="library-workspace-layout" style={{ display: "flex", gap: "24px" }}>
            
            {/* Left Column Charts */}
            <div className="library-center-area" style={{ flex: 1.8 }}>
              
              {/* Daily Usage Chart */}
              <div className="glass-panel settings-card-group" style={{ padding: "24px", marginBottom: "24px" }}>
                <h3 className="settings-group-title" style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "20px" }}>
                  <TrendingUp size={16} style={{ color: "var(--color-primary)" }} /> Daily Character Usage
                </h3>

                <div style={{ height: "180px", width: "100%", background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "16px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <svg viewBox="0 0 500 150" width="100%" height="100%" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {data?.charts?.dailyUsage?.length > 0 && (
                      <>
                        <path d={generateChartPath()} fill="url(#chart-glow)" />
                        <path d={generateLinePath()} fill="none" stroke="var(--color-secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        {getPoints().map((pt: any, i: number) => (
                          <circle key={i} cx={pt.cx} cy={pt.cy} r="3" fill="var(--color-secondary)" stroke="#fff" strokeWidth="1" />
                        ))}
                      </>
                    )}
                  </svg>
                </div>
              </div>

              {/* Voice Generation Trends (Top Voices) */}
              <div className="glass-panel settings-card-group" style={{ padding: "24px" }}>
                <h3 className="settings-group-title" style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "20px" }}>
                  <BarChart3 size={16} style={{ color: "var(--color-secondary)" }} /> Top Voices Used
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {data?.charts?.voiceTrends?.length > 0 ? (
                    data.charts.voiceTrends.map((v: any, index: number) => {
                      const max = data.charts.voiceTrends[0].count || 1;
                      const percentage = (v.count / max) * 100;
                      return (
                        <div key={index}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                            <span>{v.voice}</span>
                            <span style={{ color: "var(--color-text)", fontWeight: 500 }}>{v.count} gens</span>
                          </div>
                          <div className="progress-bar-track" style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                            <div style={{ height: "100%", width: `${percentage}%`, background: "var(--color-secondary)", borderRadius: "3px" }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>No voice generation data available.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column Telemetry Logs */}
            <div className="library-right-panel" style={{ flex: 1.2 }}>
              <div className="glass-panel settings-card-group" style={{ padding: "24px", display: "flex", flexDirection: "column", height: "100%" }}>
                <h3 className="settings-group-title" style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "20px" }}>
                  <Activity size={16} style={{ color: "var(--color-secondary)" }} /> Recent Activity
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                  {data?.activityLogs?.length > 0 ? (
                    data.activityLogs.map((log: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          padding: "10px",
                          background: "rgba(255,255,255,0.01)",
                          border: "1px solid rgba(255,255,255,0.03)",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 600, color: "var(--color-secondary)" }}>{log.type}</span>
                          <span style={{ color: "var(--color-text-muted)", fontSize: "0.7rem" }}>{log.date} {log.time}</span>
                        </div>
                        <span style={{ color: "var(--color-text-muted)" }}>{log.details}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>No recent activity.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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

