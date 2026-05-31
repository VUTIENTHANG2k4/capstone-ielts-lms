-- ============================================
-- IELTS Academy LMS – Migration v2
-- Adds: classes, packages, payments, password reset
-- All additive – safe to run on existing DB.
-- ============================================

-- ----- 24. PASSWORD RESET TOKENS -----
CREATE TABLE IF NOT EXISTS core_ielts_lms_password_reset_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  token VARCHAR(128) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_core_prt_user ON core_ielts_lms_password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_core_prt_token ON core_ielts_lms_password_reset_tokens(token);

-- ----- 25. CLASSES -----
CREATE TABLE IF NOT EXISTS core_ielts_lms_classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES core_ielts_lms_users(id) ON DELETE SET NULL,
  course_id UUID REFERENCES core_ielts_lms_courses(id) ON DELETE SET NULL,
  schedule_text TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_core_classes_teacher ON core_ielts_lms_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_core_classes_course ON core_ielts_lms_classes(course_id);

DROP TRIGGER IF EXISTS trg_core_classes_updated_at ON core_ielts_lms_classes;
CREATE TRIGGER trg_core_classes_updated_at BEFORE UPDATE ON core_ielts_lms_classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----- 26. CLASS STUDENTS -----
CREATE TABLE IF NOT EXISTS core_ielts_lms_class_students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES core_ielts_lms_classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_core_cs_class ON core_ielts_lms_class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_core_cs_student ON core_ielts_lms_class_students(student_id);

-- ----- 27. PACKAGES -----
CREATE TABLE IF NOT EXISTS core_ielts_lms_packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL DEFAULT 90,
  price NUMERIC(12,0) NOT NULL DEFAULT 0,        -- VND
  is_active BOOLEAN DEFAULT true,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
DROP TRIGGER IF EXISTS trg_core_packages_updated_at ON core_ielts_lms_packages;
CREATE TRIGGER trg_core_packages_updated_at BEFORE UPDATE ON core_ielts_lms_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----- 28. PACKAGE ENROLLMENTS -----
CREATE TABLE IF NOT EXISTS core_ielts_lms_package_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES core_ielts_lms_packages(id) ON DELETE RESTRICT,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','active','expired','cancelled')),
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  payment_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_core_pe_user ON core_ielts_lms_package_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_core_pe_status ON core_ielts_lms_package_enrollments(status);
DROP TRIGGER IF EXISTS trg_core_pe_updated_at ON core_ielts_lms_package_enrollments;
CREATE TRIGGER trg_core_pe_updated_at BEFORE UPDATE ON core_ielts_lms_package_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----- 29. PAYMENTS -----
CREATE TABLE IF NOT EXISTS core_ielts_lms_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES core_ielts_lms_packages(id) ON DELETE SET NULL,
  enrollment_id UUID REFERENCES core_ielts_lms_package_enrollments(id) ON DELETE SET NULL,
  amount NUMERIC(12,0) NOT NULL,
  provider VARCHAR(20) DEFAULT 'vnpay'
    CHECK (provider IN ('vnpay','manual','bank_transfer')),
  txn_ref VARCHAR(64) UNIQUE,
  vnp_response_code VARCHAR(10),
  vnp_transaction_no VARCHAR(50),
  vnp_bank_code VARCHAR(20),
  vnp_pay_date VARCHAR(20),
  raw_response JSONB,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','success','failed','refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_core_payments_user ON core_ielts_lms_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_core_payments_status ON core_ielts_lms_payments(status);
CREATE INDEX IF NOT EXISTS idx_core_payments_txnref ON core_ielts_lms_payments(txn_ref);
DROP TRIGGER IF EXISTS trg_core_payments_updated_at ON core_ielts_lms_payments;
CREATE TRIGGER trg_core_payments_updated_at BEFORE UPDATE ON core_ielts_lms_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----- Mock tests: add is_placement convenience flag (optional, nullable) -----
ALTER TABLE core_ielts_lms_mock_tests
  ADD COLUMN IF NOT EXISTS is_placement BOOLEAN GENERATED ALWAYS AS (test_type = 'PLACEMENT') STORED;

-- ----- Sample packages (idempotent) -----
INSERT INTO core_ielts_lms_packages (name, description, duration_days, price, features)
SELECT 'Gói Cơ bản 1 tháng', 'Truy cập toàn bộ Course PRE-FOUNDATION & FOUNDATION trong 30 ngày.', 30, 499000,
       '["Học toàn bộ 2 khóa đầu","Mock Test không giới hạn","Hỗ trợ qua chat"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM core_ielts_lms_packages WHERE name = 'Gói Cơ bản 1 tháng');

INSERT INTO core_ielts_lms_packages (name, description, duration_days, price, features)
SELECT 'Gói Tiêu chuẩn 3 tháng', 'Truy cập toàn bộ 5 khóa, có chấm Writing/Speaking trong 90 ngày.', 90, 1290000,
       '["Toàn bộ 5 khóa học","Chấm Writing & Speaking","Mock Test không giới hạn","Tham gia lớp học live"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM core_ielts_lms_packages WHERE name = 'Gói Tiêu chuẩn 3 tháng');

INSERT INTO core_ielts_lms_packages (name, description, duration_days, price, features)
SELECT 'Gói Premium 6 tháng', 'Trọn bộ tính năng + chứng chỉ hoàn thành.', 180, 2390000,
       '["Tất cả tính năng Tiêu chuẩn","Chứng chỉ hoàn thành","1-1 với giáo viên 4 buổi","Ưu tiên hỗ trợ 24/7"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM core_ielts_lms_packages WHERE name = 'Gói Premium 6 tháng');
