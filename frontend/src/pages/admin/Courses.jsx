import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, BookOpen, Eye } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = () => {
    setLoading(true);
    api.get('/courses')
      .then(res => setCourses(res.data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCourses(); }, []);

  const handleDelete = async (course) => {
    if (!window.confirm(`Xóa course "${course.title}"?`)) return;
    try {
      await api.delete(`/courses/${course.id}`);
      toast.success('Đã xóa');
      loadCourses();
    } catch (err) {
      toast.error('Lỗi khi xóa');
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">Quản lý khóa học</h1>
        <Link to="/admin/courses/new" className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Tạo khóa học
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có khóa học nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="card-elevated overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-primary-500 to-primary-700 flex items-end p-4">
                <span className="bg-white/20 backdrop-blur text-white text-xs px-3 py-1 rounded-full">{course.band_range}</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Thứ tự: {course.order_index}</span>
                  <div className="flex items-center gap-1">
                    <Link to={`/admin/courses/${course.id}`} className="p-2 hover:bg-blue-50 rounded-lg" title="Xem chi tiết">
                      <Eye className="w-4 h-4 text-blue-500" />
                    </Link>
                    <Link to={`/admin/courses/${course.id}/edit`} className="p-2 hover:bg-gray-100 rounded-lg" title="Chỉnh sửa">
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </Link>
                    <button onClick={() => handleDelete(course)} className="p-2 hover:bg-red-50 rounded-lg" title="Xóa">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
