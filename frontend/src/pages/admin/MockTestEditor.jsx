import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  Loader2, ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp,
  Upload, Music, Image as ImageIcon, BookOpen, Headphones, PenTool,
} from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────────
const TEST_TYPES = [
  { value: 'MOCK', label: 'Mock Test' },
  { value: 'PLACEMENT', label: 'Placement Test' },
  { value: 'CHECKPOINT', label: 'Checkpoint' },
];

const SKILLS = [
  { value: '', label: '-- Chọn kỹ năng --' },
  { value: 'LISTENING', label: 'Listening' },
  { value: 'READING', label: 'Reading' },
  { value: 'WRITING', label: 'Writing' },
  { value: 'SPEAKING', label: 'Speaking' },
  { value: 'FULL', label: 'Full Test' },
];

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Trắc nghiệm' },
  { value: 'fill_in_blank', label: 'Điền từ' },
  { value: 'true_false_ng', label: 'True/False/Not Given' },
  { value: 'matching', label: 'Nối' },
  { value: 'short_answer', label: 'Trả lời ngắn' },
];

// ── Default IELTS Structures ───────────────────────────────────────────────────
const defaultListeningParts = () =>
  [1, 2, 3, 4].map(n => ({
    number: n,
    title: `Part ${n}`,
    audioUrl: '',
    imageUrl: '',
    description: `Questions ${(n - 1) * 10 + 1}–${n * 10}. Listen to the recording and answer the questions.`,
  }));

const defaultReadingPassages = () =>
  [1, 2, 3].map(n => ({
    number: n,
    title: `Passage ${n}`,
    passageText: '',
    imageUrl: '',
  }));

const defaultWritingTasks = () => [
  { number: 1, title: 'Task 1', prompt: '', imageUrl: '', minWords: 150, timeRecommended: 20 },
  { number: 2, title: 'Task 2', prompt: '', imageUrl: '', minWords: 250, timeRecommended: 40 },
];

const defaultSectionsConfig = () => ({
  listening: { parts: defaultListeningParts() },
  reading: { passages: defaultReadingPassages() },
  writing: { tasks: defaultWritingTasks() },
});

const emptyMockTest = {
  title: '',
  description: '',
  test_type: 'MOCK',
  course_id: '',
  skill: '',
  time_limit_minutes: 60,
  passing_score: 70,
  is_active: true,
};

const makeEmptyQuestion = (sectionLabel = '') => ({
  section_label: sectionLabel,
  question_type: 'multiple_choice',
  content: { text: '', options: ['', '', '', ''], image_url: '' },
  correct_answer: { answer: '' },
  points: 1,
});

