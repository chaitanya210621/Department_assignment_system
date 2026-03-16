# 📚 AssignTrack — Department Assignment Management System

A full-stack web application for college departments where teachers post assignments and students submit them, with automatic plagiarism detection and performance analytics.

---

## ✨ Features

### 👩‍🏫 Teacher
- Register / Login with JWT authentication
- Create subjects and assignments (title, description, deadline, max marks)
- View all student submissions per assignment
- Automatic plagiarism score per submission (cosine similarity)
- Grade submissions and add written feedback
- Dashboard stats: total assignments, submissions, plagiarism overview

### 👨‍🎓 Student
- Register / Login with JWT authentication
- View all assignments for their department, filtered by status
- Live deadline countdown timer
- Drag-and-drop file upload (PDF, DOC, DOCX, TXT, ZIP)
- Instant plagiarism score on submission
- Performance analytics with Chart.js (completion, marks, subject breakdown)
- View teacher feedback and grades

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Chart.js |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (JSON Web Tokens) |
| File Uploads | Multer |
| Plagiarism | Cosine Similarity + N-gram (custom) |

---

## 📁 Project Structure

```
department-assignment-system/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── teacherController.js
│   │   └── studentController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT protect / role guards
│   │   ├── upload.js          # Multer config
│   │   └── plagiarism.js      # Plagiarism detection engine
│   ├── models/
│   │   ├── User.js
│   │   ├── Subject.js
│   │   ├── Assignment.js
│   │   └── Submission.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── teacher.js
│   │   └── student.js
│   ├── uploads/               # Uploaded files (gitignored)
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Navbar.js
│   │   │       ├── UI.js            # Reusable: Loader, Alert, StatCard, EmptyState
│   │   │       └── DeadlineCountdown.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Landing.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── teacher/
│   │   │   │   ├── TeacherDashboard.js
│   │   │   │   ├── CreateAssignment.js
│   │   │   │   └── SubmissionsPage.js
│   │   │   └── student/
│   │   │       ├── StudentDashboard.js
│   │   │       ├── StudentAssignments.js
│   │   │       ├── SubmitAssignment.js
│   │   │       ├── MySubmissions.js
│   │   │       └── Analytics.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   └── index.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── .gitignore
├── package.json               # Root: run both with concurrently
└── README.md
```

---

## 🚀 Running Locally in VS Code

### Prerequisites
- **Node.js** v16+ — [Download](https://nodejs.org)
- **MongoDB** — Either:
  - Local: [Download MongoDB Community](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- **VS Code** — [Download](https://code.visualstudio.com)

---

### Step 1 — Clone and Open

```bash
git clone https://github.com/YOUR_USERNAME/department-assignment-system.git
cd department-assignment-system
code .
```

---

### Step 2 — Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/department_assignment_db
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
```

> **MongoDB Atlas users:** Replace `MONGO_URI` with your Atlas connection string, e.g.:
> `MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/assigntrack`

---

### Step 3 — Install All Dependencies

**Option A — Install everything at once (from root):**
```bash
npm install
npm run install-all
```

**Option B — Install manually:**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### Step 4 — Run the Application

**Option A — Run both together (from root):**
```bash
npm run dev
```

**Option B — Run separately (two terminals in VS Code):**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

---

### Step 5 — Access the App

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |

---

## 🧪 Quick Test Walkthrough

1. Open http://localhost:3000
2. **Register as Teacher** (e.g., name: Dr. Smith, dept: Computer Science, role: teacher)
3. Login → Create a Subject (e.g., "Data Structures")
4. Create an Assignment with a future deadline
5. **Register as Student** (same department: Computer Science, role: student)
6. Login as Student → View the assignment → Upload a file
7. Switch back to Teacher → View submissions & plagiarism scores

---

## 🌐 API Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Login and get JWT token |
| GET | `/api/me` | Get current user (protected) |

### Teacher (requires Bearer token + teacher role)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/teacher/create-subject` | Create a new subject |
| GET | `/api/teacher/subjects` | Get teacher's subjects |
| POST | `/api/teacher/create-assignment` | Create an assignment |
| GET | `/api/teacher/assignments` | Get all assignments |
| GET | `/api/teacher/submissions` | Get all submissions |
| GET | `/api/teacher/submissions/:id` | Get submissions for one assignment |
| PUT | `/api/teacher/submission/:id/grade` | Grade a submission |
| GET | `/api/teacher/dashboard-stats` | Dashboard statistics |

### Student (requires Bearer token + student role)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/student/assignments` | Get assignments for department |
| POST | `/api/student/submit` | Submit an assignment (multipart/form-data) |
| GET | `/api/student/my-submissions` | Get own submissions |
| GET | `/api/student/analytics` | Get performance analytics |

---

## 🔍 Plagiarism Detection

The system uses a **two-algorithm approach**:

1. **TF-IDF Cosine Similarity** (60% weight) — Compares term frequency vectors between documents. Effective for detecting reused content.
2. **N-gram Dice Coefficient** (40% weight) — Compares overlapping 3-word sequences. Catches paraphrased content.

**Score interpretation:**
| Score | Label | Color |
|-------|-------|-------|
| 0–19% | Original | 🟢 Green |
| 20–49% | Moderate | 🟡 Yellow |
| 50–69% | High | 🟠 Orange |
| 70–100% | Very High | 🔴 Red |

> **Note:** For production, integrate `pdf-parse` and `mammoth` to extract text from PDF and DOCX files for deeper analysis. The current implementation extracts text from `.txt` files directly.

---

## 🚢 Deploying to GitHub

### Step 1 — Create Repository
1. Go to [github.com](https://github.com) → **New repository**
2. Name: `department-assignment-system`
3. Set to Public or Private
4. **Do NOT** initialize with README (we have one)
5. Click **Create repository**

### Step 2 — Push Code
```bash
# In the project root
git init
git add .
git commit -m "Initial commit: Department Assignment Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/department-assignment-system.git
git push -u origin main
```

### Step 3 — Verify
Visit `https://github.com/YOUR_USERNAME/department-assignment-system` — all files should be visible.

---

## ☁️ Production Deployment Tips

### Backend (Railway / Render / Heroku)
1. Set environment variables on the hosting platform
2. Change `MONGO_URI` to MongoDB Atlas URI
3. Set `NODE_ENV=production`

### Frontend (Vercel / Netlify)
1. Set build command: `npm run build`
2. Set publish directory: `build`
3. Set environment variable: `REACT_APP_API_URL=https://your-backend-url.com`
4. Update `frontend/src/utils/api.js` baseURL to use `process.env.REACT_APP_API_URL`

---

## 📦 Dependencies Overview

### Backend
| Package | Purpose |
|---------|---------|
| express | Web framework |
| mongoose | MongoDB ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| multer | File upload handling |
| cors | Cross-origin requests |
| dotenv | Environment variables |
| nodemon (dev) | Auto-restart server |

### Frontend
| Package | Purpose |
|---------|---------|
| react / react-dom | UI framework |
| react-router-dom | Client-side routing |
| axios | HTTP requests |
| chart.js + react-chartjs-2 | Analytics charts |
| tailwindcss | Utility-first CSS |

---

## 🔮 Future Enhancements

- [ ] PDF/DOCX text extraction for deeper plagiarism analysis
- [ ] Email notifications for new assignments and deadlines
- [ ] Admin role for managing multiple departments
- [ ] Assignment file preview in browser
- [ ] Export submissions as CSV/Excel
- [ ] Real-time notifications with Socket.io
- [ ] Docker support for containerized deployment

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

Built with ❤️ for college departments | AssignTrack © 2024
