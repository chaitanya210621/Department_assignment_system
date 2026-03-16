import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudentAssignments } from '../../utils/api';
import { Loader, Alert, EmptyState } from '../../components/common/UI';
import DeadlineCountdown from '../../components/common/DeadlineCountdown';
import { formatDate, formatDateTime } from '../../utils/helpers';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | pending | submitted | overdue
  const [search, setSearch] = useState('');

  useEffect(() => {
    getStudentAssignments()
      .then(r => setAssignments(r.data))
      .catch(() => setError('Failed to load assignments.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = assignments.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subjectId?.subjectName?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'pending') return !a.hasSubmitted && !a.isOverdue;
    if (filter === 'submitted') return a.hasSubmitted;
    if (filter === 'overdue') return !a.hasSubmitted && a.isOverdue;
    return true;
  });

  if (loading) return <Loader text="Loading assignments..." />;

  const counts = {
    all: assignments.length,
    pending: assignments.filter(a => !a.hasSubmitted && !a.isOverdue).length,
    submitted: assignments.filter(a => a.hasSubmitted).length,
    overdue: assignments.filter(a => !a.hasSubmitted && a.isOverdue).length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-500 text-sm mt-1">View and submit your assignments.</p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(counts).map(([key, count]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}>
            {key} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input type="text" className="input-field max-w-sm" placeholder="Search by title or subject..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState title="No assignments found" description="Try changing the filter or search term." />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(a => <AssignmentCard key={a._id} assignment={a} />)}
        </div>
      )}
    </div>
  );
};

const AssignmentCard = ({ assignment: a }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`card hover:shadow-md transition-all border-l-4 ${
      a.hasSubmitted ? 'border-l-green-400' :
      a.isOverdue ? 'border-l-red-400' : 'border-l-blue-400'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-base">{a.title}</h3>
            {a.hasSubmitted && <span className="badge-green">✓ Submitted</span>}
            {!a.hasSubmitted && a.isOverdue && <span className="badge-red">Overdue</span>}
            {!a.hasSubmitted && !a.isOverdue && <span className="badge-blue">Pending</span>}
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
            <span>📚 {a.subjectId?.subjectName}</span>
            <span>👩‍🏫 {a.teacherId?.name}</span>
            <span>📅 Due: {formatDate(a.deadline)}</span>
            {a.maxMarks && <span>🎯 Max: {a.maxMarks} marks</span>}
          </div>
          {!a.hasSubmitted && !a.isOverdue && (
            <div className="mt-2">
              <DeadlineCountdown deadline={a.deadline} compact />
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setExpanded(!expanded)}
            className="btn-secondary text-xs py-1.5 px-3">
            {expanded ? 'Less' : 'Details'}
          </button>
          {!a.hasSubmitted && !a.isOverdue && (
            <Link to={`/student/submit/${a._id}`} className="btn-primary text-xs py-1.5 px-3">
              Submit
            </Link>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed">{a.description}</p>
          <p className="text-xs text-gray-400 mt-2">Created: {formatDateTime(a.createdAt)}</p>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
