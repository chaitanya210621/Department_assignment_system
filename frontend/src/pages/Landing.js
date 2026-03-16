import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const features = [
    { icon: '📋', title: 'Post Assignments', desc: 'Teachers can create assignments with deadlines, subjects, and detailed descriptions.' },
    { icon: '📤', title: 'Submit Work', desc: 'Students submit files directly through the portal before the deadline.' },
    { icon: '🔍', title: 'Plagiarism Check', desc: 'Automatic similarity detection using cosine similarity algorithm.' },
    { icon: '📊', title: 'Analytics', desc: 'Performance charts and submission statistics for both roles.' },
    { icon: '⏱️', title: 'Live Countdown', desc: 'Real-time deadline countdowns keep students on track.' },
    { icon: '🏫', title: 'Multi-Department', desc: 'Scalable architecture supports multiple departments and teachers.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Department Assignment Management System
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Manage Assignments
          <span className="block text-blue-600">The Smart Way</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          A complete platform for college departments — teachers post assignments, students submit work, and the system handles plagiarism detection and analytics automatically.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-primary py-3 px-8 text-lg">
            Get Started Free
          </Link>
          <Link to="/login" className="btn-secondary py-3 px-8 text-lg">
            Sign In
          </Link>
        </div>
      </div>

      {/* Role Cards */}
      <div className="max-w-4xl mx-auto px-6 pb-16 grid sm:grid-cols-2 gap-6">
        <div className="card hover:shadow-lg transition-all border-2 border-blue-100 hover:border-blue-300">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-2xl">👩‍🏫</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">For Teachers</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            {['Post assignments by subject', 'View all student submissions', 'Check plagiarism scores', 'Grade and give feedback'].map(i => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {i}
              </li>
            ))}
          </ul>
          <Link to="/register" className="btn-primary w-full mt-6 text-center block">
            Register as Teacher
          </Link>
        </div>

        <div className="card hover:shadow-lg transition-all border-2 border-purple-100 hover:border-purple-300">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-2xl">👨‍🎓</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">For Students</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            {['View assignments by subject', 'Submit files before deadline', 'See your plagiarism score', 'Track performance analytics'].map(i => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {i}
              </li>
            ))}
          </ul>
          <Link to="/register" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all w-full mt-6 text-center block">
            Register as Student
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything You Need</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400">
        © {new Date().getFullYear()} AssignTrack — Department Assignment Management System
      </footer>
    </div>
  );
};

export default Landing;
