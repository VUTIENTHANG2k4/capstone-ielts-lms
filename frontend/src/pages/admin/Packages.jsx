import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Loader2, CheckCircle2, ChevronDown, ChevronUp, Tag, Inbox } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(Number(n || 0));

export default function AdminPackages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/packages')
      .then(r => setItems(r.data.packages || []))
      .catch(() => toast.error('Không tải được danh sách gói'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id, name) => {
    if (!confirm(`Xóa gói "${name}"?`)) return;
    try {
      await api.delete(`/packages/${id}`);
      toast.success('Đã xóa gói');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xóa thất bại');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Quản lý Gói học</h1>
          <p className="text-gray-500 mt-1">
            Tạo và quản lý các gói học — mỗi gói có thể có số lượng quyền lợi khác nhau
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/enrollments" className="btn-outline inline-flex items-center gap-2">
            <Inbox className="w-4 h-4" /> Đơn đăng ký
          </Link>
          <Link to="/admin/packages/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tạo gói mới
          </Link>
        </div>
      </div>

      {/* Logic note */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-700">
        <strong>Logic quyền lợi:</strong> Mỗi gói lưu danh sách quyền lợi riêng (JSONB array). Gói cao cấp hơn sẽ có nhiều
        quyền lợi hơn — ví dụ Gói Cơ bản 3 quyền lợi, Gói Premium 6 quyền lợi. Admin tự thiết lập số lượng và nội dung
        quyền lợi cho từng gói khi tạo hoặc chỉnh sửa.
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Chưa có gói học nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(pkg => {
            const features = pkg.features || [];
            const isExpanded = expandedId === pkg.id;

            return (
              <div key={pkg.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {/* Main row */}
                <div className="flex items-center gap-4 px-6 py-4">
                  {/* Name + description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-gray-900">{pkg.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        pkg.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {pkg.is_active ? 'Đang hoạt động' : 'Ẩn'}
                      </span>
                    </div>
                    {pkg.description && (
                      <p className="text-sm text-gray-500 truncate">{pkg.description}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">{fmt(pkg.price)}đ</p>
                    {pkg.original_price && pkg.original_price > pkg.price && (
                      <p className="text-xs text-gray-400 line-through">{fmt(pkg.original_price)}đ</p>
                    )}
                    <p className="text-xs text-gray-400">{pkg.duration_days} ngày</p>
                  </div>

                  {/* Feature count badge */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : pkg.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                        features.length > 0
                          ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                          : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {features.length} quyền lợi
                      {features.length > 0 && (
                        isExpanded
                          ? <ChevronUp className="w-3.5 h-3.5" />
                          : <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/admin/packages/${pkg.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Sửa
                    </Link>
                    <button
                      onClick={() => remove(pkg.id, pkg.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Xóa
                    </button>
                  </div>
                </div>

                {/* Expanded: features list */}
                {isExpanded && features.length > 0 && (
                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Danh sách quyền lợi ({features.length})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isExpanded && features.length === 0 && (
                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 text-sm text-gray-400 text-center">
                    Gói này chưa có quyền lợi. <Link to={`/admin/packages/${pkg.id}/edit`} className="text-primary-600 underline">Thêm quyền lợi ngay</Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
