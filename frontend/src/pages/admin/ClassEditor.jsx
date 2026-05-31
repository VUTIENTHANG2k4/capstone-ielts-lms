import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function ClassEditor() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [data, setData] = useState({ name: '', course_id: '', teacher_id: '', schedule_text: '', start_date: '', end_date: '', max_students: 30 });
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [pickStudent, setPickStudent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadDetail = async () => {
    if (isNew) return;
    const r = await api.get(`/classes/${id}`);
    setData({
      name: r.data.class.name || '',
      course_id: r.data.class.course_id || '',
      teacher_id: r.data.class.teacher_id || '',
      schedule_text: r.data.class.schedule_text || '',
      start_date: r.data.class.start_date?.slice(0, 10) || '',
      end_date: r.data.class.end_date?.slice(0, 10) || '',
      max_students: r.data.class.max_students || 30,
    });
    setStudents(r.data.students || []);
  };

  useEffect(() => {
    Promise.all([
      api.get('/courses').then(r => setCourses(r.data.courses || [])),
      api.get('/admin/users?role=teacher').then(r => setTeachers(r.data.users || [])).catch(() => {}),
      api.get('/admin/users?role=student').then(r => setAllStudents(r.data.users || [])).catch(() => {}),
      loadDetail(),
    ]).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [id]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...data, max_students: Number(data.max_students), teacher_id: data.teacher_id || null, course_id: data.course_id || null };
      if (isNew) {
        const res = await api.post('/classes', payload);
        toast.success('Đã tạo lớp');
        navigate(`/admin/classes/${res.data.class.id}/edit`);
      } else {
        await api.put(`/classes/${id}`, payload);
        toast.success('Đã lưu');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lưu thất bại');
    } finally { setSaving(false); }
  };

  const addStudent = async () => {
    if (!pickStudent) return;
    try {
      await api.post(`/classes/${id}/students`, { student_id: pickStudent });
      setPickStudent('');
      toast.success('Đã thêm học viên');
      loadDetail();
    } catch (err) { toast.error(err.response?.data?.error || 'Thất bại'); }
  };
  const removeStudent = async (sid) => {
    try { await api.delete(`/classes/${id}/students/${sid}`); toast.success('Đã gỡ'); loadDetail(); }
    catch (err) { toast.error(err.response?.data?.error || 'Thất bại'); }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
        {isNew ? 'Tạo lớp mới' : 'Chỉnh sửa lớp'}
      </h1>

      <form onSubmit={save} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tên lớp *</label>
          <input required value={data.name} onChange={e => setData({ ...data, name: e.target.value })} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Khóa học</label>
            <select value={data.course_id} onChange={e => setData({ ...data, course_id: e.target.value })} className="input-field">
              <option value="">— Chọn khóa —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Giáo viên</label>
            <select value={data.teacher_id} onChange={e => setData({ ...data, teacher_id: e.target.value })} className="input-field">
              <option value="">— Chưa phân —</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name} ({t.email})</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Lịch học</label>
            <input value={data.schedule_text} onChange={e => setData({ ...data, schedule_text: e.target.value })} placeholder="VD: T2-T4-T6 19:00" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Khai giảng</label>
            <input type="date" value={data.start_date} onChange={e => setData({ ...data, start_date: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Kết thúc</label>
            <input type="date" value={data.end_date} onChange={e => setData({ ...data, end_date: e.target.value })} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sĩ số tối đa</label>
          <input type="number" min="1" value={data.max_students} onChange={e => setData({ ...data, max_students: e.target.value })} className="input-field w-32" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Đang lưu...' : 'Lưu thông tin lớp'}</button>
      </form>

      {!isNew && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-4">Học viên trong lớp ({students.length})</h2>
          <div className="flex gap-2 mb-4">
            <select value={pickStudent} onChange={e => setPickStudent(e.target.value)} className="input-field flex-1">
              <option value="">— Chọn học viên để thêm —</option>
              {allStudents
                .filter(s => !students.some(x => x.id === s.id))
                .map(s => <option key={s.id} value={s.id}>{s.full_name} — {s.email}</option>)}
            </select>
            <button onClick={addStudent} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Thêm</button>
          </div>
          <ul className="divide-y divide-gray-100">
            {students.map(s => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">{s.full_name}</p>
                  <p className="text-xs text-gray-500">{s.email}</p>
                </div>
                <button onClick={() => removeStudent(s.id)} className="text-rose-600 hover:text-rose-700 text-sm inline-flex items-center gap-1">
                  <Trash2 className="w-4 h-4" /> Gỡ
                </button>
              </li>
            ))}
            {students.length === 0 && <li className="py-6 text-center text-gray-400 text-sm">Chưa có học viên</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