// ── Reusable File Upload Button ────────────────────────────────────────────────
function FileUploadBtn({ onUploaded, accept, label = 'Upload' }) {
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
    <label className={`inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg
      text-xs text-gray-600 cursor-pointer hover:bg-gray-50 transition select-none flex-shrink-0
      ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
      {uploading ? 'Đang upload...' : label}
      <input type="file" accept={accept} onChange={handleUpload} className="hidden" />
    </label>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MockTestEditor() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyMockTest);
  const [sectionsConfig, setSectionsConfig] = useState(defaultSectionsConfig());
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [expandedQ, setExpandedQ] = useState(null);
  const [activeSection, setActiveSection] = useState(0);

  // ── Load data ────────────────────────────────────────────────
  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data.courses || [])).catch(() => {});

    if (!isNew) {
      api.get(`/mock-tests/${id}`)
        .then(r => {
          const mt = r.data.mock_test;
          setForm({
            title: mt.title || '',
            description: mt.description || '',
            test_type: mt.test_type || 'MOCK',
            course_id: mt.course_id || '',
            skill: mt.skill || '',
            time_limit_minutes: mt.time_limit_minutes || 60,
            passing_score: mt.passing_score || 70,
            is_active: mt.is_active !== false,
          });

          const sc = mt.sections_config;
          setSectionsConfig({
            listening: sc?.listening || { parts: defaultListeningParts() },
            reading: sc?.reading || { passages: defaultReadingPassages() },
            writing: sc?.writing || { tasks: defaultWritingTasks() },
          });

          setQuestions(
            (r.data.questions || []).map(q => ({
              section_label: q.section_label || '',
              question_type: q.question_type || 'multiple_choice',
              content: {
                text: q.content?.text || '',
                options: q.content?.options || ['', '', '', ''],
                image_url: q.content?.image_url || '',
              },
              correct_answer: q.correct_answer || { answer: '' },
              points: q.points || 1,
            }))
          );
        })
        .catch(() => toast.error('Không tải được bài thi'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => { setActiveSection(0); }, [form.skill]);

  // ── Sections config updaters ──────────────────────────────────
  const updateListeningPart = (i, field, value) =>
    setSectionsConfig(prev => ({
      ...prev,
      listening: { parts: prev.listening.parts.map((p, idx) => idx === i ? { ...p, [field]: value } : p) },
    }));

  const updateReadingPassage = (i, field, value) =>
    setSectionsConfig(prev => ({
      ...prev,
      reading: { passages: prev.reading.passages.map((p, idx) => idx === i ? { ...p, [field]: value } : p) },
    }));

  const updateWritingTask = (i, field, value) =>
    setSectionsConfig(prev => ({
      ...prev,
      writing: { tasks: prev.writing.tasks.map((t, idx) => idx === i ? { ...t, [field]: value } : t) },
    }));

  // ── Section label options per skill ──────────────────────────
  const getSectionOptions = () => {
    if (form.skill === 'LISTENING') return sectionsConfig.listening.parts.map(p => `Part ${p.number}`);
    if (form.skill === 'READING') return sectionsConfig.reading.passages.map(p => `Passage ${p.number}`);
    if (form.skill === 'WRITING') return sectionsConfig.writing.tasks.map(t => `Task ${t.number}`);
    return [];
  };

  // ── Question helpers ──────────────────────────────────────────
  const updateQuestion = (i, field, value) =>
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q));

  const updateContent = (i, field, value) =>
    setQuestions(prev => prev.map((q, idx) =>
      idx === i ? { ...q, content: { ...q.content, [field]: value } } : q
    ));

  const updateOption = (qi, oi, value) =>
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q;
      const options = [...(q.content.options || [])];
      options[oi] = value;
      return { ...q, content: { ...q.content, options } };
    }));

  const addOption = (qi) =>
    setQuestions(prev => prev.map((q, i) =>
      i !== qi ? q : { ...q, content: { ...q.content, options: [...(q.content.options || []), ''] } }
    ));

  const removeOption = (qi, oi) =>
    setQuestions(prev => prev.map((q, i) =>
      i !== qi ? q : { ...q, content: { ...q.content, options: (q.content.options || []).filter((_, j) => j !== oi) } }
    ));

  const addQuestion = () => {
    const opts = getSectionOptions();
    setQuestions(prev => [...prev, makeEmptyQuestion(opts[0] || '')]);
    setExpandedQ(questions.length);
  };

  const removeQuestion = (i) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== i));
    if (expandedQ === i) setExpandedQ(null);
  };

  const moveQuestion = (i, dir) => {
    const ni = i + dir;
    if (ni < 0 || ni >= questions.length) return;
    setQuestions(prev => {
      const arr = [...prev];
      [arr[i], arr[ni]] = [arr[ni], arr[i]];
      return arr;
    });
    setExpandedQ(ni);
  };

  // ── Save ─────────────────────────────────────────────────────
  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Vui lòng nhập tên bài thi'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        course_id: form.course_id || null,
        skill: form.skill || null,
        time_limit_minutes: Number(form.time_limit_minutes),
        passing_score: Number(form.passing_score),
        total_questions: questions.length,
        sections_config: sectionsConfig,
        questions,
      };

      if (isNew) {
        await api.post('/mock-tests', payload);
      } else {
        await api.put(`/mock-tests/admin/${id}`, payload);
      }
      toast.success('Đã lưu bài thi thành công');
      navigate('/admin/mock-tests');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
    </div>
  );

  const sectionOptions = getSectionOptions();

  // ── Tab button style helper ───────────────────────────────────
  const tabClass = (active, color = 'primary') => {
    const colors = {
      primary: active ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      blue: active ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
      emerald: active ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
      purple: active ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
    };
    return `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${colors[color]}`;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">
        {isNew ? 'Tạo bài thi mới' : 'Chỉnh sửa bài thi'}
      </h1>

      <form onSubmit={save} className="space-y-6">

        {/* ── Basic Info ─────────────────────────────────────────────── */}
        <div className="card p-6 space-y-5">
          <h2 className="font-display font-bold text-gray-800 text-lg">Thông tin chung</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tên bài thi *</label>
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="input-field" placeholder="VD: IELTS Mock Test 1 – Listening" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
            <textarea rows={2} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Loại bài thi *</label>
              <select value={form.test_type} onChange={e => setForm({ ...form, test_type: e.target.value })} className="input-field">
                {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kỹ năng</label>
              <select value={form.skill} onChange={e => setForm({ ...form, skill: e.target.value })} className="input-field">
                {SKILLS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Thời gian (phút)</label>
              <input type="number" min="1" value={form.time_limit_minutes}
                onChange={e => setForm({ ...form, time_limit_minutes: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Điểm đạt (%)</label>
              <input type="number" min="0" max="100" value={form.passing_score}
                onChange={e => setForm({ ...form, passing_score: e.target.value })} className="input-field" />
            </div>
          </div>

          {form.test_type === 'CHECKPOINT' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Khóa học liên kết</label>
              <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} className="input-field">
                <option value="">-- Không liên kết --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input id="active" type="checkbox" checked={form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.checked })} />
            <label htmlFor="active" className="text-sm text-gray-700">Hiển thị cho học viên</label>
          </div>
        </div>

        {/* ── LISTENING Structure ────────────────────────────────────── */}
        {form.skill === 'LISTENING' && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Headphones className="w-5 h-5 text-blue-500" />
              <h2 className="font-display font-bold text-gray-800 text-lg">Cấu trúc Listening – 4 Parts</h2>
            </div>

            <div className="flex gap-2 mb-5">
              {sectionsConfig.listening.parts.map((p, i) => (
                <button key={i} type="button" onClick={() => setActiveSection(i)}
                  className={tabClass(activeSection === i, 'blue')}>
                  Part {p.number}
                </button>
              ))}
            </div>

            {sectionsConfig.listening.parts.map((part, i) => i !== activeSection ? null : (
              <div key={i} className="space-y-4 border border-gray-200 rounded-xl p-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tiêu đề Part</label>
                  <input value={part.title} onChange={e => updateListeningPart(i, 'title', e.target.value)}
                    className="input-field text-sm" placeholder={`Part ${part.number}`} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Hướng dẫn / Mô tả đề bài</label>
                  <textarea rows={2} value={part.description}
                    onChange={e => updateListeningPart(i, 'description', e.target.value)}
                    className="input-field text-sm"
                    placeholder="VD: Questions 1–10. Listen to the conversation and answer the questions." />
                </div>

                {/* Audio upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    <Music className="w-3.5 h-3.5 inline mr-1 text-blue-500" />
                    File Audio (MP3 / URL) *
                  </label>
                  <div className="flex gap-2 items-center">
                    <input value={part.audioUrl}
                      onChange={e => updateListeningPart(i, 'audioUrl', e.target.value)}
                      className="input-field text-sm flex-1"
                      placeholder="https://... hoặc upload file audio bên phải" />
                    <FileUploadBtn accept="audio/*" label="Upload Audio"
                      onUploaded={url => updateListeningPart(i, 'audioUrl', url)} />
                  </div>
                  {part.audioUrl && (
                    <audio controls src={part.audioUrl} className="mt-2 w-full rounded-lg" />
                  )}
                </div>

                {/* Image upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    <ImageIcon className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                    Hình ảnh đề bài (tùy chọn – bản đồ, sơ đồ...)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input value={part.imageUrl}
                      onChange={e => updateListeningPart(i, 'imageUrl', e.target.value)}
                      className="input-field text-sm flex-1" placeholder="https://..." />
                    <FileUploadBtn accept="image/*" label="Upload Hình"
                      onUploaded={url => updateListeningPart(i, 'imageUrl', url)} />
                  </div>
                  {part.imageUrl && (
                    <img src={part.imageUrl} alt="Part" className="mt-2 max-h-48 rounded-xl border object-contain" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── READING Structure ──────────────────────────────────────── */}
        {form.skill === 'READING' && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <h2 className="font-display font-bold text-gray-800 text-lg">Cấu trúc Reading – 3 Passages</h2>
            </div>

            <div className="flex gap-2 mb-5">
              {sectionsConfig.reading.passages.map((p, i) => (
                <button key={i} type="button" onClick={() => setActiveSection(i)}
                  className={tabClass(activeSection === i, 'emerald')}>
                  Passage {p.number}
                </button>
              ))}
            </div>

            {sectionsConfig.reading.passages.map((passage, i) => i !== activeSection ? null : (
              <div key={i} className="space-y-4 border border-gray-200 rounded-xl p-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tiêu đề Passage</label>
                  <input value={passage.title}
                    onChange={e => updateReadingPassage(i, 'title', e.target.value)}
                    className="input-field text-sm"
                    placeholder={`Passage ${passage.number}: (Tên bài đọc)`} />
                </div>

                {/* Image upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    <ImageIcon className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                    Hình ảnh kèm bài đọc (tùy chọn)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input value={passage.imageUrl}
                      onChange={e => updateReadingPassage(i, 'imageUrl', e.target.value)}
                      className="input-field text-sm flex-1" placeholder="https://..." />
                    <FileUploadBtn accept="image/*" label="Upload Hình"
                      onUploaded={url => updateReadingPassage(i, 'imageUrl', url)} />
                  </div>
                  {passage.imageUrl && (
                    <img src={passage.imageUrl} alt="Passage" className="mt-2 max-h-48 rounded-xl border object-contain" />
                  )}
                </div>

                {/* Passage text */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Nội dung bài đọc *
                  </label>
                  <textarea rows={14} value={passage.passageText}
                    onChange={e => updateReadingPassage(i, 'passageText', e.target.value)}
                    className="input-field text-sm leading-relaxed"
                    placeholder="Nhập nội dung bài đọc vào đây..." />
                  <p className="text-xs text-gray-400 mt-1">
                    {passage.passageText.length} ký tự
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── WRITING Structure ──────────────────────────────────────── */}
        {form.skill === 'WRITING' && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <PenTool className="w-5 h-5 text-purple-500" />
              <h2 className="font-display font-bold text-gray-800 text-lg">Cấu trúc Writing – 2 Tasks</h2>
            </div>

            <div className="flex gap-2 mb-5">
              {sectionsConfig.writing.tasks.map((t, i) => (
                <button key={i} type="button" onClick={() => setActiveSection(i)}
                  className={tabClass(activeSection === i, 'purple')}>
                  Task {t.number}
                </button>
              ))}
            </div>

            {sectionsConfig.writing.tasks.map((task, i) => i !== activeSection ? null : (
              <div key={i} className="space-y-4 border border-gray-200 rounded-xl p-5">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tiêu đề Task</label>
                    <input value={task.title}
                      onChange={e => updateWritingTask(i, 'title', e.target.value)}
                      className="input-field text-sm" placeholder={`Task ${task.number}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Số từ tối thiểu</label>
                    <input type="number" min="0" value={task.minWords}
                      onChange={e => updateWritingTask(i, 'minWords', parseInt(e.target.value) || 0)}
                      className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Thời gian đề xuất (phút)</label>
                    <input type="number" min="0" value={task.timeRecommended}
                      onChange={e => updateWritingTask(i, 'timeRecommended', parseInt(e.target.value) || 0)}
                      className="input-field text-sm" />
                  </div>
                </div>

                {/* Image upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    <ImageIcon className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                    Hình ảnh đề bài (sơ đồ, biểu đồ, bản đồ... tùy chọn)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input value={task.imageUrl}
                      onChange={e => updateWritingTask(i, 'imageUrl', e.target.value)}
                      className="input-field text-sm flex-1" placeholder="https://..." />
                    <FileUploadBtn accept="image/*" label="Upload Hình"
                      onUploaded={url => updateWritingTask(i, 'imageUrl', url)} />
                  </div>
                  {task.imageUrl && (
                    <img src={task.imageUrl} alt="Task" className="mt-2 max-h-64 rounded-xl border object-contain" />
                  )}
                </div>

                {/* Prompt */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Đề bài (Prompt) *</label>
                  <textarea rows={7} value={task.prompt}
                    onChange={e => updateWritingTask(i, 'prompt', e.target.value)}
                    className="input-field text-sm leading-relaxed"
                    placeholder="Nhập nội dung đề bài viết vào đây..." />
                </div>
              </div>
            ))}

            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <p className="text-sm text-purple-700">
                <PenTool className="w-4 h-4 inline mr-1" />
                Bài thi Writing không cần thêm câu hỏi riêng. Học viên sẽ viết bài trực tiếp vào ô bên phải màn hình.
                Bài viết cần giáo viên chấm điểm thủ công.
              </p>
            </div>
          </div>
        )}

        {/* ── Questions (Listening & Reading & other skills) ─────────── */}
        {form.skill !== 'WRITING' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-gray-800 text-lg">
                Câu hỏi ({questions.length})
              </h2>
              <button type="button" onClick={addQuestion} className="btn-outline gap-2 text-sm">
                <Plus className="w-4 h-4" /> Thêm câu hỏi
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p>Chưa có câu hỏi. Nhấn "Thêm câu hỏi" để bắt đầu.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, qi) => (
                  <div key={qi} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Question header */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setExpandedQ(expandedQ === qi ? null : qi)}
                    >
                      {q.section_label && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          form.skill === 'LISTENING' ? 'bg-blue-100 text-blue-700' :
                          form.skill === 'READING' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {q.section_label}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-gray-700 flex-1 truncate">
                        Câu {qi + 1}: {q.content?.text?.substring(0, 55) || '(chưa nhập nội dung)'}
                        {(q.content?.text?.length || 0) > 55 ? '...' : ''}
                      </span>
                      <span className="text-xs text-gray-400 mr-1 flex-shrink-0">
                        {QUESTION_TYPES.find(t => t.value === q.question_type)?.label}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button type="button" onClick={e => { e.stopPropagation(); moveQuestion(qi, -1); }}
                          disabled={qi === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={e => { e.stopPropagation(); moveQuestion(qi, 1); }}
                          disabled={qi === questions.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={e => { e.stopPropagation(); removeQuestion(qi); }}
                          className="p-1 hover:bg-red-100 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Question body */}
                    {expandedQ === qi && (
                      <div className="p-5 space-y-4 border-t border-gray-100">
                        <div className="grid grid-cols-3 gap-4">
                          {/* Section dropdown */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              {form.skill === 'LISTENING' ? 'Thuộc Part' :
                               form.skill === 'READING' ? 'Thuộc Passage' : 'Section'}
                            </label>
                            {sectionOptions.length > 0 ? (
                              <select value={q.section_label}
                                onChange={e => updateQuestion(qi, 'section_label', e.target.value)}
                                className="input-field text-sm">
                                {sectionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <input value={q.section_label}
                                onChange={e => updateQuestion(qi, 'section_label', e.target.value)}
                                className="input-field text-sm" placeholder="VD: Part 1" />
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Loại câu hỏi</label>
                            <select value={q.question_type}
                              onChange={e => updateQuestion(qi, 'question_type', e.target.value)}
                              className="input-field text-sm">
                              {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Điểm</label>
                            <input type="number" min="1" value={q.points}
                              onChange={e => updateQuestion(qi, 'points', parseInt(e.target.value) || 1)}
                              className="input-field text-sm" />
                          </div>
                        </div>

                        {/* Question image */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            <ImageIcon className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                            Hình ảnh câu hỏi (tùy chọn)
                          </label>
                          <div className="flex gap-2 items-center">
                            <input value={q.content.image_url || ''}
                              onChange={e => updateContent(qi, 'image_url', e.target.value)}
                              className="input-field text-sm flex-1" placeholder="https://..." />
                            <FileUploadBtn accept="image/*" label="Upload Hình"
                              onUploaded={url => updateContent(qi, 'image_url', url)} />
                          </div>
                          {q.content.image_url && (
                            <img src={q.content.image_url} alt="" className="mt-2 max-h-32 rounded-xl border object-contain" />
                          )}
                        </div>

                        {/* Question text */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Nội dung câu hỏi *</label>
                          <textarea rows={2} value={q.content.text || ''}
                            onChange={e => updateContent(qi, 'text', e.target.value)}
                            className="input-field text-sm"
                            placeholder="Nhập nội dung câu hỏi..." />
                        </div>

                        {/* Multiple choice / True-False-NG options */}
                        {(q.question_type === 'multiple_choice' || q.question_type === 'true_false_ng') && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-2">
                              Các đáp án (chọn radio = đáp án đúng)
                            </label>
                            <div className="space-y-2">
                              {(q.content.options || []).map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2">
                                  <input type="radio" name={`correct-${qi}`}
                                    checked={q.correct_answer?.answer === opt && opt !== ''}
                                    onChange={() => updateQuestion(qi, 'correct_answer', { answer: opt })}
                                    className="text-primary-600 flex-shrink-0" />
                                  <span className="text-xs font-bold text-gray-400 w-5 flex-shrink-0">
                                    {String.fromCharCode(65 + oi)}
                                  </span>
                                  <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)}
                                    className="input-field text-sm flex-1"
                                    placeholder={`Đáp án ${String.fromCharCode(65 + oi)}`} />
                                  {(q.content.options || []).length > 2 && (
                                    <button type="button" onClick={() => removeOption(qi, oi)}
                                      className="p-1 hover:bg-red-50 rounded flex-shrink-0">
                                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                            <button type="button" onClick={() => addOption(qi)}
                              className="text-xs text-primary-600 hover:text-primary-700 mt-2">
                              + Thêm đáp án
                            </button>
                          </div>
                        )}

                        {/* Fill in blank / Short answer */}
                        {(q.question_type === 'short_answer' || q.question_type === 'fill_in_blank') && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Đáp án đúng *</label>
                              <input value={q.correct_answer?.answer || ''}
                                onChange={e => updateQuestion(qi, 'correct_answer', {
                                  ...q.correct_answer, answer: e.target.value,
                                })}
                                className="input-field text-sm" placeholder="Nhập đáp án đúng" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Đáp án chấp nhận khác (cách nhau bởi dấu |)
                              </label>
                              <input
                                value={(q.correct_answer?.acceptable_answers || []).join('|')}
                                onChange={e => updateQuestion(qi, 'correct_answer', {
                                  ...q.correct_answer,
                                  acceptable_answers: e.target.value
                                    ? e.target.value.split('|').map(a => a.trim())
                                    : [],
                                })}
                                className="input-field text-sm" placeholder="VD: answer1|answer2|answer 3" />
                            </div>
                          </div>
                        )}

                        {/* Matching */}
                        {q.question_type === 'matching' && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Đáp án đúng (JSON format)
                            </label>
                            <textarea rows={3}
                              value={
                                typeof q.correct_answer?.answer === 'object'
                                  ? JSON.stringify(q.correct_answer.answer, null, 2)
                                  : (q.correct_answer?.answer || '')
                              }
                              onChange={e => {
                                try {
                                  updateQuestion(qi, 'correct_answer', { answer: JSON.parse(e.target.value) });
                                } catch {
                                  updateQuestion(qi, 'correct_answer', { answer: e.target.value });
                                }
                              }}
                              className="input-field text-sm font-mono"
                              placeholder='{"1": "B", "2": "A", "3": "C"}' />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Submit ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline">Hủy</button>
          <button type="submit" disabled={saving} className="btn-primary gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isNew ? 'Tạo bài thi' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
