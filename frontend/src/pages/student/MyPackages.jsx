import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Loader2, Package } from 'lucide-react';

const fmt = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const statusBadge = (s) => ({
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  expired: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-rose-100 text-rose-700',
}[s] || 'bg-gray-100 text-gray-600');
const statusLabel = (s) => ({ active: 'Đang hoạt động', pending: 'Chờ thanh toán', expired: 'Đã hết hạn', cancelled: 'Đã hủy' }[s] || s);

export default function MyPackages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/packages/me/enrollments')
      .then(res => setItems(res.data.enrollments || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Gói của tôi</h1>
        <Link to="/student/packages" className="btn-outline">Xem các gói</Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Bạn chưa đăng ký gói nào.</p>
          <Link to="/student/packages" className="btn-primary mt-4 inline-block">Khám phá gói học</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(e => (
            <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">{e.core_ielts_lms_packages?.name || 'Gói học'}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Bắt đầu: {fmt(e.starts_at)} · Hết hạn: {fmt(e.expires_at)}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(e.status)}`}>
                {statusLabel(e.status)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
