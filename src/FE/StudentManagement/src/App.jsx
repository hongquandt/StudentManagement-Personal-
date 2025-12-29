import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import TeacherLayout from './pages/Teacher/TeacherLayout'
import TeacherDashboard from './pages/Teacher/TeacherDashboard'
import TeacherHomeroom from './pages/Teacher/TeacherHomeroom'
import TeacherTimetable from './pages/Teacher/TeacherTimetable'
import TeacherRequestChange from './pages/Teacher/TeacherRequestChange'
import TeacherAttendance from './pages/Teacher/TeacherAttendance'
import TeacherGradeEntry from './pages/Teacher/TeacherGradeEntry'
import TeacherConduct from './pages/Teacher/TeacherConduct'
import TeacherProfile from './pages/Teacher/TeacherProfile'
import TeacherCertificates from './pages/Teacher/TeacherCertificates'
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

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="homeroom" element={<TeacherHomeroom />} />
          <Route path="timetable" element={<TeacherTimetable />} />
          <Route path="requests" element={<TeacherRequestChange />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="grades" element={<TeacherGradeEntry />} />
          <Route path="conduct" element={<TeacherConduct />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="certificates" element={<TeacherCertificates />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
