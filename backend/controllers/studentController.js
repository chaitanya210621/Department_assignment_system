const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const path = require('path');
const { checkPlagiarism, extractTextFromFile } = require('../middleware/plagiarism');

// @desc    Get all assignments for student's department
// @route   GET /api/student/assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ department: req.user.department })
      .populate('subjectId', 'subjectName')
      .populate('teacherId', 'name')
      .sort({ deadline: 1 });

    // Mark which ones the student has already submitted
    const submissions = await Submission.find({ studentId: req.user._id });
    const submittedIds = new Set(submissions.map((s) => s.assignmentId.toString()));

    const enriched = assignments.map((a) => ({
      ...a.toObject(),
      hasSubmitted: submittedIds.has(a._id.toString()),
      isOverdue: new Date(a.deadline) < new Date(),
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit an assignment
// @route   POST /api/student/submit
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.body;

    if (!assignmentId) return res.status(400).json({ message: 'Assignment ID is required' });
    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    if (assignment.department !== req.user.department) {
      return res.status(403).json({ message: 'Assignment not for your department' });
    }

    // Check for duplicate submission
    const existing = await Submission.findOne({ assignmentId, studentId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    const isLate = new Date() > new Date(assignment.deadline);
    const fileUrl = `/uploads/${req.file.filename}`;
    const filePath = req.file.path;

    // Extract text for plagiarism check
    const newText = extractTextFromFile(filePath);

    // Get all existing submissions for this assignment
    const existingSubmissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name');

    const existingTexts = existingSubmissions.map((s) => ({
      studentId: s.studentId._id,
      studentName: s.studentId.name,
      text: extractTextFromFile(path.join(__dirname, '..', s.fileUrl)),
    }));

    const { plagiarismScore, details } = checkPlagiarism(newText, existingTexts);

    const submission = await Submission.create({
      assignmentId,
      studentId: req.user._id,
      fileUrl,
      fileName: req.file.originalname,
      submissionDate: new Date(),
      plagiarismScore,
      plagiarismDetails: details,
      isLate,
    });

    res.status(201).json({
      ...submission.toObject(),
      message: isLate ? 'Submitted successfully (late submission)' : 'Submitted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's own submissions
// @route   GET /api/student/my-submissions
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user._id })
      .populate({
        path: 'assignmentId',
        populate: { path: 'subjectId', select: 'subjectName' },
      })
      .sort({ submissionDate: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student performance analytics
// @route   GET /api/student/analytics
const getAnalytics = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user._id })
      .populate({
        path: 'assignmentId',
        populate: [
          { path: 'subjectId', select: 'subjectName' },
        ],
      });

    const totalAssignments = await Assignment.countDocuments({ department: req.user.department });
    const submitted = submissions.length;
    const onTime = submissions.filter((s) => !s.isLate).length;
    const late = submissions.filter((s) => s.isLate).length;

    const gradedSubmissions = submissions.filter((s) => s.marks !== null);
    const avgMarks =
      gradedSubmissions.length > 0
        ? Math.round(gradedSubmissions.reduce((sum, s) => sum + s.marks, 0) / gradedSubmissions.length)
        : 0;

    const avgPlagiarism =
      submitted > 0
        ? Math.round(submissions.reduce((sum, s) => sum + s.plagiarismScore, 0) / submitted)
        : 0;

    // Group by subject
    const subjectStats = {};
    submissions.forEach((s) => {
      const subjectName = s.assignmentId?.subjectId?.subjectName || 'Unknown';
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = { submitted: 0, totalMarks: 0, graded: 0 };
      }
      subjectStats[subjectName].submitted++;
      if (s.marks !== null) {
        subjectStats[subjectName].totalMarks += s.marks;
        subjectStats[subjectName].graded++;
      }
    });

    const subjectChartData = Object.entries(subjectStats).map(([name, data]) => ({
      subject: name,
      submitted: data.submitted,
      avgMarks: data.graded > 0 ? Math.round(data.totalMarks / data.graded) : 0,
    }));

    // Monthly submission trend
    const monthlyTrend = {};
    submissions.forEach((s) => {
      const month = new Date(s.submissionDate).toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyTrend[month] = (monthlyTrend[month] || 0) + 1;
    });

    res.json({
      overview: {
        totalAssignments,
        submitted,
        pending: Math.max(0, totalAssignments - submitted),
        onTime,
        late,
        avgMarks,
        avgPlagiarism,
        completionRate: totalAssignments > 0 ? Math.round((submitted / totalAssignments) * 100) : 0,
      },
      subjectChartData,
      monthlyTrend: Object.entries(monthlyTrend).map(([month, count]) => ({ month, count })),
      recentSubmissions: submissions.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAssignments, submitAssignment, getMySubmissions, getAnalytics };
