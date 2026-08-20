/* ==========================================================================
   VoiceNova Advanced Analytics Page Interactive Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    /* ==========================================================================
       Global Toast Utility
       ========================================================================== */
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `glass-panel toast toast-${type}`;
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.right = '24px';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.zIndex = '3000';
        toast.style.borderLeft = `4px solid ${type === 'success' ? 'var(--color-success)' : 'var(--color-error)'}`;
        toast.style.boxShadow = 'var(--shadow-soft)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '8px';
        toast.style.animation = 'slideIn 0.3s ease forwards';
        
        toast.innerHTML = `
            <span style="font-weight:600;">${type === 'success' ? '✓' : '✗'}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    /* ==========================================================================
       Mobile Sidebar Drawer Navigation
       ========================================================================== */
    const sidebar = document.getElementById('dashSidebar');
    const sidebarToggle = document.getElementById('sidebarToggleBtn');
    const sidebarClose = document.getElementById('sidebarCloseBtn');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            if (sidebar && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });

    /* ==========================================================================
       Date Range Filter Switcher
       ========================================================================== */
    const dateRangeSelect = document.getElementById('analyticsDateRange');
    
    // KPI elements
    const kpiActive = document.getElementById('kpiActiveUsers');
    const kpiConv = document.getElementById('kpiConvRate');
    const kpiChars = document.getElementById('kpiCharsGen');
    const kpiApi = document.getElementById('kpiApiHits');

    const kpiRangesData = {
        'today': { active: "1,240", conv: "3.5%", chars: "412K", api: "12,400" },
        '7d': { active: "8,912", conv: "3.2%", chars: "14.2M", api: "184,200" },
        '30d': { active: "34,890", conv: "3.0%", chars: "58.2M", api: "712,400" },
        '12m': { active: "142,500", conv: "2.8%", chars: "690.4M", api: "8.4M" }
    };

    if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', () => {
            const range = dateRangeSelect.value;
            const data = kpiRangesData[range];
            if (data) {
                kpiActive.textContent = data.active;
                kpiConv.textContent = data.conv;
                kpiChars.textContent = data.chars;
                kpiApi.textContent = data.api;
                
                showToast(`Analytics dashboard updated for: ${range.toUpperCase()}`);
            }
        });
    }

    /* ==========================================================================
       Export reports triggers
       ========================================================================== */
    const exportSelect = document.getElementById('analyticsExportBtn');
    if (exportSelect) {
        exportSelect.addEventListener('change', () => {
            const format = exportSelect.value;
            if (!format) return;

            showToast(`Generating platform report in ${format.toUpperCase()} format...`);
            
            setTimeout(() => {
                showToast(`Report downloaded: VoiceNova_Analytics_${format.toUpperCase()}.zip`, "success");
                exportSelect.value = ''; // Reset select Choice
            }, 1800);
        });
    }

    /* ==========================================================================
       Real-Time Activity stream Simulator
       ========================================================================== */
    const activityFeed = document.getElementById('activityFeedList');
    const mockEvents = [
        { text: "Audio clip generated: @sarah_j in English using Aero (450 chars)", icon: "music", type: "primary" },
        { text: "Stripe recurring invoice processed: $29.00 USD (INV-2026-007)", icon: "credit-card", type: "success" },
        { text: "API synthesis request dispatched from client ID vn_live_d84f...", icon: "code-2", type: "secondary" },
        { text: "Custom voice cloning model verification completed for user @alex_morgan", icon: "user-check", type: "success" },
        { text: "Support Ticket #103 resolved by administrator SuperAdmin", icon: "message-square-dashed", type: "success" }
    ];

    setInterval(() => {
        if (activityFeed) {
            const ev = mockEvents[Math.floor(Math.random() * mockEvents.length)];
            const div = document.createElement('div');
            div.className = 'session-item';
            div.style.padding = '10px 16px';
            div.style.background = 'rgba(255, 255, 255, 0.01)';
            div.style.animation = 'slideIn 0.3s ease forwards';
            div.style.opacity = '0';
            
            const colorVar = ev.type === 'primary' ? 'var(--color-primary)' : (ev.type === 'success' ? '#22C55E' : 'var(--color-secondary)');

            div.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px;">
                    <i data-lucide="${ev.icon}" style="color:${colorVar}; width:14px;height:14px;"></i>
                    <span style="font-size:0.82rem;">${ev.text}</span>
                </div>
                <span style="font-size:0.68rem; color:var(--color-text-muted);">Just Now</span>
            `;
            
            activityFeed.insertBefore(div, activityFeed.firstChild);
            window.lucide.createIcons();
            
            // Limit feed children to 10
            if (activityFeed.children.length > 10) {
                activityFeed.lastChild.remove();
            }
        }
    }, 5000);

    /* ==========================================================================
       Ambient Canvas Background Waveforms Loop
       ========================================================================== */
    const bgCanvas = document.getElementById('bgWaveformCanvas');
    const bgCtx = bgCanvas.getContext('2d');

    const resizeBgCanvas = () => {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    };
    resizeBgCanvas();
    window.addEventListener('resize', resizeBgCanvas);

    let bgPhase = 0;

    const drawBackgroundWaveforms = () => {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        const w = bgCanvas.width;
        const h = bgCanvas.height;
        const centerY = h * 0.75;
        
        bgPhase += 0.005;
        
        bgCtx.save();
        bgCtx.lineWidth = 1;
        
        const bgWaves = [
            { amp: 80, freq: 0.0008, color: 'rgba(108, 99, 255, 0.015)', delay: 0 },
            { amp: 120, freq: 0.0005, color: 'rgba(0, 194, 255, 0.012)', delay: Math.PI / 3 },
            { amp: 60, freq: 0.0012, color: 'rgba(255, 255, 255, 0.005)', delay: Math.PI * (2/3) }
        ];

        bgWaves.forEach(wave => {
            bgCtx.strokeStyle = wave.color;
            bgCtx.beginPath();
            bgCtx.moveTo(0, centerY);
            
            for (let x = 0; x < w; x++) {
                const y = centerY + Math.sin(x * wave.freq + bgPhase + wave.delay) * wave.amp;
                bgCtx.lineTo(x, y);
            }
            bgCtx.stroke();
        });

        bgCtx.restore();
        requestAnimationFrame(drawBackgroundWaveforms);
    };

    drawBackgroundWaveforms();

    /* ==========================================================================
       Floating AI Assistant Chat Overlay panel
       ========================================================================== */
    const assistantFab = document.getElementById('aiAssistantFab');
    const headerAssistantBtn = document.getElementById('headerAssistantBtn');
    const assistantOverlay = document.getElementById('aiAssistantOverlay');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatForm = document.getElementById('chatFormInput');
    const chatInput = document.getElementById('chatInputMessage');
    const chatBody = document.getElementById('chatBody');

    const toggleAssistantOverlay = () => {
        assistantOverlay.classList.toggle('active');
        if (assistantOverlay.classList.contains('active')) {
            chatInput.focus();
        }
    };

    if (assistantFab) assistantFab.addEventListener('click', toggleAssistantOverlay);
    if (headerAssistantBtn) headerAssistantBtn.addEventListener('click', toggleAssistantOverlay);
    if (chatCloseBtn) chatCloseBtn.addEventListener('click', () => assistantOverlay.classList.remove('active'));

    const botAnswers = [
        "To make Nova sound warmer, set speed rate to 0.95x and increase pitch by +5%. This creates a rich narrative cadence.",
        "You can add brief breathing elements by writing '[pause: 0.4s]' inside the text scripts. Try it out!",
        "Yes, you can export speech in French or Spanish! Simply set the Language dropdown selector before hitting synthesize.",
        "To synthesize deep cinematic voices, pick Vortex (Male) and slide Pitch down to -15%.",
        "Your characters quota resets on the 15th of every month. You currently have 54,790 characters remaining."
    ];

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (!msg) return;

        const userBubble = document.createElement('div');
        userBubble.className = 'chat-message user-msg';
        userBubble.innerHTML = `<p>${msg}</p>`;
        chatBody.appendChild(userBubble);
        chatInput.value = '';
        
        chatBody.scrollTop = chatBody.scrollHeight;

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'chat-message assistant-msg typing-msg';
        typingIndicator.innerHTML = `<p>Typing<span class="dot-blink">.</span><span class="dot-blink">.</span><span class="dot-blink">.</span></p>`;
        chatBody.appendChild(typingIndicator);
        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(() => {
            typingIndicator.remove();
            
            const botBubble = document.createElement('div');
            botBubble.className = 'chat-message assistant-msg';
            
            const botResponseText = botAnswers[Math.floor(Math.random() * botAnswers.length)];
            botBubble.innerHTML = `<p>${botResponseText}</p>`;
            chatBody.appendChild(botBubble);
            
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 1200);
    });
});
