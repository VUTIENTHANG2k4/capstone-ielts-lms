const supabase = require('../config/supabase');
const { createNotification } = require('../services/notification.service');

// Normalize Supabase nested-relation shape -> flat fields the FE expects.
function flatten(sub) {
  if (!sub) return sub;
  const u = sub.core_ielts_lms_users || sub.user || null;
  const a = sub.core_ielts_lms_activities || sub.activity || null;
  const fb = Array.isArray(sub.core_ielts_lms_submission_feedbacks)
    ? sub.core_ielts_lms_submission_feedbacks[0]
    : (sub.feedback || null);
  return {
    ...sub,
    user_name: u?.full_name || null,
    user_email: u?.email || null,
    user_avatar: u?.avatar_url || null,
    activity_title: a?.title || null,
    activity_type: a?.activity_type || null,
    instructions: a?.instructions || null,
    submitted_at: sub.submitted_at || sub.created_at,
    content: { text: sub.content_text, url: sub.content_url },
    feedback: fb || null,
  };
}

const getSubmissions = async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = supabase
      .from('core_ielts_lms_submissions')
      .select(`
        *,
        core_ielts_lms_users!user_id (id, full_name, email, avatar_url),
        core_ielts_lms_activities!activity_id (id, title, activity_type),
        core_ielts_lms_submission_feedbacks (*)
      `)
      .order('created_at', { ascending: false });

    if (req.user.role === 'student') query = query.eq('user_id', req.user.id);
    if (status) {
      const s = String(status).toLowerCase().replace('submitted', 'pending');
      query = query.eq('status', s);
    }
    if (type) query = query.eq('submission_type', String(type).toUpperCase());

    const { data, error } = await query;
    if (error) throw error;
    res.json({ submissions: (data || []).map(flatten) });
  } catch (err) {
    console.error('Get submissions error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách bài nộp.' });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: submission, error } = await supabase
      .from('core_ielts_lms_submissions')
      .select(`
        *,
        core_ielts_lms_users!user_id (id, full_name, email, avatar_url),
        core_ielts_lms_activities!activity_id (id, title, activity_type, instructions),
        core_ielts_lms_submission_feedbacks (
          *,
          core_ielts_lms_users!teacher_id (id, full_name)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !submission) return res.status(404).json({ error: 'Không tìm thấy bài nộp.' });
    if (req.user.role === 'student' && submission.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không có quyền xem bài nộp này.' });
    }

    const flat = flatten(submission);
    res.json({ submission: flat, feedback: flat.feedback });
  } catch (err) {
    console.error('Get submission error:', err);
    res.status(500).json({ error: 'Không thể tải thông tin bài nộp.' });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      band_score, feedback_text, criteria_scores,
      task_achievement, coherence_cohesion, lexical_resource, grammar_accuracy,
      pronunciation, fluency_coherence,
    } = req.body;

    if (band_score === undefined || !feedback_text) {
      return res.status(400).json({ error: 'Vui lòng nhập điểm band score và nội dung nhận xét.' });
    }

    const criteria = criteria_scores && typeof criteria_scores === 'object'
      ? criteria_scores
      : {
          ...(task_achievement !== undefined && task_achievement !== '' && { task_achievement: Number(task_achievement) }),
          ...(coherence_cohesion !== undefined && coherence_cohesion !== '' && { coherence_cohesion: Number(coherence_cohesion) }),
          ...(lexical_resource !== undefined && lexical_resource !== '' && { lexical_resource: Number(lexical_resource) }),
          ...(grammar_accuracy !== undefined && grammar_accuracy !== '' && { grammar_accuracy: Number(grammar_accuracy) }),
          ...(pronunciation !== undefined && pronunciation !== '' && { pronunciation: Number(pronunciation) }),
          ...(fluency_coherence !== undefined && fluency_coherence !== '' && { fluency_coherence: Number(fluency_coherence) }),
        };

    const { data: feedback, error: fbError } = await supabase
      .from('core_ielts_lms_submission_feedbacks')
      .insert({
        submission_id: id, teacher_id: req.user.id,
        band_score: Number(band_score), feedback_text,
        criteria_scores: Object.keys(criteria).length ? criteria : null,
      })
      .select().single();
    if (fbError) throw fbError;

    await supabase.from('core_ielts_lms_submissions').update({ status: 'graded' }).eq('id', id);

    const { data: submission } = await supabase.from('core_ielts_lms_submissions')
      .select('user_id').eq('id', id).single();
    if (submission) {
      await createNotification({
        user_id: submission.user_id,
        title: 'Bài nộp đã được chấm điểm',
        message: `Giáo viên đã chấm bài của bạn với band score ${band_score}.`,
        type: 'grading',
        link: `/submissions/${id}`,
      });
    }

    res.json({ feedback, message: 'Đã chấm điểm bài nộp thành công.' });
  } catch (err) {
    console.error('Grade submission error:', err);
    res.status(500).json({ error: 'Chấm điểm bài nộp thất bại. Vui lòng thử lại.' });
  }
};

module.exports = { getSubmissions, getSubmissionById, gradeSubmission };
