import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Loader2, Users } from 'lucide-react';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/classes').then(r => setClasses(r.data.classes || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const remove = async (id) => {
    if (!confirm('Xóa lớp này?')) return;
    try { await api.delete(`/classes/${id}`); toast.success('Đã xóa'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Xóa thất bại'); }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Quản lý Lớp học</h1>
        <Link to="/admin/classes/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tạo lớp mới
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Tên lớp</th>
              <th className="px-6 py-3 text-left">Khóa học</th>
              <th className="px-6 py-3 text-left">Giáo viên</th>
              <th className="px-6 py-3 text-left">Học viên</th>
              <th className="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {classes.map(c => (
              <tr key={c.id}>
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  {c.schedule_text && <p className="text-xs text-gray-500">{c.schedule_text}</p>}
                </td>
                <td className="px-6 py-4 text-gray-700">{c.course?.title || '—'}</td>
                <td className="px-6 py-4 text-gray-700">{c.teacher?.full_name || '—'}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" /> {c.students_count || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link to={`/admin/classes/${c.id}/edit`} className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 mr-3">
                    <Edit className="w-4 h-4" /> Quản lý
                  </Link>
                  <button onClick={() => remove(c.id)} className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700">
                    <Trash2 className="w-4 h-4" /> Xóa
                  </button>
                </td>
              </tr>
            ))}
            {classes.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">Chưa có lớp nào</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
