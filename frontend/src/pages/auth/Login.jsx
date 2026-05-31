import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/health').catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      const loggedUser = data.user;
      toast.success(`Chào mừng, ${loggedUser.full_name}!`);
      const role = loggedUser.role?.toLowerCase();
      navigate(role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Về trang chủ
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
              <span className="text-white font-bold">IA</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">IELTS Academy</p>
              <p className="text-xs text-gray-400">Chinh phục IELTS theo lộ trình</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Đăng nhập
          </h2>
          <p className="text-gray-500 mb-7 text-sm">Nhập thông tin để truy cập hệ thống</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" required autoFocus value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-11" placeholder="your@email.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-11 pr-11" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Đăng nhập →'}
            </button>

            <div className="text-right -mt-2">
              <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Quên mật khẩu?
              </Link>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">Đăng ký ngay</Link>
          </p>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 text-center mb-3">Demo accounts (click để điền)</p>
            <div className="space-y-2">
              {[
                ['Admin', 'admin@ielts.academy'],
                ['Teacher', 'teacher@ielts.academy'],
                ['Student', 'student@ielts.academy'],
              ].map(([role, email]) => (
                <button key={role} type="button"
                  onClick={() => setForm({ email, password: '111111' })}
                  className="w-full flex justify-between items-center text-xs px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-500">
                  <span className="font-semibold text-gray-600">{role}</span>
                  <span className="font-mono">{email} / 111111</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
