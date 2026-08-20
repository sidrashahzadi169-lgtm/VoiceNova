/* ==========================================================================
   VoiceNova Voice Library Catalog Interactive Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    /* ==========================================================================
       Global Toast Notification Utility
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
       Voices Master Database Catalog
       ========================================================================== */
    const voicesDatabase = [
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
            popularity: 98
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
            popularity: 95
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
            popularity: 88
        },
        {
            name: "Amina",
            gender: "female",
            lang: "ur",
            accent: "in", // south asian
            age: "adult",
            style: "Storytelling",
            emotion: "calm",
            avatarClass: "avatar-urdu",
            initials: "AM",
            desc: "Fluent, sweet and incredibly clear Urdu voiceover. Ideal for South Asian poetry, narrations and logs.",
            isFavorite: false,
            sample: "السلام علیکم۔ میں آمنہ ہوں۔ اردو شاعری اور کہانیاں سنانا میرا پسندیدہ کام ہے۔",
            popularity: 92
        },
        {
            name: "Tareq",
            gender: "male",
            lang: "ar",
            accent: "us", // arabic regional US code map
            age: "senior",
            style: "News",
            emotion: "serious",
            avatarClass: "avatar-arabic",
            initials: "TQ",
            desc: "Cinematic, formal and slow-paced Arabic orator. Tailored for documentary films and formal announcements.",
            isFavorite: false,
            sample: "مرحباً بكم. أنا طارق. أحدثكم بنبرة صوت سينمائية عميقة ومؤثرة.",
            popularity: 90
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
            sample: "नमस्ते! मैं प्रिया हूँ। मेरी आवाज़ ई-लर्निंग और ट्यूटोरियल्स के लिए बिलकुल सही है।",
            popularity: 85
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
            sample: "नमस्कार, मैं देव हूँ। पॉडकास्ट और बातचीत वाले प्रोजेक्ट्स के लिए मेरी आवाज़ का उपयोग करें।",
            popularity: 82
        },
        {
            name: "Can",
            gender: "male",
            lang: "tr",
            accent: "au", // turkish map
            age: "adult",
            style: "Storytelling",
            emotion: "serious",
            avatarClass: "avatar-arabic",
            initials: "CN",
            desc: "Expressive Turkish narrator with dark, heavy vocal weight. Perfect for historic chronicles.",
            isFavorite: false,
            sample: "Merhaba. Ben Can. Tarihî belgeseller ve dramatik hikâyeler için sesimi tercih edebilirsiniz.",
            popularity: 79
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
            popularity: 76
        },
        {
            name: "Amin",
            gender: "male",
            lang: "ar",
            accent: "in",
            age: "senior",
            style: "Educational",
            emotion: "calm",
            avatarClass: "avatar-urdu",
            initials: "AN",
            desc: "Gentle and formal senior Arabic scholar profile. Optimized for religious bayans and lectures.",
            isFavorite: false,
            sample: "مرحباً بكم. أنا أمين. أقدم لكم شروحات تعليمية ومحاضرات بلغة عربية فصحى.",
            popularity: 80
        }
    ];

    /* ==========================================================================
       DOM Elements Selector Queries
       ========================================================================== */
    const searchInput = document.getElementById('librarySearchInput');
    const sortSelect = document.getElementById('librarySortSelect');
    const favoriteFilterBtn = document.getElementById('favoriteFilterBtn');
    const favFilterIcon = document.getElementById('favFilterIcon');

    // Filter selectors
    const filterLanguage = document.getElementById('filterLanguage');
    const filterGender = document.getElementById('filterGender');
    const filterAge = document.getElementById('filterAge');
    const filterEmotion = document.getElementById('filterEmotion');
    const filterAccent = document.getElementById('filterAccent');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    // Categories tabs and card grids
    const categoryTabs = document.querySelectorAll('.tab-btn');
    const voicesGrid = document.getElementById('voicesGrid');
    const displayedCountLabel = document.getElementById('displayedCount');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    let currentCategory = 'all';
    let filterFavoritesOnly = false;
    let limitItems = 6;

    /* ==========================================================================
       Synthesis Engine Player previews
       ========================================================================== */
    const synthEngine = window.speechSynthesis;

    const playVoicePreview = (name, langLocale, sampleText) => {
        if (synthEngine) {
            synthEngine.cancel();
            const utterance = new SpeechSynthesisUtterance(sampleText);
            utterance.lang = langLocale;

            // Pick matches
            const voices = synthEngine.getVoices();
            let voiceMatch = null;
            
            if (langLocale === 'ur') {
                voiceMatch = voices.find(v => v.lang.startsWith('ur') || v.lang.startsWith('hi'));
            } else if (langLocale === 'ar') {
                voiceMatch = voices.find(v => v.lang.startsWith('ar'));
            } else if (langLocale === 'tr') {
                voiceMatch = voices.find(v => v.lang.startsWith('tr') || v.lang.startsWith('de') || v.lang.startsWith('it'));
            } else if (langLocale === 'hi') {
                voiceMatch = voices.find(v => v.lang.startsWith('hi'));
            } else {
                if (name === 'Aero') {
                    voiceMatch = voices.find(v => v.lang.startsWith('en') && v.name.includes('Male'));
                } else if (name === 'Lily') {
                    voiceMatch = voices.find(v => v.lang.startsWith('en') && v.name.includes('Hazel'));
                } else {
                    voiceMatch = voices.find(v => v.lang.startsWith('en') && v.name.includes('Samantha'));
                }
            }

            if (voiceMatch) utterance.voice = voiceMatch;
            
            showToast(`Playing audio preview for ${name}...`);
            synthEngine.speak(utterance);
        } else {
            showToast(`Vocal preview: "${sampleText}" (SpeechSynthesis unsupported)`);
        }
    };

    /* ==========================================================================
       Voice Rendering & Dynamic Filtering Engine
       ========================================================================== */
    const filterAndRenderVoices = () => {
        const query = searchInput.value.toLowerCase().trim();
        const sortVal = sortSelect.value;
        
        // Grab selectors values
        const langVal = filterLanguage.value;
        const genVal = filterGender.value;
        const ageVal = filterAge.value;
        const emoVal = filterEmotion.value;
        const accVal = filterAccent.value;

        // Apply filters
        let filtered = voicesDatabase.filter(voice => {
            // Search box matches
            const searchMatch = voice.name.toLowerCase().includes(query) || 
                                voice.style.toLowerCase().includes(query) || 
                                voice.desc.toLowerCase().includes(query);
            
            // Category Tab filter
            const categoryMatch = currentCategory === 'all' || voice.lang === currentCategory;
            
            // Favorites filter
            const favoriteMatch = !filterFavoritesOnly || voice.isFavorite;

            // Form Selectors filter
            const langMatch = langVal === 'all' || voice.lang === langVal;
            const genMatch = genVal === 'all' || voice.gender === genVal;
            const ageMatch = ageVal === 'all' || voice.age === ageVal;
            const emoMatch = emoVal === 'all' || voice.emotion === emoVal;
            const accMatch = accVal === 'all' || voice.accent === accVal;

            return searchMatch && categoryMatch && favoriteMatch && langMatch && genMatch && ageMatch && emoMatch && accMatch;
        });

        // Apply sorting
        if (sortVal === 'name-asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortVal === 'popularity') {
            filtered.sort((a, b) => b.popularity - a.popularity);
        }

        // Render card nodes
        voicesGrid.innerHTML = '';
        const renderList = filtered.slice(0, limitItems);
        displayedCountLabel.textContent = renderList.length;

        if (renderList.length === 0) {
            voicesGrid.innerHTML = `
                <div class="empty-results-card glass-panel" style="grid-column: span 3; padding: 40px; text-align: center; color: var(--color-text-muted);">
                    <i data-lucide="info" style="width: 32px; height: 32px; margin-bottom: 12px; color: var(--color-primary);"></i>
                    <p>No voice profiles match your filter settings. Try adjusting search queries or resetting filters.</p>
                </div>
            `;
            window.lucide.createIcons();
            loadMoreBtn.style.display = 'none';
            return;
        }

        renderList.forEach(voice => {
            const card = document.createElement('div');
            card.className = 'generation-card glass-panel';
            
            const heartFill = voice.isFavorite ? 'fill="currentColor" style="color:var(--color-error);"' : '';
            
            card.innerHTML = `
                <div class="voice-card-header-row" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div class="voice-avatar ${voice.avatarClass}">${voice.initials}</div>
                        <div class="voice-card-meta">
                            <h4 class="voice-name" style="font-size:1.05rem;">${voice.name}</h4>
                            <span class="voice-tag" style="font-size:0.75rem;">${voice.gender.toUpperCase()} • ${voice.age.toUpperCase()}</span>
                        </div>
                    </div>
                    
                    <button class="table-action-btn favorite-card-btn" data-voice="${voice.name}" title="Toggle Favorite" style="border-radius:50%; width:34px; height:34px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart" ${heartFill}>
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                        </svg>
                    </button>
                </div>
                
                <p style="font-size:0.82rem; line-height:1.5; color:var(--color-text-secondary); margin-bottom:16px;">${voice.desc}</p>
                
                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:20px;">
                    <span class="status-pill status-pill-success" style="font-size:0.68rem; padding:2px 8px;">${voice.style}</span>
                    <span class="status-pill" style="font-size:0.68rem; padding:2px 8px; background:rgba(255,255,255,0.05); color:var(--color-text-secondary); border:1px solid rgba(255,255,255,0.05);">${voice.emotion.toUpperCase()}</span>
                    <span class="status-pill" style="font-size:0.68rem; padding:2px 8px; background:rgba(0,194,255,0.08); color:var(--color-secondary); border:1px solid rgba(0,194,255,0.15);">${voice.accent.toUpperCase()}</span>
                </div>
                
                <div class="voice-card-actions">
                    <button class="btn btn-secondary btn-sm preview-btn" data-voice="${voice.name}"><i data-lucide="volume-2"></i> Preview</button>
                    <button class="btn btn-outline btn-sm select-btn" data-voice="${voice.name}"><i data-lucide="check"></i> Use Voice</button>
                </div>
            `;
            
            voicesGrid.appendChild(card);
            
            // Wire Card click handlers
            card.querySelector('.preview-btn').addEventListener('click', () => {
                playVoicePreview(voice.name, voice.lang, voice.sample);
            });
            
            card.querySelector('.select-btn').addEventListener('click', () => {
                // Set voice inside local storage to load on studio.html
                localStorage.setItem('selectedVoice', voice.name);
                showToast(`Voice actor set to ${voice.name}. Redirecting to studio...`);
                setTimeout(() => {
                    window.location.href = 'studio.html';
                }, 1200);
            });

            card.querySelector('.favorite-card-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                voice.isFavorite = !voice.isFavorite;
                showToast(voice.isFavorite ? `${voice.name} added to favorites.` : `${voice.name} removed from favorites.`);
                filterAndRenderVoices();
            });
        });

        window.lucide.createIcons();

        // Control load more displays
        if (filtered.length <= limitItems) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    };

    // Filters event listeners
    searchInput.addEventListener('input', filterAndRenderVoices);
    sortSelect.addEventListener('change', filterAndRenderVoices);
    filterLanguage.addEventListener('change', filterAndRenderVoices);
    filterGender.addEventListener('change', filterAndRenderVoices);
    filterAge.addEventListener('change', filterAndRenderVoices);
    filterEmotion.addEventListener('change', filterAndRenderVoices);
    filterAccent.addEventListener('change', filterAndRenderVoices);

    // Toggle favorites filter button
    favoriteFilterBtn.addEventListener('click', () => {
        filterFavoritesOnly = !filterFavoritesOnly;
        favoriteFilterBtn.classList.toggle('active');
        if (filterFavoritesOnly) {
            favoriteFilterBtn.style.background = 'rgba(239, 68, 68, 0.1)';
            favoriteFilterBtn.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            favoriteFilterBtn.style.color = 'var(--color-error)';
        } else {
            favoriteFilterBtn.style.background = '';
            favoriteFilterBtn.style.borderColor = '';
            favoriteFilterBtn.style.color = '';
        }
        filterAndRenderVoices();
    });

    // Categories tabs clicks
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.getAttribute('data-category');
            limitItems = 6; // reset pagination limit
            filterAndRenderVoices();
        });
    });

    // Load more pagination click
    loadMoreBtn.addEventListener('click', () => {
        limitItems += 6;
        filterAndRenderVoices();
    });

    // Reset filters
    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterLanguage.value = 'all';
        filterGender.value = 'all';
        filterAge.value = 'all';
        filterEmotion.value = 'all';
        filterAccent.value = 'all';
        sortSelect.value = 'featured';
        
        filterFavoritesOnly = false;
        favoriteFilterBtn.classList.remove('active');
        favoriteFilterBtn.style.background = '';
        favoriteFilterBtn.style.borderColor = '';
        favoriteFilterBtn.style.color = '';
        
        categoryTabs.forEach(t => t.classList.remove('active'));
        categoryTabs[0].classList.add('active');
        currentCategory = 'all';
        
        limitItems = 6;
        filterAndRenderVoices();
        showToast("Filters reset successfully.");
    });

    /* ==========================================================================
       Populate Right Panel Widgets Lists
       ========================================================================== */
    const recentlyUsedList = document.getElementById('recentlyUsedList');
    const recommendedList = document.getElementById('recommendedList');
    const trendingList = document.getElementById('trendingList');

    const rightPanelData = {
        recent: [
            { name: "Nova", tag: "Female - Narrative", initials: "NV", bg: "avatar-nova" },
            { name: "Aero", tag: "Male - Podcast", initials: "AR", bg: "avatar-aero" }
        ],
        recom: [
            { name: "Amina", tag: "Urdu - Storytelling", initials: "AM", bg: "avatar-urdu" },
            { name: "Lily", tag: "Child - bright", initials: "LY", bg: "avatar-child" }
        ],
        trend: [
            { name: "Nova", tag: "98% popular rating", initials: "NV", bg: "avatar-nova" },
            { name: "Tareq", tag: "90% popular rating", initials: "TQ", bg: "avatar-arabic" }
        ]
    };

    const populateMiniList = (element, list) => {
        element.innerHTML = '';
        list.forEach(item => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.justifyContent = 'space-between';
            row.style.padding = '8px 0';
            row.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
            
            row.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" class="mini-voice-trigger" data-voice="${item.name}">
                    <div class="voice-avatar ${item.bg}" style="width:30px; height:30px; font-size:0.7rem;">${item.initials}</div>
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-size:0.82rem; font-weight:600; color:var(--color-text);">${item.name}</span>
                        <span style="font-size:0.68rem; color:var(--color-text-muted);">${item.tag}</span>
                    </div>
                </div>
                <button class="table-action-btn select-mini-btn" data-voice="${item.name}" title="Use Voice" style="width:28px; height:28px; border-radius:6px;">
                    <i data-lucide="chevron-right" style="width:12px; height:12px;"></i>
                </button>
            `;
            
            element.appendChild(row);
            
            // Wire click handlers on mini list elements
            row.querySelector('.mini-voice-trigger').addEventListener('click', () => {
                const matchObj = voicesDatabase.find(v => v.name === item.name);
                if (matchObj) playVoicePreview(matchObj.name, matchObj.lang, matchObj.sample);
            });
            
            row.querySelector('.select-mini-btn').addEventListener('click', () => {
                localStorage.setItem('selectedVoice', item.name);
                showToast(`Voice actor set to ${item.name}. Redirecting...`);
                setTimeout(() => {
                    window.location.href = 'studio.html';
                }, 1200);
            });
        });
    };

    populateMiniList(recentlyUsedList, rightPanelData.recent);
    populateMiniList(recommendedList, rightPanelData.recom);
    populateMiniList(trendingList, rightPanelData.trend);

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

    // Run initial voice catalog load
    filterAndRenderVoices();
});
