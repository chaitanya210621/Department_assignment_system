const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileName: {
      type: String,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    plagiarismScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    plagiarismDetails: {
      type: [
        {
          matchedStudentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          matchedStudentName: String,
          similarity: Number,
        },
      ],
      default: [],
    },
    marks: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
    isLate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);
