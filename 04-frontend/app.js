/* ==========================================================================
   VoiceNova Interactive Client-Side Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Initialize Lucide icons if loaded (just in case they didn't render yet)
    if (window.lucide) {
        window.lucide.createIcons();
    }

    /* ==========================================================================
       Sticky Navbar & Scroll Handling
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        // Sticky class toggle
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }

        // Highlight active link based on scroll position
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 120; // offset for nav height

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       Mobile Menu Toggle
       ========================================================================== */
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const toggleIcon = mobileToggle.querySelector('i');

    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const isActive = navMenu.classList.contains('active');
        
        // Toggle icon state
        if (isActive) {
            mobileToggle.innerHTML = '<i data-lucide="x"></i>';
        } else {
            mobileToggle.innerHTML = '<i data-lucide="menu"></i>';
        }
        window.lucide.createIcons();
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileToggle.innerHTML = '<i data-lucide="menu"></i>';
            window.lucide.createIcons();
        });
    });

    /* ==========================================================================
       Modal Control Logic (Login / Register)
       ========================================================================== */
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    
    const openLoginBtn = document.getElementById('openLoginBtn');
    const openGetStartedBtn = document.getElementById('openGetStartedBtn');
    const closeLoginBtn = document.getElementById('closeLoginBtn');
    const closeSignupBtn = document.getElementById('closeSignupBtn');
    
    const switchToSignUp = document.getElementById('switchToSignUp');
    const switchToLogin = document.getElementById('switchToLogin');
    
    // Quick triggers for modals across the page
    const openGetStartedTriggers = document.querySelectorAll('.openGetStarted, #heroStartBtn');

    const openModal = (modal) => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = (modal) => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Event Listeners for Login
    if (openLoginBtn) openLoginBtn.addEventListener('click', () => openModal(loginModal));
    if (closeLoginBtn) closeLoginBtn.addEventListener('click', () => closeModal(loginModal));

    // Event Listeners for Signup/Get Started
    if (openGetStartedBtn) openGetStartedBtn.addEventListener('click', () => openModal(signupModal));
    if (closeSignupBtn) closeSignupBtn.addEventListener('click', () => closeModal(signupModal));

    openGetStartedTriggers.forEach(btn => {
        btn.addEventListener('click', () => openModal(signupModal));
    });

    // Switch between modals
    switchToSignUp.addEventListener('click', () => {
        closeModal(loginModal);
        openModal(signupModal);
    });

    switchToLogin.addEventListener('click', () => {
        closeModal(signupModal);
        openModal(loginModal);
    });

    // Close modal on background overlay click
    [loginModal, signupModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Mock form submissions with Toast
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

    // Add visual CSS keyframes for Toast dynamically
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

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const passwordField = document.getElementById('loginPassword');
        const password = passwordField ? passwordField.value : '';
        
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        if(submitBtn) submitBtn.textContent = 'Logging in...';

        const res = await window.apiClient.post('/auth/login', { email, password });
        
        if(submitBtn) submitBtn.textContent = 'Log In';

        if (res.ok && res.data.success) {
            window.apiClient.setToken(res.data.data.accessToken);
            closeModal(loginModal);
            showToast(`Successfully logged in as ${email}!`);
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
        } else {
            showToast(res.data.message || 'Login failed', 'error');
        }
    });

    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const passwordField = document.getElementById('signupPassword');
        const password = passwordField ? passwordField.value : '';
        
        const submitBtn = document.querySelector('#signupForm button[type="submit"]');
        if(submitBtn) submitBtn.textContent = 'Signing up...';

        const res = await window.apiClient.post('/auth/register', { name, email, password });
        
        if(submitBtn) submitBtn.textContent = 'Get Started';

        if (res.ok && res.data.success) {
            closeModal(signupModal);
            showToast(`Welcome ${name}! Your account has been created. Please login.`);
            setTimeout(() => openModal(loginModal), 1500);
        } else {
            showToast(res.data.message || 'Registration failed', 'error');
        }
    });

    document.getElementById('contactForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName').value;
        showToast(`Thank you, ${name}! Your message has been sent successfully.`);
        document.getElementById('contactForm').reset();
    });

    /* ==========================================================================
       Pricing Switcher
       ========================================================================== */
    const billingToggle = document.getElementById('billingToggle');
    const monthlyLabel = document.getElementById('monthlyLabel');
    const annualLabel = document.getElementById('annualLabel');
    const priceAmounts = document.querySelectorAll('.price-amount');

    const updatePricing = () => {
        const isAnnual = billingToggle.checked;
        
        if (isAnnual) {
            annualLabel.classList.add('active');
            monthlyLabel.classList.remove('active');
        } else {
            monthlyLabel.classList.add('active');
            annualLabel.classList.remove('active');
        }

        priceAmounts.forEach(price => {
            const monthlyVal = price.getAttribute('data-monthly');
            const annualVal = price.getAttribute('data-annual');
            const targetVal = isAnnual ? annualVal : monthlyVal;
            
            // Text scale animate
            price.style.transform = 'scale(0.85)';
            price.style.opacity = '0.5';
            
            setTimeout(() => {
                price.textContent = targetVal;
                price.style.transform = 'scale(1)';
                price.style.opacity = '1';
            }, 150);
        });
    };

    // Set annual check initially as default
    billingToggle.checked = true;
    updatePricing();

    billingToggle.addEventListener('change', updatePricing);

    /* ==========================================================================
       FAQ Accordion Collapsible Panels
       ========================================================================== */
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const parent = question.parentElement;
            const answer = question.nextElementSibling;
            const isOpen = parent.classList.contains('active');

            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-answer').style.maxHeight = '0';
            });

            if (!isOpen) {
                parent.classList.add('active');
                // Set max-height dynamically to active content height
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    /* ==========================================================================
       Interactive AI Studio (Hero Section Demo)
       ========================================================================== */
    const speechText = document.getElementById('speechText');
    const charCount = document.getElementById('charCount');
    const voiceSelect = document.getElementById('voiceSelect');
    const speedRange = document.getElementById('speedRange');
    const speedVal = document.getElementById('speedVal');
    const generateSpeechBtn = document.getElementById('generateSpeechBtn');
    const generateBtnText = document.getElementById('generateBtnText');
    const downloadAudioBtn = document.getElementById('downloadAudioBtn');
    const studioStatus = document.getElementById('studioStatus');
    const visualizerOverlay = document.getElementById('visualizerOverlay');
    const waveformCanvas = document.getElementById('waveformCanvas');
    const ctx = waveformCanvas.getContext('2d');

    let isSynthesizing = false;
    let isPlaying = false;
    let animationId = null;
    let waveOffset = 0;
    let speechUtterance = null;
    let audioUrl = null; // Store virtual generated audio url
    const synth = window.speechSynthesis;

    // Track input character count
    speechText.addEventListener('input', () => {
        const count = speechText.value.length;
        charCount.textContent = count;
        if (count > 500) {
            speechText.value = speechText.value.substring(0, 500);
            charCount.textContent = 500;
        }
    });

    // Update speed range value display
    speedRange.addEventListener('input', () => {
        speedVal.textContent = `${speedRange.value}x`;
    });

    // Handle Canvas Resize
    const resizeCanvas = () => {
        waveformCanvas.width = waveformCanvas.parentElement.clientWidth;
        waveformCanvas.height = waveformCanvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Procedural sound wave visualizer drawing
    const drawWaveform = (mode) => {
        ctx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
        
        const width = waveformCanvas.width;
        const height = waveformCanvas.height;
        const centerY = height / 2;
        
        ctx.lineWidth = 2;
        
        if (mode === 'idle') {
            // Draw a flat baseline with minor audio static
            ctx.strokeStyle = 'rgba(108, 99, 255, 0.2)';
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            for (let x = 0; x < width; x++) {
                const y = centerY + Math.sin(x * 0.05 + waveOffset) * 1.5;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            waveOffset += 0.02;
        } 
        else if (mode === 'generating') {
            // Draw pulsing loading soundwave (dense, medium amplitude)
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            for (let x = 0; x < width; x++) {
                const amp = Math.sin(x * 0.005) * 12;
                const freq = 0.08;
                const y = centerY + Math.sin(x * freq + waveOffset) * amp;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            waveOffset += 0.2;
        }
        else if (mode === 'playing') {
            // Draw rich overlapping voice synthesis curves - Premium Style
            waveOffset += 0.15;
            
            // Multiple curves with different properties to look organic and premium
            const waves = [
                { amp: 26, freq: 0.02, color: 'rgba(108, 99, 255, 0.9)' },
                { amp: 18, freq: 0.03, color: 'rgba(0, 194, 255, 0.7)' },
                { amp: 12, freq: 0.04, color: 'rgba(255, 255, 255, 0.5)' }
            ];
            
            waves.forEach((w, i) => {
                ctx.strokeStyle = w.color;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(0, centerY);
                for (let x = 0; x < width; x++) {
                    // Modulate wave shape based on horizontal position to look like speech patterns
                    const speechPattern = Math.sin(x * 0.01) * 0.4 + 0.6;
                    
                    const finalAmp = wave.amp * envelope * volumeModulation * breathModulation * speechPattern;
                    const y = centerY + Math.sin(x * wave.freq + waveOffset) * finalAmp;
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
            });
        }

        animationId = requestAnimationFrame(() => drawWaveform(mode));
    };

    // Run idle waveform animation initially
    drawWaveform('idle');

    // Synthesis Completion Callback helper
    const handleSynthesisFinished = () => {
        isSynthesizing = false;
        isPlaying = false;
        
        // Update studio indicators
        studioStatus.innerHTML = `
            <span class="status-indicator status-ready"></span>
            <span class="status-text">Ready</span>
        `;
        generateBtnText.textContent = "Generate Speech";
        generateSpeechBtn.querySelector('i').setAttribute('data-lucide', 'sparkles');
        window.lucide.createIcons();
        
        // Enable download button and create a mock audio file URL
        downloadAudioBtn.removeAttribute('disabled');
        if (!audioUrl) {
            // Generate a simple simulated wav file template download blob
            const mockAudioBlob = new Blob([new Uint8Array(44)], { type: 'audio/wav' });
            audioUrl = URL.createObjectURL(mockAudioBlob);
        }
        
        // Reset Visualizer Overlay text
        visualizerOverlay.style.opacity = '1';
        visualizerOverlay.innerHTML = `
            <i data-lucide="check-circle" class="pulse-icon" style="color:var(--color-success)"></i>
            <span>Synthesis complete. Click play again to repeat.</span>
        `;
        window.lucide.createIcons();
        
        // Return visualizer to idle pulse
        cancelAnimationFrame(animationId);
        drawWaveform('idle');
    };

    // Main Speech synthesis activator
    const generateSpeech = () => {
        const text = speechText.value.trim();
        if (!text) {
            showToast("Please enter script text first!", "error");
            return;
        }

        // Cancel current speak if any is running
        if (synth && synth.speaking) {
            synth.cancel();
            if (isPlaying) {
                handleSynthesisFinished();
                return;
            }
        }

        isSynthesizing = true;
        
        // Trigger Generating loader state
        studioStatus.innerHTML = `
            <span class="status-indicator status-generating"></span>
            <span class="status-text">Synthesizing...</span>
        `;
        generateBtnText.textContent = "Synthesizing AI Voice...";
        generateSpeechBtn.querySelector('i').setAttribute('data-lucide', 'loader');
        window.lucide.createIcons();
        
        cancelAnimationFrame(animationId);
        drawWaveform('generating');
        
        // Simulate minor synthesis network lag (e.g. 800ms) to feel like real AI computation
        setTimeout(() => {
            if (!isSynthesizing) return; // In case user clicked cancel rapidly
            
            // Switch to Playing state
            isPlaying = true;
            studioStatus.innerHTML = `
                <span class="status-indicator status-playing"></span>
                <span class="status-text">Playing Preview</span>
            `;
            generateBtnText.textContent = "Stop Playback";
            generateSpeechBtn.querySelector('i').setAttribute('data-lucide', 'square');
            window.lucide.createIcons();
            
            visualizerOverlay.style.opacity = '0';
            
            cancelAnimationFrame(animationId);
            drawWaveform('playing');

            // Attempt to call real backend first
            const token = localStorage.getItem('voicenova_token');
            let backendSuccess = false;

            if (token) {
                // Mock Backend connection by waiting slightly and falling through to synthesis
                setTimeout(() => {}, 500);
            }

            // Web Speech API execution (Fallback / Playback)
            if (!backendSuccess && synth) {
                speechUtterance = new SpeechSynthesisUtterance(text);
                
                // Set parameters
                speechUtterance.rate = parseFloat(speedRange.value);
                
                // Select best system voice depending on chosen select box (Nova, Aero, etc.)
                const chosenVoiceName = voiceSelect.value;
                const voicesList = synth.getVoices();
                
                let selectedVoice = null;
                
                // Fallbacks: find english voices
                if (chosenVoiceName === 'Nova' || chosenVoiceName === 'Solas') {
                    // Try to find a female English voice
                    selectedVoice = voicesList.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Hazel') || v.name.includes('Google US English') || v.name.includes('Samantha')));
                } else if (chosenVoiceName === 'Aero' || chosenVoiceName === 'Vortex') {
                    // Try to find a male English voice
                    selectedVoice = voicesList.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Microsoft David')));
                }
                
                // Default fallback if no gender matches
                if (!selectedVoice) {
                    selectedVoice = voicesList.find(v => v.lang.startsWith('en')) || voicesList[0];
                }
                
                if (selectedVoice) {
                    speechUtterance.voice = selectedVoice;
                }
                
                // Synthesizer Events
                speechUtterance.onend = () => {
                    handleSynthesisFinished();
                };
                
                speechUtterance.onerror = (e) => {
                    console.error("SpeechSynthesis error:", e);
                    handleSynthesisFinished();
                };
                
                synth.speak(speechUtterance);
            } 
            else if (!backendSuccess) {
                // Speech synthesis not supported, simulate playing for 4 seconds then stop
                setTimeout(() => {
                    if (isPlaying) {
                        handleSynthesisFinished();
                    }
                }, 4000);
            }
        }, 900);
    };

    // Hook buttons to generator
    generateSpeechBtn.addEventListener('click', generateSpeech);
    
    // Download Button handler
    downloadAudioBtn.addEventListener('click', () => {
        if (!audioUrl) return;
        
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = `VoiceNova_${voiceSelect.value}_Speech.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showToast("Audio studio file downloaded successfully!");
    });
    
    // Hero Demo video watch demo trigger
    const heroDemoBtn = document.getElementById('heroDemoBtn');
    heroDemoBtn.addEventListener('click', () => {
        showToast("Simulating product demo video playback... (Video Modal)", "success");
    });
});
