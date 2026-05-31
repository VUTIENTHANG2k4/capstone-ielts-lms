import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Loader2, Users, Calendar } from 'lucide-react';

export default function MyClass() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/classes/me').then(r => setClasses(r.data.classes || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>Lớp của tôi</h1>
      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Bạn chưa được xếp vào lớp học nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{c.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{c.course?.title || ''}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {c.teacher && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4 text-primary-600" /> Giáo viên: <strong>{c.teacher.full_name}</strong>
                  </div>
                )}
                {c.schedule_text && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-primary-600" /> {c.schedule_text}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
