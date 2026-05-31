import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  ChevronDown, ChevronRight, Plus, Trash2, Edit3, BookOpen, Layers, Activity,
  X, Video, FileText, Lightbulb, Upload, Link2, Play,
  Clock, Award, ChevronLeft, Eye, PenTool, Target,
  HelpCircle, ClipboardList, Timer, PenLine, Headphones, CreditCard, Mic, FileEdit, MessageSquare
} from 'lucide-react';
import ActivityFormModal from './ActivityFormModal';

/* ═══════════════════ CONSTANTS ═══════════════════ */
const ACTIVITY_LABELS = {
  QUIZ: 'Quiz', MINI_TEST: 'Mini test', TIMED_PRACTICE: 'Timed practice',
  FILL_IN_BLANK: 'Fill in blank', MATCHING: 'Matching',
  LISTENING_DICTATION: 'Listening dictation', FLASHCARD: 'Flashcard',
  SPEAKING_RECORD_SHORT: 'Speaking record',
  WRITING_SUBMISSION: 'Writing submission', SPEAKING_SUBMISSION: 'Speaking submission',
};

const ACTIVITY_ICON_MAP = {
  QUIZ: HelpCircle, MINI_TEST: ClipboardList, TIMED_PRACTICE: Timer,
  FILL_IN_BLANK: PenLine, MATCHING: Link2, LISTENING_DICTATION: Headphones,
  FLASHCARD: CreditCard, SPEAKING_RECORD_SHORT: Mic,
  WRITING_SUBMISSION: FileEdit, SPEAKING_SUBMISSION: MessageSquare,
};

const ACTIVITY_COLORS = {
  QUIZ: 'text-indigo-500', MINI_TEST: 'text-violet-500', TIMED_PRACTICE: 'text-orange-500',
  FILL_IN_BLANK: 'text-cyan-500', MATCHING: 'text-pink-500', LISTENING_DICTATION: 'text-purple-500',
  FLASHCARD: 'text-teal-500', SPEAKING_RECORD_SHORT: 'text-rose-500',
  WRITING_SUBMISSION: 'text-sky-500', SPEAKING_SUBMISSION: 'text-fuchsia-500',
};

const SECTION_TYPES = [
  { value: 'INPUT', label: 'Lý thuyết', color: 'bg-blue-100 text-blue-700', border: 'border-blue-200', Icon: BookOpen, iconColor: 'text-blue-500' },
  { value: 'PRACTICE', label: 'Luyện tập', color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', Icon: PenTool, iconColor: 'text-emerald-500' },
  { value: 'CHECKPOINT', label: 'Kiểm tra', color: 'bg-amber-100 text-amber-700', border: 'border-amber-200', Icon: Target, iconColor: 'text-amber-500' },
];

const CONTENT_TYPES = [
  { value: 'VIDEO', label: 'Video bài giảng', icon: Video },
  { value: 'DOCUMENT', label: 'Tài liệu', icon: FileText },
  { value: 'EXAMPLE', label: 'Ví dụ mẫu', icon: Lightbulb },
];

const ITEMS_PER_PAGE = 5;

/* ═══════════════════ HELPERS ═══════════════════ */
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

function YouTubeEmbed({ url, className = '' }) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return (
    <div className={`relative w-full aspect-video rounded-lg overflow-hidden bg-black ${className}`}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}

function YouTubeThumbnail({ url, className = '' }) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return (
    <div className={`relative rounded-lg overflow-hidden bg-gray-900 group cursor-pointer ${className}`}>
      <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt=""
        className="w-full h-full object-cover group-hover:opacity-80 transition" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition">
          <Play className="w-5 h-5 text-white ml-0.5" />
        </div>
      </div>
    </div>
  );
}

function FileUploadButton({ onUploaded, accept, label, className = '' }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error('File quá lớn (tối đa 50MB)'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded(res.data);
      toast.success('Đã upload: ' + file.name);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload thất bại');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <label className={`inline-flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg
      hover:border-primary-400 hover:bg-primary-50 cursor-pointer transition text-sm text-gray-600 ${className}
      ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
      <Upload className="w-4 h-4" />
      {uploading ? 'Đang upload...' : label || 'Chọn file'}
      <input type="file" accept={accept} onChange={handleUpload} className="hidden" />
    </label>
  );
}

