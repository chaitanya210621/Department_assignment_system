import axios from 'axios';

// ✅ Use full backend URL
const API = axios.create({
  baseURL: 'https://department-assignment-system.onrender.com', // Render backend
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// Auth
export const registerUser = (data) => API.post('/api/register', data);
export const loginUser = (data) => API.post('/api/login', data);
export const getMe = () => API.get('/api/me');

// Teacher
export const createSubject = (data) => API.post('/api/teacher/create-subject', data);
export const getTeacherSubjects = () => API.get('/api/teacher/subjects');
export const createAssignment = (data) => API.post('/api/teacher/create-assignment', data);
export const getTeacherAssignments = () => API.get('/api/teacher/assignments');
export const getSubmissionsByAssignment = (id) => API.get(`/api/teacher/submissions/${id}`);
export const getAllSubmissions = () => API.get('/api/teacher/submissions');
export const gradeSubmission = (id, data) => API.put(`/api/teacher/submission/${id}/grade`, data);
export const getTeacherDashboardStats = () => API.get('/api/teacher/dashboard-stats');

// Student
export const getStudentAssignments = () => API.get('/api/student/assignments');
export const submitAssignment = (formData) =>
  API.post('/api/student/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getMySubmissions = () => API.get('/api/student/my-submissions');
export const getStudentAnalytics = () => API.get('/api/student/analytics');

export default API;
