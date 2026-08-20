"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Heart,
  Filter,
  Play,
  Volume2,
  Clock,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";

interface VoiceItem {
  name: string;
  gender: string;
  lang: string;
  accent: string;
  age: string;
  style: string;
  emotion: string;
  avatarClass: string;
  initials: string;
  desc: string;
  isFavorite: boolean;
  sample: string;
  popularity: number;
}

export default function VoiceLibrary() {
  const router = useRouter();

  // Master Voice Database
  const [voices, setVoices] = useState<VoiceItem[]>([
    {
      name: "Nova",
      gender: "female",
      lang: "en",
      accent: "us",
      age: "adult",
      style: "Narration",
      emotion: "calm",
      avatarClass: "avatar-nova",
      initials: "NV",
      desc: "Warm, professional and structured speech. Perfect for explainers, ads and business courses.",
      isFavorite: false,
      sample: "Hello! I am Nova. My voice is custom-calibrated for business explainers and video narrations.",
      popularity: 98,
    },
    {
      name: "Aero",
      gender: "male",
      lang: "en",
      accent: "uk",
      age: "adult",
      style: "Podcast",
      emotion: "serious",
      avatarClass: "avatar-aero",
      initials: "AR",
      desc: "Deep, engaging and authoritative. Designed for audiobooks, documentations and narrative reviews.",
      isFavorite: false,
      sample: "Hello there. Aero here. I speak in a narrative style, designed to grab attention instantly.",
      popularity: 95,
    },
    {
      name: "Lily",
      gender: "female",
      lang: "en",
      accent: "us",
      age: "young",
      style: "Storytelling",
      emotion: "energetic",
      avatarClass: "avatar-child",
      initials: "LY",
      desc: "High-pitched, bright and enthusiastic. Built for children storytelling, game characters and cartoons.",
      isFavorite: false,
      sample: "Hi! I'm Lily! I love telling fun fairy tale stories and educational guides!",
      popularity: 88,
    },
    {
      name: "Amina",
      gender: "female",
      lang: "ur",
      accent: "in",
      age: "adult",
      style: "Storytelling",
      emotion: "calm",
      avatarClass: "avatar-urdu",
      initials: "AM",
      desc: "Fluent, sweet and incredibly clear Urdu voiceover. Ideal for South Asian poetry, narrations and logs.",
      isFavorite: false,
      sample: "السلام علیکم۔ میں آمنہ ہوں۔ اردو شاعری اور کہانیاں سنانا میرا پسندیدہ کام ہے۔",
      popularity: 92,
    },
    {
      name: "Tareq",
      gender: "male",
      lang: "ar",
      accent: "us",
      age: "senior",
      style: "News",
      emotion: "serious",
      avatarClass: "avatar-arabic",
      initials: "TQ",
      desc: "Cinematic, formal and slow-paced Arabic orator. Tailored for documentary films and formal announcements.",
      isFavorite: false,
      sample: "مرحباً بكم. أنا طارق. أحدثكم بنبرة صوت سينمائية عميقة ومؤثرة.",
      popularity: 90,
    },
    {
      name: "Priya",
      gender: "female",
      lang: "hi",
      accent: "in",
      age: "adult",
      style: "Educational",
      emotion: "energetic",
      avatarClass: "avatar-nova",
      initials: "PY",
      desc: "Bright, precise and energetic Hindi announcer. Engineered for lectures, tutorials and reviews.",
      isFavorite: false,
      sample: "नमस्ते! मैं प्रिया हूँ। मेरी आवाज़ ई-लर्निंग और ट्यूटोरियल्स के लिए बिलकुल सही है.",
      popularity: 85,
    },
    {
      name: "Dev",
      gender: "male",
      lang: "hi",
      accent: "in",
      age: "adult",
      style: "Podcast",
      emotion: "calm",
      avatarClass: "avatar-aero",
      initials: "DV",
      desc: "Friendly, casual and deep Hindi speaker. Built for chat shows, podcasts and marketing campaigns.",
      isFavorite: false,
      sample: "नमस्कार, मैं देव हूँ। पॉडकास्ट और बातचीत वाले प्रोजेक्ट्स के लिए मेरी आवाज़ का उपयोग करें.",
      popularity: 82,
    },
    {
      name: "Can",
      gender: "male",
      lang: "tr",
      accent: "au",
      age: "adult",
      style: "Storytelling",
      emotion: "serious",
      avatarClass: "avatar-arabic",
      initials: "CN",
      desc: "Expressive Turkish narrator with dark, heavy vocal weight. Perfect for historic chronicles.",
      isFavorite: false,
      sample: "Merhaba. Ben Can. Tarihî belgeseller ve dramatik hikâyeler için sesimi tercih edebilirsiniz.",
      popularity: 79,
    },
    {
      name: "Yasemin",
      gender: "female",
      lang: "tr",
      accent: "uk",
      age: "adult",
      style: "News",
      emotion: "energetic",
      avatarClass: "avatar-child",
      initials: "YS",
      desc: "Clear, fluent and professional Turkish reporter voice. Engineered for daily news updates.",
      isFavorite: false,
      sample: "Merhaba. Ben Yasemin. Günlük haber bültenleri ve tanıtımlar için sesim hazır.",
      popularity: 76,
    },
  ]);

  // Toolbar & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [sortOption, setSortOption] = useState("featured");

  // Filters State
  const [filterLang, setFilterLang] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterAge, setFilterAge] = useState("all");
  const [filterEmotion, setFilterEmotion] = useState("all");
  const [filterAccent, setFilterAccent] = useState("all");

  // Category Tab state
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");

  // Speech Synth running preview states
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  // Global Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle favorite trigger
  const handleToggleFav = (name: string) => {
    setVoices((prev) =>
      prev.map((v) => (v.name === name ? { ...v, isFavorite: !v.isFavorite } : v))
    );
    const updated = voices.find((v) => v.name === name);
    if (updated) {
      showToast(`${name} ${!updated.isFavorite ? "added to" : "removed from"} favorites!`);
    }
  };

  // Run Speech synthesis sample preview
  const handlePlayPreview = (voice: VoiceItem) => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    if (!synth) {
      showToast("Speech preview is not supported on this browser.", "error");
      return;
    }

    if (synth.speaking) {
      synth.cancel();
      if (playingVoice === voice.name) {
        setPlayingVoice(null);
        return;
      }
    }

    setPlayingVoice(voice.name);
    const utterance = new SpeechSynthesisUtterance(voice.sample);
    const sysVoices = synth.getVoices();
    let sysVoice = null;

    if (voice.lang === "ur") {
      sysVoice = sysVoices.find((v) => v.lang.startsWith("ur") || v.lang.startsWith("hi"));
    } else if (voice.lang === "ar") {
      sysVoice = sysVoices.find((v) => v.lang.startsWith("ar"));
    } else {
      sysVoice = sysVoices.find((v) => v.lang.startsWith("en") && v.name.includes(voice.name === "Aero" ? "Male" : "Female"));
    }

    if (!sysVoice) {
      sysVoice = sysVoices.find((v) => v.lang.startsWith(voice.lang)) || sysVoices[0];
    }

    if (sysVoice) {
      utterance.voice = sysVoice;
    }

    utterance.onend = () => setPlayingVoice(null);
    utterance.onerror = () => setPlayingVoice(null);

    synth.speak(utterance);
    showToast(`Playing voice preview for ${voice.name}...`);
  };

  const handleUseVoice = (voice: VoiceItem) => {
    // Navigate to studio and preselect voice
    if (typeof window !== "undefined") {
      localStorage.setItem("studioVoiceActor", voice.name);
    }
    router.push("/studio");
  };

  const handleResetFilters = () => {
    setFilterLang("all");
    setFilterGender("all");
    setFilterAge("all");
    setFilterEmotion("all");
    setFilterAccent("all");
    setSearchTerm("");
    setActiveCategoryTab("all");
    setShowFavsOnly(false);
    showToast("Filters reset successfully!");
  };

  // Perform client-side filter and sorting logic
  const getFilteredVoices = () => {
    let result = [...voices];

    // Filter by text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(term) ||
          v.desc.toLowerCase().includes(term) ||
          v.style.toLowerCase().includes(term)
      );
    }

    // Filter by favorites
    if (showFavsOnly) {
      result = result.filter((v) => v.isFavorite);
    }

    // Filter by tab categories
    if (activeCategoryTab !== "all") {
      result = result.filter((v) => v.lang === activeCategoryTab);
    }

    // Filter by selects
    if (filterLang !== "all") {
      result = result.filter((v) => v.lang === filterLang);
    }
    if (filterGender !== "all") {
      result = result.filter((v) => v.gender === filterGender);
    }
    if (filterAge !== "all") {
      result = result.filter((v) => v.age === filterAge);
    }
    if (filterEmotion !== "all") {
      result = result.filter((v) => v.emotion === filterEmotion);
    }
    if (filterAccent !== "all") {
      result = result.filter((v) => v.accent === filterAccent);
    }

    // Sort options
    if (sortOption === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "popularity") {
      result.sort((a, b) => b.popularity - a.popularity);
    }

    return result;
  };

  const filteredVoices = getFilteredVoices();

  return (
    <div className="dash-workspace">
      
      {/* Toolbar row */}
      <div className="library-toolbar-row glass-panel" style={{ display: "flex", gap: "16px", marginBottom: "24px", padding: "16px", alignItems: "center" }}>
        <div className="search-bar-wrapper search-toolbar-width" style={{ flex: 1 }}>
          <Search className="search-icon" size={14} />
          <input
            type="text"
            id="librarySearchInput"
            placeholder="Search voices by name, accent, or style tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="toolbar-actions" style={{ display: "flex", gap: "12px" }}>
          <button
            className={`btn btn-secondary btn-icon-only ${showFavsOnly ? "active" : ""}`}
            style={{ borderColor: showFavsOnly ? "var(--color-primary)" : "" }}
            onClick={() => setShowFavsOnly(!showFavsOnly)}
            title="Show Favorites Only"
          >
            <Heart size={14} fill={showFavsOnly ? "currentColor" : "none"} style={{ color: showFavsOnly ? "#FF007F" : "" }} />
          </button>

          <div className="custom-select sort-select-width">
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="featured">Featured (Default)</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="popularity">Trending Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog body structure */}
      <div className="library-workspace-layout" style={{ display: "flex", gap: "24px" }}>
        
        {/* Left Filters column */}
        <aside className="library-filter-panel glass-panel" style={{ flex: 0.8, padding: "20px" }}>
          <h3 className="filter-panel-title" style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "1rem", fontWeight: 600, marginBottom: "20px" }}>
            <Filter size={16} style={{ color: "var(--color-secondary)" }} /> Filters
          </h3>

          <div className="filter-group" style={{ marginBottom: "14px" }}>
            <label htmlFor="filterLanguage">Language</label>
            <div className="custom-select">
              <select id="filterLanguage" value={filterLang} onChange={(e) => setFilterLang(e.target.value)}>
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="ur">Urdu</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
                <option value="tr">Turkish</option>
              </select>
            </div>
          </div>

          <div className="filter-group" style={{ marginBottom: "14px" }}>
            <label htmlFor="filterGender">Gender</label>
            <div className="custom-select">
              <select id="filterGender" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                <option value="all">All Genders</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>

          <div className="filter-group" style={{ marginBottom: "14px" }}>
            <label htmlFor="filterAge">Age Tier</label>
            <div className="custom-select">
              <select id="filterAge" value={filterAge} onChange={(e) => setFilterAge(e.target.value)}>
                <option value="all">All Ages</option>
                <option value="young">Young / Kid</option>
                <option value="adult">Adult</option>
                <option value="senior">Senior</option>
              </select>
            </div>
          </div>

          <div className="filter-group" style={{ marginBottom: "14px" }}>
            <label htmlFor="filterEmotion">Primary Emotion</label>
            <div className="custom-select">
              <select id="filterEmotion" value={filterEmotion} onChange={(e) => setFilterEmotion(e.target.value)}>
                <option value="all">All Emotions</option>
                <option value="calm">Calm</option>
                <option value="happy">Cheerful</option>
                <option value="serious">Serious</option>
                <option value="energetic">Energetic</option>
              </select>
            </div>
          </div>

          <div className="filter-group" style={{ marginBottom: "20px" }}>
            <label htmlFor="filterAccent">Accent</label>
            <div className="custom-select">
              <select id="filterAccent" value={filterAccent} onChange={(e) => setFilterAccent(e.target.value)}>
                <option value="all">All Accents</option>
                <option value="us">United States (US)</option>
                <option value="uk">United Kingdom (UK)</option>
                <option value="au">Australia (AU)</option>
                <option value="in">India (IN)</option>
              </select>
            </div>
          </div>

          <button className="btn btn-outline btn-full" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </aside>

        {/* Center Cards Grid */}
        <div className="library-center-area" style={{ flex: 2.2 }}>
          {/* Categories Tab Navigation */}
          <div className="category-tabs-bar" style={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
            {[
              { id: "all", label: "Featured Voices" },
              { id: "en", label: "English" },
              { id: "ur", label: "Urdu" },
              { id: "ar", label: "Arabic" },
              { id: "hi", label: "Hindi" },
              { id: "tr", label: "Turkish" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeCategoryTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveCategoryTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards catalog */}
          {filteredVoices.length === 0 ? (
            <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
              No voices found matching selected filter tags. Try resetting filters!
            </div>
          ) : (
            <div className="voices-cards-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {filteredVoices.map((v) => (
                <div key={v.name} className="voice-profile-card glass-panel" style={{ position: "relative" }}>
                  
                  {/* Heart button */}
                  <button
                    className="fav-voice-btn"
                    onClick={() => handleToggleFav(v.name)}
                    style={{ position: "absolute", right: "16px", top: "16px", background: "none", border: "none", cursor: "pointer", color: v.isFavorite ? "#FF007F" : "var(--color-text-muted)" }}
                  >
                    <Heart size={16} fill={v.isFavorite ? "currentColor" : "none"} />
                  </button>

                  <div className="voice-card-header-row">
                    <div className="voice-avatar" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}>
                      {v.initials}
                    </div>
                    <div className="voice-card-meta">
                      <h4 className="voice-name" style={{ fontSize: "1rem", fontWeight: 600 }}>{v.name}</h4>
                      <span className="voice-tag" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        {v.gender.toUpperCase()} • {v.style}
                      </span>
                    </div>
                  </div>
                  <p className="voice-card-description" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "12px 0", minHeight: "48px" }}>
                    {v.desc}
                  </p>
                  <div className="voice-card-actions" style={{ display: "flex", gap: "10px" }}>
                    <button
                      className="btn btn-secondary btn-sm preview-voice-btn"
                      onClick={() => handlePlayPreview(v)}
                    >
                      <Volume2 size={12} style={{ marginRight: "4px" }} />
                      <span>{playingVoice === v.name ? "Stop" : "Preview"}</span>
                    </button>
                    <button className="btn btn-outline btn-sm select-voice-btn" onClick={() => handleUseVoice(v)}>
                      Use Voice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="library-footer-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
            <button className="btn btn-secondary" onClick={() => showToast("Loading more catalog items...")}>
              Load More Voices
            </button>
            <div className="pagination-indicator" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Showing <span>{filteredVoices.length}</span> of 9 voices
            </div>
          </div>
        </div>

        {/* Right Widgets side column */}
        <aside className="library-right-panel" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Recently Used */}
          <div className="sidebar-widget glass-panel" style={{ padding: "16px" }}>
            <h3 className="widget-title" style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.9rem", fontWeight: 600, marginBottom: "12px" }}>
              <Clock size={14} style={{ color: "var(--color-secondary)" }} /> Recently Used
            </h3>
            <div className="mini-profile-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {voices.slice(0, 2).map((v) => (
                <div key={v.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8rem" }}>
                  <span>{v.name} ({v.gender})</span>
                  <button className="btn-text-link" onClick={() => handleUseVoice(v)} style={{ fontSize: "0.75rem" }}>Use</button>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended */}
          <div className="sidebar-widget glass-panel" style={{ padding: "16px" }}>
            <h3 className="widget-title" style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.9rem", fontWeight: 600, marginBottom: "12px" }}>
              <Sparkles size={14} style={{ color: "var(--color-primary)" }} /> Recommended
            </h3>
            <div className="mini-profile-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {voices.slice(2, 4).map((v) => (
                <div key={v.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8rem" }}>
                  <span>{v.name} - {v.style}</span>
                  <button className="btn-text-link" onClick={() => handleUseVoice(v)} style={{ fontSize: "0.75rem" }}>Use</button>
                </div>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div className="sidebar-widget glass-panel" style={{ padding: "16px" }}>
            <h3 className="widget-title" style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.9rem", fontWeight: 600, marginBottom: "12px" }}>
              <TrendingUp size={14} style={{ color: "var(--color-success)" }} /> Trending
            </h3>
            <div className="mini-profile-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {voices.slice(6, 9).map((v) => (
                <div key={v.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8rem" }}>
                  <span>{v.name} - Score {v.popularity}%</span>
                  <button className="btn-text-link" onClick={() => handleUseVoice(v)} style={{ fontSize: "0.75rem" }}>Use</button>
                </div>
              ))}
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
