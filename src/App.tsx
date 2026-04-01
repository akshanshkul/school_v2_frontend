import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageLoader from './components/common/PageLoader'

// Lazy loaded feature components
const Login = lazy(() => import('./components/Login'))
const Signup = lazy(() => import('./components/Signup'))
const Dashboard = lazy(() => import('./components/Dashboard'))
const TimetableBuilder = lazy(() => import('./components/TimetableBuilder'))
import MainLayout from './components/layout/MainLayout'

// Lazy loaded page components
const Grades = lazy(() => import('./pages/AcademicSetup/Grades'))
const Sections = lazy(() => import('./pages/AcademicSetup/Sections'))
const Classes = lazy(() => import('./pages/AcademicSetup/Classes'))
const Subjects = lazy(() => import('./pages/ResourceSetup/Subjects'))
const Classrooms = lazy(() => import('./pages/ResourceSetup/Classrooms'))
const Staff = lazy(() => import('./pages/UserManagement/Staff'))
const AttendanceManager = lazy(() => import('./pages/Attendance/AttendanceManager'))
const SchoolSettings = lazy(() => import('./pages/Settings/SchoolSettings'))
const SchoolInquiries = lazy(() => import('./pages/Settings/SchoolInquiries'))
const Subscription = lazy(() => import('./pages/Settings/Subscription'))
const PublicLandingPage = lazy(() => import('./pages/PublicLandingPage'))
import { ConfirmProvider } from './contexts/ConfirmContext'
import GlobalConfirmModal from './components/common/GlobalConfirmModal'
import './App.css'

const PrivateWrapper: React.FC = () => {
  const { isAuthenticated } = useSelector((state: any) => state.auth)
  return isAuthenticated ? <MainLayout /> : <Navigate to="/login" />
}

const App: React.FC = () => {
  return (
    <ConfirmProvider>
      <Router>
        <div className="layout-container">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Private Layout Routes */}
              <Route path="/" element={<PrivateWrapper />}>
                <Route index element={<Dashboard />} />
                <Route path="timetable" element={<TimetableBuilder />} />
                <Route path="grades" element={<Grades />} />
                <Route path="sections" element={<Sections />} />
                <Route path="classes" element={<Classes />} />
                <Route path="subjects" element={<Subjects />} />
                <Route path="classrooms" element={<Classrooms />} />
                <Route path="staff" element={<Staff />} />
                <Route path="attendance" element={<AttendanceManager />} />
                <Route path="settings" element={<SchoolSettings />} />
                <Route path="inquiries" element={<SchoolInquiries />} />
                <Route path="subscription" element={<Subscription />} />
              </Route>
  
              {/* Public School Landing Fallback */}
              <Route path="/:schoolSlug" element={<PublicLandingPage />} />
  
              {/* Redirects */}
              <Route path="*" element={<PublicLandingPage />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
      <GlobalConfirmModal />
    </ConfirmProvider>
  )
}

export default App
