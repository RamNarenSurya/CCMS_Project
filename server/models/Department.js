const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' }
});

module.exports = mongoose.models.Department || mongoose.model('Department', departmentSchema);
