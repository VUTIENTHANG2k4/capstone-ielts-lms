-- ============================================================
-- Migration v4: IELTS Standard Test Structure
-- Adds sections_config JSONB to store per-skill structure:
--   LISTENING → 4 parts, each with audioUrl + imageUrl + description
--   READING   → 3 passages, each with passageText + imageUrl
--   WRITING   → 2 tasks, each with prompt + imageUrl + minWords
-- ============================================================

ALTER TABLE core_ielts_lms_mock_tests
ADD COLUMN IF NOT EXISTS sections_config JSONB DEFAULT NULL;

COMMENT ON COLUMN core_ielts_lms_mock_tests.sections_config IS
'IELTS test structure config.
LISTENING: { "listening": { "parts": [{ "number":1, "title":"Part 1", "audioUrl":"...", "imageUrl":"...", "description":"..." }] } }
READING:   { "reading":   { "passages": [{ "number":1, "title":"Passage 1", "passageText":"...", "imageUrl":"..." }] } }
WRITING:   { "writing":   { "tasks": [{ "number":1, "title":"Task 1", "prompt":"...", "imageUrl":"...", "minWords":150, "timeRecommended":20 }] } }';
