import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pw.length < 6) return toast.error('Mật khẩu tối thiểu 6 ký tự');
    if (pw !== confirm) return toast.error('Mật khẩu xác nhận không khớp');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, new_password: pw });
      toast.success('Đặt lại mật khẩu thành công, vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Token không hợp lệ hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Về trang đăng nhập
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Đặt lại mật khẩu
          </h2>
          <p className="text-gray-500 mb-7 text-sm">Nhập mật khẩu mới để hoàn tất.</p>

          {!token ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
              Liên kết không hợp lệ. Vui lòng yêu cầu lại.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" required value={pw} onChange={e => setPw(e.target.value)}
                    className="input-field pl-11" placeholder="••••••••" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                    className="input-field pl-11" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
