import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  X, Plus, Trash2, Upload, Activity,
  HelpCircle, ClipboardList, Timer, PenLine, Link2, Headphones,
  CreditCard, Mic, FileEdit, MessageSquare
} from 'lucide-react';

const TYPES = [
  { key: 'QUIZ', label: 'Quiz (chọn đáp án)', Icon: HelpCircle },
  { key: 'MINI_TEST', label: 'Mini test', Icon: ClipboardList },
  { key: 'TIMED_PRACTICE', label: 'Timed practice', Icon: Timer },
  { key: 'FILL_IN_BLANK', label: 'Fill in blank', Icon: PenLine },
  { key: 'MATCHING', label: 'Matching (nối cặp)', Icon: Link2 },
  { key: 'LISTENING_DICTATION', label: 'Listening dictation', Icon: Headphones },
  { key: 'FLASHCARD', label: 'Flashcard', Icon: CreditCard },
  { key: 'SPEAKING_RECORD_SHORT', label: 'Speaking record', Icon: Mic },
  { key: 'WRITING_SUBMISSION', label: 'Writing submission', Icon: FileEdit },
  { key: 'SPEAKING_SUBMISSION', label: 'Speaking submission', Icon: MessageSquare },
];

const TYPE_GROUPS = [
  { label: 'Trắc nghiệm', types: ['QUIZ', 'MINI_TEST', 'TIMED_PRACTICE'] },
  { label: 'Điền & Nối', types: ['FILL_IN_BLANK', 'MATCHING'] },
  { label: 'Nghe & Ghi nhớ', types: ['LISTENING_DICTATION', 'FLASHCARD'] },
  { label: 'Nói & Viết', types: ['SPEAKING_RECORD_SHORT', 'WRITING_SUBMISSION', 'SPEAKING_SUBMISSION'] },
];

function buildDefaultContent(type) {
  switch (type) {
    case 'QUIZ': case 'MINI_TEST': case 'TIMED_PRACTICE':
      return { questions: [{ q: '', options: ['', '', '', ''], correct: 0 }] };
    case 'FILL_IN_BLANK':
      return { questions: [{ q: '', answer: '' }] };
    case 'MATCHING':
      return { pairs: [{ left: '', right: '' }] };
    case 'LISTENING_DICTATION':
      return { audio_url: '', transcript: '' };
    case 'FLASHCARD':
      return { cards: [{ front: '', back: '' }] };
    case 'SPEAKING_RECORD_SHORT':
      return { prompt: '' };
    case 'WRITING_SUBMISSION':
      return { prompt: '', min_words: 150 };
    case 'SPEAKING_SUBMISSION':
      return { prompt: '', max_seconds: 120 };
    default:
      return {};
  }
}

