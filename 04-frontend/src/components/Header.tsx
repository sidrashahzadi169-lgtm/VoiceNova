"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronRight, Sparkles, Bell } from "lucide-react";

interface HeaderProps {
  onSidebarToggle: () => void;
  onAssistantToggle: () => void;
  isAdmin?: boolean;
  user?: any;
}

export default function Header({
  onSidebarToggle,
  onAssistantToggle,
  isAdmin = false,
  user = null,
}: HeaderProps) {
  const pathname = usePathname();

  const getBreadcrumbName = () => {
    if (isAdmin) {
      return "Dashboard Overview";
    }

    switch (pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/studio":
        return "Generate Voice Studio";
      case "/library":
        return "Voice Library Catalog";
      case "/projects":
        return "Projects Catalog";
      case "/analytics":
        return "System Analytics";
      case "/billing":
        return "Billing & Invoices";
      case "/settings":
        return "Console Settings";
      case "/profile":
        return "User Profile Settings";
      case "/api":
        return "Developer API Console";
      case "/help":
        return "Help & Support";
      default:
        return "Console Workspace";
    }
  };

  return (
    <header className="dash-header">
      <div className="header-left">
        <button className="sidebar-toggle" id="sidebarToggleBtn" onClick={onSidebarToggle}>
          <Menu size={18} />
        </button>
        <div className="studio-breadcrumbs">
          <span className="bread-root">{isAdmin ? "Enterprise Admin" : "Studio"}</span>
          <ChevronRight size={12} className="bread-sep" />
          <span className="bread-active">{getBreadcrumbName()}</span>
        </div>
      </div>

      <div className="header-right">
        {!isAdmin && (
          <button className="btn btn-secondary assistant-btn" id="headerAssistantBtn" onClick={onAssistantToggle}>
            <Sparkles size={14} style={{ marginRight: "6px" }} />
            <span>AI Assistant</span>
          </button>
        )}

        {isAdmin && (
          <div
            className="admin-health-badge"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              background: "rgba(255,255,255,0.02)",
              padding: "6px 12px",
              borderRadius: "100px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span
              className="avatar-status-dot"
              style={{
                position: "static",
                display: "inline-block",
                background: "#22C55E",
                boxShadow: "0 0 8px rgba(34,197,94,0.4)",
                width: "8px",
                height: "8px",
              }}
            />
            <span>API Nodes Online</span>
          </div>
        )}

        <button className="icon-notification-btn" aria-label="Notifications" id="notificationBtn">
          <Bell size={18} />
          <span className="notification-indicator" />
        </button>

        <Link href={isAdmin ? "#" : "/profile"} className="user-avatar-wrapper" style={{ cursor: isAdmin ? "default" : "pointer" }}>
          <div
            className="avatar-ring"
            style={{
              background: isAdmin
                ? "linear-gradient(135deg, #FF007F 0%, #7F00FF 100%)"
                : "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
            }}
          >
            <span className="avatar-letter">
              {isAdmin ? "A" : (user && user.name ? user.name.charAt(0).toUpperCase() : "S")}
            </span>
            <span className="avatar-status-dot" />
          </div>
          <div className="user-profile-details">
            <span className="profile-name">
              {isAdmin ? "SuperAdmin" : (user && user.name ? user.name.split(" ")[0] : "Sidra")}
            </span>
            <span
              className="profile-plan-badge"
              style={
                isAdmin
                  ? {
                      background: "rgba(255, 0, 127, 0.1)",
                      color: "#FF007F",
                      borderColor: "rgba(255, 0, 127, 0.2)",
                    }
                  : undefined
              }
            >
              {isAdmin ? "Root" : (user && user.plan ? user.plan : "Pro")}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
