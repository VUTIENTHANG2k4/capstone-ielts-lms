-- ============================================
-- IELTS Academy LMS - Database Schema
-- PostgreSQL (Supabase)
-- All tables prefixed with: core_ielts_lms_
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS
-- ============================================
CREATE TABLE core_ielts_lms_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
  avatar_url TEXT,
  bio TEXT,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_users_email ON core_ielts_lms_users(email);
CREATE INDEX idx_core_users_role ON core_ielts_lms_users(role);
CREATE INDEX idx_core_users_is_active ON core_ielts_lms_users(is_active);

-- ============================================
-- 2. COURSES
-- ============================================
CREATE TABLE core_ielts_lms_courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  level VARCHAR(50) NOT NULL CHECK (level IN ('PRE_FOUNDATION', 'FOUNDATION', 'PRE_IELTS', 'BAND_6_5', 'ADVANCED')),
  band_range VARCHAR(50),
  order_index INTEGER NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  checkpoint_passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_courses_slug ON core_ielts_lms_courses(slug);
CREATE INDEX idx_core_courses_level ON core_ielts_lms_courses(level);
CREATE INDEX idx_core_courses_order ON core_ielts_lms_courses(order_index);
CREATE INDEX idx_core_courses_active ON core_ielts_lms_courses(is_active);

-- ============================================
-- 3. UNITS
-- ============================================
CREATE TABLE core_ielts_lms_units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES core_ielts_lms_courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  skill_type VARCHAR(50) CHECK (skill_type IN ('GRAMMAR', 'VOCABULARY', 'PRONUNCIATION', 'LISTENING', 'READING', 'WRITING', 'SPEAKING', 'MIXED')),
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_units_course ON core_ielts_lms_units(course_id);
CREATE INDEX idx_core_units_order ON core_ielts_lms_units(course_id, order_index);
CREATE INDEX idx_core_units_skill ON core_ielts_lms_units(skill_type);

-- ============================================
-- 4. SECTIONS
-- ============================================
CREATE TABLE core_ielts_lms_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES core_ielts_lms_units(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  section_type VARCHAR(20) NOT NULL CHECK (section_type IN ('INPUT', 'PRACTICE', 'CHECKPOINT')),
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_sections_unit ON core_ielts_lms_sections(unit_id);
CREATE INDEX idx_core_sections_order ON core_ielts_lms_sections(unit_id, order_index);
CREATE INDEX idx_core_sections_type ON core_ielts_lms_sections(section_type);

-- ============================================
-- 5. LESSONS
-- ============================================
CREATE TABLE core_ielts_lms_lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES core_ielts_lms_sections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('VIDEO', 'DOCUMENT', 'EXAMPLE')),
  content_url TEXT,
  content_text TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_lessons_section ON core_ielts_lms_lessons(section_id);
CREATE INDEX idx_core_lessons_order ON core_ielts_lms_lessons(section_id, order_index);
CREATE INDEX idx_core_lessons_type ON core_ielts_lms_lessons(content_type);

-- ============================================
-- 6. ACTIVITIES
-- ============================================
CREATE TABLE core_ielts_lms_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES core_ielts_lms_sections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  activity_type VARCHAR(30) NOT NULL CHECK (activity_type IN (
    'QUIZ', 'FILL_IN_BLANK', 'FLASHCARD', 'MATCHING',
    'LISTENING_DICTATION', 'MINI_TEST', 'TIMED_PRACTICE',
    'SPEAKING_RECORD_SHORT', 'WRITING_SUBMISSION', 'SPEAKING_SUBMISSION'
  )),
  instructions TEXT,
  content JSONB,
  time_limit_minutes INTEGER,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT NULL,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_activities_section ON core_ielts_lms_activities(section_id);
CREATE INDEX idx_core_activities_order ON core_ielts_lms_activities(section_id, order_index);
CREATE INDEX idx_core_activities_type ON core_ielts_lms_activities(activity_type);

