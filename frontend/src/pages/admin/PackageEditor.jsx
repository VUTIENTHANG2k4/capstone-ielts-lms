import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, CheckCircle2, Plus, Trash2, GripVertical, Pencil, Check, X } from 'lucide-react';

const empty = {
  name: '', description: '', price: 0, original_price: '',
  duration_days: 30, features: [], is_active: true,
};

function FeatureItem({ feature, index, total, onEdit, onDelete, onMoveUp, onMoveDown }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(feature);
  const inputRef = useRef(null);

  const startEdit = () => {
    setDraft(feature);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commit = () => {
    if (draft.trim()) onEdit(index, draft.trim());
    setEditing(false);
  };

  const cancel = () => {
    setDraft(feature);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 group hover:border-primary-200 hover:shadow-sm transition-all">
      {/* Drag handle + reorder */}
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          className="p-0.5 rounded text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed"
          title="Lên trên"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><path d="M6 2l4 5H2z"/></svg>
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(index)}
          disabled={index === total - 1}
          className="p-0.5 rounded text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed"
          title="Xuống dưới"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><path d="M6 10L2 5h8z"/></svg>
        </button>
      </div>

      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
          className="flex-1 text-sm border-b border-primary-400 outline-none bg-transparent py-0.5"
        />
      ) : (
        <span className="flex-1 text-sm text-gray-800">{feature}</span>
      )}

      <span className="text-xs text-gray-300 flex-shrink-0">#{index + 1}</span>

      {editing ? (
        <div className="flex gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={commit}
            className="p-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
            title="Lưu"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={cancel}
            className="p-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            title="Hủy"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={startEdit}
            className="p-1 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
            title="Chỉnh sửa"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
            title="Xóa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

const fmt = (n) => n ? new Intl.NumberFormat('vi-VN').format(Number(n)) : '';

export default function PackageEditor() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(empty);
  const [featureInput, setFeatureInput] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const featureInputRef = useRef(null);

  useEffect(() => {
    if (!isNew) {
      api.get(`/packages/${id}`)
        .then(r => setPkg({ ...empty, ...r.data.package, features: r.data.package.features || [] }))
        .catch(() => toast.error('Không tải được gói'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const addFeature = () => {
    const val = featureInput.trim();
    if (!val) return;
    setPkg(p => ({ ...p, features: [...(p.features || []), val] }));
    setFeatureInput('');
    featureInputRef.current?.focus();
  };

  const editFeature = (index, newVal) => {
    setPkg(p => {
      const arr = [...(p.features || [])];
      arr[index] = newVal;
      return { ...p, features: arr };
    });
  };

  const deleteFeature = (index) => {
    setPkg(p => ({ ...p, features: (p.features || []).filter((_, j) => j !== index) }));
  };

  const moveFeature = (from, to) => {
    setPkg(p => {
      const arr = [...(p.features || [])];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { ...p, features: arr };
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...pkg,
        price: Number(pkg.price),
        original_price: pkg.original_price ? Number(pkg.original_price) : null,
        duration_days: Number(pkg.duration_days),
      };
      if (isNew) await api.post('/packages', payload);
      else await api.put(`/packages/${id}`, payload);
      toast.success('Đã lưu gói học');
      navigate('/admin/packages');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
    </div>
  );

  const features = pkg.features || [];
  const hasDiscount = pkg.original_price && Number(pkg.original_price) > Number(pkg.price);

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-1">
        {isNew ? 'Tạo gói học mới' : 'Chỉnh sửa gói học'}
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        {isNew
          ? 'Điền thông tin và thiết lập quyền lợi cho gói học mới'
          : 'Cập nhật thông tin và quyền lợi của gói học'}
      </p>

      <form onSubmit={save} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">Thông tin cơ bản</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tên gói *</label>
            <input
              required
              value={pkg.name}
              onChange={e => setPkg({ ...pkg, name: e.target.value })}
              placeholder="VD: Gói Premium, Gói Cơ bản..."
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
            <textarea
              rows={3}
              value={pkg.description}
              onChange={e => setPkg({ ...pkg, description: e.target.value })}
              placeholder="Mô tả ngắn về gói học này..."
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Giá bán (VND) *</label>
              <input
                required
                type="number"
                min="0"
                value={pkg.price}
                onChange={e => setPkg({ ...pkg, price: e.target.value })}
                className="input-field"
              />
              {pkg.price > 0 && (
                <p className="text-xs text-gray-400 mt-1">{fmt(pkg.price)}đ</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Giá gốc (để gạch)</label>
              <input
                type="number"
                min="0"
                value={pkg.original_price || ''}
                onChange={e => setPkg({ ...pkg, original_price: e.target.value })}
                placeholder="Để trống nếu không có"
                className="input-field"
              />
              {hasDiscount && (
                <p className="text-xs text-emerald-600 mt-1">
                  Tiết kiệm {fmt(Number(pkg.original_price) - Number(pkg.price))}đ
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Thời hạn (ngày)</label>
              <input
                type="number"
                min="1"
                value={pkg.duration_days}
                onChange={e => setPkg({ ...pkg, duration_days: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <input
              id="active"
              type="checkbox"
              checked={pkg.is_active}
              onChange={e => setPkg({ ...pkg, is_active: e.target.checked })}
              className="w-4 h-4 rounded accent-primary-600"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">
              Hiển thị gói cho học viên
            </label>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${
              pkg.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
            }`}>
              {pkg.is_active ? 'Đang hoạt động' : 'Ẩn'}
            </span>
          </div>
        </div>

        {/* Features section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1 border-b border-gray-100 pb-3">
            <h2 className="font-semibold text-gray-800 text-base">Quyền lợi của gói</h2>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
              features.length > 0 ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-400'
            }`}>
              {features.length} quyền lợi
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Mỗi quyền lợi là một điểm mạnh của gói. Hover vào dòng để chỉnh sửa hoặc xóa.
            Dùng mũi tên để thay đổi thứ tự hiển thị.
          </p>

          {/* Add feature input */}
          <div className="flex gap-2 mb-4">
            <input
              ref={featureInputRef}
              value={featureInput}
              onChange={e => setFeatureInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              placeholder="VD: Truy cập toàn bộ khóa học, Hỗ trợ 24/7..."
              className="input-field flex-1 text-sm"
            />
            <button
              type="button"
              onClick={addFeature}
              disabled={!featureInput.trim()}
              className="btn-primary inline-flex items-center gap-1.5 px-4 disabled:opacity-40"
            >
              <Plus className="w-4 h-4" /> Thêm
            </button>
          </div>

          {/* Feature list */}
          {features.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Chưa có quyền lợi nào</p>
              <p className="text-xs text-gray-300 mt-1">Nhập quyền lợi vào ô trên và nhấn Thêm</p>
            </div>
          ) : (
            <div className="space-y-2">
              {features.map((f, i) => (
                <FeatureItem
                  key={i}
                  feature={f}
                  index={i}
                  total={features.length}
                  onEdit={editFeature}
                  onDelete={deleteFeature}
                  onMoveUp={(idx) => moveFeature(idx, idx - 1)}
                  onMoveDown={(idx) => moveFeature(idx, idx + 1)}
                />
              ))}
            </div>
          )}

          {features.length > 0 && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-600">
              <strong>Tip:</strong> Hover vào từng quyền lợi để thấy nút chỉnh sửa (bút chì) và xóa (thùng rác).
              Nhấn vào bút chì, sửa xong nhấn Enter hoặc dấu ✓ để lưu.
            </div>
          )}
        </div>

        {/* Preview */}
        {features.length > 0 && (
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-800 text-sm mb-3">Xem trước gói học</h2>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">{pkg.name || 'Tên gói'}</p>
                {pkg.description && <p className="text-sm text-gray-500 mt-0.5">{pkg.description}</p>}
                <div className="mt-3 space-y-1.5">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-primary-600">{pkg.price > 0 ? `${fmt(pkg.price)}đ` : '—'}</p>
                {hasDiscount && (
                  <p className="text-sm text-gray-400 line-through">{fmt(pkg.original_price)}đ</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{pkg.duration_days} ngày</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Đang lưu...' : isNew ? 'Tạo gói học' : 'Lưu thay đổi'}
          </button>
          <button type="button" onClick={() => navigate('/admin/packages')} className="btn-outline">
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
