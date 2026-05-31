import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Pencil, BookOpen, Layers, FileText, PlayCircle,
  Clock, Award, ChevronDown, ChevronRight, Video, File, Lightbulb,
  CheckCircle, Users, BarChart3, Eye, EyeOff
} from 'lucide-react';

const contentTypeIcons = {
  VIDEO: Video,
  DOCUMENT: File,
  EXAMPLE: Lightbulb,
};

const activityTypeLabels = {
  QUIZ: 'Quiz',
  FILL_IN_BLANK: 'Điền từ',
  FLASHCARD: 'Flashcard',
  MATCHING: 'Nối',
  LISTENING_DICTATION: 'Dictation',
  MINI_TEST: 'Mini Test',
  TIMED_PRACTICE: 'Luyện tập có thời gian',
  SPEAKING_RECORD_SHORT: 'Ghi âm nói',
  WRITING_SUBMISSION: 'Bài viết',
  SPEAKING_SUBMISSION: 'Bài nói',
};

const sectionTypeColors = {
  INPUT: 'bg-blue-100 text-blue-700',
  PRACTICE: 'bg-amber-100 text-amber-700',
  CHECKPOINT: 'bg-rose-100 text-rose-700',
};

const levelColors = {
  PRE_FOUNDATION: 'from-gray-500 to-gray-700',
  FOUNDATION: 'from-blue-500 to-blue-700',
  PRE_IELTS: 'from-emerald-500 to-emerald-700',
  BAND_6_5: 'from-amber-500 to-amber-700',
  ADVANCED: 'from-rose-500 to-rose-700',
};

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    api.get(`/courses/${id}`)
      .then(res => {
        setCourse(res.data.course);
        setUnits(res.data.units || []);
      })
      .catch(err => {
        console.error(err);
        toast.error('Không thể tải thông tin khóa học');
        navigate('/admin/courses');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) return null;

  // Count totals
  let totalLessons = 0, totalActivities = 0, totalSections = 0;
  units.forEach(u => {
    (u.sections || []).forEach(s => {
      totalSections++;
      totalLessons += (s.lessons || []).length;
      totalActivities += (s.activities || []).length;
    });
  });

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in">
      <button onClick={() => navigate('/admin/courses')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </button>

      {/* Course Header */}
      <div className="card-elevated overflow-hidden mb-6">
        <div className={`h-36 bg-gradient-to-br ${levelColors[course.level] || 'from-primary-500 to-primary-700'} flex items-end p-6`}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 backdrop-blur text-white text-xs px-3 py-1 rounded-full">{course.band_range}</span>
              <span className="bg-white/20 backdrop-blur text-white text-xs px-3 py-1 rounded-full">{course.level}</span>
              <span className={`text-xs px-3 py-1 rounded-full ${course.is_active ? 'bg-emerald-400/30 text-white' : 'bg-red-400/30 text-white'}`}>
                {course.is_active ? 'Hoạt động' : 'Đã ẩn'}
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">{course.title}</h1>
          </div>
        </div>
        <div className="p-6">
          {course.description && <p className="text-gray-600 text-sm mb-4">{course.description}</p>}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Layers className="w-4 h-4 text-gray-400" />
              <span>{units.length} Units</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>{totalSections} Sections</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span>{totalLessons} Lessons</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <PlayCircle className="w-4 h-4 text-gray-400" />
              <span>{totalActivities} Activities</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award className="w-4 h-4 text-gray-400" />
              <span>Checkpoint: {course.checkpoint_passing_score || 70}%</span>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Link to={`/admin/courses/${id}/edit`} className="btn-primary gap-2 text-sm">
              <Pencil className="w-4 h-4" /> Chỉnh sửa
            </Link>
          </div>
        </div>
      </div>

      {/* Unit Tree */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-gray-800 text-lg mb-5 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          Cấu trúc nội dung
        </h2>

        {units.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>Khóa học chưa có nội dung</p>
          </div>
        ) : (
          <div className="space-y-3">
            {units.map((unit, ui) => (
              <div key={unit.id} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Unit header */}
                <button
                  onClick={() => toggleUnit(unit.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  {expandedUnits[unit.id] ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {ui + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{unit.title}</p>
                    {unit.skill_type && <span className="text-xs text-gray-400">{unit.skill_type}</span>}
                  </div>
                  <span className="text-xs text-gray-400">{(unit.sections || []).length} sections</span>
                </button>

                {/* Unit body */}
                {expandedUnits[unit.id] && (
                  <div className="border-t border-gray-100 bg-white">
                    {unit.description && (
                      <p className="text-xs text-gray-500 px-4 pt-3">{unit.description}</p>
                    )}
                    <div className="p-3 space-y-2">
                      {(unit.sections || []).map((section, si) => (
                        <div key={section.id} className="border border-gray-100 rounded-lg overflow-hidden">
                          {/* Section header */}
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                          >
                            {expandedSections[section.id] ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sectionTypeColors[section.section_type] || 'bg-gray-100'}`}>
                              {section.section_type}
                            </span>
                            <span className="text-sm font-medium text-gray-800 flex-1">{section.title}</span>
                            <span className="text-xs text-gray-400">
                              {(section.lessons || []).length}L + {(section.activities || []).length}A
                            </span>
                          </button>

                          {/* Section body */}
                          {expandedSections[section.id] && (
                            <div className="border-t border-gray-50 px-3 py-2 space-y-1">
                              {/* Lessons */}
                              {(section.lessons || []).map(lesson => {
                                const LIcon = contentTypeIcons[lesson.content_type] || File;
                                return (
                                  <div key={lesson.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-blue-50 text-sm">
                                    <LIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    <span className="text-gray-700 flex-1">{lesson.title}</span>
                                    <span className="text-xs text-gray-400">{lesson.content_type}</span>
                                    {lesson.duration_minutes && (
                                      <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                        <Clock className="w-3 h-3" />{lesson.duration_minutes}m
                                      </span>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Activities */}
                              {(section.activities || []).map(activity => (
                                <div key={activity.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-amber-50 text-sm">
                                  <PlayCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                  <span className="text-gray-700 flex-1">{activity.title}</span>
                                  <span className="text-xs text-gray-400">{activityTypeLabels[activity.activity_type] || activity.activity_type}</span>
                                  {activity.passing_score && (
                                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                      <Award className="w-3 h-3" />{activity.passing_score}%
                                    </span>
                                  )}
                                  {activity.time_limit_minutes && (
                                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                      <Clock className="w-3 h-3" />{activity.time_limit_minutes}m
                                    </span>
                                  )}
                                </div>
                              ))}

                              {(section.lessons || []).length === 0 && (section.activities || []).length === 0 && (
                                <p className="text-xs text-gray-300 text-center py-2">Section trống</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {(unit.sections || []).length === 0 && (
                        <p className="text-xs text-gray-300 text-center py-3">Unit chưa có section</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
