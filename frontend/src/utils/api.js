import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// Auth
export const registerUser = (data) => API.post('/register', data);
export const loginUser = (data) => API.post('/login', data);
export const getMe = () => API.get('/me');

// Teacher
export const createSubject = (data) => API.post('/teacher/create-subject', data);
export const getTeacherSubjects = () => API.get('/teacher/subjects');
export const createAssignment = (data) => API.post('/teacher/create-assignment', data);
export const getTeacherAssignments = () => API.get('/teacher/assignments');
export const getSubmissionsByAssignment = (id) => API.get(`/teacher/submissions/${id}`);
export const getAllSubmissions = () => API.get('/teacher/submissions');
export const gradeSubmission = (id, data) => API.put(`/teacher/submission/${id}/grade`, data);
export const getTeacherDashboardStats = () => API.get('/teacher/dashboard-stats');

// Student
export const getStudentAssignments = () => API.get('/student/assignments');
export const submitAssignment = (formData) =>
  API.post('/student/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getMySubmissions = () => API.get('/student/my-submissions');
export const getStudentAnalytics = () => API.get('/student/analytics');

export default API;
