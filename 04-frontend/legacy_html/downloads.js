document.addEventListener('DOMContentLoaded', () => {
    // Auto-login to get backend token since there is no login UI
    if (!localStorage.getItem('voicenova_token')) {
        localStorage.setItem('voicenova_token', "mock_token_" + Math.random().toString(36).substr(2));
        console.log('Auto-login successful (Mocked)');
        loadDownloads(); // reload with token
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }

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

    const sidebarToggle = document.getElementById('sidebarToggleBtn');
    const sidebarClose = document.getElementById('sidebarCloseBtn');
    const sidebar = document.getElementById('dashSidebar');

    if (sidebarToggle) sidebarToggle.addEventListener('click', () => sidebar.classList.add('active'));
    if (sidebarClose) sidebarClose.addEventListener('click', () => sidebar.classList.remove('active'));

    const projectsTableBody = document.getElementById('downloadsTableBody');
    const displayedCountLabel = document.getElementById('displayedCount');

    async function loadDownloads() {
        const token = localStorage.getItem('voicenova_token');
        if (!token) {
            projectsTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Please login to view your downloads history.</td></tr>';
            return;
        }

        projectsTableBody.innerHTML = `
            <tr><td colspan="8">
                <div style="display:flex; flex-direction:column; gap:16px; padding: 20px;">
                    <div class="skeleton" style="height:40px; width:100%;"></div>
                    <div class="skeleton" style="height:40px; width:100%;"></div>
                    <div class="skeleton" style="height:40px; width:100%;"></div>
                </div>
            </td></tr>
        `;
        try {
            // Mock backend history data
            const data = {
                success: true,
                data: [
                    { id: 'gen-001', createdAt: new Date().toISOString(), audioUrl: '#', text: 'Welcome to VoiceNova! This is a test generation.', voice: { name: 'Aero (Male)' }, durationSeconds: 4.2, status: 'COMPLETED' },
                    { id: 'gen-002', createdAt: new Date(Date.now() - 86400000).toISOString(), audioUrl: '#', text: 'Generate high quality voices instantly.', voice: { name: 'Nova (Female)' }, durationSeconds: 2.8, status: 'COMPLETED' }
                ]
            };
            
            // Mock delay
            setTimeout(() => {
                if (data.success) {
                    renderTable(data.data);
                } else {
                    projectsTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Error: ${data.message}</td></tr>`;
                }
            }, 500);
        } catch (err) {
            console.error(err);
            projectsTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Failed to load mock data.</td></tr>';
        }
    }

    function renderTable(historyList) {
        projectsTableBody.innerHTML = '';
        
        if (historyList.length === 0) {
            projectsTableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        <div class="empty-state">
                            <i data-lucide="inbox" style="width:48px;height:48px;margin-bottom:12px;opacity:0.5;"></i>
                            <p>No downloads yet. Head to the Studio to generate some audio!</p>
                        </div>
                    </td>
                </tr>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        historyList.forEach(item => {
            const tr = document.createElement('tr');
            
            const dateObj = new Date(item.createdAt);
            const dateStr = dateObj.toLocaleDateString();
            
            // Reconstruct download URL based on API
            const downloadUrl = \`http://localhost:5000\${item.audioUrl}\`;
            
            tr.innerHTML = `
                <td style="display:flex;align-items:center;gap:12px;cursor:pointer;">
                    <div style="width:36px;height:36px;border-radius:6px;background:rgba(108,99,255,0.1);display:flex;align-items:center;justify-content:center;color:var(--color-primary);">
                        <i data-lucide="music-4" style="width:18px;height:18px;"></i>
                    </div>
                    <div>
                        <div style="font-weight:600;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px;" title="${item.text}">
                            ${item.text.substring(0, 30) || 'Speech Audio'}...
                        </div>
                        <div style="font-size:0.75rem;color:var(--color-text-muted);">${dateStr}</div>
                    </div>
                </td>
                <td>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <div class="avatar-ring" style="width:24px;height:24px;min-width:24px;"><span style="font-size:0.6rem;">${item.voice.name.charAt(0)}</span></div>
                        <span style="font-size:0.85rem;">${item.voice.name}</span>
                    </div>
                </td>
                <td><span class="tag-chip" style="font-size:0.7rem;padding:2px 6px;">EN</span></td>
                <td><span style="font-size:0.85rem;color:var(--color-text-muted);"><i data-lucide="clock" style="width:12px;height:12px;vertical-align:middle;margin-right:4px;"></i>${item.duration.toFixed(2)}s</span></td>
                <td><span style="font-size:0.85rem;">${item.charCount}</span></td>
                <td><span class="status-badge status-completed">Completed</span></td>
                <td><span style="font-size:0.85rem;color:var(--color-text-muted);">${dateStr}</span></td>
                <td>
                    <div style="display:flex;gap:8px;">
                        <a href="${downloadUrl}" download="VoiceNova_Generated_${item.id}.mp3" class="btn btn-secondary btn-icon-only" title="Download">
                            <i data-lucide="download"></i>
                        </a>
                    </div>
                </td>
            `;
            projectsTableBody.appendChild(tr);
        });
        
        if (displayedCountLabel) displayedCountLabel.textContent = historyList.length;
        if (window.lucide) window.lucide.createIcons();
    }

    // Load data on page load
    loadDownloads();
});
