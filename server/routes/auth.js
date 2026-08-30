const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { readDB, writeDB } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'college_complaint_mgmt_secret_key_2026';
const ACTIVE_SESSION_TIMEOUT_MS = 15 * 60 * 1000;

const activeUsers = new Map();
const sessionHistory = new Map();

function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function markUserActive(user) {
  const cleanUser = sanitizeUser(user);
  const now = new Date().toISOString();

  const session = sessionHistory.get(user.id) || {
    userId: user.id,
    name: cleanUser.name,
    email: cleanUser.email,
    role: cleanUser.role,
    loginAt: now,
    lastSeen: now,
    logoutAt: null,
    status: 'active'
  };

  session.name = cleanUser.name;
  session.email = cleanUser.email;
  session.role = cleanUser.role;
  session.lastSeen = now;
  session.status = 'active';
  session.logoutAt = null;
  if (!session.loginAt) {
    session.loginAt = now;
  }
  sessionHistory.set(user.id, session);

  activeUsers.set(user.id, {
    ...cleanUser,
    loggedInAt: session.loginAt,
    lastSeen: session.lastSeen
  });
  return activeUsers.get(user.id);
}

function touchUserActivity(userId) {
  if (!userId || !activeUsers.has(userId)) return null;
  const user = activeUsers.get(userId);
  user.lastSeen = new Date().toISOString();

  const session = sessionHistory.get(userId);
  if (session) {
    session.lastSeen = user.lastSeen;
    session.status = 'active';
    session.logoutAt = null;
  }
  return user;
}

function removeUserActive(userId) {
  const session = sessionHistory.get(userId);
  if (session) {
    session.logoutAt = new Date().toISOString();
    session.status = 'closed';
    session.lastSeen = session.logoutAt;
  }
  activeUsers.delete(userId);
}

function cleanupInactiveUsers() {
  const now = Date.now();
  for (const [userId, user] of activeUsers.entries()) {
    const lastSeen = new Date(user.lastSeen).getTime();
    if (now - lastSeen > ACTIVE_SESSION_TIMEOUT_MS) {
      removeUserActive(userId);
    }
  }
}

function getActiveUsers() {
  cleanupInactiveUsers();
  return Array.from(activeUsers.values()).sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
}

function getSessionHistory() {
  cleanupInactiveUsers();
  return Array.from(sessionHistory.values()).sort((a, b) => {
    const bTime = new Date(b.lastSeen || b.loginAt).getTime();
    const aTime = new Date(a.lastSeen || a.loginAt).getTime();
    return bTime - aTime;
  });
}

function getSessionSummary() {
  const history = getSessionHistory();
  const activeUsersCount = getActiveUsers().length;
  return {
    activeUsers: activeUsersCount,
    totalSessions: history.length,
    closedSessions: history.filter(session => session.status === 'closed').length,
    recentSessions: history.slice(0, 8)
  };
}

setInterval(cleanupInactiveUsers, 60 * 1000);

module.exports = router;
module.exports.sanitizeUser = sanitizeUser;
module.exports.markUserActive = markUserActive;
module.exports.touchUserActivity = touchUserActivity;
module.exports.removeUserActive = removeUserActive;
module.exports.getActiveUsers = getActiveUsers;
module.exports.getSessionHistory = getSessionHistory;
module.exports.getSessionSummary = getSessionSummary;

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
  markUserActive(newUser);

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
  markUserActive(user);

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

    touchUserActivity(decoded.id);
    res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ success: true, message: 'No active session to clear.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    removeUserActive(decoded.id);
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    return res.json({ success: true, message: 'Session already cleared.' });
  }
});

module.exports = router;
module.exports.sanitizeUser = sanitizeUser;
module.exports.markUserActive = markUserActive;
module.exports.touchUserActivity = touchUserActivity;
module.exports.removeUserActive = removeUserActive;
module.exports.getActiveUsers = getActiveUsers;
