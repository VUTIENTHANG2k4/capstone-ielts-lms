import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Map, Trophy, Clock, TrendingUp, ArrowRight, Star, CheckCircle2, Lock } from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell
} from 'recharts';

const COURSE_COLORS = ['#e11d48', '#be123c', '#9f1239', '#881337', '#6e0f2e'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-lg text-sm">
        <p className="font-semibold text-gray-700">{label}</p>
        <p className="text-primary-600">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/progress/roadmap')
      .then(res => setRoadmap(res.data.roadmap || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeCourse = roadmap.find(c => c.status === 'active');
  const completedCourses = roadmap.filter(c => c.status === 'completed').length;
  const overallProgress = roadmap.length > 0
    ? Math.round(roadmap.reduce((sum, c) => sum + (c.progress_percentage || 0), 0) / roadmap.length)
    : 0;

  // Build chart data from roadmap
  const barData = roadmap.map((c, i) => ({
    name: `C${i + 1}`,
    fullName: c.title?.split(':')[0] || `Course ${i + 1}`,
    value: Math.round(c.progress_percentage || 0),
  }));

  // Stable weekly chart - based on course progress
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const weekData = weekDays.map((day, i) => ({
    day,
    progress: Math.round(overallProgress * (0.6 + 0.07 * i)),
  }));

  const radialData = [
    { name: 'Tiến độ', value: overallProgress, fill: '#e11d48' },
  ];

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      {/* ── Hero ── */}
      <div className="rounded-2xl p-8 mb-8 relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, #881337 0%, #be123c 45%, #e11d48 100%)' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20px 20px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold mb-1">Xin chào, {user?.full_name}!</h1>
            <p className="text-red-200">Tiếp tục hành trình chinh phục IELTS của bạn</p>
          </div>
          <div className="flex items-center gap-3">
            {activeCourse && (
              <Link to={`/student/courses/${activeCourse.id}`} className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-red-50 transition-colors shadow-lg">
                Tiếp tục học <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Tiến độ tổng', value: `${overallProgress}%`, icon: TrendingUp, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Khóa hoàn thành', value: `${completedCourses} / 5`, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Đang học', value: activeCourse ? activeCourse.title.split(':')[0] : 'Chưa bắt đầu', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', small: true },
        ].map((s, i) => (
          <div key={i} className="card-elevated p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className={`font-bold text-gray-900 ${s.small ? 'text-lg' : 'text-2xl'}`}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Radial progress */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <h3 className="font-display font-bold text-gray-800 mb-4 self-start">Tiến độ tổng thể</h3>
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%"
                data={radialData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#fee2e2' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-display font-bold text-primary-600">{overallProgress}</span>
              <span className="text-sm text-gray-500 font-sans">%</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3 font-sans">Hoàn thành {completedCourses}/5 khóa học</p>
        </div>

        {/* Bar chart: per-course progress */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-gray-800 mb-4">Tiến độ theo khóa học</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Lora, serif' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Lora, serif' }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((_, index) => (
                    <Cell key={index} fill={COURSE_COLORS[index % COURSE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>
          )}
        </div>
      </div>

      {/* ── Active course ── */}
      {activeCourse && (
        <div className="mb-8">
          <h2 className="section-title mb-4">Khóa đang học</h2>
          <div className="card-elevated p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-primary">{activeCourse.band_range}</span>
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900 mb-3">{activeCourse.title}</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full transition-all duration-700"
                      style={{
                        width: `${activeCourse.progress_percentage || 0}%`,
                        background: 'linear-gradient(90deg, #e11d48, #be123c)'
                      }} />
                  </div>
                  <span className="text-sm font-bold text-primary-600 font-mono">
                    {Math.round(activeCourse.progress_percentage || 0)}%
                  </span>
                </div>
              </div>
              <Link to={`/student/courses/${activeCourse.id}`} className="btn-primary gap-2">
                Tiếp tục học <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick actions ── */}
      <div className="mb-8">
        <h2 className="section-title mb-4">Hành động nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: '/student/roadmap', icon: Map, label: 'Xem lộ trình', desc: 'Tổng quan 5 khóa học', bg: 'bg-primary-50', ic: 'text-primary-600' },
            { to: '/student/mock-tests', icon: Clock, label: 'Thi thử IELTS', desc: 'Mock Test mô phỏng thật', bg: 'bg-purple-50', ic: 'text-purple-600' },
            { to: '/student/placement-test', icon: Star, label: 'Placement Test', desc: 'Kiểm tra trình độ', bg: 'bg-amber-50', ic: 'text-amber-600' },
          ].map(({ to, icon: Icon, label, desc, bg, ic }) => (
            <Link key={to} to={to} className="card p-5 hover:border-primary-100 group">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${ic}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
                  <p className="text-xs text-gray-500 font-sans">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Course list ── */}
      <div>
        <h2 className="section-title mb-4">Lộ trình IELTS Conquest</h2>
        <div className="space-y-3">
          {roadmap.map((course, index) => (
            <div key={course.id}
              className={`card p-4 ${course.status === 'locked' ? 'opacity-55' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  course.status === 'completed' ? 'bg-emerald-500 text-white' :
                  course.status === 'active' ? 'text-white' : 'bg-gray-100 text-gray-400'
                }`} style={course.status === 'active' ? { background: 'linear-gradient(135deg, #e11d48, #be123c)' } : {}}>
                  {course.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                   course.status === 'locked' ? <Lock className="w-4 h-4" /> : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{course.title}</h3>
                    {course.status === 'completed' && <span className="badge-success text-xs flex-shrink-0">Hoàn thành</span>}
                    {course.status === 'active' && <span className="badge-primary text-xs flex-shrink-0">Đang học</span>}
                  </div>
                  <p className="text-xs text-gray-500 font-sans">{course.band_range}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full"
                      style={{ width: `${course.progress_percentage || 0}%`, background: 'linear-gradient(90deg, #e11d48, #be123c)' }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 w-8 text-right font-mono">
                    {Math.round(course.progress_percentage || 0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

