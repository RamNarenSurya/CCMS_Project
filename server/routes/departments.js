const express = require('express');
const router = express.Router();
const { readDB } = require('../db');

// GET /api/departments - Get departments and staff members
router.get('/', (req, res) => {
  const db = readDB();
  res.json({
    success: true,
    departments: db.departments,
    staff: db.staff
  });
});

module.exports = router;
