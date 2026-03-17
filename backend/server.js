const dotenv = require('dotenv'); 
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ✅ ONLY ONCE
const path = require('path');

const app = express();

// ----------------------
// Middleware
// ----------------------
app.use(cors({
  origin: 'https://department-assignment-system-h4bgr1rud.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.options('*', cors({
  origin: 'https://department-assignment-system-h4bgr1rud.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));

app.get('/', (req, res) => {
  res.json({ message: 'API running' });
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(process.env.PORT || 5000, () =>
    console.log('🚀 Server running')
  );
})
.catch(err => console.log(err));
