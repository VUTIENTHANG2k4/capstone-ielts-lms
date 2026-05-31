import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Loader2, ArrowLeft, BookOpen } from 'lucide-react';

export default function ClassDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/classes/${id}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  if (!data) return <div className="p-8 text-gray-500">Không tìm thấy lớp.</div>;

  const progressMap = new Map();
  (data.progress || []).forEach(p => progressMap.set(p.user_id, p));

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Link to="/teacher/classes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Lớp của tôi
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>{data.class.name}</h1>
        <div className="text-sm text-gray-600 space-y-1">
          {data.class.course && <p>Khóa học: <strong>{data.class.course.title}</strong></p>}
          {data.class.schedule_text && <p>Lịch: {data.class.schedule_text}</p>}
          {data.class.start_date && <p>Khai giảng: {new Date(data.class.start_date).toLocaleDateString('vi-VN')}</p>}
        </div>
        {data.class.course_id && (
          <Link
            to={`/teacher/courses/${data.class.course_id}`}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-sm font-medium transition"
          >
            <BookOpen className="w-4 h-4" /> Xem nội dung khóa học
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Học viên ({data.students?.length || 0})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Học viên</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Tiến độ</th>
              <th className="px-6 py-3 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data.students || []).map(row => {
              const s = row.student || row;
              const p = progressMap.get(s.id);
              const pct = p?.progress_percentage || 0;
              return (
                <tr key={s.id}>
                  <td className="px-6 py-3 font-medium text-gray-900">{s.full_name}</td>
                  <td className="px-6 py-3 text-gray-600">{s.email}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[180px]">
                        <div className="h-full bg-primary-600" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">{Math.round(pct)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-500">{p?.status || 'chưa bắt đầu'}</td>
                </tr>
              );
            })}
            {(!data.students || data.students.length === 0) && (
              <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">Chưa có học viên</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
