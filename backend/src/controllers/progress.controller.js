const supabase = require('../config/supabase');

const getRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: courses } = await supabase
      .from('core_ielts_lms_courses')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    const { data: enrollments } = await supabase
      .from('core_ielts_lms_user_course_enrollments')
      .select('*')
      .eq('user_id', userId);

    const roadmap = courses?.map(course => {
      const enrollment = enrollments?.find(e => e.course_id === course.id);
      return {
        ...course,
        enrollment: enrollment || null,
        is_enrolled: !!enrollment,
        status: enrollment?.status || (course.order_index === 1 ? 'available' : 'locked'),
        progress_percentage: enrollment?.progress_percentage || 0
      };
    });

    // Get latest placement test result
    const { data: placementAttempt } = await supabase
      .from('core_ielts_lms_user_mock_test_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'submitted')
      .order('created_at', { ascending: false })
      .limit(10);

    // Filter for placement tests in JS to avoid complex join issues
    let placementResult = null;
    if (placementAttempt?.length) {
      const mockTestIds = placementAttempt.map(a => a.mock_test_id);
      const { data: placementTests } = await supabase
        .from('core_ielts_lms_mock_tests')
        .select('id')
        .in('id', mockTestIds)
        .eq('test_type', 'PLACEMENT');

      const placementTestIds = new Set(placementTests?.map(t => t.id) || []);
      placementResult = placementAttempt.find(a => placementTestIds.has(a.mock_test_id)) || null;
    }

    res.json({ roadmap, placement_result: placementResult });
  } catch (err) {
    console.error('Get roadmap error:', err);
    res.status(500).json({ error: 'Không thể tải lộ trình học tập.' });
  }
};

const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Get all units, sections, lessons, activities for this course
    const { data: units } = await supabase
      .from('core_ielts_lms_units')
      .select(`
        id, title, order_index,
        core_ielts_lms_sections (
          id, title, section_type, order_index,
          core_ielts_lms_lessons (id, title, order_index),
          core_ielts_lms_activities (id, title, activity_type, order_index, passing_score)
        )
      `)
      .eq('course_id', courseId)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    // Normalize key names
    units?.forEach(u => {
      u.sections = (u.core_ielts_lms_sections || []).sort((a, b) => a.order_index - b.order_index);
      u.sections.forEach(s => {
        s.lessons = (s.core_ielts_lms_lessons || []).sort((a, b) => a.order_index - b.order_index);
        s.activities = (s.core_ielts_lms_activities || []).sort((a, b) => a.order_index - b.order_index);
        delete s.core_ielts_lms_lessons;
        delete s.core_ielts_lms_activities;
      });
      delete u.core_ielts_lms_sections;
    });

    // Get all lesson progress
    const lessonIds = [];
    const activityIds = [];
    units?.forEach(u => {
      u.sections?.forEach(s => {
        s.lessons?.forEach(l => lessonIds.push(l.id));
        s.activities?.forEach(a => activityIds.push(a.id));
      });
    });

    const { data: lessonProgress } = lessonIds.length ? await supabase
      .from('core_ielts_lms_user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .in('lesson_id', lessonIds) : { data: [] };

    const { data: activityAttempts } = activityIds.length ? await supabase
      .from('core_ielts_lms_user_activity_attempts')
      .select('*')
      .eq('user_id', userId)
      .in('activity_id', activityIds) : { data: [] };

    // Calculate progress
    let totalItems = 0;
    let completedItems = 0;

    units?.forEach(u => {
      u.sections?.sort((a, b) => a.order_index - b.order_index);
      u.sections?.forEach(s => {
        s.lessons?.sort((a, b) => a.order_index - b.order_index);
        s.activities?.sort((a, b) => a.order_index - b.order_index);

        s.lessons?.forEach(l => {
          totalItems++;
          const progress = lessonProgress?.find(p => p.lesson_id === l.id);
          l.status = progress?.status || 'not_started';
          if (l.status === 'completed') completedItems++;
        });

        s.activities?.forEach(a => {
          totalItems++;
          const attempts = activityAttempts?.filter(at => at.activity_id === a.id);
          a.attempts_count = attempts?.length || 0;
          a.best_score = attempts?.reduce((max, at) => Math.max(max, at.score || 0), 0) || 0;
          a.is_passed = attempts?.some(at => at.is_passed) || false;
          if (a.is_passed) completedItems++;
        });
      });
    });

    const overallProgress = totalItems > 0 ? (completedItems / totalItems * 100).toFixed(1) : 0;

    // Update enrollment progress
    await supabase
      .from('core_ielts_lms_user_course_enrollments')
      .update({ progress_percentage: overallProgress })
      .eq('user_id', userId)
      .eq('course_id', courseId);

    res.json({
      units,
      progress: {
        total: totalItems,
        completed: completedItems,
        percentage: parseFloat(overallProgress)
      }
    });
  } catch (err) {
    console.error('Get course progress error:', err);
    res.status(500).json({ error: 'Không thể tải tiến độ học tập.' });
  }
};

module.exports = { getRoadmap, getCourseProgress };
