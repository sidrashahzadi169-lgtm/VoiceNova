/* ==========================================================================
   VoiceNova Billing & Pricing Console Interactive Logic
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
       Billing Switcher Month/Yearly prices
       ========================================================================== */
    const cycleToggle = document.getElementById('pricingCycleToggle');
    const priceVals = document.querySelectorAll('.price-val');
    const priceDurations = document.querySelectorAll('.price-duration');

    if (cycleToggle) {
        const switcherBtns = cycleToggle.querySelectorAll('.switcher-btn');
        switcherBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                switcherBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const cycle = btn.getAttribute('data-cycle');
                
                // Update prices values with keyframe scale animations
                priceVals.forEach(val => {
                    val.style.transform = 'scale(0.8)';
                    val.style.opacity = '0.3';
                    
                    setTimeout(() => {
                        const targetPrice = val.getAttribute(`data-${cycle}`);
                        val.textContent = targetPrice;
                        val.style.transform = '';
                        val.style.opacity = '';
                    }, 150);
                });
                
                // Update duration text
                priceDurations.forEach(dur => {
                    dur.textContent = cycle === 'monthly' ? '/mo' : '/yr';
                });

                showToast(`Switched pricing views to ${cycle} plans.`);
            });
        });
    }

    /* ==========================================================================
       Downgrade / Upgrade Subscription actions
       ========================================================================== */
    const planBtns = document.querySelectorAll('.select-plan-btn');
    planBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const planName = btn.getAttribute('data-plan');
            showToast(`Initiating checkout pipeline for ${planName} Plan...`);
            setTimeout(() => {
                showToast(`Payment request verified. You have upgraded to ${planName}!`, "success");
            }, 1500);
        });
    });

    const subUpgradeBtn = document.getElementById('subUpgradeBtn');
    const ctaUpgradeBtn = document.getElementById('ctaUpgradeBtn');

    if (subUpgradeBtn) {
        subUpgradeBtn.addEventListener('click', () => {
            showToast("Opening billing portals... Choose Business tier below.");
            document.querySelector('.billing-pricing-grid').scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (ctaUpgradeBtn) {
        ctaUpgradeBtn.addEventListener('click', () => {
            showToast("Upgrade inquiry dispatched! Sales representatives will email you.", "success");
        });
    }

    /* ==========================================================================
       Payment Methods option selector toggle
       ========================================================================== */
    const payOptions = document.querySelectorAll('.payment-card-option');
    payOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            if (opt.classList.contains('pay-option-disabled')) {
                showToast("JazzCash & Easypaisa integrations are coming soon!", "error");
                return;
            }

            payOptions.forEach(o => {
                o.classList.remove('active');
                const badge = o.querySelector('.badge');
                if (badge && badge.textContent === 'Default') badge.remove();
            });

            opt.classList.add('active');
            
            // Add Default badge to selected Stripe/PayPal
            const header = opt.querySelector('.pay-option-header');
            const defaultBadge = document.createElement('span');
            defaultBadge.className = 'badge badge-success-active';
            defaultBadge.textContent = 'Default';
            header.appendChild(defaultBadge);

            showToast("Payment preference updated successfully.");
        });
    });

    /* ==========================================================================
       Billing Invoices Download simulated actions
       ========================================================================== */
    const invoiceBtns = document.querySelectorAll('.download-invoice-btn');
    invoiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const invId = btn.getAttribute('data-id');
            showToast(`Downloading invoice file: Invoice_${invId}.pdf`);
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
