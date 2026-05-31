import { Link } from 'react-router-dom';
import {
  BookOpen, Trophy, Target, BarChart3, Users, CheckCircle2,
  ArrowRight, Star, Zap, Globe, GraduationCap, ChevronRight
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Lộ trình 5 cấp độ',
    desc: 'Từ Band 3.0 → 7.5+ được thiết kế theo chuẩn Cambridge, phù hợp mọi trình độ.',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    icon: Trophy,
    title: 'Thi thử IELTS',
    desc: 'Mock Test mô phỏng phòng thi thực tế với đề thi cập nhật thường xuyên.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Target,
    title: 'Placement Test',
    desc: 'Xác định chính xác trình độ hiện tại, hệ thống gợi ý khóa học phù hợp nhất.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: BarChart3,
    title: 'Theo dõi tiến độ',
    desc: 'Dashboard chi tiết với biểu đồ học tập, thống kê theo từng kỹ năng.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Users,
    title: 'Giáo viên chuyên nghiệp',
    desc: 'Đội ngũ giáo viên kinh nghiệm trực tiếp chấm bài Writing & Speaking.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Zap,
    title: 'Học liệu phong phú',
    desc: 'Video bài giảng, flashcard, bài tập tương tác đa dạng cho tất cả 4 kỹ năng.',
    color: 'bg-rose-50 text-rose-600',
  },
];

const levels = [
  { band: '3.0 – 4.0', name: 'Foundation', desc: 'Xây nền tảng từ vựng & ngữ pháp cơ bản', color: 'from-rose-400 to-pink-500' },
  { band: '4.0 – 5.0', name: 'Elementary', desc: 'Phát triển kỹ năng đọc hiểu và viết cơ bản', color: 'from-amber-400 to-orange-500' },
  { band: '5.0 – 5.5', name: 'Intermediate', desc: 'Luyện 4 kỹ năng theo cấu trúc đề thi thực tế', color: 'from-emerald-400 to-teal-500' },
  { band: '5.5 – 6.5', name: 'Upper-Inter', desc: 'Chiến thuật làm bài thi, nâng điểm từng kỹ năng', color: 'from-blue-400 to-indigo-500' },
  { band: '6.5 – 7.5+', name: 'Advanced', desc: 'Master band 7.5+ với kỹ thuật nâng cao', color: 'from-purple-400 to-violet-500' },
];

const stats = [
  { value: '2,500+', label: 'Học viên đang học' },
  { value: '98%', label: 'Đạt mục tiêu Band Score' },
  { value: '5', label: 'Cấp độ lộ trình' },
  { value: '200+', label: 'Đề thi mock test' },
];

const testimonials = [
  { name: 'Nguyễn Thanh Hà', band: '7.5', text: 'Nhờ lộ trình rõ ràng và hệ thống chấm bài tự động, mình lên từ 5.5 lên 7.5 chỉ trong 4 tháng!', avatar: 'NH' },
  { name: 'Trần Minh Khoa', band: '7.0', text: 'Placement Test giúp mình biết chính xác mình đang ở đâu. Không lãng phí thời gian học lại những gì đã biết.', avatar: 'MK' },
  { name: 'Lê Thu Phương', band: '8.0', text: 'Giáo viên chấm Writing rất chi tiết và phản hồi nhanh. Điểm Writing của mình tăng từ 6.0 lên 8.0!', avatar: 'TP' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
              <span className="text-white font-bold text-sm">IA</span>
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">IELTS Academy</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-primary-600 transition-colors">Tính năng</a>
            <a href="#roadmap" className="hover:text-primary-600 transition-colors">Lộ trình</a>
            <a href="#testimonials" className="hover:text-primary-600 transition-colors">Học viên</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors">
              Đăng nhập
            </Link>
            <Link to="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md hover:shadow-lg transition-all"
              style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
              Bắt đầu miễn phí
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(145deg, #881337 0%, #9f1239 30%, #be123c 65%, #e11d48 100%)' }}>
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle at 20px 20px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-28 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-2 text-sm font-medium mb-8 border border-white/20">
            <Star className="w-4 h-4 text-accent-300" />
            <span>Nền tảng học IELTS #1 Việt Nam</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Chinh phục IELTS<br />
            <span className="text-red-200">theo lộ trình thông minh</span>
          </h1>

          <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Hệ thống quản lý học tập IELTS tích hợp lộ trình 5 cấp độ, thi thử, chấm bài tự động
            và theo dõi tiến độ chi tiết — tất cả trong một nền tảng duy nhất.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register"
              className="flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:bg-red-50 transition-all text-base">
              Bắt đầu học miễn phí
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login"
              className="flex items-center gap-2 px-8 py-4 bg-white/15 border border-white/30 text-white font-semibold rounded-2xl hover:bg-white/25 transition-all text-base backdrop-blur">
              Đăng nhập ngay
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
                <p className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>{s.value}</p>
                <p className="text-red-200 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Tại sao chọn IELTS Academy?
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Được xây dựng bởi đội ngũ giáo viên và kỹ sư có kinh nghiệm, tối ưu hoá cho người học IELTS Việt Nam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section id="roadmap" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Lộ trình 5 cấp độ
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Từ mất gốc đến IELTS 7.5+, mỗi bước đều được thiết kế khoa học và có hệ thống.
            </p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-6">
              {levels.map((level, i) => (
                <div key={i} className="relative pl-20">
                  <div className={`absolute left-4 w-8 h-8 rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center z-10 shadow-md`}>
                    <span className="text-white font-bold text-sm">{i + 1}</span>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Band {level.band}</span>
                        <h3 className="text-lg font-bold text-gray-900 mt-0.5">{level.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{level.desc}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              ))}
              <div className="relative pl-20">
                <div className="absolute left-4 w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center z-10 shadow-md">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gradient-to-r from-accent-50 to-amber-50 rounded-2xl border border-accent-100 p-6">
                  <h3 className="text-lg font-bold text-accent-800">🎯 Mục tiêu: IELTS 7.5+</h3>
                  <p className="text-sm text-accent-700 mt-1">Sẵn sàng cho mọi trường Đại học & cơ hội định cư quốc tế!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Học viên nói gì?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(({ name, band, text, avatar }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent-400 fill-accent-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-xs text-emerald-600 font-semibold">IELTS {band} ✓</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #881337 0%, #be123c 50%, #e11d48 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 20px 20px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center text-white">
          <GraduationCap className="w-16 h-16 mx-auto mb-6 text-red-200" />
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Sẵn sàng chinh phục IELTS?
          </h2>
          <p className="text-red-200 text-lg mb-10 leading-relaxed">
            Tham gia cùng hàng nghìn học viên đang học theo lộ trình thông minh tại IELTS Academy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register"
              className="flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-2xl shadow-xl hover:bg-red-50 transition-all text-base">
              Đăng ký miễn phí
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login"
              className="flex items-center gap-2 px-8 py-4 bg-white/15 border border-white/30 text-white font-semibold rounded-2xl hover:bg-white/25 transition-all text-base">
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
                <span className="text-white text-xs font-bold">IA</span>
              </div>
              <span className="font-semibold text-white">IELTS Academy</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/login" className="hover:text-white transition-colors">Đăng nhập</Link>
              <Link to="/register" className="hover:text-white transition-colors">Đăng ký</Link>
            </div>
            <p className="text-sm">© 2026 IELTS Academy · Hệ thống học IELTS theo lộ trình</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
