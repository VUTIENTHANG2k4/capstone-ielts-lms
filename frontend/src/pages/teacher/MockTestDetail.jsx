import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Clock, Target, FileText,
  CheckCircle, Hash, HelpCircle, Eye, EyeOff,
  Volume2, Headphones, BookOpen, PenTool, Image as ImageIcon
} from 'lucide-react';

const typeColors = {
  MOCK: 'bg-indigo-100 text-indigo-700',
  PLACEMENT: 'bg-emerald-100 text-emerald-700',
  CHECKPOINT: 'bg-orange-100 text-orange-700',
};

const skillColors = {
  LISTENING: 'bg-blue-100 text-blue-700',
  READING: 'bg-green-100 text-green-700',
  WRITING: 'bg-amber-100 text-amber-700',
  SPEAKING: 'bg-purple-100 text-purple-700',
  FULL: 'bg-rose-100 text-rose-700',
};

const questionTypeLabels = {
  multiple_choice: 'Trắc nghiệm',
  fill_in_blank: 'Điền từ',
  true_false_ng: 'True/False/Not Given',
  matching: 'Nối',
  short_answer: 'Trả lời ngắn',
};

export default function TeacherMockTestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mockTest, setMockTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    api.get(`/mock-tests/${id}`)
      .then(res => {
        setMockTest(res.data.mock_test);
        setQuestions(res.data.questions || []);
      })
      .catch(err => {
        console.error(err);
        toast.error('Không thể tải thông tin bài thi');
        navigate('/teacher/mock-tests');
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

  if (!mockTest) return null;

  const formatAnswer = (ca) => {
    if (!ca) return 'Chưa có đáp án';
    if (typeof ca.answer === 'object') return JSON.stringify(ca.answer);
    let result = String(ca.answer || '');
    if (ca.acceptable_answers?.length) {
      result += ` (hoặc: ${ca.acceptable_answers.join(', ')})`;
    }
    return result;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in">
      <button onClick={() => navigate('/teacher/mock-tests')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </button>

      {/* Header */}
      <div className="card-elevated p-6 mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-display font-bold text-gray-900">{mockTest.title}</h1>
          {mockTest.description && <p className="text-sm text-gray-500 mt-1">{mockTest.description}</p>}
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${typeColors[mockTest.test_type] || 'bg-gray-100'}`}>
            {mockTest.test_type}
          </span>
          {mockTest.skill && (
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${skillColors[mockTest.skill] || 'bg-gray-100'}`}>
              {mockTest.skill}
            </span>
          )}
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${mockTest.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {mockTest.is_active ? 'Hoạt động' : 'Đã ẩn'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{mockTest.time_limit_minutes} phút</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Hash className="w-4 h-4 text-gray-400" />
            <span>{mockTest.total_questions} câu hỏi</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Target className="w-4 h-4 text-gray-400" />
            <span>Điểm đạt: {mockTest.passing_score}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="w-4 h-4 text-gray-400" />
            <span>Tạo: {new Date(mockTest.created_at).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>

      {/* Sections Config — Audio / Passage / Writing Task preview */}
      {mockTest.sections_config && (
        <div className="card p-6 mb-6">
          <h2 className="font-display font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            {mockTest.skill === 'LISTENING' && <Headphones className="w-5 h-5 text-blue-500" />}
            {mockTest.skill === 'READING' && <BookOpen className="w-5 h-5 text-emerald-500" />}
            {mockTest.skill === 'WRITING' && <PenTool className="w-5 h-5 text-purple-500" />}
            {!['LISTENING','READING','WRITING'].includes(mockTest.skill) && <FileText className="w-5 h-5 text-gray-400" />}
            Nội dung đề thi
          </h2>

          {/* Listening parts */}
          {mockTest.sections_config.listening?.parts?.length > 0 && (
            <div className="space-y-4">
              {mockTest.sections_config.listening.parts.map(part => (
                <div key={part.number} className="border border-blue-100 rounded-xl p-4 bg-blue-50/40">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Part {part.number}</span>
                    <span className="font-semibold text-gray-800 text-sm">{part.title}</span>
                  </div>
                  {part.description && <p className="text-sm text-gray-600 mb-3">{part.description}</p>}
                  {part.audioUrl ? (
                    <div className="bg-white border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-semibold text-blue-600">File Audio – Part {part.number}</span>
                      </div>
                      <audio controls src={part.audioUrl} className="w-full" />
                    </div>
                  ) : (
                    <div className="border border-dashed border-blue-200 rounded-lg p-3 text-center text-sm text-blue-400">
                      Chưa có file audio
                    </div>
                  )}
                  {part.imageUrl && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" /> Hình ảnh đề bài
                      </p>
                      <img src={part.imageUrl} alt="" className="max-h-64 rounded-xl border object-contain" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reading passages */}
          {mockTest.sections_config.reading?.passages?.length > 0 && (
            <div className="space-y-4">
              {mockTest.sections_config.reading.passages.map(passage => (
                <div key={passage.number} className="border border-emerald-100 rounded-xl p-4 bg-emerald-50/40">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Passage {passage.number}</span>
                    <span className="font-semibold text-gray-800 text-sm">{passage.title}</span>
                  </div>
                  {passage.imageUrl && (
                    <img src={passage.imageUrl} alt="" className="mb-3 w-full max-h-64 rounded-xl border object-contain" />
                  )}
                  {passage.passageText && (
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border-l-4 border-emerald-200 pl-3 max-h-60 overflow-y-auto">
                      {passage.passageText}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Writing tasks */}
          {mockTest.sections_config.writing?.tasks?.length > 0 && (
            <div className="space-y-4">
              {mockTest.sections_config.writing.tasks.map(task => (
                <div key={task.number} className="border border-purple-100 rounded-xl p-4 bg-purple-50/40">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Task {task.number}</span>
                    <span className="font-semibold text-gray-800 text-sm">{task.title}</span>
                    {task.minWords > 0 && (
                      <span className="text-xs text-gray-400 ml-auto">Tối thiểu {task.minWords} từ</span>
                    )}
                  </div>
                  {task.imageUrl && (
                    <img src={task.imageUrl} alt="" className="mb-3 w-full max-h-64 rounded-xl border object-contain" />
                  )}
                  {task.prompt && (
                    <div className="bg-white border border-purple-200 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {task.prompt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Questions Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-gray-800 text-lg flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary-600" />
            Danh sách câu hỏi ({questions.length})
          </h2>
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="btn-outline gap-2 text-sm"
          >
            {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAnswers ? 'Ẩn đáp án' : 'Hiện đáp án'}
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <HelpCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>Bài thi chưa có câu hỏi nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={q.id || qi} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                {/* Question header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center text-sm font-bold">
                      {qi + 1}
                    </span>
                    <div>
                      {q.section_label && (
                        <span className="text-xs text-gray-400 block">{q.section_label}</span>
                      )}
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {questionTypeLabels[q.question_type] || q.question_type}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{q.points} điểm</span>
                </div>

                {/* Passage */}
                {q.content?.passage && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {q.content.passage}
                  </div>
                )}

                {/* Audio URL (question-level) */}
                {q.content?.audio_url && (
                  <div className="mb-3 bg-blue-50 border border-blue-100 rounded-lg p-2">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-semibold text-blue-600">Audio câu hỏi</span>
                    </div>
                    <audio controls className="w-full" src={q.content.audio_url} />
                  </div>
                )}

                {/* Image (question-level) */}
                {q.content?.image_url && (
                  <div className="mb-3">
                    <img src={q.content.image_url} alt="" className="max-h-48 rounded-xl border object-contain" />
                  </div>
                )}

                {/* Question text */}
                <p className="text-gray-900 font-medium mb-3">{q.content?.text}</p>

                {/* Options */}
                {q.content?.options?.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {q.content.options.map((opt, oi) => {
                      const isCorrect = showAnswers && q.correct_answer?.answer === opt;
                      return (
                        <div
                          key={oi}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                            isCorrect
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium'
                              : 'bg-gray-50 border border-gray-100 text-gray-700'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium flex-shrink-0"
                            style={{
                              borderColor: isCorrect ? '#10b981' : '#d1d5db',
                              color: isCorrect ? '#10b981' : '#6b7280',
                            }}
                          >
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span>{opt}</span>
                          {isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Correct Answer */}
                {showAnswers && (
                  <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-emerald-800">Đáp án đúng: </span>
                      <span className="text-emerald-700">{formatAnswer(q.correct_answer)}</span>
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
