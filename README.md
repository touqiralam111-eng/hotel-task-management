# 🏨 Hotel Task Management System

A full-stack web application for managing hotel staff tasks, built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Designed to help hotel teams create, assign, track, and complete daily operational tasks in one central place.

🔗 **Live Demo:** [hotel-task-management.vercel.app](https://hotel-task-management.vercel.app/login)
📂 **Repository:** [github.com/touqiralam111-eng/hotel-task-management](https://github.com/touqiralam111-eng/hotel-task-management)

---

## ✨ Features

- 🔐 **JWT Authentication** with role-based access control (Admin / Staff)
- ✅ **Task Management** — create, assign, update status, archive, and delete tasks
- 📊 **Dashboard & Analytics** — real-time stats and task overview
- 👥 **User Management** — admin can view, manage, and assign roles to staff
- 🔔 **Notifications** — real-time updates via Socket.io
- 🖼️ **Profile Management** — including profile photo upload
- 📝 **Activity Log** — track actions and changes across the system
- 🌗 **Dark / Light Theme** — toggle with saved user preference
- 📱 **Responsive UI** — built with Tailwind CSS

---

## 🛠️ Tech Stack

**Frontend**
- React.js
- Tailwind CSS
- React Router
- Axios
- Chart.js (analytics)
- Socket.io Client

**Backend**
- Node.js + Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt.js for password hashing
- Multer + Cloudinary for file uploads
- Socket.io for real-time updates

**Deployment**
- Frontend hosted on [Vercel](https://vercel.com)
- Backend hosted on [Render](https://render.com)
- Database hosted on [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## 📁 Project Structure

```
hotel-task-management/
├── client/               # React frontend
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth context
│       ├── layouts/      # Navbar, Sidebar, page layout
│       ├── pages/        # Route-level pages (Dashboard, Tasks, Users, etc.)
│       └── services/     # Axios API service
├── server/               # Express backend
│   ├── config/           # Database connection
│   ├── controllers/      # Route logic
│   ├── middleware/       # Auth, error handling, file upload
│   ├── models/           # Mongoose schemas (User, Task, Category, etc.)
│   └── routes/           # API route definitions
└── docs/                 # Additional documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB instance)

### 1. Clone the repository
```bash
git clone https://github.com/touqiralam111-eng/hotel-task-management.git
cd hotel-task-management
```

### 2. Set up the backend
```bash
cd server
npm install
```

Create a `.env` file inside `server/` with:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
CLIENT_URL=http://localhost:3000
```

Run the backend:
```bash
npm start
```

### 3. Set up the frontend
```bash
cd ../client
npm install
```

Create a `.env` file inside `client/` with:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Run the frontend:
```bash
npm start
```

The app will be available at `http://localhost:3000`, connecting to the API at `http://localhost:5000`.

---

## 🌐 Deployment Notes

- **Backend (Render):** set `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL` as environment variables in the Render dashboard. Make sure MongoDB Atlas has `0.0.0.0/0` (or Render's IP range) added to its Network Access list.
- **Frontend (Vercel):** set `REACT_APP_API_URL` to your deployed backend URL (e.g. `https://your-backend.onrender.com/api`) as an environment variable, then redeploy.

---

## 📄 License

This project was built as part of a college internship/project and is available for learning purposes.

---
