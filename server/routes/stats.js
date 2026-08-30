const express = require('express');
const router = express.Router();
const { readDB } = require('../db');

// GET /api/stats - System statistics summary
router.get('/', (req, res) => {
  const db = readDB();
  const complaints = db.complaints;

  const total = complaints.length;
  const submitted = complaints.filter(c => c.status === 'Submitted').length;
  const under_review = complaints.filter(c => c.status === 'Under Review').length;
  const assigned = complaints.filter(c => c.status === 'Assigned').length;
  const in_progress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const closed = complaints.filter(c => c.status === 'Closed').length;

  const pending = submitted + under_review + assigned + in_progress;
  const critical = complaints.filter(c => c.priority === 'Critical').length;
  const high = complaints.filter(c => c.priority === 'High').length;

  const by_category = {};
  complaints.forEach(c => {
    by_category[c.category] = (by_category[c.category] || 0) + 1;
  });

  const by_priority = {};
  complaints.forEach(c => {
    by_priority[c.priority] = (by_priority[c.priority] || 0) + 1;
  });

  const by_department = {};
  complaints.forEach(c => {
    const dept = c.assigned_department || 'Unassigned';
    by_department[dept] = (by_department[dept] || 0) + 1;
  });

  const summaryRows = Object.entries(by_category)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));

  const monthlyTrend = {};
  complaints.forEach(c => {
    const date = new Date(c.created_at);
    const monthKey = date.toLocaleString('en-US', { month: 'short' });
    monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + 1;
  });

  const resolution_rate = total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0;

  res.json({
    success: true,
    stats: {
      total,
      pending,
      submitted,
      under_review,
      assigned,
      in_progress,
      resolved,
      closed,
      critical,
      high,
      resolution_rate,
      by_category,
      by_priority,
      by_department,
      summaryRows,
      monthlyTrend
    }
  });
});

module.exports = router;
