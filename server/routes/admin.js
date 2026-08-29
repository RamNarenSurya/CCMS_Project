const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { readDB, writeDB } = require('../db');
const { getActiveUsers } = require('./auth');

const JWT_SECRET = process.env.JWT_SECRET || 'college_complaint_mgmt_secret_key_2026';

function requireAdminOrStaff(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'Admin' && decoded.role !== 'Staff') {
      return res.status(403).json({ success: false, message: 'Admin or Staff access level required.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

// GET /api/admin/complaints - Get all complaints with search & filters
router.get('/active-users', requireAdminOrStaff, (req, res) => {
  const users = getActiveUsers();
  res.json({
    success: true,
    count: users.length,
    users
  });
});

router.get('/complaints', requireAdminOrStaff, (req, res) => {
  const { search, category, status, priority, department, sort } = req.query;
  const db = readDB();
  let list = [...db.complaints];

  // Search filter (Complaint ID, title, student name, location, description)
  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(c => 
      c.complaint_id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.student_name.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }

  // Filter by category
  if (category && category !== 'All') {
    list = list.filter(c => c.category === category);
  }

  // Filter by status
  if (status && status !== 'All') {
    list = list.filter(c => c.status === status);
  }

  // Filter by priority
  if (priority && priority !== 'All') {
    list = list.filter(c => c.priority === priority);
  }

  // Filter by department
  if (department && department !== 'All') {
    list = list.filter(c => c.assigned_department === department);
  }

  // Sorting
  if (sort === 'oldest') {
    list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (sort === 'priority') {
    const priorityWeight = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    list.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  } else {
    // Default newest first
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  res.json({
    success: true,
    count: list.length,
    complaints: list
  });
});

// PUT /api/admin/complaints/:id/status - Update complaint status
router.put('/complaints/:id/status', requireAdminOrStaff, (req, res) => {
  const { status, comment } = req.body;
  const searchId = req.params.id;

  const validStatuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  const db = readDB();
  const complaint = db.complaints.find(c => c.id === searchId || c.complaint_id === searchId);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  const prevStatus = complaint.status;
  complaint.status = status;
  complaint.updated_at = new Date().toISOString();

  if (status === 'Closed' && !complaint.closed_at) {
    complaint.closed_at = new Date().toISOString();
  }

  // Log status change update
  const logComment = comment || `Status updated from "${prevStatus}" to "${status}".`;
  db.complaint_updates.push({
    id: `UPD-${Date.now()}`,
    complaint_id: complaint.complaint_id,
    user_name: req.user.name,
    user_role: req.user.role,
    comment: logComment,
    status: status,
    created_at: new Date().toISOString()
  });

  writeDB(db);

  res.json({
    success: true,
    message: `Status updated to ${status}.`,
    complaint
  });
});

// PUT /api/admin/complaints/:id/assign - Assign department & staff
router.put('/complaints/:id/assign', requireAdminOrStaff, (req, res) => {
  const { department, staff, comment } = req.body;
  const searchId = req.params.id;

  if (!department) {
    return res.status(400).json({ success: false, message: 'Department name is required.' });
  }

  const db = readDB();
  const complaint = db.complaints.find(c => c.id === searchId || c.complaint_id === searchId);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  complaint.assigned_department = department;
  complaint.assigned_staff = staff || 'Unassigned';
  if (complaint.status === 'Submitted' || complaint.status === 'Under Review') {
    complaint.status = 'Assigned';
  }
  complaint.updated_at = new Date().toISOString();

  db.complaint_updates.push({
    id: `UPD-${Date.now()}`,
    complaint_id: complaint.complaint_id,
    user_name: req.user.name,
    user_role: req.user.role,
    comment: comment || `Assigned to ${department}${staff ? ` (${staff})` : ''}.`,
    status: complaint.status,
    created_at: new Date().toISOString()
  });

  writeDB(db);

  res.json({
    success: true,
    message: `Complaint assigned to ${department}.`,
    complaint
  });
});

// PUT /api/admin/complaints/:id/priority - Update complaint priority
router.put('/complaints/:id/priority', requireAdminOrStaff, (req, res) => {
  const { priority } = req.body;
  const searchId = req.params.id;

  const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ success: false, message: 'Invalid priority level.' });
  }

  const db = readDB();
  const complaint = db.complaints.find(c => c.id === searchId || c.complaint_id === searchId);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  const prevPriority = complaint.priority;
  complaint.priority = priority;
  complaint.updated_at = new Date().toISOString();

  db.complaint_updates.push({
    id: `UPD-${Date.now()}`,
    complaint_id: complaint.complaint_id,
    user_name: req.user.name,
    user_role: req.user.role,
    comment: `Priority level adjusted from ${prevPriority} to ${priority}.`,
    status: complaint.status,
    created_at: new Date().toISOString()
  });

  writeDB(db);

  res.json({
    success: true,
    message: `Priority updated to ${priority}.`,
    complaint
  });
});

// POST /api/admin/complaints/:id/comment - Add comment/update
router.post('/complaints/:id/comment', requireAdminOrStaff, (req, res) => {
  const { comment } = req.body;
  const searchId = req.params.id;

  if (!comment || !comment.trim()) {
    return res.status(400).json({ success: false, message: 'Comment text cannot be empty.' });
  }

  const db = readDB();
  const complaint = db.complaints.find(c => c.id === searchId || c.complaint_id === searchId);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  complaint.admin_comments = comment.trim();
  complaint.updated_at = new Date().toISOString();

  const newUpdate = {
    id: `UPD-${Date.now()}`,
    complaint_id: complaint.complaint_id,
    user_name: req.user.name,
    user_role: req.user.role,
    comment: comment.trim(),
    status: complaint.status,
    created_at: new Date().toISOString()
  };

  db.complaint_updates.push(newUpdate);
  writeDB(db);

  res.json({
    success: true,
    message: 'Comment added successfully.',
    update: newUpdate
  });
});

// POST /api/admin/complaints/:id/resolve - Mark complaint as resolved with resolution details
router.post('/complaints/:id/resolve', requireAdminOrStaff, (req, res) => {
  const { resolution_details } = req.body;
  const searchId = req.params.id;

  if (!resolution_details || !resolution_details.trim()) {
    return res.status(400).json({ success: false, message: 'Resolution details are required.' });
  }

  const db = readDB();
  const complaint = db.complaints.find(c => c.id === searchId || c.complaint_id === searchId);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  complaint.status = 'Resolved';
  complaint.resolution_details = resolution_details.trim();
  complaint.updated_at = new Date().toISOString();

  db.complaint_updates.push({
    id: `UPD-${Date.now()}`,
    complaint_id: complaint.complaint_id,
    user_name: req.user.name,
    user_role: req.user.role,
    comment: `Issue Resolved: ${resolution_details.trim()}`,
    status: 'Resolved',
    created_at: new Date().toISOString()
  });

  writeDB(db);

  res.json({
    success: true,
    message: 'Complaint marked as resolved!',
    complaint
  });
});

module.exports = router;
