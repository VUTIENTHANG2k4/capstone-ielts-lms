const supabase = require('../config/supabase');
const crypto = require('crypto');

const generateCertNumber = (userId, courseId) => {
  const hash = crypto
    .createHash('sha256')
    .update(`${userId}-${courseId}-${Date.now()}`)
    .digest('hex')
    .toUpperCase()
    .slice(0, 12);
  return `IELTS-${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}`;
};

const getMyCertificates = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('core_ielts_lms_certificates')
      .select(`
        *,
        core_ielts_lms_courses!course_id (id, title, level, band_range)
      `)
      .eq('user_id', req.user.id)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    res.json({ certificates: data });
  } catch (err) {
    console.error('Get certificates error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách chứng chỉ.' });
  }
};

const getCertificateByNumber = async (req, res) => {
  try {
    const { number } = req.params;

    const { data, error } = await supabase
      .from('core_ielts_lms_certificates')
      .select(`
        *,
        core_ielts_lms_users!user_id (full_name),
        core_ielts_lms_courses!course_id (title, level, band_range)
      `)
      .eq('certificate_number', number)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Không tìm thấy chứng chỉ.' });
    }

    res.json({ certificate: data });
  } catch (err) {
    console.error('Get certificate error:', err);
    res.status(500).json({ error: 'Không thể tải thông tin chứng chỉ.' });
  }
};

// Admin/system: issue certificate upon course completion
const issueCertificate = async (req, res) => {
  try {
    const { user_id, course_id, band_score } = req.body;

    if (!user_id || !course_id) {
      return res.status(400).json({ error: 'Vui lòng cung cấp user_id và course_id.' });
    }

    // Verify course completion
    const { data: enrollment } = await supabase
      .from('core_ielts_lms_user_course_enrollments')
      .select('status')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .single();

    if (!enrollment || enrollment.status !== 'completed') {
      return res.status(400).json({ error: 'Học viên chưa hoàn thành khóa học này. Không thể cấp chứng chỉ.' });
    }

    // Check if certificate already exists
    const { data: existing } = await supabase
      .from('core_ielts_lms_certificates')
      .select('id, certificate_number')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Chứng chỉ cho khóa học này đã được cấp rồi.', certificate_number: existing.certificate_number });
    }

    const certificate_number = generateCertNumber(user_id, course_id);

    const { data, error } = await supabase
      .from('core_ielts_lms_certificates')
      .insert({ user_id, course_id, certificate_number, band_score })
      .select()
      .single();

    if (error) throw error;

    // Notify student
    await supabase
      .from('core_ielts_lms_notifications')
      .insert({
        user_id,
        title: 'Chúc mừng! Bạn đã nhận được chứng chỉ',
        message: `Chứng chỉ hoàn thành khóa học đã được cấp. Mã chứng chỉ: ${certificate_number}`,
        type: 'certificate',
        link: `/certificates/${certificate_number}`
      });

    res.status(201).json({ certificate: data });
  } catch (err) {
    console.error('Issue certificate error:', err);
    res.status(500).json({ error: 'Cấp chứng chỉ thất bại. Vui lòng thử lại.' });
  }
};

module.exports = { getMyCertificates, getCertificateByNumber, issueCertificate };
