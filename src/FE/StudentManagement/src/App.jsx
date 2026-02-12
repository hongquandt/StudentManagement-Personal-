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
import TeacherMaterials from './pages/Teacher/TeacherMaterials'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import StudentUpdateProfile from './pages/Student/StudentUpdateProfile'
import StudentAttendance from './pages/Student/StudentAttendance'
import StudentScore from './pages/Student/StudentScore'
import StudentTimetable from './pages/Student/StudentTimetable'
import StudentConduct from './pages/Student/StudentConduct'
import StudentMaterials from './pages/Student/StudentMaterials'
import Chat from './pages/Chat'
import ChangePassword from './pages/ChangePassword'
import AdminLayout from './pages/Admin/AdminLayout'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminUsers from './pages/Admin/AdminUsers'
import AdminAcademicStructure from './pages/Admin/AdminAcademicStructure'
import AdminSubjects from './pages/Admin/AdminSubjects'
import AdminClasses from './pages/Admin/AdminClasses';
import AdminAssignStudent from './pages/Admin/AdminAssignStudent';
import AdminTeacherRequests from './pages/Admin/AdminTeacherRequests';
import './App.css'

import { ChatProvider } from './context/ChatContext'

function App() {
  return (
    <Router>
      <ChatProvider>
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
          <Route path="/student/conduct" element={<StudentConduct />} />
          <Route path="/student/materials" element={<StudentMaterials />} />
          
          {/* Chat - Accessible by both */}
          <Route path="/chat" element={<Chat />} />

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
            <Route path="materials" element={<TeacherMaterials />} />
            <Route path="chat" element={<Chat />} /> {/* Nested chat route for teacher layout styling */}
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
             <Route path="dashboard" element={<AdminDashboard />} />
             <Route path="users" element={<AdminUsers />} />
             <Route path="academic-years" element={<AdminAcademicStructure />} /> {/* Changed this to the combined page */}
             <Route path="classes" element={<AdminClasses />} />
             <Route path="assign-student" element={<AdminAssignStudent />} />
             <Route path="subjects" element={<AdminSubjects />} />
             <Route path="teacher-requests" element={<AdminTeacherRequests />} />
             {/* Add other admin routes here as we implement the pages */}
          </Route>
        </Routes>
      </ChatProvider> 
    </Router>
  )
}

export default App
