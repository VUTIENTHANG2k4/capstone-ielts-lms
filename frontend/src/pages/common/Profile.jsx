import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      toast.success('Cập nhật thành công');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi');
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setChangingPw(true);
    try {
      await api.put('/auth/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      toast.success('Đổi mật khẩu thành công');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="page-container animate-fade-in max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Hồ sơ cá nhân</h1>

      {/* Profile info */}
      <form onSubmit={handleUpdate} className="card p-6 mb-6 space-y-4">
        <h2 className="font-display font-bold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-600" /> Thông tin
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
          <input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="flex items-center gap-2 text-gray-500">
            <Mail className="w-4 h-4" />
            <span>{form.email}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
          <span className="badge-primary">{user?.role}</span>
        </div>
        <button type="submit" disabled={saving} className="btn-primary gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={handlePassword} className="card p-6 space-y-4">
        <h2 className="font-display font-bold text-gray-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-600" /> Đổi mật khẩu
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
          <input type="password" required value={pwForm.current_password} onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
          <input type="password" required minLength={6} value={pwForm.new_password} onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
          <input type="password" required value={pwForm.confirm_password} onChange={e => setPwForm({ ...pwForm, confirm_password: e.target.value })} className="input-field" />
        </div>
        <button type="submit" disabled={changingPw} className="btn-primary gap-2">
          <Lock className="w-4 h-4" /> {changingPw ? 'Đang đổi...' : 'Đổi mật khẩu'}
        </button>
      </form>
    </div>
  );
}
