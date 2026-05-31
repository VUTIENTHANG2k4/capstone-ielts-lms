import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FileText, Search, Info, Clock, Hash, Target } from 'lucide-react';

const TEST_TYPES = [
  { value: '', label: 'Tất cả loại' },
  { value: 'MOCK', label: 'Mock Test' },
  { value: 'PLACEMENT', label: 'Placement Test' },
  { value: 'CHECKPOINT', label: 'Checkpoint' },
];

const SKILLS = [
  { value: '', label: 'Tất cả kỹ năng' },
  { value: 'LISTENING', label: 'Listening' },
  { value: 'READING', label: 'Reading' },
  { value: 'WRITING', label: 'Writing' },
  { value: 'SPEAKING', label: 'Speaking' },
  { value: 'FULL', label: 'Full Test' },
];

const skillColors = {
  LISTENING: 'bg-blue-100 text-blue-700',
  READING: 'bg-green-100 text-green-700',
  WRITING: 'bg-amber-100 text-amber-700',
  SPEAKING: 'bg-purple-100 text-purple-700',
  FULL: 'bg-rose-100 text-rose-700',
};

const typeColors = {
  MOCK: 'bg-indigo-100 text-indigo-700',
  PLACEMENT: 'bg-emerald-100 text-emerald-700',
  CHECKPOINT: 'bg-orange-100 text-orange-700',
};

export default function TeacherMockTests() {
  const [mockTests, setMockTests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  useEffect(() => {
    api.get('/mock-tests')
      .then(res => {
        const list = res.data.mock_tests || [];
        setMockTests(list);
        setFiltered(list);
      })
      .catch(err => {
        console.error(err);
        toast.error('Không thể tải danh sách bài thi');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = mockTests;
    if (typeFilter) result = result.filter(mt => mt.test_type === typeFilter);
    if (skillFilter) result = result.filter(mt => mt.skill === skillFilter);
    if (search.trim()) result = result.filter(mt => mt.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, typeFilter, skillFilter, mockTests]);

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">Bài thi thử IELTS</h1>
        <p className="text-sm text-gray-500 mt-1">{filtered.length} bài thi đang hoạt động</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài thi..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-field">
              {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)} className="input-field">
              {SKILLS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Không tìm thấy bài thi nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(mt => (
            <div key={mt.id} className="card-elevated p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow">
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColors[mt.test_type] || 'bg-gray-100 text-gray-700'}`}>
                  {mt.test_type}
                </span>
                {mt.skill && (
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${skillColors[mt.skill] || 'bg-gray-100 text-gray-700'}`}>
                    {mt.skill}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 leading-snug">{mt.title}</h3>
                {mt.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{mt.description}</p>}
              </div>

              <div className="flex gap-4 text-xs text-gray-500 pt-1 border-t border-gray-100">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {mt.time_limit_minutes} phút</span>
                <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> {mt.total_questions} câu</span>
                <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {mt.passing_score}%</span>
              </div>

              <Link
                to={`/teacher/mock-tests/${mt.id}`}
                className="btn-outline gap-2 text-sm w-full justify-center mt-auto"
              >
                <Info className="w-4 h-4" /> Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
