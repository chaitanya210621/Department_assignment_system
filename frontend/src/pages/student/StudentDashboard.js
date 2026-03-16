import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudentAssignments, getMySubmissions } from '../../utils/api';
import { Loader, StatCard, Alert, EmptyState } from '../../components/common/UI';
import DeadlineCountdown from '../../components/common/DeadlineCountdown';
import { formatDate, getPlagiarismColor } from '../../utils/helpers';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getStudentAssignments(), getMySubmissions()])
      .then(([aRes, sRes]) => {
        setAssignments(aRes.data);
        setSubmissions(sRes.data);
      })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  const pending = assignments.filter(a => !a.hasSubmitted && !a.isOverdue);
  const overdue = assignments.filter(a => !a.hasSubmitted && a.isOverdue);
  const submitted = assignments.filter(a => a.hasSubmitted);
  const upcoming = [...pending].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.name} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Department: {user?.department}</p>
        </div>
        <Link to="/student/assignments" className="btn-primary flex items-center gap-2 w-fit">
          View All Assignments
        </Link>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Notification Banner for overdue */}
      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-800">Overdue Assignments</p>
            <p className="text-sm text-red-600 mt-0.5">
              You have {overdue.length} overdue assignment{overdue.length > 1 ? 's' : ''}: {overdue.map(a => a.title).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assignments" value={assignments.length} color="blue"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard title="Submitted" value={submitted.length} color="green"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        />
        <StatCard title="Pending" value={pending.length} color="yellow"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard title="Overdue" value={overdue.length} color="red"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming deadlines */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⏰ Upcoming Deadlines</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No pending assignments 🎉</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(a => (
                <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{a.title}</p>
                    <p className="text-xs text-gray-500">{a.subjectId?.subjectName} • Due {formatDate(a.deadline)}</p>
                  </div>
                  <DeadlineCountdown deadline={a.deadline} compact />
                </div>
              ))}
              <Link to="/student/assignments" className="block text-center text-sm text-blue-600 hover:underline mt-2">
                View all →
              </Link>
            </div>
          )}
        </div>

        {/* Recent submissions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📤 Recent Submissions</h2>
          {submissions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No submissions yet. Start submitting!</p>
          ) : (
            <div className="space-y-3">
              {submissions.slice(0, 4).map(s => (
                <div key={s._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{s.assignmentId?.title}</p>
                    <p className="text-xs text-gray-500">{s.assignmentId?.subjectId?.subjectName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getPlagiarismColor(s.plagiarismScore)}`}>
                      {s.plagiarismScore}% match
                    </span>
                    {s.marks !== null && s.marks !== undefined && (
                      <p className="text-xs text-green-600 mt-1">Marks: {s.marks}</p>
                    )}
                  </div>
                </div>
              ))}
              <Link to="/student/my-submissions" className="block text-center text-sm text-blue-600 hover:underline mt-2">
                View all →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
