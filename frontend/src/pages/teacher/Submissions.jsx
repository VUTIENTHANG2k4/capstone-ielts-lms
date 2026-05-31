import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { FileText, Filter } from 'lucide-react';

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    setLoading(true);
    api.get(`/submissions?status=${statusFilter}&limit=50`)
      .then(res => setSubmissions(res.data.submissions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const statusBadge = (status) => {
    switch (status) {
      case 'pending':
      case 'in_review': return 'badge-warning';
      case 'graded': return 'badge-success';
      default: return 'badge-gray';
    }
  };

  const statusLabel = (status) => {
    if (status === 'graded') return 'Đã chấm';
    if (status === 'in_review') return 'Đang chấm';
    return 'Chờ chấm';
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Bài nộp</h1>
          <p className="text-gray-500">Danh sách bài Writing / Speaking của học viên</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field py-2 text-sm"
          >
            <option value="pending">Chờ chấm</option>
            <option value="graded">Đã chấm</option>
            <option value="">Tất cả</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent"></div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Không có bài nộp nào</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3">Học viên</th>
                <th className="px-6 py-3">Bài tập</th>
                <th className="px-6 py-3">Loại</th>
                <th className="px-6 py-3">Ngày nộp</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{sub.user_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600">{sub.activity_title || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{sub.submission_type || 'Writing'}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{new Date(sub.submitted_at).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4">
                    <span className={statusBadge(sub.status)}>{statusLabel(sub.status)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/teacher/submissions/${sub.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      {sub.status === 'graded' ? 'Xem lại' : 'Chấm bài'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
