const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  complaint_id: { type: String, required: true, unique: true },
  student_id: { type: String, required: true },
  student_name: { type: String, required: true },
  student_email: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  attachment: { type: String, default: null },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'], default: 'Submitted' },
  assigned_department: { type: String, default: 'Unassigned' },
  assigned_staff: { type: String, default: 'Unassigned' },
  admin_comments: { type: String, default: 'Complaint received and queued for review.' },
  resolution_details: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  closed_at: { type: Date, default: null }
});

module.exports = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
