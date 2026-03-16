const express = require('express');
const router = express.Router();
const { protect, isTeacher } = require('../middleware/auth');
const {
  createSubject,
  getSubjects,
  createAssignment,
  getAssignments,
  getSubmissions,
  getAllSubmissions,
  gradeSubmission,
  getDashboardStats,
} = require('../controllers/teacherController');

router.use(protect, isTeacher);

router.post('/create-subject', createSubject);
router.get('/subjects', getSubjects);
router.post('/create-assignment', createAssignment);
router.get('/assignments', getAssignments);
router.get('/submissions', getAllSubmissions);
router.get('/submissions/:assignmentId', getSubmissions);
router.put('/submission/:submissionId/grade', gradeSubmission);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
