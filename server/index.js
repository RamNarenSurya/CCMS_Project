require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database (MongoDB connection & Local Fallback)
initDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve file uploads static path
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/ai', require('./routes/ai'));

// SPA Fallback for unknown frontend routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` 🏫 COLLEGE COMPLAINT MANAGEMENT SYSTEM IS ONLINE`);
    console.log(` 🚀 Server running at : http://localhost:${PORT}`);
    console.log(` 🍃 MongoDB URI       : ${process.env.MONGODB_URI || 'mongodb://localhost:27017/college_complaint_db'}`);
    console.log(` 🔐 Quick Demo Accounts:`);
    console.log(`    • Student : alex.student@college.edu / student123`);
    console.log(`    • Admin   : admin@college.edu / admin123`);
    console.log(`    • Staff   : it.staff@college.edu / staff123`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
