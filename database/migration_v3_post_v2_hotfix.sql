-- ============================================
-- IELTS Academy LMS – Migration v3 (post-v2 hotfix)
-- Purpose:
--   - Keep v2 immutable (already executed on existing environments)
--   - Add fields introduced after v2 rollout
-- Safe to run multiple times.
-- ============================================

BEGIN;

-- 1) Classes: support capacity management in admin UI
ALTER TABLE core_ielts_lms_classes
  ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 30;

-- 2) Packages: support original/discount display in pricing UI
ALTER TABLE core_ielts_lms_packages
  ADD COLUMN IF NOT EXISTS original_price NUMERIC(12,0);

-- Optional backfill for seeded package names if original_price is still null
UPDATE core_ielts_lms_packages
SET original_price = CASE name
  WHEN 'Gói Cơ bản 1 tháng' THEN 699000
  WHEN 'Gói Tiêu chuẩn 3 tháng' THEN 1590000
  WHEN 'Gói Premium 6 tháng' THEN 2990000
  ELSE original_price
END
WHERE original_price IS NULL
  AND name IN ('Gói Cơ bản 1 tháng', 'Gói Tiêu chuẩn 3 tháng', 'Gói Premium 6 tháng');

COMMIT;
