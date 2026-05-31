import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Users, BookOpen, FileText, TrendingUp, GraduationCap, Award,
  Package, Wallet, UserCheck, Users2, ClipboardList, DollarSign, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const PIE_COLORS = ['#e11d48', '#be123c', '#9f1239', '#881337'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-lg text-sm font-sans">
        <p className="font-semibold text-gray-700">{label || payload[0].name}</p>
        <p className="text-primary-600">{typeof payload[0].value === 'number' && payload[0].value > 999 ? new Intl.NumberFormat('vi-VN').format(payload[0].value) : payload[0].value}</p>
      </div>
    );
  }
  return null;
};

// Rút gọn cho trục biểu đồ (4.700.000 -> "4.7tr")
const fmtMoney = (n) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' tr';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return String(n);
};

// Hiển thị đầy đủ số tiền VND (4.700.000 -> "4.700.000 ₫")
const fmtVND = (n) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container animate-fade-in">
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const s = data?.stats || {};
  const revenue = data?.revenue || [];
  const recentEnrollments = data?.recentEnrollments || [];

  const cards = [
    { label: 'Tổng người dùng', value: s.totalUsers || 0, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50', link: '/admin/users' },
    { label: 'Học sinh', value: s.totalStudents || 0, sub: `${s.activeStudents || 0} hoạt động`, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/student-progress' },
    { label: 'Giáo viên', value: s.totalTeachers || 0, icon: UserCheck, color: 'text-teal-600', bg: 'bg-teal-50', link: '/admin/users' },
    { label: 'Khóa học', value: s.totalCourses || 0, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/courses' },
    { label: 'Ghi danh', value: s.totalEnrollments || 0, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Bài thi thử', value: s.totalMockTests || 0, icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/mock-tests' },
    { label: 'Bài nộp chờ chấm', value: s.pendingSubmissions || 0, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Lớp học', value: s.totalClasses || 0, icon: Users2, color: 'text-cyan-600', bg: 'bg-cyan-50', link: '/admin/classes' },
    { label: 'Gói đang hoạt động', value: s.activePackages || 0, icon: Package, color: 'text-rose-600', bg: 'bg-rose-50', link: '/admin/enrollments' },
    { label: 'Doanh thu (12 tháng)', value: fmtVND(s.totalRevenue || 0), valueClass: 'text-xl', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const pieData = [
    { name: 'Học sinh', value: s.totalStudents || 0 },
    { name: 'Giáo viên', value: s.totalTeachers || 0 },
    { name: 'Admin', value: Math.max(1, (s.totalUsers || 0) - (s.totalStudents || 0) - (s.totalTeachers || 0)) },
  ];

  const revenueData = revenue.map(r => ({
    month: r.month.split('-')[1] + '/' + r.month.split('-')[0].slice(2),
    total: r.total,
  }));

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-gray-500 font-sans text-sm">Tổng quan hệ thống IELTS Academy</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c, i) => {
          const Inner = (
            <div className="card-elevated p-4 animate-slide-up hover:shadow-lg transition-shadow" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <c.icon className={`w-5 h-5 ${c.color}`} />
                </div>
                {c.link && <ArrowRight className="w-4 h-4 text-gray-300" />}
              </div>
              <p className={`${c.valueClass || 'text-2xl'} font-display font-bold text-gray-900`}>{c.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-sans">{c.label}</p>
              {c.sub && <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>}
            </div>
          );
          return c.link ? <Link key={i} to={c.link}>{Inner}</Link> : <div key={i}>{Inner}</div>;
        })}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-600" /> Doanh thu 12 tháng
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Lora, serif' }} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'Lora, serif' }} allowDecimals={false} tickFormatter={fmtMoney} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#e11d48" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" /> Phân bổ vai trò
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                paddingAngle={4} dataKey="value" strokeWidth={0}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8}
                formatter={(value) => <span style={{ fontSize: 12, fontFamily: 'Lora, serif', color: '#374151' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent Enrollments ── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" /> Ghi danh gần đây
          </h3>
          <Link to="/admin/student-progress" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentEnrollments.length === 0 ? (
          <p className="text-center text-gray-400 py-6 text-sm">Chưa có ghi danh nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Học viên</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Khóa học</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Cấp độ</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Trạng thái</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Tiến độ</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.map(e => (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-gray-900">{e.core_ielts_lms_users?.full_name || '—'}</p>
                      <p className="text-xs text-gray-400">{e.core_ielts_lms_users?.email}</p>
                    </td>
                    <td className="py-2.5 px-3 text-gray-700">{e.core_ielts_lms_courses?.title || '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {e.core_ielts_lms_courses?.level || '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        e.status === 'completed' ? 'bg-emerald-100 text-emerald-700'
                          : e.status === 'active' ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, e.progress_percentage || 0)}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{parseFloat(e.progress_percentage || 0).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-xs text-gray-400">
                      {new Date(e.enrolled_at).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
