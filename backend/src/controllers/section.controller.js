const supabase = require('../config/supabase');

const getSections = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { data, error } = await supabase
      .from('core_ielts_lms_sections')
      .select(`
        *,
      core_ielts_lms_lessons (id, title, content_type, order_index, duration_minutes, is_active),
          core_ielts_lms_activities (id, title, activity_type, order_index, passing_score, is_active)
      `)
      .eq('unit_id', unitId)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;

    data?.forEach(section => {
      section.lessons = (section.core_ielts_lms_lessons || [])
        .filter(l => l.is_active !== false)
        .sort((a, b) => a.order_index - b.order_index);
      section.activities = (section.core_ielts_lms_activities || [])
        .filter(a => a.is_active !== false)
        .sort((a, b) => a.order_index - b.order_index);
      delete section.core_ielts_lms_lessons;
      delete section.core_ielts_lms_activities;
    });

    res.json({ sections: data });
  } catch (err) {
    console.error('Get sections error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách phần học.' });
  }
};

const getSectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: section, error } = await supabase
      .from('core_ielts_lms_sections')
      .select(`
        *,
        core_ielts_lms_lessons (id, title, content_type, order_index, duration_minutes, is_active),
        core_ielts_lms_activities (id, title, activity_type, order_index, passing_score, time_limit_minutes, is_active)
      `)
      .eq('id', id)
      .single();

    if (error || !section) {
      return res.status(404).json({ error: 'Không tìm thấy phần học.' });
    }

    section.lessons = (section.core_ielts_lms_lessons || [])
      .filter(l => l.is_active !== false)
      .sort((a, b) => a.order_index - b.order_index);
    section.activities = (section.core_ielts_lms_activities || [])
      .filter(a => a.is_active !== false)
      .sort((a, b) => a.order_index - b.order_index);
    delete section.core_ielts_lms_lessons;
    delete section.core_ielts_lms_activities;

    res.json({ section });
  } catch (err) {
    console.error('Get section error:', err);
    res.status(500).json({ error: 'Không thể tải thông tin phần học.' });
  }
};

const createSection = async (req, res) => {
  try {
    const { unit_id, title, section_type, order_index } = req.body;
    if (!unit_id || !title || !section_type || order_index === undefined) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ unit_id, tiêu đề, loại phần học và thứ tự.' });
    }

    const { data, error } = await supabase
      .from('core_ielts_lms_sections')
      .insert({ unit_id, title, section_type, order_index })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ section: data });
  } catch (err) {
    console.error('Create section error:', err);
    res.status(500).json({ error: 'Tạo phần học thất bại. Vui lòng thử lại.' });
  }
};

const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('core_ielts_lms_sections')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ section: data });
  } catch (err) {
    console.error('Update section error:', err);
    res.status(500).json({ error: 'Cập nhật phần học thất bại. Vui lòng thử lại.' });
  }
};

const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('core_ielts_lms_sections').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Đã xóa phần học thành công.' });
  } catch (err) {
    console.error('Delete section error:', err);
    res.status(500).json({ error: 'Xóa phần học thất bại. Vui lòng thử lại.' });
  }
};

module.exports = { getSections, getSectionById, createSection, updateSection, deleteSection };
