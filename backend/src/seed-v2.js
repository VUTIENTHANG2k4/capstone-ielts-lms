require('dotenv').config();
const supabase = require('./config/supabase');

const STUDENT_ID = '44444444-4444-4444-4444-444444444444';
const TEACHER_ID = '33333333-3333-3333-3333-333333333333';
const COURSE_ID = 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1';
const LISTENING_MOCK_ID = 'd2222222-2222-2222-2222-222222222222';

async function ensurePackage(pkg) {
  async function updatePackage(id, payload) {
    const { error } = await supabase.from('core_ielts_lms_packages').update(payload).eq('id', id);
    if (error?.message?.includes('original_price')) {
      const { original_price, ...fallback } = payload;
      return supabase.from('core_ielts_lms_packages').update(fallback).eq('id', id);
    }
    return { error };
  }

  async function insertPackage(payload) {
    const { data, error } = await supabase.from('core_ielts_lms_packages').insert(payload).select('id').single();
    if (error?.message?.includes('original_price')) {
      const { original_price, ...fallback } = payload;
      return supabase.from('core_ielts_lms_packages').insert(fallback).select('id').single();
    }
    return { data, error };
  }

  const { data: existing } = await supabase
    .from('core_ielts_lms_packages')
    .select('id')
    .eq('name', pkg.name)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await updatePackage(existing.id, pkg);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await insertPackage(pkg);
  if (error) throw error;
  return data.id;
}

async function seedPackages() {
  const packages = [
    {
      name: 'Gói Cơ bản 1 tháng',
      description: 'Truy cập toàn bộ Course PRE-FOUNDATION & FOUNDATION trong 30 ngày.',
      duration_days: 30,
      price: 499000,
      original_price: 699000,
      features: ['Học toàn bộ 2 khóa đầu', 'Mock Test không giới hạn', 'Hỗ trợ qua chat'],
      is_active: true,
    },
    {
      name: 'Gói Tiêu chuẩn 3 tháng',
      description: 'Truy cập toàn bộ 5 khóa, có chấm Writing/Speaking trong 90 ngày.',
      duration_days: 90,
      price: 1290000,
      original_price: 1590000,
      features: ['Toàn bộ 5 khóa học', 'Chấm Writing & Speaking', 'Mock Test không giới hạn', 'Tham gia lớp học live'],
      is_active: true,
    },
    {
      name: 'Gói Premium 6 tháng',
      description: 'Trọn bộ tính năng + chứng chỉ hoàn thành.',
      duration_days: 180,
      price: 2390000,
      original_price: 2990000,
      features: ['Tất cả tính năng Tiêu chuẩn', 'Chứng chỉ hoàn thành', '1-1 với giáo viên 4 buổi', 'Ưu tiên hỗ trợ 24/7'],
      is_active: true,
    },
  ];

  for (const pkg of packages) await ensurePackage(pkg);
  console.log('Seeded packages');
}

async function seedClass() {
  const payload = {
    id: 'f1111111-1111-1111-1111-111111111111',
    name: 'IELTS Foundation A1',
    description: 'Lớp demo cho học viên Foundation.',
    teacher_id: TEACHER_ID,
    course_id: COURSE_ID,
    schedule_text: 'T2 - T4 - T6, 19:00 - 20:30',
    start_date: '2026-05-15',
    end_date: '2026-08-15',
    max_students: 25,
    is_active: true,
  };

  let { error } = await supabase.from('core_ielts_lms_classes').upsert(payload, { onConflict: 'id' });
  if (error?.message?.includes('max_students')) {
    const { max_students, ...fallback } = payload;
    ({ error } = await supabase.from('core_ielts_lms_classes').upsert(fallback, { onConflict: 'id' }));
  }
  if (error) throw error;

  const { error: linkErr } = await supabase
    .from('core_ielts_lms_class_students')
    .upsert({ class_id: payload.id, student_id: STUDENT_ID }, { onConflict: 'class_id,student_id' });
  if (linkErr) throw linkErr;
  console.log('Seeded class + student membership');
}

