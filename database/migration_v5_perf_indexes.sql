-- ============================================================
-- Migration v5: Bổ sung index tối ưu hiệu năng (2026-05-27)
-- ============================================================
-- Bối cảnh: schema gốc đã có index đầy đủ cho các cột khóa ngoại
-- (user_id, course_id, status...). Migration này CHỈ bổ sung index
-- cho các cột ORDER BY / lọc kết hợp mà các query admin/dashboard
-- thường dùng nhưng chưa được index — tránh full scan + sort khi
-- dữ liệu lớn dần.
--
-- An toàn chạy nhiều lần (IF NOT EXISTS). Chạy trên Supabase SQL Editor.
-- ============================================================

-- 1) Doanh thu dashboard: WHERE status='success' AND created_at >= ...
--    Trước đây chỉ có index đơn trên status → vẫn quét theo ngày.
CREATE INDEX IF NOT EXISTS idx_core_payments_status_created
  ON core_ielts_lms_payments(status, created_at);

-- 2) "Ghi danh gần đây": ORDER BY enrolled_at DESC LIMIT 10
CREATE INDEX IF NOT EXISTS idx_core_uce_enrolled_at
  ON core_ielts_lms_user_course_enrollments(enrolled_at DESC);

-- 3) Danh sách người dùng / tiến độ học sinh: ORDER BY created_at DESC (phân trang)
CREATE INDEX IF NOT EXISTS idx_core_users_created_at
  ON core_ielts_lms_users(created_at DESC);

-- 4) Chi tiết tiến độ: lịch sử làm mock test ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_core_umta_created_at
  ON core_ielts_lms_user_mock_test_attempts(created_at DESC);

-- 5) Chi tiết tiến độ: danh sách bài nộp ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_core_submissions_created_at
  ON core_ielts_lms_submissions(created_at DESC);
