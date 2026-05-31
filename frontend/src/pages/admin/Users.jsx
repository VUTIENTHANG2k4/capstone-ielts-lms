import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { UserPlus, Pencil, Trash2, Search, X } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | user object for edit

  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'student' });

  const loadUsers = () => {
    setLoading(true);
    api.get('/admin/users')
      .then(res => setUsers(res.data.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const openCreate = () => {
    setForm({ full_name: '', email: '', password: '111111', role: 'student' });
    setModal('create');
  };

  const openEdit = (user) => {
    setForm({ full_name: user.full_name, email: user.email, password: '', role: user.role });
    setModal(user);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'create') {
        await api.post('/admin/users', form);
        toast.success('Tạo người dùng thành công');
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/users/${modal.id}`, payload);
        toast.success('Cập nhật thành công');
      }
      setModal(null);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Xóa user ${user.email}?`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      toast.success('Đã xóa');
      loadUsers();
    } catch (err) {
      toast.error('Lỗi khi xóa');
    }
  };

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role) => {
    switch (role) {
      case 'admin': return 'badge-danger';
      case 'teacher': return 'badge-warning';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">Quản lý người dùng</h1>
        <button onClick={openCreate} className="btn-primary gap-2">
          <UserPlus className="w-4 h-4" /> Thêm mới
        </button>
      </div>

      <div className="card mb-6">
        <div className="p-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm" placeholder="Tìm theo tên, email..."
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3">Họ tên</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Vai trò</th>
                <th className="px-6 py-3">Ngày tạo</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4"><span className={roleBadge(user.role)}>{user.role}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(user)} className="p-2 hover:bg-gray-100 rounded-lg">
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => handleDelete(user)} className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold text-gray-900">
                {modal === 'create' ? 'Thêm người dùng' : 'Sửa người dùng'}
              </h3>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                <input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu {modal !== 'create' && '(để trống = không đổi)'}
                </label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field" {...(modal === 'create' ? { required: true } : {})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-field">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full">Lưu</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
