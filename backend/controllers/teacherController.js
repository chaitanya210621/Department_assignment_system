const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Create a subject
// @route   POST /api/teacher/create-subject
const createSubject = async (req, res) => {
  try {
    const { subjectName } = req.body;
    if (!subjectName) return res.status(400).json({ message: 'Subject name is required' });

    const subject = await Subject.create({
      subjectName,
      department: req.user.department,
      teacherId: req.user._id,
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get subjects for teacher
// @route   GET /api/teacher/subjects
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ teacherId: req.user._id });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an assignment
// @route   POST /api/teacher/create-assignment
const createAssignment = async (req, res) => {
  try {
    const { title, description, deadline, subjectId, maxMarks } = req.body;

    if (!title || !description || !deadline || !subjectId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    if (subject.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to use this subject' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      deadline,
      subjectId,
      teacherId: req.user._id,
      department: req.user.department,
      maxMarks: maxMarks || 100,
    });

    const populated = await assignment.populate('subjectId', 'subjectName');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all assignments by teacher
// @route   GET /api/teacher/assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacherId: req.user._id })
      .populate('subjectId', 'subjectName')
      .sort({ createdAt: -1 });

    // Add submission count for each assignment
    const assignmentsWithCount = await Promise.all(
      assignments.map(async (a) => {
        const submissionCount = await Submission.countDocuments({ assignmentId: a._id });
        return { ...a.toObject(), submissionCount };
      })
    );

    res.json(assignmentsWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get submissions for a specific assignment
// @route   GET /api/teacher/submissions/:assignmentId
const getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    if (assignment.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name email department')
      .sort({ submissionDate: -1 });

    // Count students in the department
    const studentCount = await User.countDocuments({
      department: req.user.department,
      role: 'student',
    });

    res.json({
      assignment,
      submissions,
      totalStudents: studentCount,
      submittedCount: submissions.length,
      pendingCount: Math.max(0, studentCount - submissions.length),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all submissions across all assignments (teacher overview)
// @route   GET /api/teacher/submissions
const getAllSubmissions = async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacherId: req.user._id });
    const assignmentIds = assignments.map((a) => a._id);

    const submissions = await Submission.find({ assignmentId: { $in: assignmentIds } })
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title deadline')
      .sort({ submissionDate: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update marks and feedback for a submission
// @route   PUT /api/teacher/submission/:submissionId/grade
const gradeSubmission = async (req, res) => {
  try {
    const { marks, feedback } = req.body;
    const submission = await Submission.findById(req.params.submissionId).populate('assignmentId');

    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    if (submission.assignmentId.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    submission.marks = marks;
    submission.feedback = feedback || '';
    await submission.save();

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats for teacher
// @route   GET /api/teacher/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    const totalAssignments = await Assignment.countDocuments({ teacherId: req.user._id });
    const assignments = await Assignment.find({ teacherId: req.user._id });
    const assignmentIds = assignments.map((a) => a._id);

    const totalSubmissions = await Submission.countDocuments({ assignmentId: { $in: assignmentIds } });

    const plagiarismData = await Submission.find({
      assignmentId: { $in: assignmentIds },
      plagiarismScore: { $gt: 0 },
    }).select('plagiarismScore');

    const avgPlagiarism =
      plagiarismData.length > 0
        ? Math.round(plagiarismData.reduce((sum, s) => sum + s.plagiarismScore, 0) / plagiarismData.length)
        : 0;

    const highPlagiarism = plagiarismData.filter((s) => s.plagiarismScore > 70).length;

    res.json({
      totalAssignments,
      totalSubmissions,
      avgPlagiarism,
      highPlagiarism,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  createAssignment,
  getAssignments,
  getSubmissions,
  getAllSubmissions,
  gradeSubmission,
  getDashboardStats,
};
