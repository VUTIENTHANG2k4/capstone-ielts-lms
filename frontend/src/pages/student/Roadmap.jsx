import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { CheckCircle2, Lock, Circle, ArrowRight, Trophy, Star, Map, Target } from 'lucide-react';

const courseColors = [
  { bg: 'from-rose-500 to-pink-600', light: 'bg-rose-50', text: 'text-rose-600' },
  { bg: 'from-amber-500 to-orange-600', light: 'bg-amber-50', text: 'text-amber-600' },
  { bg: 'from-emerald-500 to-green-600', light: 'bg-emerald-50', text: 'text-emerald-600' },
  { bg: 'from-blue-500 to-indigo-600', light: 'bg-blue-50', text: 'text-blue-600' },
  { bg: 'from-purple-500 to-violet-600', light: 'bg-purple-50', text: 'text-purple-600' },
];

export default function Roadmap() {
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/progress/roadmap')
      .then(res => setRoadmap(res.data.roadmap || []))
      .catch(console.error)
      .finally(() => setLoading(false));
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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
          <Map className="w-9 h-9 text-primary-600" /> IELTS Conquest Roadmap
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Hành trình chinh phục IELTS từ mất gốc đến 7.5+. Mỗi Course là một bước tiến vững chắc.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div className="space-y-8">
            {roadmap.map((course, index) => {
              const color = courseColors[index];
              const isLocked = course.status === 'locked';
              const isCompleted = course.status === 'completed';
              const isActive = course.status === 'active';

              return (
                <div key={course.id} className={`relative pl-20 ${isLocked ? 'opacity-50' : ''} animate-slide-up`}
                  style={{ animationDelay: `${index * 100}ms` }}>
                  {/* Timeline node */}
                  <div className={`absolute left-4 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    isCompleted ? 'bg-emerald-500' :
                    isActive ? `bg-gradient-to-r ${color.bg}` :
                    'bg-gray-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    )}
                  </div>

                  {/* Card */}
                  <div className={`card-elevated p-6 ${isActive ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`badge ${
                            isCompleted ? 'bg-emerald-100 text-emerald-700' :
                            isActive ? 'bg-primary-100 text-primary-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {isCompleted ? '✓ Hoàn thành' : isActive ? '▶ Đang học' : '🔒 Khóa'}
                          </span>
                          <span className="text-sm text-gray-400">{course.band_range}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">{course.description}</p>

                        {(isActive || isCompleted) && (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-100 rounded-full h-2.5 max-w-xs">
                              <div
                                className={`rounded-full h-2.5 transition-all duration-700 ${
                                  isCompleted ? 'bg-emerald-500' : 'bg-primary-600'
                                }`}
                                style={{ width: `${course.progress_percentage || 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-600">
                              {(course.progress_percentage || 0).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {!isLocked && (
                        <Link
                          to={`/student/courses/${course.id}`}
                          className={`${isActive ? 'btn-primary' : 'btn-secondary'} gap-2 text-sm flex-shrink-0`}
                        >
                          {isActive ? 'Tiếp tục' : 'Xem lại'}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Final goal */}
            <div className="relative pl-20 animate-slide-up" style={{ animationDelay: '500ms' }}>
              <div className="absolute left-4 w-8 h-8 rounded-full bg-gradient-to-r from-accent-400 to-accent-500 flex items-center justify-center z-10">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gradient-to-r from-accent-50 to-amber-50 rounded-2xl p-6 border border-accent-100">
                <h3 className="text-lg font-bold text-accent-800 mb-1 flex items-center gap-2"><Target className="w-5 h-5 text-accent-600" /> Mục tiêu cuối cùng</h3>
                <p className="text-sm text-accent-700">IELTS 7.5+ - Sẵn sàng cho mọi thử thách!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
