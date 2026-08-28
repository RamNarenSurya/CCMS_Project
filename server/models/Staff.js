const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  department_id: { type: String, required: true },
  role: { type: String, default: 'Staff Member' }
});

module.exports = mongoose.models.Staff || mongoose.model('Staff', staffSchema);
