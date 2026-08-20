/* ==========================================================================
   VoiceNova Dedicated Generate Voice Studio Interactive Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Redirect to login if unauthenticated
    if (!localStorage.getItem('voicenova_token')) {
        window.location.href = 'login.html';
        return;
    }


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

    // Inject Toast keyframe animations
    try {
        const styleSheet = document.styleSheets[0];
        styleSheet.insertRule(`
            @keyframes slideIn {
                from { transform: translateX(120%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `, styleSheet.cssRules.length);
        styleSheet.insertRule(`
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(120%); opacity: 0; }
            }
        `, styleSheet.cssRules.length);
    } catch(e) {}

    /* ==========================================================================
       Sidebar Drawer Toggles for Mobile
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
       Script Editor Logic (Char count limits, imports, clipboard paste)
       ========================================================================== */
    const studioTextArea = document.getElementById('studioTextArea');
    const studioCharCount = document.getElementById('studioCharCount');
    const importFileBtn = document.getElementById('importFileBtn');
    const pasteClipboardBtn = document.getElementById('pasteClipboardBtn');
    const clearEditorBtn = document.getElementById('clearEditorBtn');
    const insertPauseBtn = document.getElementById('insertPauseBtn');
    const saveStatusLabel = document.getElementById('saveStatusLabel');

    const updateCharCount = () => {
        const count = studioTextArea.value.length;
        studioCharCount.textContent = count;
        if (count >= 10000) {
            studioCharCount.style.color = 'var(--color-error)';
        } else {
            studioCharCount.style.color = '';
        }
    };

    studioTextArea.addEventListener('input', updateCharCount);

    // Paste text from system clipboard
    pasteClipboardBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                const start = studioTextArea.selectionStart;
                const end = studioTextArea.selectionEnd;
                studioTextArea.value = studioTextArea.value.substring(0, start) + text + studioTextArea.value.substring(end);
                updateCharCount();
                showToast("Text pasted from clipboard.");
            } else {
                showToast("Clipboard is empty or permissions denied.", "error");
            }
        } catch (err) {
            showToast("Failed to read clipboard data.", "error");
        }
    });

    // Clear script editor
    clearEditorBtn.addEventListener('click', () => {
        studioTextArea.value = '';
        updateCharCount();
        showToast("Script editor cleared.");
    });

    // Insert 1s pause tag
    insertPauseBtn.addEventListener('click', () => {
        const text = studioTextArea.value;
        const start = studioTextArea.selectionStart;
        const end = studioTextArea.selectionEnd;
        const pauseTag = "[pause: 1.0s]";
        
        studioTextArea.value = text.substring(0, start) + pauseTag + text.substring(end);
        studioTextArea.focus();
        studioTextArea.selectionStart = start + pauseTag.length;
        studioTextArea.selectionEnd = start + pauseTag.length;
        
        updateCharCount();
        showToast("Pause tag inserted.");
    });

    // Mock Import text file
    importFileBtn.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.doc,.docx';
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    studioTextArea.value = e.target.result;
                    updateCharCount();
                    showToast(`Imported file: ${file.name}`);
                };
                reader.readAsText(file);
            }
        });
        fileInput.click();
    });

    // Simulated Auto-Save loop indicator
    setInterval(() => {
        saveStatusLabel.textContent = "Saving...";
        saveStatusLabel.style.color = 'var(--color-secondary)';
        
        setTimeout(() => {
            saveStatusLabel.textContent = "Auto-saved";
            saveStatusLabel.style.color = '';
            
            // Flash save status dot
            const dot = document.querySelector('.save-dot');
            if (dot) {
                dot.style.background = 'var(--color-success)';
                dot.style.boxShadow = '0 0 6px var(--color-success)';
                setTimeout(() => {
                    dot.style.background = '';
                    dot.style.boxShadow = '';
                }, 1000);
            }
        }, 1200);
    }, 15000);

    /* ==========================================================================
       Vocal Sliders UI Displays
       ========================================================================== */
    const speed = document.getElementById('sliderSpeed');
    const valSpeed = document.getElementById('valSpeed');
    const pitch = document.getElementById('sliderPitch');
    const valPitch = document.getElementById('valPitch');
    const stability = document.getElementById('sliderStability');
    const valStability = document.getElementById('valStability');
    const clarity = document.getElementById('sliderClarity');
    const valClarity = document.getElementById('valClarity');

    speed.addEventListener('input', () => {
        valSpeed.textContent = `${parseFloat(speed.value).toFixed(2)}x`;
    });

    pitch.addEventListener('input', () => {
        const val = parseInt(pitch.value);
        valPitch.textContent = val >= 0 ? `+${val}%` : `${val}%`;
    });

    stability.addEventListener('input', () => {
        valStability.textContent = `${stability.value}%`;
    });

    clarity.addEventListener('input', () => {
        valClarity.textContent = `${clarity.value}%`;
    });

    /* ==========================================================================
       Voice Config Search filtering
       ========================================================================== */
    const voiceSearchInput = document.getElementById('voiceSearchInput');
    const selectVoiceDropdown = document.getElementById('studioVoice');

    voiceSearchInput.addEventListener('input', () => {
        const query = voiceSearchInput.value.toLowerCase().trim();
        const options = selectVoiceDropdown.options;
        
        let matchFound = false;
        for (let i = 0; i < options.length; i++) {
            const optText = options[i].text.toLowerCase();
            if (optText.includes(query)) {
                selectVoiceDropdown.selectedIndex = i;
                matchFound = true;
                break;
            }
        }
        
        if (query.length > 0 && !matchFound) {
            // silent fail or small indicator
        }
    });

    /* ==========================================================================
       Interactive Audio Synthesis & Visualizer Player
       ========================================================================== */
    const generateVoiceBtn = document.getElementById('generateVoiceBtn');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stopAudioBtn = document.getElementById('stopAudioBtn');
    const waveformStatus = document.getElementById('waveformStatus');
    
    // Export buttons
    const downloadMp3Btn = document.getElementById('downloadMp3Btn');
    const downloadWavBtn = document.getElementById('downloadWavBtn');
    const copyShareLinkBtn = document.getElementById('copyShareLinkBtn');
    const shareEmailBtn = document.getElementById('shareEmailBtn');

    // Scrubber elements
    const playerCurrentTimeLabel = document.getElementById('playerCurrentTime');
    const playerDurationLabel = document.getElementById('playerDuration');
    const playerScrubber = document.getElementById('playerScrubber');
    const playerScrubberFill = document.getElementById('playerScrubberFill');
    const playerCanvas = document.getElementById('studioPlayerCanvas');
    const playerCtx = playerCanvas.getContext('2d');

    let synthEngine = window.speechSynthesis;
    let playUtterance = null;
    let isPlaying = false;
    let isSynthesized = false;
    
    let simulatedDuration = 5.0;
    let startTime = 0;
    let scrubberTimer = null;
    let renderAnimId = null;
    let scrubberProgress = 0;

    const resizePlayerCanvas = () => {
        playerCanvas.width = playerCanvas.parentElement.clientWidth;
        playerCanvas.height = playerCanvas.parentElement.clientHeight;
    };
    resizePlayerCanvas();
    window.addEventListener('resize', resizePlayerCanvas);

    // Audio scrubber format timer
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Draw active audio visualizer waveform on player canvas
    const drawPlayerWaveform = (isActive) => {
        playerCtx.clearRect(0, 0, playerCanvas.width, playerCanvas.height);
        const w = playerCanvas.width;
        const h = playerCanvas.height;
        const centerY = h / 2;
        
        const count = 60; // bar density
        const gap = 3;
        const barWidth = (w / count) - gap;
        
        for (let i = 0; i < count; i++) {
            const ratio = i / count;
            
            // Wave signature curve
            let val = Math.sin(ratio * Math.PI * 6) * 0.35 + 0.5;
            val += Math.cos(ratio * Math.PI * 14) * 0.15;
            val = Math.max(0.08, val);
            
            if (isActive && isPlaying) {
                val *= (Math.random() * 0.5 + 0.75);
            }
            
            const barHeight = val * h * 0.7;
            const isPlayed = ratio <= scrubberProgress;
            
            if (isPlayed) {
                playerCtx.fillStyle = 'rgba(0, 194, 255, 0.85)';
            } else {
                playerCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            }
            
            const x = i * (barWidth + gap);
            const y = centerY - barHeight / 2;
            
            playerCtx.beginPath();
            playerCtx.roundRect(x, y, barWidth, barHeight, 1.5);
            playerCtx.fill();
        }
        
        if (isActive && isPlaying) {
            renderAnimId = requestAnimationFrame(() => drawPlayerWaveform(true));
        }
    };

    drawPlayerWaveform(false);

    const stopPlayback = () => {
        isPlaying = false;
        if (synthEngine && synthEngine.speaking) {
            synthEngine.cancel();
        }
        clearInterval(scrubberTimer);
        cancelAnimationFrame(renderAnimId);
        
        playPauseBtn.innerHTML = '<i data-lucide="play" id="playIcon"></i>';
        window.lucide.createIcons();
        
        scrubberProgress = 0;
        playerScrubberFill.style.width = '0%';
        playerCurrentTimeLabel.textContent = '0:00';
        
        waveformStatus.style.display = 'flex';
        waveformStatus.innerHTML = '<span>Playback Stopped</span>';
        drawPlayerWaveform(false);
    };

    const togglePlayback = () => {
        if (!isSynthesized) return;

        const text = studioTextArea.value.trim();
        if (!text) return;

        if (isPlaying) {
            // Pause
            isPlaying = false;
            if (synthEngine) synthEngine.pause();
            clearInterval(scrubberTimer);
            cancelAnimationFrame(renderAnimId);
            playPauseBtn.innerHTML = '<i data-lucide="play" id="playIcon"></i>';
            window.lucide.createIcons();
            waveformStatus.style.display = 'flex';
            waveformStatus.innerHTML = '<span>Paused</span>';
            return;
        }

        // Play
        isPlaying = true;
        playPauseBtn.innerHTML = '<i data-lucide="pause" id="playIcon"></i>';
        window.lucide.createIcons();
        
        waveformStatus.style.display = 'none';
        
        const speedVal = parseFloat(speed.value);
        simulatedDuration = Math.max(2.5, (text.length * 0.05) / speedVal);
        playerDurationLabel.textContent = formatTime(simulatedDuration);

        if (synthEngine) {
            if (synthEngine.paused) {
                synthEngine.resume();
            } else {
                synthEngine.cancel();
                playUtterance = new SpeechSynthesisUtterance(text);
                playUtterance.rate = speedVal;
                
                const speaker = selectVoiceDropdown.value;
                const voices = synthEngine.getVoices();
                let matchingVoice = null;
                
                if (speaker === 'Amina') {
                    matchingVoice = voices.find(v => v.lang.startsWith('ur') || v.lang.startsWith('hi'));
                } else if (speaker === 'Tareq') {
                    matchingVoice = voices.find(v => v.lang.startsWith('ar'));
                } else if (speaker === 'Lily') {
                    matchingVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Hazel') || v.name.includes('Google US English') || v.name.includes('Female')));
                } else if (speaker === 'Aero') {
                    matchingVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George')));
                } else {
                    matchingVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Female')));
                }

                if (matchingVoice) playUtterance.voice = matchingVoice;
                
                playUtterance.onend = () => stopPlayback();
                playUtterance.onerror = () => stopPlayback();
                
                synthEngine.speak(playUtterance);
            }
        }

        startTime = Date.now() - (scrubberProgress * simulatedDuration * 1000);
        drawPlayerWaveform(true);

        scrubberTimer = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            scrubberProgress = Math.min(1.0, elapsed / simulatedDuration);
            
            playerScrubberFill.style.width = `${scrubberProgress * 100}%`;
            playerCurrentTimeLabel.textContent = formatTime(Math.min(simulatedDuration, elapsed));
            
            if (scrubberProgress >= 1.0) {
                stopPlayback();
            }
        }, 30);
    };

    playPauseBtn.addEventListener('click', togglePlayback);
    stopAudioBtn.addEventListener('click', stopPlayback);

    // Scrubber click scrubbing
    playerScrubber.addEventListener('click', (e) => {
        if (!isSynthesized) return;
        
        const rect = playerScrubber.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.min(1.0, Math.max(0, clickX / width));
        
        if (isPlaying) {
            scrubberProgress = percentage;
            playerScrubberFill.style.width = `${percentage * 100}%`;
            const elapsed = percentage * simulatedDuration;
            playerCurrentTimeLabel.textContent = formatTime(elapsed);
            startTime = Date.now() - (elapsed * 1000);
        }
    });

    // Voice synthesis triggers
    generateVoiceBtn.addEventListener('click', async () => {
        const text = studioTextArea.value.trim();
        if (!text) {
            showToast("Speech script editor is empty!", "error");
            return;
        }

        // Disable UI, load button spinner
        generateVoiceBtn.classList.add('btn-loading');
        waveformStatus.style.display = 'flex';
        waveformStatus.innerHTML = '<span>Initializing synthesis model...</span>';
        
        try {
            const voiceSelect = document.getElementById('studioVoice');
            const voiceName = voiceSelect?.value || 'Aero';
            const voiceId = voiceSelect?.options[voiceSelect.selectedIndex]?.getAttribute('data-voice-id') || 'EXAVITQu4vr4xnSDxMaL';

            const res = await window.apiClient.post('/elevenlabs/synthesize', {
                voiceId,
                voiceName,
                text,
                speed: parseFloat(document.getElementById('sliderSpeed')?.value || '1.0'),
                stability: parseInt(document.getElementById('sliderStability')?.value || '75'),
                similarity_boost: parseInt(document.getElementById('sliderClarity')?.value || '80')
            });

            if (!res.ok || !res.data.success) {
                throw new Error(res.data.message || 'Server synthesis failed');
            }

            const { audioUrl, duration } = res.data.data;
            window.lastGeneratedAudioUrl = 'http://localhost:5000' + audioUrl;
            
            generateVoiceBtn.classList.remove('btn-loading');
            isSynthesized = true;
            showToast("Vocal synthesis completed successfully!");
            
            // Activate Player Controls
            playPauseBtn.disabled = false;
            stopAudioBtn.disabled = false;
            
            if (!window.studioAudioPlayer) {
                window.studioAudioPlayer = new Audio();
            }
            window.studioAudioPlayer.src = window.lastGeneratedAudioUrl;
            
            // Wait for metadata to load to get duration
            window.studioAudioPlayer.onloadedmetadata = () => {
                simulatedDuration = duration || window.studioAudioPlayer.duration;
                playerDurationLabel.textContent = formatTime(simulatedDuration);
            };
            
            // Activate Exporter actions
            downloadMp3Btn.disabled = false;
            downloadWavBtn.disabled = false;
            copyShareLinkBtn.disabled = false;
            shareEmailBtn.disabled = false;
            
            waveformStatus.innerHTML = '<span>Audio Stream Ready</span>';
            drawPlayerWaveform(false);
            
        } catch (error) {
            console.error("Local JS Error:", error);
            generateVoiceBtn.classList.remove('btn-loading');
            waveformStatus.innerHTML = `<span>Generation Error</span>`;
            showToast('Generation error: ' + error.message, 'error');
        }
    });

    /* ==========================================================================
       Exporter Click Listeners
       ========================================================================== */
    const triggerDownload = (filename) => {
        if (!window.lastGeneratedAudioUrl) {
            showToast("No generated audio available to download", "error");
            return;
        }
        // Since we are using an external API directly, open it in a new tab to let the browser handle the download/save prompt.
        window.open(window.lastGeneratedAudioUrl, '_blank');
    };

    downloadMp3Btn.addEventListener('click', () => {
        showToast("Exporting audio: VoiceNova_Studio_Output.mp3");
        triggerDownload("VoiceNova_Studio_Output.mp3");
    });

    downloadWavBtn.addEventListener('click', () => {
        showToast("Exporting studio WAV file... (Lossless PCM 1411kbps)");
        triggerDownload("VoiceNova_Studio_Output.wav");
    });

    copyShareLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(`https://voicenova.ai/share/studio_${Math.random().toString(36).substring(2, 7)}`);
        showToast("Studio share link copied to clipboard!");
    });

    shareEmailBtn.addEventListener('click', () => {
        showToast("Project shared successfully!");
    });

    /* ==========================================================================
       Quick Studio Templates Insert Script Animators
       ========================================================================== */
    const studioTemplatePres = {
        youtube: "Hey guys! Welcome back to the channel. Today, we're exploring the future of real-time voice synthesis engines. Make sure to hit that subscribe button, drop a thumbs up, and let's get started.",
        facebook: "What is going on guys? 🚀 Quick update: this entire voice clip is synthesized using artificial intelligence. How clean does it sound? Drop a comment below and share this video!",
        tiktok: "POV: You cloned your voice in exactly 10 seconds, and it sounds cleaner than a studio microphone. Start cloning yours free on VoiceNova right now! #voiceclone #aivoice #nova",
        podcast: "Welcome back to the Tech Horizon Podcast. In today's episode, we discuss semantic cloning, vocal asset rights, and deep learning pipelines. Let's take a quick 1-second pause to hear the breathing detail in this synthesizer.",
        ad: "Looking for studio-grade voice narration without the voice actor costs? Welcome to VoiceNova. Synthesize emotional, high-fidelity scripts in seconds. Access over 200 distinct actors globally.",
        audiobook: "Chapter One. The shadow fell across the ancient slate pathway. Lord Alastair paused, listening to the strange frequencies shifting in the cold air. He spoke in a low, narrative tone, wondering if the voices were real...",
        bayan: "السلام عليكم ورحمة الله وبركاته. In today's speech, we discuss the blessings of sincerity, unity, and peace. Let us reflect on how we can cultivate tranquility in our hearts and minds.",
        lecture: "Good morning, everyone. In today's lecture, we will study the mathematical proofs behind deep convolutional layers, semantic voice mapping, and frequency calibrations. Let's start with basic calculations."
    };

    const simulateAIScriptTyping = (targetText) => {
        // Reset player state
        stopPlayback();
        isSynthesized = false;
        playPauseBtn.disabled = true;
        stopAudioBtn.disabled = true;
        downloadMp3Btn.disabled = true;
        downloadWavBtn.disabled = true;
        copyShareLinkBtn.disabled = true;
        shareEmailBtn.disabled = true;
        waveformStatus.innerHTML = '<span>Ready for Synthesis</span>';
        
        studioTextArea.value = '';
        updateCharCount();
        
        let index = 0;
        const typingTimer = setInterval(() => {
            if (index < targetText.length) {
                studioTextArea.value += targetText.charAt(index);
                index++;
                updateCharCount();
            } else {
                clearInterval(typingTimer);
                showToast("Template script loaded.", "success");
            }
        }, 15);
    };

    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            const template = card.getAttribute('data-template');
            if (studioTemplatePres[template]) {
                showToast(`Loading ${card.textContent.trim()} Preset...`);
                simulateAIScriptTyping(studioTemplatePres[template]);
                
                // Map presets to language dropdowns automatically
                if (template === 'bayan') {
                    document.getElementById('studioLanguage').value = 'ur';
                    document.getElementById('studioVoice').value = 'Amina';
                } else {
                    document.getElementById('studioLanguage').value = 'en';
                    if (template === 'audiobook') {
                        document.getElementById('studioVoice').value = 'Aero';
                    } else {
                        document.getElementById('studioVoice').value = 'Nova';
                    }
                }
            }
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
        renderAnimId = requestAnimationFrame(drawBackgroundWaveforms);
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

    // Check if voice was selected from Voice Library
    const preselectedVoice = localStorage.getItem('selectedVoice');
    if (preselectedVoice && typeof selectVoiceDropdown !== 'undefined' && selectVoiceDropdown) {
        selectVoiceDropdown.value = preselectedVoice;
        // set matching language
        const studioLangDropdown = document.getElementById('studioLanguage');
        if (studioLangDropdown) {
            if (preselectedVoice === 'Amina') {
                studioLangDropdown.value = 'ur';
            } else if (preselectedVoice === 'Tareq') {
                studioLangDropdown.value = 'ar';
            } else {
                studioLangDropdown.value = 'en';
            }
        }
        showToast(`Loaded voice profile for ${preselectedVoice}!`);
        localStorage.removeItem('selectedVoice');
    }

    // Check if script was pre-selected from Projects list
    const preselectedScript = localStorage.getItem('selectedScript');
    if (preselectedScript && typeof studioTextArea !== 'undefined' && studioTextArea) {
        studioTextArea.value = `This is the synthesized script content for project: "${preselectedScript}". Edit these text lines or add emotions sliders.`;
        updateCharCount();
        showToast(`Loaded project script draft!`);
        localStorage.removeItem('selectedScript');
    }

    // Custom check: make sure sidebar links redirect correctly
    document.querySelector('.logout-link').addEventListener('click', () => {
        showToast("Logged out successfully.");
    });
});
