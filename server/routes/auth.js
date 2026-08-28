const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { readDB, writeDB } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'college_complaint_mgmt_secret_key_2026';

// Helper to sanitize user output
function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, student_id, email, phone, department, year, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const db = readDB();

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() || (student_id && u.student_id === student_id));
  if (existing) {
    return res.status(400).json({ success: false, message: 'User with this email or student ID already exists.' });
  }

  const userRole = role === 'Admin' || role === 'Staff' ? role : 'Student';
  const newUserId = `USR-${userRole.substring(0,3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const genStudentId = student_id || `STU-2026-${Math.floor(100 + Math.random() * 900)}`;

  const newUser = {
    id: newUserId,
    name,
    student_id: genStudentId,
    email: email.toLowerCase(),
    phone: phone || '',
    department: department || 'General',
    year: year || '1st Year',
    password: password, // In production, hash with bcrypt
    role: userRole,
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    success: true,
    message: 'Registration successful!',
    token,
    user: sanitizeUser(newUser)
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email/Student ID and password are required.' });
  }

  const db = readDB();
  const searchInput = email.toLowerCase().trim();

  const user = db.users.find(u => 
    u.email.toLowerCase() === searchInput || 
    (u.student_id && u.student_id.toLowerCase() === searchInput)
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email/ID and password.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    token,
    user: sanitizeUser(user)
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = readDB();
    const user = db.users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
});

module.exports = router;
