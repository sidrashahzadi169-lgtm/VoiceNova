/* ==========================================================================
   VoiceNova Help & Support Center Page Interactive Logic
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
        toast.style.zIndex = '5000';
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
       Expandable FAQ Accordions Logic
       ========================================================================== */
    const accordionItems = document.querySelectorAll('.faq-accordion-item');
    
    accordionItems.forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.querySelector('.faq-answer-pane');
            const icon = item.querySelector('i');
            
            const isOpen = answer.style.display === 'block';
            
            // Close other accordions
            accordionItems.forEach(other => {
                other.querySelector('.faq-answer-pane').style.display = 'none';
                other.querySelector('i').style.transform = 'rotate(0deg)';
            });

            if (!isOpen) {
                answer.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
            } else {
                answer.style.display = 'none';
                icon.style.transform = 'rotate(0deg)';
            }
        });
    });

    /* ==========================================================================
       Help Center search match logs
       ========================================================================== */
    const searchInput = document.getElementById('helpArticleSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query.length > 0) {
                    showToast(`Searching knowledge base articles matching: "${query}"`);
                }
            }
        });
    }

    const categoryCards = document.querySelectorAll('.help-category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const cat = card.getAttribute('data-category');
            showToast(`Loading catalog folder: ${cat.toUpperCase()}`);
        });
    });

    /* ==========================================================================
       Ticket submission overlay modal
       ========================================================================== */
    const submitTicketBtn = document.getElementById('btnSupportSubmitTicket');
    const modalOverlay = document.getElementById('ticketModalOverlay');
    const modalCloseBtn = document.getElementById('btnTicketModalClose');
    const ticketForm = document.getElementById('supportTicketSubmitForm');

    if (submitTicketBtn) {
        submitTicketBtn.addEventListener('click', () => {
            modalOverlay.style.display = 'flex';
        });
    }

    const closeModal = () => {
        modalOverlay.style.display = 'none';
        ticketForm.reset();
    };

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    if (ticketForm) {
        ticketForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast("Submitting your support query to administrators...");
            
            setTimeout(() => {
                showToast("Ticket submitted successfully! ID: #TICK-103", "success");
                closeModal();
            }, 1500);
        });
    }

    /* ==========================================================================
       Live Chat link integration
       ========================================================================== */
    const liveChatBtn = document.getElementById('btnSupportLiveChat');
    const assistantOverlay = document.getElementById('aiAssistantOverlay');

    if (liveChatBtn) {
        liveChatBtn.addEventListener('click', () => {
            assistantOverlay.classList.add('active');
            const chatInput = document.getElementById('chatInputMessage');
            if (chatInput) chatInput.focus();
            showToast("Live chat session initiated.");
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
