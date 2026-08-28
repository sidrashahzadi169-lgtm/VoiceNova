/* ==========================================================================
   VoiceNova Developer API Console Interactive Logic
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
       API Keys mask toggle & copy actions
       ========================================================================== */
    const toggleButtons = document.querySelectorAll('.btn-toggle-mask');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            if (!targetInput) return;

            const isCurrentlyMasked = targetInput.getAttribute('type') === 'password';
            if (isCurrentlyMasked) {
                targetInput.setAttribute('type', 'text');
                btn.innerHTML = '<i data-lucide="eye-off" style="width:14px;height:14px;"></i>';
            } else {
                targetInput.setAttribute('type', 'password');
                btn.innerHTML = '<i data-lucide="eye" style="width:14px;height:14px;"></i>';
            }
            window.lucide.createIcons();
        });
    });

    const copyButtons = document.querySelectorAll('.btn-copy-key');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            if (!targetInput) return;

            navigator.clipboard.writeText(targetInput.value);
            showToast("Key copied to clipboard!", "success");
        });
    });

    const btnRegenPrimary = document.getElementById('btnRegenPrimary');
    const btnRegenSecret = document.getElementById('btnRegenSecret');

    if (btnRegenPrimary) {
        btnRegenPrimary.addEventListener('click', () => {
            if (confirm("WARNING: Regenerating your live API key will break your current application services. Do you want to continue?")) {
                const hex = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
                document.getElementById('inputPrimaryKey').value = `vn_live_${hex}`;
                showToast("Primary API key regenerated.", "success");
            }
        });
    }

    if (btnRegenSecret) {
        btnRegenSecret.addEventListener('click', () => {
            if (confirm("WARNING: Regenerating your Secret auth key will invalidate current endpoint authorization headers. Do you want to continue?")) {
                const hex = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
                document.getElementById('inputSecretKey').value = `vn_sec_${hex}`;
                showToast("Secret auth key regenerated.", "success");
            }
        });
    }

    /* ==========================================================================
       Code Snippet language tab selection
       ========================================================================== */
    const codeTabBtns = document.querySelectorAll('.code-tab-btn');
    const codePanes = {
        'javascript': document.getElementById('codePaneJavascript'),
        'python': document.getElementById('codePanePython'),
        'node': document.getElementById('codePaneNode'),
        'php': document.getElementById('codePanePhp')
    };

    codeTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            codeTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetLang = btn.getAttribute('data-lang-tab');
            Object.keys(codePanes).forEach(key => {
                if (key === targetLang) {
                    codePanes[key].style.display = 'block';
                    codePanes[key].classList.add('active');
                } else {
                    codePanes[key].style.display = 'none';
                    codePanes[key].classList.remove('active');
                }
            });
        });
    });

    const btnCopySnippet = document.getElementById('btnCopySnippet');
    if (btnCopySnippet) {
        btnCopySnippet.addEventListener('click', () => {
            const activePane = document.querySelector('.code-box.active');
            if (activePane) {
                navigator.clipboard.writeText(activePane.textContent);
                showToast("Code snippet copied to clipboard!", "success");
            }
        });
    }

    /* ==========================================================================
       Webhooks Testing & Add Configurations
       ========================================================================== */
    const btnTestWebhook = document.getElementById('btnTestWebhook');
    const btnAddWebhook = document.getElementById('btnAddWebhook');
    const inputWebhookUrl = document.getElementById('inputWebhookUrl');

    if (btnTestWebhook) {
        btnTestWebhook.addEventListener('click', () => {
            const url = inputWebhookUrl.value.trim();
            if (!url) {
                showToast("Please enter a valid endpoint URL first.", "error");
                return;
            }

            showToast("Dispatching webhook ping frame: event 'synthesis.completed'...");
            btnTestWebhook.disabled = true;
            btnTestWebhook.innerHTML = '<i class="spinner-svg" style="width:12px;height:12px;display:inline-block;border:2px solid;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin-right:6px;"></i> Testing...';
            
            setTimeout(() => {
                btnTestWebhook.disabled = false;
                btnTestWebhook.innerHTML = '<i data-lucide="refresh-cw" style="width:12px;height:12px;"></i> Test Webhook';
                window.lucide.createIcons();
                
                showToast("Webhook test successful! Response: 200 OK (Latency: 145ms)", "success");
            }, 1500);
        });
    }

    if (btnAddWebhook) {
        btnAddWebhook.addEventListener('click', () => {
            const url = inputWebhookUrl.value.trim();
            if (!url) {
                showToast("Endpoint URL field cannot be empty.", "error");
                return;
            }
            showToast(`Webhook endpoint configured: ${url}`, "success");
        });
    }

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
