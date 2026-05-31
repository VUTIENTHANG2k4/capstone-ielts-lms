import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { FileText, Clock, ArrowRight, Trophy } from 'lucide-react';

export default function MockTestList() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mock-tests?type=MOCK')
      .then(res => setTests(res.data.mock_tests || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Thi thử IELTS</h1>
        <p className="text-gray-500">Mô phỏng phòng thi thật với timer và giao diện Computer-delivered</p>
      </div>

      {tests.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có bài thi thử nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests.map(test => (
            <div key={test.id} className="card-elevated p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary-600" />
                </div>
                <span className="badge-primary">{test.skill}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{test.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{test.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{test.time_limit_minutes} phút</span>
                <span>{test.total_questions} câu</span>
              </div>
              <Link to={`/student/mock-tests/${test.id}/take`} className="btn-primary w-full gap-2">
                Bắt đầu làm bài <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
