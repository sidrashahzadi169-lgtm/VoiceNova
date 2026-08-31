"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mic,
  Users,
  FolderOpen,
  BarChart3,
  DownloadCloud,
  Code2,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  X,
  MessageSquare,
  Cpu,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onLogout?: (e: React.MouseEvent) => void;
}

export default function Sidebar({ isOpen, onClose, isAdmin = false, onLogout }: SidebarProps) {
  const pathname = usePathname();

  const userNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Generate Voice", href: "/studio", icon: Mic },
    { label: "Voice Library", href: "/library", icon: Users },
    { label: "My Projects", href: "/projects", icon: FolderOpen },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Downloads", href: "/downloads", icon: DownloadCloud },
  ];

  const userAccountItems = [
    { label: "API Management", href: "/api", icon: Code2 },
    { label: "Billing", href: "/billing", icon: CreditCard },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Help & Support", href: "/help", icon: HelpCircle },
  ];

  const adminNavItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "#", icon: Users },
    { label: "AI Voices", href: "#", icon: Mic },
    { label: "Payments", href: "#", icon: CreditCard },
    { label: "Analytics", href: "#", icon: BarChart3 },
    { label: "Support Tickets", href: "#", icon: MessageSquare },
    { label: "System Status", href: "#", icon: Cpu },
  ];

  const adminAccountItems = [
    { label: "Settings", href: "#", icon: Settings },
  ];

  // Always include Admin Panel link in account items if isAdmin is true or on admin page
  const extendedUserAccountItems = [
    ...userAccountItems,
    ...(isAdmin ? [{ label: "Admin Panel", href: "/admin", icon: Cpu }] : [])
  ];

  const extendedAdminAccountItems = [
    ...adminAccountItems,
    { label: "Back to Studio", href: "/dashboard", icon: LayoutDashboard }
  ];

  const navItems = pathname.startsWith('/admin') ? adminNavItems : userNavItems;
  const accountItems = pathname.startsWith('/admin') ? extendedAdminAccountItems : extendedUserAccountItems;

  const handleLinkClick = () => {
    // Automatically close sidebar on link click in mobile view
    onClose();
  };

  return (
    <aside className={`dash-sidebar ${isOpen ? "active" : ""}`} id="dashSidebar">
      <div className="sidebar-brand-wrapper">
        <Link href="/" className="logo" onClick={handleLinkClick}>
          <div className="logo-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 20V20C8 13.3726 13.3726 8 20 8V8C26.6274 8 32 13.3726 32 20V20C32 26.6274 26.6274 32 20 32V32C13.3726 32 8 26.6274 8 20Z"
                stroke="url(#paint0_linear)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path d="M14 20V20" stroke="url(#paint1_linear)" strokeWidth="4" strokeLinecap="round" />
              <path d="M20 13V27" stroke="url(#paint2_linear)" strokeWidth="4" strokeLinecap="round" />
              <path d="M26 17V23" stroke="url(#paint3_linear)" strokeWidth="4" strokeLinecap="round" />
              <defs>
                <linearGradient id="paint0_linear" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6C63FF" />
                  <stop offset="1" stopColor="#00C2FF" />
                </linearGradient>
                <linearGradient id="paint1_linear" x1="14" y1="18" x2="14" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6C63FF" />
                  <stop offset="1" stopColor="#00C2FF" />
                </linearGradient>
                <linearGradient id="paint2_linear" x1="20" y1="13" x2="20" y2="27" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6C63FF" />
                  <stop offset="1" stopColor="#00C2FF" />
                </linearGradient>
                <linearGradient id="paint3_linear" x1="26" y1="17" x2="26" y2="23" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6C63FF" />
                  <stop offset="1" stopColor="#00C2FF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">{isAdmin ? "NovaAdmin" : "VoiceNova"}</span>
        </Link>
        <button className="sidebar-close-btn" id="sidebarCloseBtn" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">{isAdmin ? "Admin Console" : "Studio"}</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              onClick={handleLinkClick}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="nav-section-title">{isAdmin ? "Settings" : "Developer & Account"}</div>
        {accountItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              onClick={handleLinkClick}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link href="/" className="sidebar-link logout-link" onClick={onLogout || handleLinkClick}>
          <LogOut size={18} />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
