/* ==========================================================================
   VoiceNova Console Settings Page Interactive Logic
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
       Left Subtabs Switcher Logic
       ========================================================================== */
    const settingsTabs = document.querySelectorAll('.settings-tab-link');
    const settingsPanes = {
        'general-appearance': document.getElementById('paneGeneralAppearance'),
        'notifications-ai': document.getElementById('paneNotificationsAI'),
        'security-sessions': document.getElementById('paneSecuritySessions'),
        'api-storage': document.getElementById('paneApiStorage')
    };

    settingsTabs.forEach(link => {
        link.addEventListener('click', () => {
            settingsTabs.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const targetPane = link.getAttribute('data-settings-pane');
            Object.keys(settingsPanes).forEach(key => {
                if (key === targetPane) {
                    settingsPanes[key].style.display = 'block';
                } else {
                    settingsPanes[key].style.display = 'none';
                }
            });
        });
    });

    /* ==========================================================================
       General Settings form submit
       ========================================================================== */
    const generalForm = document.getElementById('settingsGeneralForm');
    if (generalForm) {
        generalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = document.getElementById('setFullName').value.trim();
            localStorage.setItem('userFullName', fullName);
            showToast("General console settings updated successfully.");
        });
    }

    /* ==========================================================================
       Theme Box & Accent Color dots triggers
       ========================================================================== */
    const themeBoxes = document.querySelectorAll('[data-theme-mode]');
    themeBoxes.forEach(box => {
        box.addEventListener('click', () => {
            themeBoxes.forEach(b => b.classList.remove('active'));
            box.classList.add('active');
            const theme = box.getAttribute('data-theme-mode');
            showToast(`Console theme set to: ${theme.toUpperCase()}`);
        });
    });

    const accentDots = document.querySelectorAll('.accent-dot-btn');
    accentDots.forEach(dot => {
        dot.addEventListener('click', () => {
            accentDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            const color = dot.getAttribute('data-accent');
            showToast(`Accent highlights color updated to: ${color.toUpperCase()}`);
        });
    });

    /* ==========================================================================
       Notification switches toggling triggers
       ========================================================================== */
    const registerSwitch = (elId, name) => {
        const sw = document.getElementById(elId);
        if (sw) {
            sw.addEventListener('change', () => {
                showToast(`${name} preference updated: ${sw.checked ? 'ENABLED' : 'DISABLED'}`);
            });
        }
    };

    registerSwitch('switchEmailNotif', 'Email notifications');
    registerSwitch('switchPushNotif', 'Browser push notifications');
    registerSwitch('switchMarketingNotif', 'Marketing newsletters');
    registerSwitch('switchUpdatesNotif', 'Weekly quota logs');
    registerSwitch('switchAutoSave', 'Auto save projects drafts');

    const saveAiBtn = document.getElementById('saveAiSettingsBtn');
    if (saveAiBtn) {
        saveAiBtn.addEventListener('click', () => {
            showToast("AI Studio synthesis defaults updated.", "success");
        });
    }

    /* ==========================================================================
       Security password & 2FA toggles
       ========================================================================== */
    const passwordForm = document.getElementById('settingsPasswordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPass = document.getElementById('setNewPass').value;
            const confPass = document.getElementById('setConfPass').value;

            if (newPass !== confPass) {
                showToast("Password confirmation mismatch!", "error");
                return;
            }

            showToast("Password changed successfully.", "success");
            passwordForm.reset();
        });
    }

    const btnToggle2FA = document.getElementById('btnToggle2FA');
    let is2faOn = false;
    if (btnToggle2FA) {
        btnToggle2FA.addEventListener('click', () => {
            is2faOn = !is2faOn;
            const stateLabel = document.getElementById('label2faState');
            const stateIcon = document.getElementById('icon2faState');
            
            if (is2faOn) {
                stateLabel.textContent = "Status: Enabled (Google Authenticator)";
                btnToggle2FA.textContent = "Disable 2FA";
                btnToggle2FA.className = "btn btn-outline btn-sm";
                stateIcon.style.color = "var(--color-success)";
                stateIcon.setAttribute('data-lucide', 'shield-check');
                showToast("Two-Factor Authentication activated successfully.", "success");
            } else {
                stateLabel.textContent = "Status: Disabled";
                btnToggle2FA.textContent = "Enable 2FA";
                btnToggle2FA.className = "btn btn-secondary btn-sm";
                stateIcon.style.color = "var(--color-error)";
                stateIcon.setAttribute('data-lucide', 'shield-alert');
                showToast("Two-Factor Authentication deactivated.");
            }
            window.lucide.createIcons();
        });
    }

    // Sessions revoking
    const revokeBtns = document.querySelectorAll('.revoke-session-btn');
    revokeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.session-item');
            if (confirm("Terminate login session on this device?")) {
                item.style.opacity = '0.3';
                setTimeout(() => {
                    item.remove();
                    showToast("Session terminated.");
                }, 400);
            }
        });
    });

    const btnRevokeAll = document.getElementById('btnRevokeAll');
    if (btnRevokeAll) {
        btnRevokeAll.addEventListener('click', () => {
            const sessions = document.querySelectorAll('.revoke-session-btn');
            if (sessions.length === 0) {
                showToast("No other active sessions found.");
                return;
            }
            if (confirm("Revoke all other device logins? This will log out secondary devices.")) {
                sessions.forEach(b => b.closest('.session-item').remove());
                showToast("All other login sessions terminated.");
            }
        });
    }

    const btnDeleteAccount = document.getElementById('btnDeleteAccount');
    if (btnDeleteAccount) {
        btnDeleteAccount.addEventListener('click', () => {
            if (confirm("WARNING: Are you sure you want to permanently delete your VoiceNova account? This action is irreversible and deletes all cloned models and projects.")) {
                const conf = prompt("Type 'DELETE' to confirm account deletion:");
                if (conf === 'DELETE') {
                    showToast("Account queued for deletion. Redirecting to home...", "error");
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    showToast("Account deletion cancelled.");
                }
            }
        });
    }

    /* ==========================================================================
       Developer API key copy & mask reveal
       ========================================================================== */
    const apiKeyInput = document.getElementById('inputApiKey');
    const btnToggleApiMask = document.getElementById('btnToggleApiMask');
    const btnCopyApiKey = document.getElementById('btnCopyApiKey');
    const btnRegenerateKey = document.getElementById('btnRegenerateKey');
    let isMasked = true;

    if (btnToggleApiMask) {
        btnToggleApiMask.addEventListener('click', () => {
            isMasked = !isMasked;
            if (isMasked) {
                apiKeyInput.setAttribute('type', 'password');
                btnToggleApiMask.innerHTML = '<i data-lucide="eye" style="width:14px;height:14px;"></i>';
            } else {
                apiKeyInput.setAttribute('type', 'text');
                btnToggleApiMask.innerHTML = '<i data-lucide="eye-off" style="width:14px;height:14px;"></i>';
            }
            window.lucide.createIcons();
        });
    }

    if (btnCopyApiKey) {
        btnCopyApiKey.addEventListener('click', () => {
            navigator.clipboard.writeText(apiKeyInput.value);
            showToast("API key copied to clipboard!", "success");
        });
    }

    if (btnRegenerateKey) {
        btnRegenerateKey.addEventListener('click', () => {
            if (confirm("WARNING: Regenerating your API key will immediately invalidate your current active integration keys. Do you want to proceed?")) {
                const randomHex = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
                apiKeyInput.value = `vn_live_${randomHex}`;
                showToast("New API key generated.", "success");
            }
        });
    }

    /* ==========================================================================
       Storage Clear Cache & delete old projects
       ========================================================================== */
    const clearCacheBtn = document.getElementById('btnClearCacheBtn');
    const deleteOldBtn = document.getElementById('btnDeleteOldBtn');

    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', () => {
            showToast("Clearing console cache...");
            setTimeout(() => {
                showToast("Browser cache cleared successfully.", "success");
            }, 1000);
        });
    }

    if (deleteOldBtn) {
        deleteOldBtn.addEventListener('click', () => {
            if (confirm("Delete projects older than 30 days? This frees up storage space.")) {
                showToast("Deleting outdated audio drafts...");
                setTimeout(() => {
                    showToast("Outdated projects deleted.", "success");
                }, 1000);
            }
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
