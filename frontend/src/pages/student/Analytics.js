import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement, LineElement, PointElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { getStudentAnalytics } from '../../utils/api';
import { Loader, Alert } from '../../components/common/UI';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getStudentAnalytics()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Crunching your data..." />;
  if (error) return <div className="p-8"><Alert type="error" message={error} /></div>;
  if (!data) return null;

  const { overview, subjectChartData, monthlyTrend } = data;

  // Completion doughnut
  const completionChart = {
    labels: ['Submitted', 'Pending'],
    datasets: [{
      data: [overview.submitted, overview.pending],
      backgroundColor: ['#22c55e', '#e5e7eb'],
      borderWidth: 0,
    }],
  };

  // Subject bar chart
  const subjectBar = {
    labels: subjectChartData.map(s => s.subject),
    datasets: [
      {
        label: 'Submissions',
        data: subjectChartData.map(s => s.submitted),
        backgroundColor: '#3b82f6',
        borderRadius: 6,
      },
      {
        label: 'Avg Marks',
        data: subjectChartData.map(s => s.avgMarks),
        backgroundColor: '#8b5cf6',
        borderRadius: 6,
      },
    ],
  };

  // Monthly line
  const monthlyLine = {
    labels: monthlyTrend.map(m => m.month),
    datasets: [{
      label: 'Submissions',
      data: monthlyTrend.map(m => m.count),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#3b82f6',
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Your academic performance overview.</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total', val: overview.totalAssignments, color: 'bg-blue-50 text-blue-700' },
          { label: 'Submitted', val: overview.submitted, color: 'bg-green-50 text-green-700' },
          { label: 'Pending', val: overview.pending, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'On Time', val: overview.onTime, color: 'bg-teal-50 text-teal-700' },
          { label: 'Late', val: overview.late, color: 'bg-orange-50 text-orange-700' },
          { label: 'Completion', val: `${overview.completionRate}%`, color: 'bg-purple-50 text-purple-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.val}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Completion doughnut */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Assignment Completion</h2>
          <div className="flex flex-col items-center">
            <div style={{ width: 200, height: 200 }}>
              <Doughnut data={completionChart} options={{
                responsive: true,
                cutout: '70%',
                plugins: { legend: { position: 'bottom' } },
              }} />
            </div>
            <div className="text-center mt-4">
              <p className="text-3xl font-bold text-blue-600">{overview.completionRate}%</p>
              <p className="text-sm text-gray-500">Completion Rate</p>
            </div>
          </div>
        </div>

        {/* Marks & plagiarism summary */}
        <div className="card col-span-1 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Performance Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-4xl font-bold text-green-600">{overview.avgMarks || 'N/A'}</p>
              <p className="text-sm text-green-700 mt-1">Average Marks</p>
              <p className="text-xs text-green-500">Across graded work</p>
            </div>
            <div className={`rounded-xl p-4 text-center ${overview.avgPlagiarism > 50 ? 'bg-red-50' : overview.avgPlagiarism > 20 ? 'bg-yellow-50' : 'bg-teal-50'}`}>
              <p className={`text-4xl font-bold ${overview.avgPlagiarism > 50 ? 'text-red-600' : overview.avgPlagiarism > 20 ? 'text-yellow-600' : 'text-teal-600'}`}>
                {overview.avgPlagiarism}%
              </p>
              <p className={`text-sm mt-1 ${overview.avgPlagiarism > 50 ? 'text-red-700' : 'text-gray-600'}`}>
                Avg Plagiarism
              </p>
              <p className="text-xs text-gray-500">
                {overview.avgPlagiarism < 20 ? '✅ Excellent' : overview.avgPlagiarism < 50 ? '⚠️ Moderate' : '❌ High'}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-4xl font-bold text-blue-600">{overview.onTime}</p>
              <p className="text-sm text-blue-700 mt-1">On-Time</p>
              <p className="text-xs text-blue-500">Timely submissions</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-4xl font-bold text-orange-600">{overview.late}</p>
              <p className="text-sm text-orange-700 mt-1">Late</p>
              <p className="text-xs text-orange-500">Past deadline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject bar chart */}
      {subjectChartData.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Performance by Subject</h2>
          <Bar data={subjectBar} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: false } } }} />
        </div>
      )}

      {/* Monthly line chart */}
      {monthlyTrend.length > 0 && (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Submission Timeline</h2>
          <Line data={monthlyLine} options={{ ...chartOptions }} />
        </div>
      )}

      {subjectChartData.length === 0 && monthlyTrend.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-400">Submit more assignments to see detailed analytics.</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
