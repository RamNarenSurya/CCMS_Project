const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  student_id: { type: String, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: '' },
  department: { type: String, default: 'General' },
  year: { type: String, default: '1st Year' },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Admin', 'Staff'], default: 'Student' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
