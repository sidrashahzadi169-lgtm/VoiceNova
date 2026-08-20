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
    const usersTableBody = document.getElementById('adminUsersTableBody');
    const usersSearch = document.getElementById('adminUsersSearch');
    const usersPlanFilter = document.getElementById('adminUserFilterPlan');

    let currentPage = 1;
    const usersPerPage = 6;

    const renderPaginationControls = (page, totalPages, total) => {
        let paginationContainer = document.getElementById('adminUsersPagination');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'adminUsersPagination';
            paginationContainer.style.display = 'flex';
            paginationContainer.style.justifyContent = 'space-between';
            paginationContainer.style.alignItems = 'center';
            paginationContainer.style.padding = '16px 20px';
            paginationContainer.style.borderTop = '1px solid rgba(255,255,255,0.05)';
            
            if (usersTableBody) {
                const tableContainer = usersTableBody.closest('.table-container');
                if (tableContainer) {
                    tableContainer.appendChild(paginationContainer);
                }
            }
        }

        if (totalPages <= 1 && total === 0) {
            paginationContainer.style.display = 'none';
            return;
        }
        paginationContainer.style.display = 'flex';

        paginationContainer.innerHTML = `
            <span style="font-size:0.75rem; color:var(--color-text-muted);">
                Showing page <strong>${page}</strong> of <strong>${totalPages}</strong> (Total: <strong>${total}</strong> users)
            </span>
            <div style="display:flex; gap:8px;">
                <button class="btn btn-outline btn-xs" id="btnPrevPage" ${page <= 1 ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}>Prev</button>
                <button class="btn btn-outline btn-xs" id="btnNextPage" ${page >= totalPages ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}>Next</button>
            </div>
        `;

        const prevBtn = document.getElementById('btnPrevPage');
        const nextBtn = document.getElementById('btnNextPage');
        if (prevBtn) prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                fetchAndRenderUsers();
            }
        });
        if (nextBtn) nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                fetchAndRenderUsers();
            }
        });
    };

    const updateStatus = async (userId, targetStatus, userName) => {
        try {
            const res = await window.apiClient.put(`/admin/users/${userId}/status`, { status: targetStatus });
            if (res.ok) {
                showToast(`User ${userName} status set to ${targetStatus.toUpperCase()}`, "success");
                fetchAndRenderUsers();
                if(typeof loadAdminOverview === 'function') loadAdminOverview();
            } else {
                showToast("User not found or error", "error");
            }
        } catch (err) {
            console.error("Status update error:", err);
            showToast("Failed to update status", "error");
        }
    };

    const changePlan = async (userId, currentPlan, userName) => {
        const newPlan = prompt(`Enter new plan for ${userName} (Free Plan, Starter Plan, Pro Plan, Business Plan, Enterprise):`, currentPlan);
        if (!newPlan || newPlan.trim() === '') return;

        try {
            const res = await window.apiClient.put(`/admin/users/${userId}/plan`, { plan: newPlan.trim() });
            if (res.ok) {
                showToast(`Updated plan for ${userName} to ${newPlan.trim()}`, "success");
                fetchAndRenderUsers();
                if(typeof loadAdminOverview === 'function') loadAdminOverview();
            } else {
                showToast("User not found or error", "error");
            }
        } catch (err) {
            console.error("Plan update error:", err);
            showToast("Failed to update plan", "error");
        }
    };

    const deleteUser = async (userId, userName) => {
        if (!confirm(`Permanently delete account for ${userName}?`)) return;

        try {
            const res = await window.apiClient.delete(`/admin/users/${userId}`);
            if (res.ok) {
                showToast(`User ${userName} deleted successfully`, "success");
                fetchAndRenderUsers();
                if(typeof loadAdminOverview === 'function') loadAdminOverview();
            } else {
                showToast("User not found or error", "error");
            }
        } catch (err) {
            console.error("User deletion error:", err);
            showToast("Failed to delete user", "error");
        }
    };

    const viewUserDetails = async (userId) => {
        try {
            let localUsers = JSON.parse(localStorage.getItem('voicenova_admin_users')) || [];
            let user = localUsers.find(u => u.id === userId);

            if (user) {
                // Mock extra details
                user.subscriptions = [
                    { plan: user.plan, status: user.status, creditUsed: user.usage, creditLimit: 20000, endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString() }
                ];
                user.payments = [
                    { transactionId: 'TXN-' + Math.floor(10000+Math.random()*90000), createdAt: user.joinedAt || user.registered || new Date().toISOString(), amount: 29.99 }
                ];

                const modal = document.createElement('div');
                modal.id = 'adminUserModal';
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100vw';
                modal.style.height = '100vh';
                modal.style.background = 'rgba(15, 23, 42, 0.7)';
                modal.style.backdropFilter = 'blur(10px)';
                modal.style.display = 'flex';
                modal.style.justifyContent = 'center';
                modal.style.alignItems = 'center';
                modal.style.zIndex = '4000';
                modal.style.animation = 'fadeIn 0.25s ease-out';

                const subList = user.subscriptions.map(s => `
                    <div style="background:rgba(255,255,255,0.02); padding:8px; border-radius:4px; border:1px solid rgba(255,255,255,0.04); margin-bottom:6px; font-size:0.78rem;">
                        <strong>Plan:</strong> ${s.plan} (${s.status})<br>
                        <strong>Limit:</strong> ${s.creditUsed.toLocaleString()} / ${s.creditLimit.toLocaleString()} Chars<br>
                        <strong>Renewal:</strong> ${new Date(s.endDate).toLocaleDateString()}
                    </div>
                `).join('') || '<p style="font-size:0.75rem; color:rgba(255,255,255,0.4);">No subscription cycles recorded</p>';

                const payList = user.payments.map(p => `
                    <div style="background:rgba(255,255,255,0.02); padding:8px; border-radius:4px; border:1px solid rgba(255,255,255,0.04); margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; font-size:0.78rem;">
                        <div>
                            <strong>${p.transactionId}</strong><br>
                            <small>${new Date(p.createdAt).toLocaleDateString()}</small>
                        </div>
                        <span style="color:#4ADE80; font-weight:700;">$${p.amount.toFixed(2)}</span>
                    </div>
                `).join('') || '<p style="font-size:0.75rem; color:rgba(255,255,255,0.4);">No payment records found</p>';

                modal.innerHTML = `
                    <div class="glass-panel" style="width: 500px; max-height: 80vh; overflow-y: auto; padding: 28px; background: rgba(15,23,42,0.95); border-color: rgba(255,255,255,0.1); border-radius: 12px; box-shadow: var(--shadow-hard);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:12px;">
                            <h3 style="color:white; margin:0; font-family:Poppins; font-weight:700; font-size:1.1rem;">Customer Details</h3>
                            <button id="closeUserModal" style="background:transparent; border:none; color:white; cursor:pointer; font-size:1.4rem; font-weight:700; line-height:1;">&times;</button>
                        </div>
                        
                        <div style="display:flex; flex-direction:column; gap:16px;">
                            <div>
                                <span style="font-size:0.7rem; color:rgba(255,255,255,0.4); text-transform:uppercase; font-weight:600; display:block;">Basic Profile</span>
                                <strong style="font-size:1.05rem; color:white; display:block; margin-top:4px;">${user.name}</strong>
                                <span style="color:rgba(255,255,255,0.6); font-size:0.8rem;">${user.email}</span>
                            </div>
                            
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                                <div>
                                    <span style="font-size:0.68rem; color:rgba(255,255,255,0.4);">REGISTERED</span>
                                    <span style="color:white; display:block; font-size:0.78rem; margin-top:2px;">${new Date(user.joinedAt || user.registered || new Date()).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span style="font-size:0.68rem; color:rgba(255,255,255,0.4);">STATUS</span>
                                    <span style="color:${user.status.toLowerCase() === 'active' ? '#4ADE80' : '#EF4444'}; display:block; font-size:0.78rem; margin-top:2px; font-weight:700;">${user.status}</span>
                                </div>
                            </div>
                            
                            <div>
                                <span style="font-size:0.7rem; color:rgba(255,255,255,0.4); text-transform:uppercase; font-weight:600; display:block; margin-bottom:8px;">Active Subscription</span>
                                ${subList}
                            </div>
                            
                            <div>
                                <span style="font-size:0.7rem; color:rgba(255,255,255,0.4); text-transform:uppercase; font-weight:600; display:block; margin-bottom:8px;">Recent Payments</span>
                                <div style="max-height: 150px; overflow-y: auto;">
                                    ${payList}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                document.body.appendChild(modal);

                modal.querySelector('#closeUserModal').addEventListener('click', () => modal.remove());
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) modal.remove();
                });
            }
        } catch (err) {
            console.error("Failed to load user details:", err);
            showToast("Failed to retrieve user details", "error");
        }
    };

    const fetchAndRenderUsers = async () => {
        if (!usersTableBody) return;

        const searchQuery = usersSearch ? usersSearch.value.trim().toLowerCase() : '';
        const planFilter = usersPlanFilter ? usersPlanFilter.value : 'all';

        try {
            const res = await window.apiClient.get(`/admin/users?page=${currentPage}&limit=${usersPerPage}`);
            if (res.ok && res.data) {
                const fetchedUsers = res.data.data;
                const total = res.data.total;
                const totalPages = res.data.pages;
                const page = res.data.page;

                let filteredUsers = fetchedUsers;
                if (planFilter !== 'all') {
                    filteredUsers = filteredUsers.filter(u => u.plan === planFilter);
                }
                if (searchQuery) {
                    filteredUsers = filteredUsers.filter(u => u.name.toLowerCase().includes(searchQuery) || u.email.toLowerCase().includes(searchQuery));
                }

                usersTableBody.innerHTML = '';

                if (filteredUsers.length === 0) {
                    usersTableBody.innerHTML = `
                        <tr>
                            <td colspan="6" style="text-align:center; color:var(--color-text-muted); padding:24px;">
                                No users found matching search filters
                            </td>
                        </tr>
                    `;
                    renderPaginationControls(page, totalPages, total);
                    return;
                }

                filteredUsers.forEach(user => {
                    const tr = document.createElement('tr');
                    const isSuspended = user.status === 'suspended' || user.status === 'Suspended';
                    const suspendText = isSuspended ? 'Activate' : 'Suspend';
                    const statusClass = isSuspended ? 'status-pill-error' : 'status-pill-success';

                    tr.innerHTML = `
                        <td>
                            <strong class="user-details-link" data-id="${user.id}" style="cursor:pointer; color:white; text-decoration:underline;">${user.name}</strong>
                        </td>
                        <td>${user.email}</td>
                        <td>${user.plan}</td>
                        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
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

                    tr.querySelector('.user-details-link').addEventListener('click', () => {
                        viewUserDetails(user.id);
                    });

                    tr.querySelector('.btn-suspend-user').addEventListener('click', async () => {
                        const targetStatus = isSuspended ? 'Active' : 'Suspended';
                        await updateStatus(user.id, targetStatus, user.name);
                    });

                    tr.querySelector('.btn-change-plan').addEventListener('click', () => {
                        changePlan(user.id, user.plan, user.name);
                    });

                    tr.querySelector('.btn-delete-user').addEventListener('click', () => {
                        deleteUser(user.id, user.name);
                    });
                });

                if (window.lucide) window.lucide.createIcons();
                renderPaginationControls(page, totalPages, total);
            }
        } catch (err) {
            console.error("Failed to load admin users list:", err);
        }
    };

    if (usersSearch) usersSearch.addEventListener('input', () => {
        currentPage = 1;
        fetchAndRenderUsers();
    });
    if (usersPlanFilter) usersPlanFilter.addEventListener('change', () => {
        currentPage = 1;
        fetchAndRenderUsers();
    });

    /* ==========================================================================
       AI Voices Master Database Management
       ========================================================================== */
    let voicesDatabase = [];

    const voicesTableBody = document.getElementById('adminVoicesTableBody');
    const voicesSearch = document.getElementById('adminVoicesSearch');
    const btnAdminAddVoice = document.getElementById('btnAdminAddVoice');

    const fetchAndRenderVoices = async () => {
        try {
            const res = await window.apiClient.get('/admin/voices');
            if (res.ok && res.data && res.data.data) {
                voicesDatabase = res.data.data;
            } else {
                voicesDatabase = [];
            }
            renderVoicesTable();
        } catch (e) {
            console.error("Failed to load voices", e);
        }
    };

    const renderVoicesTable = () => {
        if (!voicesTableBody) return;
        voicesTableBody.innerHTML = '';

        const query = voicesSearch ? voicesSearch.value.toLowerCase().trim() : '';

        const filtered = voicesDatabase.filter(voice => {
            const n = voice.name || "";
            const l = voice.lang || "";
            return n.toLowerCase().includes(query) || l.toLowerCase().includes(query);
        });

        filtered.forEach(voice => {
            const tr = document.createElement('tr');
            
            const starClass = voice.featured ? 'fill="currentColor" style="color:var(--color-warning);"' : '';

            tr.innerHTML = `
                <td><div class="voice-avatar avatar-nova" style="width:28px;height:28px;font-size:0.65rem;">${(voice.name || "UN").substring(0,2).toUpperCase()}</div></td>
                <td><strong>${voice.name}</strong></td>
                <td>${voice.gender || '-'}</td>
                <td>${voice.lang || 'Global'}</td>
                <td>${voice.accent || '-'}</td>
                <td><span class="status-pill status-pill-success" style="font-size:0.65rem; padding:2px 8px;">${voice.category || '-'}</span></td>
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
            tr.querySelector('.btn-feature-voice').addEventListener('click', async () => {
                const newFeatured = !voice.featured;
                try {
                    const res = await window.apiClient.put(`/admin/voices/${voice.id}`, { featured: newFeatured });
                    if (res.ok) {
                        showToast(newFeatured ? `Featured voice: ${voice.name}` : `Unfeatured voice.`);
                        fetchAndRenderVoices();
                    }
                } catch (e) {
                    showToast("Failed to update featured status", "error");
                }
            });

            tr.querySelector('.btn-edit-voice').addEventListener('click', async () => {
                const newName = prompt("Rename voice actor name:", voice.name);
                if (newName && newName.trim() !== '' && newName.trim() !== voice.name) {
                    try {
                        const res = await window.apiClient.put(`/admin/voices/${voice.id}`, { name: newName.trim() });
                        if (res.ok) {
                            showToast("Voice profile updated.");
                            fetchAndRenderVoices();
                        }
                    } catch (e) {
                        showToast("Failed to rename voice", "error");
                    }
                }
            });

            tr.querySelector('.btn-delete-voice').addEventListener('click', async () => {
                if (confirm(`Remove voice actor ${voice.name} from public library catalog?`)) {
                    try {
                        const res = await window.apiClient.delete(`/admin/voices/${voice.id}`);
                        if (res.ok) {
                            showToast("Voice actor profile deleted.");
                            fetchAndRenderVoices();
                        }
                    } catch (e) {
                        showToast("Failed to delete voice", "error");
                    }
                }
            });
        });
        if (window.lucide) window.lucide.createIcons();
    };

    if (voicesSearch) voicesSearch.addEventListener('input', renderVoicesTable);
    
    if (btnAdminAddVoice) {
        btnAdminAddVoice.addEventListener('click', async () => {
            const name = prompt("Enter Voice Name:");
            if (!name) return;
            const lang = prompt("Enter Language (e.g. Urdu, English):", "English");
            const gender = prompt("Enter Gender (Male/Female):", "Female");
            
            try {
                const res = await window.apiClient.post('/admin/voices', {
                    name: name.trim(),
                    lang: lang.trim(),
                    gender: gender.trim(),
                    category: "Standard"
                });
                if (res.ok) {
                    showToast("New synthetic voice added to database.", "success");
                    fetchAndRenderVoices();
                } else {
                    showToast("Failed to add voice", "error");
                }
            } catch (e) {
                showToast("Error while adding voice", "error");
            }
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
       Support Tickets Queue & Response Center (LocalStorage based)
       ========================================================================== */
    const ticketsTableBody = document.getElementById('adminTicketsTableBody');
    const adminTicketModalOverlay = document.getElementById('adminTicketModalOverlay');
    const closeAdminTicketModalBtn = document.getElementById('closeAdminTicketModalBtn');
    const adminTicketActionForm = document.getElementById('adminTicketActionForm');
    
    let activeTicketId = null;

    let currentTicketsList = [];

    const fetchAndRenderTickets = async () => {
        if (!ticketsTableBody) return;
        
        try {
            const res = await window.apiClient.get('/admin/tickets');
            if (res.ok && res.data && res.data.data) {
                currentTicketsList = res.data.data;
            } else {
                currentTicketsList = [];
            }
        } catch (e) {
            console.error("Failed to load tickets", e);
            currentTicketsList = [];
        }

        let tickets = currentTicketsList;
        
        const searchInput = document.getElementById('adminTicketsSearch');
        const filterSelect = document.getElementById('adminTicketFilterStatus');
        
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const statusFilter = filterSelect ? filterSelect.value : 'all';

        if (statusFilter !== 'all') {
            tickets = tickets.filter(t => t.status === statusFilter);
        }
        if (query) {
            tickets = tickets.filter(t => 
                t.id.toLowerCase().includes(query) || 
                (t.user && t.user.toLowerCase().includes(query)) || 
                t.subject.toLowerCase().includes(query)
            );
        }

        ticketsTableBody.innerHTML = '';
        if (tickets.length === 0) {
            ticketsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px; color: rgba(255,255,255,0.4);">No support tickets found.</td></tr>';
            return;
        }

        tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(tick => {
            const tr = document.createElement('tr');
            
            let statusClass = 'status-pill-warning'; // Open
            if (tick.status === 'Resolved' || tick.status === 'Closed') statusClass = 'status-pill-success';
            if (tick.status === 'Pending') statusClass = 'status-pill-muted';

            tr.innerHTML = `
                <td><strong>${tick.id}</strong><br><span style="font-size:0.72rem;color:var(--color-text-muted);">${new Date(tick.createdAt).toLocaleDateString()}</span></td>
                <td><strong>${tick.user || 'Unknown'}</strong><br><span style="font-size:0.72rem;color:var(--color-text-muted);">${tick.email || ''}</span></td>
                <td><strong>${tick.subject}</strong><br><span style="font-size:0.72rem;color:var(--color-text-muted);">${tick.category}</span></td>
                <td><span style="font-weight:600; color:${tick.priority === 'High' ? 'var(--color-error)' : 'var(--color-secondary)'};">${tick.priority}</span></td>
                <td><span class="status-pill ${statusClass}">${tick.status}</span></td>
                <td>
                    <button class="btn btn-outline btn-sm action-resolve-ticket" data-id="${tick.id}">
                        <i data-lucide="shield-check" style="width:14px; height:14px;"></i> Manage
                    </button>
                </td>
            `;

            ticketsTableBody.appendChild(tr);

            tr.querySelector('.action-resolve-ticket').addEventListener('click', () => {
                openAdminTicketModal(tick.id);
            });
        });
        
        if (window.lucide) window.lucide.createIcons();
    };

    const adminTicketsSearchInput = document.getElementById('adminTicketsSearch');
    if (adminTicketsSearchInput) {
        adminTicketsSearchInput.addEventListener('input', fetchAndRenderTickets);
    }
    
    const adminTicketFilterStatusSelect = document.getElementById('adminTicketFilterStatus');
    if (adminTicketFilterStatusSelect) {
        adminTicketFilterStatusSelect.addEventListener('change', fetchAndRenderTickets);
    }

    const openAdminTicketModal = (id) => {
        const tick = currentTicketsList.find(t => t.id === id);
        if (!tick) return;

        activeTicketId = id;
        document.getElementById('adminTicketIdDisplay').textContent = `#${tick.id}`;
        document.getElementById('adminTicketSubjectDisplay').textContent = tick.subject;
        document.getElementById('adminTicketDescDisplay').textContent = tick.description;
        document.getElementById('adminTicketIdInput').value = id;
        document.getElementById('adminTicketStatusSelect').value = tick.status;
        
        const repliesContainer = document.getElementById('adminTicketRepliesContainer');
        repliesContainer.innerHTML = '';
        if (tick.replies && tick.replies.length > 0) {
            tick.replies.forEach(reply => {
                const isUser = reply.from === 'User';
                repliesContainer.innerHTML += `
                    <div style="background: ${isUser ? 'rgba(255,255,255,0.02)' : 'rgba(108, 99, 255, 0.1)'}; padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); align-self: ${isUser ? 'flex-start' : 'flex-end'}; max-width: 85%;">
                        <div style="font-size: 0.7rem; color: var(--color-text-muted); margin-bottom: 4px;"><strong>${reply.from}</strong> • ${new Date(reply.date).toLocaleString()}</div>
                        <div style="font-size: 0.85rem; color: white;">${reply.msg}</div>
                    </div>
                `;
            });
        }
        
        document.getElementById('adminTicketReplyText').value = '';
        adminTicketModalOverlay.classList.add('active');
    };

    if (closeAdminTicketModalBtn) {
        closeAdminTicketModalBtn.addEventListener('click', () => {
            adminTicketModalOverlay.classList.remove('active');
            activeTicketId = null;
        });
    }

    if (adminTicketActionForm) {
        adminTicketActionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!activeTicketId) return;

            const tickIndex = currentTicketsList.findIndex(t => t.id === activeTicketId);
            if (tickIndex === -1) return;

            const replyText = document.getElementById('adminTicketReplyText').value.trim();
            const newStatus = document.getElementById('adminTicketStatusSelect').value;

            try {
                const res = await window.apiClient.put(`/admin/tickets/${activeTicketId}`, {
                    status: newStatus,
                    reply: replyText ? replyText : undefined
                });

                if (res.ok) {
                    showToast(`Ticket ${activeTicketId} updated to ${newStatus}.`, "success");
                    adminTicketModalOverlay.classList.remove('active');
                    activeTicketId = null;
                    await fetchAndRenderTickets();
                    
                    // Update notifications
                    updateNotifications();
                } else {
                    showToast("Failed to update ticket", "error");
                }
            } catch (e) {
                showToast("Error updating ticket", "error");
            }
        });
    }

    const updateNotifications = () => {
        const tickets = currentTicketsList;
        const openTicketsCount = tickets.filter(t => t.status === 'Open').length;
        
        const notifBadge = document.querySelector('.notification-indicator');
        if (notifBadge) {
            if (openTicketsCount > 0) {
                notifBadge.style.display = 'block';
                notifBadge.style.background = 'var(--color-error)';
                // Optional: set textContent to openTicketsCount if it's large enough, but the current UI is just a dot.
                notifBadge.textContent = openTicketsCount;
                notifBadge.style.width = 'auto';
                notifBadge.style.height = 'auto';
                notifBadge.style.padding = '2px 6px';
                notifBadge.style.borderRadius = '10px';
                notifBadge.style.fontSize = '10px';
                notifBadge.style.right = '4px';
                notifBadge.style.top = '4px';
            } else {
                notifBadge.style.display = 'none';
            }
        }
    };

    updateNotifications();

    /* ==========================================================================
       Admin settings save preferences
       ========================================================================== */
    const adminSaveBtn = document.getElementById('btnAdminSavePrefs');
    
    const loadSettings = async () => {
        try {
            // Mock backend
            const settingsStr = localStorage.getItem('voicenova_admin_settings');
            let settings = settingsStr ? JSON.parse(settingsStr) : {
                maintenanceMode: false,
                newRegistrations: true,
                detailedLogging: true
            };
            const switchM = document.getElementById('switchMaintenance');
            const switchR = document.getElementById('switchRegistrations');
            const switchD = document.getElementById('switchDebugTrace');
            if (switchM) switchM.checked = settings.maintenanceMode || false;
            if (switchR) switchR.checked = settings.newRegistrations || false;
            if (switchD) switchD.checked = settings.detailedLogging || false;
        } catch (e) {
            console.error("Failed to load settings", e);
        }
    };
    
    // Load settings on boot
    loadSettings();

    if (adminSaveBtn) {
        adminSaveBtn.addEventListener('click', async () => {
            const switchM = document.getElementById('switchMaintenance');
            const switchR = document.getElementById('switchRegistrations');
            const switchD = document.getElementById('switchDebugTrace');
            
            const payload = {
                maintenanceMode: switchM ? switchM.checked : false,
                newRegistrations: switchR ? switchR.checked : true,
                detailedLogging: switchD ? switchD.checked : false
            };

            adminSaveBtn.disabled = true;
            adminSaveBtn.innerHTML = '<i data-lucide="loader" class="spin"></i> Saving...';
            if (window.lucide) window.lucide.createIcons();

            try {
                // Mock save
                localStorage.setItem('voicenova_admin_settings', JSON.stringify(payload));
                const data = { success: true };
                
                if (data.success) {
                    showToast("Global SaaS platform configuration preferences saved.", "success");
                } else {
                    showToast(data.message || "Failed to save settings", "error");
                }
            } catch (err) {
                console.error("Failed to save settings", err);
                showToast("Connection error", "error");
            } finally {
                adminSaveBtn.disabled = false;
                adminSaveBtn.innerHTML = '<i data-lucide="save"></i> Save Settings';
                if (window.lucide) window.lucide.createIcons();
            }
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

    const loadAdminOverview = async () => {
        try {
            // Mock data for Admin Overview
            const result = {
                success: true,
                data: {
                    kpis: {
                        totalUsers: 24500,
                        activeUsers: 8912,
                        premiumSubscribers: 3200,
                        totalRevenue: 124500.50,
                        monthlyRevenue: 18200.00,
                        totalVoiceGenerations: 14200000,
                        totalChars: 8520000000,
                        apiUsage: 184200
                    },
                    systemHealth: {
                        neuralEngine: { status: "HEALTHY" },
                        apiGateway: { status: "HEALTHY", latency: 45 },
                        dbCluster: { status: "HEALTHY", load: "22%" },
                        storageNode: { status: "HEALTHY", space: "4.2 TB" }
                    },
                    activityFeed: [],
                    recentSignups: []
                }
            };

            if (result.success && result.data) {
                const { kpis, systemHealth, activityFeed, recentSignups } = result.data;

                // Update 8 Telemetry Cards
                const cards = document.querySelectorAll('#paneDashboard .stat-card');
                if (cards.length >= 8) {
                    // Card 1: Total Registered Users
                    cards[0].querySelector('.stat-num').textContent = kpis.totalUsers.toLocaleString();
                    
                    // Card 2: Active Users (24h)
                    cards[1].querySelector('.stat-num').textContent = kpis.activeUsers.toLocaleString();
                    
                    // Card 3: Premium Subscribers
                    cards[2].querySelector('.stat-label').textContent = "Premium Subscribers";
                    cards[2].querySelector('.stat-num').textContent = kpis.premiumSubscribers.toLocaleString();
                    cards[2].querySelector('.metric-trend').textContent = `Paid plan tiers active`;

                    // Card 4: Total Platform Revenue
                    cards[3].querySelector('.stat-label').textContent = "Total Platform Revenue";
                    cards[3].querySelector('.stat-num').textContent = `$${kpis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    cards[3].querySelector('.metric-trend').textContent = `$${kpis.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} this month`;

                    // Card 5: AI Generations (Total)
                    cards[4].querySelector('.stat-label').textContent = "Voice Generations (Total)";
                    cards[4].querySelector('.stat-num').textContent = kpis.totalVoiceGenerations.toLocaleString();
                    cards[4].querySelector('.metric-trend').textContent = `${(kpis.totalChars / 1000000).toFixed(2)}M chars synthesized`;

                    // Card 6: API Requests (Total)
                    cards[5].querySelector('.stat-label').textContent = "API Requests (Total)";
                    cards[5].querySelector('.stat-num').textContent = kpis.apiUsage.toLocaleString();
                    cards[5].querySelector('.metric-trend').textContent = `Request pipeline logs`;

                    // Card 8: Neural Engine Node Status
                    const healthDot = cards[7].querySelector('.avatar-status-dot');
                    const healthNum = cards[7].querySelector('.stat-num');
                    if (healthNum) {
                        healthNum.textContent = systemHealth.neuralEngine.status === "HEALTHY" ? "Healthy (120ms)" : "Degraded";
                    }
                    if (healthDot) {
                        healthDot.style.background = systemHealth.neuralEngine.status === "HEALTHY" ? "#22C55E" : "#EF4444";
                    }
                }

                // Update Overview Recent User Signups Table
                const overviewTableBody = document.querySelector('#paneDashboard .projects-table tbody');
                if (overviewTableBody) {
                    overviewTableBody.innerHTML = recentSignups.map(u => `
                        <tr>
                            <td><strong>${u.name}</strong><br><span style="font-size:0.72rem;color:var(--color-text-muted);">${u.email}</span></td>
                            <td>${new Date(u.registered).toLocaleDateString()}</td>
                            <td><span class="status-pill" style="background:rgba(0,194,255,0.08); color:var(--color-secondary); border:none; padding:2px 8px;">${u.plan}</span></td>
                            <td>-</td>
                            <td><span class="status-pill ${u.status === 'Active' ? 'status-pill-success' : 'status-pill-error'}">${u.status}</span></td>
                        </tr>
                    `).join('\n');
                }
                
                updateSystemHealthUI(systemHealth);
                updateOverviewActivityFeed(activityFeed);
            }
        } catch (err) {
            console.error("Failed to load admin overview telemetry:", err);
        }
    };

    const updateSystemHealthUI = (health) => {
        const sysPane = document.getElementById('paneSystem');
        if (!sysPane) return;

        const items = sysPane.querySelectorAll('.sub-detail-item');
        if (items.length >= 5) {
            const dbVal = items[0].querySelector('.detail-val');
            if (dbVal) {
                dbVal.textContent = `${health.db.status} (${health.db.latencyMs}ms)`;
                dbVal.style.color = health.db.status === 'HEALTHY' ? '#4ADE80' : '#EF4444';
            }
            const engineVal = items[1].querySelector('.detail-val');
            if (engineVal) {
                engineVal.textContent = `${health.neuralEngine.status} (${health.neuralEngine.latencyMs}ms)`;
                engineVal.style.color = health.neuralEngine.status === 'HEALTHY' ? '#4ADE80' : '#EF4444';
            }
            const redisVal = items[2].querySelector('.detail-val');
            if (redisVal) {
                redisVal.textContent = `${health.redis.status} (${health.redis.latencyMs}ms)`;
                redisVal.style.color = health.redis.status === 'HEALTHY' ? '#4ADE80' : '#EF4444';
            }
            const cpuVal = items[3].querySelector('.detail-val');
            if (cpuVal) {
                cpuVal.textContent = `${health.cpuUsagePercent}% Utilized`;
            }
            const memVal = items[4].querySelector('.detail-val');
            if (memVal) {
                memVal.textContent = `${health.memoryUsedGB} GB / ${health.memoryTotalGB} GB`;
            }
        }
    };

    const updateOverviewActivityFeed = (feed) => {
        const consolePre = document.getElementById('adminConsolePre');
        if (consolePre) {
            const logStrings = feed.map(item => `[${item.time}] ${item.text}`);
            consolePre.textContent = logStrings.join('\n');
            consolePre.scrollTop = consolePre.scrollHeight;
        }
    };

    // Run initial data queries
    // Initial data load calls
    fetchAndRenderUsers();
    fetchAndRenderVoices();
    renderPaymentsTable();
    fetchAndRenderTickets();
    loadAdminOverview();
});
