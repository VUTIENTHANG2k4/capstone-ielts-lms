import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { BookOpen, FileText, Play, CheckCircle2, Lock, ChevronDown, ChevronRight, ArrowLeft, PenTool, Trophy } from 'lucide-react';

const sectionTypeConfig = {
  INPUT:      { Icon: BookOpen, label: 'Kiến thức',  color: 'text-blue-500' },
  PRACTICE:   { Icon: PenTool,  label: 'Luyện tập',  color: 'text-emerald-500' },
  CHECKPOINT: { Icon: Trophy,   label: 'Kiểm tra',   color: 'text-amber-500' },
};

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const prefix = isTeacher ? '/teacher' : '/student';
  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data.course);
        setUnits(res.data.units || []);
        setEnrollment(res.data.enrollment);
        if (res.data.units?.length > 0) {
          setExpandedUnit(res.data.units[0].id);
        }
      } catch (err) {
        toast.error('Không thể tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    try {
      const res = await api.post(`/courses/${id}/enroll`);
      setEnrollment(res.data.enrollment);
      toast.success('Đăng ký khóa học thành công!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không thể đăng ký');
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page-container text-center py-16">
        <p className="text-gray-500">Không tìm thấy khóa học</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </button>

      {/* Course Header */}
      <div className="gradient-hero rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="badge bg-white/20 text-white mb-3">{course.band_range}</span>
            <h1 className="text-3xl font-display font-bold text-white mb-2">{course.title}</h1>
            <p className="text-primary-200 max-w-2xl">{course.description}</p>
            {enrollment && (
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 bg-white/20 rounded-full h-2.5 max-w-xs">
                  <div
                    className="bg-white rounded-full h-2.5 transition-all duration-500"
                    style={{ width: `${enrollment.progress_percentage || 0}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-white">
                  {(enrollment.progress_percentage || 0).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
          {!enrollment && !isTeacher && (
            <button onClick={handleEnroll} className="btn-accent gap-2 flex-shrink-0">
              <Play className="w-4 h-4" />
              Đăng ký ngay
            </button>
          )}
        </div>
      </div>

      {/* Units */}
      <h2 className="section-title mb-4">Nội dung khóa học</h2>
      <div className="space-y-4">
        {units.map((unit, unitIndex) => (
          <div key={unit.id} className="card overflow-hidden">
            <button
              onClick={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)}
              className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-bold">{unitIndex + 1}</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{unit.title}</h3>
                  {unit.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{unit.description}</p>
                  )}
                  {unit.skill_type && (
                    <span className="badge-gray text-xs mt-1">{unit.skill_type}</span>
                  )}
                </div>
              </div>
              {expandedUnit === unit.id ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedUnit === unit.id && (
              <div className="border-t border-gray-100 animate-slide-down">
                {unit.sections?.map((section) => (
                  <div key={section.id} className="border-b border-gray-50 last:border-0">
                    <div className="px-5 py-3 bg-gray-50">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        {(() => { const cfg = sectionTypeConfig[section.section_type] || sectionTypeConfig.INPUT; const Icon = cfg.Icon; return <Icon className={`w-4 h-4 ${cfg.color}`} />; })()}
                        {(sectionTypeConfig[section.section_type] || sectionTypeConfig.INPUT).label}: {section.title}
                      </h4>
                    </div>
                    <div className="px-5 py-2">
                      {/* Lessons */}
                      {section.lessons?.map((lesson) => (
                        <Link
                          key={lesson.id}
                          to={(enrollment || isTeacher) ? `${prefix}/lessons/${lesson.id}` : '#'}
                          className={`flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors ${!(enrollment || isTeacher) ? 'pointer-events-none opacity-50' : ''}`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            {lesson.content_type === 'VIDEO' ? (
                              <Play className="w-4 h-4 text-blue-600" />
                            ) : (
                              <FileText className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{lesson.title}</p>
                            <p className="text-xs text-gray-400">
                              {lesson.content_type} {lesson.duration_minutes ? `• ${lesson.duration_minutes} phút` : ''}
                            </p>
                          </div>
                        </Link>
                      ))}
                      {/* Activities */}
                      {section.activities?.map((activity) => (
                        <Link
                          key={activity.id}
                          to={enrollment ? `/student/activities/${activity.id}` : '#'}
                          className={`flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors ${(!enrollment || isTeacher) ? 'pointer-events-none opacity-50' : ''}`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                            <p className="text-xs text-gray-400">
                              {activity.activity_type.replace(/_/g, ' ')}
                              {activity.passing_score ? ` • Đạt: ${activity.passing_score}%` : ''}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
