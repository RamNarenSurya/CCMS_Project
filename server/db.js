const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const DB_FILE = path.join(__dirname, 'database', 'data.json');
let rawMongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_complaint_db';

// Normalize MongoDB URI scheme if user omitted mongodb+srv://
let MONGODB_URI = rawMongoUri.trim();
if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
  MONGODB_URI = 'mongodb+srv://' + MONGODB_URI;
}

let isMongoConnected = false;
let mongoInitStarted = false;

const defaultData = {
  users: [
    {
      id: 'USR-STU-001',
      name: 'Surya',
      student_id: 'STU-2026-001',
      email: 'surya.student@college.edu',
      phone: '+ 91 7013849357',
      department: 'Computer Science',
      year: '3rd Year',
      password: 'student123',
      role: 'Student',
      created_at: new Date('2026-08-01T09:00:00Z').toISOString()
    },
    {
      id: 'USR-STU-002',
      name: 'Emily Davis',
      student_id: 'STU-2026-042',
      email: 'emily.davis@college.edu',
      phone: '+1 555-0341',
      department: 'Electrical Engineering',
      year: '2nd Year',
      password: 'student123',
      role: 'Student',
      created_at: new Date('2026-08-05T10:30:00Z').toISOString()
    },
    {
      id: 'USR-ADM-001',
      name: 'Surya',
      student_id: 'ADM-001',
      email: 'surya@college.edu',
      phone: '+91 7013849357',
      department: 'Administration',
      year: 'N/A',
      password: 'admin123',
      role: 'Admin',
      created_at: new Date('2026-01-01T00:00:00Z').toISOString()
    },
    {
      id: 'USR-STF-001',
      name: 'Surya',
      student_id: 'STF-101',
      email: 'surya.staff@college.edu',
      phone: '+91 7013849357',
      department: 'IT Department',
      year: 'Staff',
      password: 'staff123',
      role: 'Staff',
      created_at: new Date('2026-02-15T08:00:00Z').toISOString()
    },
    {
      id: 'USR-STF-002',
      name: 'Surya Facilities',
      student_id: 'STF-102',
      email: 'surya.facilities@college.edu',
      phone: '+91 7013849357',
      department: 'Maintenance Department',
      year: 'Staff',
      password: 'staff123',
      role: 'Staff',
      created_at: new Date('2026-02-15T08:00:00Z').toISOString()
    }
  ],

  departments: [
    { id: 'DEP-IT', name: 'IT Department', description: 'Handles Wi-Fi, lab computers, servers, and smart classroom technology.' },
    { id: 'DEP-MAINT', name: 'Maintenance Department', description: 'Manages furniture, electrical repairs, plumbing, and general repairs.' },
    { id: 'DEP-HOSTEL', name: 'Hostel Facilities Department', description: 'Oversees student accommodation, mess facilities, and hostel cleanliness.' },
    { id: 'DEP-TRANS', name: 'Transport Department', description: 'Manages campus buses, parking lots, and transit issues.' },
    { id: 'DEP-SEC', name: 'Campus Security & Cleanliness', description: 'Responsible for campus security, waste management, and sanitation.' }
  ],

  staff: [
    { id: 'STF-101', user_id: 'USR-STF-001', name: 'Mark Miller', email: 'it.staff@college.edu', department_id: 'DEP-IT', role: 'Network Specialist' },
    { id: 'STF-102', user_id: 'USR-STF-002', name: 'Sarah Jenkins', email: 'maint.staff@college.edu', department_id: 'DEP-MAINT', role: 'Facilities Engineer' },
    { id: 'STF-103', user_id: 'USR-STF-003', name: 'David Smith', email: 'hostel.staff@college.edu', department_id: 'DEP-HOSTEL', role: 'Hostel Supervisor' }
  ],

  complaints: [
    {
      id: '1',
      complaint_id: 'CMP-2026-00101',
      student_id: 'USR-STU-001',
      student_name: 'Surya',
      student_email: 'surya.student@college.edu',
      title: 'Wi-Fi connection drop in Computer Lab 2',
      category: 'Wi-Fi / Internet',
      description: 'The wireless access point in Lab 2 disconnects every 10 minutes during regular class hours. Cannot access practical lab resources.',
      location: 'Block B - Computer Lab 2',
      attachment: null,
      priority: 'High',
      status: 'In Progress',
      assigned_department: 'IT Department',
      assigned_staff: 'Mark Miller',
      admin_comments: 'Assigned router replacement task to IT field engineer Mark Miller.',
      resolution_details: null,
      created_at: new Date('2026-08-25T10:15:00Z').toISOString(),
      updated_at: new Date('2026-08-26T14:30:00Z').toISOString(),
      closed_at: null
    },
    {
      id: '2',
      complaint_id: 'CMP-2026-00102',
      student_id: 'USR-STU-001',
      student_name: 'Alex Johnson',
      student_email: 'alex.student@college.edu',
      title: 'Broken Ceiling Fan in Room 304',
      category: 'Classroom',
      description: 'Ceiling fan #2 is producing loud screeching noise and rotating very slowly in the afternoon heat.',
      location: 'Block A - Classroom 304',
      attachment: null,
      priority: 'Medium',
      status: 'Resolved',
      assigned_department: 'Maintenance Department',
      assigned_staff: 'Sarah Jenkins',
      admin_comments: 'Electrical maintenance team dispatched.',
      resolution_details: 'Replaced fan regulator and motor capacitor. Tested and verified fully operational.',
      created_at: new Date('2026-08-20T11:00:00Z').toISOString(),
      updated_at: new Date('2026-08-22T16:00:00Z').toISOString(),
      closed_at: null
    },
    {
      id: '3',
      complaint_id: 'CMP-2026-00103',
      student_id: 'USR-STU-002',
      student_name: 'Emily Davis',
      student_email: 'emily.davis@college.edu',
      title: 'Water Supply leakage in Girls Hostel 2nd Floor',
      category: 'Hostel',
      description: 'Severe pipe leakage near Washroom 2B causing floor flooding and slip hazard.',
      location: 'Girls Hostel - 2nd Floor Block B',
      attachment: null,
      priority: 'Critical',
      status: 'Assigned',
      assigned_department: 'Hostel Facilities Department',
      assigned_staff: 'David Smith',
      admin_comments: 'Marked as urgent priority. Plumber notified.',
      resolution_details: null,
      created_at: new Date('2026-08-27T08:45:00Z').toISOString(),
      updated_at: new Date('2026-08-27T09:30:00Z').toISOString(),
      closed_at: null
    },
    {
      id: '4',
      complaint_id: 'CMP-2026-00104',
      student_id: 'USR-STU-002',
      student_name: 'Emily Davis',
      student_email: 'emily.davis@college.edu',
      title: 'Overflowing dustbin near Cafeteria Courtyard',
      category: 'Cleanliness',
      description: 'Main recycling bin overflowing with food containers causing odor.',
      location: 'Central Campus - Cafeteria Courtyard',
      attachment: null,
      priority: 'Low',
      status: 'Closed',
      assigned_department: 'Campus Security & Cleanliness',
      assigned_staff: 'Unassigned',
      admin_comments: 'Janitorial staff alerted.',
      resolution_details: 'Area cleaned and extra trash bins installed near cafeteria entrance.',
      created_at: new Date('2026-08-15T13:20:00Z').toISOString(),
      updated_at: new Date('2026-08-16T10:00:00Z').toISOString(),
      closed_at: new Date('2026-08-16T10:00:00Z').toISOString()
    }
  ],

  complaint_updates: [
    {
      id: 'UPD-001',
      complaint_id: 'CMP-2026-00101',
      user_name: 'Dr. Robert Vance (Chief Admin)',
      user_role: 'Admin',
      comment: 'Reviewed complaint. Priority set to High due to ongoing online lab exam schedule.',
      status: 'Under Review',
      created_at: new Date('2026-08-25T11:00:00Z').toISOString()
    },
    {
      id: 'UPD-002',
      complaint_id: 'CMP-2026-00101',
      user_name: 'Dr. Robert Vance (Chief Admin)',
      user_role: 'Admin',
      comment: 'Assigned complaint to IT Department (Officer Mark Miller).',
      status: 'Assigned',
      created_at: new Date('2026-08-25T11:15:00Z').toISOString()
    },
    {
      id: 'UPD-003',
      complaint_id: 'CMP-2026-00101',
      user_name: 'Mark Miller',
      user_role: 'Staff',
      comment: 'Inspected switch in Lab 2. Replacing faulty Cisco Access Point.',
      status: 'In Progress',
      created_at: new Date('2026-08-26T14:30:00Z').toISOString()
    },
    {
      id: 'UPD-004',
      complaint_id: 'CMP-2026-00102',
      user_name: 'Sarah Jenkins',
      user_role: 'Staff',
      comment: 'Issue fixed. Ceiling fan motor repaired and operational.',
      status: 'Resolved',
      created_at: new Date('2026-08-22T16:00:00Z').toISOString()
    }
  ],

  feedback: [
    {
      id: 'FBD-001',
      complaint_id: 'CMP-2026-00102',
      student_id: 'USR-STU-001',
      rating: 5,
      comment: 'Super fast turnaround! Fan is working perfectly now. Thank you maintenance team.',
      created_at: new Date('2026-08-23T09:12:00Z').toISOString()
    }
  ]
};

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function initDB() {
  const dbDir = path.dirname(DB_FILE);
  ensureDirSync(dbDir);
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  ensureDirSync(uploadsDir);

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
  }

  if (!mongoInitStarted) {
    mongoInitStarted = true;
    connectMongoAsync();
  }
}

async function connectMongoAsync() {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log(`🍃 Connected to MongoDB Database successfully at: ${MONGODB_URI}`);

    const User = require('./models/User');
    const Complaint = require('./models/Complaint');
    const Department = require('./models/Department');
    const Staff = require('./models/Staff');
    const Update = require('./models/Update');
    const Feedback = require('./models/Feedback');

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany(defaultData.users);
      await Complaint.insertMany(defaultData.complaints);
      await Department.insertMany(defaultData.departments);
      await Staff.insertMany(defaultData.staff);
      await Update.insertMany(defaultData.complaint_updates);
      await Feedback.insertMany(defaultData.feedback);
      console.log(`🌱 MongoDB Database populated with seed data.`);
    }
  } catch (err) {
    isMongoConnected = false;
    console.log(`⚠️  MongoDB connection note (${MONGODB_URI}): ${err.message}`);
    console.log(`💡 Application running using persistent local database fallback.`);
  }
}

function readDB() {
  initDB();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return defaultData;
  }
}

function writeDB(data) {
  initDB();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  initDB,
  readDB,
  writeDB,
  isMongoConnected: () => isMongoConnected
};
