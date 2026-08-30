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
2. [Environment Configuration (`.env`) & Gemini API Key](#-environment-configuration-env--gemini-api-key)
3. [Gemini AI Features](#-gemini-ai-features)
4. [MongoDB Setup Guide (Local & MongoDB Atlas Cloud)](#-mongodb-setup-guide-local--cloud)
5. [Technology Stack](#-technology-stack)
6. [Database Schemas & Mongoose Models](#-database-schemas--mongoose-models)
7. [REST API Documentation](#-rest-api-documentation)
8. [Step-by-Step Installation & Setup](#-step-by-step-installation--setup)
9. [Troubleshooting Common Issues](#-troubleshooting-common-issues)
10. [Pre-configured Demo Accounts](#-pre-configured-demo-accounts)
11. [Complaint Lifecycle & Workflow](#-complaint-lifecycle--workflow)
12. [Testing & Verification](#-testing--verification)

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

## 🆕 Recent Updates & Customizations

### 1. User naming update
The default seeded accounts were standardized so the main admin and staff identity appears as `Surya`:

- Student: `surya.student@college.edu` / `student123`
- Admin: `surya@college.edu` / `admin123`
- Staff: `surya.staff@college.edu` / `staff123`

This change is reflected in the default database seed data and is used in the demo login flows.

### 2. Admin-only active-user tracking
An admin-side active sessions block was added to the dashboard so only admin/staff users with elevated access can view the list of currently logged-in users.

- Server-side session tracking is managed in `server/routes/auth.js`
- Admin API endpoint: `GET /api/admin/active-users`
- Dashboard UI: `Active Users` section in the admin panel
- Stale sessions auto-expire after 15 minutes of inactivity to keep the list accurate

This lets admins view who is currently signed in, along with their role and last-seen activity timestamp.

### 3. Login/logout session management
The system now tracks user login and logout events for the active session list.

- Login registers the user in the active session list
- `/api/auth/me` refreshes last-seen activity
- `/api/auth/logout` removes the session from active tracking
- Inactive sessions are automatically cleaned up every minute

### 4. Profile & password management (Batch 1 / 2)
Users can now update their profile information and change their password through a dedicated modal:

- **Profile Update**: Change name and email (verified by current password)
- **Password Change**: Secure password update with validation
- **Access**: Available to all logged-in users via profile icon
- Files updated: `public/js/app.js`, `server/routes/auth.js`, `public/index.html`

### 5. Dark mode / Light mode theme toggle (Batch 2)
A theme toggle has been added to the top-right of the dashboard:

- **Dark Mode** (default): Easy on the eyes for extended sessions
- **Light Mode**: Traditional bright interface
- **Persistence**: Theme preference is saved to localStorage
- Session history and active users panels styled for both themes
- CSS variables enable quick theme switching via `body.light-theme` class

### 6. Live session tracking & history (Batch 2)
Admins can now see detailed session activity logs:

- **Active Users Panel**: Real-time list of logged-in users with role and last-seen time
- **Session History**: Complete login/logout history with timestamps
- **Session Summary**: Quick stats on today's sessions and user activity
- Auto-cleanup: Stale sessions removed after 15 minutes of inactivity
- Files updated: `server/routes/admin.js`, `public/index.html`, `public/js/app.js`

### 7. Admin analytics dashboard (Batch 3)
Enhanced analytics and reporting for system administrators:

- **Resolution Rate**: Percentage of resolved/closed complaints
- **Department Breakdown**: Distribution of complaints by department
- **Category Summary**: Top complaint categories with counts
- **Priority Stats**: Critical and high-priority issue counts
- **Monthly Trends**: Complaint volume by month
- **Top Categories**: Quick view of most common complaint types
- API endpoint: `GET /api/stats` (enhanced with `summaryRows` and `monthlyTrend`)
- Files updated: `server/routes/stats.js`, `public/index.html`, `public/js/app.js`

### 8. Deployment & live-site verification notes
The project is deployment-ready with the latest code updates and live site verification workflow.

Deployment checklist:
1. Save code changes
2. Commit project updates with descriptive messages (e.g., "Add Batch 3: Admin analytics")
3. Push to the remote repository
4. Render webhook auto-triggers deployment
5. Wait 30-60 seconds for Render service to boot (free tier wakes up from hibernation)
6. Refresh the live site
7. Test features: Login as admin → view active users, session history, and analytics dashboard
8. Verify theme toggle and profile modal work correctly

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