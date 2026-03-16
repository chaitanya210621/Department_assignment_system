const express = require('express');
const router = express.Router();
const { protect, isStudent } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getAssignments, submitAssignment, getMySubmissions, getAnalytics } = require('../controllers/studentController');

router.use(protect, isStudent);

router.get('/assignments', getAssignments);
router.post('/submit', upload.single('file'), submitAssignment);
router.get('/my-submissions', getMySubmissions);
router.get('/analytics', getAnalytics);

module.exports = router;
