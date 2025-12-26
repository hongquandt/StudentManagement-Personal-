import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import StudentUpdateProfile from './pages/Student/StudentUpdateProfile'
import StudentAttendance from './pages/Student/StudentAttendance'
import StudentScore from './pages/Student/StudentScore'
import StudentTimetable from './pages/Student/StudentTimetable'
import ChangePassword from './pages/ChangePassword'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/student/update-profile" element={<StudentUpdateProfile />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        <Route path="/student/score" element={<StudentScore />} />
        <Route path="/student/timetable" element={<StudentTimetable />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  )
}

export default App
