/* ==========================================================================
   COLLEGE COMPLAINT MANAGEMENT SYSTEM - FRONTEND APP CLIENT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Global State Store
  const state = {
    token: null,
    user: null,
    studentComplaints: [],
    adminComplaints: [],
    stats: null,
    currentDetailComplaint: null,
    selectedRating: 5
  };

  // DOM Elements - Navigation & Auth
  const userInfoDisplay = document.getElementById('userInfoDisplay');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userRoleBadge = document.getElementById('userRoleBadge');
  const authNavButtons = document.getElementById('authNavButtons');
  const logoutBtn = document.getElementById('logoutBtn');
  const profileBtn = document.getElementById('profileBtn');
  const showLoginBtn = document.getElementById('showLoginBtn');
  const showRegisterBtn = document.getElementById('showRegisterBtn');

  // Quick Demo Login Buttons
  const demoStudentBtn = document.getElementById('demoStudentBtn');
  const demoAdminBtn = document.getElementById('demoAdminBtn');
  const demoStaffBtn = document.getElementById('demoStaffBtn');
  const demoLoginBar = document.querySelector('.demo-login-bar');
  const themeToggle = document.getElementById('themeToggle');
  const isDemoMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // View Containers
  const authCardWrapper = document.getElementById('authCardWrapper');
  const studentDashboard = document.getElementById('studentDashboard');
  const adminDashboard = document.getElementById('adminDashboard');

  // Auth Forms & Tabs
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Student Dashboard Elements
  const openNewComplaintBtn = document.getElementById('openNewComplaintBtn');
  const studentComplaintsTableBody = document.getElementById('studentComplaintsTableBody');
  const stuSearchInput = document.getElementById('stuSearchInput');
  const stuCategoryFilter = document.getElementById('stuCategoryFilter');

  // Admin Dashboard Elements
  const adminRoleDisplay = document.getElementById('adminRoleDisplay');
  const activeUsersList = document.getElementById('activeUsersList');
  const sessionSummary = document.getElementById('sessionSummary');
  const sessionHistoryList = document.getElementById('sessionHistoryList');
  const adminComplaintsTableBody = document.getElementById('adminComplaintsTableBody');
  const admSearchInput = document.getElementById('admSearchInput');
  const admStatusFilter = document.getElementById('admStatusFilter');
  const admCategoryFilter = document.getElementById('admCategoryFilter');
  const admPriorityFilter = document.getElementById('admPriorityFilter');
  const admDepartmentFilter = document.getElementById('admDepartmentFilter');

  // Modals
  const profileModal = document.getElementById('profileModal');
  const profileForm = document.getElementById('profileForm');
  const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
  const cancelProfileModalBtn = document.getElementById('cancelProfileModalBtn');
  const passwordForm = document.getElementById('passwordForm');
  const cancelPasswordFormBtn = document.getElementById('cancelPasswordFormBtn');

  const newComplaintModal = document.getElementById('newComplaintModal');
  const newComplaintForm = document.getElementById('newComplaintForm');
  const closeComplaintModalBtn = document.getElementById('closeComplaintModalBtn');
  const cancelComplaintModalBtn = document.getElementById('cancelComplaintModalBtn');

  const complaintDetailModal = document.getElementById('complaintDetailModal');
  const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');

  const adminActionModal = document.getElementById('adminActionModal');
  const adminActionForm = document.getElementById('adminActionForm');
  const closeAdminActionModalBtn = document.getElementById('closeAdminActionModalBtn');
  const cancelAdminActionModalBtn = document.getElementById('cancelAdminActionModalBtn');

  // Star Rating
  const starRatingGroup = document.getElementById('starRatingGroup');
  const feedbackForm = document.getElementById('feedbackForm');

  // Initialize Application
  init();

  function init() {
    applyTheme(localStorage.getItem('theme') || 'dark');
    setupEventListeners();
    clearSession();
    forceLoginView();
  }

  function forceLoginView() {
    const loggedInLabel = document.getElementById('loggedInLabel');
    if (loggedInLabel) loggedInLabel.style.display = 'none';

    if (userInfoDisplay) userInfoDisplay.style.display = 'none';
    if (authNavButtons) authNavButtons.style.display = 'flex';
    if (studentDashboard) studentDashboard.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'none';

    showAuthCard('login');
  }

  function clearSession() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  function applyTheme(theme) {
    const isLight = theme === 'light';
    document.body.classList.toggle('light-theme', isLight);
    document.body.classList.toggle('dark-theme', !isLight);
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
      themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    }
    localStorage.setItem('theme', theme);
  }

  // API Fetch Helper
  async function apiCall(endpoint, method = 'GET', body = null, isFormData = false) {
    const headers = {};
    if (state.token) {
      headers['Authorization'] = `Bearer ${state.token}`;
    }

    const options = { method, headers };

    if (body) {
      if (isFormData) {
        options.body = body;
      } else {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(endpoint, options);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Server request failed');
      }
      return data;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  }

  // Toast Notification System
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconMap = {
      success: 'fa-circle-check',
      error: 'fa-circle-exclamation',
      info: 'fa-circle-info'
    };
    toast.innerHTML = `<i class="fa-solid ${iconMap[type] || 'fa-bell'}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Auth Tab switching
    tabLoginBtn.addEventListener('click', () => showAuthCard('login'));
    tabRegisterBtn.addEventListener('click', () => showAuthCard('register'));
    showLoginBtn.addEventListener('click', () => showAuthCard('login'));
    showRegisterBtn.addEventListener('click', () => showAuthCard('register'));

    if (demoLoginBar) {
      if (!isDemoMode) {
        demoLoginBar.style.display = 'none';
      }
    }

    // Auth Forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);
    if (profileBtn) profileBtn.addEventListener('click', openProfileModal);
    if (closeProfileModalBtn) closeProfileModalBtn.addEventListener('click', () => closeModal(profileModal));
    if (cancelProfileModalBtn) cancelProfileModalBtn.addEventListener('click', () => closeModal(profileModal));
    if (cancelPasswordFormBtn) cancelPasswordFormBtn.addEventListener('click', () => passwordForm.reset());
    if (profileForm) profileForm.addEventListener('submit', handleProfileUpdate);
    if (passwordForm) passwordForm.addEventListener('submit', handlePasswordChange);

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const nextTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
        applyTheme(nextTheme);
      });
    }

    // Quick Demo Buttons (only enabled in local demo mode)
    if (isDemoMode) {
      if (demoStudentBtn) {
        demoStudentBtn.addEventListener('click', () => quickLogin('surya.student@college.edu', 'student123'));
      }
      if (demoAdminBtn) {
        demoAdminBtn.addEventListener('click', () => quickLogin('surya@college.edu', 'admin123'));
      }
      if (demoStaffBtn) {
        demoStaffBtn.addEventListener('click', () => quickLogin('surya.staff@college.edu', 'staff123'));
      }
    } else {
      if (demoStudentBtn) demoStudentBtn.style.display = 'none';
      if (demoAdminBtn) demoAdminBtn.style.display = 'none';
      if (demoStaffBtn) demoStaffBtn.style.display = 'none';
    }

    // Modal controls
    openNewComplaintBtn.addEventListener('click', () => openModal(newComplaintModal));
    closeComplaintModalBtn.addEventListener('click', () => closeModal(newComplaintModal));
    cancelComplaintModalBtn.addEventListener('click', () => closeModal(newComplaintModal));
    newComplaintForm.addEventListener('submit', handleNewComplaintSubmit);

    // Gemini AI Smart Categorize Button Handler
    const aiBtn = document.getElementById('aiAutoCategorizeBtn');
    if (aiBtn) {
      aiBtn.addEventListener('click', handleAiAutoCategorize);
    }

    closeDetailModalBtn.addEventListener('click', () => closeModal(complaintDetailModal));

    closeAdminActionModalBtn.addEventListener('click', () => closeModal(adminActionModal));
    cancelAdminActionModalBtn.addEventListener('click', () => closeModal(adminActionModal));
    adminActionForm.addEventListener('submit', handleAdminActionSubmit);

    // Filters & Search
    if (stuSearchInput) stuSearchInput.addEventListener('input', renderStudentComplaints);
    if (stuCategoryFilter) stuCategoryFilter.addEventListener('change', renderStudentComplaints);

    if (admSearchInput) admSearchInput.addEventListener('input', fetchAdminComplaints);
    if (admStatusFilter) admStatusFilter.addEventListener('change', fetchAdminComplaints);
    if (admCategoryFilter) admCategoryFilter.addEventListener('change', fetchAdminComplaints);
    if (admPriorityFilter) admPriorityFilter.addEventListener('change', fetchAdminComplaints);
    if (admDepartmentFilter) admDepartmentFilter.addEventListener('change', fetchAdminComplaints);

    // Feedback rating stars
    if (starRatingGroup) {
      starRatingGroup.querySelectorAll('.star-btn').forEach(star => {
        star.addEventListener('click', (e) => {
          const val = parseInt(e.target.getAttribute('data-val'), 10);
          state.selectedRating = val;
          highlightStars(val);
        });
      });
    }

    if (feedbackForm) {
      feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    }

    // Close modals on backdrop click
    window.addEventListener('click', (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('modal-backdrop')) {
        closeModal(e.target);
      }
    });

    // Close modals on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal(newComplaintModal);
        closeModal(complaintDetailModal);
        closeModal(adminActionModal);
      }
    });

    // Toggle Section Buttons - Optional Display
    const toggleResolutionRateBtn = document.getElementById('toggleResolutionRateBtn');
    const resolutionRateSection = document.getElementById('resolutionRateSection');
    const toggleActiveUsersBtn = document.getElementById('toggleActiveUsersBtn');
    const activeUsersSection = document.getElementById('activeUsersSection');
    const toggleAnalyticsTablesBtn = document.getElementById('toggleAnalyticsTablesBtn');
    const analyticsTablesSection = document.getElementById('analyticsTablesSection');
    const toggleSessionActivityBtn = document.getElementById('toggleSessionActivityBtn');
    const sessionActivitySection = document.getElementById('sessionActivitySection');

    // Helper function to toggle section visibility
    function toggleSectionVisibility(btn, section, contentSelector) {
      if (!btn || !section) return;
      
      btn.addEventListener('click', () => {
        const content = section.querySelector(contentSelector);
        if (!content) return;

        btn.classList.toggle('collapsed');
        content.classList.toggle('section-content-hidden');
        content.classList.toggle('section-content-visible');
      });
    }

    // Setup toggles for each section
    if (resolutionRateSection) {
      const summaryGrid = resolutionRateSection.querySelector('.analytics-summary-grid');
      if (summaryGrid) {
        summaryGrid.classList.add('section-content-visible');
        toggleSectionVisibility(toggleResolutionRateBtn, resolutionRateSection, '.analytics-summary-grid');
      }
    }

    if (activeUsersSection) {
      const usersList = activeUsersSection.querySelector('.active-users-list');
      if (usersList) {
        usersList.classList.add('section-content-visible');
        toggleSectionVisibility(toggleActiveUsersBtn, activeUsersSection, '.active-users-list');
      }
    }

    if (analyticsTablesSection) {
      const tablesGrid = analyticsTablesSection.querySelector('.tables-grid');
      if (tablesGrid) {
        tablesGrid.classList.add('section-content-visible');
        toggleSectionVisibility(toggleAnalyticsTablesBtn, analyticsTablesSection, '.tables-grid');
      }
    }

    if (sessionActivitySection) {
      const sessionContent = sessionActivitySection.querySelector('.session-content');
      if (sessionContent) {
        sessionContent.classList.add('section-content-visible');
        toggleSectionVisibility(toggleSessionActivityBtn, sessionActivitySection, '.session-content');
      }
    }

    document.querySelectorAll('.section-list-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        const target = document.getElementById(targetId);
        if (!target) return;

        const toggleButton = target.querySelector('.btn-toggle-section');
        if (toggleButton) {
          const content = target.querySelector('.section-content-visible, .analytics-summary-grid, .tables-grid, .active-users-list, .session-content');
          const isOpen = content && !toggleButton.classList.contains('collapsed');
          if (isOpen) {
            toggleButton.classList.add('collapsed');
            if (content) {
              content.classList.remove('section-content-visible');
              content.classList.add('section-content-hidden');
            }
          } else {
            toggleButton.classList.remove('collapsed');
            if (content) {
              content.classList.remove('section-content-hidden');
              content.classList.add('section-content-visible');
            }
          }
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // Helper Modal Functions
  function openModal(modalEl) {
    if (modalEl) {
      modalEl.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalEl) {
    if (modalEl) {
      modalEl.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  function highlightStars(val) {
    starRatingGroup.querySelectorAll('.star-btn').forEach(s => {
      const sVal = parseInt(s.getAttribute('data-val'), 10);
      if (sVal <= val) {
        s.classList.add('selected');
      } else {
        s.classList.remove('selected');
      }
    });
  }

  // Quick Login Preset Handler
  async function quickLogin(email, password) {
    try {
      const data = await apiCall('/api/auth/login', 'POST', { email, password });
      state.token = data.token;
      state.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      showToast(data.message, 'success');
      updateUserUI();
      loadRoleDashboard();
    } catch (err) {
      // Handled by apiCall toast
    }
  }

  // Login Form Submission
  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
      const data = await apiCall('/api/auth/login', 'POST', { email, password });
      state.token = data.token;
      state.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      showToast(data.message, 'success');
      updateUserUI();
      loadRoleDashboard();
    } catch (err) {}
  }

  // Register Form Submission
  async function handleRegister(e) {
    e.preventDefault();
    const body = {
      name: document.getElementById('regName').value.trim(),
      student_id: document.getElementById('regStudentId').value.trim(),
      email: document.getElementById('regEmail').value.trim(),
      phone: document.getElementById('regPhone').value.trim(),
      department: document.getElementById('regDept').value,
      year: document.getElementById('regYear').value,
      password: document.getElementById('regPassword').value,
      role: 'Student'
    };

    try {
      const data = await apiCall('/api/auth/register', 'POST', body);
      state.token = data.token;
      state.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      showToast('Registration successful! Welcome.', 'success');
      updateUserUI();
      loadRoleDashboard();
    } catch (err) {}
  }

  async function handleLogout() {
    try {
      if (state.token) {
        await apiCall('/api/auth/logout', 'POST');
      }
    } catch (err) {}

    clearSession();

    const loggedInLabel = document.getElementById('loggedInLabel');
    if (loggedInLabel) loggedInLabel.style.display = 'none';

    if (userInfoDisplay) userInfoDisplay.style.display = 'none';
    if (authNavButtons) authNavButtons.style.display = 'flex';
    if (studentDashboard) studentDashboard.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'none';

    showAuthCard('login');
    showToast('Logged out successfully.', 'info');
  }

  function updateUserUI() {
    if (!state.user) return;
    authCardWrapper.style.display = 'none';
    authNavButtons.style.display = 'none';
    userInfoDisplay.style.display = 'flex';
    userNameDisplay.textContent = state.user.name;
    userRoleBadge.textContent = state.user.role;

    const loggedInLabel = document.getElementById('loggedInLabel');
    const loggedInName = document.getElementById('loggedInName');
    const loggedInRole = document.getElementById('loggedInRole');

    if (loggedInLabel && loggedInName && loggedInRole) {
      loggedInLabel.style.display = 'inline-block';
      loggedInName.textContent = state.user.name;
      loggedInRole.textContent = state.user.role;
    }
  }

  function showAuthCard(tab = 'login') {
    authCardWrapper.style.display = 'block';
    studentDashboard.style.display = 'none';
    adminDashboard.style.display = 'none';

    if (tab === 'login') {
      tabLoginBtn.classList.add('active');
      tabRegisterBtn.classList.remove('active');
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
    } else {
      tabRegisterBtn.classList.add('active');
      tabLoginBtn.classList.remove('active');
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
    }
  }

  function openProfileModal() {
    if (!state.user) return;
    document.getElementById('profileName').value = state.user.name || '';
    document.getElementById('profileEmail').value = state.user.email || '';
    document.getElementById('profilePhone').value = state.user.phone || '';
    document.getElementById('profileDepartment').value = state.user.department || '';
    document.getElementById('profileYear').value = state.user.year || '';
    openModal(profileModal);
  }

  async function handleProfileUpdate(e) {
    e.preventDefault();
    try {
      const data = await apiCall('/api/auth/profile', 'PUT', {
        name: document.getElementById('profileName').value.trim(),
        phone: document.getElementById('profilePhone').value.trim(),
        department: document.getElementById('profileDepartment').value.trim(),
        year: document.getElementById('profileYear').value.trim()
      });
      state.user = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
      updateUserUI();
      closeModal(profileModal);
      showToast(data.message, 'success');
    } catch (err) {}
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
      const data = await apiCall('/api/auth/change-password', 'PUT', {
        currentPassword,
        newPassword
      });
      passwordForm.reset();
      showToast(data.message, 'success');
    } catch (err) {}
  }

  function loadRoleDashboard() {
    if (state.user.role === 'Admin' || state.user.role === 'Staff') {
      studentDashboard.style.display = 'none';
      adminDashboard.style.display = 'block';
      adminRoleDisplay.innerHTML = `<i class="fa-solid fa-user-shield"></i> ${state.user.role} (${state.user.department || 'All Access'})`;
      fetchAdminComplaints();
      fetchAdminStats();
      fetchActiveUsers();
      fetchSessionHistory();
    } else {
      adminDashboard.style.display = 'none';
      studentDashboard.style.display = 'block';
      fetchStudentComplaints();
    }
  }

  // AI Auto Categorize & Summarize Handler
  async function handleAiAutoCategorize() {
    const title = document.getElementById('cmpTitle').value.trim();
    const description = document.getElementById('cmpDescription').value.trim();
    const aiBtn = document.getElementById('aiAutoCategorizeBtn');

    if (!description) {
      showToast('Please enter a description first for AI analysis.', 'info');
      return;
    }

    const origText = aiBtn.innerHTML;
    aiBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...`;
    aiBtn.disabled = true;

    try {
      const data = await apiCall('/api/ai/analyze', 'POST', { title, description });
      
      if (data.category) {
        const catSelect = document.getElementById('cmpCategory');
        for (let i = 0; i < catSelect.options.length; i++) {
          if (catSelect.options[i].value === data.category) {
            catSelect.selectedIndex = i;
            break;
          }
        }
      }

      if (data.priority) {
        document.getElementById('cmpPriority').value = data.priority;
      }

      if (data.summary) {
        const badge = document.getElementById('aiSummaryBadge');
        document.getElementById('aiSummaryText').textContent = data.summary;
        badge.style.display = 'block';
      }

      showToast(`AI Analysis (${data.source}): Categorized as "${data.category}" with ${data.priority} priority.`, 'success');
    } catch (err) {
      showToast('AI analysis failed: ' + err.message, 'error');
    } finally {
      aiBtn.innerHTML = origText;
      aiBtn.disabled = false;
    }
  }

  // Submit New Complaint Handler
  async function handleNewComplaintSubmit(e) {
    e.preventDefault();
    const fileInput = document.getElementById('cmpFile');
    const formData = new FormData();

    formData.append('title', document.getElementById('cmpTitle').value.trim());
    formData.append('category', document.getElementById('cmpCategory').value);
    formData.append('location', document.getElementById('cmpLocation').value.trim());
    formData.append('description', document.getElementById('cmpDescription').value.trim());
    formData.append('priority', document.getElementById('cmpPriority').value);

    if (fileInput.files.length > 0) {
      formData.append('attachment', fileInput.files[0]);
    }

    try {
      const data = await apiCall('/api/complaints', 'POST', formData, true);
      showToast(`Complaint ${data.complaint.complaint_id} submitted!`, 'success');
      closeModal(newComplaintModal);
      newComplaintForm.reset();
      fetchStudentComplaints();
    } catch (err) {}
  }

  // Fetch Student Complaints
  async function fetchStudentComplaints() {
    try {
      const data = await apiCall('/api/complaints/my');
      state.studentComplaints = data.complaints;
      renderStudentMetrics();
      renderStudentComplaints();
    } catch (err) {}
  }

  function renderStudentMetrics() {
    const list = state.studentComplaints;
    document.getElementById('stuTotalCount').textContent = list.length;
    document.getElementById('stuPendingCount').textContent = list.filter(c => ['Submitted', 'Under Review', 'Assigned'].includes(c.status)).length;
    document.getElementById('stuProgressCount').textContent = list.filter(c => c.status === 'In Progress').length;
    document.getElementById('stuResolvedCount').textContent = list.filter(c => c.status === 'Resolved').length;
    document.getElementById('stuClosedCount').textContent = list.filter(c => c.status === 'Closed').length;
  }

  function renderStudentComplaints() {
    const q = stuSearchInput.value.toLowerCase().trim();
    const cat = stuCategoryFilter.value;

    let filtered = state.studentComplaints.filter(c => {
      const matchQ = !q || c.complaint_id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
      const matchCat = cat === 'All' || c.category === cat;
      return matchQ && matchCat;
    });

    studentComplaintsTableBody.innerHTML = '';

    if (filtered.length === 0) {
      studentComplaintsTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No complaints found matching criteria.</td></tr>`;
      return;
    }

    filtered.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${c.complaint_id}</strong></td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(c.title)}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${c.category}</div>
        </td>
        <td>${escapeHtml(c.location)}</td>
        <td>${new Date(c.created_at).toLocaleDateString()}</td>
        <td>${getPriorityBadge(c.priority)}</td>
        <td>${getStatusBadge(c.status)}</td>
        <td>
          <button class="btn btn-sm btn-outline view-detail-btn" data-id="${c.id}">
            <i class="fa-solid fa-eye"></i> Track Details
          </button>
        </td>
      `;
      studentComplaintsTableBody.appendChild(tr);
    });

    studentComplaintsTableBody.querySelectorAll('.view-detail-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openComplaintDetailModal(id);
      });
    });
  }

  // Fetch Admin Complaints
  async function fetchAdminComplaints() {
    const params = new URLSearchParams({
      search: admSearchInput.value,
      status: admStatusFilter.value,
      category: admCategoryFilter.value,
      priority: admPriorityFilter.value,
      department: admDepartmentFilter.value
    });

    try {
      const data = await apiCall(`/api/admin/complaints?${params.toString()}`);
      state.adminComplaints = data.complaints;
      renderAdminComplaints();
    } catch (err) {}
  }

  // Fetch Admin Stats
  async function fetchAdminStats() {
    try {
      const data = await apiCall('/api/stats');
      const stats = data.stats;
      state.stats = stats;

      const totalSubmitted = stats.submitted + stats.under_review;
      const totalInProgress = stats.in_progress + stats.assigned;
      const totalResolvedClosed = stats.resolved + stats.closed;

      document.getElementById('admTotal').textContent = stats.total;
      document.getElementById('admSubmitted').textContent = totalSubmitted;
      document.getElementById('admInProgress').textContent = totalInProgress;
      document.getElementById('admResolved').textContent = totalResolvedClosed;
      document.getElementById('admCritical').textContent = stats.critical;
      document.getElementById('admResolutionRate').textContent = `${stats.resolution_rate}%`;

      const summaryEls = [
        ['summaryTotalComplaints', stats.total],
        ['summaryNewReview', totalSubmitted],
        ['summaryInProgress', totalInProgress],
        ['summaryResolvedClosed', totalResolvedClosed],
        ['summaryCritical', stats.critical],
        ['summaryTotalComplaintsTop', stats.total],
        ['summaryNewReviewTop', totalSubmitted],
        ['summaryInProgressTop', totalInProgress],
        ['summaryResolvedClosedTop', totalResolvedClosed],
        ['summaryCriticalTop', stats.critical]
      ];

      summaryEls.forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      });

      const topCategory = stats.summaryRows && stats.summaryRows[0];
      document.getElementById('topCategoryLabel').textContent = topCategory ? `${topCategory.label} (${topCategory.count})` : 'N/A';
      document.getElementById('criticalSummaryLabel').textContent = stats.critical || 0;
      document.getElementById('highPrioritySummaryLabel').textContent = stats.high || 0;

      const trendEntries = Object.entries(stats.monthlyTrend || {});
      document.getElementById('monthlyTrendLabel').textContent = trendEntries.length
        ? `${trendEntries[trendEntries.length - 1][0]}: ${trendEntries[trendEntries.length - 1][1]}`
        : 'N/A';

      // Populate Analytics Tables
      populateAnalyticsTables(stats);
    } catch (err) {}
  }

  function populateAnalyticsTables(stats) {
    // Category Breakdown Table
    const categoryTable = document.getElementById('categoryBreakdownTable');
    if (categoryTable && stats.by_category) {
      const categories = Object.entries(stats.by_category).sort((a, b) => b[1] - a[1]);
      categoryTable.innerHTML = categories.map(([category, count]) => {
        const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
        return `
          <tr>
            <td>${escapeHtml(category)}</td>
            <td><span class="table-count">${count}</span></td>
            <td><span class="table-percentage">${percentage}%</span></td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="3" class="muted-text">No data available</td></tr>';
    }

    // Department Breakdown Table
    const departmentTable = document.getElementById('departmentBreakdownTable');
    if (departmentTable && stats.by_department) {
      const departments = Object.entries(stats.by_department).sort((a, b) => b[1] - a[1]);
      departmentTable.innerHTML = departments.map(([dept, count]) => {
        const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
        return `
          <tr>
            <td>${escapeHtml(dept)}</td>
            <td><span class="table-count">${count}</span></td>
            <td><span class="table-percentage">${percentage}%</span></td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="3" class="muted-text">No data available</td></tr>';
    }

    // Priority Breakdown Table
    const priorityTable = document.getElementById('priorityBreakdownTable');
    if (priorityTable && stats.by_priority) {
      const priorities = Object.entries(stats.by_priority).sort((a, b) => {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return (order[a[0]] || 999) - (order[b[0]] || 999);
      });
      priorityTable.innerHTML = priorities.map(([priority, count]) => {
        const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
        return `
          <tr>
            <td><span class="prio-${priority.toLowerCase()}">${priority}</span></td>
            <td><span class="table-count">${count}</span></td>
            <td><span class="table-percentage">${percentage}%</span></td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="3" class="muted-text">No data available</td></tr>';
    }

    // Status Breakdown Table
    const statusTable = document.getElementById('statusBreakdownTable');
    if (statusTable) {
      const statuses = [
        ['Submitted', stats.submitted],
        ['Under Review', stats.under_review],
        ['Assigned', stats.assigned],
        ['In Progress', stats.in_progress],
        ['Resolved', stats.resolved],
        ['Closed', stats.closed]
      ].filter(([, count]) => count > 0);

      statusTable.innerHTML = statuses.map(([status, count]) => {
        const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
        const statusClass = status.toLowerCase().replace(' ', '-');
        return `
          <tr>
            <td><span class="status-${statusClass}">${status}</span></td>
            <td><span class="table-count">${count}</span></td>
            <td><span class="table-percentage">${percentage}%</span></td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="3" class="muted-text">No data available</td></tr>';
    }
  }

  async function fetchActiveUsers() {
    try {
      const data = await apiCall('/api/admin/active-users');
      const users = data.users || [];

      if (!activeUsersList) return;

      if (!users.length) {
        activeUsersList.innerHTML = '<p class="muted-text">No active users right now.</p>';
        return;
      }

      activeUsersList.innerHTML = users.map(user => `
        <div class="active-user-item">
          <div class="user-pill ${user.role.toLowerCase()}">${user.role}</div>
          <div class="user-meta">
            <strong>${escapeHtml(user.name)}</strong>
            <span>${escapeHtml(user.email)}</span>
          </div>
          <small>Logged in: ${new Date(user.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
        </div>
      `).join('');
    } catch (err) {
      if (activeUsersList) {
        activeUsersList.innerHTML = '<p class="muted-text">Unable to load active users.</p>';
      }
    }
  }

  async function fetchSessionHistory() {
    try {
      const data = await apiCall('/api/admin/session-history');
      const summary = data.summary || {};
      const history = data.history || [];

      if (sessionSummary) {
        sessionSummary.innerHTML = `
          <div class="session-stat-grid">
            <div class="session-stat-box">
              <span class="stat-label">Active now</span>
              <strong>${summary.activeUsers || 0}</strong>
            </div>
            <div class="session-stat-box">
              <span class="stat-label">Closed</span>
              <strong>${summary.closedSessions || 0}</strong>
            </div>
            <div class="session-stat-box">
              <span class="stat-label">Total sessions</span>
              <strong>${summary.totalSessions || 0}</strong>
            </div>
          </div>
        `;
      }

      if (sessionHistoryList) {
        if (!history.length) {
          sessionHistoryList.innerHTML = '<p class="muted-text">No login activity recorded yet.</p>';
          return;
        }

        sessionHistoryList.innerHTML = history.map(entry => `
          <div class="session-history-item">
            <div>
              <strong>${escapeHtml(entry.name)}</strong>
              <span>${escapeHtml(entry.email)}</span>
            </div>
            <div class="session-meta">
              <span class="user-pill ${entry.role.toLowerCase()}">${entry.role}</span>
              <span>${entry.status === 'active' ? 'Logged in' : 'Closed'}</span>
            </div>
            <small>${entry.status === 'active' ? `Last seen: ${new Date(entry.lastSeen).toLocaleString()}` : `Closed: ${new Date(entry.logoutAt || entry.lastSeen).toLocaleString()}`}</small>
          </div>
        `).join('');
      }
    } catch (err) {
      if (sessionSummary) {
        sessionSummary.innerHTML = '<p class="muted-text">Unable to load session history.</p>';
      }
      if (sessionHistoryList) {
        sessionHistoryList.innerHTML = '<p class="muted-text">No session history available.</p>';
      }
    }
  }

  function renderAdminComplaints() {
    adminComplaintsTableBody.innerHTML = '';

    if (state.adminComplaints.length === 0) {
      adminComplaintsTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 24px; color: var(--text-muted);">No records found matching filters.</td></tr>`;
      return;
    }

    state.adminComplaints.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${c.complaint_id}</strong></td>
        <td>
          <div style="font-weight:600;">${escapeHtml(c.student_name)}</div>
          <div style="font-size:11px; color: var(--text-muted);">${escapeHtml(c.student_email)}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(c.title)}</div>
          <div style="font-size:11px; color: var(--text-muted);">${c.category}</div>
        </td>
        <td>${escapeHtml(c.location)}</td>
        <td>
          <div style="font-size:12px; font-weight:600;">${c.assigned_department}</div>
          <div style="font-size:11px; color: var(--text-muted);">${c.assigned_staff}</div>
        </td>
        <td>${getPriorityBadge(c.priority)}</td>
        <td>${getStatusBadge(c.status)}</td>
        <td>
          <div style="display:flex; gap: 4px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-outline view-detail-btn" data-id="${c.id}" title="View Details">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline admin-act-btn" data-id="${c.id}" data-type="assign" title="Assign Dept">
              <i class="fa-solid fa-user-gear"></i>
            </button>
            <button class="btn btn-sm btn-outline admin-act-btn" data-id="${c.id}" data-type="status" title="Update Status">
              <i class="fa-solid fa-arrow-rotate-right"></i>
            </button>
            <button class="btn btn-sm btn-outline admin-act-btn" data-id="${c.id}" data-type="resolve" title="Resolve Issue">
              <i class="fa-solid fa-check"></i>
            </button>
          </div>
        </td>
      `;
      adminComplaintsTableBody.appendChild(tr);
    });

    adminComplaintsTableBody.querySelectorAll('.view-detail-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openComplaintDetailModal(id);
      });
    });

    adminComplaintsTableBody.querySelectorAll('.admin-act-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const type = e.currentTarget.getAttribute('data-type');
        openAdminActionModal(id, type);
      });
    });
  }

  // Open Complaint Detail & Stepper Timeline Modal
  async function openComplaintDetailModal(id) {
    try {
      const data = await apiCall(`/api/complaints/${id}`);
      const { complaint, updates, feedback } = data;
      state.currentDetailComplaint = complaint;

      document.getElementById('detailIdBadge').textContent = complaint.complaint_id;
      document.getElementById('detailTitleText').textContent = complaint.title;
      document.getElementById('detailCategory').textContent = complaint.category;
      document.getElementById('detailLocation').textContent = complaint.location;
      document.getElementById('detailStatusBadge').innerHTML = getStatusBadge(complaint.status);
      document.getElementById('detailPriorityBadge').innerHTML = getPriorityBadge(complaint.priority);
      document.getElementById('detailAssignedDept').textContent = complaint.assigned_department;
      document.getElementById('detailAssignedStaff').textContent = complaint.assigned_staff;
      document.getElementById('detailDescriptionText').textContent = complaint.description;

      // Attachment link
      const attachContainer = document.getElementById('detailAttachmentContainer');
      const attachLink = document.getElementById('detailAttachmentLink');
      if (complaint.attachment) {
        attachContainer.style.display = 'block';
        attachLink.href = complaint.attachment;
      } else {
        attachContainer.style.display = 'none';
      }

      // Resolution Card
      const resCard = document.getElementById('detailResolutionCard');
      if (complaint.resolution_details) {
        resCard.style.display = 'block';
        document.getElementById('detailResolutionText').textContent = complaint.resolution_details;
      } else {
        resCard.style.display = 'none';
      }

      // Render Stepper Timeline
      renderStatusStepper(complaint.status);

      // Render Timeline Updates List
      const timelineList = document.getElementById('timelineList');
      timelineList.innerHTML = '';
      updates.forEach(u => {
        const div = document.createElement('div');
        div.className = 'timeline-entry';
        div.innerHTML = `
          <div class="timeline-entry-content">
            <h5>${escapeHtml(u.user_name)} <span class="badge" style="font-size:10px;">${u.user_role}</span></h5>
            <p>${escapeHtml(u.comment)}</p>
            <div class="timeline-entry-meta"><i class="fa-solid fa-clock"></i> ${new Date(u.created_at).toLocaleString()}</div>
          </div>
        `;
        timelineList.appendChild(div);
      });

      // Feedback controls for Student
      const studentFeedbackSection = document.getElementById('studentFeedbackSection');
      const existingFeedbackDisplay = document.getElementById('existingFeedbackDisplay');
      if (state.user.role === 'Student' && (complaint.status === 'Resolved' || complaint.status === 'Closed')) {
        studentFeedbackSection.style.display = 'block';
        if (feedback) {
          feedbackForm.style.display = 'none';
          existingFeedbackDisplay.style.display = 'block';
          existingFeedbackDisplay.innerHTML = `
            <div style="color: #f59e0b; font-size: 18px; margin-bottom: 4px;">
              ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}
            </div>
            <p style="font-size: 13px; color: var(--text-secondary);">${escapeHtml(feedback.comment || 'No comment provided.')}</p>
          `;
        } else {
          feedbackForm.style.display = 'block';
          existingFeedbackDisplay.style.display = 'none';
          highlightStars(5);
        }
      } else {
        studentFeedbackSection.style.display = 'none';
      }

      openModal(complaintDetailModal);
    } catch (err) {}
  }

  // Render Status Stepper Progress Bar
  function renderStatusStepper(currentStatus) {
    const statuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
    const currentIndex = statuses.indexOf(currentStatus);

    const stepMap = {
      'Submitted': 'stepSubmitted',
      'Under Review': 'stepUnderReview',
      'Assigned': 'stepAssigned',
      'In Progress': 'stepInProgress',
      'Resolved': 'stepResolved',
      'Closed': 'stepClosed'
    };

    statuses.forEach((st, idx) => {
      const el = document.getElementById(stepMap[st]);
      if (el) {
        if (idx <= currentIndex) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });
  }

  // Open Admin Action Modal (Assign, Status, Priority, Resolve)
  function openAdminActionModal(complaintId, actionType) {
    const complaint = state.adminComplaints.find(c => c.id === complaintId);
    if (!complaint) return;

    document.getElementById('actionComplaintId').value = complaint.id;
    document.getElementById('actionType').value = actionType;

    const titleEl = document.getElementById('adminActionModalTitle');
    const statusGroup = document.getElementById('actionStatusGroup');
    const assignGroup = document.getElementById('actionAssignGroup');
    const priorityGroup = document.getElementById('actionPriorityGroup');
    const noteLabel = document.getElementById('actionNoteLabel');

    statusGroup.style.display = 'none';
    assignGroup.style.display = 'none';
    priorityGroup.style.display = 'none';

    if (actionType === 'status') {
      titleEl.textContent = `Update Status for ${complaint.complaint_id}`;
      statusGroup.style.display = 'block';
      document.getElementById('actionStatusSelect').value = complaint.status;
      noteLabel.textContent = 'Status Change Note';
    } else if (actionType === 'assign') {
      titleEl.textContent = `Assign Department/Staff for ${complaint.complaint_id}`;
      assignGroup.style.display = 'block';
      document.getElementById('actionDeptSelect').value = complaint.assigned_department !== 'Unassigned' ? complaint.assigned_department : 'IT Department';
      document.getElementById('actionStaffSelect').value = complaint.assigned_staff;
      noteLabel.textContent = 'Assignment Instructions';
    } else if (actionType === 'priority') {
      titleEl.textContent = `Adjust Priority for ${complaint.complaint_id}`;
      priorityGroup.style.display = 'block';
      document.getElementById('actionPrioritySelect').value = complaint.priority;
      noteLabel.textContent = 'Reason for Priority Shift';
    } else if (actionType === 'resolve') {
      titleEl.textContent = `Mark ${complaint.complaint_id} as Resolved`;
      noteLabel.textContent = 'Resolution Details (Required)';
    }

    openModal(adminActionModal);
  }

  // Handle Admin Action Form Submit
  async function handleAdminActionSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('actionComplaintId').value;
    const actionType = document.getElementById('actionType').value;
    const commentText = document.getElementById('actionNoteText').value.trim();

    try {
      if (actionType === 'status') {
        const status = document.getElementById('actionStatusSelect').value;
        await apiCall(`/api/admin/complaints/${id}/status`, 'PUT', { status, comment: commentText });
        showToast('Status updated successfully!', 'success');
      } else if (actionType === 'assign') {
        const department = document.getElementById('actionDeptSelect').value;
        const staff = document.getElementById('actionStaffSelect').value;
        await apiCall(`/api/admin/complaints/${id}/assign`, 'PUT', { department, staff, comment: commentText });
        showToast('Department & staff assigned!', 'success');
      } else if (actionType === 'priority') {
        const priority = document.getElementById('actionPrioritySelect').value;
        await apiCall(`/api/admin/complaints/${id}/priority`, 'PUT', { priority });
        showToast('Priority level updated!', 'success');
      } else if (actionType === 'resolve') {
        if (!commentText) {
          showToast('Resolution details are required.', 'error');
          return;
        }
        await apiCall(`/api/admin/complaints/${id}/resolve`, 'POST', { resolution_details: commentText });
        showToast('Complaint marked as resolved!', 'success');
      }

      closeModal(adminActionModal);
      document.getElementById('actionNoteText').value = '';
      fetchAdminComplaints();
      fetchAdminStats();
    } catch (err) {}
  }

  // Handle Student Feedback Submission
  async function handleFeedbackSubmit(e) {
    e.preventDefault();
    if (!state.currentDetailComplaint) return;

    const comment = document.getElementById('feedbackComment').value;
    try {
      await apiCall(`/api/complaints/${state.currentDetailComplaint.id}/feedback`, 'POST', {
        rating: state.selectedRating,
        comment: comment
      });

      showToast('Thank you for rating our service!', 'success');
      openComplaintDetailModal(state.currentDetailComplaint.id);
    } catch (err) {}
  }

  // Helper Badge Utilities
  function getStatusBadge(status) {
    const classMap = {
      'Submitted': 'status-submitted',
      'Under Review': 'status-under-review',
      'Assigned': 'status-assigned',
      'In Progress': 'status-in-progress',
      'Resolved': 'status-resolved',
      'Closed': 'status-closed'
    };
    return `<span class="badge ${classMap[status] || ''}">${status}</span>`;
  }

  function getPriorityBadge(prio) {
    const classMap = {
      'Low': 'prio-low',
      'Medium': 'prio-medium',
      'High': 'prio-high',
      'Critical': 'prio-critical'
    };
    return `<span class="badge ${classMap[prio] || ''}">${prio}</span>`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
