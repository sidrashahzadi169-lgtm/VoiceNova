"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Volume2,
  Library,
  Mic,
  Globe,
  Zap,
  Code,
  FileText,
  Smile,
  Sparkles,
  Download,
  ChevronDown,
  Check,
  Play,
  CheckCircle,
  Terminal,
  ArrowRight,
  Lock,
  Mail,
  User,
  X,
  Menu,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  // Navigation mobile toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals Visibility
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // Forms inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Pricing Toggle (Monthly vs Annual)
  const [isAnnual, setIsAnnual] = useState(true);

  // FAQ Accordion Active Item Index
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);

  // Studio Interactive Mockup states
  const [speechText, setSpeechText] = useState(
    "Welcome to VoiceNova. Experience the future of neural voice synthesis. Type your text here and click generate to hear me speak."
  );
  const [chosenVoice, setChosenVoice] = useState("Nova");
  const [speedVal, setSpeedVal] = useState(1.0);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const waveOffsetRef = useRef<number>(0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Global Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sticky Header Scroll handler
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Web Speech Synth API Ref
  const getSpeechSynth = () => {
    if (typeof window !== "undefined") {
      return window.speechSynthesis;
    }
    return null;
  };

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = canvas.parentElement?.clientHeight || 120;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.lineWidth = 2;

      let mode: "idle" | "generating" | "playing" = "idle";
      if (isSynthesizing) mode = "generating";
      if (isPlaying) mode = "playing";

      if (mode === "idle") {
        ctx.strokeStyle = "rgba(108, 99, 255, 0.2)";
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * 0.05 + waveOffsetRef.current) * 1.5;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        waveOffsetRef.current += 0.02;
      } else if (mode === "generating") {
        ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        for (let x = 0; x < width; x++) {
          const amp = Math.sin(x * 0.005) * 12;
          const y = centerY + Math.sin(x * 0.08 + waveOffsetRef.current) * amp;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        waveOffsetRef.current += 0.2;
      } else if (mode === "playing") {
        waveOffsetRef.current += 0.15;
        const waves = [
          { amp: 22, freq: 0.02, color: "rgba(108, 99, 255, 0.7)" },
          { amp: 14, freq: 0.035, color: "rgba(0, 194, 255, 0.6)" },
          { amp: 8, freq: 0.05, color: "rgba(255, 255, 255, 0.3)" },
        ];

        const volumeModulation = Math.sin(waveOffsetRef.current * 0.05) * 0.5 + 0.5;
        const breathModulation = Math.max(0.1, Math.sin(waveOffsetRef.current * 0.15));

        waves.forEach((wave) => {
          ctx.strokeStyle = wave.color;
          ctx.beginPath();
          ctx.moveTo(0, centerY);
          for (let x = 0; x < width; x++) {
            const envelope = Math.sin((x / width) * Math.PI);
            const speechPattern = Math.sin(x * 0.01) * 0.4 + 0.6;
            const finalAmp = wave.amp * envelope * volumeModulation * breathModulation * speechPattern;
            const y = centerY + Math.sin(x * wave.freq + waveOffsetRef.current) * finalAmp;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSynthesizing, isPlaying]);

  // Handle Speech finish callbacks
  const handleSynthesisFinished = () => {
    setIsSynthesizing(false);
    setIsPlaying(false);

    if (!audioUrl) {
      const mockAudioBlob = new Blob([new Uint8Array(44)], { type: "audio/wav" });
      setAudioUrl(URL.createObjectURL(mockAudioBlob));
    }
  };

  // Run Speech synthesis
  const handleGenerateSpeech = () => {
    const text = speechText.trim();
    if (!text) {
      showToast("Please enter script text first!", "error");
      return;
    }

    const synth = getSpeechSynth();

    if (synth && synth.speaking) {
      synth.cancel();
      if (isPlaying) {
        handleSynthesisFinished();
        return;
      }
    }

    setIsSynthesizing(true);
    setAudioUrl(null);

    // Simulate synthesis latency to feel like real AI computation
    setTimeout(() => {
      setIsSynthesizing(false);
      setIsPlaying(true);

      if (synth) {
        speechUtteranceRef.current = new SpeechSynthesisUtterance(text);
        speechUtteranceRef.current.rate = speedVal;

        const voices = synth.getVoices();
        let selectedVoice = null;

        // Simple gender fallback match
        if (chosenVoice === "Nova" || chosenVoice === "Solas") {
          selectedVoice = voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.includes("Female") || v.name.includes("Zira") || v.name.includes("Google US English"))
          );
        } else if (chosenVoice === "Aero" || chosenVoice === "Vortex") {
          selectedVoice = voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.includes("Male") || v.name.includes("David") || v.name.includes("Google UK English"))
          );
        }

        if (!selectedVoice) {
          selectedVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0];
        }

        if (selectedVoice) {
          speechUtteranceRef.current.voice = selectedVoice;
        }

        speechUtteranceRef.current.onend = () => {
          handleSynthesisFinished();
        };

        speechUtteranceRef.current.onerror = (e) => {
          console.error("SpeechSynthesis error:", e);
          handleSynthesisFinished();
        };

        synth.speak(speechUtteranceRef.current);
      } else {
        // Fallback simulation if SpeechSynthesis API is disabled or unsupported
        setTimeout(() => {
          handleSynthesisFinished();
        }, 4000);
      }
    }, 900);
  };

  // Download synthesised audio
  const handleDownloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `VoiceNova_${chosenVoice}_Speech.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Audio studio file downloaded successfully!");
  };

  // Auth form handlers redirects to console dashboard
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      setIsLoginOpen(false);
      localStorage.setItem("userEmail", loginEmail);
      router.push("/dashboard");
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupName && signupEmail && signupPassword) {
      setIsSignupOpen(false);
      localStorage.setItem("userFullName", signupName);
      localStorage.setItem("userEmail", signupEmail);
      router.push("/dashboard");
    }
  };

  const faqs = [
    {
      q: "How do I clone my custom voice model?",
      a: "Go to Voice Library, click Cloned Voices, and upload at least 5 minutes of high-quality, noise-free voice clips. The system generates your cloning settings automatically.",
    },
    {
      q: "What is the API key requests quota limit?",
      a: "Free plans have a limit of 1,000 monthly requests. Pro tiers allow up to 50,000 monthly requests. Enterprise options are fully customizable.",
    },
    {
      q: "Can I refund invoice payments?",
      a: "Yes, you can request invoice refunds within 14 days of purchase. Head to Billing and click Request Refund next to the invoice item.",
    },
  ];

  return (
    <div className="landing-body-wrapper" style={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
      
      {/* Ambient background glows */}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-glow bg-glow-3" />

      {/* Sticky Navbar */}
      <header className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`} id="navbar">
        <div className="container navbar-container">
          <Link href="/" className="logo">
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
                  <linearGradient id="paint1_linear" x1="14" y1="20" x2="14" y2="20" gradientUnits="userSpaceOnUse">
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
            <span className="logo-text">VoiceNova</span>
          </Link>

          <nav className={`nav-menu ${isMobileMenuOpen ? "active" : ""}`} id="navMenu">
            <a href="#hero" className="nav-link active" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </a>
            <a href="#features" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Features
            </a>
            <a href="#pricing" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Pricing
            </a>
            <a href="#api" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              API
            </a>
            <a href="#contact" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Contact
            </a>
          </nav>

          <div className="nav-actions">
            <button className="btn btn-text" onClick={() => setIsLoginOpen(true)}>
              Login
            </button>
            <button className="btn btn-primary" onClick={() => setIsSignupOpen(true)}>
              Get Started
            </button>

            <button
              className="mobile-toggle"
              id="mobileToggle"
              aria-label="Toggle Menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section hero-section" id="hero" style={{ paddingTop: "140px" }}>
        <div className="container hero-container">
          <div className="hero-content">
            <div className="badge hero-badge">
              <span className="badge-icon">✨</span>
              <span className="badge-text">VoiceNova 2.0 is Live</span>
            </div>
            <h1 className="hero-title">
              Generate Human-Like <span className="gradient-text">AI Voices</span> in Seconds
            </h1>
            <p className="hero-desc">
              Transform text into crystal-clear, emotional, and expressive speech. Clone any voice with just 10 seconds of
              audio, or choose from our library of 200+ studio-grade voices.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-lg btn-glow-hover" onClick={() => setIsSignupOpen(true)}>
                Start Free
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => showToast("Simulating product demo video playback...")}>
                <Play size={14} className="btn-icon" style={{ fill: "currentColor", marginRight: "6px" }} /> Watch Demo
              </button>
            </div>
            <div className="hero-features-list">
              <div className="hero-feature-item">
                <Check size={14} className="check-icon" />
                <span>No credit card required</span>
              </div>
              <div className="hero-feature-item">
                <Check size={14} className="check-icon" />
                <span>10,000 free characters</span>
              </div>
              <div className="hero-feature-item">
                <Check size={14} className="check-icon" />
                <span>Commercial usage</span>
              </div>
            </div>
          </div>

          <div className="hero-graphic">
            <div className="dashboard-mockup glass-panel">
              <div className="dashboard-header">
                <div className="window-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div className="window-title">VoiceNova Studio</div>
                <div className="window-status" id="studioStatus">
                  <span className={`status-indicator ${isSynthesizing ? "status-generating" : isPlaying ? "status-playing" : "status-ready"}`} />
                  <span className="status-text">{isSynthesizing ? "Synthesizing..." : isPlaying ? "Playing Preview" : "Ready"}</span>
                </div>
              </div>

              <div className="dashboard-body">
                <div className="studio-workspace">
                  <div className="studio-input-group">
                    <label htmlFor="speechText">Input Script</label>
                    <textarea
                      id="speechText"
                      placeholder="Welcome to VoiceNova. Type or paste your script here, pick a voice from the library below, and click generate to synthesize speech."
                      value={speechText}
                      onChange={(e) => setSpeechText(e.target.value.substring(0, 500))}
                    />
                    <div className="char-counter">
                      <span>{speechText.length}</span>/500
                    </div>
                  </div>

                  <div className="studio-controls-row">
                    <div className="studio-control-item voice-selector-wrapper">
                      <label htmlFor="voiceSelect">AI Voice</label>
                      <div className="custom-select">
                        <select id="voiceSelect" value={chosenVoice} onChange={(e) => setChosenVoice(e.target.value)}>
                          <option value="Nova">Nova (Female - Warm)</option>
                          <option value="Aero">Aero (Male - Energetic)</option>
                          <option value="Solas">Solas (Female - Expressive)</option>
                          <option value="Vortex">Vortex (Male - Cinematic)</option>
                        </select>
                      </div>
                    </div>

                    <div className="studio-control-item speed-slider-wrapper">
                      <label htmlFor="speedRange">Speed: <span>{speedVal.toFixed(1)}x</span></label>
                      <input
                        type="range"
                        id="speedRange"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={speedVal}
                        onChange={(e) => setSpeedVal(parseFloat(e.target.value))}
                        className="premium-slider"
                      />
                    </div>
                  </div>

                  <div className="visualizer-container">
                    {!isPlaying && !isSynthesizing && !audioUrl && (
                      <div className="visualizer-overlay" id="visualizerOverlay">
                        <Volume2 size={16} className="pulse-icon" />
                        <span>Synthesize voice to play</span>
                      </div>
                    )}
                    {audioUrl && !isPlaying && !isSynthesizing && (
                      <div className="visualizer-overlay" id="visualizerOverlay">
                        <CheckCircle size={16} className="pulse-icon" style={{ color: "var(--color-success)" }} />
                        <span>Synthesis complete. Click generate to repeat.</span>
                      </div>
                    )}
                    <canvas ref={canvasRef} id="waveformCanvas" />
                  </div>

                  <div className="studio-actions">
                    <button className="btn btn-primary btn-full" id="generateSpeechBtn" onClick={handleGenerateSpeech}>
                      <Sparkles size={14} className="btn-icon" style={{ marginRight: "6px" }} />
                      <span>{isSynthesizing ? "Synthesizing AI..." : isPlaying ? "Stop Playback" : "Generate Speech"}</span>
                    </button>
                    <button className="btn btn-secondary" id="downloadAudioBtn" onClick={handleDownloadAudio} disabled={!audioUrl}>
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="section trusted-section">
        <div className="container text-center">
          <h2 className="sub-heading-text">TRUSTED BY 20,000+ CREATORS, STARTUPS AND ENTERPRISES</h2>
          <div className="logos-grid">
            <div className="logo-item">
              <Play className="logo-icon-brand" />
              <span>Creator.io</span>
            </div>
            <div className="logo-item">
              <Volume2 className="logo-icon-brand" />
              <span>TalkFlow</span>
            </div>
            <div className="logo-item">
              <Globe className="logo-icon-brand" />
              <span>StreamSphere</span>
            </div>
            <div className="logo-item">
              <Play className="logo-icon-brand" />
              <span>AudioLab</span>
            </div>
            <div className="logo-item">
              <Terminal className="logo-icon-brand" />
              <span>DevSaaS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section" id="features">
        <div className="container">
          <div className="section-header text-center">
            <div className="badge">Features</div>
            <h2 className="section-title">
              Everything you need for <span className="gradient-text">studio-quality</span> audio
            </h2>
            <p className="section-subtitle">
              Scale your content creation with premium features designed for professionals, developers, and businesses.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper">
                <Volume2 size={20} />
              </div>
              <h3 className="feature-card-title">Text to Speech</h3>
              <p className="feature-card-desc">
                Converts text into lifelike speech in real-time. Choose from 200+ distinct voices across 30+ languages,
                retaining perfect emotional tone.
              </p>
            </div>

            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper">
                <Library size={20} />
              </div>
              <h3 className="feature-card-title">AI Voice Library</h3>
              <p className="feature-card-desc">
                Access a curated gallery of high-fidelity synthetic voice profiles, segmented by age, gender, accent, tone,
                and intended use-case.
              </p>
            </div>

            <div className="feature-card glass-panel">
              <div className="feature-badge">Coming Soon</div>
              <div className="feature-icon-wrapper">
                <Mic size={20} />
              </div>
              <h3 className="feature-card-title">Voice Cloning</h3>
              <p className="feature-card-desc">
                Clone any voice with high precision using a simple 10-second vocal sample. Replicate speech styles, accents,
                and pacing.
              </p>
            </div>

            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper">
                <Globe size={20} />
              </div>
              <h3 className="feature-card-title">Multi-language Support</h3>
              <p className="feature-card-desc">
                Synthesize content natively in over 30 languages with correct accents and phonetic structures, empowering global
                audiences.
              </p>
            </div>

            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper">
                <Zap size={20} />
              </div>
              <h3 className="feature-card-title">Fast Generation</h3>
              <p className="feature-card-desc">
                Experience lightning-fast generation speeds. Synthesize paragraphs in under 200ms using our state-of-the-art
                server farm.
              </p>
            </div>

            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper">
                <Code size={20} />
              </div>
              <h3 className="feature-card-title">Developer API</h3>
              <p className="feature-card-desc">
                Integrate voice generation directly into your products, apps, or game pipelines with our robust, low-latency
                REST and WebSocket APIs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section how-it-works-section" id="how-it-works">
        <div className="container">
          <div className="section-header text-center">
            <div className="badge">Workflow</div>
            <h2 className="section-title">
              Four steps to <span className="gradient-text">perfect audio</span>
            </h2>
            <p className="section-subtitle">
              Our streamlined studio UI takes you from script to professional voiceover in seconds.
            </p>
          </div>

          <div className="steps-timeline">
            <div className="step-card glass-panel">
              <div className="step-num">01</div>
              <div className="step-icon">
                <FileText size={20} />
              </div>
              <h3 className="step-title">Write or Paste Text</h3>
              <p className="step-desc">
                Enter your script into our studio. Adjust formatting and split text blocks to insert natural pauses.
              </p>
            </div>

            <div className="step-card glass-panel">
              <div className="step-num">02</div>
              <div className="step-icon">
                <Smile size={20} />
              </div>
              <h3 className="step-title">Choose Voice</h3>
              <p className="step-desc">
                Pick from 200+ distinct professional voices, adjust pitch and velocity to match your brand style.
              </p>
            </div>

            <div className="step-card glass-panel">
              <div className="step-num">03</div>
              <div className="step-icon">
                <Sparkles size={20} />
              </div>
              <h3 className="step-title">Generate Speech</h3>
              <p className="step-desc">
                Our neural generators process synthesis commands in under 200ms. Listen to dynamic sound wave outputs.
              </p>
            </div>

            <div className="step-card glass-panel">
              <div className="step-num">04</div>
              <div className="step-icon">
                <Download size={20} />
              </div>
              <h3 className="step-title">Download MP3/WAV</h3>
              <p className="step-desc">
                Export files in MPEG or Waveform formats. Instantly upload output links directly into your target programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section pricing-section" id="pricing">
        <div className="container">
          <div className="section-header text-center">
            <div className="badge">Pricing</div>
            <h2 className="section-title">
              Simple, <span className="gradient-text">transparent</span> plans
            </h2>
            <p className="section-subtitle">Choose the perfect tier for content creators, agencies, and enterprise builders.</p>

            <div className="pricing-toggle-wrapper">
              <span className={`toggle-label ${!isAnnual ? "active" : ""}`} id="monthlyLabel">
                Monthly
              </span>
              <label className="pricing-switch">
                <input type="checkbox" id="billingToggle" checked={isAnnual} onChange={(e) => setIsAnnual(e.target.checked)} />
                <span className="pricing-slider" />
              </label>
              <span className={`toggle-label ${isAnnual ? "active" : ""}`} id="annualLabel">
                Annually <span className="discount-tag">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="pricing-grid">
            {/* Plan 1: Free */}
            <div className="pricing-card glass-panel">
              <h3 className="plan-name">Free Plan</h3>
              <p className="plan-desc">For testing and personal voice projects.</p>
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="price-amount">0</span>
                <span className="period">/month</span>
              </div>
              <ul className="plan-features">
                <li>
                  <Check size={14} className="feature-icon" /> 10,000 characters / mo
                </li>
                <li>
                  <Check size={14} className="feature-icon" /> 3 standard voices
                </li>
                <li>
                  <Check size={14} className="feature-icon" /> MP3 exports
                </li>
              </ul>
              <button className="btn btn-outline btn-full" onClick={() => setIsSignupOpen(true)}>
                Get Started
              </button>
            </div>

            {/* Plan 2: Starter */}
            <div className="pricing-card glass-panel">
              <h3 className="plan-name">Starter Plan</h3>
              <p className="plan-desc">Perfect for emerging independent creators.</p>
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="price-amount">{isAnnual ? "8" : "10"}</span>
                <span className="period">/month</span>
              </div>
              <ul className="plan-features">
                <li>
                  <Check size={14} className="feature-icon" /> 40,000 characters / mo
                </li>
                <li>
                  <Check size={14} className="feature-icon" /> All standard voice library
                </li>
                <li>
                  <Check size={14} className="feature-icon" /> 1 custom cloned voice
                </li>
              </ul>
              <button className="btn btn-outline btn-full" onClick={() => setIsSignupOpen(true)}>
                Choose Starter
              </button>
            </div>

            {/* Plan 3: Pro */}
            <div className="pricing-card glass-panel active-plan">
              <div className="popular-badge">Most Popular</div>
              <h3 className="plan-name" style={{ color: "var(--color-secondary)" }}>
                Pro Plan
              </h3>
              <p className="plan-desc">For professional creators and commercial projects.</p>
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="price-amount">{isAnnual ? "24" : "29"}</span>
                <span className="period">/month</span>
              </div>
              <ul className="plan-features">
                <li>
                  <Check size={14} className="feature-icon" /> 100,000 characters / mo
                </li>
                <li>
                  <Check size={14} className="feature-icon" /> Access to HD+ voice models
                </li>
                <li>
                  <Check size={14} className="feature-icon" /> 3 custom cloned voices
                </li>
                <li>
                  <Check size={14} className="feature-icon" /> Commercial API keys
                </li>
              </ul>
              <button className="btn btn-primary btn-full btn-glow-hover" onClick={() => setIsSignupOpen(true)}>
                Choose Pro
              </button>
            </div>

            {/* Plan 4: Enterprise */}
            <div className="pricing-card glass-panel">
              <h3 className="plan-name">Enterprise</h3>
              <p className="plan-desc">For companies looking for custom volume limits.</p>
              <div className="plan-price" style={{ fontSize: "1.6rem" }}>
                Custom Pricing
              </div>
              <ul className="plan-features">
                <li>
                  <Check size={14} className="feature-icon" /> Unlimited characters quota
                </li>
                <li>
                  <Check size={14} className="feature-icon" /> Private dedicated node servers
                </li>
                <li>
                  <Check size={14} className="feature-icon" /> 24/7 dedicated support
                </li>
              </ul>
              <button className="btn btn-outline btn-full" onClick={() => showToast("Contacting sales channels...")}>
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section faq-section" id="faq">
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="section-header text-center">
            <div className="badge">FAQs</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">Got questions? We've got answers. Explore our common support queries.</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`faq-item glass-panel ${activeFaqIdx === idx ? "active" : ""}`}>
                <button className="faq-question" onClick={() => setActiveFaqIdx(activeFaqIdx === idx ? null : idx)}>
                  <span>{faq.q}</span>
                  <ChevronDown size={16} className="faq-arrow" />
                </button>
                <div
                  className="faq-answer"
                  style={{
                    maxHeight: activeFaqIdx === idx ? "200px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                  }}
                >
                  <p style={{ padding: "16px 20px 20px 20px", color: "var(--color-text-secondary)" }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA Banner Section */}
      <section className="section cta-section" id="contact">
        <div className="container" style={{ maxWidth: "900px" }}>
          <div className="cta-card glass-panel text-center">
            <div className="profile-cover-glow" style={{ top: "-100px", left: "-100px" }} />
            <h2 className="cta-title">Start Creating Life-Like Speech Today</h2>
            <p className="cta-desc">
              Sign up today and get 10,000 characters free. Experience our ultra-realistic neural models now.
            </p>
            <button className="btn btn-primary btn-lg btn-glow-hover" onClick={() => setIsSignupOpen(true)}>
              Get Started for Free <ArrowRight size={14} style={{ marginLeft: "8px", display: "inline-block" }} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section">
        <div className="container footer-container">
          <div className="footer-brand">
            <Link href="/" className="logo">
              <span className="logo-text">VoiceNova</span>
            </Link>
            <p className="footer-about">
              Neural AI text-to-speech platform transforming scripts into crystal-clear voiceovers instantly.
            </p>
          </div>
          <div className="footer-links-group">
            <div className="footer-links-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <Link href="/api">Developer API</Link>
            </div>
            <div className="footer-links-col">
              <h4>Support</h4>
              <Link href="/help">Help Center</Link>
              <a href="#faq">FAQ</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container footer-bottom-container">
            <span>© 2026 VoiceNova AI. All rights reserved.</span>
            <div className="footer-policy-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ==========================================================================
         MODALS POPUP OVERLAYS (Login / Sign Up)
         ========================================================================== */}
      
      {/* Login Modal */}
      {isLoginOpen && (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setIsLoginOpen(false)}>
          <div className="auth-card glass-panel">
            <button className="modal-close-btn" onClick={() => setIsLoginOpen(false)}>
              <X size={16} />
            </button>
            <div className="auth-header">
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-subtitle">Log in to your VoiceNova dashboard</p>
            </div>

            <form id="loginForm" onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="loginEmail">Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                  <input
                    type="email"
                    id="loginEmail"
                    placeholder="you@example.com"
                    style={{ paddingLeft: "40px" }}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: "12px" }}>
                <label htmlFor="loginPassword">Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                  <input
                    type="password"
                    id="loginPassword"
                    placeholder="••••••••"
                    style={{ paddingLeft: "40px" }}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-glow-hover" style={{ marginTop: "20px" }}>
                Log In
              </button>
            </form>

            <div className="auth-footer-text">
              Don't have an account?{" "}
              <button
                className="btn-text-link"
                onClick={() => {
                  setIsLoginOpen(false);
                  setIsSignupOpen(true);
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {isSignupOpen && (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setIsSignupOpen(false)}>
          <div className="auth-card glass-panel">
            <button className="modal-close-btn" onClick={() => setIsSignupOpen(false)}>
              <X size={16} />
            </button>
            <div className="auth-header">
              <h2 className="auth-title">Create Account</h2>
              <p className="auth-subtitle">Start generating AI voices for free</p>
            </div>

            <form id="signupForm" onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <label htmlFor="signupName">Full Name</label>
                <div style={{ position: "relative" }}>
                  <User size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                  <input
                    type="text"
                    id="signupName"
                    placeholder="Alex Morgan"
                    style={{ paddingLeft: "40px" }}
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: "12px" }}>
                <label htmlFor="signupEmail">Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                  <input
                    type="email"
                    id="signupEmail"
                    placeholder="you@example.com"
                    style={{ paddingLeft: "40px" }}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: "12px" }}>
                <label htmlFor="signupPassword">Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                  <input
                    type="password"
                    id="signupPassword"
                    placeholder="••••••••"
                    style={{ paddingLeft: "40px" }}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-glow-hover" style={{ marginTop: "20px" }}>
                Create Account
              </button>
            </form>

            <div className="auth-footer-text">
              Already have an account?{" "}
              <button
                className="btn-text-link"
                onClick={() => {
                  setIsSignupOpen(false);
                  setIsLoginOpen(true);
                }}
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert popup notification */}
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