async function seedListeningMockQuestions() {
  const { error: delErr } = await supabase
    .from('core_ielts_lms_mock_test_questions')
    .delete()
    .eq('mock_test_id', LISTENING_MOCK_ID);
  if (delErr) throw delErr;

  const audio = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  const rows = [
    ['Part 1', 'MULTIPLE_CHOICE', { audio_url: audio, question: 'What time does the library close on Friday?', options: ['5:00 pm', '6:00 pm', '7:00 pm', '8:00 pm'] }, { answer: 2 }],
    ['Part 1', 'FILL_IN_BLANK', { audio_url: audio, question: 'Complete the note: Membership fee is ____ dollars.', placeholder: 'number' }, { answer: '25', acceptable_answers: ['25', 'twenty five', 'twenty-five'] }],
    ['Part 1', 'MULTIPLE_CHOICE', { audio_url: audio, question: 'Which document is required?', options: ['Passport', 'Student card', 'Driving licence', 'Bank statement'] }, { answer: 1 }],
    ['Part 2', 'TRUE_FALSE_NG', { audio_url: audio, passage: 'The speaker describes a new city tour for international students.', question: 'The tour is free for all first-year students.' }, { answer: 0 }],
    ['Part 2', 'TRUE_FALSE_NG', { audio_url: audio, passage: 'Participants must register before Thursday afternoon.', question: 'Students can register on the day of the tour.' }, { answer: 1 }],
    ['Part 2', 'FILL_IN_BLANK', { audio_url: audio, question: 'The meeting point is outside the ____ building.' }, { answer: 'science', acceptable_answers: ['science', 'Science'] }],
    ['Part 3', 'MULTIPLE_CHOICE', { audio_url: audio, question: 'Why did the students choose the topic?', options: ['It was easy to research', 'Their tutor suggested it', 'It connects with local issues', 'They had used it before'] }, { answer: 2 }],
    ['Part 3', 'FILL_IN_BLANK', { audio_url: audio, question: 'They will submit their draft on ____.' }, { answer: 'Monday', acceptable_answers: ['monday', 'Mon'] }],
    ['Part 4', 'MULTIPLE_CHOICE', { audio_url: audio, question: 'The lecture mainly discusses:', options: ['Urban transport', 'Climate policy', 'Language learning', 'Food production'] }, { answer: 0 }],
    ['Part 4', 'FILL_IN_BLANK', { audio_url: audio, question: 'One suggested solution is better bicycle ____.' }, { answer: 'lanes', acceptable_answers: ['lanes', 'lane'] }],
  ].map(([section_label, question_type, content, correct_answer], index) => ({
    mock_test_id: LISTENING_MOCK_ID,
    section_label,
    question_type,
    content,
    correct_answer,
    points: 1,
    order_index: index + 1,
  }));

  const { error } = await supabase.from('core_ielts_lms_mock_test_questions').insert(rows);
  if (error) throw error;

  await supabase.from('core_ielts_lms_mock_tests')
    .update({ total_questions: rows.length, time_limit_minutes: 30, is_active: true })
    .eq('id', LISTENING_MOCK_ID);
  console.log('Seeded listening mock questions');
}

async function seedNotifications() {
  const { error } = await supabase.from('core_ielts_lms_notifications').insert({
    user_id: STUDENT_ID,
    title: 'Chào mừng bạn quay lại IELTS Academy',
    message: 'Dữ liệu demo đã được bổ sung: gói học, lớp học và bài Listening Mock Test.',
    type: 'system',
    link: '/student',
  });
  if (error) throw error;
  console.log('Seeded demo notification');
}

async function main() {
  console.log('Seed v2 started');
  await seedPackages();
  await seedClass();
  await seedListeningMockQuestions();
  await seedNotifications();
  console.log('Seed v2 completed');
}

main().catch((err) => {
  console.error('Seed v2 failed:', err.message || err);
  process.exit(1);
});
