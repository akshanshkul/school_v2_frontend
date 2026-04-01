import React, { useEffect, Suspense } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import Header from './Header'
import { Toaster } from 'react-hot-toast'
import { AppDispatch } from '../../store'
import { fetchSchoolData } from '../../store/appSlice'
import PageLoader from '../common/PageLoader'

const MainLayout: React.FC = () => {
  const location = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const { schoolData, loading } = useSelector((state: any) => state.app)
  const { isAuthenticated } = useSelector((state: any) => state.auth)

  useEffect(() => {
    if (isAuthenticated && !schoolData && !loading) {
      dispatch(fetchSchoolData())
    }
  }, [isAuthenticated, schoolData, loading, dispatch])
  
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return 'Dashboard'
    if (path === '/timetable') return 'Timetable Builder'
    if (path === '/grades') return 'Grade Levels'
    if (path === '/sections') return 'Sections'
    if (path === '/classes') return 'Class Mapping'
    if (path === '/subjects') return 'Subjects'
    if (path === '/classrooms') return 'Classrooms'
    if (path === '/staff') return 'Staff & Roles'
    if (path === '/attendance') return 'Staff Attendance'
    return 'School Management'
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={getPageTitle()} />
        <Toaster position="top-right" reverseOrder={false} />
        <main className="flex-1 p-8 overflow-y-auto relative">
          <Suspense fallback={<PageLoader />}>
            {loading && !schoolData ? (
              <PageLoader />
            ) : (
              <Outlet />
            )}
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
