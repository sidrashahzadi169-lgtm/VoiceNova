/* ==========================================================================
   VoiceNova AI SaaS Studio Dashboard Upgraded JS Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Ensure Lucide icons are initialized
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

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
    });

    sidebarClose.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });

    /* ==========================================================================
       Animate Quota Progress Ring on Page Load
       ========================================================================== */
    const quotaProgressRing = document.getElementById('quotaProgressRing');
    if (quotaProgressRing) {
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        quotaProgressRing.style.strokeDasharray = `${circumference}`;
        quotaProgressRing.style.strokeDashoffset = `${circumference}`;
        
        // Trigger smooth sweep animation
        setTimeout(() => {
            const usagePercent = 45; // 45% used
            const offset = circumference - (usagePercent / 100) * circumference;
            quotaProgressRing.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            quotaProgressRing.style.strokeDashoffset = `${offset}`;
        }, 300);
    }

    /* ==========================================================================
       Text Editor Script Helpers
       ========================================================================== */
    const editorText = document.getElementById('editorText');
    const editorCharCount = document.getElementById('editorCharCount');
    const clearTextBtn = document.getElementById('clearTextBtn');
    const addPauseBtn = document.getElementById('addPauseBtn');
    const charLimitError = document.getElementById('charLimitError');

    const updateCharCount = () => {
        const count = editorText.value.length;
        editorCharCount.textContent = count;
        
        if (count >= 5000) {
            charLimitError.style.display = 'block';
            editorCharCount.style.color = 'var(--color-error)';
        } else {
            charLimitError.style.display = 'none';
            editorCharCount.style.color = '';
        }
    };

    editorText.addEventListener('input', updateCharCount);

    clearTextBtn.addEventListener('click', () => {
        editorText.value = '';
        updateCharCount();
        showToast("Editor cleared.");
    });

    addPauseBtn.addEventListener('click', () => {
        const text = editorText.value;
        const startPos = editorText.selectionStart;
        const endPos = editorText.selectionEnd;
        const pauseToken = "[pause: 1.0s]";
        
        editorText.value = text.substring(0, startPos) + pauseToken + text.substring(endPos);
        editorText.focus();
        editorText.selectionStart = startPos + pauseToken.length;
        editorText.selectionEnd = startPos + pauseToken.length;
        
        updateCharCount();
        showToast("Pause marker inserted.");
    });

    /* ==========================================================================
       AI Script Typing Simulation Helper
       ========================================================================== */
    const simulateAIScriptTyping = (targetText) => {
        editorText.value = '';
        updateCharCount();
        
        let index = 0;
        const typingInterval = setInterval(() => {
            if (index < targetText.length) {
                editorText.value += targetText.charAt(index);
                index++;
                updateCharCount();
            } else {
                clearInterval(typingInterval);
                showToast("Script generated successfully!", "success");
            }
        }, 15);
    };

    /* ==========================================================================
       AI Script Prompt Assistant
       ========================================================================== */
    const aiScriptPrompt = document.getElementById('aiScriptPrompt');
    const aiGenerateScriptBtn = document.getElementById('aiGenerateScriptBtn');

    // Database of template prompt results
    const promptOutputs = {
        youtube: "Hey guys! Welcome back to the channel. Today we are diving deep into the next generation of neural vocal synthesis. We will explore how AI voice cloning actually works, test the absolute limit of emotional accents, and clone my voice in under 10 seconds. Make sure to hit that subscribe button, drop a like, and let's get into it!",
        reel: "Unbelievable! 🤯 This AI literally cloned my voice in exactly 10 seconds. Can you hear the accent details? It sounds exactly like me. Click the link in my bio to start cloning your voice free on VoiceNova today! #aivoice #clonedvoice #voicenova",
        tiktok: "Tiktokers! Listen to this voice. It is 100% synthetically generated. No microphone, no studio room noise. Just pure neural AI speech synthesis. How clean does this sound? Type your scripts, pick an emotion model, and make your videos viral! 🚀 #aivoiceover #studiosound",
        podcast: "Welcome back to the Soundscape Podcast. In this episode, we are discussing the ethical future of synthetic narration. How will creators protect their vocal assets? How fast are neural networks progressing? Let's take a quick 1-second pause to hear the natural breathing pauses in the synthesizer.",
        ad: "Looking for studio-grade narration without the studio costs? Welcome to VoiceNova. Generate lifelike, emotional AI voices in seconds. Access over 200 distinct actors, translate languages globally, and integrate real-time API nodes. Start for free today.",
        audiobook: "Chapter One. The shadow fell across the ancient slate pathway. Lord Alastair paused, listening to the strange frequencies shifting in the cold mountain air. He spoke in a low, cinematic tone, wondering if the voices in the wind were human, or something synthetic..."
    };

    aiGenerateScriptBtn.addEventListener('click', () => {
        const prompt = aiScriptPrompt.value.trim().toLowerCase();
        if (!prompt) {
            showToast("Please enter a writing prompt first!", "error");
            return;
        }

        aiGenerateScriptBtn.classList.add('btn-loading');
        
        setTimeout(() => {
            aiGenerateScriptBtn.classList.remove('btn-loading');
            
            // Match keywords in prompt for custom templates
            let outputText = promptOutputs.ad; // default
            if (prompt.includes('youtube')) outputText = promptOutputs.youtube;
            else if (prompt.includes('reel') || prompt.includes('instagram')) outputText = promptOutputs.reel;
            else if (prompt.includes('tiktok')) outputText = promptOutputs.tiktok;
            else if (prompt.includes('podcast')) outputText = promptOutputs.podcast;
            else if (prompt.includes('audiobook') || prompt.includes('story')) outputText = promptOutputs.audiobook;
            
            simulateAIScriptTyping(outputText);
            aiScriptPrompt.value = '';
        }, 1200);
    });

    /* ==========================================================================
       Quick Template Button Click Listeners
       ========================================================================== */
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            const templateType = card.getAttribute('data-template');
            if (promptOutputs[templateType]) {
                showToast(`Loading ${card.textContent.trim()} Template...`);
                simulateAIScriptTyping(promptOutputs[templateType]);
            }
        });
    });

    /* ==========================================================================
       Voice Studio Parameter Slider Value Displays
       ========================================================================== */
    const sliderSpeed = document.getElementById('sliderSpeed');
    const valSpeed = document.getElementById('valSpeed');
    const sliderPitch = document.getElementById('sliderPitch');
    const valPitch = document.getElementById('valPitch');
    const sliderVolume = document.getElementById('sliderVolume');
    const valVolume = document.getElementById('valVolume');

    sliderSpeed.addEventListener('input', () => {
        valSpeed.textContent = `${parseFloat(sliderSpeed.value).toFixed(2)}x`;
    });

    sliderPitch.addEventListener('input', () => {
        const val = parseInt(sliderPitch.value);
        valPitch.textContent = val >= 0 ? `+${val}%` : `${val}%`;
    });

    sliderVolume.addEventListener('input', () => {
        valVolume.textContent = `${sliderVolume.value}%`;
    });

    /* ==========================================================================
       Trending AI Voices Previews & Selectors
       ========================================================================== */
    const selectVoice = document.getElementById('selectVoice');
    const selectLanguage = document.getElementById('selectLanguage');
    const synthEngine = window.speechSynthesis;

    // Trending preview triggers
    const previewVoiceBtns = document.querySelectorAll('.preview-voice-btn');
    const selectVoiceBtns = document.querySelectorAll('.select-voice-btn');

    // Dialog phrases to preview voice actor qualities
    const previewPhrases = {
        Nova: "Hi! I am Nova. My voice is designed to sound warm, professional, and trustworthy. Perfect for your marketing ads.",
        Aero: "Hello! Aero here. I speak in a bold and narrative style, custom built for audiobooks and explainer videos.",
        Lily: "Yay! This is Lily. I am a bright and energetic child voice, designed for storytelling and fun animations!",
        Amina: "ہیلو، میں آمنہ ہوں۔ اردو میں بات کرنا میرا من پسند مشغلہ ہے۔",
        Tareq: "مرحباً، أنا طارق. أحدثكم بنبرة صوت سينمائية عميقة ومؤثرة."
    };

    previewVoiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const speaker = btn.getAttribute('data-speaker');
            const phraseText = previewPhrases[speaker];
            
            if (synthEngine) {
                synthEngine.cancel();
                const utterance = new SpeechSynthesisUtterance(phraseText);
                
                // Customize language locale
                if (speaker === 'Amina') utterance.lang = 'ur';
                else if (speaker === 'Tareq') utterance.lang = 'ar';
                else utterance.lang = 'en';

                const voices = synthEngine.getVoices();
                let matchingVoice = null;
                
                // Setup localized locales
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

                if (matchingVoice) utterance.voice = matchingVoice;
                
                showToast(`Playing preview sample for ${speaker}...`);
                synthEngine.speak(utterance);
            } else {
                showToast(`Previewing ${speaker}: "${phraseText}" (SpeechSynthesis unsupported)`);
            }
        });
    });

    selectVoiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const speaker = btn.getAttribute('data-speaker');
            const lang = btn.getAttribute('data-lang');
            
            // Map settings dropdowns to select this speaker
            selectVoice.value = speaker;
            selectLanguage.value = lang;
            
            showToast(`Voice actor set to ${speaker}!`);
            
            // Scroll up to the studio forms nicely
            document.getElementById('voice-studio-anchor').scrollIntoView({ behavior: 'smooth' });
        });
    });

    /* ==========================================================================
       AI Voice Preview & Canvas Waveform Player
       ========================================================================== */
    const audioPreviewCard = document.getElementById('audioPreviewCard');
    const audioSubDetails = document.getElementById('audioSubDetails');
    const audioDurationLabel = document.getElementById('audioDuration');
    
    const playerPlayPauseBtn = document.getElementById('playerPlayPauseBtn');
    const playPauseIcon = document.getElementById('playPauseIcon');
    const playerCurrentTimeLabel = document.getElementById('playerCurrentTime');
    const playerScrubber = document.getElementById('playerScrubber');
    const playerScrubberFill = document.getElementById('playerScrubberFill');
    const playerCanvas = document.getElementById('playerWaveformCanvas');
    const playerCtx = playerCanvas.getContext('2d');

    let currentSpeechUtterance = null;
    let isPlaying = false;
    let scrubberInterval = null;
    let waveAnimId = null;
    let playerProgress = 0;
    let simulatedDuration = 4.0;
    let startTime = 0;
    
    const resizePlayerCanvas = () => {
        playerCanvas.width = playerCanvas.parentElement.clientWidth;
        playerCanvas.height = playerCanvas.parentElement.clientHeight;
    };
    resizePlayerCanvas();
    window.addEventListener('resize', resizePlayerCanvas);

    const drawPlayerWaveform = (isActive) => {
        playerCtx.clearRect(0, 0, playerCanvas.width, playerCanvas.height);
        const w = playerCanvas.width;
        const h = playerCanvas.height;
        const centerY = h / 2;
        
        const count = 48;
        const gap = 3;
        const barWidth = (w / count) - gap;
        
        for (let i = 0; i < count; i++) {
            const ratio = i / count;
            
            let value = Math.sin(ratio * Math.PI * 4) * 0.4 + 0.5;
            value += Math.cos(ratio * Math.PI * 10) * 0.2;
            value = Math.max(0.1, value);
            
            if (isActive && isPlaying) {
                value *= (Math.random() * 0.4 + 0.8);
            }
            
            const barHeight = value * h * 0.75;
            const isPlayed = ratio <= playerProgress;
            
            if (isPlayed) {
                playerCtx.fillStyle = 'rgba(0, 194, 255, 0.8)';
            } else {
                playerCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            }
            
            const x = i * (barWidth + gap);
            const y = centerY - barHeight / 2;
            
            playerCtx.beginPath();
            playerCtx.roundRect(x, y, barWidth, barHeight, 2);
            playerCtx.fill();
        }
        
        if (isActive && isPlaying) {
            waveAnimId = requestAnimationFrame(() => drawPlayerWaveform(true));
        }
    };
    
    drawPlayerWaveform(false);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const stopAudioPlayback = () => {
        isPlaying = false;
        if (synthEngine && synthEngine.speaking) {
            synthEngine.cancel();
        }
        clearInterval(scrubberInterval);
        cancelAnimationFrame(waveAnimId);
        
        playerPlayPauseBtn.innerHTML = '<i data-lucide="play" id="playPauseIcon"></i>';
        window.lucide.createIcons();
        
        playerProgress = 0;
        playerScrubberFill.style.width = '0%';
        playerCurrentTimeLabel.textContent = '0:00';
        drawPlayerWaveform(false);
    };

    const playAudioPreview = () => {
        const text = editorText.value.trim();
        if (!text) return;

        if (isPlaying) {
            stopAudioPlayback();
            return;
        }

        isPlaying = true;
        playerPlayPauseBtn.innerHTML = '<i data-lucide="pause" id="playPauseIcon"></i>';
        window.lucide.createIcons();
        
        const speed = parseFloat(sliderSpeed.value);
        const charCount = text.length;
        simulatedDuration = Math.max(2.0, (charCount * 0.05) / speed);
        audioDurationLabel.textContent = formatTime(simulatedDuration);

        if (synthEngine) {
            synthEngine.cancel();
            
            currentSpeechUtterance = new SpeechSynthesisUtterance(text);
            currentSpeechUtterance.rate = speed;
            
            const speaker = selectVoice.value;
            const voicesList = synthEngine.getVoices();
            let selectedVoice = null;
            
            if (speaker === 'Amina') {
                selectedVoice = voicesList.find(v => v.lang.startsWith('ur') || v.lang.startsWith('hi'));
            } else if (speaker === 'Tareq') {
                selectedVoice = voicesList.find(v => v.lang.startsWith('ar'));
            } else if (speaker === 'Lily') {
                selectedVoice = voicesList.find(v => v.lang.startsWith('en') && (v.name.includes('Hazel') || v.name.includes('Google US English') || v.name.includes('Female')));
            } else if (speaker === 'Aero') {
                selectedVoice = voicesList.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George')));
            } else {
                selectedVoice = voicesList.find(v => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Female')));
            }

            if (selectedVoice) currentSpeechUtterance.voice = selectedVoice;
            
            currentSpeechUtterance.onend = () => {
                stopAudioPlayback();
            };
            currentSpeechUtterance.onerror = () => {
                stopAudioPlayback();
            };
            
            synthEngine.speak(currentSpeechUtterance);
        }

        startTime = Date.now();
        drawPlayerWaveform(true);

        scrubberInterval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            playerProgress = Math.min(1.0, elapsed / simulatedDuration);
            
            playerScrubberFill.style.width = `${playerProgress * 100}%`;
            playerCurrentTimeLabel.textContent = formatTime(Math.min(simulatedDuration, elapsed));
            
            if (playerProgress >= 1.0) {
                stopAudioPlayback();
            }
        }, 30);
    };

    playerPlayPauseBtn.addEventListener('click', playAudioPreview);

    playerScrubber.addEventListener('click', (e) => {
        const rect = playerScrubber.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.min(1.0, Math.max(0, clickX / width));
        
        if (isPlaying) {
            playerProgress = percentage;
            playerScrubberFill.style.width = `${percentage * 100}%`;
            const elapsed = percentage * simulatedDuration;
            playerCurrentTimeLabel.textContent = formatTime(elapsed);
            startTime = Date.now() - (elapsed * 1000);
        }
    });

    /* ==========================================================================
       AI Voice Studio Form Synthesis & Audio Generations Grid
       ========================================================================== */
    const studioForm = document.getElementById('dashboardStudioForm');
    const dashGenerateBtn = document.getElementById('dashGenerateBtn');
    const generationsGrid = document.getElementById('generationsGrid');

    studioForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = editorText.value.trim();
        if (!text) {
            showToast("Script is empty. Please type something.", "error");
            return;
        }

        dashGenerateBtn.classList.add('btn-loading');
        
        setTimeout(() => {
            dashGenerateBtn.classList.remove('btn-loading');
            
            const langName = selectLanguage.options[selectLanguage.selectedIndex].text;
            const voice = selectVoice.value;
            const emotion = document.getElementById('selectEmotion').value;
            const speed = parseFloat(sliderSpeed.value).toFixed(2);
            
            audioSubDetails.textContent = `Voice: ${voice} | Lang: ${langName} | Speed: ${speed}x | Emotion: ${emotion.toUpperCase()}`;
            audioPreviewCard.style.display = 'block';
            audioPreviewCard.scrollIntoView({ behavior: 'smooth' });
            
            showToast("Voice synthesis completed!");
            
            // Add synthesis result into the Recent Generations grid dynamically
            const newCard = document.createElement('div');
            newCard.className = 'generation-card glass-panel';
            
            const today = new Date();
            const dateStr = today.toLocaleString('default', { month: 'long' }) + ' ' + today.getDate() + ', ' + today.getFullYear();
            const durationSec = Math.max(2.0, (text.length * 0.05) / speed);
            const durationStr = formatTime(durationSec);

            newCard.innerHTML = `
                <div class="gen-card-header">
                    <button class="gen-play-btn"><i data-lucide="play"></i></button>
                    <div class="gen-title-meta">
                        <h4 class="gen-track-title">${text.substring(0, 32)}${text.length > 32 ? '...' : ''}</h4>
                        <span class="gen-track-details">Voice: ${voice} | ${langName} | ${dateStr}</span>
                    </div>
                    <span class="gen-duration">${durationStr}</span>
                </div>
                <div class="gen-waveform-preview">
                    <span class="line line-1" style="height: 35%"></span>
                    <span class="line line-2" style="height: 65%"></span>
                    <span class="line line-3" style="height: 45%"></span>
                    <span class="line line-4" style="height: 70%"></span>
                    <span class="line line-5" style="height: 50%"></span>
                    <span class="line line-6" style="height: 80%"></span>
                    <span class="line line-7" style="height: 30%"></span>
                    <span class="line line-8" style="height: 75%"></span>
                    <span class="line line-9" style="height: 40%"></span>
                    <span class="line line-10" style="height: 60%"></span>
                </div>
                <div class="gen-card-footer">
                    <button class="btn btn-text btn-sm action-download"><i data-lucide="download"></i> Download</button>
                    <button class="btn btn-text btn-sm action-share"><i data-lucide="share-2"></i> Share</button>
                </div>
            `;
            
            generationsGrid.insertBefore(newCard, generationsGrid.firstChild);
            window.lucide.createIcons();
            
            // Wire Play/Delete behaviors to the new card
            const newPlayBtn = newCard.querySelector('.gen-play-btn');
            newPlayBtn.addEventListener('click', () => {
                editorText.value = text;
                updateCharCount();
                playAudioPreview();
            });

            newCard.querySelector('.action-download').addEventListener('click', () => {
                showToast("Downloading audio: VoiceNova_Generation.wav");
            });

            newCard.querySelector('.action-share').addEventListener('click', () => {
                navigator.clipboard.writeText(`https://voicenova.ai/share/g_${Math.random().toString(36).substring(2, 7)}`);
                showToast("Share link copied to clipboard!");
            });

        }, 1500);
    });

    // Wire actions on existing cards
    document.querySelectorAll('.gen-play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.generation-card');
            const title = card.querySelector('.gen-track-title').textContent;
            editorText.value = `Playback preview for the audio generation: "${title}".`;
            updateCharCount();
            playAudioPreview();
        });
    });

    document.querySelectorAll('.action-download').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast("Downloading audio file...");
        });
    });

    document.querySelectorAll('.action-share').forEach(btn => {
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText("https://voicenova.ai/share/g_nova_explainer");
            showToast("Share link copied to clipboard!");
        });
    });

    /* ==========================================================================
       Sidebar triggers, downloads, and Enterprise upgrade promo
       ========================================================================== */
    const upgradeBtns = document.querySelectorAll('#sidebarUpgradeBtn');
    upgradeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showToast("Enterprise tier request submitted! We will contact you.", "success");
        });
    });

    document.getElementById('downloadMp3Btn').addEventListener('click', () => {
        showToast("Downloading MP3 file...");
    });

    document.getElementById('downloadWavBtn').addEventListener('click', () => {
        showToast("Downloading studio WAV file... (1411kbps)");
    });

    document.getElementById('copyAudioLinkBtn').addEventListener('click', () => {
        navigator.clipboard.writeText("https://voicenova.ai/share/v_nova_4f92c");
        showToast("Share link copied to clipboard!");
    });

    /* ==========================================================================
       World-Class Ambient Background Waveform Animation Loop
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
        const centerY = h * 0.75; // draw towards bottom half of page
        
        bgPhase += 0.005; // slow moving ambient animation
        
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
       Floating AI Assistant FAB Chat Toggle (Chatbot Simulation)
       ========================================================================== */
    const assistantFab = document.getElementById('aiAssistantFab');
    const headerAssistantBtn = document.getElementById('headerAssistantBtn');
    const assistantOverlay = document.getElementById('aiAssistantOverlay');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatForm = document.getElementById('chatFormInput');
    const chatInput = document.getElementById('chatInputMessage');
    const chatBody = document.getElementById('chatBody');

    const toggleAssistant = () => {
        assistantOverlay.classList.toggle('active');
        if (assistantOverlay.classList.contains('active')) {
            chatInput.focus();
        }
    };

    if (assistantFab) assistantFab.addEventListener('click', toggleAssistant);
    if (headerAssistantBtn) headerAssistantBtn.addEventListener('click', toggleAssistant);
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
