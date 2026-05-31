const supabase = require('../config/supabase');

const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    const [
      { count: pendingCount },
      { count: inReviewCount },
      { count: gradedCount },
      { count: gradedTodayCount },
      { data: recentSubmissions },
      { data: myClasses },
    ] = await Promise.all([
      supabase.from('core_ielts_lms_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('core_ielts_lms_submissions').select('*', { count: 'exact', head: true }).eq('status', 'in_review'),
      supabase.from('core_ielts_lms_submission_feedbacks').select('*', { count: 'exact', head: true }).eq('teacher_id', teacherId),
      supabase.from('core_ielts_lms_submission_feedbacks').select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId).gte('created_at', todayStart.toISOString()),
      supabase
        .from('core_ielts_lms_submissions')
        .select(`
          id, submission_type, status, created_at,
          core_ielts_lms_users!user_id (full_name, email),
          core_ielts_lms_activities!activity_id (title, activity_type)
        `)
        .in('status', ['pending', 'in_review'])
        .order('created_at', { ascending: true })
        .limit(10),
      supabase.from('core_ielts_lms_classes')
        .select('id, name, course_id').eq('teacher_id', teacherId),
    ]);

    // Compute total students across teacher's classes
    let totalStudents = 0;
    const classIds = (myClasses || []).map(c => c.id);
    if (classIds.length) {
      const { count } = await supabase
        .from('core_ielts_lms_class_students')
        .select('*', { count: 'exact', head: true })
        .in('class_id', classIds);
      totalStudents = count || 0;
    }

    // Flatten recent submissions for FE
    const flat = (recentSubmissions || []).map(s => ({
      ...s,
      user_name: s.core_ielts_lms_users?.full_name,
      activity_title: s.core_ielts_lms_activities?.title,
      submitted_at: s.created_at,
    }));

    res.json({
      stats: {
        pending_submissions: pendingCount || 0,
        in_review_submissions: inReviewCount || 0,
        total_graded_by_me: gradedCount || 0,
        graded_today: gradedTodayCount || 0,
        total_students: totalStudents,
        total_classes: classIds.length,
      },
      recent_submissions: flat,
      classes: myClasses || [],
    });
  } catch (err) {
    console.error('Teacher dashboard error:', err);
    res.status(500).json({ error: 'Không thể tải bảng điều khiển giáo viên.' });
  }
};

module.exports = { getTeacherDashboard };
