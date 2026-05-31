import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, FileText, Search, Filter, Eye, EyeOff, Users, Info } from 'lucide-react';

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

export default function AdminMockTests() {
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0 });

  const loadMockTests = (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (typeFilter) params.set('type', typeFilter);
    if (skillFilter) params.set('skill', skillFilter);
    if (search) params.set('search', search);

    api.get(`/mock-tests/admin/all?${params}`)
      .then(res => {
        setMockTests(res.data.mock_tests || []);
        setPagination(res.data.pagination || { total: 0, page: 1, pages: 0 });
      })
      .catch(err => {
        console.error(err);
        toast.error('Không thể tải danh sách bài thi');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMockTests(); }, [typeFilter, skillFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadMockTests(1);
  };

  const handleDelete = async (mt) => {
    if (!window.confirm(`Xóa bài thi "${mt.title}"?`)) return;
    try {
      const res = await api.delete(`/mock-tests/admin/${mt.id}`);
      toast.success(res.data.message);
      loadMockTests(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi xóa');
    }
  };

  const toggleActive = async (mt) => {
    try {
      await api.put(`/mock-tests/admin/${mt.id}`, { is_active: !mt.is_active });
      toast.success(mt.is_active ? 'Đã ẩn bài thi' : 'Đã kích hoạt bài thi');
      loadMockTests(pagination.page);
    } catch (err) {
      toast.error('Cập nhật thất bại');
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Quản lý Thi thử</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng cộng {pagination.total} bài thi</p>
        </div>
        <Link to="/admin/mock-tests/new" className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Tạo bài thi
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
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
            <button type="submit" className="btn-outline">Tìm</button>
          </form>
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
      ) : mockTests.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có bài thi nào</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tên bài thi</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Loại</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Kỹ năng</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Câu hỏi</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Thời gian</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Lượt thi</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Trạng thái</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {mockTests.map(mt => (
                  <tr key={mt.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">{mt.title}</p>
                      {mt.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{mt.description}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColors[mt.test_type] || 'bg-gray-100 text-gray-700'}`}>
                        {mt.test_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {mt.skill && (
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${skillColors[mt.skill] || 'bg-gray-100 text-gray-700'}`}>
                          {mt.skill}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">{mt.total_questions}</td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">{mt.time_limit_minutes} phút</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-3.5 h-3.5" /> {mt.attempts_count}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => toggleActive(mt)} title={mt.is_active ? 'Ẩn bài thi' : 'Hiện bài thi'}>
                        {mt.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                            <Eye className="w-3 h-3" /> Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            <EyeOff className="w-3 h-3" /> Đã ẩn
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/mock-tests/${mt.id}`} className="p-2 hover:bg-blue-50 rounded-lg" title="Xem chi tiết">
                          <Info className="w-4 h-4 text-blue-500" />
                        </Link>
                        <Link to={`/admin/mock-tests/${mt.id}/edit`} className="p-2 hover:bg-gray-100 rounded-lg" title="Chỉnh sửa">
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </Link>
                        <button onClick={() => handleDelete(mt)} className="p-2 hover:bg-red-50 rounded-lg" title="Xóa">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => loadMockTests(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    pagination.page === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
