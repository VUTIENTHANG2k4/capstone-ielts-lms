import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, CheckCircle2, XCircle, RotateCcw, Clock, Send,
  Upload, Loader2, Mic, Link as LinkIcon, Volume2,
} from 'lucide-react';

// ── Inline file upload for speaking submissions ────────────────────────────────
function AudioUploadBtn({ onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUploaded(res.data.url);
      toast.success('Upload thành công: ' + file.name);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload thất bại');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <label className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl
      text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition select-none
      ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
      {uploading ? 'Đang upload...' : 'Upload file MP3'}
      <input type="file" accept="audio/*" onChange={handleUpload} className="hidden" />
    </label>
  );
}

export default function ActivityView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const [writingText, setWritingText] = useState('');
  const [speakingUrl, setSpeakingUrl] = useState('');

  useEffect(() => {
    api.get(`/activities/${id}`)
      .then(res => setActivity(res.data.activity))
      .catch(() => toast.error('Không thể tải bài tập'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    // Validate speaking before submit
    if (activity?.activity_type === 'SPEAKING_SUBMISSION' && !speakingUrl.trim()) {
      toast.error('Vui lòng nhập link hoặc upload file audio trước khi nộp bài');
      return;
    }

    setSubmitting(true);
    try {
      let submitAnswers = answers;

      if (activity.activity_type === 'WRITING_SUBMISSION') {
        submitAnswers = { text: writingText };
      } else if (activity.activity_type === 'SPEAKING_SUBMISSION') {
        submitAnswers = { url: speakingUrl.trim() };
      } else if (activity.activity_type === 'FLASHCARD') {
        submitAnswers = { completed: true };
      }

      const res = await api.post(`/activities/${id}/submit`, { answers: submitAnswers });
      setResult(res.data);

      if (res.data.submission) {
        toast.success('Bài nộp đã được gửi đến giáo viên để chấm điểm!');
      } else if (res.data.is_passed) {
        toast.success(`Chúc mừng! Bạn đạt ${res.data.score?.toFixed(0)}%`);
      } else {
        toast.error(`Chưa đạt: ${res.data.score?.toFixed(0)}%. Cần ${activity.passing_score}%`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi nộp bài');
    } finally {
      setSubmitting(false);
    }
  };

  const resetActivity = () => {
    setAnswers({});
    setResult(null);
    setFlippedCards({});
    setWritingText('');
    setSpeakingUrl('');
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="page-container text-center py-16">
        <p className="text-gray-500">Không tìm thấy bài tập</p>
      </div>
    );
  }

  const content = activity.content || {};

  // Determine result banner style: submission types always show success
  const isSubmissionType = result?.submission != null;
  const resultBgClass = isSubmissionType || result?.is_passed
    ? 'bg-emerald-50 border-emerald-200'
    : 'bg-red-50 border-red-200';
  const resultIcon = isSubmissionType || result?.is_passed
    ? <CheckCircle2 className="w-8 h-8 text-emerald-600" />
    : <XCircle className="w-8 h-8 text-red-600" />;
  const resultTitle = isSubmissionType
    ? 'Đã nộp bài thành công!'
    : result?.is_passed
    ? 'Chúc mừng! Bạn đã đạt!'
    : 'Chưa đạt';

  return (
    <div className="page-container animate-fade-in max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      {/* Activity Header */}
      <div className="card mb-6">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="badge-primary">{activity.activity_type.replace(/_/g, ' ')}</span>
            {activity.time_limit_minutes && (
              <span className="badge-warning flex items-center gap-1">
                <Clock className="w-3 h-3" /> {activity.time_limit_minutes} phút
              </span>
            )}
            {activity.passing_score > 0 && (
              <span className="badge-gray">Đạt: {activity.passing_score}%</span>
            )}
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">{activity.title}</h1>
          {activity.instructions && <p className="text-gray-600">{activity.instructions}</p>}
          {activity.attempts_used > 0 && (
            <p className="text-sm text-gray-400 mt-2">
              Đã làm: {activity.attempts_used} / {activity.max_attempts || '∞'} lần
            </p>
          )}
        </div>
      </div>

      {/* Result Banner */}
      {result && (
        <div className={`card mb-6 p-6 border-2 ${resultBgClass}`}>
          <div className="flex items-center gap-3">
            {resultIcon}
            <div>
              <h3 className={`font-bold text-lg ${isSubmissionType || result.is_passed ? 'text-emerald-800' : 'text-red-800'}`}>
                {resultTitle}
              </h3>
              {isSubmissionType && (
                <p className="text-emerald-600 text-sm mt-0.5">
                  Giáo viên sẽ chấm và phản hồi bài của bạn sớm nhất có thể.
                </p>
              )}
              {!isSubmissionType && result.score !== undefined && result.score !== null && (
                <p className={result.is_passed ? 'text-emerald-600' : 'text-red-600'}>
                  Điểm: {result.score?.toFixed(0)}% ({result.correct}/{result.total} câu đúng)
                </p>
              )}
            </div>
          </div>
          <button onClick={resetActivity} className="btn-secondary gap-2 mt-4">
            <RotateCcw className="w-4 h-4" /> Làm lại
          </button>
        </div>
      )}

      {/* Activity Content */}
      {!result && (
        <div className="space-y-4">

          {/* QUIZ / MINI_TEST / TIMED_PRACTICE */}
          {['QUIZ', 'MINI_TEST', 'TIMED_PRACTICE'].includes(activity.activity_type) && content.questions?.map((q, qIndex) => (
            <div key={q.id || qIndex} className="card p-6">
              <p className="font-semibold text-gray-900 mb-4">
                <span className="text-primary-600">Câu {qIndex + 1}.</span> {q.question}
              </p>
              <div className="space-y-2">
                {q.options?.map((option, oIndex) => (
                  <label
                    key={oIndex}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${
                      answers[qIndex] === oIndex
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${qIndex}`}
                      checked={answers[qIndex] === oIndex}
                      onChange={() => setAnswers({ ...answers, [qIndex]: oIndex })}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* FILL_IN_BLANK */}
          {activity.activity_type === 'FILL_IN_BLANK' && content.questions?.map((q, qIndex) => (
            <div key={qIndex} className="card p-6">
              <p className="font-semibold text-gray-900 mb-2">
                <span className="text-primary-600">Câu {qIndex + 1}.</span> {q.sentence}
              </p>
              {q.hint && <p className="text-sm text-gray-400 mb-3">Gợi ý: {q.hint}</p>}
              <input
                type="text"
                value={answers[qIndex] || ''}
                onChange={e => setAnswers({ ...answers, [qIndex]: e.target.value })}
                className="input-field max-w-sm"
                placeholder="Nhập câu trả lời..."
              />
            </div>
          ))}

          {/* FLASHCARD */}
          {activity.activity_type === 'FLASHCARD' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {content.cards?.map((card, i) => (
                <div
                  key={i}
                  onClick={() => setFlippedCards({ ...flippedCards, [i]: !flippedCards[i] })}
                  className="card-elevated p-8 cursor-pointer text-center min-h-[160px] flex items-center justify-center hover:scale-[1.02] transition-transform"
                >
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {flippedCards[i] ? card.back : card.front}
                    </p>
                    <p className="text-xs text-gray-400 mt-3">
                      {flippedCards[i] ? 'Click để xem mặt trước' : 'Click để lật thẻ'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MATCHING */}
          {activity.activity_type === 'MATCHING' && (
            <div className="card p-6">
              <p className="text-sm text-gray-500 mb-4">Nối mỗi mục bên trái với mục đúng bên phải.</p>
              <div className="space-y-3">
                {content.pairs?.map((pair, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex-1 p-3 bg-primary-50 rounded-xl text-center font-medium text-primary-700">
                      {pair.left}
                    </div>
                    <span className="text-gray-400">→</span>
                    <select
                      value={answers[i] ?? ''}
                      onChange={e => setAnswers({ ...answers, [i]: parseInt(e.target.value) })}
                      className="input-field flex-1"
                    >
                      <option value="">Chọn...</option>
                      {content.pairs.map((p, j) => (
                        <option key={j} value={j}>{p.right}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WRITING_SUBMISSION */}
          {activity.activity_type === 'WRITING_SUBMISSION' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">Bài viết của bạn</label>
                <span className={`text-xs font-semibold ${
                  writingText.split(/\s+/).filter(Boolean).length >= (content.min_words || 0)
                    ? 'text-emerald-600'
                    : 'text-gray-400'
                }`}>
                  {writingText.split(/\s+/).filter(Boolean).length} từ
                  {content.min_words ? ` / tối thiểu ${content.min_words}` : ''}
                </span>
              </div>
              <textarea
                value={writingText}
                onChange={e => setWritingText(e.target.value)}
                className="input-field min-h-[300px] resize-y leading-relaxed"
                placeholder="Viết bài của bạn ở đây..."
              />
            </div>
          )}

          {/* SPEAKING_SUBMISSION */}
          {activity.activity_type === 'SPEAKING_SUBMISSION' && (
            <div className="card p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-gray-800">Nộp bài nói của bạn</h3>
              </div>

              {/* URL input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <LinkIcon className="w-4 h-4 inline mr-1 text-gray-400" />
                  Link audio (Google Drive, OneDrive, URL trực tiếp...)
                </label>
                <input
                  type="url"
                  value={speakingUrl}
                  onChange={e => setSpeakingUrl(e.target.value)}
                  className="input-field"
                  placeholder="https://drive.google.com/file/d/... hoặc link MP3"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Đảm bảo file được chia sẻ "Anyone with the link can view"
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">HOẶC</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* File upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-1 text-gray-400" />
                  Upload file MP3 trực tiếp
                </label>
                <AudioUploadBtn onUploaded={url => setSpeakingUrl(url)} />
                <p className="text-xs text-gray-400 mt-1">Hỗ trợ: MP3, WAV, OGG. Tối đa 50MB</p>
              </div>

              {/* Audio preview */}
              {speakingUrl && (
                <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-semibold text-primary-700">Xem trước bài nộp</span>
                  </div>
                  {speakingUrl.match(/\.(mp3|wav|ogg|webm|m4a)(\?.*)?$/i) ? (
                    <audio controls src={speakingUrl} className="w-full" />
                  ) : (
                    <a href={speakingUrl} target="_blank" rel="noopener noreferrer"
                      className="text-primary-600 underline text-sm break-all">
                      {speakingUrl}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submit button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary gap-2 px-8"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Nộp bài
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
