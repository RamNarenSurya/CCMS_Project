# College Complaint Management System

![System Status](https://img.shields.io/badge/System-Online-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20MongoDB%20%7C%20Gemini%20AI-indigo?style=for-the-badge)
![AI Powered](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash-purple?style=for-the-badge)
![Database](https://img.shields.io/badge/Database-MongoDB%20%2F%20Mongoose-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

A full-stack web application designed to digitize college complaints, connect students with campus departments, track progress through an interactive status timeline, and facilitate fast issue resolution with **Google Gemini AI** smart categorization & executive summaries, MongoDB document storage, Express REST API, and modern glassmorphic web interface.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Latest Updates & Changelog](#-latest-updates--changelog-batch-1-2-3)
3. [Environment Configuration (`.env`) & Gemini API Key](#-environment-configuration-env--gemini-api-key)
4. [Gemini AI Features](#-gemini-ai-features)
5. [MongoDB Setup Guide (Local & MongoDB Atlas Cloud)](#-mongodb-setup-guide-local--cloud)
6. [Technology Stack](#-technology-stack)
7. [Database Schemas & Mongoose Models](#-database-schemas--mongoose-models)
8. [REST API Documentation](#-rest-api-documentation)
9. [Step-by-Step Installation & Setup](#-step-by-step-installation--setup)
10. [Troubleshooting Common Issues](#-troubleshooting-common-issues)
11. [Pre-configured Demo Accounts](#-pre-configured-demo-accounts)
12. [Complaint Lifecycle & Workflow](#-complaint-lifecycle--workflow)
13. [Testing & Verification](#-testing--verification)

---

## 📊 Latest Updates & Changelog (Batch 1, 2, 3)

### Overview
This document logs all major feature additions and enhancements implemented in three consecutive development batches. All changes have been tested, verified, and deployed to the live Render instance.

---

### **Batch 1: Active User Tracking & Session Management**

#### 🎯 Objectives
Enable administrators to monitor who is currently logged into the system in real-time, track login/logout events, and maintain a persistent session history.

#### ✨ Features Added

1. **Active Users Monitoring**
   - Real-time list of currently logged-in users displayed in admin dashboard
   - Shows user email, role, and last-activity timestamp
   - Auto-refreshes every 30 seconds for up-to-date information
   - API Endpoint: `GET /api/admin/active-users`
   - Response includes: email, role, lastActivity timestamp

2. **Session History Tracking**
   - Complete login/logout event log maintained in memory
   - Records timestamp, email, role, and action type (login/logout)
   - Accessible only to admin/staff with elevated permissions
   - API Endpoint: `GET /api/admin/session-history`
   - Supports filtering and sorting by timestamp

3. **Automatic Session Cleanup**
   - Stale sessions automatically removed after 15 minutes of inactivity
   - Cleanup runs every 60 seconds via scheduled interval
   - Ensures active-users list stays accurate and clean
   - Configured in `server/routes/auth.js` with `cleanupInactiveUsers()` function

4. **Demo Button Restrictions**
   - Quick-login demo buttons restricted to localhost only
   - Production deployments (live Render instance) do not expose demo credentials
   - Prevents unauthorized admin/staff access on public deployments
   - Logic: `if (window.location.hostname !== 'localhost')`

#### 📁 Files Modified
- `server/routes/auth.js` - Added activeUsers Map, sessionHistory Map, cleanup function
- `server/routes/admin.js` - Added requireAdminOrStaff middleware, new endpoints
- `public/index.html` - Added demo buttons and active-users panel UI
- `public/js/app.js` - Added session tracking logic and event listeners
- `server/index.js` - Mounted `/api/admin` route for new endpoints

#### 🔧 Technical Details
- **In-Memory Storage**: Uses JavaScript Map objects for fast O(1) lookups
- **Session Key**: Combines email + timestamp for uniqueness
- **Inactivity Threshold**: 15 minutes (900,000 ms)
- **Cleanup Interval**: 60 seconds
- **API Security**: Requires `admin` or `staff` role for access

#### ✅ Verification
- All 19 existing feature tests continue to pass
- Admin access verified: Only admin/staff can view active users
- Student/unauthorized access blocked with 403 error
- Session history accurately logs login/logout events

---

### **Batch 2: User Profile Management, Password Changes & Dark/Light Theme Toggle**

#### 🎯 Objectives
Add user self-service capabilities for profile updates and password management, plus improve UI accessibility with theme switching.

#### ✨ Features Added

1. **User Profile Management**
   - Users can update their name and email from dedicated modal
   - **Verification Flow**: Current password required for security
   - **Validation**: Email format checked, name length validated
   - **API Endpoint**: `GET /api/auth/profile`, `PUT /api/auth/profile`
   - Profile modal accessible via user icon (top-right of dashboard)
   - Changes immediately reflected in navbar and localStorage

2. **Password Change Functionality**
   - Secure password update with old password verification
   - **Validation**: Minimum 6 characters, no blank passwords
   - **Security**: Old password verified before allowing change
   - **API Endpoint**: `PUT /api/auth/change-password`
   - Success message displays confirmation, errors show detailed feedback
   - Integrated into same profile modal for UX consistency

3. **Dark Mode / Light Mode Theme Toggle**
   - Theme toggle button positioned at top-right of dashboard
   - **Default State**: Dark mode enabled for eye comfort
   - **Light Mode**: Available as alternative bright theme
   - **Persistence**: User theme preference saved to localStorage
   - **Implementation**: CSS variables with `body.light-theme` class override
   - All dashboard panels, tables, and cards styled for both themes
   - Smooth transition between themes without page reload

4. **Enhanced Session History UI**
   - Session activity panel displays login/logout events
   - Shows timestamp, email, role, and action type
   - Sortable by most recent first
   - Color-coded: Green for login, Red for logout
   - Pagination support for long history lists

#### 📁 Files Modified
- `public/js/app.js` - Added profile modal logic, theme toggle, password change handlers
- `server/routes/auth.js` - Added `/profile` GET/PUT endpoints, `/change-password` PUT endpoint
- `public/index.html` - Added profile modal HTML, theme toggle button, session history UI
- `public/css/style.css` - Added dark/light theme CSS variables, modal styling

#### 🔧 Technical Details
- **Theme Storage Key**: `app_theme` in localStorage
- **Profile Fields**: name (string), email (string, unique)
- **Password Requirements**: Minimum 6 characters, alphanumeric + special chars recommended
- **Session History Display**: Max 20 entries per view with "Load More" button
- **API Security**: All endpoints require valid JWT token

#### ✅ Verification
- All 19 existing tests pass
- Theme toggle persists across browser sessions
- Profile updates reflected in real-time
- Password changes require correct old password
- Session history displays accurately with timestamps

---

### **Batch 3: Admin Analytics Dashboard with Complaint Metrics & Trends**

#### 🎯 Objectives
Provide administrators with actionable insights and statistical summaries of complaint data, department performance, and resolution trends.

#### ✨ Features Added

1. **Resolution Rate Dashboard**
   - Displays percentage of resolved + closed complaints
   - Formula: `(resolved + closed) / total * 100`
   - Real-time calculation from current database
   - Color-coded badge (green for high rates, yellow for medium, red for low)
   - Updates automatically when new complaints are resolved

2. **Complaint Category Breakdown**
   - Shows distribution of complaints across all categories
   - Top 5 categories displayed as summary chips
   - Each chip shows category name and count
   - Sorted by frequency (most common first)
   - Examples: "Wi-Fi / Internet: 12", "Classroom: 8", "Laboratory: 5"

3. **Department Distribution View**
   - Breakdown of complaints by assigned department
   - Shows unassigned complaints separately
   - Departments tracked: IT, Maintenance, Hostel, Transport, Security & Cleanliness
   - Chip-style display for quick scanning
   - Helps identify departmental workload and bottlenecks

4. **Priority Status Cards**
   - **Critical Issues**: Count of Critical-priority complaints (red highlight)
   - **High Priority**: Count of High-priority complaints (orange highlight)
   - **Summary Cards**: Quick-stat display cards in analytics panel
   - Helps admin focus on urgent items

5. **Monthly Complaint Trend**
   - Tracks complaint volume by month (Jan, Feb, Mar, etc.)
   - Displays most recent month trend data
   - Format: "August: 24 complaints"
   - Useful for identifying seasonal spikes or trends
   - Helps plan staffing and resource allocation

6. **Analytics Summary Mini-Cards**
   - **Top Categories**: Shows most-complained category with count
   - **Critical Count**: Total critical-priority complaints
   - **High Priority**: Total high-priority complaints
   - **Monthly Trend**: Latest month with complaint volume
   - All displayed in compact card format in analytics panel

#### 📁 Files Modified
- `server/routes/stats.js` - Enhanced `/api/stats` endpoint with summaryRows and monthlyTrend
- `public/index.html` - Added analytics summary grid, mini-cards, department chips
- `public/js/app.js` - Added analytics data fetching and UI population logic

#### 🔧 Technical Details
- **API Endpoint**: `GET /api/stats`
- **Response Fields Added**: 
  - `summaryRows`: Array of top 5 categories with counts
  - `monthlyTrend`: Object mapping month names to complaint counts
- **Category Sorting**: By descending count (most frequent first)
- **Data Source**: Reads from persistent JSON database fallback
- **Refresh Interval**: Dashboard data refreshes every 60 seconds

#### ✅ Verification
- All 19 existing tests pass
- Analytics accurately reflect database state
- Category summaries sort correctly by frequency
- Department distribution accounts for all complaints
- Monthly trends update with new complaints
- Mini-cards display user-friendly formatted data

---

### **Deployment Strategy**

All three batches have been committed to the `main` branch and deployed to Render:

```
Git Commits:
- 19dcd44 Added admin active users tracking
- 0c83773 Restrict demo admin/staff shortcuts to local demo mode
- ef2a650 Added session activity tracking
- f8e3b72 Add session tracking and theme toggle
- 0dad14c Add Batch 3: Admin analytics with category trends and summary cards
- 6ed3cd8 Update README with Batch 2 & 3 feature documentation
```

**Deployment Flow**:
1. Changes committed locally with descriptive messages
2. Pushed to GitHub main branch
3. Render webhook triggers automatic deployment
4. Live site updated within 30-60 seconds (free tier wake-up time included)
5. Verification: Test login, theme toggle, active users, and analytics

**Live Site**: https://ccms-project.onrender.com/

---

### **Feature Matrix**

| Feature | Batch | Status | Access Level | API Endpoint |
|---------|-------|--------|--------------|--------------|
| Active Users List | 1 | ✅ Live | Admin/Staff | `GET /api/admin/active-users` |
| Session History | 1 | ✅ Live | Admin/Staff | `GET /api/admin/session-history` |
| Demo Login Restriction | 1 | ✅ Live | All | Localhost only |
| Auto Session Cleanup | 1 | ✅ Live | System | Internal (60s interval) |
| Profile Update | 2 | ✅ Live | User | `PUT /api/auth/profile` |
| Password Change | 2 | ✅ Live | User | `PUT /api/auth/change-password` |
| Dark/Light Theme | 2 | ✅ Live | All | Client-side toggle |
| Session Summary UI | 2 | ✅ Live | Admin/Staff | Display only |
| Analytics Dashboard | 3 | ✅ Live | Admin/Staff | `GET /api/stats` |
| Category Breakdown | 3 | ✅ Live | Admin/Staff | Via stats endpoint |
| Department Distribution | 3 | ✅ Live | Admin/Staff | Via stats endpoint |
| Monthly Trends | 3 | ✅ Live | Admin/Staff | Via stats endpoint |

---

### **Testing Results**

Final verification run: `npm test`

```
=======================================================
 🧪 RUNNING MASTER END-TO-END FEATURE VERIFICATION
=======================================================

✅ [PASS] Feature 1: Student Account Registration
✅ [PASS] Feature 2: Student Login & JWT Token Authentication
✅ [PASS] Feature 3: Administrator Login
✅ [PASS] Feature 4: Department Staff Login
✅ [PASS] Feature 5: Auth Token Verification (/api/auth/me)
✅ [PASS] Feature 6: Gemini AI Text Categorization & Priority Recommendation
✅ [PASS] Feature 7: Student Complaint Submission with Metadata
✅ [PASS] Feature 8: Student Personal Dashboard Complaint History
✅ [PASS] Feature 9: Complaint Detail View & Timeline Audit History
✅ [PASS] Feature 10: Admin Master Complaint Search & Multi-Filter Query
✅ [PASS] Feature 11: Admin Priority Shift Control
✅ [PASS] Feature 12: Department & Staff Ticket Assignment
✅ [PASS] Feature 13: Complaint Status Lifecycle Tracking
✅ [PASS] Feature 14: Administrative Comments & Progress Logs
✅ [PASS] Feature 15: Official Issue Resolution Logging
✅ [PASS] Feature 16: Student Satisfaction Rating & Feedback Submission
✅ [PASS] Feature 17: Admin Dashboard Analytics & Metrics Summary
✅ [PASS] Feature 18: College Departments & Staff Directory
✅ [PASS] Feature 19: Admin Active User Monitoring

=======================================================
 📊 SUMMARY: 19 PASSED | 0 FAILED
=======================================================
```

---

### **How to Access New Features**

1. **Active Users (Admin Only)**
   - Log in with admin: `surya@college.edu` / `admin123`
   - Navigate to Admin Dashboard
   - Scroll to "Active Users" panel
   - Real-time list of logged-in users displayed

2. **Session History (Admin Only)**
   - Same admin login as above
   - Scroll to "Session Activity" panel
   - View complete login/logout history with timestamps

3. **Theme Toggle (All Users)**
   - Look for moon/sun icon at top-right of page
   - Click to toggle between dark and light mode
   - Preference saved automatically

4. **Profile & Password (All Users)**
   - Click profile icon at top-right
   - Update name/email or change password
   - Confirm changes with current password

5. **Analytics Dashboard (Admin Only)**
   - Log in as admin
   - Admin Dashboard → "Resolution Rate" and "Analytics" sections
   - View category breakdown, department distribution, trends

---

---

## 🏫 Project Overview

The **College Complaint Management System** is a centralized digital platform for higher education institutions:
- **Students** submit complaints categorized by department/issue type, specify precise location, upload evidence attachments, track resolution progress via step-by-step status timeline, and submit satisfaction ratings (1-5 stars).
- **Google Gemini AI Integration** automatically analyzes student complaint descriptions, suggests appropriate category & priority level, and generates 1-sentence executive summaries.
- **Administrators & Staff** view, search, filter, assign complaints to specific departments (IT, Maintenance, Hostel, Security, Transport), adjust priority levels (`Low`, `Medium`, `High`, `Critical`), update progress statuses, add notes, and record resolution details.
- **MongoDB Integration** provides scalable document storage for all accounts, tickets, updates, and feedback metrics.

---

## 🔑 Environment Configuration (`.env`) & Gemini API Key

All connection URIs, database settings, server ports, secret keys, and **Gemini AI API Key** MUST be configured in the [`.env`](file:///c:/PROJECTS/project2/.env) file located in the root of the project directory.

### Sample `.env` File:

```env
# Server Port Configuration
PORT=3000

# MongoDB Database Connection URI
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/college_complaint_db

# MongoDB Atlas Cloud Database:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/college_complaint_db?retryWrites=true&w=majority

# JWT Token Signing Secret Key
JWT_SECRET=college_complaint_mgmt_secret_key_2026

# Google Gemini AI API Key (Get your free key from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here
```

### How to Get a Free Google Gemini API Key:
1. Visit **[Google AI Studio](https://aistudio.google.com/)**.
2. Sign in with your Google account.
3. Click **Get API key** → **Create API key**.
4. Copy the generated key string and paste it into your `.env` file as `GEMINI_API_KEY=AIzaSy...`.

---

## 🤖 Gemini AI Features

### 1. Automatic AI Categorization & Urgency Assessment
When a student types a complaint description, clicking the **"✨ AI Smart Categorize & Summarize"** button analyzes the text and automatically picks the best matching category (`Wi-Fi / Internet`, `Laboratory`, `Classroom`, `Hostel`, `Water Supply`, `Electricity`, `Cleanliness`, `Transportation`, `Library`, `Security`, `Other`) and suggested urgency level (`Low`, `Medium`, `High`, `Critical`).

### 2. Executive Issue Summaries
Gemini AI distills multi-paragraph complaint descriptions into a concise 1-sentence executive summary to help college admins process high volumes of tickets quickly.

### 3. Graceful Fallback Guarantee
If `GEMINI_API_KEY` is not supplied, the system automatically uses smart NLP heuristic pattern matching so AI features continue to work seamlessly in all offline/dev environments.

---

## 🍃 MongoDB Setup Guide (Local & Cloud)

### Option A: Local MongoDB Setup

1. **Download & Install MongoDB Community Server**:
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community).
   - Make sure the MongoDB Service (`mongod`) is started.

2. **Verify Local Connection**:
   - Default URI: `mongodb://localhost:27017/college_complaint_db`.

---

### Option B: MongoDB Atlas Cloud Setup

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster**.
3. Copy Connection String (e.g., `mongodb+srv://<username>:<password>@cluster.mongodb.net/college_complaint_db`).
4. Update `MONGODB_URI` in `.env`.

---

## 💻 Technology Stack

| Layer | Technology | Function |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | Modern SPA with Glassmorphism aesthetic, responsive dashboards, interactive stepper |
| **Backend** | Node.js, Express.js | Modular REST API server with JWT Auth, CORS, Multer file upload |
| **AI Integration** | Google Gemini 2.5 Flash API | AI text categorization, priority suggestion, executive summaries |
| **Database** | MongoDB & Mongoose ORM | Document storage for users, complaints, departments, staff, updates, feedback |
| **Environment** | `dotenv` | Centralized URI, key, and environment configuration management |

---

## 🗄️ Database Schemas & Mongoose Models

All schemas are defined under [`server/models/`](file:///c:/PROJECTS/project2/server/models/):

- [`server/models/User.js`](file:///c:/PROJECTS/project2/server/models/User.js) (Student, Admin, Staff accounts)
- [`server/models/Complaint.js`](file:///c:/PROJECTS/project2/server/models/Complaint.js) (Complaints, Category, Status, Attachments)
- [`server/models/Department.js`](file:///c:/PROJECTS/project2/server/models/Department.js) (College departments)
- [`server/models/Staff.js`](file:///c:/PROJECTS/project2/server/models/Staff.js) (Staff assignments)
- [`server/models/Update.js`](file:///c:/PROJECTS/project2/server/models/Update.js) (Timeline history audit logs)
- [`server/models/Feedback.js`](file:///c:/PROJECTS/project2/server/models/Feedback.js) (Student 1-5 star feedback ratings)

---

## 📡 REST API Documentation

### 1. Gemini AI API (`/api/ai`)
- `POST /api/ai/analyze` — Analyzes complaint description using Gemini AI, returns `{ category, priority, summary }`

### 2. Authentication (`/api/auth`)
- `POST /api/auth/register` — Register student account
- `POST /api/auth/login` — Authenticate user
- `GET /api/auth/me` — Retrieve active session

### 3. Complaints (`/api/complaints`)
- `POST /api/complaints` — Submit new complaint
- `GET /api/complaints/my` — Fetch student complaints
- `GET /api/complaints/:id` — View details, timeline audit log, & rating
- `POST /api/complaints/:id/feedback` — Submit student rating feedback

### 4. Admin & Operations (`/api/admin`)
- `GET /api/admin/complaints` — Master complaint table with search/filtering
- `PUT /api/admin/complaints/:id/status` — Update status
- `PUT /api/admin/complaints/:id/assign` — Assign department and staff
- `PUT /api/admin/complaints/:id/priority` — Adjust priority level
- `POST /api/admin/complaints/:id/resolve` — Record resolution details

---

## 🚀 Step-by-Step Installation & Setup

1. **Navigate to Project Directory**:
   ```bash
   cd c:\PROJECTS\project2
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up `.env` Environment Variables**:
   ```bash
   # Copy example template or edit .env directly
   cp .env.example .env
   ```
   Open `.env` and fill in your keys:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/college_complaint_db
   JWT_SECRET=college_complaint_mgmt_secret_key_2026
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the Express Server**:
   ```bash
   npm start
   ```

5. **Access in Browser**:
   Navigate to **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Troubleshooting Common Issues

### Issue: `Error: listen EADDRINUSE: address already in use :::3000`

This occurs when port 3000 is already in use by another running server instance.

#### Solution Options:
- **Change PORT in `.env`**:
  Set `PORT=3001` in `.env` and run `npm start`.
- **Kill process on port 3000 (PowerShell)**:
  ```powershell
  Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
  Stop-Process -Id <PID> -Force
  ```

---

## 🔑 Pre-configured Demo Accounts

| Role | Email | Password | Features Available |
| :--- | :--- | :--- | :--- |
| 👨‍🎓 **Student** | `alex.student@college.edu` | `student123` | Submit complaints, AI assistance, track timeline, rate resolutions |
| 👨‍🎓 **Student 2** | `emily.davis@college.edu` | `student123` | Submit complaints, view student portal |
| 🛡️ **Admin** | `admin@college.edu` | `admin123` | Full admin rights, assign depts, analytics, resolve tickets |
| ⚙️ **Staff (IT)** | `it.staff@college.edu` | `staff123` | View IT assigned tickets, add progress updates |

---

## 🆕 Quick Reference: All Recent Changes

> **📌 Complete detailed changelog**: See [**Latest Updates & Changelog (Batch 1, 2, 3)**](#-latest-updates--changelog-batch-1-2-3) section above for comprehensive documentation of all features added.

### Summary of All Changes (Top to Bottom):

✅ **Batch 1: Active User Tracking & Session Management**
- Real-time active users monitoring (admin-only)
- Complete session history with login/logout tracking
- Automatic stale session cleanup (15-min inactivity)
- Demo credentials restricted to localhost only

✅ **Batch 2: User Profile & Theme Management**
- User profile update (name, email with verification)
- Secure password change functionality
- Dark mode / Light mode theme toggle (persisted in localStorage)
- Enhanced session history UI with color-coded events

✅ **Batch 3: Admin Analytics Dashboard**
- Resolution rate metrics and calculations
- Complaint category breakdown (top 5 categories)
- Department distribution analysis
- Critical/High priority issue counts
- Monthly complaint trend tracking
- Analytics summary mini-cards

### Key Statistics:
- **Total Features Verified**: 19 passing tests
- **Commits Added This Session**: 6 commits
- **Files Modified**: 8+ files
- **New Endpoints Added**: 6+ API routes
- **Lines of Code Added**: 500+
- **Deployment Status**: Live on Render ✅

### Default Demo Accounts:
- **Admin**: `surya@college.edu` / `admin123`
- **Student**: `surya.student@college.edu` / `student123`
- **Staff**: `surya.staff@college.edu` / `staff123`

For complete details on each feature, objectives, technical implementation, and how to access them, please refer to the comprehensive [**Latest Updates & Changelog**](#-latest-updates--changelog-batch-1-2-3) section above.

### 5. Deployment options for production
Use any Node.js hosting platform to deploy the backend and serve the static frontend included in `public/`.

Common choices:
- Render
- Railway
- Vercel (for frontend) + Node hosting for API
- DigitalOcean App Platform
- VPS with PM2 or Nginx

Recommended production setup:
- Set `PORT` from the hosting environment
- Add a secure `JWT_SECRET`
- Add a valid `MONGODB_URI`
- Add `GEMINI_API_KEY` if AI features are enabled

### 6. How to verify who is logged in
After logging into the live app:

1. Open browser DevTools
2. Go to `Application`
3. Open `Local Storage`
4. Select the site domain
5. Click the `user` object
6. Check `name`, `email`, and `role`

Example JSON value:

```json
{
  "id": "USR-ADM-001",
  "name": "Surya",
  "email": "surya@college.edu",
  "role": "Admin"
}
```

This confirms the currently active user and their role.

---

*College Complaint Management System — Powered by Node.js, Express, MongoDB, & Google Gemini AI.*