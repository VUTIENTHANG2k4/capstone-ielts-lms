import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, Star } from 'lucide-react';

export default function GradeSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    band_score: '',
    task_achievement: '',
    coherence_cohesion: '',
    lexical_resource: '',
    grammar_accuracy: '',
    feedback_text: '',
  });

  useEffect(() => {
    api.get(`/submissions/${id}`)
      .then(res => {
        setSubmission(res.data.submission);
        const fb = res.data.feedback || res.data.submission?.feedback;
        if (fb) {
          const c = fb.criteria_scores || {};
          setForm({
            band_score: fb.band_score || '',
            task_achievement: c.task_achievement || '',
            coherence_cohesion: c.coherence_cohesion || '',
            lexical_resource: c.lexical_resource || '',
            grammar_accuracy: c.grammar_accuracy || '',
            feedback_text: fb.feedback_text || '',
          });
        }
      })
      .catch(() => toast.error('Không thể tải bài nộp'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/submissions/${id}/grade`, {
        band_score: parseFloat(form.band_score),
        task_achievement: parseFloat(form.task_achievement),
        coherence_cohesion: parseFloat(form.coherence_cohesion),
        lexical_resource: parseFloat(form.lexical_resource),
        grammar_accuracy: parseFloat(form.grammar_accuracy),
        feedback_text: form.feedback_text,
      });
      toast.success('Chấm bài thành công!');
      navigate('/teacher/submissions');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi chấm bài');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!submission) return <div className="page-container text-center"><p className="text-gray-500">Không tìm thấy bài nộp</p></div>;

  return (
    <div className="page-container animate-fade-in max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Content */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-display font-bold text-gray-900">Bài nộp của học viên</h2>
            <p className="text-sm text-gray-500 mt-1">
              {submission.user_name} • {new Date(submission.submitted_at).toLocaleString('vi-VN')}
            </p>
          </div>
          <div className="p-6">
            <div className="prose max-w-none">
              <div className="bg-gray-50 rounded-xl p-6 text-gray-800 whitespace-pre-wrap leading-relaxed min-h-[300px]">
                {submission.content?.text || JSON.stringify(submission.content)}
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Số từ: {(submission.content?.text || '').split(/\s+/).filter(Boolean).length}
            </p>
          </div>
        </div>

        {/* Grading Form */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-display font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-accent-500" /> Chấm điểm
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Band Score tổng</label>
              <input
                type="number" step="0.5" min="0" max="9" required
                value={form.band_score} onChange={e => setForm({ ...form, band_score: e.target.value })}
                className="input-field" placeholder="0 - 9"
              />
            </div>

            {[
              { key: 'task_achievement', label: 'Task Achievement' },
              { key: 'coherence_cohesion', label: 'Coherence & Cohesion' },
              { key: 'lexical_resource', label: 'Lexical Resource' },
              { key: 'grammar_accuracy', label: 'Grammatical Range & Accuracy' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="number" step="0.5" min="0" max="9" required
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="input-field" placeholder="0 - 9"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nhận xét chi tiết</label>
              <textarea
                value={form.feedback_text}
                onChange={e => setForm({ ...form, feedback_text: e.target.value })}
                className="input-field min-h-[120px] resize-y"
                placeholder="Nhận xét về bài viết..."
                required
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full gap-2">
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Gửi nhận xét
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
