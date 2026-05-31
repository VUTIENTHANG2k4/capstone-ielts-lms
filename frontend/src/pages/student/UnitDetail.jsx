import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, BookOpen, Play, FileText, CheckCircle2, Circle, PenTool, Trophy } from 'lucide-react';

const sectionTypeConfig = {
  INPUT:      { Icon: BookOpen, color: 'text-blue-500' },
  PRACTICE:   { Icon: PenTool,  color: 'text-emerald-500' },
  CHECKPOINT: { Icon: Trophy,   color: 'text-amber-500' },
};

export default function UnitDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const prefix = user?.role === 'teacher' ? '/teacher' : '/student';
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/units/${id}`)
      .then(res => setUnit(res.data.unit))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!unit) return <div className="page-container text-center py-16"><p className="text-gray-500">Không tìm thấy Unit</p></div>;

  return (
    <div className="page-container animate-fade-in">
      <Link to={`${prefix}/courses/${unit.course_id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">{unit.title}</h1>
        {unit.description && <p className="text-gray-500">{unit.description}</p>}
      </div>

      <div className="space-y-6">
        {unit.sections?.map((section) => (
          <div key={section.id} className="card">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                {(() => { const cfg = sectionTypeConfig[section.section_type] || sectionTypeConfig.INPUT; const Icon = cfg.Icon; return <Icon className={`w-4 h-4 ${cfg.color}`} />; })()}
                {section.title}
              </h2>
            </div>
            <div className="p-4 space-y-2">
              {section.lessons?.map(lesson => (
                <Link
                  key={lesson.id}
                  to={`${prefix}/lessons/${lesson.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    lesson.progress?.status === 'completed' ? 'bg-emerald-100' : 'bg-blue-50'
                  }`}>
                    {lesson.progress?.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : lesson.content_type === 'VIDEO' ? (
                      <Play className="w-4 h-4 text-blue-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{lesson.title}</p>
                    <p className="text-xs text-gray-400">{lesson.content_type} {lesson.duration_minutes ? `• ${lesson.duration_minutes} phút` : ''}</p>
                  </div>
                </Link>
              ))}
              {section.activities?.map(activity => (
                <Link
                  key={activity.id}
                  to={`/student/activities/${activity.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activity.best_attempt?.is_passed ? 'bg-emerald-100' : 'bg-amber-50'
                  }`}>
                    {activity.best_attempt?.is_passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <p className="text-xs text-gray-400">
                      {activity.activity_type.replace(/_/g, ' ')}
                      {activity.best_attempt ? ` • Điểm cao nhất: ${activity.best_attempt.score?.toFixed(0)}%` : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
