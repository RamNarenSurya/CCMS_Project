const http = require('http');
const app = require('./index');

const PORT = 3009;

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

const server = app.listen(PORT, async () => {
  console.log('\n=======================================================');
  console.log(' 🧪 RUNNING MASTER END-TO-END FEATURE VERIFICATION');
  console.log('=======================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, testName) {
    if (condition) {
      passedCount++;
      console.log(` ✅ [PASS] ${testName}`);
    } else {
      failedCount++;
      console.error(` ❌ [FAIL] ${testName}`);
    }
  }

  try {
    // 1. Student Registration
    const regRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Sarah Connor',
      student_id: `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      email: `sarah.test.${Date.now()}@college.edu`,
      phone: '+1 555-9999',
      department: 'Computer Science',
      year: '4th Year',
      password: 'password123',
      role: 'Student'
    });
    assert(regRes.status === 201 && regRes.body.token, 'Feature 1: Student Account Registration');

    // 2. Student Login
    const stuLogin = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'alex.student@college.edu', password: 'student123' });
    assert(stuLogin.status === 200 && stuLogin.body.token, 'Feature 2: Student Login & JWT Token Authentication');
    const studentToken = stuLogin.body.token;

    // 3. Admin Login
    const admLogin = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@college.edu', password: 'admin123' });
    assert(admLogin.status === 200 && admLogin.body.token, 'Feature 3: Administrator Login');
    const adminToken = admLogin.body.token;

    // 4. Staff Login
    const stfLogin = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'it.staff@college.edu', password: 'staff123' });
    assert(stfLogin.status === 200 && stfLogin.body.token, 'Feature 4: Department Staff Login');

    // 5. Auth Session Verification (/api/auth/me)
    const meRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(meRes.status === 200 && meRes.body.user.role === 'Student', 'Feature 5: Auth Token Verification (/api/auth/me)');

    // 6. Gemini AI Analysis Endpoint (/api/ai/analyze)
    const aiRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/ai/analyze',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      title: 'Lab 2 Router Issue',
      description: 'The Wi-Fi access point in Computer Lab 2 has stopped broadcasting network signal during afternoon practical exams.'
    });
    assert(aiRes.status === 200 && aiRes.body.category === 'Wi-Fi / Internet', 'Feature 6: Gemini AI Text Categorization & Priority Recommendation');

    // 7. Student Submit Complaint
    const cmpRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/complaints',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      }
    }, {
      title: 'Smartboard Touch Failure in Seminar Hall',
      category: aiRes.body.category || 'Classroom',
      location: 'Main Academic Block - Seminar Hall 1',
      description: 'The interactive smartboard touch screen is unresponsive during morning lectures.',
      priority: aiRes.body.priority || 'High'
    });
    assert(cmpRes.status === 201 && cmpRes.body.complaint.complaint_id, 'Feature 7: Student Complaint Submission with Metadata');
    const createdComplaint = cmpRes.body.complaint;

    // 8. Student Get Personal Complaints (/api/complaints/my)
    const myCmpRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/complaints/my',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(myCmpRes.status === 200 && Array.isArray(myCmpRes.body.complaints), 'Feature 8: Student Personal Dashboard Complaint History');

    // 9. Complaint Detail & Timeline Audit Log (/api/complaints/:id)
    const detailRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/complaints/${createdComplaint.id}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(detailRes.status === 200 && detailRes.body.complaint && Array.isArray(detailRes.body.updates), 'Feature 9: Complaint Detail View & Timeline Audit History');

    // 10. Admin Master Search & Filtering (/api/admin/complaints)
    const admCmpRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/complaints?search=Smartboard&category=Wi-Fi%20%2F%20Internet',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(admCmpRes.status === 200 && Array.isArray(admCmpRes.body.complaints), 'Feature 10: Admin Master Complaint Search & Multi-Filter Query');

    // 11. Admin Update Priority Level
    const priorityRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/admin/complaints/${createdComplaint.id}/priority`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { priority: 'Critical' });
    assert(priorityRes.status === 200 && priorityRes.body.complaint.priority === 'Critical', 'Feature 11: Admin Priority Shift Control');

    // 12. Admin Assign Department & Staff Member
    const assignRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/admin/complaints/${createdComplaint.id}/assign`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      department: 'IT Department',
      staff: 'Mark Miller',
      comment: 'Dispatched Senior Network Specialist Mark Miller for emergency hardware fix.'
    });
    assert(assignRes.status === 200 && assignRes.body.complaint.assigned_department === 'IT Department', 'Feature 12: Department & Staff Ticket Assignment');

    // 13. Admin Status Update
    const statusRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/admin/complaints/${createdComplaint.id}/status`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { status: 'In Progress', comment: 'Technician on site repairing hardware.' });
    assert(statusRes.status === 200 && statusRes.body.complaint.status === 'In Progress', 'Feature 13: Complaint Status Lifecycle Tracking');

    // 14. Admin Add Comment Note
    const commentRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/admin/complaints/${createdComplaint.id}/comment`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { comment: 'Replacement AP module installed and firmware upgraded.' });
    assert(commentRes.status === 200 && commentRes.body.update, 'Feature 14: Administrative Comments & Progress Logs');

    // 15. Admin Mark Issue as Resolved with Resolution Notes
    const resolveRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/admin/complaints/${createdComplaint.id}/resolve`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { resolution_details: 'Replaced faulty router capacitor and restored full 5G Wi-Fi bandwidth.' });
    assert(resolveRes.status === 200 && resolveRes.body.complaint.status === 'Resolved', 'Feature 15: Official Issue Resolution Logging');

    // 16. Student Submit 5-Star Satisfaction Rating
    const feedbackRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/complaints/${createdComplaint.id}/feedback`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      }
    }, {
      rating: 5,
      comment: 'Super fast turnaround! Technician resolved the issue in under 1 hour. Thank you!'
    });
    assert(feedbackRes.status === 200 && feedbackRes.body.feedback.rating === 5, 'Feature 16: Student Satisfaction Rating & Feedback Submission');

    // 17. System Analytics Metrics (/api/stats)
    const statsRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/stats',
      method: 'GET'
    });
    assert(statsRes.status === 200 && typeof statsRes.body.stats.resolution_rate === 'number', 'Feature 17: Admin Dashboard Analytics & Metrics Summary');

    // 18. Departments API (/api/departments)
    const deptRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/departments',
      method: 'GET'
    });
    assert(deptRes.status === 200 && Array.isArray(deptRes.body.departments), 'Feature 18: College Departments & Staff Directory');

    // 19. Admin Active Users Tracking
    const activeUsersRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/active-users',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(activeUsersRes.status === 200 && Array.isArray(activeUsersRes.body.users), 'Feature 19: Admin Active User Monitoring');

    console.log('\n=======================================================');
    console.log(` 📊 SUMMARY: ${passedCount} PASSED | ${failedCount} FAILED`);
    console.log('=======================================================\n');

    if (failedCount === 0) {
      console.log('🎉 ALL 18 SYSTEM FEATURES VERIFIED WORKING 100% PERFECTLY!\n');
    } else {
      console.error('❌ SOME TESTS FAILED. PLEASE CHECK LOGS ABOVE.\n');
    }

  } catch (err) {
    console.error('❌ Test suite crash:', err);
  } finally {
    server.close(() => {
      process.exit(failedCount === 0 ? 0 : 1);
    });
  }
});
