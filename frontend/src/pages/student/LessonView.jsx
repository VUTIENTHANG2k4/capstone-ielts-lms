import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, Play, FileText, BookOpen } from 'lucide-react';

function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function LessonView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/lessons/${id}`)
      .then(res => setLesson(res.data.lesson))
      .catch(() => toast.error('Không thể tải bài học'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleComplete = async () => {
    try {
      await api.post(`/lessons/${id}/complete`);
      setLesson(prev => ({ ...prev, progress: { status: 'completed' } }));
      toast.success('Đã hoàn thành bài học!');
    } catch (err) {
      toast.error('Lỗi khi đánh dấu hoàn thành');
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!lesson) return <div className="page-container text-center py-16"><p className="text-gray-500">Không tìm thấy bài học</p></div>;

  return (
    <div className="page-container animate-fade-in max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      {/* Lesson Header */}
      <div className="card mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              {lesson.content_type === 'VIDEO' ? <Play className="w-5 h-5 text-primary-600" /> :
               lesson.content_type === 'DOCUMENT' ? <FileText className="w-5 h-5 text-primary-600" /> :
               <BookOpen className="w-5 h-5 text-primary-600" />}
            </div>
            <div>
              <span className="badge-primary text-xs">{lesson.content_type}</span>
              {lesson.duration_minutes && <span className="text-xs text-gray-400 ml-2">{lesson.duration_minutes} phút</span>}
            </div>
            {lesson.progress?.status === 'completed' && (
              <span className="badge-success ml-auto">✓ Đã hoàn thành</span>
            )}
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900">{lesson.title}</h1>
        </div>

        {/* Content */}
        <div className="p-6">
          {lesson.content_type === 'VIDEO' && lesson.content_url && (() => {
            const ytId = extractYouTubeId(lesson.content_url);
            if (ytId) {
              return (
                <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={lesson.title}
                  />
                </div>
              );
            }
            return (
              <div className="mb-6">
                <video
                  controls
                  className="w-full rounded-xl bg-gray-900"
                  src={lesson.content_url}
                  title={lesson.title}
                >
                  Trình duyệt của bạn không hỗ trợ phát video.
                </video>
              </div>
            );
          })()}

          {lesson.content_text && (
            <div className="markdown-content prose max-w-none">
              <ReactMarkdown>{lesson.content_text}</ReactMarkdown>
            </div>
          )}

          {!lesson.content_text && !lesson.content_url && (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nội dung bài học đang được cập nhật</p>
            </div>
          )}
        </div>

        {/* Complete button — only for students */}
        {user?.role === 'student' && lesson.progress?.status !== 'completed' && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <button onClick={handleComplete} className="btn-primary gap-2 w-full sm:w-auto">
              <CheckCircle2 className="w-5 h-5" />
              Đánh dấu hoàn thành
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
