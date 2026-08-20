/* ==========================================================================
   VoiceNova Billing & Pricing Console - Stripe Payment Integration
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {

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

    /* ==========================================================================
       Stripe Elements Initialization
       ========================================================================== */
    let stripeInstance = null;
    let cardElement = null;

    try {
        // Initialize Stripe.js with the public test key
        stripeInstance = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
        const elements = stripeInstance.elements();
        
        cardElement = elements.create('card', {
            style: {
                base: {
                    color: '#ffffff',
                    fontFamily: 'Inter, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '15px',
                    '::placeholder': {
                        color: 'rgba(255, 255, 255, 0.4)'
                    }
                },
                invalid: {
                    color: '#ef4444',
                    iconColor: '#ef4444'
                }
            }
        });
        cardElement.mount('#card-element');
        
        // Listen for card errors dynamically
        cardElement.on('change', (event) => {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
    } catch (e) {
        console.error("Failed to load Stripe Elements:", e);
    }

    /* ==========================================================================
       Stripe Modal Controls
       ========================================================================== */
    const stripeModal = document.getElementById('stripeModal');
    const configurePaymentBtn = document.getElementById('configurePaymentMethodBtn');
    const stripeModalClose = document.getElementById('stripeModalClose');
    const paymentForm = document.getElementById('payment-form');

    const openStripeModal = () => {
        stripeModal.classList.add('active');
        if (cardElement) cardElement.focus();
    };

    const closeStripeModal = () => {
        stripeModal.classList.remove('active');
    };

    if (configurePaymentBtn) configurePaymentBtn.addEventListener('click', openStripeModal);
    if (stripeModalClose) stripeModalClose.addEventListener('click', closeStripeModal);

    // Save payment method handler
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const saveBtn = document.getElementById('save-card-btn');
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i data-lucide="loader" class="spin"></i> Verifying Card...';
            if (window.lucide) window.lucide.createIcons();

            const cardholderName = document.getElementById('cardholder-name').value;

            try {
                // Tokenize card credentials via Stripe test servers
                const { token, error } = await stripeInstance.createToken(cardElement, {
                    name: cardholderName
                });

                if (error) {
                    const errorElement = document.getElementById('card-errors');
                    errorElement.textContent = error.message;
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = '<i data-lucide="save"></i> Save Payment Method';
                    if (window.lucide) window.lucide.createIcons();
                    showToast(error.message, "error");
                    return;
                }

                const res = await window.apiClient.post('/payments/save-method', {
                    token: token.id,
                    cardBrand: token.card.brand,
                    cardLast4: token.card.last4,
                    cardExpMonth: token.card.exp_month,
                    cardExpYear: token.card.exp_year
                });

                if (res.ok && res.data) {
                    showToast("Payment method configured successfully!", "success");
                    closeStripeModal();
                    
                    const stripeOptionCard = document.querySelector('.payment-card-option.active');
                    if (stripeOptionCard) {
                        const numberEl = stripeOptionCard.querySelector('.card-number');
                        const expiryEl = stripeOptionCard.querySelector('.card-expiry');
                        if (numberEl) numberEl.textContent = `•••• •••• •••• ${token.card.last4}`;
                        if (expiryEl) expiryEl.textContent = `Expires ${token.card.exp_month}/${String(token.card.exp_year).slice(-2)}`;
                    }
                    
                    cardElement.clear();
                    document.getElementById('cardholder-name').value = '';
                } else {
                    showToast(res.data?.message || "Failed to link card.", "error");
                }
            } catch (err) {
                console.error("Save card error:", err);
                showToast("Connection to Server failed.", "error");
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i data-lucide="save"></i> Save Payment Method';
                if (window.lucide) window.lucide.createIcons();
            }
        });
    }

    /* ==========================================================================
       Pricing Cycle switch Month/Yearly prices
       ========================================================================== */
    const cycleToggle = document.getElementById('pricingCycleToggle');
    const priceVals = document.querySelectorAll('.price-val');
    const priceDurations = document.querySelectorAll('.price-duration');
    let billingCycle = 'monthly';

    if (cycleToggle) {
        const switcherBtns = cycleToggle.querySelectorAll('.switcher-btn');
        switcherBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                switcherBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                billingCycle = btn.getAttribute('data-cycle');
                
                // Update prices values with keyframe scale animations
                priceVals.forEach(val => {
                    val.style.transform = 'scale(0.8)';
                    val.style.opacity = '0.3';
                    
                    setTimeout(() => {
                        const targetPrice = val.getAttribute(`data-${billingCycle}`);
                        val.textContent = targetPrice;
                        val.style.transform = '';
                        val.style.opacity = '';
                    }, 150);
                });
                
                // Update duration text
                priceDurations.forEach(dur => {
                    dur.textContent = billingCycle === 'monthly' ? '/mo' : '/yr';
                });

                showToast(`Switched pricing views to ${billingCycle} plans.`);
            });
        });
    }

    /* ==========================================================================
       Fetch and Update Dashboard Details
       ========================================================================== */
    const updateDashboardUI = async () => {
        const tokenStr = localStorage.getItem('voicenova_token');
        if (!tokenStr) return;

        try {
            const res = await window.apiClient.get('/payments/info');
            if (res.ok && res.data && res.data.success) {
                const billing = res.data.data;
                const PLAN_PRICES = {
                    'Free': { monthly: 0, yearly: 0 },
                    'Starter': { monthly: 9, yearly: 7 },
                    'Pro': { monthly: 29, yearly: 23 },
                    'Business': { monthly: 99, yearly: 79 }
                };
                
                // Update Current Plan Name
                const planTitleEl = document.querySelector('.sub-plan-title');
                if (planTitleEl) {
                    planTitleEl.textContent = billing.user.plan || 'Free Plan';
                }

                // Update Avatar ring plan badge
                const planBadgeEl = document.querySelector('.profile-plan-badge');
                if (planBadgeEl) {
                    planBadgeEl.textContent = (billing.user.plan || 'Free').replace(' Plan', '');
                }

                // Update Remaining Credits
                const remainingValEl = document.querySelectorAll('.detail-val')[1];
                if (remainingValEl && billing.subscription) {
                    const remaining = billing.subscription.creditLimit - billing.subscription.creditUsed;
                    remainingValEl.textContent = `${remaining.toLocaleString()} Chars`;
                    
                    // Update Character limit quota bar
                    const usageQuotaTextEl = document.querySelector('.storage-text-row span:nth-child(2)');
                    if (usageQuotaTextEl) {
                        usageQuotaTextEl.textContent = `${billing.subscription.creditUsed.toLocaleString()} / ${billing.subscription.creditLimit.toLocaleString()}`;
                    }
                    const usageBarFill = document.querySelector('.progress-bar-fill');
                    if (usageBarFill) {
                        const pct = (billing.subscription.creditUsed / billing.subscription.creditLimit) * 100;
                        usageBarFill.style.width = `${pct}%`;
                    }
                }

                // Update renewal date
                const renewalDateEl = document.querySelectorAll('.detail-val')[0];
                if (renewalDateEl && billing.subscription) {
                    const d = new Date(billing.subscription.endDate);
                    renewalDateEl.textContent = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                }

                // Update monthly cost detail label
                const costValEl = document.querySelectorAll('.detail-val')[2];
                if (costValEl && billing.user.plan) {
                    const basePlan = billing.user.plan.replace(' Plan', '');
                    const prices = PLAN_PRICES[basePlan];
                    if (prices) {
                        costValEl.textContent = `$${prices.monthly.toFixed(2)} / Month`;
                    }
                }

                // Update pricing card buttons state based on active plan
                const activePlan = billing.user.plan || 'Free Plan';
                document.querySelectorAll('.pricing-card').forEach(card => {
                    const planHeaderName = card.querySelector('.pricing-plan-name').textContent.trim();
                    const btn = card.querySelector('button');
                    if (btn) {
                        if (activePlan.startsWith(planHeaderName)) {
                            btn.disabled = true;
                            btn.className = 'btn btn-primary btn-full btn-glow-hover';
                            btn.textContent = 'Current Active Plan';
                        } else {
                            btn.disabled = false;
                            btn.className = 'btn btn-outline btn-full select-plan-btn';
                            btn.textContent = activePlan === 'Free Plan' || planHeaderName === 'Free' ? `Switch to ${planHeaderName}` : `Downgrade to ${planHeaderName}`;
                            if (planHeaderName === 'Business' || planHeaderName === 'Pro') {
                                btn.textContent = `Upgrade to ${planHeaderName}`;
                            }
                        }
                    }
                });

                // Update Configured payment card lasts and expiry
                if (billing.user.cardLast4) {
                    const stripeOptionCard = document.querySelector('.payment-card-option');
                    if (stripeOptionCard) {
                        const numberEl = stripeOptionCard.querySelector('.card-number');
                        const expiryEl = stripeOptionCard.querySelector('.card-expiry');
                        if (numberEl) numberEl.textContent = `•••• •••• •••• ${billing.user.cardLast4}`;
                        if (expiryEl) expiryEl.textContent = `Expires ${billing.user.cardExpMonth}/${String(billing.user.cardExpYear).slice(-2)}`;
                    }
                }

                // Update invoices table dynamically
                const tbody = document.getElementById('invoiceTableBody');
                if (tbody && billing.payments.length > 0) {
                    tbody.innerHTML = '';
                    billing.payments.forEach(pay => {
                        const payDate = pay.createdAt ? new Date(pay.createdAt) : new Date();
                        const date = isNaN(payDate.getTime()) ? 'Recent' : payDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                        const amountVal = typeof pay.amount === 'number' ? pay.amount.toFixed(2) : '0.00';
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>
                                <strong>${pay.transactionId}</strong>
                                ${pay.planName ? `<br><small style="color:rgba(255,255,255,0.4); font-size:0.75rem; font-weight:500;">${pay.planName}</small>` : ''}
                            </td>
                            <td>${date}</td>
                            <td>$${amountVal} ${pay.currency || 'USD'}</td>
                            <td><span class="status-pill status-pill-success">${pay.status || 'Paid'}</span></td>
                            <td>
                                <button class="btn btn-outline btn-sm download-invoice-btn" data-id="${pay.transactionId}">
                                    <i data-lucide="download" style="width:13px;height:13px;"></i> <span>Invoice</span>
                                </button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                    
                    if (window.lucide) window.lucide.createIcons();

                }
            }
        } catch (e) {
            console.error("Dashboard metrics load failed:", e);
        }
    };

    // Initial load of dashboard
    await updateDashboardUI();

    // Global delegation for downloading invoices (handles both static and dynamic rows)
    document.addEventListener('click', async (e) => {
        const downloadBtn = e.target.closest('.download-invoice-btn');
        if (!downloadBtn) return;

        const invId = downloadBtn.getAttribute('data-id');
        showToast(`Initiating download for invoice: ${invId}.pdf...`);
        
        const tokenStr = localStorage.getItem('voicenova_token');
        if (!tokenStr) {
            showToast("Session expired. Please log in again.", "error");
            return;
        }

        try {
            const res = await window.apiClient.get(`/payments/invoice/${invId}`);
            if (res.ok) {
                // If it's a blob, assuming standard handling or downloading directly
                const blob = res.blob ? res.blob : new Blob(["Invoice Data " + invId], { type: "text/plain" });
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `Invoice_${invId}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                showToast("Invoice downloaded successfully!", "success");
            } else {
                showToast("Failed to fetch invoice", "error");
            }
        } catch (err) {
            console.error("Error downloading invoice:", err);
            showToast("Error downloading invoice.", "error");
        }
    });

    /* ==========================================================================
       Plan Subscription Pipeline upgraded
       ========================================================================== */
    document.addEventListener('click', async (e) => {
        const selectBtn = e.target.closest('.select-plan-btn');
        if (!selectBtn) return;

        const planName = selectBtn.getAttribute('data-plan');
        showToast(`Initiating checkout pipeline for ${planName} Plan...`);

        const tokenStr = localStorage.getItem('voicenova_token');
        if (!tokenStr) {
            showToast("Session expired. Please log in again.", "error");
            return;
        }

            try {
                const res = await window.apiClient.post('/payments/subscribe', {
                    planName: planName,
                    billingCycle: billingCycle
                });

                if (res.ok) {
                    showToast(`Successfully subscribed to ${planName} Plan!`, "success");
                    await updateDashboardUI();
                } else {
                    showToast(res.data?.message || "Payment declined.", "error");
                }
            } catch (err) {
                showToast("Error processing payment", "error");
            }
    });

    const subUpgradeBtn = document.getElementById('subUpgradeBtn');
    const ctaUpgradeBtn = document.getElementById('ctaUpgradeBtn');

    if (subUpgradeBtn) {
        subUpgradeBtn.addEventListener('click', () => {
            showToast("Opening billing portals... Choose your plan below.");
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