export default function ActivityFormModal({ sectionId, activity, onClose, onSaved }) {
  const isEdit = !!activity;
  const [data, setData] = useState({
    section_id: sectionId,
    title: activity?.title || '',
    activity_type: activity?.activity_type || 'QUIZ',
    instructions: activity?.instructions || '',
    content: activity?.content || buildDefaultContent('QUIZ'),
    time_limit_minutes: activity?.time_limit_minutes || '',
    passing_score: activity?.passing_score ?? 70,
    max_attempts: activity?.max_attempts || '',
    order_index: activity?.order_index || 1,
  });
  const [saving, setSaving] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [jsonText, setJsonText] = useState('');

  const set = (patch) => setData(d => ({ ...d, ...patch }));
  const setContent = (patch) => setData(d => ({ ...d, content: { ...d.content, ...patch } }));

  const onTypeChange = (t) => {
    set({ activity_type: t, content: buildDefaultContent(t) });
  };

  const toggleJson = () => {
    if (!showJson) {
      setJsonText(JSON.stringify(data.content, null, 2));
    } else {
      try {
        const parsed = JSON.parse(jsonText);
        set({ content: parsed });
      } catch {
        toast.error('JSON không hợp lệ');
        return;
      }
    }
    setShowJson(!showJson);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!data.title.trim()) return toast.error('Vui lòng nhập tiêu đề');

    let content = data.content;
    if (showJson) {
      try { content = JSON.parse(jsonText); }
      catch { return toast.error('Content JSON không hợp lệ'); }
    }

    setSaving(true);
    try {
      const payload = {
        ...data, content,
        time_limit_minutes: data.time_limit_minutes ? Number(data.time_limit_minutes) : null,
        max_attempts: data.max_attempts ? Number(data.max_attempts) : null,
        passing_score: data.passing_score === '' ? null : Number(data.passing_score),
        order_index: Number(data.order_index) || 1,
      };
      if (isEdit) await api.put(`/activities/${activity.id}`, payload);
      else await api.post('/activities', payload);
      toast.success(isEdit ? 'Đã cập nhật' : 'Đã tạo bài tập');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi');
    } finally { setSaving(false); }
  };

  const typeInfo = TYPES.find(t => t.key === data.activity_type);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <form onSubmit={save} onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden animate-scale-in">

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-bold">{isEdit ? 'Chỉnh sửa bài tập' : 'Thêm bài tập mới'}</h3>
                <p className="text-amber-100 text-xs">
                  {typeInfo ? typeInfo.label : 'Chọn loại bài tập'}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Activity Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Loại bài tập</label>
            <div className="space-y-2">
              {TYPE_GROUPS.map(g => (
                <div key={g.label}>
                  <p className="text-xs text-gray-400 mb-1">{g.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {g.types.map(tKey => {
                      const t = TYPES.find(x => x.key === tKey);
                      if (!t) return null;
                      const TIcon = t.Icon;
                      const selected = data.activity_type === t.key;
                      return (
                        <button key={t.key} type="button" onClick={() => onTypeChange(t.key)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition
                            ${selected ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                          <TIcon className="w-3.5 h-3.5" /> {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề *</label>
              <input required value={data.title} onChange={e => set({ title: e.target.value })} className="input-field"
                placeholder="VD: Quiz - Present Perfect vs Past Simple" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hướng dẫn cho học viên</label>
              <textarea rows={2} value={data.instructions} onChange={e => set({ instructions: e.target.value })}
                className="input-field text-sm" placeholder="VD: Chọn đáp án đúng cho mỗi câu hỏi..." />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Điểm đạt (%)</label>
              <input type="number" min="0" max="100" value={data.passing_score ?? ''} onChange={e => set({ passing_score: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Thời gian (phút)</label>
              <input type="number" min="0" value={data.time_limit_minutes} onChange={e => set({ time_limit_minutes: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Số lần làm</label>
              <input type="number" min="0" value={data.max_attempts} onChange={e => set({ max_attempts: e.target.value })} className="input-field text-sm" placeholder="∞" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Thứ tự</label>
              <input type="number" min="1" value={data.order_index} onChange={e => set({ order_index: e.target.value })} className="input-field text-sm" />
            </div>
          </div>

          {/* Visual Content Builder */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700">Nội dung bài tập</h4>
              <button type="button" onClick={toggleJson}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 hover:bg-white transition">
                {showJson ? 'Giao diện trực quan' : 'Chỉnh sửa JSON'}
              </button>
            </div>

            <div className="p-4">
              {showJson ? (
                <textarea value={jsonText} onChange={e => setJsonText(e.target.value)}
                  className="input-field font-mono text-xs min-h-[300px]" />
              ) : (
                <ContentBuilder type={data.activity_type} content={data.content} setContent={setContent} set={set} />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">* Bắt buộc</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-outline">Hủy</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo bài tập'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════ VISUAL CONTENT BUILDER ═══════════════════ */
function ContentBuilder({ type, content, setContent, set }) {
  if (['QUIZ', 'MINI_TEST', 'TIMED_PRACTICE'].includes(type)) {
    return <QuizBuilder content={content} setContent={setContent} set={set} />;
  }
  if (type === 'FILL_IN_BLANK') return <FillInBlankBuilder content={content} setContent={setContent} set={set} />;
  if (type === 'MATCHING') return <MatchingBuilder content={content} setContent={setContent} set={set} />;
  if (type === 'LISTENING_DICTATION') return <ListeningBuilder content={content} setContent={setContent} />;
  if (type === 'FLASHCARD') return <FlashcardBuilder content={content} setContent={setContent} set={set} />;
  if (type === 'SPEAKING_RECORD_SHORT') return <PromptBuilder content={content} setContent={setContent} label="Câu hỏi / Đề bài nói" />;
  if (type === 'WRITING_SUBMISSION') return <WritingBuilder content={content} setContent={setContent} />;
  if (type === 'SPEAKING_SUBMISSION') return <SpeakingSubmissionBuilder content={content} setContent={setContent} />;
  return <p className="text-sm text-gray-400">Chọn loại bài tập để bắt đầu</p>;
}

/* ── Quiz / Multiple Choice Builder ── */
function QuizBuilder({ content, setContent, set }) {
  const questions = content?.questions || [];

  const updateQ = (idx, patch) => {
    const newQs = questions.map((q, i) => i === idx ? { ...q, ...patch } : q);
    set({ content: { ...content, questions: newQs } });
  };

  const addQ = () => {
    set({ content: { ...content, questions: [...questions, { q: '', options: ['', '', '', ''], correct: 0 }] } });
  };

  const removeQ = (idx) => {
    set({ content: { ...content, questions: questions.filter((_, i) => i !== idx) } });
  };

  const updateOption = (qIdx, optIdx, val) => {
    const newOpts = [...questions[qIdx].options];
    newOpts[optIdx] = val;
    updateQ(qIdx, { options: newOpts });
  };

  const addOption = (qIdx) => {
    updateQ(qIdx, { options: [...questions[qIdx].options, ''] });
  };

  const removeOption = (qIdx, optIdx) => {
    const newOpts = questions[qIdx].options.filter((_, i) => i !== optIdx);
    const newCorrect = questions[qIdx].correct >= newOpts.length ? 0 : questions[qIdx].correct;
    updateQ(qIdx, { options: newOpts, correct: newCorrect });
  };

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="border border-gray-200 rounded-xl p-4 bg-white">
          <div className="flex items-start gap-3 mb-3">
            <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              {qi + 1}
            </span>
            <div className="flex-1">
              <input value={q.q} onChange={e => updateQ(qi, { q: e.target.value })}
                className="input-field text-sm" placeholder={`Câu hỏi ${qi + 1}...`} />
            </div>
            <button type="button" onClick={() => removeQ(qi)} className="p-1.5 hover:bg-rose-50 rounded-lg shrink-0">
              <Trash2 className="w-4 h-4 text-rose-400" />
            </button>
          </div>

          <div className="ml-10 space-y-2">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <button type="button" onClick={() => updateQ(qi, { correct: oi })}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition
                    ${q.correct === oi ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 hover:border-gray-400'}`}>
                  {q.correct === oi && <span className="text-white text-xs font-bold">{'✓'}</span>}
                </button>
                <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)}
                  className={`input-field text-sm flex-1 ${q.correct === oi ? 'border-emerald-200 bg-emerald-50' : ''}`}
                  placeholder={`Đáp án ${String.fromCharCode(65 + oi)}`} />
                {q.options.length > 2 && (
                  <button type="button" onClick={() => removeOption(qi, oi)} className="p-1 hover:bg-rose-50 rounded">
                    <X className="w-3.5 h-3.5 text-rose-400" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addOption(qi)}
              className="text-xs text-gray-400 hover:text-gray-600 inline-flex items-center gap-1 mt-1">
              <Plus className="w-3 h-3" /> Thêm đáp án
            </button>
          </div>
        </div>
      ))}

      <button type="button" onClick={addQ}
        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:border-gray-300 transition inline-flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> {`Thêm câu hỏi (${questions.length})`}
      </button>
    </div>
  );
}

/* ── Fill in Blank Builder ── */
function FillInBlankBuilder({ content, setContent, set }) {
  const questions = content?.questions || [];

  const updateQ = (idx, patch) => {
    const newQs = questions.map((q, i) => i === idx ? { ...q, ...patch } : q);
    set({ content: { ...content, questions: newQs } });
  };

  const addQ = () => {
    set({ content: { ...content, questions: [...questions, { q: '', answer: '' }] } });
  };

  const removeQ = (idx) => {
    set({ content: { ...content, questions: questions.filter((_, i) => i !== idx) } });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">Dùng dấu gạch dưới ___ trong câu để đánh dấu chỗ trống</p>
      {questions.map((q, qi) => (
        <div key={qi} className="border border-gray-200 rounded-xl p-3 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-gray-400 w-6">#{qi + 1}</span>
            <input value={q.q} onChange={e => updateQ(qi, { q: e.target.value })}
              className="input-field text-sm flex-1" placeholder="VD: I ___ a student. (am/is/are)" />
            <button type="button" onClick={() => removeQ(qi)} className="p-1 hover:bg-rose-50 rounded">
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            </button>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <span className="text-xs text-emerald-600 font-medium">Đáp án:</span>
            <input value={q.answer} onChange={e => updateQ(qi, { answer: e.target.value })}
              className="input-field text-sm flex-1 border-emerald-200 bg-emerald-50" placeholder="Đáp án đúng" />
          </div>
        </div>
      ))}
      <button type="button" onClick={addQ}
        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:border-gray-300 transition inline-flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> {`Thêm câu (${questions.length})`}
      </button>
    </div>
  );
}

/* ── Matching Builder ── */
function MatchingBuilder({ content, setContent, set }) {
  const pairs = content?.pairs || [];

  const updatePair = (idx, patch) => {
    const newPairs = pairs.map((p, i) => i === idx ? { ...p, ...patch } : p);
    set({ content: { ...content, pairs: newPairs } });
  };

  const addPair = () => {
    set({ content: { ...content, pairs: [...pairs, { left: '', right: '' }] } });
  };

  const removePair = (idx) => {
    set({ content: { ...content, pairs: pairs.filter((_, i) => i !== idx) } });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
        <span className="text-xs font-semibold text-gray-500 text-center">Bên trái</span>
        <span></span>
        <span className="text-xs font-semibold text-gray-500 text-center">Bên phải</span>
        <span></span>
      </div>
      {pairs.map((p, pi) => (
        <div key={pi} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
          <input value={p.left} onChange={e => updatePair(pi, { left: e.target.value })}
            className="input-field text-sm" placeholder="VD: apple" />
          <span className="text-gray-300">{'↔'}</span>
          <input value={p.right} onChange={e => updatePair(pi, { right: e.target.value })}
            className="input-field text-sm" placeholder="VD: táo" />
          <button type="button" onClick={() => removePair(pi)} className="p-1 hover:bg-rose-50 rounded">
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>
      ))}
      <button type="button" onClick={addPair}
        className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:border-gray-300 transition inline-flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> {`Thêm cặp (${pairs.length})`}
      </button>
    </div>
  );
}

/* ── Listening Dictation Builder ── */
function ListeningBuilder({ content, setContent }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Audio URL</label>
        <div className="flex gap-2">
          <input value={content?.audio_url || ''} onChange={e => setContent({ audio_url: e.target.value })}
            className="input-field text-sm flex-1" placeholder="https://... hoặc upload file audio" />
          <FileUploadBtn onUploaded={(url) => setContent({ audio_url: url })} accept="audio/*" />
        </div>
        {content?.audio_url && (
          <audio controls className="mt-2 w-full" src={content.audio_url} />
        )}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Transcript (đáp án)</label>
        <textarea value={content?.transcript || ''} onChange={e => setContent({ transcript: e.target.value })}
          className="input-field text-sm min-h-[120px]" placeholder="Nội dung học viên cần nghe và viết lại..." />
      </div>
    </div>
  );
}

/* ── Flashcard Builder ── */
function FlashcardBuilder({ content, setContent, set }) {
  const cards = content?.cards || [];

  const updateCard = (idx, patch) => {
    const newCards = cards.map((c, i) => i === idx ? { ...c, ...patch } : c);
    set({ content: { ...content, cards: newCards } });
  };

  const addCard = () => {
    set({ content: { ...content, cards: [...cards, { front: '', back: '' }] } });
  };

  const removeCard = (idx) => {
    set({ content: { ...content, cards: cards.filter((_, i) => i !== idx) } });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((c, ci) => (
          <div key={ci} className="border border-gray-200 rounded-xl p-3 bg-white relative group">
            <button type="button" onClick={() => removeCard(ci)}
              className="absolute top-2 right-2 p-1 hover:bg-rose-50 rounded opacity-0 group-hover:opacity-100 transition">
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            </button>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-400">Mặt trước</label>
                <input value={c.front} onChange={e => updateCard(ci, { front: e.target.value })}
                  className="input-field text-sm" placeholder="VD: apple" />
              </div>
              <div>
                <label className="text-xs text-gray-400">Mặt sau</label>
                <input value={c.back} onChange={e => updateCard(ci, { back: e.target.value })}
                  className="input-field text-sm" placeholder="VD: quả táo" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={addCard}
        className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:border-gray-300 transition inline-flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> {`Thêm thẻ (${cards.length})`}
      </button>
    </div>
  );
}

/* ── Prompt Builder (Speaking Record) ── */
function PromptBuilder({ content, setContent, label }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <textarea value={content?.prompt || ''} onChange={e => setContent({ prompt: e.target.value })}
        className="input-field text-sm min-h-[120px]" placeholder="VD: Tự giới thiệu bản thân trong 1 phút..." />
    </div>
  );
}

/* ── Writing Submission Builder ── */
function WritingBuilder({ content, setContent }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Đề bài viết</label>
        <textarea value={content?.prompt || ''} onChange={e => setContent({ prompt: e.target.value })}
          className="input-field text-sm min-h-[120px]"
          placeholder="VD: Write an essay about the advantages and disadvantages of..." />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Số từ tối thiểu</label>
        <input type="number" min="0" value={content?.min_words || ''} onChange={e => setContent({ min_words: Number(e.target.value) || 0 })}
          className="input-field text-sm w-32" placeholder="150" />
      </div>
    </div>
  );
}

/* ── Speaking Submission Builder ── */
function SpeakingSubmissionBuilder({ content, setContent }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Đề bài nói</label>
        <textarea value={content?.prompt || ''} onChange={e => setContent({ prompt: e.target.value })}
          className="input-field text-sm min-h-[120px]"
          placeholder="VD: Describe a place you have visited recently..." />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Thời gian tối đa (giây)</label>
        <input type="number" min="0" value={content?.max_seconds || ''} onChange={e => setContent({ max_seconds: Number(e.target.value) || 0 })}
          className="input-field text-sm w-32" placeholder="120" />
      </div>
    </div>
  );
}

/* ── Inline File Upload Button ── */
function FileUploadBtn({ onUploaded, accept }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUploaded(res.data.url);
      toast.success('Đã upload: ' + file.name);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload thất bại');
    } finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <label className={`inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-500 cursor-pointer
      hover:bg-gray-50 transition ${uploading ? 'opacity-50' : ''}`}>
      <Upload className="w-3.5 h-3.5" />
      {uploading ? 'Đang...' : 'Upload'}
      <input type="file" accept={accept} onChange={handleUpload} className="hidden" />
    </label>
  );
}
