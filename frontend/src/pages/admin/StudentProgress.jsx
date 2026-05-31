import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Search, Users, BookOpen, Trophy, Clock, TrendingUp, Eye, Flame, CheckCircle, FileText, Target } from 'lucide-react';

export default function AdminStudentProgress() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0 });

  const loadStudents = (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (search) params.set('search', search);

    api.get(`/admin/students/progress?${params}`)
      .then(res => {
        setStudents(res.data.students || []);
        setPagination(res.data.pagination || { total: 0, page: 1, pages: 0 });
      })
      .catch(err => {
        console.error(err);
        toast.error('Không thể tải dữ liệu tiến độ');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStudents(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadStudents(1);
  };

  const getProgressColor = (pct) => {
    if (pct >= 80) return 'text-emerald-600 bg-emerald-50';
    if (pct >= 50) return 'text-blue-600 bg-blue-50';
    if (pct >= 20) return 'text-amber-600 bg-amber-50';
    return 'text-gray-500 bg-gray-50';
  };

  const getProgressBarColor = (pct) => {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-blue-500';
    if (pct >= 20) return 'bg-amber-500';
    return 'bg-gray-400';
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">Tiến độ học sinh</h1>
        <p className="text-sm text-gray-500 mt-1">Theo dõi tiến độ học tập của {pagination.total} học sinh</p>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">Tìm kiếm</button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Không tìm thấy học sinh nào</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {students.map(student => (
              <div key={student.id} className="card-elevated p-5 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Student info */}
                  <div className="flex items-center gap-3 lg:w-64 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                      {student.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{student.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">{student.email}</p>
                    </div>
                  </div>

                  {/* Progress stats */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="text-xs">Khóa học</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{student.progress.courses_completed}/{student.progress.courses_enrolled}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-xs">Tiến độ TB</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${getProgressBarColor(student.progress.avg_progress)}`} style={{ width: `${Math.min(100, student.progress.avg_progress)}%` }} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{student.progress.avg_progress}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                        <Trophy className="w-3.5 h-3.5" />
                        <span className="text-xs">Band cao nhất</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {student.progress.best_band_score > 0 ? student.progress.best_band_score : '--'}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs">Giờ học</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{Math.round(student.progress.total_minutes_studied / 60)}h</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span className="text-xs">Ngày hoạt động</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{student.progress.active_days_last_30}</p>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    <Link
                      to={`/admin/student-progress/${student.id}`}
                      className="btn-outline gap-2 text-sm"
                    >
                      <Eye className="w-4 h-4" /> Chi tiết
                    </Link>
                  </div>
                </div>

                {/* Bottom detail row */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-blue-400" /> {student.progress.lessons_completed} bài học hoàn thành</span>
                  <span className="inline-flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {student.progress.activities_passed} hoạt động đạt</span>
                  <span className="inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-purple-400" /> {student.progress.mock_tests_taken} bài thi thử</span>
                  <span className="inline-flex items-center gap-1"><Target className="w-3.5 h-3.5 text-rose-400" /> Điểm TB: {student.progress.avg_activity_score}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => loadStudents(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    pagination.page === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
