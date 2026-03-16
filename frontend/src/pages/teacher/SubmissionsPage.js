import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissionsByAssignment, getTeacherAssignments, gradeSubmission } from '../../utils/api';
import { Loader, Alert, EmptyState } from '../../components/common/UI';
import { formatDateTime, getPlagiarismColor, getPlagiarismLabel } from '../../utils/helpers';

const SubmissionsPage = () => {
  const { assignmentId } = useParams();
  const [data, setData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedId, setSelectedId] = useState(assignmentId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [grading, setGrading] = useState({});

  useEffect(() => {
    getTeacherAssignments().then(r => {
      setAssignments(r.data);
      if (!selectedId && r.data.length > 0) setSelectedId(r.data[0]._id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setError('');
    getSubmissionsByAssignment(selectedId)
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load submissions.'))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const handleGrade = async (subId, marks, feedback) => {
    try {
      await gradeSubmission(subId, { marks, feedback });
      setData(prev => ({
        ...prev,
        submissions: prev.submissions.map(s =>
          s._id === subId ? { ...s, marks, feedback } : s
        ),
      }));
    } catch {
      alert('Failed to save grade.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Submissions</h1>
        <p className="text-gray-500 text-sm mt-1">Review submitted work and plagiarism scores.</p>
      </div>

      {/* Assignment selector */}
      <div className="card mb-6">
        <label className="label">Select Assignment</label>
        <select className="input-field max-w-md" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">-- Choose an assignment --</option>
          {assignments.map(a => (
            <option key={a._id} value={a._id}>{a.title} ({a.subjectId?.subjectName})</option>
          ))}
        </select>
      </div>

      {error && <Alert type="error" message={error} />}
      {loading && <Loader text="Loading submissions..." />}

      {data && !loading && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Students', val: data.totalStudents, color: 'bg-blue-50 text-blue-700' },
              { label: 'Submitted', val: data.submittedCount, color: 'bg-green-50 text-green-700' },
              { label: 'Pending', val: data.pendingCount, color: 'bg-yellow-50 text-yellow-700' },
              { label: 'Completion', val: `${data.totalStudents > 0 ? Math.round((data.submittedCount / data.totalStudents) * 100) : 0}%`, color: 'bg-purple-50 text-purple-700' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
                <p className="text-2xl font-bold">{s.val}</p>
                <p className="text-xs font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Submission list */}
          {data.submissions.length === 0 ? (
            <div className="card">
              <EmptyState title="No submissions yet" description="Students haven't submitted this assignment yet." />
            </div>
          ) : (
            <div className="space-y-4">
              {data.submissions.map(sub => (
                <SubmissionCard key={sub._id} sub={sub} onGrade={handleGrade} maxMarks={data.assignment?.maxMarks || 100} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const SubmissionCard = ({ sub, onGrade, maxMarks }) => {
  const [marks, setMarks] = useState(sub.marks ?? '');
  const [feedback, setFeedback] = useState(sub.feedback || '');
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onGrade(sub._id, parseFloat(marks), feedback);
    setSaving(false);
  };

  const plagColor = getPlagiarismColor(sub.plagiarismScore);
  const plagLabel = getPlagiarismLabel(sub.plagiarismScore);

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Student info */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold uppercase">
            {sub.studentId?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{sub.studentId?.name}</p>
            <p className="text-xs text-gray-500">{sub.studentId?.email}</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${plagColor}`}>
            🔍 {sub.plagiarismScore}% — {plagLabel}
          </span>
          {sub.isLate && <span className="badge-red">Late</span>}
          {sub.marks !== null && sub.marks !== undefined ? (
            <span className="badge-green">✓ Graded: {sub.marks}/{maxMarks}</span>
          ) : (
            <span className="badge-yellow">Ungraded</span>
          )}
          <p className="text-xs text-gray-400">{formatDateTime(sub.submissionDate)}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a href={sub.fileUrl} target="_blank" rel="noreferrer"
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
            📄 Download
          </a>
          <button onClick={() => setOpen(!open)} className="btn-secondary text-xs py-1.5 px-3">
            {open ? 'Hide' : 'Grade'}
          </button>
        </div>
      </div>

      {/* Plagiarism details */}
      {sub.plagiarismDetails?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">Similarity Matches:</p>
          <div className="flex flex-wrap gap-2">
            {sub.plagiarismDetails.map((d, i) => (
              <span key={i} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                {d.matchedStudentName}: {d.similarity}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grade form */}
      {open && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Marks (out of {maxMarks})</label>
              <input type="number" className="input-field" min={0} max={maxMarks}
                value={marks} onChange={e => setMarks(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Feedback</label>
            <textarea rows={2} className="input-field resize-none" placeholder="Optional feedback..."
              value={feedback} onChange={e => setFeedback(e.target.value)} />
          </div>
          <button onClick={handleSave} disabled={saving || marks === ''} className="btn-primary text-sm py-2 px-4">
            {saving ? 'Saving...' : 'Save Grade'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;
