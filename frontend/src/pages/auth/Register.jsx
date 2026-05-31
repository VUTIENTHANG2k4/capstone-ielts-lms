import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Mật khẩu xác nhận không khớp');
    if (form.password.length < 6) return toast.error('Mật khẩu phải ít nhất 6 ký tự');
    setLoading(true);
    try {
      await register(form.email, form.password, form.full_name);
      toast.success('Đăng ký thành công!');
      navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        {/* Back to home */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Về trang chủ
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
            <span className="text-white font-display font-bold text-lg">IA</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Tạo tài khoản</h1>
          <p className="text-gray-500 mt-1 text-sm">Bắt đầu hành trình chinh phục IELTS</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'full_name', label: 'Họ và tên', icon: User, type: 'text', placeholder: 'Nguyễn Văn A' },
              { key: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'your@email.com' },
            ].map(({ key, label, icon: Icon, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={type} required value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="input-field pl-11" placeholder={placeholder} />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} required minLength={6}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-11 pr-11" placeholder="Tối thiểu 6 ký tự" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" required value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="input-field pl-11" placeholder="Nhập lại mật khẩu" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 text-base">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Đăng ký →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
