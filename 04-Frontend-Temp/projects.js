/* ==========================================================================
   VoiceNova My Projects Catalog Interactive Logic
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
       Projects Master Database Catalog
       ========================================================================== */
    let projectsDatabase = [
        {
            id: 1,
            name: "Product Explainer Video Script v2",
            date: "July 1, 2026",
            voice: "Nova",
            lang: "English (US)",
            duration: "0:14",
            status: "completed",
            chars: 226,
            lastEdited: "2 hours ago",
            isStarred: true,
            folder: "Marketing",
            tags: ["#Marketing", "#Nova"]
        },
        {
            id: 2,
            name: "Podcast Teaser Audio",
            date: "June 28, 2026",
            voice: "Aero",
            lang: "English (UK)",
            duration: "0:08",
            status: "completed",
            chars: 140,
            lastEdited: "5 hours ago",
            isStarred: false,
            folder: "Podcasts",
            tags: ["#Podcast", "#Aero"]
        },
        {
            id: 3,
            name: "Spanish API Speech Narration",
            date: "June 25, 2026",
            voice: "Vortex",
            lang: "Spanish (ES)",
            duration: "0:24",
            status: "completed",
            chars: 380,
            lastEdited: "1 day ago",
            isStarred: false,
            folder: "Marketing",
            tags: ["#Marketing", "#Vortex"]
        },
        {
            id: 4,
            name: "Islamic Bayan Intro Speech",
            date: "June 20, 2026",
            voice: "Amina",
            lang: "Urdu (PK)",
            duration: "1:02",
            status: "completed",
            chars: 890,
            lastEdited: "2 days ago",
            isStarred: true,
            folder: "Bayan",
            tags: ["#Urdu", "#Amina"]
        },
        {
            id: 5,
            name: "Vocal Audiobook Chapter 1",
            date: "June 15, 2026",
            voice: "Aero",
            lang: "English (UK)",
            duration: "0:00",
            status: "draft",
            chars: 1200,
            lastEdited: "3 days ago",
            isStarred: false,
            folder: "Audiobooks",
            tags: ["#Podcast"]
        },
        {
            id: 6,
            name: "Quantum Computing Lecture v1",
            date: "June 10, 2026",
            voice: "Priya",
            lang: "Hindi (IN)",
            duration: "0:32",
            status: "processing",
            chars: 450,
            lastEdited: "4 days ago",
            isStarred: false,
            folder: "Education",
            tags: ["#Hindi", "#Priya"]
        }
    ];

    /* ==========================================================================
       DOM Elements Selector Queries
       ========================================================================== */
    const searchInput = document.getElementById('projectsSearchInput');
    const sortSelect = document.getElementById('projectsSortSelect');
    const viewToggleBtn = document.getElementById('viewToggleBtn');
    const viewToggleIcon = document.getElementById('viewToggleIcon');
    const newProjectBtn = document.getElementById('newProjectBtn');

    // Folders and tags lists
    const folderCards = document.querySelectorAll('.folder-card');
    const tagChips = document.querySelectorAll('.tag-chip');

    // Layout Containers
    const listViewContainer = document.getElementById('listViewContainer');
    const gridViewContainer = document.getElementById('gridViewContainer');
    const projectsTableBody = document.getElementById('projectsTableBody');
    const displayedCountLabel = document.getElementById('displayedCount');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const starredProjectsList = document.getElementById('starredProjectsList');

    let currentFolder = 'all';
    let currentTag = 'all';
    let isGridView = false; // list view is default
    let limitItems = 6;

    /* ==========================================================================
       Render Right Panel Starred Favorites
       ========================================================================== */
    const renderStarredWidget = () => {
        starredProjectsList.innerHTML = '';
        const starredList = projectsDatabase.filter(p => p.isStarred);

        if (starredList.length === 0) {
            starredProjectsList.innerHTML = `<p style="font-size:0.78rem;color:var(--color-text-muted);text-align:center;">No starred favorites.</p>`;
            return;
        }

        starredList.forEach(project => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.justifyContent = 'space-between';
            item.style.padding = '8px 0';
            item.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
            
            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" class="mini-project-trigger">
                    <i data-lucide="file-audio" style="width:16px; height:16px; color:var(--color-primary);"></i>
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-size:0.82rem; font-weight:600; color:var(--color-text);">${project.name.substring(0, 20)}${project.name.length > 20 ? '...' : ''}</span>
                        <span style="font-size:0.68rem; color:var(--color-text-muted);">${project.voice} • ${project.duration}</span>
                    </div>
                </div>
                <button class="table-action-btn edit-starred-btn" data-id="${project.id}" title="Edit Project" style="width:28px; height:28px; border-radius:6px;">
                    <i data-lucide="edit" style="width:12px; height:12px;"></i>
                </button>
            `;
            
            starredProjectsList.appendChild(item);
            
            // Wire clicks on starred items
            item.querySelector('.mini-project-trigger').addEventListener('click', () => {
                showToast(`Playing starred preview: ${project.name}`);
            });
            
            item.querySelector('.edit-starred-btn').addEventListener('click', () => {
                localStorage.setItem('selectedScript', project.name);
                showToast(`Opening ${project.name}...`);
                setTimeout(() => {
                    window.location.href = 'studio.html';
                }, 1000);
            });
        });
        window.lucide.createIcons();
    };

    /* ==========================================================================
       Recalculate Folder Projects Counts
       ========================================================================== */
    const updateFolderCounts = () => {
        document.getElementById('countAll').textContent = `${projectsDatabase.length} Projects`;
        
        const countMarketing = projectsDatabase.filter(p => p.folder === 'Marketing').length;
        document.getElementById('countMarketing').textContent = `${countMarketing} Project${countMarketing !== 1 ? 's' : ''}`;

        const countPodcasts = projectsDatabase.filter(p => p.folder === 'Podcasts').length;
        document.getElementById('countPodcasts').textContent = `${countPodcasts} Project${countPodcasts !== 1 ? 's' : ''}`;

        const countBayan = projectsDatabase.filter(p => p.folder === 'Bayan').length;
        document.getElementById('countBayan').textContent = `${countBayan} Project${countBayan !== 1 ? 's' : ''}`;
    };

    /* ==========================================================================
       Rendering Filtered Project Entries (List & Grid Views)
       ========================================================================== */
    const filterAndRenderProjects = () => {
        const query = searchInput.value.toLowerCase().trim();
        const sortVal = sortSelect.value;

        let filtered = projectsDatabase.filter(p => {
            // Text search
            const textMatch = p.name.toLowerCase().includes(query) || 
                              p.voice.toLowerCase().includes(query) || 
                              p.tags.some(t => t.toLowerCase().includes(query));

            // Folder match
            const folderMatch = currentFolder === 'all' || p.folder === currentFolder;

            // Tag match
            const tagMatch = currentTag === 'all' || p.tags.includes(currentTag);

            return textMatch && folderMatch && tagMatch;
        });

        // Apply sorting
        if (sortVal === 'name-asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortVal === 'chars-desc') {
            filtered.sort((a, b) => b.chars - a.chars);
        } else if (sortVal === 'edited-desc') {
            // fallback simple date parsing mock
            filtered.sort((a, b) => b.id - a.id);
        }

        displayedCountLabel.textContent = Math.min(filtered.length, limitItems);
        const renderList = filtered.slice(0, limitItems);

        // Control load more displays
        if (filtered.length <= limitItems) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }

        // Starred widget sync
        renderStarredWidget();
        updateFolderCounts();

        if (isGridView) {
            // Render Grid View
            listViewContainer.style.display = 'none';
            gridViewContainer.style.display = 'grid';
            gridViewContainer.innerHTML = '';

            if (renderList.length === 0) {
                gridViewContainer.innerHTML = `<div class="empty-results-card glass-panel" style="grid-column: span 3; padding: 40px; text-align: center; color: var(--color-text-muted);">No projects found matching current parameters.</div>`;
                return;
            }

            renderList.forEach(project => {
                const card = document.createElement('div');
                card.className = 'generation-card glass-panel';
                card.style.background = 'rgba(15, 23, 42, 0.4)';
                card.style.border = '1px solid rgba(255, 255, 255, 0.06)';
                card.style.padding = '20px';
                
                const starClass = project.isStarred ? 'fill="currentColor" style="color:var(--color-warning);"' : '';
                
                let statusClass = 'status-pill-success';
                if (project.status === 'processing') statusClass = 'status-pill-warning';
                if (project.status === 'draft') statusClass = 'status-pill-muted';

                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                        <span class="status-pill ${statusClass}" style="font-size:0.68rem; padding:2px 8px;">${project.status}</span>
                        <div style="display:flex; gap:6px;">
                            <button class="table-action-btn star-project-btn" data-id="${project.id}" style="width:28px; height:28px; border-radius:6px;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star" ${starClass}>
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <h4 style="font-size:0.95rem; font-weight:600; color:var(--color-text); margin-bottom:4px;">${project.name}</h4>
                    <p style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:12px;">Last Edited: ${project.lastEdited}</p>
                    
                    <div style="display:flex; flex-direction:column; gap:6px; font-size:0.78rem; color:var(--color-text-secondary); margin-bottom:18px; background:rgba(255,255,255,0.02); padding:8px 12px; border-radius:6px;">
                        <span>Voice: <strong>${project.voice}</strong></span>
                        <span>Language: <strong>${project.lang}</strong></span>
                        <span>Duration: <strong>${project.duration}</strong> • <strong>${project.chars} Chars</strong></span>
                    </div>

                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-outline btn-sm open-edit-btn" data-id="${project.id}" style="flex:1; font-size:0.75rem; padding:6px 0;">Open Editor</button>
                        <button class="btn btn-secondary btn-sm action-trigger-btn" data-id="${project.id}" style="font-size:0.75rem; padding:6px 10px;" title="Actions"><i data-lucide="more-horizontal" style="width:14px; height:14px;"></i></button>
                    </div>
                `;
                
                gridViewContainer.appendChild(card);
                
                // Wire card triggers
                card.querySelector('.star-project-btn').addEventListener('click', () => {
                    project.isStarred = !project.isStarred;
                    showToast(project.isStarred ? "Project starred." : "Project unstarred.");
                    filterAndRenderProjects();
                });

                card.querySelector('.open-edit-btn').addEventListener('click', () => {
                    localStorage.setItem('selectedScript', project.name);
                    showToast(`Opening ${project.name}...`);
                    setTimeout(() => {
                        window.location.href = 'studio.html';
                    }, 1000);
                });

                card.querySelector('.action-trigger-btn').addEventListener('click', () => {
                    showMenuPopup(project);
                });
            });
            window.lucide.createIcons();

        } else {
            // Render List View
            gridViewContainer.style.display = 'none';
            listViewContainer.style.display = 'block';
            projectsTableBody.innerHTML = '';

            if (renderList.length === 0) {
                projectsTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--color-text-muted);">No projects found matching current parameters.</td></tr>`;
                return;
            }

            renderList.forEach(project => {
                const tr = document.createElement('tr');
                
                const starClass = project.isStarred ? 'fill="currentColor" style="color:var(--color-warning);"' : '';
                let statusClass = 'status-pill-success';
                if (project.status === 'processing') statusClass = 'status-pill-warning';
                if (project.status === 'draft') statusClass = 'status-pill-muted';

                tr.innerHTML = `
                    <td>
                        <div class="project-name-cell">
                            <button class="star-row-btn" data-id="${project.id}" style="background:transparent; border:none; color:var(--color-text-muted); cursor:pointer;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star" ${starClass}>
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                            </button>
                            <i data-lucide="file-audio" class="project-file-icon"></i>
                            <span class="project-title-text open-edit-trigger" data-id="${project.id}" style="cursor:pointer;">${project.name}</span>
                        </div>
                    </td>
                    <td>${project.voice}</td>
                    <td>${project.lang}</td>
                    <td>${project.duration}</td>
                    <td>${project.chars}</td>
                    <td><span class="status-pill ${statusClass}">${project.status}</span></td>
                    <td>${project.lastEdited}</td>
                    <td>
                        <div class="table-actions">
                            <button class="table-action-btn open-edit-btn" data-id="${project.id}" title="Open Project"><i data-lucide="edit"></i></button>
                            <button class="table-action-btn list-actions-btn" data-id="${project.id}" title="More Actions"><i data-lucide="more-horizontal"></i></button>
                        </div>
                    </td>
                `;
                
                projectsTableBody.appendChild(tr);

                // Wire row click event triggers
                tr.querySelector('.star-row-btn').addEventListener('click', () => {
                    project.isStarred = !project.isStarred;
                    showToast(project.isStarred ? "Project starred." : "Project unstarred.");
                    filterAndRenderProjects();
                });

                tr.querySelectorAll('.open-edit-btn, .open-edit-trigger').forEach(el => {
                    el.addEventListener('click', () => {
                        localStorage.setItem('selectedScript', project.name);
                        showToast(`Opening ${project.name}...`);
                        setTimeout(() => {
                            window.location.href = 'studio.html';
                        }, 1000);
                    });
                });

                tr.querySelector('.list-actions-btn').addEventListener('click', () => {
                    showMenuPopup(project);
                });
            });
            window.lucide.createIcons();
        }
    };

    /* ==========================================================================
       Mock Actions Dropdown Menu Overlay Creator
       ========================================================================== */
    const showMenuPopup = (project) => {
        // Destroy any existing overlays first
        const oldMenu = document.getElementById('actionsMenuPopup');
        if (oldMenu) oldMenu.remove();

        const menu = document.createElement('div');
        menu.id = 'actionsMenuPopup';
        menu.className = 'glass-panel';
        menu.style.position = 'fixed';
        menu.style.zIndex = '3500';
        menu.style.padding = '8px';
        menu.style.borderRadius = '8px';
        menu.style.boxShadow = 'var(--shadow-soft)';
        menu.style.display = 'flex';
        menu.style.flexDirection = 'column';
        menu.style.gap = '4px';
        menu.style.border = '1px solid rgba(255,255,255,0.08)';
        menu.style.minWidth = '140px';
        
        // Position menu directly under clicking bounds (or middle fallback)
        menu.style.top = '50%';
        menu.style.left = '50%';
        menu.style.transform = 'translate(-50%, -50%)';

        menu.innerHTML = `
            <button class="editor-action-btn" id="popDuplicate" style="width:100%; border:none; text-align:left; justify-content:flex-start;"><i data-lucide="copy" style="width:12px; height:12px;"></i> Duplicate</button>
            <button class="editor-action-btn" id="popRename" style="width:100%; border:none; text-align:left; justify-content:flex-start;"><i data-lucide="edit-3" style="width:12px; height:12px;"></i> Rename</button>
            <button class="editor-action-btn" id="popMp3" style="width:100%; border:none; text-align:left; justify-content:flex-start;"><i data-lucide="download" style="width:12px; height:12px;"></i> Download MP3</button>
            <button class="editor-action-btn" id="popWav" style="width:100%; border:none; text-align:left; justify-content:flex-start;"><i data-lucide="download-cloud" style="width:12px; height:12px;"></i> Download WAV</button>
            <button class="editor-action-btn" id="popShare" style="width:100%; border:none; text-align:left; justify-content:flex-start;"><i data-lucide="share-2" style="width:12px; height:12px;"></i> Copy Share Link</button>
            <button class="editor-action-btn color-red-btn" id="popDelete" style="width:100%; border:none; text-align:left; justify-content:flex-start;"><i data-lucide="trash-2" style="width:12px; height:12px;"></i> Delete</button>
            <div style="border-top:1px solid rgba(255,255,255,0.05); margin-top:4px; padding-top:4px;">
                <button class="btn btn-outline btn-sm btn-full" id="popCloseBtn" style="font-size:0.65rem; padding:4px 0;">Close Menu</button>
            </div>
        `;

        document.body.appendChild(menu);
        window.lucide.createIcons();

        // Wire sub-menu listeners
        document.getElementById('popCloseBtn').addEventListener('click', () => menu.remove());

        document.getElementById('popDuplicate').addEventListener('click', () => {
            const clone = Object.assign({}, project);
            clone.id = Date.now();
            clone.name = `${project.name} (Copy)`;
            clone.lastEdited = "Just now";
            projectsDatabase.unshift(clone);
            showToast(`Duplicated project: ${project.name}`);
            menu.remove();
            filterAndRenderProjects();
        });

        document.getElementById('popRename').addEventListener('click', () => {
            const newName = prompt(`Enter new project name for "${project.name}":`, project.name);
            if (newName && newName.trim() !== '') {
                project.name = newName.trim();
                showToast("Project renamed.");
                filterAndRenderProjects();
            }
            menu.remove();
        });

        document.getElementById('popMp3').addEventListener('click', () => {
            showToast(`Downloading: ${project.name}.mp3`);
            menu.remove();
        });

        document.getElementById('popWav').addEventListener('click', () => {
            showToast(`Downloading Lossless WAV: ${project.name}.wav`);
            menu.remove();
        });

        document.getElementById('popShare').addEventListener('click', () => {
            navigator.clipboard.writeText(`https://voicenova.ai/share/proj_${project.id}`);
            showToast("Share link copied to clipboard!");
            menu.remove();
        });

        document.getElementById('popDelete').addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
                projectsDatabase = projectsDatabase.filter(p => p.id !== project.id);
                showToast("Project deleted.", "success");
                filterAndRenderProjects();
            }
            menu.remove();
        });
    };

    /* ==========================================================================
       Grid/List View Toggles
       ========================================================================== */
    viewToggleBtn.addEventListener('click', () => {
        isGridView = !isGridView;
        if (isGridView) {
            viewToggleIcon.setAttribute('data-lucide', 'layout-list');
            viewToggleBtn.setAttribute('title', 'Switch to List View');
        } else {
            viewToggleIcon.setAttribute('data-lucide', 'layout-grid');
            viewToggleBtn.setAttribute('title', 'Switch to Grid View');
        }
        window.lucide.createIcons();
        filterAndRenderProjects();
    });

    /* ==========================================================================
       Search, Sort, Folders & Tags Click Handlers
       ========================================================================== */
    searchInput.addEventListener('input', filterAndRenderProjects);
    sortSelect.addEventListener('change', filterAndRenderProjects);

    folderCards.forEach(card => {
        card.addEventListener('click', () => {
            folderCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentFolder = card.getAttribute('data-folder');
            limitItems = 6;
            filterAndRenderProjects();
        });
    });

    tagChips.forEach(chip => {
        chip.addEventListener('click', () => {
            tagChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentTag = chip.getAttribute('data-tag');
            limitItems = 6;
            filterAndRenderProjects();
        });
    });

    loadMoreBtn.addEventListener('click', () => {
        limitItems += 6;
        filterAndRenderProjects();
    });

    // Create New Project trigger
    newProjectBtn.addEventListener('click', () => {
        localStorage.removeItem('selectedScript'); // clear script
        showToast("Opening blank voice studio...");
        setTimeout(() => {
            window.location.href = 'studio.html';
        }, 1000);
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

    // Run initial project catalog load
    filterAndRenderProjects();
});
