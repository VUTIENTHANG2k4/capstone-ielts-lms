const supabase = require('../config/supabase');

const getNotes = async (req, res) => {
  try {
    const { lesson_id, activity_id } = req.query;

    let query = supabase
      .from('core_ielts_lms_study_notes')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (lesson_id) query = query.eq('lesson_id', lesson_id);
    if (activity_id) query = query.eq('activity_id', activity_id);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ notes: data });
  } catch (err) {
    console.error('Get notes error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách ghi chú.' });
  }
};

const createNote = async (req, res) => {
  try {
    const { lesson_id, activity_id, title, content, color } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Vui lòng nhập nội dung ghi chú.' });
    }

    const { data, error } = await supabase
      .from('core_ielts_lms_study_notes')
      .insert({
        user_id: req.user.id,
        lesson_id: lesson_id || null,
        activity_id: activity_id || null,
        title,
        content,
        color: color || 'yellow'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ note: data });
  } catch (err) {
    console.error('Create note error:', err);
    res.status(500).json({ error: 'Tạo ghi chú thất bại. Vui lòng thử lại.' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, color } = req.body;

    const { data, error } = await supabase
      .from('core_ielts_lms_study_notes')
      .update({ title, content, color })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Không tìm thấy ghi chú.' });

    res.json({ note: data });
  } catch (err) {
    console.error('Update note error:', err);
    res.status(500).json({ error: 'Cập nhật ghi chú thất bại. Vui lòng thử lại.' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('core_ielts_lms_study_notes')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Đã xóa ghi chú.' });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ error: 'Xóa ghi chú thất bại. Vui lòng thử lại.' });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
