const supabase = require('../config/supabase');

const getUnits = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { data, error } = await supabase
      .from('core_ielts_lms_units')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    res.json({ units: data });
  } catch (err) {
    console.error('Get units error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách chương học.' });
  }
};

const getUnitById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: unit, error } = await supabase
      .from('core_ielts_lms_units')
      .select(`
        *,
        core_ielts_lms_sections (
          *,
          core_ielts_lms_lessons (id, title, content_type, order_index, duration_minutes, is_active),
          core_ielts_lms_activities (id, title, activity_type, order_index, passing_score, time_limit_minutes, is_active)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !unit) {
      return res.status(404).json({ error: 'Không tìm thấy chương học.' });
    }

    // Normalize nested key names and sort
    const sections = unit.core_ielts_lms_sections || [];
    sections.sort((a, b) => a.order_index - b.order_index);
    sections.forEach(section => {
          section.lessons = (section.core_ielts_lms_lessons || [])
            .filter(l => l.is_active !== false)
            .sort((a, b) => a.order_index - b.order_index);
          section.activities = (section.core_ielts_lms_activities || [])
            .filter(a => a.is_active !== false)
            .sort((a, b) => a.order_index - b.order_index);          delete section.core_ielts_lms_lessons;      delete section.core_ielts_lms_activities;
    });
    unit.sections = sections;
    delete unit.core_ielts_lms_sections;

    // Get progress if student
    if (req.user?.role === 'student') {
      const lessonIds = [];
      const activityIds = [];
      unit.sections?.forEach(s => {
        s.lessons?.forEach(l => lessonIds.push(l.id));
        s.activities?.forEach(a => activityIds.push(a.id));
      });

      if (lessonIds.length) {
        const { data: lessonProgress } = await supabase
          .from('core_ielts_lms_user_lesson_progress')
          .select('*')
          .eq('user_id', req.user.id)
          .in('lesson_id', lessonIds);

        unit.sections?.forEach(s => {
          s.lessons?.forEach(l => {
            l.progress = lessonProgress?.find(p => p.lesson_id === l.id) || null;
          });
        });
      }

      if (activityIds.length) {
        const { data: activityAttempts } = await supabase
          .from('core_ielts_lms_user_activity_attempts')
          .select('*')
          .eq('user_id', req.user.id)
          .in('activity_id', activityIds)
          .order('attempt_number', { ascending: false });

        unit.sections?.forEach(s => {
          s.activities?.forEach(a => {
            a.attempts = activityAttempts?.filter(at => at.activity_id === a.id) || [];
            a.best_attempt = a.attempts.find(at => at.is_passed) || a.attempts[0] || null;
          });
        });
      }
    }

    res.json({ unit });
  } catch (err) {
    console.error('Get unit error:', err);
    res.status(500).json({ error: 'Không thể tải thông tin chương học.' });
  }
};

const createUnit = async (req, res) => {
  try {
    const { course_id, title, description, skill_type, order_index } = req.body;
    if (!course_id || !title || order_index === undefined) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ course_id, tiêu đề và thứ tự.' });
    }

    const { data, error } = await supabase
      .from('core_ielts_lms_units')
      .insert({ course_id, title, description, skill_type, order_index })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ unit: data });
  } catch (err) {
    console.error('Create unit error:', err);
    res.status(500).json({ error: 'Tạo chương học thất bại. Vui lòng thử lại.' });
  }
};

const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('core_ielts_lms_units')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ unit: data });
  } catch (err) {
    console.error('Update unit error:', err);
    res.status(500).json({ error: 'Cập nhật chương học thất bại. Vui lòng thử lại.' });
  }
};

const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('core_ielts_lms_units').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Đã xóa chương học thành công.' });
  } catch (err) {
    console.error('Delete unit error:', err);
    res.status(500).json({ error: 'Xóa chương học thất bại. Vui lòng thử lại.' });
  }
};

module.exports = { getUnits, getUnitById, createUnit, updateUnit, deleteUnit };
