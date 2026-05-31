import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, BookOpen, Trophy, Clock, Flame, CheckCircle, XCircle,
  TrendingUp, FileText, Target, Calendar
} from 'lucide-react';

const statusLabels = {
  active: { text: 'Đang học', color: 'bg-blue-100 text-blue-700' },
  completed: { text: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700' },
  locked: { text: 'Khóa', color: 'bg-gray-100 text-gray-500' },
  not_enrolled: { text: 'Chưa ghi danh', color: 'bg-gray-50 text-gray-400' },
};

export default function AdminStudentProgressDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/students/${id}/progress`)
      .then(res => setData(res.data))
      .catch(err => {
        console.error(err);
        toast.error('Không thể tải chi tiết tiến độ');
        navigate('/admin/student-progress');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!data) return null;

  const { student, course_progress, summary, mock_test_attempts, study_streaks, recent_submissions } = data;

  return (
    <div className="page-container animate-fade-in">
      <button onClick={() => navigate('/admin/student-progress')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </button>

      {/* Student Header */}
      <div className="card-elevated p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl">
            {student.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">{student.full_name}</h1>
            <p className="text-sm text-gray-500">{student.email}{student.phone ? ` • ${student.phone}` : ''}</p>
            <p className="text-xs text-gray-400 mt-1">Tham gia: {new Date(student.created_at).toLocaleDateString('vi-VN')}</p>
          </div>
          <div className="ml-auto">
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${student.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {student.is_active ? 'Hoạt động' : 'Bị khóa'}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {[
          { icon: BookOpen, label: 'Bài học', value: summary.lessons_completed, color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: CheckCircle, label: 'HĐ đạt', value: summary.activities_passed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: FileText, label: 'Lượt thi', value: summary.mock_tests_taken, color: 'text-purple-600', bg: 'bg-purple-50' },
          { icon: Trophy, label: 'Band cao nhất', value: summary.best_band_score > 0 ? summary.best_band_score : '--', color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: Clock, label: 'Giờ học', value: `${Math.round(summary.total_minutes_studied / 60)}h`, color: 'text-rose-600', bg: 'bg-rose-50' },
          { icon: Flame, label: 'Streak', value: `${summary.current_streak} ngày`, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="card p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Progress */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" /> Tiến độ khóa học
          </h2>
          <div className="space-y-4">
            {course_progress?.map(course => {
              const st = statusLabels[course.status] || statusLabels.not_enrolled;
              return (
                <div key={course.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{course.title}</p>
                      <p className="text-xs text-gray-400">{course.level} • {course.band_range}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>
                      {st.text}
                    </span>
                  </div>
                  {course.status !== 'not_enrolled' && (
                    <>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full rounded-full transition-all ${course.status === 'completed' ? 'bg-emerald-500' : 'bg-primary-500'}`}
                          style={{ width: `${Math.min(100, course.progress_percentage)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{course.progress_percentage}%</span>
                        {course.enrolled_at && <span>Ghi danh: {new Date(course.enrolled_at).toLocaleDateString('vi-VN')}</span>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mock Test Results */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" /> Kết quả thi thử
          </h2>
          {mock_test_attempts?.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Chưa có lượt thi nào</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {mock_test_attempts?.map(attempt => (
                <div key={attempt.id} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{attempt.mock_test?.title || 'Bài thi'}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${attempt.status === 'submitted' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {attempt.status === 'submitted' ? 'Đã nộp' : 'Đang làm'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {attempt.mock_test?.test_type && <span className="font-medium">{attempt.mock_test.test_type}</span>}
                    {attempt.mock_test?.skill && <span>• {attempt.mock_test.skill}</span>}
                    {attempt.band_score != null && (
                      <span className="font-bold text-primary-600">Band {attempt.band_score}</span>
                    )}
                    {attempt.score != null && <span>• {parseFloat(attempt.score).toFixed(1)}%</span>}
                    <span className="ml-auto">{new Date(attempt.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Study Streak Calendar */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" /> Lịch sử học tập (90 ngày)
          </h2>
          {study_streaks?.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Chưa có dữ liệu học tập</div>
          ) : (
            <div>
              <div className="flex flex-wrap gap-1">
                {generateLast90Days().map(date => {
                  const streak = study_streaks?.find(s => s.streak_date === date);
                  const intensity = streak ? Math.min(4, Math.ceil((streak.minutes_studied || 0) / 30)) : 0;
                  const colors = ['bg-gray-100', 'bg-emerald-200', 'bg-emerald-300', 'bg-emerald-400', 'bg-emerald-600'];
                  return (
                    <div
                      key={date}
                      title={`${date}: ${streak ? `${streak.minutes_studied} phút` : 'Không học'}`}
                      className={`w-3 h-3 rounded-sm ${colors[intensity]}`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                <span>Ít</span>
                {['bg-gray-100', 'bg-emerald-200', 'bg-emerald-300', 'bg-emerald-400', 'bg-emerald-600'].map((c, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                ))}
                <span>Nhiều</span>
              </div>
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" /> Bài nộp gần đây
          </h2>
          {recent_submissions?.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Chưa có bài nộp nào</div>
          ) : (
            <div className="space-y-2">
              {recent_submissions?.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-2 px-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    {sub.submission_type === 'WRITING' ? (
                      <FileText className="w-4 h-4 text-amber-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-purple-500" />
                    )}
                    <span className="text-sm text-gray-700">{sub.submission_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      sub.status === 'graded' ? 'bg-emerald-50 text-emerald-700'
                        : sub.status === 'in_review' ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                    }`}>
                      {sub.status === 'graded' ? 'Đã chấm' : sub.status === 'in_review' ? 'Đang chấm' : 'Chờ chấm'}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(sub.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function generateLast90Days() {
  const days = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}
