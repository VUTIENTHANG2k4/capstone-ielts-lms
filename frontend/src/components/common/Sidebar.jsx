import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Map, BookOpen, FileText, Users,
  ClipboardCheck, Trophy, X, GraduationCap, Package, Users2, Wallet, Inbox, BarChart3
} from 'lucide-react';

const studentLinks = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/roadmap', icon: Map, label: 'Lộ trình học' },
  { to: '/student/mock-tests', icon: FileText, label: 'Thi thử IELTS' },
  { to: '/student/placement-test', icon: Trophy, label: 'Placement Test' },
  { to: '/student/my-class', icon: Users2, label: 'Lớp của tôi' },
  { to: '/student/packages', icon: Package, label: 'Gói học' },
  { to: '/student/my-packages', icon: Wallet, label: 'Gói đã mua' },
];

const teacherLinks = [
  { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teacher/submissions', icon: ClipboardCheck, label: 'Chấm bài' },
  { to: '/teacher/classes', icon: Users2, label: 'Lớp của tôi' },
  { to: '/teacher/mock-tests', icon: FileText, label: 'Bài thi thử' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Quản lý Users' },
  { to: '/admin/courses', icon: BookOpen, label: 'Quản lý Courses' },
  { to: '/admin/mock-tests', icon: FileText, label: 'Quản lý Thi thử' },
  { to: '/admin/student-progress', icon: BarChart3, label: 'Tiến độ học sinh' },
  { to: '/admin/classes', icon: Users2, label: 'Lớp học' },
  { to: '/admin/packages', icon: Package, label: 'Gói học' },
  { to: '/admin/enrollments', icon: Inbox, label: 'Đơn đăng ký' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  const links = role === 'admin' ? adminLinks
    : role === 'teacher' ? teacherLinks
    : studentLinks;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-16 left-0 bottom-0 w-64 z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        flex flex-col
      `} style={{ background: 'linear-gradient(180deg, #881337 0%, #9f1239 50%, #b91c1c 100%)' }}>

        {/* Mobile close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 lg:hidden">
          <span className="font-display font-bold text-white text-sm">Menu</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === `/${role}`}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-white text-primary-700 shadow-md font-semibold'
                  : 'text-red-100 hover:bg-white/15 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom badge */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">IELTS Academy</p>
              <p className="text-xs text-red-200">Chinh phục IELTS</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
