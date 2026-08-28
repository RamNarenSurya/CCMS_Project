const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { readDB, writeDB } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'college_complaint_mgmt_secret_key_2026';

// Storage setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

// POST /api/complaints - Submit new complaint
router.post('/', authenticateToken, upload.single('attachment'), (req, res) => {
  const { title, category, description, location, priority } = req.body;

  if (!title || !category || !description || !location) {
    return res.status(400).json({ success: false, message: 'Title, category, description, and location are required.' });
  }

  const db = readDB();
  const studentUser = db.users.find(u => u.id === req.user.id) || req.user;

  // Generate unique complaint ID CMP-2026-XXXXX
  const nextNum = (db.complaints.length + 101).toString().padStart(5, '0');
  const complaint_id = `CMP-2026-${nextNum}`;

  let attachmentPath = null;
  if (req.file) {
    attachmentPath = `/uploads/${req.file.filename}`;
  } else if (req.body.attachment_url) {
    attachmentPath = req.body.attachment_url;
  }

  const newComplaint = {
    id: String(Date.now()),
    complaint_id,
    student_id: req.user.id,
    student_name: studentUser.name || req.user.name,
    student_email: studentUser.email || req.user.email,
    title: title.trim(),
    category: category.trim(),
    description: description.trim(),
    location: location.trim(),
    attachment: attachmentPath,
    priority: priority || 'Medium',
    status: 'Submitted',
    assigned_department: 'Unassigned',
    assigned_staff: 'Unassigned',
    admin_comments: 'Complaint received and queued for review.',
    resolution_details: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    closed_at: null
  };

  db.complaints.unshift(newComplaint);

  // Add initial timeline update
  db.complaint_updates.push({
    id: `UPD-${Date.now()}`,
    complaint_id,
    user_name: studentUser.name || req.user.name,
    user_role: 'Student',
    comment: 'Complaint submitted by student.',
    status: 'Submitted',
    created_at: new Date().toISOString()
  });

  writeDB(db);

  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully!',
    complaint: newComplaint
  });
});

// GET /api/complaints/my - Get current student's complaints
router.get('/my', authenticateToken, (req, res) => {
  const db = readDB();
  let userComplaints;

  if (req.user.role === 'Admin') {
    userComplaints = db.complaints;
  } else if (req.user.role === 'Staff') {
    userComplaints = db.complaints.filter(c => 
      c.assigned_staff === req.user.name || 
      c.assigned_department === req.user.department
    );
  } else {
    userComplaints = db.complaints.filter(c => c.student_id === req.user.id || c.student_email === req.user.email);
  }

  res.json({
    success: true,
    complaints: userComplaints
  });
});

// GET /api/complaints/:id - Get complaint details with timeline & feedback
router.get('/:id', authenticateToken, (req, res) => {
  const db = readDB();
  const searchId = req.params.id;

  const complaint = db.complaints.find(c => c.id === searchId || c.complaint_id === searchId);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  // Authorization check for student
  if (req.user.role === 'Student' && complaint.student_id !== req.user.id && complaint.student_email !== req.user.email) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const updates = db.complaint_updates.filter(u => u.complaint_id === complaint.complaint_id);
  const feedback = db.feedback.find(f => f.complaint_id === complaint.complaint_id) || null;

  res.json({
    success: true,
    complaint,
    updates,
    feedback
  });
});

// POST /api/complaints/:id/feedback - Submit student resolution feedback & rating
router.post('/:id/feedback', authenticateToken, (req, res) => {
  const { rating, comment } = req.body;
  const searchId = req.params.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5.' });
  }

  const db = readDB();
  const complaint = db.complaints.find(c => c.id === searchId || c.complaint_id === searchId);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found.' });
  }

  const existingFeedback = db.feedback.find(f => f.complaint_id === complaint.complaint_id);
  if (existingFeedback) {
    return res.status(400).json({ success: false, message: 'Feedback has already been provided for this complaint.' });
  }

  const newFeedback = {
    id: `FBD-${Date.now()}`,
    complaint_id: complaint.complaint_id,
    student_id: req.user.id,
    rating: parseInt(rating, 10),
    comment: comment ? comment.trim() : '',
    created_at: new Date().toISOString()
  };

  db.feedback.push(newFeedback);
  writeDB(db);

  res.json({
    success: true,
    message: 'Thank you for your feedback!',
    feedback: newFeedback
  });
});

module.exports = router;
