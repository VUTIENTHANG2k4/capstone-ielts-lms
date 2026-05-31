const supabase = require('../config/supabase');

const getLessons = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { data, error } = await supabase
      .from('core_ielts_lms_lessons')
      .select('*')
      .eq('section_id', sectionId)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    res.json({ lessons: data });
  } catch (err) {
    console.error('Get lessons error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách bài học.' });
  }
};

const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: lesson, error } = await supabase
      .from('core_ielts_lms_lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !lesson) {
      return res.status(404).json({ error: 'Không tìm thấy bài học.' });
    }

    // Get progress if student
    if (req.user?.role === 'student') {
      const { data: progress } = await supabase
        .from('core_ielts_lms_user_lesson_progress')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('lesson_id', id)
        .single();

      lesson.progress = progress || null;

      // Upsert as in_progress if not started
      if (!progress) {
        const { data: newProgress } = await supabase
          .from('core_ielts_lms_user_lesson_progress')
          .upsert(
            { user_id: req.user.id, lesson_id: id, status: 'in_progress', started_at: new Date().toISOString() },
            { onConflict: 'user_id,lesson_id', ignoreDuplicates: false }
          )
          .select()
          .single();
        lesson.progress = newProgress || { status: 'in_progress' };
      }
    }

    res.json({ lesson });
  } catch (err) {
    console.error('Get lesson error:', err);
    res.status(500).json({ error: 'Không thể tải thông tin bài học.' });
  }
};

const createLesson = async (req, res) => {
  try {
    const { section_id, title, content_type, content_url, content_text, order_index, duration_minutes } = req.body;
    if (!section_id || !title || !content_type || order_index === undefined) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ section_id, tiêu đề, loại nội dung và thứ tự.' });
    }

    const { data, error } = await supabase
      .from('core_ielts_lms_lessons')
      .insert({ section_id, title, content_type, content_url, content_text, order_index, duration_minutes })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ lesson: data });
  } catch (err) {
    console.error('Create lesson error:', err);
    res.status(500).json({ error: 'Tạo bài học thất bại. Vui lòng thử lại.' });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('core_ielts_lms_lessons')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ lesson: data });
  } catch (err) {
    console.error('Update lesson error:', err);
    res.status(500).json({ error: 'Cập nhật bài học thất bại. Vui lòng thử lại.' });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('core_ielts_lms_lessons').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Đã xóa bài học thành công.' });
  } catch (err) {
    console.error('Delete lesson error:', err);
    res.status(500).json({ error: 'Xóa bài học thất bại. Vui lòng thử lại.' });
  }
};

const completeLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: existing } = await supabase
      .from('core_ielts_lms_user_lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', id)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('core_ielts_lms_user_lesson_progress')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ progress: data });
    }

    const { data, error } = await supabase
      .from('core_ielts_lms_user_lesson_progress')
      .insert({
        user_id: userId,
        lesson_id: id,
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ progress: data });
  } catch (err) {
    console.error('Complete lesson error:', err);
    res.status(500).json({ error: 'Đánh dấu hoàn thành bài học thất bại. Vui lòng thử lại.' });
  }
};

module.exports = { getLessons, getLessonById, createLesson, updateLesson, deleteLesson, completeLesson };
