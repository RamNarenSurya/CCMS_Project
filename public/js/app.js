/* ==========================================================================
   COLLEGE COMPLAINT MANAGEMENT SYSTEM - FRONTEND APP CLIENT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Global State Store
  const state = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
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
  const showLoginBtn = document.getElementById('showLoginBtn');
  const showRegisterBtn = document.getElementById('showRegisterBtn');

  // Quick Demo Login Buttons
  const demoStudentBtn = document.getElementById('demoStudentBtn');
  const demoAdminBtn = document.getElementById('demoAdminBtn');
  const demoStaffBtn = document.getElementById('demoStaffBtn');

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
  const adminComplaintsTableBody = document.getElementById('adminComplaintsTableBody');
  const admSearchInput = document.getElementById('admSearchInput');
  const admStatusFilter = document.getElementById('admStatusFilter');
  const admCategoryFilter = document.getElementById('admCategoryFilter');
  const admPriorityFilter = document.getElementById('admPriorityFilter');
  const admDepartmentFilter = document.getElementById('admDepartmentFilter');

  // Modals
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
    setupEventListeners();
    if (state.token && state.user) {
      updateUserUI();
      loadRoleDashboard();
    } else {
      showAuthCard('login');
    }
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

    // Auth Forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);

    // Quick Demo Buttons
    demoStudentBtn.addEventListener('click', () => quickLogin('alex.student@college.edu', 'student123'));
    demoAdminBtn.addEventListener('click', () => quickLogin('admin@college.edu', 'admin123'));
    demoStaffBtn.addEventListener('click', () => quickLogin('it.staff@college.edu', 'staff123'));

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

  function handleLogout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    userInfoDisplay.style.display = 'none';
    authNavButtons.style.display = 'flex';
    studentDashboard.style.display = 'none';
    adminDashboard.style.display = 'none';

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

  function loadRoleDashboard() {
    if (state.user.role === 'Admin' || state.user.role === 'Staff') {
      studentDashboard.style.display = 'none';
      adminDashboard.style.display = 'block';
      adminRoleDisplay.innerHTML = `<i class="fa-solid fa-user-shield"></i> ${state.user.role} (${state.user.department || 'All Access'})`;
      fetchAdminComplaints();
      fetchAdminStats();
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

      document.getElementById('admTotal').textContent = stats.total;
      document.getElementById('admSubmitted').textContent = stats.submitted + stats.under_review;
      document.getElementById('admInProgress').textContent = stats.in_progress + stats.assigned;
      document.getElementById('admResolved').textContent = stats.resolved + stats.closed;
      document.getElementById('admCritical').textContent = stats.critical;
      document.getElementById('admResolutionRate').textContent = `${stats.resolution_rate}%`;

      // Render Department Breakdown Chips
      const chipsContainer = document.getElementById('deptSummaryChips');
      chipsContainer.innerHTML = '';
      Object.entries(stats.by_department).forEach(([dept, count]) => {
        const chip = document.createElement('span');
        chip.className = 'summary-chip';
        chip.innerHTML = `${dept}: <strong>${count}</strong>`;
        chipsContainer.appendChild(chip);
      });
    } catch (err) {}
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
