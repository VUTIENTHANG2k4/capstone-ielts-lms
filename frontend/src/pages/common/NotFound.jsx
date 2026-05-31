import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center animate-fade-in">
        <h1 className="text-8xl font-display font-bold text-primary-600 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Trang bạn tìm không tồn tại</p>
        <Link to="/" className="btn-primary gap-2">
          <Home className="w-4 h-4" /> Về trang chủ
        </Link>
      </div>
    </div>
  );
}
