import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getStudentAssignments, submitAssignment } from '../../utils/api';
import { Alert } from '../../components/common/UI';
import DeadlineCountdown from '../../components/common/DeadlineCountdown';
import { formatDate } from '../../utils/helpers';

const SubmitAssignment = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    getStudentAssignments()
      .then(r => {
        const a = r.data.find(x => x._id === assignmentId);
        if (!a) { setError('Assignment not found.'); return; }
        setAssignment(a);
      })
      .catch(() => setError('Failed to load assignment.'));
  }, [assignmentId]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a file.'); return; }
    setError('');
    setLoading(true);
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('file', file);
    try {
      const { data } = await submitAssignment(formData);
      setSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!assignment && !error) return <div className="text-center py-16 text-gray-400">Loading assignment...</div>;

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submitted! 🎉</h2>
        <p className="text-gray-500 mb-4">Your assignment has been submitted successfully.</p>
        <div className="card text-left mb-6">
          <p className="text-sm text-gray-600"><strong>Plagiarism Score:</strong>
            <span className={`ml-2 font-semibold ${success.plagiarismScore > 50 ? 'text-red-600' : success.plagiarismScore > 20 ? 'text-yellow-600' : 'text-green-600'}`}>
              {success.plagiarismScore}%
            </span>
          </p>
          {success.isLate && <p className="text-sm text-orange-600 mt-1">⚠️ This was a late submission.</p>}
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/student/dashboard" className="btn-primary">Go to Dashboard</Link>
          <Link to="/student/assignments" className="btn-secondary">View Assignments</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-6">
        <Link to="/student/assignments" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-4">
          ← Back to Assignments
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Submit Assignment</h1>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {assignment && (
        <div className="card mb-6 border-l-4 border-l-blue-500">
          <h2 className="font-bold text-gray-900 text-lg">{assignment.title}</h2>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
            <span>📚 {assignment.subjectId?.subjectName}</span>
            <span>📅 Due: {formatDate(assignment.deadline)}</span>
          </div>
          <div className="mt-3">
            <DeadlineCountdown deadline={assignment.deadline} />
          </div>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">{assignment.description}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="label">Upload File *</label>
          <p className="text-xs text-gray-400 mb-3">Accepted: PDF, DOC, DOCX, TXT, ZIP (max 10MB)</p>

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragging ? 'border-blue-500 bg-blue-50' :
              file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onClick={() => document.getElementById('file-input').click()}
          >
            {file ? (
              <div>
                <div className="text-4xl mb-2">📄</div>
                <p className="font-medium text-green-700">{file.name}</p>
                <p className="text-xs text-green-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-red-500 hover:underline mt-2">Remove</button>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-3">☁️</div>
                <p className="font-medium text-gray-700">Drag & drop your file here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
              </div>
            )}
          </div>
          <input id="file-input" type="file" className="hidden"
            accept=".pdf,.doc,.docx,.txt,.zip"
            onChange={e => setFile(e.target.files[0])} />
        </div>

        <div className="flex gap-3">
          <Link to="/student/assignments" className="btn-secondary flex-1 text-center">Cancel</Link>
          <button type="submit" disabled={loading || !file} className="btn-primary flex-1">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting & Checking...
              </span>
            ) : '📤 Submit Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitAssignment;