function Pagination({ total, page, setPage, perPage = ITEMS_PER_PAGE }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
      <span className="text-xs text-gray-400">
        {`Hiển thị ${Math.min((page - 1) * perPage + 1, total)}–${Math.min(page * perPage, total)} / ${total}`}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => setPage(i + 1)}
            className={`w-7 h-7 rounded text-xs font-medium transition
              ${page === i + 1 ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
            {i + 1}
          </button>
        ))}
        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
export default function UnitContentEditor({ unitId }) {
  const [sections, setSections] = useState([]);
  const [openSection, setOpenSection] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [previewLesson, setPreviewLesson] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionType, setNewSectionType] = useState('INPUT');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [lessonPages, setLessonPages] = useState({});
  const [activityPages, setActivityPages] = useState({});

  const load = useCallback(() => {
    api.get(`/sections/unit/${unitId}`).then(async r => {
      const sects = r.data.sections || [];
      const enriched = await Promise.all(sects.map(async s => {
        const [lr, ar] = await Promise.all([
          api.get(`/lessons/section/${s.id}`).then(rr => rr.data.lessons || []).catch(() => []),
          api.get(`/activities/section/${s.id}`).then(rr => rr.data.activities || []).catch(() => []),
        ]);
        return { ...s, lessons: lr, activities: ar };
      }));
      setSections(enriched);
    });
  }, [unitId]);

  useEffect(() => { load(); }, [load]);

  /* -- Section CRUD -- */
  const addSection = async () => {
    const title = newSectionTitle.trim() || `Section ${sections.length + 1}`;
    try {
      await api.post('/sections', { unit_id: unitId, title, section_type: newSectionType, order_index: sections.length + 1 });
      setShowAddSection(false);
      setNewSectionTitle('');
      setNewSectionType('INPUT');
      load();
      toast.success('Đã thêm section');
    } catch (err) { toast.error(err.response?.data?.error || 'Lỗi tạo section'); }
  };

  const updateSection = async (s, patch) => {
    try { await api.put(`/sections/${s.id}`, patch); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Lỗi'); }
  };

  const deleteSection = async (s) => {
    if (!confirm('Xóa section này và toàn bộ nội dung bên trong?')) return;
    await api.delete(`/sections/${s.id}`); load();
  };

  /* -- Lesson CRUD -- */
  const addLesson = async (s) => {
    try {
      await api.post('/lessons', {
        section_id: s.id, title: `Lesson ${(s.lessons?.length || 0) + 1}`,
        order_index: (s.lessons?.length || 0) + 1, content_type: 'DOCUMENT', content_text: '',
      });
      load();
      toast.success('Đã thêm lesson');
    } catch (err) { toast.error(err.response?.data?.error || 'Lỗi tạo lesson'); }
  };

  const updateLesson = async (l, patch) => {
    try { await api.put(`/lessons/${l.id}`, patch); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Lỗi'); }
  };

  const deleteLesson = async (l) => {
    if (!confirm('Xóa lesson này?')) return;
    await api.delete(`/lessons/${l.id}`); load();
  };

  const deleteActivity = async (a) => {
    if (!confirm('Xóa activity này?')) return;
    await api.delete(`/activities/${a.id}`); load();
  };

  /* -- Helpers -- */
  const getSecType = (type) => SECTION_TYPES.find(t => t.value === type) || SECTION_TYPES[0];
  const getLessonPage = (sId) => lessonPages[sId] || 1;
  const getActivityPage = (sId) => activityPages[sId] || 1;
  const paginate = (arr, page) => arr.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{'Quản lý nội dung khóa học: Section → Lesson → Activity'}</p>
        <button onClick={() => setShowAddSection(true)} className="btn-primary text-sm inline-flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Thêm Section
        </button>
      </div>

      {/* Add Section Panel */}
      {showAddSection && (
        <div className="border-2 border-dashed border-primary-300 rounded-xl bg-gradient-to-r from-primary-50 to-rose-50 p-5 animate-fade-in">
          <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary-600" /> Thêm Section mới
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <input autoFocus className="input-field text-sm" placeholder="Tên section (VD: Grammar Basics)"
              value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSection()} />
            <div className="flex gap-2">
              {SECTION_TYPES.map(t => {
                const SIcon = t.Icon;
                return (
                  <button key={t.value} type="button" onClick={() => setNewSectionType(t.value)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border-2 transition
                      ${newSectionType === t.value ? `${t.color} ${t.border}` : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <SIcon className={`w-5 h-5 mx-auto mb-0.5 ${t.iconColor}`} />
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button onClick={addSection} className="btn-primary text-sm flex-1">Thêm</button>
              <button onClick={() => { setShowAddSection(false); setNewSectionTitle(''); }} className="btn-outline text-sm">Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Sections List */}
      {sections.map((s, idx) => {
        const sType = getSecType(s.section_type);
        const SIcon = sType.Icon;
        const isOpen = openSection === s.id;
        const lessons = s.lessons || [];
        const activities = s.activities || [];
        const lPage = getLessonPage(s.id);
        const aPage = getActivityPage(s.id);
        const paginatedLessons = paginate(lessons, lPage);
        const paginatedActivities = paginate(activities, aPage);

        return (
          <div key={s.id} className={`border rounded-xl bg-white shadow-sm transition hover:shadow-md ${isOpen ? 'ring-1 ring-primary-200' : 'border-gray-200'}`}>
            {/* Section Header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => setOpenSection(isOpen ? null : s.id)} className="p-1 hover:bg-gray-100 rounded transition">
                {isOpen ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
              </button>

              <SIcon className={`w-5 h-5 ${sType.iconColor}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <input value={s.title}
                    onChange={e => setSections(sections.map(x => x.id === s.id ? { ...x, title: e.target.value } : x))}
                    onBlur={() => updateSection(s, { title: sections.find(x => x.id === s.id)?.title })}
                    onClick={e => e.stopPropagation()}
                    className="font-semibold text-gray-900 bg-transparent focus:outline-none focus:bg-gray-50 px-2 py-0.5 rounded min-w-[120px]" />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sType.color}`}>{sType.label}</span>
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    {`${lessons.length} bài học · ${activities.length} bài tập`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-1 focus:ring-primary-300"
                  value={s.section_type} onChange={e => updateSection(s, { section_type: e.target.value })}
                  onClick={e => e.stopPropagation()}>
                  {SECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <span className="text-xs text-gray-300 font-mono">#{idx + 1}</span>
                <button onClick={() => deleteSection(s)} className="p-1.5 hover:bg-rose-50 rounded-lg transition">
                  <Trash2 className="w-4 h-4 text-rose-400 hover:text-rose-600" />
                </button>
              </div>
            </div>

            {/* Section Content */}
            {isOpen && (
              <div className="border-t border-gray-100 bg-gray-50/50">
                {/* LESSONS */}
                <div className="p-4 pb-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-500" /> {`Bài học (${lessons.length})`}
                    </h4>
                    <button onClick={() => setEditingLesson({ sectionId: s.id })}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary-50 transition">
                      <Plus className="w-3.5 h-3.5" /> Thêm bài học
                    </button>
                  </div>

                  {lessons.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                      <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 mb-2">Chưa có bài học nào</p>
                      <button onClick={() => setEditingLesson({ sectionId: s.id })}
                        className="text-xs text-primary-600 hover:underline">+ Thêm bài học đầu tiên</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {paginatedLessons.map((l, li) => (
                        <LessonCard key={l.id} lesson={l}
                          index={(lPage - 1) * ITEMS_PER_PAGE + li}
                          onEdit={() => setEditingLesson({ sectionId: s.id, lesson: l })}
                          onDelete={() => deleteLesson(l)}
                          onPreview={() => setPreviewLesson(l)} />
                      ))}
                    </div>
                  )}

                  <Pagination total={lessons.length} page={lPage} perPage={ITEMS_PER_PAGE}
                    setPage={p => setLessonPages({ ...lessonPages, [s.id]: p })} />
                </div>

                <div className="border-t border-gray-100" />

                {/* ACTIVITIES */}
                <div className="p-4 pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-amber-500" /> {`Bài tập (${activities.length})`}
                    </h4>
                    <button onClick={() => setEditingActivity({ sectionId: s.id })}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary-50 transition">
                      <Plus className="w-3.5 h-3.5" /> Thêm bài tập
                    </button>
                  </div>

                  {activities.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                      <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 mb-2">Chưa có bài tập nào</p>
                      <button onClick={() => setEditingActivity({ sectionId: s.id })}
                        className="text-xs text-primary-600 hover:underline">+ Thêm bài tập đầu tiên</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {paginatedActivities.map((a, ai) => (
                        <ActivityCard key={a.id} activity={a}
                          index={(aPage - 1) * ITEMS_PER_PAGE + ai}
                          onEdit={() => setEditingActivity({ sectionId: s.id, activity: a })}
                          onDelete={() => deleteActivity(a)} />
                      ))}
                    </div>
                  )}

                  <Pagination total={activities.length} page={aPage} perPage={ITEMS_PER_PAGE}
                    setPage={p => setActivityPages({ ...activityPages, [s.id]: p })} />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {sections.length === 0 && !showAddSection && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">Chưa có section nào</p>
          <p className="text-sm text-gray-400 mb-4">Bắt đầu tạo nội dung khóa học</p>
          <button onClick={() => setShowAddSection(true)} className="btn-primary text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Thêm Section
          </button>
        </div>
      )}

      {/* MODALS */}
      {editingLesson && (
        <LessonFormModal
          sectionId={editingLesson.sectionId}
          lesson={editingLesson.lesson}
          onClose={() => setEditingLesson(null)}
          onSaved={() => { setEditingLesson(null); load(); }}
        />
      )}

      {editingActivity && (
        <ActivityFormModal
          sectionId={editingActivity.sectionId}
          activity={editingActivity.activity}
          onClose={() => setEditingActivity(null)}
          onSaved={() => { setEditingActivity(null); load(); }}
        />
      )}

      {previewLesson && (
        <LessonPreviewModal lesson={previewLesson} onClose={() => setPreviewLesson(null)} />
      )}
    </div>
  );
}

/* ═══════════════════ LESSON CARD ═══════════════════ */
function LessonCard({ lesson, index, onEdit, onDelete, onPreview }) {
  const l = lesson;
  const isVideo = l.content_type === 'VIDEO';
  const hasYT = isVideo && extractYouTubeId(l.content_url);

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition group overflow-hidden">
      <div className="flex items-stretch">
        {hasYT ? (
          <div className="w-36 shrink-0 cursor-pointer" onClick={onPreview}>
            <YouTubeThumbnail url={l.content_url} className="h-full rounded-none rounded-l-xl" />
          </div>
        ) : (
          <div className={`w-14 shrink-0 flex items-center justify-center
            ${l.content_type === 'DOCUMENT' ? 'bg-blue-50' : l.content_type === 'EXAMPLE' ? 'bg-amber-50' : 'bg-gray-50'}`}>
            {l.content_type === 'VIDEO' ? <Video className="w-5 h-5 text-red-400" /> :
              l.content_type === 'EXAMPLE' ? <Lightbulb className="w-5 h-5 text-amber-400" /> :
                <FileText className="w-5 h-5 text-blue-400" />}
          </div>
        )}

        <div className="flex-1 min-w-0 px-3 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{l.title}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium
                  ${l.content_type === 'VIDEO' ? 'bg-red-50 text-red-600' :
                    l.content_type === 'EXAMPLE' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                  {CONTENT_TYPES.find(t => t.value === l.content_type)?.label || l.content_type}
                </span>
                {l.duration_minutes && (
                  <span className="text-xs text-gray-400 inline-flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {`${l.duration_minutes} phút`}
                  </span>
                )}
                {l.content_url && !hasYT && (
                  <span className="text-xs text-gray-400 inline-flex items-center gap-0.5">
                    <Link2 className="w-3 h-3" /> Có link
                  </span>
                )}
              </div>
              {l.content_text && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{l.content_text.substring(0, 100)}</p>
              )}
            </div>

            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition">
              {(isVideo || l.content_text) && (
                <button onClick={onPreview} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Xem trước">
                  <Eye className="w-3.5 h-3.5 text-gray-500" />
                </button>
              )}
              <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Sửa">
                <Edit3 className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button onClick={onDelete} className="p-1.5 hover:bg-rose-50 rounded-lg" title="Xóa">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ ACTIVITY CARD ═══════════════════ */
function ActivityCard({ activity, index, onEdit, onDelete }) {
  const a = activity;
  const AIcon = ACTIVITY_ICON_MAP[a.activity_type] || HelpCircle;
  const aColor = ACTIVITY_COLORS[a.activity_type] || 'text-gray-500';

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 p-3 transition group cursor-pointer" onClick={onEdit}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 ${aColor}`}>
          <AIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{ACTIVITY_LABELS[a.activity_type] || a.activity_type}</p>
          <div className="flex items-center gap-3 mt-1.5">
            {a.passing_score != null && (
              <span className="text-xs text-gray-400 inline-flex items-center gap-0.5">
                <Award className="w-3 h-3" /> {a.passing_score}%
              </span>
            )}
            {a.time_limit_minutes && (
              <span className="text-xs text-gray-400 inline-flex items-center gap-0.5">
                <Clock className="w-3 h-3" /> {a.time_limit_minutes}m
              </span>
            )}
            {a.max_attempts && (
              <span className="text-xs text-gray-400">{`${a.max_attempts} lần`}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <Edit3 className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 hover:bg-rose-50 rounded-lg">
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ LESSON FORM MODAL ═══════════════════ */
function LessonFormModal({ sectionId, lesson, onClose, onSaved }) {
  const isEdit = !!lesson;
  const [data, setData] = useState({
    section_id: sectionId,
    title: lesson?.title || '',
    content_type: lesson?.content_type || 'DOCUMENT',
    content_url: lesson?.content_url || '',
    content_text: lesson?.content_text || '',
    duration_minutes: lesson?.duration_minutes || '',
    order_index: lesson?.order_index || 1,
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(lesson?.content_type === 'VIDEO' ? 'video' : 'content');

  const set = (patch) => setData(d => ({ ...d, ...patch }));

  const save = async (e) => {
    e.preventDefault();
    if (!data.title.trim()) return toast.error('Vui lòng nhập tiêu đề bài học');
    setSaving(true);
    try {
      const payload = {
        ...data,
        content_url: data.content_url || null,
        content_text: data.content_text || null,
        duration_minutes: data.duration_minutes ? Number(data.duration_minutes) : null,
        order_index: Number(data.order_index) || 1,
      };
      if (isEdit) await api.put(`/lessons/${lesson.id}`, payload);
      else await api.post('/lessons', payload);
      toast.success(isEdit ? 'Đã cập nhật bài học' : 'Đã tạo bài học');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi lưu bài học');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <form onSubmit={save} onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden animate-scale-in">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-bold">{isEdit ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}</h3>
                <p className="text-emerald-100 text-xs">Tạo nội dung bài giảng cho học viên</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tiêu đề bài học *</label>
              <input required value={data.title} onChange={e => set({ title: e.target.value })} className="input-field"
                placeholder="VD: Introduction to Present Perfect Tense" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Loại nội dung</label>
              <div className="grid grid-cols-3 gap-2">
                {CONTENT_TYPES.map(t => {
                  const Icon = t.icon;
                  const selected = data.content_type === t.value;
                  return (
                    <button key={t.value} type="button" onClick={() => set({ content_type: t.value })}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-medium transition
                        ${selected ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      <Icon className="w-5 h-5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thời lượng (phút)</label>
                <input type="number" min="0" value={data.duration_minutes} onChange={e => set({ duration_minutes: e.target.value })}
                  className="input-field" placeholder="VD: 15" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thứ tự hiển thị</label>
                <input type="number" min="1" value={data.order_index} onChange={e => set({ order_index: e.target.value })}
                  className="input-field" />
              </div>
            </div>
          </div>

          {/* VIDEO content type */}
          {data.content_type === 'VIDEO' && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex border-b border-gray-200 bg-gray-50">
                {[
                  { key: 'video', label: 'Video URL', icon: Link2 },
                  { key: 'upload', label: 'Upload File', icon: Upload },
                  { key: 'content', label: 'Mô tả', icon: FileText },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition
                        ${activeTab === tab.key ? 'border-emerald-500 text-emerald-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      <Icon className="w-3.5 h-3.5" /> {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="p-4">
                {activeTab === 'video' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">YouTube / Vimeo URL</label>
                      <input value={data.content_url} onChange={e => set({ content_url: e.target.value })}
                        className="input-field" placeholder="https://www.youtube.com/watch?v=..." />
                    </div>
                    {extractYouTubeId(data.content_url) && (
                      <div>
                        <p className="text-xs text-gray-400 mb-2">Xem trước:</p>
                        <YouTubeEmbed url={data.content_url} className="max-w-lg" />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'upload' && (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-3">Upload video từ máy tính</p>
                      <FileUploadButton accept="video/*" label="Chọn file video"
                        onUploaded={(res) => set({ content_url: res.url })} />
                      <p className="text-xs text-gray-400 mt-2">{'Hỗ trợ: MP4, WebM, MOV · Tối đa 50MB'}</p>
                    </div>
                    {data.content_url && !extractYouTubeId(data.content_url) && (
                      <div className="p-2 bg-gray-50 rounded-lg flex items-center gap-2 text-sm">
                        <Link2 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 truncate flex-1">{data.content_url}</span>
                        <button type="button" onClick={() => set({ content_url: '' })} className="text-rose-400 hover:text-rose-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'content' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Mô tả / Transcript video</label>
                    <textarea value={data.content_text} onChange={e => set({ content_text: e.target.value })}
                      className="input-field min-h-[150px]" placeholder="Mô tả nội dung video, transcript..." />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DOCUMENT / EXAMPLE content type */}
          {data.content_type !== 'VIDEO' && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex border-b border-gray-200 bg-gray-50">
                {[
                  { key: 'content', label: 'Nội dung', icon: FileText },
                  { key: 'upload', label: 'Upload tài liệu', icon: Upload },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition
                        ${activeTab === tab.key ? 'border-emerald-500 text-emerald-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      <Icon className="w-3.5 h-3.5" /> {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="p-4">
                {activeTab === 'content' && (
                  <textarea value={data.content_text} onChange={e => set({ content_text: e.target.value })}
                    className="input-field min-h-[250px] font-mono text-sm"
                    placeholder="Viết nội dung bài học (hỗ trợ markdown)..." />
                )}

                {activeTab === 'upload' && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-3">Upload tài liệu đính kèm</p>
                    <FileUploadButton accept=".pdf,.doc,.docx,image/*,audio/*" label="Chọn file"
                      onUploaded={(res) => set({ content_url: res.url })} />
                    <p className="text-xs text-gray-400 mt-2">{'Hỗ trợ: PDF, DOC, hình ảnh, audio · Tối đa 50MB'}</p>
                    {data.content_url && (
                      <div className="mt-3 p-2 bg-gray-50 rounded-lg inline-flex items-center gap-2 text-sm">
                        <Link2 className="w-4 h-4 text-gray-400" />
                        <a href={data.content_url} target="_blank" rel="noopener noreferrer"
                          className="text-primary-600 hover:underline truncate max-w-[300px]">{data.content_url}</a>
                        <button type="button" onClick={() => set({ content_url: '' })} className="text-rose-400 hover:text-rose-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400">* Các trường bắt buộc</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-outline">Hủy</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo bài học'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════ LESSON PREVIEW MODAL ═══════════════════ */
function LessonPreviewModal({ lesson, onClose }) {
  const l = lesson;
  const hasYT = l.content_type === 'VIDEO' && extractYouTubeId(l.content_url);
  const hasDirectVideo = l.content_type === 'VIDEO' && l.content_url && !hasYT;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{l.title}</h3>
            <p className="text-xs text-gray-400">
              {CONTENT_TYPES.find(t => t.value === l.content_type)?.label}
              {l.duration_minutes ? ` · ${l.duration_minutes} phút` : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {hasYT && <YouTubeEmbed url={l.content_url} />}
          {hasDirectVideo && <video controls className="w-full rounded-lg" src={l.content_url} />}

          {l.content_url && !hasYT && !hasDirectVideo && (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
              <Link2 className="w-4 h-4 text-gray-400" />
              <a href={l.content_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm">
                {l.content_url}
              </a>
            </div>
          )}

          {l.content_text && (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm text-gray-700">{l.content_text}</div>
            </div>
          )}

          {!l.content_url && !l.content_text && (
            <p className="text-center text-gray-400 py-8">Chưa có nội dung</p>
          )}
        </div>
      </div>
    </div>
  );
}
