import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block">AssignTrack</span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              {user.role === 'teacher' ? (
                <>
                  <Link to="/teacher/dashboard" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">Dashboard</Link>
                  <Link to="/teacher/create-assignment" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">New Assignment</Link>
                  <Link to="/teacher/submissions" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">Submissions</Link>
                </>
              ) : (
                <>
                  <Link to="/student/dashboard" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">Dashboard</Link>
                  <Link to="/student/assignments" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">Assignments</Link>
                  <Link to="/student/analytics" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">Analytics</Link>
                </>
              )}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                  <span className="text-xs text-gray-500 capitalize">{user.role} • {user.department}</span>
                </div>
                <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm uppercase">
                  {user.name.charAt(0)}
                </div>
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn-secondary text-sm py-1.5 px-3">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-3">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
