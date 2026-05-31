import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2, Eye, ArrowLeft, X, Package, User, Calendar, CreditCard, Clock } from 'lucide-react';

const fmt = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const fmtFull = (d) => d ? new Date(d).toLocaleString('vi-VN') : '—';
const fmtMoney = (n) => new Intl.NumberFormat('vi-VN').format(Number(n || 0));
const statusColor = (s) => ({
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  expired: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-rose-100 text-rose-700',
}[s] || 'bg-gray-100 text-gray-600');

export default function AdminEnrollments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/packages/admin/enrollments' + (filter ? `?status=${filter}` : ''))
      .then(r => setItems(r.data.enrollments || [])).finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const approve = async (id) => {
    try { await api.post(`/packages/admin/enrollments/${id}/approve`); toast.success('Đã kích hoạt'); load(); setSelected(null); }
    catch (err) { toast.error(err.response?.data?.error || 'Thất bại'); }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Đơn đăng ký gói</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng cộng {items.length} đơn đăng ký</p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field py-2 text-sm w-auto">
          <option value="">Tất cả</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="active">Đang hoạt động</option>
          <option value="expired">Hết hạn</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Học viên</th>
                <th className="px-4 py-3 text-left">Gói</th>
                <th className="px-4 py-3 text-left">Giá</th>
                <th className="px-4 py-3 text-left">Bắt đầu</th>
                <th className="px-4 py-3 text-left">Hết hạn</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(e => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{e.core_ielts_lms_users?.full_name}</p>
                    <p className="text-xs text-gray-500">{e.core_ielts_lms_users?.email}</p>
                  </td>
                  <td className="px-4 py-3">{e.core_ielts_lms_packages?.name}</td>
                  <td className="px-4 py-3">{fmtMoney(e.core_ielts_lms_packages?.price)}đ</td>
                  <td className="px-4 py-3">{fmt(e.starts_at)}</td>
                  <td className="px-4 py-3">{fmt(e.expires_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(e.status)}`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelected(e)} className="p-2 hover:bg-blue-50 rounded-lg" title="Xem chi tiết">
                        <Eye className="w-4 h-4 text-blue-500" />
                      </button>
                      {e.status === 'pending' && (
                        <button onClick={() => approve(e.id)} className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm px-2 py-1">
                          <CheckCircle2 className="w-4 h-4" /> Kích hoạt
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan="7" className="px-4 py-10 text-center text-gray-400">Chưa có đơn nào</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-display font-bold text-gray-900">Chi tiết đơn đăng ký</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Student */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selected.core_ielts_lms_users?.full_name}</p>
                  <p className="text-sm text-gray-500">{selected.core_ielts_lms_users?.email}</p>
                </div>
              </div>

              {/* Package */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">Gói học</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{selected.core_ielts_lms_packages?.name}</p>
                <p className="text-sm text-primary-600 font-semibold mt-1">{fmtMoney(selected.core_ielts_lms_packages?.price)}đ</p>
              </div>

              {/* Status & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Trạng thái
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(selected.status)}`}>
                    {selected.status}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <CreditCard className="w-3.5 h-3.5" /> Thanh toán
                  </div>
                  <p className="text-sm font-medium text-gray-700">{selected.payment_id ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" /> Bắt đầu
                  </div>
                  <p className="text-sm font-medium text-gray-700">{fmtFull(selected.starts_at)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Clock className="w-3.5 h-3.5" /> Hết hạn
                  </div>
                  <p className="text-sm font-medium text-gray-700">{fmtFull(selected.expires_at)}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Calendar className="w-3.5 h-3.5" /> Ngày tạo đơn
                </div>
                <p className="text-sm font-medium text-gray-700">{fmtFull(selected.created_at)}</p>
              </div>

              {/* Actions */}
              {selected.status === 'pending' && (
                <button onClick={() => approve(selected.id)} className="btn-primary w-full gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Kích hoạt gói học
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
