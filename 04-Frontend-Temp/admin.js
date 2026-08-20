/* ==========================================================================
   VoiceNova Enterprise Admin Dashboard Panel Interactive Logic
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
       Sidebar Tab Navigation Switcher Logic
       ========================================================================== */
    const navLinks = document.querySelectorAll('[data-admin-tab]');
    const breadcrumbLabel = document.getElementById('breadTabName');
    const tabPanes = {
        'dashboard': document.getElementById('paneDashboard'),
        'users': document.getElementById('paneUsers'),
        'voices': document.getElementById('paneVoices'),
        'payments': document.getElementById('panePayments'),
        'analytics': document.getElementById('paneAnalytics'),
        'tickets': document.getElementById('paneTickets'),
        'system': document.getElementById('paneSystem'),
        'settings': document.getElementById('paneSettings')
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const tabKey = link.getAttribute('data-admin-tab');
            
            // Switch tabs visibility
            Object.keys(tabPanes).forEach(key => {
                if (key === tabKey) {
                    tabPanes[key].style.display = 'block';
                } else {
                    tabPanes[key].style.display = 'none';
                }
            });

            // Update header breadcrumb
            const labelText = link.querySelector('span').textContent;
            breadcrumbLabel.textContent = `${labelText} Manager`;
        });
    });

    // Shortcut button on dashboard linking to tickets
    const navTicketsBtn = document.getElementById('btnAdminNavTickets');
    if (navTicketsBtn) {
        navTicketsBtn.addEventListener('click', () => {
            const ticketNavLink = document.querySelector('[data-admin-tab="tickets"]');
            if (ticketNavLink) ticketNavLink.click();
        });
    }

    /* ==========================================================================
       Users Management Master Data & Search Operations
       ========================================================================== */
    let usersDatabase = [
        { id: 1, name: "Sidra Rehman", email: "sidra.rehman@voicenova.ai", plan: "Pro Plan", registered: "July 1, 2026", status: "Active" },
        { id: 2, name: "Alex Morgan", email: "alex.morgan@example.com", plan: "Free Plan", registered: "June 30, 2026", status: "Active" },
        { id: 3, name: "Sarah Jenkins", email: "sarah.j@agency.co", plan: "Enterprise", registered: "June 28, 2026", status: "Active" },
        { id: 4, name: "Omar Farooq", email: "omar.f@domain.pk", plan: "Pro Plan", registered: "June 25, 2026", status: "Suspended" },
        { id: 5, name: "Ayesha Khan", email: "ayesha@startup.io", plan: "Starter Plan", registered: "June 20, 2026", status: "Active" }
    ];

    const usersTableBody = document.getElementById('adminUsersTableBody');
    const usersSearch = document.getElementById('adminUsersSearch');
    const usersPlanFilter = document.getElementById('adminUserFilterPlan');

    const renderUsersTable = () => {
        if (!usersTableBody) return;
        usersTableBody.innerHTML = '';
        
        const query = usersSearch.value.toLowerCase().trim();
        const planFilterVal = usersPlanFilter.value;

        const filtered = usersDatabase.filter(user => {
            const searchMatch = user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
            const planMatch = planFilterVal === 'all' || user.plan.includes(planFilterVal);
            return searchMatch && planMatch;
        });

        filtered.forEach(user => {
            const tr = document.createElement('tr');
            
            const isSuspended = user.status === 'Suspended';
            const suspendText = isSuspended ? 'Activate' : 'Suspend';
            const statusClass = isSuspended ? 'status-pill-error' : 'status-pill-success';

            tr.innerHTML = `
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td>${user.plan}</td>
                <td>${user.registered}</td>
                <td><span class="status-pill ${statusClass}">${user.status}</span></td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-outline btn-xs btn-suspend-user" data-id="${user.id}">${suspendText}</button>
                        <button class="btn btn-secondary btn-xs btn-change-plan" data-id="${user.id}">Plan</button>
                        <button class="table-action-btn btn-delete-user" data-id="${user.id}" title="Delete User"><i data-lucide="trash-2" style="width:12px;height:12px;"></i></button>
                    </div>
                </td>
            `;

            usersTableBody.appendChild(tr);

            // Wire users row actions
            tr.querySelector('.btn-suspend-user').addEventListener('click', () => {
                user.status = isSuspended ? 'Active' : 'Suspended';
                showToast(`User ${user.name} status set to: ${user.status.toUpperCase()}`);
                renderUsersTable();
            });

            tr.querySelector('.btn-change-plan').addEventListener('click', () => {
                const newPlan = prompt(`Enter new plan for ${user.name} (Free Plan, Starter Plan, Pro Plan, Enterprise):`, user.plan);
                if (newPlan && newPlan.trim() !== '') {
                    user.plan = newPlan.trim();
                    showToast(`Updated plan for ${user.name} to ${user.plan}.`);
                    renderUsersTable();
                }
            });

            tr.querySelector('.btn-delete-user').addEventListener('click', () => {
                if (confirm(`Permanently delete account for ${user.name}?`)) {
                    usersDatabase = usersDatabase.filter(u => u.id !== user.id);
                    showToast(`User deleted.`);
                    renderUsersTable();
                }
            });
        });
        window.lucide.createIcons();
    };

    if (usersSearch) usersSearch.addEventListener('input', renderUsersTable);
    if (usersPlanFilter) usersPlanFilter.addEventListener('change', renderUsersTable);

    /* ==========================================================================
       AI Voices Master Database Management
       ========================================================================== */
    let voicesDatabase = [
        { id: 1, name: "Nova", gender: "Female", lang: "English", accent: "United States (US)", style: "Narration", featured: true },
        { id: 2, name: "Aero", gender: "Male", lang: "English", accent: "United Kingdom (UK)", style: "Podcast", featured: true },
        { id: 3, name: "Amina", gender: "Female", lang: "Urdu", accent: "Pakistan (PK)", style: "Storytelling", featured: false },
        { id: 4, name: "Tareq", gender: "Male", lang: "Arabic", accent: "United Arab Emirates (AE)", style: "News", featured: false }
    ];

    const voicesTableBody = document.getElementById('adminVoicesTableBody');
    const voicesSearch = document.getElementById('adminVoicesSearch');
    const btnAdminAddVoice = document.getElementById('btnAdminAddVoice');

    const renderVoicesTable = () => {
        if (!voicesTableBody) return;
        voicesTableBody.innerHTML = '';

        const query = voicesSearch.value.toLowerCase().trim();

        const filtered = voicesDatabase.filter(voice => {
            return voice.name.toLowerCase().includes(query) || voice.lang.toLowerCase().includes(query);
        });

        filtered.forEach(voice => {
            const tr = document.createElement('tr');
            
            const starClass = voice.featured ? 'fill="currentColor" style="color:var(--color-warning);"' : '';

            tr.innerHTML = `
                <td><div class="voice-avatar avatar-nova" style="width:28px;height:28px;font-size:0.65rem;">${voice.name.substring(0,2).toUpperCase()}</div></td>
                <td><strong>${voice.name}</strong></td>
                <td>${voice.gender}</td>
                <td>${voice.lang}</td>
                <td>${voice.accent}</td>
                <td><span class="status-pill status-pill-success" style="font-size:0.65rem; padding:2px 8px;">${voice.style}</span></td>
                <td>
                    <button class="table-action-btn btn-feature-voice" data-id="${voice.id}" style="border:none; background:transparent;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star" ${starClass}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </button>
                </td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button class="table-action-btn btn-edit-voice" data-id="${voice.id}" title="Edit Voice"><i data-lucide="edit"></i></button>
                        <button class="table-action-btn btn-delete-voice" data-id="${voice.id}" title="Delete Voice"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            `;

            voicesTableBody.appendChild(tr);

            // Action triggers
            tr.querySelector('.btn-feature-voice').addEventListener('click', () => {
                voice.featured = !voice.featured;
                showToast(voice.featured ? `Featured voice: ${voice.name}` : `Unfeatured voice.`);
                renderVoicesTable();
            });

            tr.querySelector('.btn-edit-voice').addEventListener('click', () => {
                const newName = prompt("Rename voice actor name:", voice.name);
                if (newName && newName.trim() !== '') {
                    voice.name = newName.trim();
                    showToast("Voice profile updated.");
                    renderVoicesTable();
                }
            });

            tr.querySelector('.btn-delete-voice').addEventListener('click', () => {
                if (confirm(`Remove voice actor ${voice.name} from public library catalog?`)) {
                    voicesDatabase = voicesDatabase.filter(v => v.id !== voice.id);
                    showToast("Voice actor profile deleted.");
                    renderVoicesTable();
                }
            });
        });
        window.lucide.createIcons();
    };

    if (voicesSearch) voicesSearch.addEventListener('input', renderVoicesTable);
    
    if (btnAdminAddVoice) {
        btnAdminAddVoice.addEventListener('click', () => {
            const name = prompt("Enter Voice Name:");
            if (!name) return;
            const lang = prompt("Enter Language (e.g. Urdu, English):", "English");
            const gender = prompt("Enter Gender (Male/Female):", "Female");
            
            const newVoice = {
                id: Date.now(),
                name: name.trim(),
                gender: gender.trim(),
                lang: lang.trim(),
                accent: "Global",
                style: "Podcast",
                featured: false
            };
            voicesDatabase.push(newVoice);
            showToast("New synthetic voice added to database.", "success");
            renderVoicesTable();
        });
    }

    /* ==========================================================================
       Payments, Subscription, and Refund history
       ========================================================================== */
    let paymentsDatabase = [
        { invoice: "INV-2026-006", client: "Sidra Rehman", date: "June 15, 2026", amt: "$29.00 USD", gateway: "Stripe", status: "Paid" },
        { invoice: "INV-2026-005", client: "Sarah Jenkins", date: "June 12, 2026", amt: "$99.00 USD", gateway: "Stripe", status: "Paid" },
        { invoice: "INV-2026-004", client: "Omar Farooq", date: "June 10, 2026", amt: "$29.00 USD", gateway: "PayPal", status: "Refund Pending" }
    ];

    const paymentsTableBody = document.getElementById('adminPaymentsTableBody');

    const renderPaymentsTable = () => {
        if (!paymentsTableBody) return;
        paymentsTableBody.innerHTML = '';

        paymentsDatabase.forEach(pay => {
            const tr = document.createElement('tr');
            
            let statusClass = 'status-pill-success';
            if (pay.status === 'Refund Pending') statusClass = 'status-pill-warning';
            if (pay.status === 'Refunded') statusClass = 'status-pill-muted';

            const refundButtonHtml = pay.status === 'Refund Pending' 
                ? `<button class="btn btn-outline btn-xs btn-process-refund" data-id="${pay.invoice}">Approve Refund</button>` 
                : `<span style="font-size:0.75rem; color:var(--color-text-muted);">None</span>`;

            tr.innerHTML = `
                <td><strong>${pay.invoice}</strong></td>
                <td>${pay.client}</td>
                <td>${pay.date}</td>
                <td>${pay.amt}</td>
                <td>${pay.gateway}</td>
                <td><span class="status-pill ${statusClass}">${pay.status}</span></td>
                <td>${refundButtonHtml}</td>
            `;

            paymentsTableBody.appendChild(tr);

            if (pay.status === 'Refund Pending') {
                tr.querySelector('.btn-process-refund').addEventListener('click', () => {
                    if (confirm(`Approve refund request of ${pay.amt} for ${pay.client}?`)) {
                        pay.status = 'Refunded';
                        showToast(`Refund processed for ${pay.client}.`, "success");
                        renderPaymentsTable();
                    }
                });
            }
        });
    };

    /* ==========================================================================
       Support Tickets Queue & Response Center
       ========================================================================== */
    let ticketsDatabase = [
        { id: 101, user: "Alex Morgan", cat: "Voice Cloning", subject: "Model stuck at 80%", date: "Today", priority: "High", msg: "I uploaded my dataset audio clips, but the voice model cloning is stuck at 80% capacity for 2 hours.", status: "Open" },
        { id: 102, user: "Sarah Jenkins", cat: "Billing", subject: "Requesting VAT Invoice COPY", date: "Yesterday", priority: "Medium", msg: "Please send a copy of Invoice INV-2026-006 with our VAT details added.", status: "Pending" }
    ];

    const ticketsTableBody = document.getElementById('adminTicketsTableBody');
    const ticketReplyBox = document.getElementById('adminTicketReplyBox');
    const ticketReplyForm = document.getElementById('adminTicketReplyForm');
    const ticketReplyMsg = document.getElementById('adminTicketReplyMsg');
    let activeTicket = null;

    const renderTicketsTable = () => {
        if (!ticketsTableBody) return;
        ticketsTableBody.innerHTML = '';

        ticketsDatabase.forEach(tick => {
            const tr = document.createElement('tr');
            
            let statusClass = 'status-pill-success';
            if (tick.status === 'Open') statusClass = 'status-pill-error';
            if (tick.status === 'Pending') statusClass = 'status-pill-warning';

            tr.innerHTML = `
                <td><strong>${tick.user}</strong></td>
                <td>${tick.cat}</td>
                <td>${tick.subject}</td>
                <td>${tick.date}</td>
                <td><span style="font-weight:600; color:${tick.priority === 'High' ? 'var(--color-error)' : 'var(--color-secondary)'};">${tick.priority}</span></td>
                <td><span class="status-pill ${statusClass}">${tick.status}</span></td>
            `;

            ticketsTableBody.appendChild(tr);

            tr.style.cursor = 'pointer';
            tr.addEventListener('click', () => {
                activeTicket = tick;
                // Highlight active row styling if needed
                ticketReplyBox.innerHTML = `
                    <p style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:4px;"><strong>Ticket #${tick.id}</strong> • Priority: ${tick.priority}</p>
                    <p style="font-weight:700; color:white; margin-bottom:6px;">Subject: ${tick.subject}</p>
                    <p style="background:rgba(255,255,255,0.02); padding:8px; border-radius:4px; font-style:italic;">"${tick.msg}"</p>
                `;
                ticketReplyForm.style.display = 'flex';
                ticketReplyMsg.focus();
            });
        });
    };

    if (ticketReplyForm) {
        ticketReplyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!activeTicket) return;

            const reply = ticketReplyMsg.value.trim();
            if (!reply) return;

            showToast(`Response sent to ${activeTicket.user}!`, "success");
            activeTicket.status = "Resolved";
            
            // Clear boxes
            ticketReplyMsg.value = '';
            ticketReplyBox.innerHTML = `Select an open support ticket to review the customer description and send an direct response message.`;
            ticketReplyForm.style.display = 'none';
            activeTicket = null;

            renderTicketsTable();
        });
    }

    /* ==========================================================================
       Admin settings save preferences
       ========================================================================== */
    const adminSaveBtn = document.getElementById('btnAdminSavePrefs');
    if (adminSaveBtn) {
        adminSaveBtn.addEventListener('click', () => {
            showToast("Global SaaS platform configuration preferences saved.", "success");
        });
    }

    // Settings checkbox pings
    const registerSwitchNotif = (elId, name) => {
        const sw = document.getElementById(elId);
        if (sw) {
            sw.addEventListener('change', () => {
                showToast(`Platform settings '${name}' toggled: ${sw.checked ? 'ON' : 'OFF'}`);
            });
        }
    };
    registerSwitchNotif('switchMaintenance', 'Maintenance Mode');
    registerSwitchNotif('switchRegistrations', 'New User Signups');
    registerSwitchNotif('switchDebugTrace', 'Detailed Debug Logging');

    /* ==========================================================================
       Scrolling Live Error Console Log Simulator
       ========================================================================== */
    const adminConsole = document.getElementById('adminConsolePre');
    const mockLogs = [
        "INFO: Webhook ping verification test sent to https://sidra.rehman/voicenova-webhooks - STATUS: 200 OK",
        "INFO: Quota limit warnings emailed to user @omar_f.",
        "INFO: Generated speech model 'Aero' instantiated for user @sidra_nova - length: 240 Chars.",
        "WARN: Database queries peak threshold limit of 800 reqs/sec hit.",
        "INFO: SSL pipeline encryption renewed successfully.",
        "INFO: Deleted expired audio buffer draft for project ID: proj_20260424."
    ];

    setInterval(() => {
        if (adminConsole) {
            const timeString = new Date().toISOString().replace('T', ' ').substring(0, 19);
            const randomLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
            adminConsole.textContent += `\n[${timeString}] ${randomLog}`;
            adminConsole.scrollTop = adminConsole.scrollHeight;
        }
    }, 4000);

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

    // Run initial data queries
    renderUsersTable();
    renderVoicesTable();
    renderPaymentsTable();
    renderTicketsTable();
});
