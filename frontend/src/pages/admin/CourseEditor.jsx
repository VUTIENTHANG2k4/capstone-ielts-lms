import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import UnitContentEditor from './UnitContentEditor';

export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState({ title: '', slug: '', description: '', band_range: '', level: 'PRE_FOUNDATION', order_index: 1, is_active: true });
  const [units, setUnits] = useState([]);
  const [expandedUnit, setExpandedUnit] = useState(null);

  useEffect(() => {
    if (isNew) return;
    const load = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data.course);
        const unitsRes = await api.get(`/units/course/${id}`);
        setUnits(unitsRes.data.units || []);
      } catch {
        toast.error('Không tìm thấy khóa học');
        navigate('/admin/courses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isNew, navigate]);

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        // Auto-generate slug from title if empty
        const payload = { ...course };
        if (!payload.slug && payload.title) {
          payload.slug = payload.title
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
        const res = await api.post('/courses', payload);
        toast.success('Tạo khóa học thành công');
        navigate(`/admin/courses/${res.data.course.id}/edit`);
      } else {
        await api.put(`/courses/${id}`, course);
        toast.success('Cập nhật thành công');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi');
    } finally {
      setSaving(false);
    }
  };

  const addUnit = async () => {
    try {
      const res = await api.post('/units', {
        course_id: id,
        title: `Unit ${units.length + 1}`,
        order_index: units.length + 1,
      });
      setUnits([...units, res.data.unit]);
      toast.success('Thêm unit mới');
    } catch (err) {
      toast.error('Lỗi khi thêm unit');
    }
  };

  const deleteUnit = async (unitId) => {
    if (!window.confirm('Xóa unit này?')) return;
    try {
      await api.delete(`/units/${unitId}`);
      setUnits(units.filter(u => u.id !== unitId));
      toast.success('Đã xóa unit');
    } catch {
      toast.error('Lỗi khi xóa');
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in max-w-4xl mx-auto">
      <button onClick={() => navigate('/admin/courses')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Danh sách khóa học
      </button>

      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">
        {isNew ? 'Tạo khóa học mới' : 'Chỉnh sửa khóa học'}
      </h1>

      {/* Course info */}
      <form onSubmit={handleSaveCourse} className="card p-6 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học</label>
            <input required value={course.title} onChange={e => setCourse({ ...course, title: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Band Range</label>
            <input value={course.band_range} onChange={e => setCourse({ ...course, band_range: e.target.value })} className="input-field" placeholder="e.g. 3.0-4.0" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
            <input value={course.slug || ''} onChange={e => setCourse({ ...course, slug: e.target.value })} className="input-field" placeholder="vd: course-beginner (tự sinh nếu bỏ trống)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cấp độ</label>
            <select value={course.level || 'PRE_FOUNDATION'} onChange={e => setCourse({ ...course, level: e.target.value })} className="input-field">
              <option value="PRE_FOUNDATION">PRE-FOUNDATION</option>
              <option value="FOUNDATION">FOUNDATION</option>
              <option value="PRE_IELTS">PRE-IELTS</option>
              <option value="BAND_6_5">BAND 6.5</option>
              <option value="ADVANCED">ADVANCED</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea value={course.description} onChange={e => setCourse({ ...course, description: e.target.value })} className="input-field min-h-[100px] resize-y" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
            <input type="number" value={course.order_index} onChange={e => setCourse({ ...course, order_index: parseInt(e.target.value) })} className="input-field" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={course.is_active} onChange={e => setCourse({ ...course, is_active: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm text-gray-700">Kích hoạt</span>
            </label>
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Lưu khóa học'}
        </button>
      </form>

      {/* Units */}
      {!isNew && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-gray-900">Danh sách Unit</h2>
            <button onClick={addUnit} className="btn-secondary gap-2 text-sm">
              <Plus className="w-4 h-4" /> Thêm Unit
            </button>
          </div>

          {units.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">Chưa có unit nào</div>
          ) : (
            <div className="space-y-3">
              {units.map(unit => (
                <div key={unit.id} className="card overflow-hidden">
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {expandedUnit === unit.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      <input
                        value={unit.title}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setUnits(units.map(u => u.id === unit.id ? { ...u, title: e.target.value } : u))}
                        onBlur={async () => { try { await api.put(`/units/${unit.id}`, { title: unit.title, order_index: unit.order_index }); } catch { toast.error('Lỗi lưu unit'); } }}
                        className="font-medium text-gray-900 bg-transparent focus:outline-none focus:bg-white border border-transparent focus:border-gray-200 rounded px-2 py-1 flex-1"
                      />
                      <span className="text-xs text-gray-400">#{unit.order_index}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteUnit(unit.id); }} className="p-2 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                  {expandedUnit === unit.id && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <UnitContentEditor unitId={unit.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
