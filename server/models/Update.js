const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  complaint_id: { type: String, required: true },
  user_name: { type: String, required: true },
  user_role: { type: String, required: true },
  comment: { type: String, required: true },
  status: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Update || mongoose.model('Update', updateSchema);
