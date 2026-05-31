import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  Clock, Send, ChevronLeft, ChevronRight,
  Volume2, BookOpen, PenTool, Headphones, Mic, Link as LinkIcon, Upload, CheckCircle,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatTime(s) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function countWords(text) {
  if (!text?.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

// ── Shared: mini question-number navigator ─────────────────────────────────────
function QuestionGrid({ questions, currentQ, answers, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
            i === currentQ
              ? 'bg-primary-600 text-white shadow'
              : answers[q.id] !== undefined
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}

// ── Shared: answer input renderer ─────────────────────────────────────────────
function AnswerInput({ question, answers, setAnswer }) {
  if (!question) return null;
  const content = question.content || {};
  const options =
    content.options?.filter(o => o !== '') ||
    (question.question_type === 'true_false_ng' ? ['True', 'False', 'Not Given'] : null);

  if (options?.length) {
    return (
      <div className="space-y-3">
        {options.map((opt, oi) => (
          <label
            key={oi}
            onClick={() => setAnswer(question.id, opt)}
            className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all ${
              answers[question.id] === opt
                ? 'border-primary-500 bg-primary-50 shadow-sm'
                : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
              answers[question.id] === opt ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {String.fromCharCode(65 + oi)}
            </div>
            <span className="text-gray-700 leading-snug">{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Câu trả lời của bạn</label>
      <input
        value={answers[question.id] || ''}
        onChange={e => setAnswer(question.id, e.target.value)}
        className="input-field"
        placeholder="Nhập đáp án..."
      />
    </div>
  );
}

// ── Right panel: question + navigation ────────────────────────────────────────
function RightPanel({ questions, currentQ, setCurrentQ, answers, setAnswer }) {
  const q = questions[currentQ];
  const content = q?.content || {};
  const questionText = content.text || content.question || content.prompt || `Câu hỏi ${currentQ + 1}`;

  return (
    <div className="flex flex-col h-full">
      {/* Question grid */}
      <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <QuestionGrid
          questions={questions}
          currentQ={currentQ}
          answers={answers}
          onSelect={setCurrentQ}
        />
        <div className="flex gap-4 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200 inline-block" />
            Đã trả lời
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded border border-gray-200 inline-block" />
            Chưa trả lời
          </span>
        </div>
      </div>

      {/* Current question */}
      <div className="flex-1 overflow-y-auto p-5">
        {q ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              {q.section_label && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {q.section_label}
                </span>
              )}
              <span className="text-sm text-gray-500">
                Câu {currentQ + 1} / {questions.length}
              </span>
            </div>

            {content.image_url && (
              <img
                src={content.image_url}
                alt=""
                className="mb-4 max-h-48 rounded-xl border object-contain"
              />
            )}

            <h2 className="text-base font-semibold text-gray-900 mb-5 leading-relaxed whitespace-pre-line">
              {questionText}
            </h2>

            <AnswerInput question={q} answers={answers} setAnswer={setAnswer} />
          </div>
        ) : (
          <div className="text-gray-400 text-center py-10">Không có câu hỏi</div>
        )}
      </div>

      {/* Prev / Next */}
      <div className="px-5 py-3 border-t border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="btn-secondary gap-2 disabled:opacity-40 text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Câu trước
        </button>
        <span className="text-xs text-gray-400">{currentQ + 1} / {questions.length}</span>
        <button
          onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
          disabled={currentQ === questions.length - 1}
          className="btn-secondary gap-2 disabled:opacity-40 text-sm"
        >
          Câu sau <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── LISTENING left panel ───────────────────────────────────────────────────────
function ListeningLeftPanel({ sectionsConfig, questions, currentQ, setCurrentQ, currentSectionLabel }) {
  const parts = sectionsConfig?.listening?.parts || [];
  const sectionKeys = useMemo(
    () => [...new Set(questions.map(q => q.section_label).filter(Boolean))],
    [questions]
  );

  const currentPart = parts.find(p => `Part ${p.number}` === currentSectionLabel) || parts[0];

  const goToSection = (label) => {
    const idx = questions.findIndex(q => q.section_label === label);
    if (idx >= 0) setCurrentQ(idx);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Part tabs */}
      <div className="px-5 py-3 border-b border-gray-200 bg-blue-50 flex-shrink-0">
        <div className="flex gap-2 flex-wrap">
          {sectionKeys.map(label => (
            <button
              key={label}
              onClick={() => goToSection(label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                currentSectionLabel === label
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Part content */}
      <div className="flex-1 overflow-y-auto p-5">
        {currentPart ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <h3 className="font-bold text-gray-800 text-base">{currentPart.title || currentSectionLabel}</h3>
            </div>

            {currentPart.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{currentPart.description}</p>
            )}

            {/* Audio player — sticky inside the left panel */}
            {currentPart.audioUrl && (
              <div className="sticky top-0 bg-white border border-blue-100 rounded-xl p-3 shadow-sm z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-600">
                    Audio – {currentPart.title}
                  </span>
                </div>
                <audio controls src={currentPart.audioUrl} className="w-full" />
              </div>
            )}

            {!currentPart.audioUrl && (
              <div className="border border-dashed border-blue-200 rounded-xl p-4 text-center text-sm text-blue-400">
                Chưa có file audio cho part này
              </div>
            )}

            {/* Part image */}
            {currentPart.imageUrl && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Hình ảnh đề bài</p>
                <img
                  src={currentPart.imageUrl}
                  alt="Part visual"
                  className="w-full rounded-xl border object-contain max-h-96"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 text-sm text-center py-8">
            Chọn một Part để xem nội dung
          </div>
        )}
      </div>
    </div>
  );
}

// ── READING left panel ─────────────────────────────────────────────────────────
function ReadingLeftPanel({ sectionsConfig, questions, currentQ, setCurrentQ, currentSectionLabel }) {
  const passages = sectionsConfig?.reading?.passages || [];
  const sectionKeys = useMemo(
    () => [...new Set(questions.map(q => q.section_label).filter(Boolean))],
    [questions]
  );

  const currentPassage = passages.find(p => `Passage ${p.number}` === currentSectionLabel) || passages[0];

  const goToSection = (label) => {
    const idx = questions.findIndex(q => q.section_label === label);
    if (idx >= 0) setCurrentQ(idx);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Passage tabs */}
      <div className="px-5 py-3 border-b border-gray-200 bg-emerald-50 flex-shrink-0">
        <div className="flex gap-2 flex-wrap">
          {sectionKeys.map(label => (
            <button
              key={label}
              onClick={() => goToSection(label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                currentSectionLabel === label
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Passage content */}
      <div className="flex-1 overflow-y-auto p-5">
        {currentPassage ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <h3 className="font-bold text-gray-800 text-base">
                {currentPassage.title || currentSectionLabel}
              </h3>
            </div>

            {currentPassage.imageUrl && (
              <img
                src={currentPassage.imageUrl}
                alt="Passage visual"
                className="w-full rounded-xl border object-contain max-h-64"
              />
            )}

            {currentPassage.passageText ? (
              <div className="text-gray-700 leading-[1.9] text-sm whitespace-pre-line font-serif border-l-4 border-emerald-200 pl-4">
                {currentPassage.passageText}
              </div>
            ) : (
              <div className="border border-dashed border-emerald-200 rounded-xl p-4 text-center text-sm text-emerald-400">
                Chưa có nội dung bài đọc cho passage này
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 text-sm text-center py-8">
            Chọn một Passage để đọc bài
          </div>
        )}
      </div>
    </div>
  );
}

// ── WRITING layout (full-width split) ─────────────────────────────────────────
function WritingLayout({ sectionsConfig, answers, setAnswer, currentQ, setCurrentQ }) {
  const tasks = sectionsConfig?.writing?.tasks || [];
  const task = tasks[currentQ] || tasks[0];
  const taskKey = `task_${currentQ + 1}`;
  const essay = answers[taskKey] || '';
  const words = countWords(essay);
  const minWords = task?.minWords || 0;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: task prompt */}
      <div className="w-1/2 flex flex-col border-r border-gray-200 overflow-hidden bg-white">
        {/* Task tabs */}
        {tasks.length > 1 && (
          <div className="px-5 py-3 border-b border-gray-200 bg-purple-50 flex gap-2 flex-shrink-0">
            {tasks.map((t, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  currentQ === i
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-50'
                }`}
              >
                {t.title || `Task ${i + 1}`}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {task ? (
            <>
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <h3 className="font-bold text-gray-800 text-base">{task.title || `Task ${currentQ + 1}`}</h3>
              </div>

              {task.imageUrl && (
                <img
                  src={task.imageUrl}
                  alt="Task visual"
                  className="w-full rounded-xl border object-contain max-h-72"
                />
              )}

              {task.prompt && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {task.prompt}
                </div>
              )}

              <div className="flex gap-4 text-xs text-gray-400 pt-1">
                <span>Tối thiểu: <strong className="text-gray-600">{minWords} từ</strong></span>
                {task.timeRecommended > 0 && (
                  <span>Thời gian đề xuất: <strong className="text-gray-600">{task.timeRecommended} phút</strong></span>
                )}
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-sm text-center py-8">Không có đề bài</div>
          )}
        </div>
      </div>

      {/* Right: writing area */}
      <div className="w-1/2 flex flex-col bg-gray-50">
        {tasks.length > 1 && (
          <div className="px-5 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            <span className="text-sm font-semibold text-gray-700">Bài viết – {task?.title}</span>
          </div>
        )}

        <div className="flex-1 flex flex-col p-5 gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">Bài viết của bạn</label>
            <span className={`text-sm font-bold ${
              words >= minWords ? 'text-emerald-600' : 'text-gray-400'
            }`}>
              {words} từ {minWords > 0 ? `/ tối thiểu ${minWords}` : ''}
            </span>
          </div>
          <textarea
            className="flex-1 input-field text-sm resize-none leading-relaxed"
            placeholder={`Viết bài ${task?.title || ''} của bạn vào đây...`}
            value={essay}
            onChange={e => setAnswer(taskKey, e.target.value)}
          />
        </div>

        {/* Task navigation */}
        {tasks.length > 1 && (
          <div className="px-5 py-3 border-t border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="btn-secondary gap-2 disabled:opacity-40 text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Task trước
            </button>
            <span className="text-xs text-gray-400">{currentQ + 1} / {tasks.length}</span>
            <button
              onClick={() => setCurrentQ(Math.min(tasks.length - 1, currentQ + 1))}
              disabled={currentQ === tasks.length - 1}
              className="btn-secondary gap-2 disabled:opacity-40 text-sm"
            >
              Task sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SPEAKING layout ────────────────────────────────────────────────────────────
function SpeakingLayout({ questions, answers, setAnswer, currentQ, setCurrentQ }) {
  const q = questions[currentQ];
  const content = q?.content || {};
  const answerKey = q?.id;
  const currentAnswer = answers[answerKey] || '';
  const [uploading, setUploading] = useState(false);
  const [inputMode, setInputMode] = useState('link'); // 'link' | 'upload'

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      toast.error('Chỉ chấp nhận file audio (MP3, WAV, OGG...)');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAnswer(answerKey, res.data.url);
      toast.success('Upload thành công!');
    } catch {
      toast.error('Upload thất bại, vui lòng dùng link Drive');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: question prompt */}
      <div className="w-1/2 flex flex-col border-r border-gray-200 overflow-hidden bg-white">
        {/* Question tabs */}
        <div className="px-5 py-3 border-b border-gray-200 bg-orange-50 flex-shrink-0">
          <div className="flex gap-2 flex-wrap">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  currentQ === i
                    ? 'bg-orange-500 text-white shadow'
                    : 'bg-white border border-orange-200 text-orange-700 hover:bg-orange-50'
                }`}
              >
                Part {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <h3 className="font-bold text-gray-800 text-base">
              {content.text || content.question || `Speaking Part ${currentQ + 1}`}
            </h3>
          </div>

          {content.image_url && (
            <img src={content.image_url} alt="" className="w-full rounded-xl border object-contain max-h-64" />
          )}

          {content.audio_url && (
            <div className="bg-white border border-orange-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-semibold text-orange-600">Audio đề bài</span>
              </div>
              <audio controls src={content.audio_url} className="w-full" />
            </div>
          )}

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
            <p className="font-semibold text-orange-700 mb-2">Hướng dẫn:</p>
            <ul className="space-y-1 text-gray-600 list-disc list-inside">
              <li>Ghi âm phần trả lời của bạn</li>
              <li>Upload file MP3 trực tiếp <strong>hoặc</strong> dán link Google Drive</li>
              <li>Đảm bảo link Drive ở chế độ "Ai có link đều xem được"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right: answer submission */}
      <div className="w-1/2 flex flex-col bg-gray-50">
        <div className="px-5 py-3 border-b border-gray-200 bg-white flex-shrink-0">
          <span className="text-sm font-semibold text-gray-700">
            Câu {currentQ + 1} / {questions.length} — Nộp bài Speaking
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Mode toggle */}
          <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden">
            <button
              onClick={() => setInputMode('link')}
              className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                inputMode === 'link' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <LinkIcon className="w-4 h-4" /> Link Google Drive
            </button>
            <button
              onClick={() => setInputMode('upload')}
              className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                inputMode === 'upload' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Upload className="w-4 h-4" /> Upload MP3
            </button>
          </div>

          {inputMode === 'link' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Link Google Drive / Bất kỳ URL audio
              </label>
              <input
                type="url"
                value={currentAnswer}
                onChange={e => setAnswer(answerKey, e.target.value)}
                placeholder="https://drive.google.com/..."
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">
                Đảm bảo file ở chế độ "Ai có link đều xem được"
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload file âm thanh (MP3, WAV, OGG)
              </label>
              <label className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                uploading ? 'border-orange-300 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
              }`}>
                <input type="file" accept="audio/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-400 border-t-transparent" />
                    <span className="text-sm text-orange-600 font-medium">Đang upload...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-10 h-10 text-gray-300" />
                    <span className="text-sm text-gray-500">Nhấn để chọn file audio</span>
                  </>
                )}
              </label>
            </div>
          )}

          {/* Preview / status */}
          {currentAnswer && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Đã có bài nộp</span>
              </div>
              {currentAnswer.startsWith('http') && (
                currentAnswer.includes('drive.google.com') || !currentAnswer.match(/\.(mp3|wav|ogg|m4a|webm)$/i) ? (
                  <a href={currentAnswer} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-blue-600 underline break-all">
                    {currentAnswer}
                  </a>
                ) : (
                  <audio controls src={currentAnswer} className="w-full mt-2" />
                )
              )}
              <button
                onClick={() => setAnswer(answerKey, '')}
                className="mt-2 text-xs text-red-400 hover:text-red-600 underline"
              >
                Xóa và nộp lại
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-5 py-3 border-t border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="btn-secondary gap-2 disabled:opacity-40 text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Phần trước
          </button>
          <span className="text-xs text-gray-400">{currentQ + 1} / {questions.length}</span>
          <button
            onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
            disabled={currentQ === questions.length - 1}
            className="btn-secondary gap-2 disabled:opacity-40 text-sm"
          >
            Phần sau <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Default left panel (SPEAKING, FULL, no skill) ──────────────────────────────
function DefaultLeftPanel({ question }) {
  const content = question?.content || {};
  if (!content.passage && !content.audio_url) {
    return (
      <div className="p-6 text-gray-300 text-sm text-center">
        Nội dung đề bài
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4 overflow-y-auto h-full">
      {content.audio_url && (
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-gray-600">Audio</span>
          </div>
          <audio controls src={content.audio_url} className="w-full" />
        </div>
      )}
      {content.passage && (
        <div className="text-gray-700 text-sm leading-[1.9] whitespace-pre-line font-serif">
          {content.passage}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MockTestTaking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mockTest, setMockTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);

  // Init
  useEffect(() => {
    const init = async () => {
      try {
        const testRes = await api.get(`/mock-tests/${id}`);
        setMockTest(testRes.data.mock_test);
        setQuestions(testRes.data.questions || []);

        const startRes = await api.post(`/mock-tests/${id}/start`);
        const att = startRes.data.attempt;
        setAttempt(att);
        if (att.answers) setAnswers(att.answers);

        setTimeLeft(testRes.data.mock_test.time_limit_minutes * 60);
      } catch {
        toast.error('Không thể bắt đầu bài thi');
        navigate('/student/mock-tests');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, navigate]);

  // Timer
  useEffect(() => {
    if (!timeLeft || !attempt) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [attempt]);

  // Auto-save every 30s
  useEffect(() => {
    if (!attempt) return;
    autoSaveRef.current = setInterval(() => {
      api.put(`/mock-tests/attempts/${attempt.id}/save`, { answers }).catch(() => {});
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [attempt, answers]);

  const handleSubmit = useCallback(async (isAuto = false) => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    clearInterval(autoSaveRef.current);
    try {
      await api.post(`/mock-tests/attempts/${attempt.id}/submit`, {
        answers,
        is_auto_submitted: isAuto,
      });
      if (isAuto) toast('Hết giờ! Bài thi đã được nộp tự động.', { icon: '⏰' });
      else toast.success('Nộp bài thành công!');
      navigate(`/student/mock-tests/result/${attempt.id}`);
    } catch {
      toast.error('Lỗi khi nộp bài');
      setSubmitting(false);
    }
  }, [attempt, answers, submitting, navigate]);

  const setAnswer = (key, value) =>
    setAnswers(prev => ({ ...prev, [key]: value }));

  // ── Derived ──────────────────────────────────────────────────
  const skill = mockTest?.skill;
  const sectionsConfig = mockTest?.sections_config;
  const currentQuestion = questions[currentQ];
  const currentSectionLabel = currentQuestion?.section_label || '';

  const answeredCount = useMemo(() => {
    if (skill === 'WRITING') {
      const tasks = sectionsConfig?.writing?.tasks || [];
      return tasks.filter((_, i) => answers[`task_${i + 1}`]?.trim()).length;
    }
    if (skill === 'SPEAKING') {
      return questions.filter(q => answers[q.id]?.trim()).length;
    }
    return Object.keys(answers).filter(k => answers[k] !== '' && answers[k] !== undefined).length;
  }, [skill, sectionsConfig, questions, answers]);

  const totalCount = skill === 'WRITING'
    ? (sectionsConfig?.writing?.tasks?.length || 0)
    : questions.length;

  const skillColor = {
    LISTENING: 'bg-blue-100 text-blue-700',
    READING: 'bg-emerald-100 text-emerald-700',
    WRITING: 'bg-purple-100 text-purple-700',
    SPEAKING: 'bg-orange-100 text-orange-700',
  }[skill] || 'bg-gray-100 text-gray-600';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const isWriting = skill === 'WRITING';
  const isSpeaking = skill === 'SPEAKING';
  const showSplitPanel = skill === 'LISTENING' || skill === 'READING' ||
    (currentQuestion?.content?.passage) || (currentQuestion?.content?.audio_url);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between flex-shrink-0 z-50">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="font-display font-bold text-gray-900 truncate text-sm md:text-base">
            {mockTest?.title}
          </h1>
          {skill && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${skillColor}`}>
              {skill}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-gray-400 hidden sm:block">
            {answeredCount} / {totalCount} {isWriting ? 'tasks' : isSpeaking ? 'đã nộp' : 'đã trả lời'}
          </span>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm ${
            timeLeft < 300 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-700'
          }`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="btn-primary gap-2 text-sm"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </header>

      {/* ── Submit Confirm Modal ─────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !submitting && setShowConfirm(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-primary-500 to-primary-700" />

            <div className="p-8">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-5">
                <Send className="w-7 h-7 text-primary-600" />
              </div>

              <h2 className="text-xl font-display font-bold text-gray-900 text-center mb-2">
                Xác nhận nộp bài
              </h2>
              <p className="text-gray-500 text-center text-sm mb-6">
                Bạn đã trả lời{' '}
                <span className={`font-bold ${answeredCount < totalCount ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {answeredCount}/{totalCount}
                </span>{' '}
                câu hỏi.
                {answeredCount < totalCount && (
                  <span className="block text-amber-600 text-xs mt-1">
                    Còn {totalCount - answeredCount} câu chưa trả lời. Bạn có chắc muốn nộp không?
                  </span>
                )}
              </p>

              {/* Stats bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                <div
                  className={`h-2 rounded-full transition-all ${answeredCount === totalCount ? 'bg-emerald-500' : 'bg-amber-400'}`}
                  style={{ width: `${totalCount > 0 ? (answeredCount / totalCount) * 100 : 0}%` }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={submitting}
                  className="flex-1 btn-outline py-3 text-sm font-semibold"
                >
                  Làm tiếp
                </button>
                <button
                  onClick={() => { setShowConfirm(false); handleSubmit(false); }}
                  disabled={submitting}
                  className="flex-1 btn-primary py-3 text-sm font-semibold gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Đang nộp...
                    </>
                  ) : (
                    <><Send className="w-4 h-4" /> Nộp bài</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Body ─────────────────────────────────────────────── */}
      {isWriting ? (
        <WritingLayout
          sectionsConfig={sectionsConfig}
          answers={answers}
          setAnswer={setAnswer}
          currentQ={currentQ}
          setCurrentQ={setCurrentQ}
        />
      ) : isSpeaking ? (
        <SpeakingLayout
          questions={questions}
          answers={answers}
          setAnswer={setAnswer}
          currentQ={currentQ}
          setCurrentQ={setCurrentQ}
        />
      ) : showSplitPanel ? (
        /* Split-screen for Listening & Reading */
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col overflow-hidden bg-white">
            {skill === 'LISTENING' && (
              <ListeningLeftPanel
                sectionsConfig={sectionsConfig}
                questions={questions}
                currentQ={currentQ}
                setCurrentQ={setCurrentQ}
                currentSectionLabel={currentSectionLabel}
              />
            )}
            {skill === 'READING' && (
              <ReadingLeftPanel
                sectionsConfig={sectionsConfig}
                questions={questions}
                currentQ={currentQ}
                setCurrentQ={setCurrentQ}
                currentSectionLabel={currentSectionLabel}
              />
            )}
            {skill !== 'LISTENING' && skill !== 'READING' && (
              <DefaultLeftPanel question={currentQuestion} />
            )}
          </div>

          {/* Right panel */}
          <div className="w-1/2 flex flex-col overflow-hidden bg-gray-50">
            <RightPanel
              questions={questions}
              currentQ={currentQ}
              setCurrentQ={setCurrentQ}
              answers={answers}
              setAnswer={setAnswer}
            />
          </div>
        </div>
      ) : (
        /* Single-panel fallback (no passage/audio content) */
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 max-w-3xl mx-auto w-full">
            <RightPanel
              questions={questions}
              currentQ={currentQ}
              setCurrentQ={setCurrentQ}
              answers={answers}
              setAnswer={setAnswer}
            />
          </div>
        </div>
      )}
    </div>
  );
}
