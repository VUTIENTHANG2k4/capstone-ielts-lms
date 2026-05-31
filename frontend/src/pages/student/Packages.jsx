import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Package, CheckCircle2, Loader2 } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(Number(n || 0));

export default function StudentPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);

  useEffect(() => {
    api.get('/packages')
      .then(res => setPackages(res.data.packages || []))
      .catch(() => toast.error('Không thể tải danh sách gói'))
      .finally(() => setLoading(false));
  }, []);

  const buy = async (pkgId) => {
    setBuyingId(pkgId);
    try {
      const res = await api.post('/packages/payments/create', { package_id: pkgId });
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        toast.success('Đã tạo đơn hàng. Vui lòng kiểm tra.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không thể tạo đơn hàng');
      setBuyingId(null);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Gói học IELTS
          </h1>
          <p className="text-gray-500 mt-1">Chọn gói phù hợp để bắt đầu lộ trình của bạn</p>
        </div>
        <Link to="/student/my-packages" className="text-sm font-medium text-primary-600 hover:text-primary-700">
          Gói của tôi →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(p => (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{p.name}</h3>
                <p className="text-xs text-gray-500">{p.duration_days} ngày</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4 flex-1">{p.description}</p>
            <div className="space-y-2 mb-5 text-sm text-gray-600">
              {(p.features || []).map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-3xl font-bold text-gray-900">{fmt(p.price)}đ</span>
              {p.original_price && Number(p.original_price) > Number(p.price) && (
                <span className="text-sm text-gray-400 line-through">{fmt(p.original_price)}đ</span>
              )}
            </div>
            <button onClick={() => buy(p.id)} disabled={!!buyingId}
              className="btn-primary w-full">
              {buyingId === p.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Mua ngay'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
