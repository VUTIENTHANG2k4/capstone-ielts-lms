import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Trophy, ArrowRight, Target, Clock, ClipboardList, BookMarked, Info } from 'lucide-react';

export default function PlacementTest() {
  const navigate = useNavigate();
  const [placementTest, setPlacementTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mock-tests?type=PLACEMENT')
      .then(res => {
        const tests = res.data.mock_tests || [];
        if (tests.length > 0) setPlacementTest(tests[0]);
      })
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
    <div className="page-container animate-fade-in max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-200">
          <Target className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Placement Test</h1>
        <p className="text-gray-500 text-lg">Kiểm tra trình độ đầu vào để xác định Course phù hợp</p>
      </div>

      {placementTest ? (
        <div className="card-elevated p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">{placementTest.title}</h2>
          <p className="text-gray-600 mb-6">{placementTest.description}</p>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-8">
            <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {placementTest.time_limit_minutes} phút</span>
            <span className="inline-flex items-center gap-1"><ClipboardList className="w-4 h-4" /> {placementTest.total_questions} câu</span>
            <span className="inline-flex items-center gap-1"><BookMarked className="w-4 h-4" /> Grammar, Vocabulary, Reading</span>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Lưu ý:</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Bài test không bắt buộc - bạn có thể bỏ qua và bắt đầu từ Course 1</li>
              <li>• Dựa vào kết quả, hệ thống sẽ gợi ý Course phù hợp nhất</li>
              <li>• Hãy làm bài nghiêm túc để có kết quả chính xác nhất</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(`/student/mock-tests/${placementTest.id}/take`)}
              className="btn-primary gap-2 px-8"
            >
              Bắt đầu làm bài <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/student/roadmap')}
              className="btn-secondary"
            >
              Bỏ qua, bắt đầu từ Course 1
            </button>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Placement Test chưa sẵn sàng</p>
          <button
            onClick={() => navigate('/student/roadmap')}
            className="btn-primary mt-4"
          >
            Xem lộ trình học
          </button>
        </div>
      )}
    </div>
  );
}
