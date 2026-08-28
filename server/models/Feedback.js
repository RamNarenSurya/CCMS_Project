const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  complaint_id: { type: String, required: true },
  student_id: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
