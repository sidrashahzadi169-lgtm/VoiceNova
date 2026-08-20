document.addEventListener('DOMContentLoaded', async () => {
    // Unconditionally show the admin panel for local file viewing
    try {
        const nav = document.querySelector('.sidebar-nav');
        if (nav && !document.getElementById('adminConsoleSectionTitle')) {
            const adminTitle = document.createElement('div');
            adminTitle.id = 'adminConsoleSectionTitle';
            adminTitle.className = 'nav-section-title';
            adminTitle.style.marginTop = '16px';
            adminTitle.textContent = 'Admin Console';
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.className = 'sidebar-link';
            adminLink.innerHTML = `<i data-lucide="shield-alert" style="color:var(--color-primary);"></i> <span style="font-weight:600;">Admin Panel</span>`;

            // Insert at the VERY TOP of the sidebar!
            nav.insertBefore(adminLink, nav.firstChild);
            nav.insertBefore(adminTitle, adminLink);

            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    } catch (e) {
        console.error("Failed to load admin sidebar dynamic nav:", e);
    }
});
