const supabase = require('../config/supabase');
const { calculateBandScore, recommendCourse } = require('../utils/helpers');

const getMockTests = async (req, res) => {
  try {
    const { type, skill } = req.query;
    let query = supabase
      .from('core_ielts_lms_mock_tests')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('test_type', type);
    if (skill) query = query.eq('skill', skill);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ mock_tests: data });
  } catch (err) {
    console.error('Get mock tests error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách bài thi thử.' });
  }
};

const getMockTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: mockTest, error } = await supabase
      .from('core_ielts_lms_mock_tests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !mockTest) {
      return res.status(404).json({ error: 'Không tìm thấy bài thi thử.' });
    }

    const { data: questions } = await supabase
      .from('core_ielts_lms_mock_test_questions')
      .select('*')
      .eq('mock_test_id', id)
      .order('order_index', { ascending: true });

    // Remove correct answers for students (don't reveal during test)
    const safeQuestions = questions?.map(q => {
      if (req.user?.role === 'student') {
        const { correct_answer, ...rest } = q;
        return rest;
      }
      return q;
    });

    res.json({ mock_test: mockTest, questions: safeQuestions });
  } catch (err) {
    console.error('Get mock test error:', err);
    res.status(500).json({ error: 'Không thể tải thông tin bài thi thử.' });
  }
};

const createMockTest = async (req, res) => {
  try {
    const { title, description, test_type, course_id, skill, time_limit_minutes, total_questions, passing_score, questions, sections_config } = req.body;

    const { data: mockTest, error } = await supabase
      .from('core_ielts_lms_mock_tests')
      .insert({ title, description, test_type, course_id, skill, time_limit_minutes, total_questions: total_questions || questions?.length || 0, passing_score, sections_config: sections_config || null })
      .select()
      .single();

    if (error) throw error;

    if (questions?.length) {
      const questionsData = questions.map((q, i) => ({
        mock_test_id: mockTest.id,
        section_label: q.section_label,
        question_type: q.question_type,
        content: q.content,
        correct_answer: q.correct_answer,
        points: q.points || 1,
        order_index: i + 1
      }));

      await supabase.from('core_ielts_lms_mock_test_questions').insert(questionsData);
    }

    res.status(201).json({ mock_test: mockTest });
  } catch (err) {
    console.error('Create mock test error:', err);
    res.status(500).json({ error: 'Tạo bài thi thử thất bại. Vui lòng thử lại.' });
  }
};

const startMockTest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: mockTest } = await supabase
      .from('core_ielts_lms_mock_tests')
      .select('*')
      .eq('id', id)
      .single();

    if (!mockTest) {
      return res.status(404).json({ error: 'Không tìm thấy bài thi thử.' });
    }

    // Check for existing in-progress attempt
    const { data: existing } = await supabase
      .from('core_ielts_lms_user_mock_test_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('mock_test_id', id)
      .eq('status', 'in_progress')
      .single();

    if (existing) {
      return res.json({ attempt: existing, message: 'Tiếp tục bài thi đang thực hiện dở.' });
    }

    const { data: attempt, error } = await supabase
      .from('core_ielts_lms_user_mock_test_attempts')
      .insert({
        user_id: userId,
        mock_test_id: id,
        answers: {},
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ attempt });
  } catch (err) {
    console.error('Start mock test error:', err);
    res.status(500).json({ error: 'Không thể bắt đầu bài thi thử. Vui lòng thử lại.' });
  }
};

const saveMockTestProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const { data, error } = await supabase
      .from('core_ielts_lms_user_mock_test_attempts')
      .update({ answers })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .eq('status', 'in_progress')
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Không tìm thấy lượt thi hoặc bài thi đã được nộp rồi.' });

    res.json({ attempt: data });
  } catch (err) {
    console.error('Save progress error:', err);
    res.status(500).json({ error: 'Lưu tiến độ làm bài thất bại. Vui lòng thử lại.' });
  }
};

const submitMockTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, is_auto_submitted } = req.body;

    // Get attempt
    const { data: attempt } = await supabase
      .from('core_ielts_lms_user_mock_test_attempts')
      .select('*, mock_test_id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!attempt) {
      return res.status(404).json({ error: 'Không tìm thấy lượt thi này.' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ error: 'Bài thi này đã được nộp rồi.' });
    }

    // Get questions
    const { data: questions } = await supabase
      .from('core_ielts_lms_mock_test_questions')
      .select('*')
      .eq('mock_test_id', attempt.mock_test_id)
      .order('order_index', { ascending: true });

    const finalAnswers = answers || attempt.answers || {};

    // Get mock test info — must be fetched BEFORE skill-based branching
    const { data: mockTest } = await supabase
      .from('core_ielts_lms_mock_tests')
      .select('*')
      .eq('id', attempt.mock_test_id)
      .single();

    // Writing and Speaking: not auto-graded — teacher reviews submissions
    if (mockTest?.skill === 'WRITING' || mockTest?.skill === 'SPEAKING') {
      const { data: updated, error: wErr } = await supabase
        .from('core_ielts_lms_user_mock_test_attempts')
        .update({
          answers: finalAnswers,
          score: null,
          band_score: null,
          status: 'submitted',
          is_auto_submitted: is_auto_submitted || false,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (wErr) throw wErr;
      return res.json({ attempt: updated, result: { pending_review: true, message: 'Submitted for teacher review.' } });
    }

    // Grade — use question id as key (consistent with frontend submission format)
    let correct = 0;
    const totalQuestions = questions?.length || 0;

    const norm = (v) => String(v == null ? '' : v).trim().toLowerCase();

    questions?.forEach((q) => {
      const userAns = finalAnswers[q.id];
      if (userAns === undefined || userAns === null || userAns === '') return;
      const correctAnswer = q.correct_answer?.answer;
      const acceptable = q.correct_answer?.acceptable_answers; // optional array
      if (correctAnswer === undefined && !acceptable) return;
      const userN = norm(userAns);
      if (correctAnswer !== undefined && norm(correctAnswer) === userN) { correct++; return; }
      if (Array.isArray(acceptable) && acceptable.some(a => norm(a) === userN)) { correct++; }
    });

    const scorePercentage = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
    const bandScore = calculateBandScore(correct, totalQuestions);

    let recommended_course_id = null;

    // If placement test, recommend course
    if (mockTest?.test_type === 'PLACEMENT') {
      const courseOrder = recommendCourse(bandScore);
      const { data: course } = await supabase
        .from('core_ielts_lms_courses')
        .select('id')
        .eq('order_index', courseOrder)
        .single();
      recommended_course_id = course?.id;
    }

    // If checkpoint test, check passing
    if (mockTest?.test_type === 'CHECKPOINT' && scorePercentage >= mockTest.passing_score) {
      const { data: currentCourse } = await supabase
        .from('core_ielts_lms_courses')
        .select('*')
        .eq('id', mockTest.course_id)
        .single();

      if (currentCourse) {
        await supabase
          .from('core_ielts_lms_user_course_enrollments')
          .update({ status: 'completed', completed_at: new Date().toISOString(), progress_percentage: 100 })
          .eq('user_id', req.user.id)
          .eq('course_id', currentCourse.id);

        const { data: nextCourse } = await supabase
          .from('core_ielts_lms_courses')
          .select('id')
          .eq('order_index', currentCourse.order_index + 1)
          .single();

        if (nextCourse) {
          await supabase
            .from('core_ielts_lms_user_course_enrollments')
            .upsert(
              { user_id: req.user.id, course_id: nextCourse.id, status: 'active' },
              { onConflict: 'user_id,course_id' }
            );
        }
      }
    }

    // Update attempt
    const { data: updated, error } = await supabase
      .from('core_ielts_lms_user_mock_test_attempts')
      .update({
        answers: finalAnswers,
        score: scorePercentage,
        band_score: bandScore,
        recommended_course_id,
        status: 'submitted',
        is_auto_submitted: is_auto_submitted || false,
        submitted_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      attempt: updated,
      result: {
        correct,
        total: totalQuestions,
        score: scorePercentage,
        band_score: bandScore,
        passed: mockTest ? scorePercentage >= (mockTest.passing_score || 0) : true,
        recommended_course_id
      }
    });
  } catch (err) {
    console.error('Submit mock test error:', err);
    res.status(500).json({ error: 'Nộp bài thi thử thất bại. Vui lòng thử lại.' });
  }
};

const getMockTestResult = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: attempt, error } = await supabase
      .from('core_ielts_lms_user_mock_test_attempts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !attempt) {
      return res.status(404).json({ error: 'Không tìm thấy kết quả bài thi.' });
    }

    // Check access
    if (req.user.role === 'student' && attempt.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền xem kết quả bài thi này.' });
    }

    // Get mock test and questions with answers
    const { data: mockTest } = await supabase
      .from('core_ielts_lms_mock_tests')
      .select('*')
      .eq('id', attempt.mock_test_id)
      .single();

    const { data: questions } = await supabase
      .from('core_ielts_lms_mock_test_questions')
      .select('*')
      .eq('mock_test_id', attempt.mock_test_id)
      .order('order_index', { ascending: true });

    let recommended_course = null;
    if (attempt.recommended_course_id) {
      const { data: course } = await supabase
        .from('core_ielts_lms_courses')
        .select('id, title, level, band_range')
        .eq('id', attempt.recommended_course_id)
        .single();
      recommended_course = course;
    }

    res.json({ attempt, mock_test: mockTest, questions, recommended_course });
  } catch (err) {
    console.error('Get result error:', err);
    res.status(500).json({ error: 'Không thể tải kết quả bài thi.' });
  }
};

const updateMockTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, test_type, course_id, skill, time_limit_minutes, total_questions, passing_score, is_active, questions, sections_config } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (test_type !== undefined) updates.test_type = test_type;
    if (course_id !== undefined) updates.course_id = course_id || null;
    if (skill !== undefined) updates.skill = skill || null;
    if (time_limit_minutes !== undefined) updates.time_limit_minutes = time_limit_minutes;
    if (total_questions !== undefined) updates.total_questions = total_questions;
    if (passing_score !== undefined) updates.passing_score = passing_score;
    if (is_active !== undefined) updates.is_active = is_active;
    if (sections_config !== undefined) updates.sections_config = sections_config;
    updates.updated_at = new Date().toISOString();

    const { data: mockTest, error } = await supabase
      .from('core_ielts_lms_mock_tests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!mockTest) return res.status(404).json({ error: 'Không tìm thấy bài thi thử.' });

    // If questions provided, replace all questions
    if (questions !== undefined) {
      await supabase.from('core_ielts_lms_mock_test_questions').delete().eq('mock_test_id', id);

      if (questions.length) {
        const questionsData = questions.map((q, i) => ({
          mock_test_id: id,
          section_label: q.section_label,
          question_type: q.question_type,
          content: q.content,
          correct_answer: q.correct_answer,
          points: q.points || 1,
          order_index: i + 1,
        }));
        const { error: qError } = await supabase.from('core_ielts_lms_mock_test_questions').insert(questionsData);
        if (qError) throw qError;
      }

      // Update total_questions count
      await supabase
        .from('core_ielts_lms_mock_tests')
        .update({ total_questions: questions.length })
        .eq('id', id);
    }

    res.json({ mock_test: mockTest });
  } catch (err) {
    console.error('Update mock test error:', err);
    res.status(500).json({ error: 'Cập nhật bài thi thử thất bại. Vui lòng thử lại.' });
  }
};

const deleteMockTest = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if there are any attempts
    const { count } = await supabase
      .from('core_ielts_lms_user_mock_test_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('mock_test_id', id);

    if (count > 0) {
      // Soft delete: just deactivate
      await supabase.from('core_ielts_lms_mock_tests').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', id);
      return res.json({ message: 'Bài thi thử đã được ẩn (có lượt thi liên quan, không thể xóa hoàn toàn).' });
    }

    // Hard delete: no attempts exist
    await supabase.from('core_ielts_lms_mock_test_questions').delete().eq('mock_test_id', id);
    const { error } = await supabase.from('core_ielts_lms_mock_tests').delete().eq('id', id);
    if (error) throw error;

    res.json({ message: 'Đã xóa bài thi thử thành công.' });
  } catch (err) {
    console.error('Delete mock test error:', err);
    res.status(500).json({ error: 'Xóa bài thi thử thất bại. Vui lòng thử lại.' });
  }
};

const getAllMockTests = async (req, res) => {
  try {
    const { type, skill, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('core_ielts_lms_mock_tests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (type) query = query.eq('test_type', type);
    if (skill) query = query.eq('skill', skill);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, count, error } = await query;
    if (error) throw error;

    // Get attempt counts for each mock test
    const mockTestIds = data?.map(mt => mt.id) || [];
    let attemptCounts = {};
    if (mockTestIds.length) {
      const { data: attempts } = await supabase
        .from('core_ielts_lms_user_mock_test_attempts')
        .select('mock_test_id')
        .in('mock_test_id', mockTestIds);

      (attempts || []).forEach(a => {
        attemptCounts[a.mock_test_id] = (attemptCounts[a.mock_test_id] || 0) + 1;
      });
    }

    const mockTests = data?.map(mt => ({
      ...mt,
      attempts_count: attemptCounts[mt.id] || 0,
    }));

    res.json({
      mock_tests: mockTests,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error('Get all mock tests error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách bài thi thử.' });
  }
};

module.exports = { getMockTests, getMockTestById, createMockTest, updateMockTest, deleteMockTest, getAllMockTests, startMockTest, saveMockTestProgress, submitMockTest, getMockTestResult };
