const supabase = require('../config/supabase');

// Drip-content gate: a student may only access an activity if the previous
// activity in the same section has at least one passed attempt.
async function checkPrevActivityPassed(userId, activity) {
  if (!activity?.section_id) return { ok: true };
  const { data: siblings } = await supabase
    .from('core_ielts_lms_activities')
    .select('id, order_index')
    .eq('section_id', activity.section_id)
    .eq('is_active', true)
    .order('order_index', { ascending: true });
  if (!siblings || siblings.length === 0) return { ok: true };
  const idx = siblings.findIndex(s => s.id === activity.id);
  if (idx <= 0) return { ok: true };
  const prev = siblings[idx - 1];
  const { data: passed } = await supabase
    .from('core_ielts_lms_user_activity_attempts')
    .select('id').eq('user_id', userId).eq('activity_id', prev.id).eq('is_passed', true).limit(1);
  return { ok: Array.isArray(passed) && passed.length > 0, prev_id: prev.id };
}

const getActivities = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { data, error } = await supabase
      .from('core_ielts_lms_activities')
      .select('id, title, activity_type, instructions, order_index, passing_score, time_limit_minutes, max_attempts')
      .eq('section_id', sectionId)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    res.json({ activities: data });
  } catch (err) {
    console.error('Get activities error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách hoạt động.' });
  }
};

const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: activity, error } = await supabase
      .from('core_ielts_lms_activities')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !activity) {
      return res.status(404).json({ error: 'Không tìm thấy hoạt động.' });
    }

    // Get attempts if student
    if (req.user?.role === 'student') {
      const { data: attempts } = await supabase
        .from('core_ielts_lms_user_activity_attempts')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('activity_id', id)
        .order('attempt_number', { ascending: false });

      activity.attempts = attempts || [];
      activity.attempts_used = attempts?.length || 0;

      const drip = await checkPrevActivityPassed(req.user.id, activity);
      activity.is_locked = !drip.ok;
      activity.locked_by_activity_id = drip.ok ? null : drip.prev_id;
    }

    res.json({ activity });
  } catch (err) {
    console.error('Get activity error:', err);
    res.status(500).json({ error: 'Không thể tải thông tin hoạt động.' });
  }
};

const createActivity = async (req, res) => {
  try {
    const { section_id, title, activity_type, instructions, content, time_limit_minutes, passing_score, max_attempts, order_index } = req.body;

    if (!section_id || !title || !activity_type || order_index === undefined) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ section_id, tiêu đề, loại hoạt động và thứ tự.' });
    }

    const { data, error } = await supabase
      .from('core_ielts_lms_activities')
      .insert({ section_id, title, activity_type, instructions, content, time_limit_minutes, passing_score, max_attempts, order_index })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ activity: data });
  } catch (err) {
    console.error('Create activity error:', err);
    res.status(500).json({ error: 'Tạo hoạt động thất bại. Vui lòng thử lại.' });
  }
};

const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('core_ielts_lms_activities')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ activity: data });
  } catch (err) {
    console.error('Update activity error:', err);
    res.status(500).json({ error: 'Cập nhật hoạt động thất bại. Vui lòng thử lại.' });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('core_ielts_lms_activities').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Đã xóa hoạt động thành công.' });
  } catch (err) {
    console.error('Delete activity error:', err);
    res.status(500).json({ error: 'Xóa hoạt động thất bại. Vui lòng thử lại.' });
  }
};

const submitActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    // Get activity
    const { data: activity } = await supabase
      .from('core_ielts_lms_activities')
      .select('*')
      .eq('id', id)
      .single();

    if (!activity) {
      return res.status(404).json({ error: 'Không tìm thấy hoạt động.' });
    }

    // Drip content gate
    const drip = await checkPrevActivityPassed(userId, activity);
    if (!drip.ok) {
      return res.status(403).json({ error: 'Bạn cần hoàn thành bài tập trước đó để mở khóa bài này.' });
    }

    // Check max attempts
    const { data: prevAttempts } = await supabase
      .from('core_ielts_lms_user_activity_attempts')
      .select('id')
      .eq('user_id', userId)
      .eq('activity_id', id);

    const attemptNumber = (prevAttempts?.length || 0) + 1;

    if (activity.max_attempts && attemptNumber > activity.max_attempts) {
      return res.status(400).json({ error: 'Bạn đã hết số lần thực hiện hoạt động này.' });
    }

    // Auto-grade for objective types
    let score = 0;
    let totalPoints = 0;
    const content = activity.content;

    if (['QUIZ', 'MINI_TEST', 'TIMED_PRACTICE'].includes(activity.activity_type) && content?.questions) {
      totalPoints = content.questions.length;
      content.questions.forEach((q, i) => {
        if (answers[i] === q.correct) score++;
      });
    } else if (activity.activity_type === 'FILL_IN_BLANK' && content?.questions) {
      totalPoints = content.questions.length;
      content.questions.forEach((q, i) => {
        if (answers[i]?.toLowerCase().trim() === q.answer.toLowerCase().trim()) score++;
      });
    } else if (activity.activity_type === 'MATCHING' && content?.pairs) {
      if (!answers) {
        return res.status(400).json({ error: 'Vui lòng cung cấp đáp án cho bài matching.' });
      }
      totalPoints = content.pairs.length;
      content.pairs.forEach((pair, i) => {
        if (answers[i] === i || answers[String(i)] === i) score++;
      });
    } else if (activity.activity_type === 'LISTENING_DICTATION' && content?.transcript) {
      // Compare normalized text vs transcript word-by-word
      const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim();
      const target = norm(content.transcript).split(' ').filter(Boolean);
      const got = norm(answers?.text).split(' ').filter(Boolean);
      const map = new Map();
      target.forEach(w => map.set(w, (map.get(w) || 0) + 1));
      let matched = 0;
      got.forEach(w => { if (map.get(w)) { matched++; map.set(w, map.get(w) - 1); } });
      totalPoints = target.length || 1;
      score = matched;
    } else if (['FLASHCARD', 'SPEAKING_RECORD_SHORT'].includes(activity.activity_type)) {
      // Completion-based — graded on completion, not correctness
      score = 100;
      totalPoints = 100;
    } else if (['WRITING_SUBMISSION', 'SPEAKING_SUBMISSION'].includes(activity.activity_type)) {
      // Manual grading - create submission
      const { data: submission, error: subError } = await supabase
        .from('core_ielts_lms_submissions')
        .insert({
          user_id: userId,
          activity_id: id,
          submission_type: activity.activity_type === 'WRITING_SUBMISSION' ? 'WRITING' : 'SPEAKING',
          content_text: answers.text || null,
          content_url: answers.url || null,
          status: 'pending'
        })
        .select()
        .single();

      if (subError) throw subError;

      const { data: attempt, error: attError } = await supabase
        .from('core_ielts_lms_user_activity_attempts')
        .insert({
          user_id: userId,
          activity_id: id,
          attempt_number: attemptNumber,
          answers,
          score: null,
          is_passed: false,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (attError) throw attError;

      return res.json({ attempt, submission, message: 'Bài nộp đã được gửi đến giáo viên để chấm điểm.' });
    }

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const isPassed = percentage >= (activity.passing_score || 0);

    const { data: attempt, error: attError } = await supabase
      .from('core_ielts_lms_user_activity_attempts')
      .insert({
        user_id: userId,
        activity_id: id,
        attempt_number: attemptNumber,
        answers,
        score: percentage,
        is_passed: isPassed,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (attError) throw attError;

    res.json({
      attempt,
      score: percentage,
      is_passed: isPassed,
      correct: score,
      total: totalPoints
    });
  } catch (err) {
    console.error('Submit activity error:', err);
    res.status(500).json({ error: 'Nộp bài thất bại. Vui lòng thử lại.' });
  }
};

module.exports = { getActivities, getActivityById, createActivity, updateActivity, deleteActivity, submitActivity };
