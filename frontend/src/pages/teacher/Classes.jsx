import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Loader2, Users } from 'lucide-react';

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/classes').then(r => setClasses(r.data.classes || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Lớp của tôi</h1>

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Bạn chưa được phân lớp nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(c => (
            <Link key={c.id} to={`/teacher/classes/${c.id}`}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
              <h3 className="font-bold text-gray-900 mb-1">{c.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{c.course?.title || '—'}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" /> {c.students_count || 0} học viên
              </div>
              {c.schedule_text && <p className="text-xs text-gray-400 mt-2">{c.schedule_text}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
