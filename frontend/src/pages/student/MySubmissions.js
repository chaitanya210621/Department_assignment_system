import React, { useEffect, useState } from 'react';
import { getMySubmissions } from '../../utils/api';
import { Loader, Alert, EmptyState } from '../../components/common/UI';
import { formatDateTime, getPlagiarismColor, getPlagiarismLabel } from '../../utils/helpers';

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMySubmissions()
      .then(r => setSubmissions(r.data))
      .catch(() => setError('Failed to load submissions.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading submissions..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
        <p className="text-gray-500 text-sm mt-1">All your submitted assignments and scores.</p>
      </div>

      {error && <Alert type="error" message={error} />}

      {submissions.length === 0 ? (
        <div className="card">
          <EmptyState title="No submissions yet" description="Submit an assignment to see it here." />
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(s => {
            const pColor = getPlagiarismColor(s.plagiarismScore);
            const pLabel = getPlagiarismLabel(s.plagiarismScore);
            return (
              <div key={s._id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{s.assignmentId?.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                      <span>📚 {s.assignmentId?.subjectId?.subjectName || 'N/A'}</span>
                      <span>📅 Submitted: {formatDateTime(s.submissionDate)}</span>
                      {s.isLate && <span className="text-orange-600">⚠️ Late</span>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Plagiarism */}
                    <div className={`px-3 py-2 rounded-lg text-center ${pColor}`}>
                      <p className="text-lg font-bold leading-none">{s.plagiarismScore}%</p>
                      <p className="text-xs mt-0.5">{pLabel}</p>
                    </div>

                    {/* Marks */}
                    {s.marks !== null && s.marks !== undefined ? (
                      <div className="px-3 py-2 rounded-lg bg-green-50 text-green-700 text-center">
                        <p className="text-lg font-bold leading-none">{s.marks}</p>
                        <p className="text-xs mt-0.5">Marks</p>
                      </div>
                    ) : (
                      <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-400 text-center">
                        <p className="text-sm font-medium">Pending</p>
                        <p className="text-xs">Grade</p>
                      </div>
                    )}

                    {/* File */}
                    <a href={s.fileUrl} target="_blank" rel="noreferrer"
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                      📄 {s.fileName || 'Download'}
                    </a>
                  </div>
                </div>

                {/* Feedback */}
                {s.feedback && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Teacher Feedback:</p>
                    <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3">{s.feedback}</p>
                  </div>
                )}

                {/* Plagiarism match details */}
                {s.plagiarismDetails?.length > 0 && s.plagiarismScore > 15 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-orange-600 mb-2">⚠️ Similarity detected with:</p>
                    <div className="flex flex-wrap gap-2">
                      {s.plagiarismDetails.map((d, i) => (
                        <span key={i} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-200">
                          {d.matchedStudentName}: {d.similarity}%
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MySubmissions;
