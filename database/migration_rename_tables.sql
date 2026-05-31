-- ============================================
-- MIGRATION: Rename tables with core_ielts_lms_ prefix
-- Run this if you have an EXISTING database with old table names
-- If fresh install, run schema.sql directly instead
-- ============================================

BEGIN;

-- Drop old triggers first
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
DROP TRIGGER IF EXISTS update_units_updated_at ON units;
DROP TRIGGER IF EXISTS update_sections_updated_at ON sections;
DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
DROP TRIGGER IF EXISTS update_mock_tests_updated_at ON mock_tests;
DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;

-- Rename core tables
ALTER TABLE IF EXISTS users                   RENAME TO core_ielts_lms_users;
ALTER TABLE IF EXISTS courses                 RENAME TO core_ielts_lms_courses;
ALTER TABLE IF EXISTS units                   RENAME TO core_ielts_lms_units;
ALTER TABLE IF EXISTS sections                RENAME TO core_ielts_lms_sections;
ALTER TABLE IF EXISTS lessons                 RENAME TO core_ielts_lms_lessons;
ALTER TABLE IF EXISTS activities              RENAME TO core_ielts_lms_activities;
ALTER TABLE IF EXISTS mock_tests              RENAME TO core_ielts_lms_mock_tests;
ALTER TABLE IF EXISTS mock_test_questions     RENAME TO core_ielts_lms_mock_test_questions;
ALTER TABLE IF EXISTS user_course_enrollments RENAME TO core_ielts_lms_user_course_enrollments;
ALTER TABLE IF EXISTS user_lesson_progress    RENAME TO core_ielts_lms_user_lesson_progress;
ALTER TABLE IF EXISTS user_activity_attempts  RENAME TO core_ielts_lms_user_activity_attempts;
ALTER TABLE IF EXISTS user_mock_test_attempts RENAME TO core_ielts_lms_user_mock_test_attempts;
ALTER TABLE IF EXISTS submissions             RENAME TO core_ielts_lms_submissions;
ALTER TABLE IF EXISTS submission_feedbacks    RENAME TO core_ielts_lms_submission_feedbacks;
ALTER TABLE IF EXISTS drip_rules              RENAME TO core_ielts_lms_drip_rules;
ALTER TABLE IF EXISTS notifications           RENAME TO core_ielts_lms_notifications;

-- Rename indexes
ALTER INDEX IF EXISTS idx_users_email     RENAME TO idx_core_users_email;
ALTER INDEX IF EXISTS idx_users_role      RENAME TO idx_core_users_role;
ALTER INDEX IF EXISTS idx_users_is_active RENAME TO idx_core_users_is_active;

ALTER INDEX IF EXISTS idx_courses_slug   RENAME TO idx_core_courses_slug;
ALTER INDEX IF EXISTS idx_courses_level  RENAME TO idx_core_courses_level;
ALTER INDEX IF EXISTS idx_courses_order  RENAME TO idx_core_courses_order;
ALTER INDEX IF EXISTS idx_courses_active RENAME TO idx_core_courses_active;

ALTER INDEX IF EXISTS idx_units_course RENAME TO idx_core_units_course;
ALTER INDEX IF EXISTS idx_units_order  RENAME TO idx_core_units_order;
ALTER INDEX IF EXISTS idx_units_skill  RENAME TO idx_core_units_skill;

ALTER INDEX IF EXISTS idx_sections_unit  RENAME TO idx_core_sections_unit;
ALTER INDEX IF EXISTS idx_sections_order RENAME TO idx_core_sections_order;
ALTER INDEX IF EXISTS idx_sections_type  RENAME TO idx_core_sections_type;

ALTER INDEX IF EXISTS idx_lessons_section RENAME TO idx_core_lessons_section;
ALTER INDEX IF EXISTS idx_lessons_order   RENAME TO idx_core_lessons_order;
ALTER INDEX IF EXISTS idx_lessons_type    RENAME TO idx_core_lessons_type;

ALTER INDEX IF EXISTS idx_activities_section RENAME TO idx_core_activities_section;
ALTER INDEX IF EXISTS idx_activities_order   RENAME TO idx_core_activities_order;
ALTER INDEX IF EXISTS idx_activities_type    RENAME TO idx_core_activities_type;

ALTER INDEX IF EXISTS idx_mock_tests_type   RENAME TO idx_core_mock_tests_type;
ALTER INDEX IF EXISTS idx_mock_tests_course RENAME TO idx_core_mock_tests_course;
ALTER INDEX IF EXISTS idx_mock_tests_active RENAME TO idx_core_mock_tests_active;

ALTER INDEX IF EXISTS idx_mtq_mock_test RENAME TO idx_core_mtq_mock_test;
ALTER INDEX IF EXISTS idx_mtq_order     RENAME TO idx_core_mtq_order;

ALTER INDEX IF EXISTS idx_uce_user   RENAME TO idx_core_uce_user;
ALTER INDEX IF EXISTS idx_uce_course RENAME TO idx_core_uce_course;
ALTER INDEX IF EXISTS idx_uce_status RENAME TO idx_core_uce_status;

ALTER INDEX IF EXISTS idx_ulp_user   RENAME TO idx_core_ulp_user;
ALTER INDEX IF EXISTS idx_ulp_lesson RENAME TO idx_core_ulp_lesson;
ALTER INDEX IF EXISTS idx_ulp_status RENAME TO idx_core_ulp_status;

