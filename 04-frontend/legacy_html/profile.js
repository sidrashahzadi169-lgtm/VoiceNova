/* ==========================================================================
   VoiceNova User Profile Settings Page Interactive Logic
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
       Forms Tabbing Switcher
       ========================================================================== */
    const tabBtns = document.querySelectorAll('.profile-tab-btn');
    const tabPanes = {
        'edit-profile': document.getElementById('tabPaneEditProfile'),
        'security': document.getElementById('tabPaneSecurity'),
        'preferences': document.getElementById('tabPanePreferences')
    };

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetTab = btn.getAttribute('data-tab');
            Object.keys(tabPanes).forEach(paneKey => {
                if (paneKey === targetTab) {
                    tabPanes[paneKey].style.display = 'block';
                } else {
                    tabPanes[paneKey].style.display = 'none';
                }
            });
        });
    });

    /* ==========================================================================
       Form Submissions handlers
       ========================================================================== */
    const formEditProfile = document.getElementById('formEditProfile');
    const formChangePassword = document.getElementById('formChangePassword');
    const btnSavePreferences = document.getElementById('btnSavePreferences');

    // DOM labels to sync update
    const labelFullName = document.getElementById('labelFullName');
    const labelUsername = document.getElementById('labelUsername');
    const labelEmail = document.getElementById('labelEmail');
    const labelBio = document.getElementById('labelBio');
    const labelCountry = document.getElementById('labelCountry');
    const labelTimezone = document.getElementById('labelTimezone');

    if (formEditProfile) {
        formEditProfile.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const fullNameVal = document.getElementById('inputFullName').value.trim();
            const usernameVal = document.getElementById('inputUsername').value.trim();
            const emailVal = document.getElementById('inputEmail').value.trim();
            const bioVal = document.getElementById('inputBio').value.trim();
            const countryVal = document.getElementById('inputCountry').value.trim();
            const timezoneVal = document.getElementById('inputTimezone').value.trim();

            // Save in localStorage for sync across other pages if needed
            localStorage.setItem('userFullName', fullNameVal);

            // Update DOM overview card
            if (labelFullName) labelFullName.textContent = fullNameVal;
            if (labelUsername) labelUsername.textContent = `@${usernameVal}`;
            if (labelEmail) labelEmail.textContent = emailVal;
            if (labelBio) labelBio.textContent = bioVal;
            if (labelCountry) labelCountry.textContent = countryVal;
            if (labelTimezone) labelTimezone.textContent = timezoneVal;

            showToast("Profile details updated successfully.");
        });
    }

    if (formChangePassword) {
        formChangePassword.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const currPass = document.getElementById('inputCurrPass').value;
            const newPass = document.getElementById('inputNewPass').value;
            const confPass = document.getElementById('inputConfPass').value;

            if (newPass !== confPass) {
                showToast("Password confirmation mismatch!", "error");
                return;
            }

            showToast("Password updated successfully.");
            formChangePassword.reset();
        });
    }

    if (btnSavePreferences) {
        btnSavePreferences.addEventListener('click', () => {
            showToast("Preferences saved.");
        });
    }

    /* ==========================================================================
       Interactive Buttons (2FA, Social connectors, revoking sessions)
       ========================================================================== */
    const btnToggle2FA = document.getElementById('btnToggle2FA');
    let is2FAEnabled = false;

    if (btnToggle2FA) {
        btnToggle2FA.addEventListener('click', () => {
            is2FAEnabled = !is2FAEnabled;
            const statusLabel = btnToggle2FA.previousElementSibling.querySelector('span');
            const icon = btnToggle2FA.previousElementSibling.querySelector('i');
            
            if (is2FAEnabled) {
                statusLabel.textContent = "Status: Enabled (Google Authenticator)";
                btnToggle2FA.textContent = "Disable 2FA";
                btnToggle2FA.className = "btn btn-outline btn-sm";
                icon.style.color = "var(--color-success)";
                icon.setAttribute('data-lucide', 'shield-check');
                showToast("Two-Factor Authentication activated.", "success");
            } else {
                statusLabel.textContent = "Status: Disabled";
                btnToggle2FA.textContent = "Enable 2FA";
                btnToggle2FA.className = "btn btn-secondary btn-sm";
                icon.style.color = "var(--color-error)";
                icon.setAttribute('data-lucide', 'shield-alert');
                showToast("Two-Factor Authentication deactivated.");
            }
            window.lucide.createIcons();
        });
    }

    // Connectors
    const setupConnector = (btnId, name) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        let isConnected = btnId === 'btnConnectGoogle'; // google default true
        
        btn.addEventListener('click', () => {
            isConnected = !isConnected;
            if (isConnected) {
                btn.textContent = "Connected";
                btn.className = "btn btn-outline btn-xs";
                showToast(`Successfully linked ${name} account.`, "success");
            } else {
                btn.textContent = "Connect Account";
                btn.className = "btn btn-secondary btn-xs";
                showToast(`Unlinked ${name} account.`);
            }
        });
    };

    setupConnector('btnConnectGoogle', 'Google');
    setupConnector('btnConnectGithub', 'GitHub');
    setupConnector('btnConnectMicrosoft', 'Microsoft');

    // Revoke sessions
    const revokeBtns = document.querySelectorAll('.revoke-session-btn');
    revokeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.session-item');
            if (confirm("Are you sure you want to revoke this session?")) {
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
            const extraSessions = document.querySelectorAll('.revoke-session-btn');
            if (extraSessions.length === 0) {
                showToast("No active secondary devices found.");
                return;
            }
            if (confirm("Terminate all other active sessions? This will log out all other devices.")) {
                extraSessions.forEach(btn => {
                    const item = btn.closest('.session-item');
                    item.remove();
                });
                showToast("All other login sessions revoked.", "success");
            }
        });
    }

    /* ==========================================================================
       Theme Box option selector
       ========================================================================== */
    const themeBoxes = document.querySelectorAll('.theme-box');
    themeBoxes.forEach(box => {
        box.addEventListener('click', () => {
            themeBoxes.forEach(b => b.classList.remove('active'));
            box.classList.add('active');
            const theme = box.getAttribute('data-theme');
            showToast(`Theme switched to ${theme === 'dark' ? 'Deep Space Dark' : 'Neural Light'}.`);
        });
    });

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
