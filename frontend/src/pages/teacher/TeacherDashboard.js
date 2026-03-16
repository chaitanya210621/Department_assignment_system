import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTeacherAssignments, getTeacherDashboardStats } from '../../utils/api';
import { Loader, StatCard, EmptyState, Alert } from '../../components/common/UI';
import DeadlineCountdown from '../../components/common/DeadlineCountdown';
import { formatDate } from '../../utils/helpers';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, assignRes] = await Promise.all([
          getTeacherDashboardStats(),
          getTeacherAssignments(),
        ]);
        setStats(statsRes.data);
        setAssignments(assignRes.data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Department: {user?.department}</p>
        </div>
        <Link to="/teacher/create-assignment" className="btn-primary flex items-center gap-2 w-fit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Assignment
        </Link>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Assignments" value={stats.totalAssignments} color="blue" subtitle="Created by you"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <StatCard title="Total Submissions" value={stats.totalSubmissions} color="green" subtitle="Across all assignments"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>}
          />
          <StatCard title="Avg Plagiarism" value={`${stats.avgPlagiarism}%`} color="orange" subtitle="Across submissions"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          />
          <StatCard title="High Plagiarism" value={stats.highPlagiarism} color="red" subtitle="> 70% similarity"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          />
        </div>
      )}

      {/* Assignments Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Your Assignments</h2>
          <Link to="/teacher/submissions" className="text-sm text-blue-600 hover:underline font-medium">
            View all submissions →
          </Link>
        </div>

        {assignments.length === 0 ? (
          <EmptyState
            title="No assignments yet"
            description="Create your first assignment to get started."
            action={<Link to="/teacher/create-assignment" className="btn-primary">Create Assignment</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Title</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Subject</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Deadline</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Submitted</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => {
                  const isOverdue = new Date(a.deadline) < new Date();
                  return (
                    <tr key={a._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2 font-medium text-gray-900">{a.title}</td>
                      <td className="py-3 px-2 text-gray-600">{a.subjectId?.subjectName || 'N/A'}</td>
                      <td className="py-3 px-2 text-gray-600">
                        <div>{formatDate(a.deadline)}</div>
                        {!isOverdue && <DeadlineCountdown deadline={a.deadline} compact />}
                      </td>
                      <td className="py-3 px-2">
                        <span className="badge-blue">{a.submissionCount || 0} submitted</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={isOverdue ? 'badge-red' : 'badge-green'}>
                          {isOverdue ? 'Closed' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Link
                          to={`/teacher/submissions/${a._id}`}
                          className="text-blue-600 hover:underline font-medium text-xs"
                        >
                          View Submissions
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