-- ============================================
-- 7. MOCK TESTS
-- ============================================
CREATE TABLE core_ielts_lms_mock_tests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  test_type VARCHAR(20) NOT NULL CHECK (test_type IN ('MOCK', 'PLACEMENT', 'CHECKPOINT')),
  course_id UUID REFERENCES core_ielts_lms_courses(id) ON DELETE SET NULL,
  skill VARCHAR(20) CHECK (skill IN ('LISTENING', 'READING', 'WRITING', 'SPEAKING', 'FULL')),
  time_limit_minutes INTEGER NOT NULL DEFAULT 60,
  total_questions INTEGER DEFAULT 0,
  passing_score INTEGER DEFAULT 70,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_mock_tests_type ON core_ielts_lms_mock_tests(test_type);
CREATE INDEX idx_core_mock_tests_course ON core_ielts_lms_mock_tests(course_id);
CREATE INDEX idx_core_mock_tests_active ON core_ielts_lms_mock_tests(is_active);

-- ============================================
-- 8. MOCK TEST QUESTIONS
-- ============================================
CREATE TABLE core_ielts_lms_mock_test_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mock_test_id UUID NOT NULL REFERENCES core_ielts_lms_mock_tests(id) ON DELETE CASCADE,
  section_label VARCHAR(100),
  question_type VARCHAR(30) NOT NULL,
  content JSONB NOT NULL,
  correct_answer JSONB,
  points INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_mtq_mock_test ON core_ielts_lms_mock_test_questions(mock_test_id);
CREATE INDEX idx_core_mtq_order ON core_ielts_lms_mock_test_questions(mock_test_id, order_index);

-- ============================================
-- 9. USER COURSE ENROLLMENTS
-- ============================================
CREATE TABLE core_ielts_lms_user_course_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES core_ielts_lms_courses(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'locked')),
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_core_uce_user ON core_ielts_lms_user_course_enrollments(user_id);
CREATE INDEX idx_core_uce_course ON core_ielts_lms_user_course_enrollments(course_id);
CREATE INDEX idx_core_uce_status ON core_ielts_lms_user_course_enrollments(status);

-- ============================================
-- 10. USER LESSON PROGRESS
-- ============================================
CREATE TABLE core_ielts_lms_user_lesson_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES core_ielts_lms_lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_core_ulp_user ON core_ielts_lms_user_lesson_progress(user_id);
CREATE INDEX idx_core_ulp_lesson ON core_ielts_lms_user_lesson_progress(lesson_id);
CREATE INDEX idx_core_ulp_status ON core_ielts_lms_user_lesson_progress(status);

-- ============================================
-- 11. USER ACTIVITY ATTEMPTS
-- ============================================
CREATE TABLE core_ielts_lms_user_activity_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES core_ielts_lms_activities(id) ON DELETE CASCADE,
  attempt_number INTEGER DEFAULT 1,
  answers JSONB,
  score DECIMAL(5,2),
  is_passed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_core_uaa_user ON core_ielts_lms_user_activity_attempts(user_id);
CREATE INDEX idx_core_uaa_activity ON core_ielts_lms_user_activity_attempts(activity_id);
CREATE INDEX idx_core_uaa_user_activity ON core_ielts_lms_user_activity_attempts(user_id, activity_id);
CREATE INDEX idx_core_uaa_passed ON core_ielts_lms_user_activity_attempts(is_passed);

-- ============================================
-- 12. USER MOCK TEST ATTEMPTS
-- ============================================
CREATE TABLE core_ielts_lms_user_mock_test_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  mock_test_id UUID NOT NULL REFERENCES core_ielts_lms_mock_tests(id) ON DELETE CASCADE,
  answers JSONB,
  score DECIMAL(5,2),
  band_score DECIMAL(3,1),
  recommended_course_id UUID REFERENCES core_ielts_lms_courses(id),
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded')),
  is_auto_submitted BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_umta_user ON core_ielts_lms_user_mock_test_attempts(user_id);
