import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Users, FileCheck, BarChart3, Clock, ArrowRight } from 'lucide-react';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ pendingSubmissions: 0, totalStudents: 0, gradedToday: 0 });
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [subRes] = await Promise.all([
          api.get('/submissions?status=pending&limit=10'),
        ]);
        const subs = subRes.data.submissions || [];
        setPendingList(subs);
        setStats(prev => ({ ...prev, pendingSubmissions: subRes.data.total || subs.length }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
        <p className="text-gray-500">Quản lý bài nộp và theo dõi tiến độ học viên</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Bài chờ chấm', value: stats.pendingSubmissions, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Tổng học viên', value: stats.totalStudents, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Đã chấm hôm nay', value: stats.gradedToday, icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="card-elevated p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending submissions */}
      <div className="card">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-display font-bold text-gray-900">Bài chờ chấm</h2>
          <Link to="/teacher/submissions" className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {pendingList.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            Không có bài chờ chấm
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingList.map(sub => (
              <Link
                key={sub.id}
                to={`/teacher/submissions/${sub.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{sub.user_name || 'Học viên'}</p>
                    <p className="text-sm text-gray-500">{sub.activity_title || 'Bài tập'}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge-warning text-xs">Chờ chấm</span>
                    <p className="text-xs text-gray-400 mt-1">{new Date(sub.submitted_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
