import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Landing
import LandingPage from './pages/landing/LandingPage';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import Roadmap from './pages/student/Roadmap';
import CourseDetail from './pages/student/CourseDetail';
import UnitDetail from './pages/student/UnitDetail';
import LessonView from './pages/student/LessonView';
import ActivityView from './pages/student/ActivityView';
import MockTestList from './pages/student/MockTestList';
import MockTestTaking from './pages/student/MockTestTaking';
import MockTestResult from './pages/student/MockTestResult';
import PlacementTest from './pages/student/PlacementTest';
import StudentPackages from './pages/student/Packages';
import MyPackages from './pages/student/MyPackages';
import MyClass from './pages/student/MyClass';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard';
import Submissions from './pages/teacher/Submissions';
import GradeSubmission from './pages/teacher/GradeSubmission';
import TeacherClasses from './pages/teacher/Classes';
import ClassDetail from './pages/teacher/ClassDetail';
import TeacherCourseDetail from './pages/student/CourseDetail';
import TeacherUnitDetail from './pages/student/UnitDetail';
import TeacherLessonView from './pages/student/LessonView';
import TeacherMockTests from './pages/teacher/MockTests';
import TeacherMockTestDetail from './pages/teacher/MockTestDetail';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import AdminCourseEditor from './pages/admin/CourseEditor';
import AdminClasses from './pages/admin/Classes';
import ClassEditor from './pages/admin/ClassEditor';
import AdminPackages from './pages/admin/Packages';
import PackageEditor from './pages/admin/PackageEditor';
import AdminEnrollments from './pages/admin/Enrollments';
import AdminMockTests from './pages/admin/MockTests';
import AdminMockTestEditor from './pages/admin/MockTestEditor';
import AdminMockTestDetail from './pages/admin/MockTestDetail';
import AdminStudentProgress from './pages/admin/StudentProgress';
import AdminStudentProgressDetail from './pages/admin/StudentProgressDetail';
import AdminCourseDetail from './pages/admin/CourseDetail';

// Common
import Profile from './pages/common/Profile';
import NotFound from './pages/common/NotFound';
import PaymentReturn from './pages/common/PaymentReturn';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={`/${user.role}`} replace /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* VNPAY return (no layout, no auth — public callback) */}
      <Route path="/payment/return" element={<PaymentReturn />} />

      {/* Student routes */}
      <Route element={<ProtectedRoute roles={['student']}><MainLayout /></ProtectedRoute>}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/roadmap" element={<Roadmap />} />
        <Route path="/student/courses/:id" element={<CourseDetail />} />
        <Route path="/student/units/:id" element={<UnitDetail />} />
        <Route path="/student/lessons/:id" element={<LessonView />} />
        <Route path="/student/activities/:id" element={<ActivityView />} />
        <Route path="/student/mock-tests" element={<MockTestList />} />
        <Route path="/student/mock-tests/:id/take" element={<MockTestTaking />} />
        <Route path="/student/mock-tests/result/:id" element={<MockTestResult />} />
        <Route path="/student/placement-test" element={<PlacementTest />} />
        <Route path="/student/packages" element={<StudentPackages />} />
        <Route path="/student/my-packages" element={<MyPackages />} />
        <Route path="/student/my-class" element={<MyClass />} />
      </Route>

      {/* Teacher routes */}
      <Route element={<ProtectedRoute roles={['teacher']}><MainLayout /></ProtectedRoute>}>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/submissions" element={<Submissions />} />
        <Route path="/teacher/submissions/:id" element={<GradeSubmission />} />
        <Route path="/teacher/submissions/:id/grade" element={<GradeSubmission />} />
        <Route path="/teacher/classes" element={<TeacherClasses />} />
        <Route path="/teacher/classes/:id" element={<ClassDetail />} />
        <Route path="/teacher/courses/:id" element={<TeacherCourseDetail />} />
        <Route path="/teacher/units/:id" element={<TeacherUnitDetail />} />
        <Route path="/teacher/lessons/:id" element={<TeacherLessonView />} />
        <Route path="/teacher/mock-tests" element={<TeacherMockTests />} />
        <Route path="/teacher/mock-tests/:id" element={<TeacherMockTestDetail />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute roles={['admin']}><MainLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/courses/new" element={<AdminCourseEditor />} />
        <Route path="/admin/courses/:id" element={<AdminCourseDetail />} />
        <Route path="/admin/courses/:id/edit" element={<AdminCourseEditor />} />
        <Route path="/admin/classes" element={<AdminClasses />} />
        <Route path="/admin/classes/new" element={<ClassEditor />} />
        <Route path="/admin/classes/:id/edit" element={<ClassEditor />} />
        <Route path="/admin/packages" element={<AdminPackages />} />
        <Route path="/admin/packages/new" element={<PackageEditor />} />
        <Route path="/admin/packages/:id/edit" element={<PackageEditor />} />
        <Route path="/admin/enrollments" element={<AdminEnrollments />} />
        <Route path="/admin/mock-tests" element={<AdminMockTests />} />
        <Route path="/admin/mock-tests/new" element={<AdminMockTestEditor />} />
        <Route path="/admin/mock-tests/:id" element={<AdminMockTestDetail />} />
        <Route path="/admin/mock-tests/:id/edit" element={<AdminMockTestEditor />} />
        <Route path="/admin/student-progress" element={<AdminStudentProgress />} />
        <Route path="/admin/student-progress/:id" element={<AdminStudentProgressDetail />} />
      </Route>

      {/* Common routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#1e293b',
              color: '#fff',
              fontSize: '14px',
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}