CREATE INDEX idx_core_umta_mock_test ON core_ielts_lms_user_mock_test_attempts(mock_test_id);
CREATE INDEX idx_core_umta_status ON core_ielts_lms_user_mock_test_attempts(status);

-- ============================================
-- 13. SUBMISSIONS
-- ============================================
CREATE TABLE core_ielts_lms_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES core_ielts_lms_activities(id) ON DELETE CASCADE,
  submission_type VARCHAR(20) NOT NULL CHECK (submission_type IN ('WRITING', 'SPEAKING')),
  content_text TEXT,
  content_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'graded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_submissions_user ON core_ielts_lms_submissions(user_id);
CREATE INDEX idx_core_submissions_activity ON core_ielts_lms_submissions(activity_id);
CREATE INDEX idx_core_submissions_status ON core_ielts_lms_submissions(status);
CREATE INDEX idx_core_submissions_type ON core_ielts_lms_submissions(submission_type);

-- ============================================
-- 14. SUBMISSION FEEDBACKS
-- ============================================
CREATE TABLE core_ielts_lms_submission_feedbacks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES core_ielts_lms_submissions(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES core_ielts_lms_users(id),
  band_score DECIMAL(3,1),
  feedback_text TEXT,
  criteria_scores JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_sf_submission ON core_ielts_lms_submission_feedbacks(submission_id);
CREATE INDEX idx_core_sf_teacher ON core_ielts_lms_submission_feedbacks(teacher_id);

-- ============================================
-- 15. DRIP RULES
-- ============================================
CREATE TABLE core_ielts_lms_drip_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prerequisite_type VARCHAR(20) NOT NULL CHECK (prerequisite_type IN ('LESSON', 'ACTIVITY', 'SECTION', 'UNIT', 'COURSE')),
  prerequisite_id UUID NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('LESSON', 'ACTIVITY', 'SECTION', 'UNIT', 'COURSE')),
  target_id UUID NOT NULL,
  min_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_drip_prerequisite ON core_ielts_lms_drip_rules(prerequisite_type, prerequisite_id);
CREATE INDEX idx_core_drip_target ON core_ielts_lms_drip_rules(target_type, target_id);

-- ============================================
-- 16. NOTIFICATIONS
-- ============================================
CREATE TABLE core_ielts_lms_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(30),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_notifications_user ON core_ielts_lms_notifications(user_id);
CREATE INDEX idx_core_notifications_read ON core_ielts_lms_notifications(user_id, is_read);
CREATE INDEX idx_core_notifications_created ON core_ielts_lms_notifications(created_at DESC);

-- ============================================
-- 17. BLOG POSTS (Bài viết / IELTS Tips)
-- ============================================
CREATE TABLE core_ielts_lms_blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  thumbnail_url TEXT,
  author_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE RESTRICT,
  category VARCHAR(50) CHECK (category IN ('GRAMMAR', 'VOCABULARY', 'LISTENING', 'READING', 'WRITING', 'SPEAKING', 'TIPS', 'NEWS', 'OTHER')),
  tags JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_blog_slug ON core_ielts_lms_blog_posts(slug);
CREATE INDEX idx_core_blog_status ON core_ielts_lms_blog_posts(status);
CREATE INDEX idx_core_blog_category ON core_ielts_lms_blog_posts(category);
CREATE INDEX idx_core_blog_author ON core_ielts_lms_blog_posts(author_id);
CREATE INDEX idx_core_blog_published ON core_ielts_lms_blog_posts(published_at DESC) WHERE status = 'published';

