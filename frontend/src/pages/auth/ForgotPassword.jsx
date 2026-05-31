import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (res.data.dev_link) setDevLink(res.data.dev_link);
      toast.success('Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không thể gửi email');
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
            Quên mật khẩu
          </h2>
          <p className="text-gray-500 mb-7 text-sm">
            Nhập email đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
          </p>

          {sent ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
                Vui lòng kiểm tra hộp thư của bạn.
              </div>
              {devLink && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 break-all">
                  <strong>DEV LINK:</strong>{' '}
                  <a href={devLink} className="underline">{devLink}</a>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" required autoFocus value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field pl-11" placeholder="your@email.com" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