ALTER INDEX IF EXISTS idx_uaa_user          RENAME TO idx_core_uaa_user;
ALTER INDEX IF EXISTS idx_uaa_activity      RENAME TO idx_core_uaa_activity;
ALTER INDEX IF EXISTS idx_uaa_user_activity RENAME TO idx_core_uaa_user_activity;
ALTER INDEX IF EXISTS idx_uaa_passed        RENAME TO idx_core_uaa_passed;

ALTER INDEX IF EXISTS idx_umta_user      RENAME TO idx_core_umta_user;
ALTER INDEX IF EXISTS idx_umta_mock_test RENAME TO idx_core_umta_mock_test;
ALTER INDEX IF EXISTS idx_umta_status    RENAME TO idx_core_umta_status;

ALTER INDEX IF EXISTS idx_submissions_user     RENAME TO idx_core_submissions_user;
ALTER INDEX IF EXISTS idx_submissions_activity RENAME TO idx_core_submissions_activity;
ALTER INDEX IF EXISTS idx_submissions_status   RENAME TO idx_core_submissions_status;
ALTER INDEX IF EXISTS idx_submissions_type     RENAME TO idx_core_submissions_type;

ALTER INDEX IF EXISTS idx_sf_submission RENAME TO idx_core_sf_submission;
ALTER INDEX IF EXISTS idx_sf_teacher    RENAME TO idx_core_sf_teacher;

ALTER INDEX IF EXISTS idx_drip_prerequisite RENAME TO idx_core_drip_prerequisite;
ALTER INDEX IF EXISTS idx_drip_target       RENAME TO idx_core_drip_target;

ALTER INDEX IF EXISTS idx_notifications_user    RENAME TO idx_core_notifications_user;
ALTER INDEX IF EXISTS idx_notifications_read    RENAME TO idx_core_notifications_read;
ALTER INDEX IF EXISTS idx_notifications_created RENAME TO idx_core_notifications_created;

-- Add new columns to users (bio, phone)
ALTER TABLE core_ielts_lms_users
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Recreate triggers with new names
CREATE TRIGGER trg_core_users_updated_at BEFORE UPDATE ON core_ielts_lms_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_courses_updated_at BEFORE UPDATE ON core_ielts_lms_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_units_updated_at BEFORE UPDATE ON core_ielts_lms_units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_sections_updated_at BEFORE UPDATE ON core_ielts_lms_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_lessons_updated_at BEFORE UPDATE ON core_ielts_lms_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_activities_updated_at BEFORE UPDATE ON core_ielts_lms_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_mock_tests_updated_at BEFORE UPDATE ON core_ielts_lms_mock_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_core_submissions_updated_at BEFORE UPDATE ON core_ielts_lms_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create new tables for new features
CREATE TABLE IF NOT EXISTS core_ielts_lms_blog_posts (
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
CREATE INDEX IF NOT EXISTS idx_core_blog_slug ON core_ielts_lms_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_core_blog_status ON core_ielts_lms_blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_core_blog_category ON core_ielts_lms_blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_core_blog_author ON core_ielts_lms_blog_posts(author_id);
CREATE TRIGGER trg_core_blog_posts_updated_at BEFORE UPDATE ON core_ielts_lms_blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS core_ielts_lms_study_notes (
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
CREATE INDEX IF NOT EXISTS idx_core_notes_user ON core_ielts_lms_study_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_core_notes_lesson ON core_ielts_lms_study_notes(lesson_id);
CREATE TRIGGER trg_core_study_notes_updated_at BEFORE UPDATE ON core_ielts_lms_study_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS core_ielts_lms_vocabulary_lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  topic VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_core_vocab_lists_user ON core_ielts_lms_vocabulary_lists(user_id);
CREATE TRIGGER trg_core_vocab_lists_updated_at BEFORE UPDATE ON core_ielts_lms_vocabulary_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS core_ielts_lms_vocabulary_items (
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
CREATE INDEX IF NOT EXISTS idx_core_vocab_items_list ON core_ielts_lms_vocabulary_items(list_id);

CREATE TABLE IF NOT EXISTS core_ielts_lms_vocab_user_progress (
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
CREATE INDEX IF NOT EXISTS idx_core_vocab_progress_user ON core_ielts_lms_vocab_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_core_vocab_progress_next ON core_ielts_lms_vocab_user_progress(user_id, next_review_at);

CREATE TABLE IF NOT EXISTS core_ielts_lms_certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES core_ielts_lms_courses(id) ON DELETE CASCADE,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  band_score DECIMAL(3,1),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_core_certs_user ON core_ielts_lms_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_core_certs_course ON core_ielts_lms_certificates(course_id);

CREATE TABLE IF NOT EXISTS core_ielts_lms_study_streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES core_ielts_lms_users(id) ON DELETE CASCADE,
  streak_date DATE NOT NULL,
  activities_completed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  minutes_studied INTEGER DEFAULT 0,
  UNIQUE(user_id, streak_date)
);
CREATE INDEX IF NOT EXISTS idx_core_streaks_user ON core_ielts_lms_study_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_core_streaks_date ON core_ielts_lms_study_streaks(user_id, streak_date DESC);

COMMIT;
