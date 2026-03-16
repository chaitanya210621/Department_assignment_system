import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Common
import Navbar from './components/common/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateAssignment from './pages/teacher/CreateAssignment';
import SubmissionsPage from './pages/teacher/SubmissionsPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAssignments from './pages/student/StudentAssignments';
import SubmitAssignment from './pages/student/SubmitAssignment';
import MySubmissions from './pages/student/MySubmissions';
import Analytics from './pages/student/Analytics';

// Protected Route
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} /> : <Register />} />

        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/create-assignment" element={<ProtectedRoute role="teacher"><CreateAssignment /></ProtectedRoute>} />
        <Route path="/teacher/submissions" element={<ProtectedRoute role="teacher"><SubmissionsPage /></ProtectedRoute>} />
        <Route path="/teacher/submissions/:assignmentId" element={<ProtectedRoute role="teacher"><SubmissionsPage /></ProtectedRoute>} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/assignments" element={<ProtectedRoute role="student"><StudentAssignments /></ProtectedRoute>} />
        <Route path="/student/submit/:assignmentId" element={<ProtectedRoute role="student"><SubmitAssignment /></ProtectedRoute>} />
        <Route path="/student/my-submissions" element={<ProtectedRoute role="student"><MySubmissions /></ProtectedRoute>} />
        <Route path="/student/analytics" element={<ProtectedRoute role="student"><Analytics /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <p className="text-6xl font-black text-gray-200">404</p>
            <p className="text-xl font-semibold text-gray-600 mt-2">Page Not Found</p>
            <a href="/" className="btn-primary mt-6">Go Home</a>
          </div>
        } />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
