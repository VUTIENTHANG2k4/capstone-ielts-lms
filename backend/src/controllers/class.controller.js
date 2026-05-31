const supabase = require('../config/supabase');

// ---------- CLASSES ----------
const listClasses = async (req, res) => {
  try {
    let q = supabase.from('core_ielts_lms_classes')
      .select(`
        *,
        teacher:core_ielts_lms_users!teacher_id (id, full_name, email),
        course:core_ielts_lms_courses!course_id (id, title, level)
      `)
      .order('created_at', { ascending: false });

    // Teachers see only their classes
    if (req.user.role === 'teacher') q = q.eq('teacher_id', req.user.id);

    const { data, error } = await q;
    if (error) throw error;

    // Attach student counts
    const ids = (data || []).map(c => c.id);
    if (ids.length) {
      const { data: counts } = await supabase
        .from('core_ielts_lms_class_students')
        .select('class_id')
        .in('class_id', ids);
      const map = {};
      (counts || []).forEach(r => { map[r.class_id] = (map[r.class_id] || 0) + 1; });
      data.forEach(c => { c.students_count = map[c.id] || 0; });
    }

    res.json({ classes: data });
  } catch (err) {
    console.error('list classes', err);
    res.status(500).json({ error: 'Không thể tải danh sách lớp học.' });
  }
};

const myClasses = async (req, res) => {
  try {
    const { data: links } = await supabase
      .from('core_ielts_lms_class_students')
      .select('class_id')
      .eq('student_id', req.user.id);
    const ids = (links || []).map(l => l.class_id);
    if (!ids.length) return res.json({ classes: [] });

    const { data, error } = await supabase.from('core_ielts_lms_classes')
      .select(`
        *,
        teacher:core_ielts_lms_users!teacher_id (id, full_name, email),
        course:core_ielts_lms_courses!course_id (id, title, level)
      `)
      .in('id', ids);
    if (error) throw error;
    res.json({ classes: data });
  } catch (err) {
    res.status(500).json({ error: 'Không thể tải lớp học của bạn.' });
  }
};

const getClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: cls, error } = await supabase.from('core_ielts_lms_classes')
      .select(`
        *,
        teacher:core_ielts_lms_users!teacher_id (id, full_name, email),
        course:core_ielts_lms_courses!course_id (id, title, level)
      `).eq('id', id).single();
    if (error || !cls) return res.status(404).json({ error: 'Không tìm thấy lớp học.' });

    // Permission: teacher must own; student must be a member
    if (req.user.role === 'teacher' && cls.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Bạn không phải giáo viên của lớp này.' });
    }
    if (req.user.role === 'student') {
      const { data: link } = await supabase.from('core_ielts_lms_class_students')
        .select('id').eq('class_id', id).eq('student_id', req.user.id).single();
      if (!link) return res.status(403).json({ error: 'Bạn không thuộc lớp này.' });
    }

    // Students of the class
    const { data: students } = await supabase
      .from('core_ielts_lms_class_students')
      .select('joined_at, student:core_ielts_lms_users!student_id(id, full_name, email, avatar_url)')
      .eq('class_id', id);

    // For teacher / admin: include progress in associated course
    let progress = [];
    if (cls.course_id && (req.user.role === 'teacher' || req.user.role === 'admin')) {
      const studentIds = (students || []).map(s => s.student?.id).filter(Boolean);
      if (studentIds.length) {
        const { data: enr } = await supabase
          .from('core_ielts_lms_user_course_enrollments')
          .select('user_id, progress_percentage, status')
          .eq('course_id', cls.course_id)
          .in('user_id', studentIds);
        progress = enr || [];
      }
    }

    res.json({ class: cls, students: students || [], progress });
  } catch (err) {
    console.error('get class', err);
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
};

const createClass = async (req, res) => {
  try {
    const { name, description, teacher_id, course_id, schedule_text, start_date, end_date, max_students } = req.body;
    if (!name) return res.status(400).json({ error: 'Vui lòng nhập tên lớp.' });
    const { data, error } = await supabase.from('core_ielts_lms_classes')
      .insert({ name, description, teacher_id, course_id, schedule_text, start_date, end_date, max_students })
      .select().single();
    if (error) throw error;
    res.status(201).json({ class: data });
  } catch (err) {
    console.error('create class', err);
    res.status(500).json({ error: 'Tạo lớp học thất bại.' });
  }
};

const updateClass = async (req, res) => {
  try {
    const { data, error } = await supabase.from('core_ielts_lms_classes')
      .update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ class: data });
  } catch (err) {
    res.status(500).json({ error: 'Cập nhật lớp thất bại.' });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { error } = await supabase.from('core_ielts_lms_classes').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Đã xóa lớp học.' });
  } catch (err) {
    res.status(500).json({ error: 'Xóa lớp thất bại.' });
  }
};

const addStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id } = req.body;
    if (!student_id) return res.status(400).json({ error: 'Thiếu student_id.' });
    const { data, error } = await supabase.from('core_ielts_lms_class_students')
      .insert({ class_id: id, student_id })
      .select().single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Học viên đã có trong lớp.' });
      throw error;
    }
    res.status(201).json({ link: data });
  } catch (err) {
    res.status(500).json({ error: 'Thêm học viên thất bại.' });
  }
};

const removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const { error } = await supabase.from('core_ielts_lms_class_students')
      .delete().eq('class_id', id).eq('student_id', studentId);
    if (error) throw error;
    res.json({ message: 'Đã xóa học viên khỏi lớp.' });
  } catch (err) {
    res.status(500).json({ error: 'Xóa học viên thất bại.' });
  }
};

module.exports = {
  listClasses, myClasses, getClass, createClass, updateClass, deleteClass,
  addStudent, removeStudent,
};
