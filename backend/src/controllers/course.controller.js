const supabase = require('../config/supabase');

const getCourses = async (req, res) => {
  try {
    let query = supabase
      .from('core_ielts_lms_courses')
      .select('*')
      .order('order_index', { ascending: true });

    if (req.user?.role === 'student') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (req.user?.role === 'student') {
      const { data: enrollments } = await supabase
        .from('core_ielts_lms_user_course_enrollments')
        .select('*')
        .eq('user_id', req.user.id);

      const coursesWithEnrollment = data.map(course => {
        const enrollment = enrollments?.find(e => e.course_id === course.id);
        return {
          ...course,
          enrollment: enrollment || null,
          is_enrolled: !!enrollment,
          is_locked: !enrollment && course.order_index > 1
        };
      });

      return res.json({ courses: coursesWithEnrollment });
    }

    res.json({ courses: data });
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách khóa học.' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: course, error } = await supabase
      .from('core_ielts_lms_courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !course) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học.' });
    }

    // Get units with sections
    const { data: units } = await supabase
      .from('core_ielts_lms_units')
      .select(`
        *,
        core_ielts_lms_sections (
          *,
          core_ielts_lms_lessons (id, title, content_type, order_index, duration_minutes),
          core_ielts_lms_activities (id, title, activity_type, order_index, passing_score, time_limit_minutes)
        )
      `)
      .eq('course_id', id)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    // Sort sections and their children; normalize nested key names
    if (units) {
      units.forEach(unit => {
        const sections = unit.core_ielts_lms_sections || [];
        sections.sort((a, b) => a.order_index - b.order_index);
        sections.forEach(section => {
          section.lessons = (section.core_ielts_lms_lessons || [])
            .filter(l => l.is_active !== false)
            .sort((a, b) => a.order_index - b.order_index);
          section.activities = (section.core_ielts_lms_activities || [])
            .filter(a => a.is_active !== false)
            .sort((a, b) => a.order_index - b.order_index);
          delete section.core_ielts_lms_lessons;
          delete section.core_ielts_lms_activities;
        });
        unit.sections = sections;
        delete unit.core_ielts_lms_sections;
      });
    }

    // If student, include progress
    let enrollment = null;
    if (req.user?.role === 'student') {
      const { data: enr } = await supabase
        .from('core_ielts_lms_user_course_enrollments')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('course_id', id)
        .single();
      enrollment = enr;
    }

    res.json({ course, units: units || [], enrollment });
  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ error: 'Không thể tải thông tin khóa học.' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, slug, description, level, band_range, order_index, thumbnail_url, checkpoint_passing_score } = req.body;

    if (!title || !slug || !level || order_index === undefined) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tiêu đề, slug, cấp độ và thứ tự.' });
    }

    const { data, error } = await supabase
      .from('core_ielts_lms_courses')
      .insert({ title, slug, description, level, band_range, order_index, thumbnail_url, checkpoint_passing_score })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Slug khóa học này đã tồn tại. Vui lòng chọn slug khác.' });
      }
      throw error;
    }

    res.status(201).json({ course: data });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ error: 'Tạo khóa học thất bại. Vui lòng thử lại.' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('core_ielts_lms_courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Không tìm thấy khóa học.' });

    res.json({ course: data });
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ error: 'Cập nhật khóa học thất bại. Vui lòng thử lại.' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('core_ielts_lms_courses').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Đã xóa khóa học thành công.' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ error: 'Xóa khóa học thất bại. Vui lòng thử lại.' });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check course exists and is active
    const { data: course } = await supabase
      .from('core_ielts_lms_courses')
      .select('*')
      .eq('id', id)
      .single();

    if (!course) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học.' });
    }

    if (!course.is_active) {
      return res.status(400).json({ error: 'Khóa học này hiện không còn khả dụng.' });
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('core_ielts_lms_user_course_enrollments')
      .select('id, status')
      .eq('user_id', userId)
      .eq('course_id', id)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Bạn đã đăng ký khóa học này rồi.', enrollment: existing });
    }

    // For courses beyond the first, require completing previous course
    if (course.order_index > 1) {
      const { data: prevCourse } = await supabase
        .from('core_ielts_lms_courses')
        .select('id')
        .eq('order_index', course.order_index - 1)
        .single();

      if (prevCourse) {
        const { data: prevEnrollment } = await supabase
          .from('core_ielts_lms_user_course_enrollments')
          .select('status')
          .eq('user_id', userId)
          .eq('course_id', prevCourse.id)
          .eq('status', 'completed')
          .single();

        if (!prevEnrollment) {
          return res.status(403).json({ error: 'Bạn cần hoàn thành khóa học trước đó trước khi đăng ký khóa này.' });
        }
      }
    }

    const { data: enrollment, error } = await supabase
      .from('core_ielts_lms_user_course_enrollments')
      .insert({ user_id: userId, course_id: id, status: 'active' })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ enrollment, message: 'Enrolled successfully.' });
  } catch (err) {
    console.error('Enroll error:', err);
    res.status(500).json({ error: 'Đăng ký khóa học thất bại. Vui lòng thử lại.' });
  }
};

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, enrollCourse };
