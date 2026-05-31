import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Trophy, Target, CheckCircle2, XCircle, ArrowLeft, ArrowRight, PenTool, Clock, Mic, Link as LinkIcon } from 'lucide-react';

export default function MockTestResult() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/mock-tests/attempts/${id}/result`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!data?.attempt) {
    return (
      <div className="page-container text-center">
        <p className="text-gray-500">Không tìm thấy kết quả</p>
      </div>
    );
  }

  const { attempt, mock_test, questions, recommended_course } = data;
  const isWriting = mock_test?.skill === 'WRITING';
  const isSpeaking = mock_test?.skill === 'SPEAKING';
  const isPendingReview = isWriting || isSpeaking;
  const writingTasks = mock_test?.sections_config?.writing?.tasks || [];

  return (
    <div className="page-container animate-fade-in max-w-3xl mx-auto">
      <Link to="/student/mock-tests" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Danh sách bài thi
      </Link>

      {/* ── Result Card ──────────────────────────────────────── */}
      <div className="card-elevated overflow-hidden mb-8">
        <div className="gradient-hero p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            {isWriting
              ? <PenTool className="w-10 h-10 text-accent-300" />
              : isSpeaking
              ? <Mic className="w-10 h-10 text-accent-300" />
              : <Trophy className="w-10 h-10 text-accent-300" />}
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Kết quả bài thi</h1>
          <p className="text-primary-200">{mock_test?.title}</p>
        </div>

        <div className="p-8">
          {isPendingReview ? (
            /* ── Writing / Speaking result: pending review ── */
            <div className="text-center py-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isSpeaking ? 'bg-orange-100' : 'bg-purple-100'}`}>
                <Clock className={`w-8 h-8 ${isSpeaking ? 'text-orange-500' : 'text-purple-500'}`} />
              </div>
              <h2 className="text-xl font-display font-bold text-gray-800 mb-2">Bài đã nộp thành công</h2>
              <p className="text-gray-500 mb-1">
                Bài {isSpeaking ? 'Speaking' : 'Writing'} của bạn đang chờ giáo viên chấm điểm.
              </p>
              <p className="text-sm text-gray-400">Điểm sẽ được cập nhật sau khi giáo viên hoàn thành đánh giá.</p>
            </div>
          ) : (
            /* ── Objective score display ── */
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Band Score</p>
                <p className="text-4xl font-display font-bold text-primary-600">
                  {attempt.band_score != null ? attempt.band_score.toFixed(1) : '—'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Điểm số</p>
                <p className="text-4xl font-display font-bold text-gray-900">
                  {attempt.score != null ? `${attempt.score.toFixed(0)}%` : '—'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                <p className="text-lg font-semibold">
                  {attempt.is_auto_submitted
                    ? <span className="text-amber-600">Tự động nộp</span>
                    : <span className="text-emerald-600">Đã nộp</span>}
                </p>
              </div>
            </div>
          )}

          {/* Recommended Course */}
          {recommended_course && (
            <div className="bg-accent-50 border border-accent-100 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-accent-600" />
                <h3 className="font-semibold text-accent-800">Khóa học gợi ý</h3>
              </div>
              <p className="text-accent-700 mb-3">
                Dựa trên kết quả, bạn nên bắt đầu từ:{' '}
                <strong>{recommended_course.title}</strong> ({recommended_course.band_range})
              </p>
              <Link to={`/student/courses/${recommended_course.id}`} className="btn-accent gap-2 text-sm">
                Bắt đầu học <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* ── Speaking submissions review ── */}
          {isSpeaking && questions?.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-gray-900 mb-4">Bài nộp Speaking</h3>
              <div className="space-y-4">
                {questions.map((q, i) => {
                  const submitted = attempt.answers?.[q.id] || '';
                  const isLink = submitted.startsWith('http');
                  const isDriveLink = submitted.includes('drive.google.com');
                  const isAudioFile = submitted.match(/\.(mp3|wav|ogg|m4a|webm)$/i);
                  return (
                    <div key={q.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 border-b border-orange-100">
                        <Mic className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold text-gray-800">
                          {q.content?.text || q.content?.question || `Speaking Part ${i + 1}`}
                        </span>
                      </div>
                      <div className="p-4">
                        {submitted ? (
                          isAudioFile && !isDriveLink ? (
                            <audio controls src={submitted} className="w-full" />
                          ) : isLink ? (
                            <a href={submitted} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 underline text-sm">
                              <LinkIcon className="w-4 h-4" /> Xem bài nộp
                            </a>
                          ) : (
                            <p className="text-sm text-gray-600">{submitted}</p>
                          )
                        ) : (
                          <p className="text-sm text-gray-400 italic">Không có bài nộp</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Writing submissions review ── */}
          {isWriting && writingTasks.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-gray-900 mb-4">Bài viết đã nộp</h3>
              <div className="space-y-5">
                {writingTasks.map((task, i) => {
                  const key = `task_${i + 1}`;
                  const essay = attempt.answers?.[key] || '';
                  const words = essay.trim() ? essay.trim().split(/\s+/).length : 0;
                  return (
                    <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-purple-50 border-b border-purple-100">
                        <div className="flex items-center gap-2">
                          <PenTool className="w-4 h-4 text-purple-500" />
                          <span className="font-semibold text-gray-800">{task.title || `Task ${i + 1}`}</span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          words >= (task.minWords || 0)
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {words} từ {task.minWords ? `/ tối thiểu ${task.minWords}` : ''}
                        </span>
                      </div>
                      {task.prompt && (
                        <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 text-sm text-gray-600 leading-relaxed">
                          <p className="text-xs font-semibold text-gray-400 mb-1">Đề bài</p>
                          <p className="whitespace-pre-line">{task.prompt}</p>
                        </div>
                      )}
                      <div className="p-4">
                        <p className="text-xs font-semibold text-gray-400 mb-2">Bài viết của bạn</p>
                        {essay ? (
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {essay}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Không có bài viết</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Objective question review ── */}
          {!isPendingReview && questions?.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-gray-900 mb-4">Chi tiết đáp án</h3>
              <div className="space-y-3">
                {questions.map((q, i) => {
                  const userAnswer = attempt.answers?.[q.id];
                  const correctAnswer = q.correct_answer?.answer;
                  const acceptable = q.correct_answer?.acceptable_answers || [];

                  const norm = v => String(v ?? '').trim().toLowerCase();
                  const isCorrect = userAnswer !== undefined && (
                    norm(userAnswer) === norm(correctAnswer) ||
                    acceptable.some(a => norm(a) === norm(userAnswer))
                  );
                  const noAnswer = userAnswer === undefined || userAnswer === null || userAnswer === '';

                  const options = q.content?.options;

                  const displayAnswer = (val) => {
                    if (val === undefined || val === null || val === '') return 'Không trả lời';
                    if (options?.length) {
                      // val might be option text already
                      const idx = options.indexOf(val);
                      if (idx >= 0) return `${String.fromCharCode(65 + idx)}. ${val}`;
                      // fallback: val might be an old integer index
                      if (typeof val === 'number' && options[val]) return `${String.fromCharCode(65 + val)}. ${options[val]}`;
                    }
                    return String(val);
                  };

                  return (
                    <div key={q.id} className={`p-4 rounded-xl border-2 ${
                      noAnswer
                        ? 'border-gray-100 bg-gray-50'
                        : isCorrect
                        ? 'border-emerald-100 bg-emerald-50/50'
                        : 'border-red-100 bg-red-50/50'
                    }`}>
                      <div className="flex items-start gap-3">
                        {noAnswer ? (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5 flex-shrink-0" />
                        ) : isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 mb-1">
                            {q.section_label && <span>{q.section_label} · </span>}Câu {i + 1}
                          </p>
                          <p className="font-medium text-gray-900 mb-2 text-sm leading-snug">
                            {q.content?.text || q.content?.question || q.content?.prompt}
                          </p>
                          <div className="text-sm space-y-0.5">
                            <p className={noAnswer ? 'text-gray-400' : isCorrect ? 'text-emerald-700' : 'text-red-600'}>
                              Bạn chọn: {displayAnswer(userAnswer)}
                            </p>
                            {!isCorrect && !noAnswer && (
                              <p className="text-emerald-700 font-medium">
                                Đáp án đúng: {displayAnswer(correctAnswer)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
