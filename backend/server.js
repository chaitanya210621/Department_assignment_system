const dotenv = require('dotenv'); 
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ✅ only once
const path = require('path');

const app = express();

// ----------------------
// ✅ Middleware (FINAL FIX)
// ----------------------
app.use(cors({
  origin: true, // ✅ allow all (fixes Vercel URL changes)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.options('*', cors()); // ✅ handle preflight

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----------------------
// ✅ Routes
// ----------------------
app.use('/api', require('./routes/auth'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Department Assignment System API is running' });
});

// ----------------------
// ✅ MongoDB Connection
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
