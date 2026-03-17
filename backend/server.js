const dotenv = require('dotenv'); // 1️⃣ import dotenv
dotenv.config();                  // 2️⃣ load .env variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors({
  origin: ['https://your-frontend.vercel.app'], // replace this with your actual Vercel frontend URL
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Department Assignment System API is running' });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
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
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
