const dotenv = require('dotenv'); 
dotenv.config(); // load .env variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ----------------------
// 1️⃣ Middleware
// ----------------------

// Allow frontend to communicate with backend
app.use(cors({
  origin: 'https://your-actual-vercel-frontend-url.vercel.app', // replace with your real frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----------------------
// 2️⃣ Routes
// ----------------------
app.use('/api', require('./routes/auth'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Department Assignment System API is running' });
});

// ----------------------
// 3️⃣ MongoDB Connection
// ----------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

module.exports = app;
