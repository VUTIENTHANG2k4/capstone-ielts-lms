-- ============================================
-- IELTS Academy LMS - Seed Data
-- Run AFTER schema.sql
-- Default password for all users: 111111
-- bcrypt hash: $2a$12$bWE3JGuIy0ozh6VOJW5vW.YTVxJZQO5Gld.BJ/6kTBqepWPhv1Jg.
-- ============================================

-- ============================================
-- 1. SEED USERS
-- ============================================
INSERT INTO core_ielts_lms_users (id, email, password_hash, full_name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@ielts.academy', '$2a$12$bWE3JGuIy0ozh6VOJW5vW.YTVxJZQO5Gld.BJ/6kTBqepWPhv1Jg.', 'Admin IELTS Academy', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'teacher@ielts.academy', '$2a$12$bWE3JGuIy0ozh6VOJW5vW.YTVxJZQO5Gld.BJ/6kTBqepWPhv1Jg.', 'Teacher Nguyen Van A', 'teacher'),
  ('33333333-3333-3333-3333-333333333333', 'teacher2@ielts.academy', '$2a$12$bWE3JGuIy0ozh6VOJW5vW.YTVxJZQO5Gld.BJ/6kTBqepWPhv1Jg.', 'Teacher Tran Thi B', 'teacher'),
  ('44444444-4444-4444-4444-444444444444', 'student@ielts.academy', '$2a$12$bWE3JGuIy0ozh6VOJW5vW.YTVxJZQO5Gld.BJ/6kTBqepWPhv1Jg.', 'Student Le Van C', 'student'),
  ('55555555-5555-5555-5555-555555555555', 'student2@ielts.academy', '$2a$12$bWE3JGuIy0ozh6VOJW5vW.YTVxJZQO5Gld.BJ/6kTBqepWPhv1Jg.', 'Student Pham Thi D', 'student');

-- ============================================
-- 2. SEED COURSES
-- ============================================
INSERT INTO core_ielts_lms_courses (id, title, slug, description, level, band_range, order_index, checkpoint_passing_score) VALUES
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'PRE-FOUNDATION: Mất gốc', 'pre-foundation', 'Khóa học dành cho người mới bắt đầu, chưa biết gì về tiếng Anh học thuật. Xây dựng nền tảng phiên âm IPA, vốn từ tối thiểu 500 từ, ngữ pháp căn bản.', 'PRE_FOUNDATION', '0 → 3.0', 1, 60),
  ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'FOUNDATION: Nền tảng', 'foundation', 'Xây dựng vững chắc Grammar, Vocabulary và Pronunciation trước khi bước vào kỹ năng IELTS. Mục tiêu đạt band 4.5.', 'FOUNDATION', '3.0 → 4.5', 2, 65),
  ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'PRE-IELTS: Khởi động IELTS', 'pre-ielts', 'Làm quen IELTS format và học chiến thuật cơ bản từng kỹ năng. Bắt đầu luyện tập với đề thi thật.', 'PRE_IELTS', '4.5 → 5.5', 3, 65),
  ('aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'BAND 6.5: Skill Building', 'band-6-5', 'Luyện chuyên sâu từng dạng bài, nâng cao chiến thuật và kỹ năng để đạt 6.0 – 6.5.', 'BAND_6_5', '5.5 → 6.5', 4, 70),
  ('aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'ADVANCED: Tăng tốc', 'advanced', 'Nâng band 7.0 – 7.5+, kết hợp kỹ năng và luyện timing thực chiến. Full Mock Practice.', 'ADVANCED', '6.5 → 7.5+', 5, 75);

-- ============================================
-- 3. SEED UNITS - Course 1: PRE-FOUNDATION
-- ============================================
INSERT INTO core_ielts_lms_units (id, course_id, title, description, skill_type, order_index) VALUES
  ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Alphabet & Phonics', 'Học bảng chữ cái, phiên âm IPA cơ bản và cách phát âm chuẩn.', 'PRONUNCIATION', 1),
  ('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Basic Vocabulary', 'Xây dựng vốn từ vựng cơ bản 500 từ thông dụng nhất.', 'VOCABULARY', 2),
  ('bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Basic Grammar', 'Ngữ pháp nền tảng: thì hiện tại đơn, danh từ, tính từ, giới từ.', 'GRAMMAR', 3);

-- ============================================
-- 4. SEED UNITS - Course 2: FOUNDATION
-- ============================================
INSERT INTO core_ielts_lms_units (id, course_id, title, description, skill_type, order_index) VALUES
  ('bbbbbbb4-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Grammar Essentials', 'Ngữ pháp thiết yếu: các thì, câu bị động, câu điều kiện.', 'GRAMMAR', 1),
  ('bbbbbbb5-bbbb-bbbb-bbbb-bbbbbbbbbbb5', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Topic Vocabulary', 'Từ vựng theo 8 chủ đề IELTS phổ biến nhất.', 'VOCABULARY', 2),
  ('bbbbbbb6-bbbb-bbbb-bbbb-bbbbbbbbbbb6', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Pronunciation Mastery', 'Luyện phát âm nâng cao: stress, intonation, connected speech.', 'PRONUNCIATION', 3);

-- ============================================
-- 5. SEED UNITS - Course 3: PRE-IELTS
-- ============================================
INSERT INTO core_ielts_lms_units (id, course_id, title, description, skill_type, order_index) VALUES
  ('bbbbbbb7-bbbb-bbbb-bbbb-bbbbbbbbbbb7', 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Listening Foundation', 'Làm quen Listening IELTS: Part 1-4, note completion, matching.', 'LISTENING', 1),
  ('bbbbbbb8-bbbb-bbbb-bbbb-bbbbbbbbbbb8', 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Reading Foundation', 'Kỹ năng Reading cơ bản: scanning, skimming, True/False/NG.', 'READING', 2),
  ('bbbbbbb9-bbbb-bbbb-bbbb-bbbbbbbbbbb9', 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Writing Foundation', 'Giới thiệu Writing Task 1 & 2, cấu trúc bài viết cơ bản.', 'WRITING', 3),
  ('bbbbbbba-bbbb-bbbb-bbbb-bbbbbbbbbbaa', 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Speaking Foundation', 'Luyện Speaking Part 1-3, kỹ năng trả lời và mở rộng câu.', 'SPEAKING', 4);

-- ============================================
-- 6. SEED UNITS - Course 4: BAND 6.5
-- ============================================
INSERT INTO core_ielts_lms_units (id, course_id, title, description, skill_type, order_index) VALUES
  ('bbbbbbbc-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'Listening Strategies', 'Chiến thuật nâng cao cho IELTS Listening đạt 6.5+.', 'LISTENING', 1),
  ('bbbbbbbd-bbbb-bbbb-bbbb-bbbbbbbbbbbd', 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'Reading Strategies', 'Kỹ thuật đọc nâng cao, xử lý passage phức tạp.', 'READING', 2),
  ('bbbbbbbe-bbbb-bbbb-bbbb-bbbbbbbbbbbe', 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'Writing Mastery', 'Nâng cao kỹ năng Writing Task 1 & 2 đạt 6.5+.', 'WRITING', 3),
  ('bbbbbbbf-bbbb-bbbb-bbbb-bbbbbbbbbbbf', 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'Speaking Mastery', 'Luyện nói trôi chảy, tự nhiên, đạt 6.5+ Speaking.', 'SPEAKING', 4);

-- ============================================
-- 7. SEED UNITS - Course 5: ADVANCED
-- ============================================
INSERT INTO core_ielts_lms_units (id, course_id, title, description, skill_type, order_index) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'Advanced Strategies', 'Chiến thuật band 7+ cho tất cả kỹ năng.', 'MIXED', 1),
  ('f2222222-2222-2222-2222-222222222222', 'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'Full Mock Practice', 'Luyện thi Mock Test đầy đủ 4 kỹ năng.', 'MIXED', 2),
  ('f3333333-3333-3333-3333-333333333333', 'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'Band 7+ Writing & Speaking', 'Kỹ thuật viết và nói band 7.0 – 7.5+.', 'MIXED', 3);

-- ============================================
-- 8. SEED SECTIONS for Unit 1 of Course 1
-- ============================================
INSERT INTO core_ielts_lms_sections (id, unit_id, title, section_type, order_index) VALUES
  ('ccccccc1-cccc-cccc-cccc-ccccccccccc1', 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'Kiến thức: Bảng phiên âm IPA', 'INPUT', 1),
  ('ccccccc2-cccc-cccc-cccc-ccccccccccc2', 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'Luyện tập: Phonics Practice', 'PRACTICE', 2),
  ('ccccccc3-cccc-cccc-cccc-ccccccccccc3', 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'Kiểm tra: Alphabet & Phonics Test', 'CHECKPOINT', 3);

-- Sections for Unit 2 of Course 1
INSERT INTO core_ielts_lms_sections (id, unit_id, title, section_type, order_index) VALUES
  ('ccccccc4-cccc-cccc-cccc-ccccccccccc4', 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'Kiến thức: 500 từ cơ bản', 'INPUT', 1),
  ('ccccccc5-cccc-cccc-cccc-ccccccccccc5', 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'Luyện tập: Vocabulary Practice', 'PRACTICE', 2),
  ('ccccccc6-cccc-cccc-cccc-ccccccccccc6', 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'Kiểm tra: Vocabulary Test', 'CHECKPOINT', 3);

-- Sections for Unit 3 of Course 1
INSERT INTO core_ielts_lms_sections (id, unit_id, title, section_type, order_index) VALUES
  ('ccccccc7-cccc-cccc-cccc-ccccccccccc7', 'bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'Kiến thức: Ngữ pháp căn bản', 'INPUT', 1),
  ('ccccccc8-cccc-cccc-cccc-ccccccccccc8', 'bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'Luyện tập: Grammar Practice', 'PRACTICE', 2),
  ('ccccccc9-cccc-cccc-cccc-ccccccccccc9', 'bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'Kiểm tra: Grammar Test', 'CHECKPOINT', 3);

-- Sections for Course 2, Unit 1
INSERT INTO core_ielts_lms_sections (id, unit_id, title, section_type, order_index) VALUES
  ('ccccccca-cccc-cccc-cccc-ccccccccccca', 'bbbbbbb4-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'Kiến thức: Grammar Essentials', 'INPUT', 1),
  ('cccccccb-cccc-cccc-cccc-cccccccccccb', 'bbbbbbb4-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'Luyện tập: Grammar Exercises', 'PRACTICE', 2),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbb4-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'Kiểm tra: Grammar Checkpoint', 'CHECKPOINT', 3);

-- ============================================
-- 9. SEED LESSONS
-- ============================================
INSERT INTO core_ielts_lms_lessons (id, section_id, title, content_type, content_text, order_index, duration_minutes) VALUES
  ('ddddddd1-dddd-dddd-dddd-ddddddddddd1', 'ccccccc1-cccc-cccc-cccc-ccccccccccc1', 'Giới thiệu bảng phiên âm IPA', 'DOCUMENT', '# Bảng phiên âm IPA

## Phiên âm là gì?
Phiên âm quốc tế (IPA - International Phonetic Alphabet) là hệ thống ký hiệu dùng để biểu diễn âm thanh trong các ngôn ngữ.

## Nguyên âm (Vowels)
- /iː/ như trong "see"
- /ɪ/ như trong "sit"
- /e/ như trong "bed"
- /æ/ như trong "cat"
- /ɑː/ như trong "car"
- /ɒ/ như trong "hot"
- /ɔː/ như trong "call"
- /ʊ/ như trong "put"
- /uː/ như trong "too"
- /ʌ/ như trong "cup"
- /ɜː/ như trong "bird"
- /ə/ như trong "about"

## Phụ âm (Consonants)
- /p/ như trong "pen"
- /b/ như trong "bad"
- /t/ như trong "tea"
- /d/ như trong "did"
- /k/ như trong "cat"
- /g/ như trong "get"
- /f/ như trong "fall"
- /v/ như trong "voice"

## Mẹo học phiên âm
1. Luyện tập mỗi ngày 15 phút
2. Nghe và bắt chước native speaker
3. Ghi âm giọng mình và so sánh', 1, 15),
  ('ddddddd2-dddd-dddd-dddd-ddddddddddd2', 'ccccccc1-cccc-cccc-cccc-ccccccccccc1', 'Video: Cách đọc phiên âm IPA', 'VIDEO', null, 2, 20),
  ('ddddddd3-dddd-dddd-dddd-ddddddddddd3', 'ccccccc1-cccc-cccc-cccc-ccccccccccc1', 'Ví dụ: Phát âm các cặp âm tối thiểu', 'EXAMPLE', '# Cặp âm tối thiểu (Minimal Pairs)

Cặp âm tối thiểu là hai từ chỉ khác nhau một âm, giúp bạn luyện phân biệt âm.

| Âm 1 | Từ 1 | Âm 2 | Từ 2 |
|-------|------|-------|------|
| /iː/ | sheep | /ɪ/ | ship |
| /æ/ | bat | /e/ | bet |
| /ɑː/ | cart | /ʌ/ | cut |
| /ɒ/ | cot | /ɔː/ | caught |
| /ʊ/ | full | /uː/ | fool |

## Bài tập
Hãy đọc to từng cặp từ và chú ý sự khác biệt giữa hai âm.', 3, 10);

-- Lessons for Section: 500 từ cơ bản
INSERT INTO core_ielts_lms_lessons (id, section_id, title, content_type, content_text, order_index, duration_minutes) VALUES
  ('ddddddd4-dddd-dddd-dddd-ddddddddddd4', 'ccccccc4-cccc-cccc-cccc-ccccccccccc4', 'Nhóm từ vựng: Gia đình & Con người', 'DOCUMENT', '# Nhóm từ vựng: Gia đình & Con người

## Từ vựng cơ bản
| Từ | Phiên âm | Nghĩa |
|---|---|---|
| family | /ˈfæm.əl.i/ | gia đình |
| father | /ˈfɑː.ðər/ | bố |
| mother | /ˈmʌð.ər/ | mẹ |
| brother | /ˈbrʌð.ər/ | anh/em trai |
| sister | /ˈsɪs.tər/ | chị/em gái |
| husband | /ˈhʌz.bənd/ | chồng |
| wife | /waɪf/ | vợ |
| child | /tʃaɪld/ | con |
| friend | /frend/ | bạn |
| neighbor | /ˈneɪ.bər/ | hàng xóm |', 1, 15),
  ('ddddddd5-dddd-dddd-dddd-ddddddddddd5', 'ccccccc4-cccc-cccc-cccc-ccccccccccc4', 'Nhóm từ vựng: Thức ăn & Đồ uống', 'DOCUMENT', '# Nhóm từ vựng: Thức ăn & Đồ uống

| Từ | Phiên âm | Nghĩa |
|---|---|---|
| food | /fuːd/ | thức ăn |
| water | /ˈwɔː.tər/ | nước |
| rice | /raɪs/ | gạo/cơm |
| bread | /bred/ | bánh mì |
| meat | /miːt/ | thịt |
| fish | /fɪʃ/ | cá |
| fruit | /fruːt/ | trái cây |
| vegetable | /ˈvedʒ.tə.bəl/ | rau |
| milk | /mɪlk/ | sữa |
| coffee | /ˈkɒf.i/ | cà phê |', 2, 15);

-- Lessons for Grammar section
INSERT INTO core_ielts_lms_lessons (id, section_id, title, content_type, content_text, order_index, duration_minutes) VALUES
  ('ddddddd6-dddd-dddd-dddd-ddddddddddd6', 'ccccccc7-cccc-cccc-cccc-ccccccccccc7', 'Thì hiện tại đơn (Present Simple)', 'DOCUMENT', '# Thì hiện tại đơn (Present Simple)

## Cấu trúc
- **Khẳng định**: S + V(s/es) + O
- **Phủ định**: S + do/does + not + V + O
- **Nghi vấn**: Do/Does + S + V + O?

## Cách dùng
1. Diễn tả thói quen, sự thật hiển nhiên
2. Diễn tả lịch trình, thời gian biểu

## Ví dụ
- I **study** English every day.
- She **goes** to school by bus.
- The sun **rises** in the east.
- **Do** you **like** coffee?
- He **does not (doesn''t) play** football.

## Dấu hiệu nhận biết
always, usually, often, sometimes, rarely, never, every day/week/month', 1, 20);

-- ============================================
-- 10. SEED ACTIVITIES
-- ============================================

-- Quiz Activity for Phonics Practice
INSERT INTO core_ielts_lms_activities (id, section_id, title, activity_type, instructions, content, passing_score, order_index) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'ccccccc2-cccc-cccc-cccc-ccccccccccc2', 'Quiz: Phiên âm IPA cơ bản', 'QUIZ', 'Chọn phiên âm đúng cho mỗi từ sau đây.', '{
    "questions": [
      {
        "id": 1,
        "question": "Từ \"cat\" được phiên âm là gì?",
        "options": ["/kæt/", "/kɑːt/", "/ket/", "/kɪt/"],
        "correct": 0
      },
      {
        "id": 2,
        "question": "Từ \"sheep\" được phiên âm là gì?",
        "options": ["/ʃɪp/", "/ʃiːp/", "/ʃep/", "/ʃæp/"],
        "correct": 1
      },
      {
        "id": 3,
        "question": "Âm /ə/ xuất hiện trong từ nào?",
        "options": ["cat", "about", "see", "put"],
        "correct": 1
      },
      {
        "id": 4,
        "question": "Từ \"bird\" chứa nguyên âm nào?",
        "options": ["/ɪ/", "/iː/", "/ɜː/", "/ɑː/"],
        "correct": 2
      },
      {
        "id": 5,
        "question": "Cặp từ nào là minimal pair?",
        "options": ["cat - dog", "ship - sheep", "book - cook", "pen - pencil"],
        "correct": 1
      }
    ]
  }', 60, 1);

-- Flashcard Activity
INSERT INTO core_ielts_lms_activities (id, section_id, title, activity_type, instructions, content, passing_score, order_index) VALUES
  ('e2222222-2222-2222-2222-222222222222', 'ccccccc2-cccc-cccc-cccc-ccccccccccc2', 'Flashcard: Ký hiệu phiên âm', 'FLASHCARD', 'Lật thẻ để học các ký hiệu phiên âm IPA.', '{
    "cards": [
      {"front": "/iː/", "back": "Âm dài như trong \"see\", \"tree\", \"me\""},
      {"front": "/ɪ/", "back": "Âm ngắn như trong \"sit\", \"big\", \"ship\""},
      {"front": "/æ/", "back": "Âm như trong \"cat\", \"bad\", \"hat\""},
      {"front": "/ɑː/", "back": "Âm dài như trong \"car\", \"far\", \"star\""},
      {"front": "/ɒ/", "back": "Âm ngắn như trong \"hot\", \"dog\", \"lot\""},
      {"front": "/ʌ/", "back": "Âm như trong \"cup\", \"but\", \"run\""},
      {"front": "/ɜː/", "back": "Âm dài như trong \"bird\", \"word\", \"nurse\""},
      {"front": "/ə/", "back": "Âm schwa, không nhấn, như trong \"about\", \"taken\""}
    ]
  }', 0, 2);

-- Matching Activity
INSERT INTO core_ielts_lms_activities (id, section_id, title, activity_type, instructions, content, passing_score, order_index) VALUES
  ('e3333333-3333-3333-3333-333333333333', 'ccccccc2-cccc-cccc-cccc-ccccccccccc2', 'Matching: Nối từ với phiên âm', 'MATCHING', 'Nối mỗi từ với phiên âm IPA đúng của nó.', '{
    "pairs": [
      {"left": "cat", "right": "/kæt/"},
      {"left": "bird", "right": "/bɜːd/"},
      {"left": "sheep", "right": "/ʃiːp/"},
      {"left": "cup", "right": "/kʌp/"},
      {"left": "about", "right": "/əˈbaʊt/"},
      {"left": "car", "right": "/kɑːr/"}
    ]
  }', 60, 3);

-- Fill in the Blank Activity for Vocabulary
INSERT INTO core_ielts_lms_activities (id, section_id, title, activity_type, instructions, content, passing_score, order_index) VALUES
  ('e4444444-4444-4444-4444-444444444444', 'ccccccc5-cccc-cccc-cccc-ccccccccccc5', 'Fill in the Blank: Từ vựng gia đình', 'FILL_IN_BLANK', 'Điền từ đúng vào chỗ trống.', '{
    "questions": [
      {"sentence": "My ___ is a doctor. He works at the hospital.", "answer": "father", "hint": "bố"},
      {"sentence": "She is my ___. We have the same parents.", "answer": "sister", "hint": "chị/em gái"},
      {"sentence": "My ___ and I got married last year.", "answer": "husband", "hint": "chồng"},
      {"sentence": "The ___ next door is very friendly.", "answer": "neighbor", "hint": "hàng xóm"},
      {"sentence": "I have two ___. One is 5 and the other is 8.", "answer": "children", "hint": "con"}
    ]
  }', 60, 1);

INSERT INTO core_ielts_lms_activities (id, section_id, title, activity_type, instructions, content, passing_score, order_index) VALUES
  ('e5555555-5555-5555-5555-555555555555', 'ccccccc5-cccc-cccc-cccc-ccccccccccc5', 'Flashcard: Food & Drinks', 'FLASHCARD', 'Lật thẻ để học từ vựng về thức ăn và đồ uống.', '{
    "cards": [
      {"front": "Rice", "back": "/raɪs/ - Gạo, cơm"},
      {"front": "Bread", "back": "/bred/ - Bánh mì"},
      {"front": "Meat", "back": "/miːt/ - Thịt"},
      {"front": "Fish", "back": "/fɪʃ/ - Cá"},
      {"front": "Fruit", "back": "/fruːt/ - Trái cây"},
      {"front": "Vegetable", "back": "/ˈvedʒ.tə.bəl/ - Rau"},
      {"front": "Milk", "back": "/mɪlk/ - Sữa"},
      {"front": "Coffee", "back": "/ˈkɒf.i/ - Cà phê"}
    ]
  }', 0, 2);

-- Grammar Quiz
INSERT INTO core_ielts_lms_activities (id, section_id, title, activity_type, instructions, content, passing_score, order_index) VALUES
  ('e6666666-6666-6666-6666-666666666666', 'ccccccc8-cccc-cccc-cccc-ccccccccccc8', 'Quiz: Present Simple', 'QUIZ', 'Chọn đáp án đúng cho mỗi câu.', '{
    "questions": [
      {
        "id": 1,
        "question": "She ___ to school every day.",
        "options": ["go", "goes", "going", "gone"],
        "correct": 1
      },
      {
        "id": 2,
        "question": "___ you like coffee?",
        "options": ["Does", "Do", "Is", "Are"],
        "correct": 1
      },
      {
        "id": 3,
        "question": "He ___ not play football.",
        "options": ["do", "does", "is", "are"],
        "correct": 1
      },
      {
        "id": 4,
        "question": "The sun ___ in the east.",
        "options": ["rise", "rises", "rising", "rose"],
        "correct": 1
      },
      {
        "id": 5,
        "question": "I ___ English every morning.",
        "options": ["studies", "study", "studying", "studied"],
        "correct": 1
      }
    ]
  }', 60, 1);

-- Checkpoint Quiz for Unit 1
INSERT INTO core_ielts_lms_activities (id, section_id, title, activity_type, instructions, content, time_limit_minutes, passing_score, order_index) VALUES
  ('e7777777-7777-7777-7777-777777777777', 'ccccccc3-cccc-cccc-cccc-ccccccccccc3', 'Checkpoint: Alphabet & Phonics', 'MINI_TEST', 'Bài kiểm tra tổng hợp kiến thức về bảng phiên âm IPA. Bạn cần đạt tối thiểu 70% để mở khóa Unit tiếp theo.', '{
    "questions": [
      {
        "id": 1,
        "type": "multiple_choice",
        "question": "Từ \"teacher\" được phiên âm là gì?",
        "options": ["/ˈtiː.tʃər/", "/ˈtɪ.tʃər/", "/ˈteɪ.tʃər/", "/ˈtæ.tʃər/"],
        "correct": 0
      },
      {
        "id": 2,
        "type": "multiple_choice",
        "question": "Âm /θ/ xuất hiện trong từ nào?",
        "options": ["the", "think", "she", "he"],
        "correct": 1
      },
      {
        "id": 3,
        "type": "multiple_choice",
        "question": "Có bao nhiêu nguyên âm trong hệ thống IPA tiếng Anh?",
        "options": ["5", "7", "12", "20"],
        "correct": 2
      },
      {
        "id": 4,
        "type": "multiple_choice",
        "question": "Từ \"book\" chứa nguyên âm nào?",
        "options": ["/uː/", "/ʊ/", "/ɒ/", "/ɔː/"],
        "correct": 1
      },
      {
        "id": 5,
        "type": "multiple_choice",
        "question": "Cặp từ nào KHÔNG phải minimal pair?",
        "options": ["ship - sheep", "bat - bet", "cat - car", "full - fool"],
        "correct": 2
      }
    ]
  }', 10, 70, 1);

-- ============================================
-- 11. SEED MOCK TESTS
-- ============================================

-- Placement Test
INSERT INTO core_ielts_lms_mock_tests (id, title, description, test_type, skill, time_limit_minutes, total_questions, passing_score) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'IELTS Placement Test', 'Bài kiểm tra đầu vào để xác định trình độ và Course phù hợp. Bao gồm câu hỏi về Grammar, Vocabulary, Listening và Reading.', 'PLACEMENT', 'FULL', 30, 20, 0);

-- Mock Test
INSERT INTO core_ielts_lms_mock_tests (id, title, description, test_type, skill, time_limit_minutes, total_questions, passing_score) VALUES
  ('d2222222-2222-2222-2222-222222222222', 'IELTS Listening Mock Test 1', 'Bài thi thử IELTS Listening đầy đủ 4 Parts, 40 câu hỏi, 30 phút.', 'MOCK', 'LISTENING', 30, 40, 0),
  ('d3333333-3333-3333-3333-333333333333', 'IELTS Reading Mock Test 1', 'Bài thi thử IELTS Reading đầy đủ 3 Passages, 40 câu hỏi, 60 phút.', 'MOCK', 'READING', 60, 40, 0);

-- Checkpoint Tests
INSERT INTO core_ielts_lms_mock_tests (id, title, description, test_type, course_id, skill, time_limit_minutes, total_questions, passing_score) VALUES
  ('d4444444-4444-4444-4444-444444444444', 'Checkpoint: PRE-FOUNDATION', 'Bài kiểm tra cuối khóa PRE-FOUNDATION. Đạt 60% để mở khóa FOUNDATION.', 'CHECKPOINT', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'FULL', 20, 15, 60),
  ('d5555555-5555-5555-5555-555555555555', 'Checkpoint: FOUNDATION', 'Bài kiểm tra cuối khóa FOUNDATION. Đạt 65% để mở khóa PRE-IELTS.', 'CHECKPOINT', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'FULL', 25, 20, 65);

-- ============================================
-- 12. SEED MOCK TEST QUESTIONS (Placement Test)
-- ============================================
INSERT INTO core_ielts_lms_mock_test_questions (mock_test_id, section_label, question_type, content, correct_answer, points, order_index) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'Grammar', 'MULTIPLE_CHOICE', '{"question": "She ___ to school every day.", "options": ["go", "goes", "going", "gone"]}', '{"answer": 1}', 1, 1),
  ('d1111111-1111-1111-1111-111111111111', 'Grammar', 'MULTIPLE_CHOICE', '{"question": "I ___ reading a book now.", "options": ["am", "is", "are", "be"]}', '{"answer": 0}', 1, 2),
  ('d1111111-1111-1111-1111-111111111111', 'Grammar', 'MULTIPLE_CHOICE', '{"question": "They ___ to Paris last summer.", "options": ["go", "goes", "went", "going"]}', '{"answer": 2}', 1, 3),
  ('d1111111-1111-1111-1111-111111111111', 'Grammar', 'MULTIPLE_CHOICE', '{"question": "If I ___ rich, I would travel the world.", "options": ["am", "was", "were", "be"]}', '{"answer": 2}', 1, 4),
  ('d1111111-1111-1111-1111-111111111111', 'Grammar', 'MULTIPLE_CHOICE', '{"question": "The book ___ by a famous author.", "options": ["wrote", "was written", "writing", "write"]}', '{"answer": 1}', 1, 5),
  ('d1111111-1111-1111-1111-111111111111', 'Vocabulary', 'MULTIPLE_CHOICE', '{"question": "What is the synonym of \"happy\"?", "options": ["sad", "angry", "joyful", "tired"]}', '{"answer": 2}', 1, 6),
  ('d1111111-1111-1111-1111-111111111111', 'Vocabulary', 'MULTIPLE_CHOICE', '{"question": "\"Environment\" means:", "options": ["con người", "môi trường", "giáo dục", "kinh tế"]}', '{"answer": 1}', 1, 7),
  ('d1111111-1111-1111-1111-111111111111', 'Vocabulary', 'MULTIPLE_CHOICE', '{"question": "The opposite of \"increase\" is:", "options": ["grow", "rise", "decrease", "expand"]}', '{"answer": 2}', 1, 8),
  ('d1111111-1111-1111-1111-111111111111', 'Vocabulary', 'MULTIPLE_CHOICE', '{"question": "\"Significant\" is closest in meaning to:", "options": ["small", "important", "quick", "easy"]}', '{"answer": 1}', 1, 9),
  ('d1111111-1111-1111-1111-111111111111', 'Vocabulary', 'MULTIPLE_CHOICE', '{"question": "Choose the correct word: The ___ of the city is about 2 million.", "options": ["pollution", "population", "position", "possession"]}', '{"answer": 1}', 1, 10),
  ('d1111111-1111-1111-1111-111111111111', 'Reading', 'MULTIPLE_CHOICE', '{"question": "Read: ''The weather in London is often rainy and cold.'' What is true about London?", "options": ["It is always sunny", "It often rains", "It is very hot", "It never rains"]}', '{"answer": 1}', 1, 11),
  ('d1111111-1111-1111-1111-111111111111', 'Reading', 'MULTIPLE_CHOICE', '{"question": "Read: ''Scientists have discovered a new species of frog in the Amazon.'' Where was the frog found?", "options": ["Africa", "Europe", "Amazon", "Asia"]}', '{"answer": 2}', 1, 12),
  ('d1111111-1111-1111-1111-111111111111', 'Reading', 'MULTIPLE_CHOICE', '{"question": "Read: ''Many students prefer online learning because it offers flexibility.'' Why do students prefer online learning?", "options": ["It is cheaper", "It is more flexible", "Teachers are better", "It has more exams"]}', '{"answer": 1}', 1, 13),
  ('d1111111-1111-1111-1111-111111111111', 'Reading', 'MULTIPLE_CHOICE', '{"question": "Read: ''The company reported a 20% increase in revenue compared to last year.'' What happened to the revenue?", "options": ["It decreased", "It stayed the same", "It increased by 20%", "It doubled"]}', '{"answer": 2}', 1, 14),
  ('d1111111-1111-1111-1111-111111111111', 'Reading', 'MULTIPLE_CHOICE', '{"question": "Read: ''Despite the challenges, the team managed to complete the project on time.'' Did the team finish on time?", "options": ["No", "Yes", "Not mentioned", "They gave up"]}', '{"answer": 1}', 1, 15),
  ('d1111111-1111-1111-1111-111111111111', 'Advanced Grammar', 'MULTIPLE_CHOICE', '{"question": "Not until he ___ home did he realize his mistake.", "options": ["gets", "got", "getting", "get"]}', '{"answer": 1}', 1, 16),
  ('d1111111-1111-1111-1111-111111111111', 'Advanced Grammar', 'MULTIPLE_CHOICE', '{"question": "Had I known about the traffic, I ___ earlier.", "options": ["would leave", "would have left", "will leave", "had left"]}', '{"answer": 1}', 1, 17),
  ('d1111111-1111-1111-1111-111111111111', 'Advanced Vocabulary', 'MULTIPLE_CHOICE', '{"question": "The government implemented new policies to ___ economic growth.", "options": ["stimulate", "simulate", "stipulate", "stagnate"]}', '{"answer": 0}', 1, 18),
  ('d1111111-1111-1111-1111-111111111111', 'Advanced Vocabulary', 'MULTIPLE_CHOICE', '{"question": "\"Ubiquitous\" means:", "options": ["rare", "present everywhere", "expensive", "dangerous"]}', '{"answer": 1}', 1, 19),
  ('d1111111-1111-1111-1111-111111111111', 'Advanced Reading', 'MULTIPLE_CHOICE', '{"question": "The author''s tone in the passage can best be described as:", "options": ["optimistic", "pessimistic", "neutral", "sarcastic"]}', '{"answer": 0}', 1, 20);

-- Checkpoint Test Questions for Course 1
INSERT INTO core_ielts_lms_mock_test_questions (mock_test_id, section_label, question_type, content, correct_answer, points, order_index) VALUES
  ('d4444444-4444-4444-4444-444444444444', 'Phonics', 'MULTIPLE_CHOICE', '{"question": "Từ \"think\" bắt đầu bằng âm gì?", "options": ["/t/", "/θ/", "/ð/", "/s/"]}', '{"answer": 1}', 1, 1),
  ('d4444444-4444-4444-4444-444444444444', 'Phonics', 'MULTIPLE_CHOICE', '{"question": "Từ \"church\" chứa âm gì?", "options": ["/ʃ/", "/tʃ/", "/k/", "/dʒ/"]}', '{"answer": 1}', 1, 2),
  ('d4444444-4444-4444-4444-444444444444', 'Vocabulary', 'MULTIPLE_CHOICE', '{"question": "\"Brother\" nghĩa là gì?", "options": ["chị gái", "anh/em trai", "bố", "mẹ"]}', '{"answer": 1}', 1, 3),
  ('d4444444-4444-4444-4444-444444444444', 'Vocabulary', 'MULTIPLE_CHOICE', '{"question": "\"Vegetable\" nghĩa là gì?", "options": ["trái cây", "thịt", "rau", "sữa"]}', '{"answer": 2}', 1, 4),
  ('d4444444-4444-4444-4444-444444444444', 'Vocabulary', 'MULTIPLE_CHOICE', '{"question": "\"Water\" phiên âm là:", "options": ["/ˈwɔː.tər/", "/ˈwɒ.tər/", "/ˈweɪ.tər/", "/ˈwʌ.tər/"]}', '{"answer": 0}', 1, 5),
  ('d4444444-4444-4444-4444-444444444444', 'Grammar', 'MULTIPLE_CHOICE', '{"question": "She ___ English every day.", "options": ["study", "studies", "studying", "studied"]}', '{"answer": 1}', 1, 6),
  ('d4444444-4444-4444-4444-444444444444', 'Grammar', 'MULTIPLE_CHOICE', '{"question": "___ he like music?", "options": ["Do", "Does", "Is", "Are"]}', '{"answer": 1}', 1, 7),
  ('d4444444-4444-4444-4444-444444444444', 'Grammar', 'MULTIPLE_CHOICE', '{"question": "We ___ go to school on Sundays.", "options": ["don''t", "doesn''t", "isn''t", "aren''t"]}', '{"answer": 0}', 1, 8),
  ('d4444444-4444-4444-4444-444444444444', 'Grammar', 'MULTIPLE_CHOICE', '{"question": "I ___ two brothers and one sister.", "options": ["has", "have", "having", "had"]}', '{"answer": 1}', 1, 9),
  ('d4444444-4444-4444-4444-444444444444', 'Grammar', 'MULTIPLE_CHOICE', '{"question": "The cat ___ on the table.", "options": ["sit", "sits", "sitting", "sat"]}', '{"answer": 1}', 1, 10),
  ('d4444444-4444-4444-4444-444444444444', 'Mixed', 'MULTIPLE_CHOICE', '{"question": "Chọn từ phiên âm sai:", "options": ["cat /kæt/", "dog /dɒg/", "fish /fɪʃ/", "bird /bɪrd/"]}', '{"answer": 3}', 1, 11),
  ('d4444444-4444-4444-4444-444444444444', 'Mixed', 'MULTIPLE_CHOICE', '{"question": "\"Milk\" thuộc nhóm từ vựng nào?", "options": ["Gia đình", "Thức ăn & Đồ uống", "Trường học", "Thể thao"]}', '{"answer": 1}', 1, 12),
  ('d4444444-4444-4444-4444-444444444444', 'Mixed', 'MULTIPLE_CHOICE', '{"question": "\"always\" là dấu hiệu của thì nào?", "options": ["Present Simple", "Past Simple", "Future Simple", "Present Continuous"]}', '{"answer": 0}', 1, 13),
  ('d4444444-4444-4444-4444-444444444444', 'Mixed', 'MULTIPLE_CHOICE', '{"question": "Âm schwa /ə/ là:", "options": ["Nguyên âm mạnh", "Nguyên âm không nhấn", "Phụ âm", "Bán nguyên âm"]}', '{"answer": 1}', 1, 14),
  ('d4444444-4444-4444-4444-444444444444', 'Mixed', 'MULTIPLE_CHOICE', '{"question": "How many vowels are there in the English alphabet?", "options": ["3", "5", "7", "10"]}', '{"answer": 1}', 1, 15);

-- ============================================
-- 13. SEED ENROLLMENTS
-- ============================================
INSERT INTO core_ielts_lms_user_course_enrollments (user_id, course_id, status, progress_percentage) VALUES
  ('44444444-4444-4444-4444-444444444444', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'active', 35.00),
  ('55555555-5555-5555-5555-555555555555', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'active', 10.00);