-- ============================================
-- 18. STUDY NOTES (Ghi chú học tập)
-- ============================================
CREATE TABLE core_ielts_lms_study_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES core_ielts_lms_lessons(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES core_ielts_lms_activities(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  color VARCHAR(20) DEFAULT 'yellow',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_notes_user ON core_ielts_lms_study_notes(user_id);
CREATE INDEX idx_core_notes_lesson ON core_ielts_lms_study_notes(lesson_id);
CREATE INDEX idx_core_notes_activity ON core_ielts_lms_study_notes(activity_id);

-- ============================================
-- 19. VOCABULARY LISTS (Danh sách từ vựng)
-- ============================================
CREATE TABLE core_ielts_lms_vocabulary_lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  topic VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_vocab_lists_user ON core_ielts_lms_vocabulary_lists(user_id);
CREATE INDEX idx_core_vocab_lists_public ON core_ielts_lms_vocabulary_lists(is_public) WHERE is_public = true;

-- ============================================
-- 20. VOCABULARY ITEMS (Từ vựng)
-- ============================================
CREATE TABLE core_ielts_lms_vocabulary_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES core_ielts_lms_vocabulary_lists(id) ON DELETE CASCADE,
  word VARCHAR(255) NOT NULL,
  definition TEXT NOT NULL,
  example TEXT,
  phonetic VARCHAR(255),
  part_of_speech VARCHAR(50),
  image_url TEXT,
  audio_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_core_vocab_items_list ON core_ielts_lms_vocabulary_items(list_id);
CREATE INDEX idx_core_vocab_items_word ON core_ielts_lms_vocabulary_items(word);

-- ============================================
-- 21. VOCABULARY USER PROGRESS (Spaced Repetition)
-- ============================================
CREATE TABLE core_ielts_lms_vocab_user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES core_ielts_lms_vocabulary_items(id) ON DELETE CASCADE,
  ease_factor DECIMAL(4,2) DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'learning', 'review', 'mastered')),
  next_review_at TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,
  UNIQUE(user_id, item_id)
);

CREATE INDEX idx_core_vocab_progress_user ON core_ielts_lms_vocab_user_progress(user_id);
CREATE INDEX idx_core_vocab_progress_next ON core_ielts_lms_vocab_user_progress(user_id, next_review_at);

-- ============================================
-- 22. CERTIFICATES (Chứng chỉ hoàn thành)
-- ============================================
CREATE TABLE core_ielts_lms_certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES core_ielts_lms_courses(id) ON DELETE CASCADE,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  band_score DECIMAL(3,1),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_core_certs_user ON core_ielts_lms_certificates(user_id);
CREATE INDEX idx_core_certs_course ON core_ielts_lms_certificates(course_id);
CREATE INDEX idx_core_certs_number ON core_ielts_lms_certificates(certificate_number);

-- ============================================
-- 23. STUDY STREAKS (Chuỗi học tập)
-- ============================================
CREATE TABLE core_ielts_lms_study_streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  streak_date DATE NOT NULL,
  activities_completed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  minutes_studied INTEGER DEFAULT 0,
  UNIQUE(user_id, streak_date)
);

CREATE INDEX idx_core_streaks_user ON core_ielts_lms_study_streaks(user_id);
CREATE INDEX idx_core_streaks_date ON core_ielts_lms_study_streaks(user_id, streak_date DESC);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER trg_core_users_updated_at BEFORE UPDATE ON core_ielts_lms_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_courses_updated_at BEFORE UPDATE ON core_ielts_lms_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_units_updated_at BEFORE UPDATE ON core_ielts_lms_units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_sections_updated_at BEFORE UPDATE ON core_ielts_lms_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_lessons_updated_at BEFORE UPDATE ON core_ielts_lms_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_activities_updated_at BEFORE UPDATE ON core_ielts_lms_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_mock_tests_updated_at BEFORE UPDATE ON core_ielts_lms_mock_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_submissions_updated_at BEFORE UPDATE ON core_ielts_lms_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_blog_posts_updated_at BEFORE UPDATE ON core_ielts_lms_blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_study_notes_updated_at BEFORE UPDATE ON core_ielts_lms_study_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_vocab_lists_updated_at BEFORE UPDATE ON core_ielts_lms_vocabulary_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
