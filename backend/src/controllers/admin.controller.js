const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const getDashboard = async (req, res) => {
  try {
    // Revenue – last 12 months from successful payments
    const since = new Date(); since.setMonth(since.getMonth() - 11); since.setDate(1); since.setHours(0, 0, 0, 0);

    // Chạy song song toàn bộ query để giảm latency cộng dồn (trước đây await tuần tự).
    const [
      totalUsersRes, totalStudentsRes, activeStudentsRes, totalTeachersRes,
      totalCoursesRes, totalEnrollmentsRes, pendingSubmissionsRes, totalMockTestsRes,
      totalClassesRes, activePackagesRes, paymentsRes, recentEnrollmentsRes,
    ] = await Promise.all([
      supabase.from('core_ielts_lms_users').select('*', { count: 'exact', head: true }),
      supabase.from('core_ielts_lms_users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('core_ielts_lms_users').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('is_active', true),
      supabase.from('core_ielts_lms_users').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
      supabase.from('core_ielts_lms_courses').select('*', { count: 'exact', head: true }),
      supabase.from('core_ielts_lms_user_course_enrollments').select('*', { count: 'exact', head: true }),
      supabase.from('core_ielts_lms_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('core_ielts_lms_mock_tests').select('*', { count: 'exact', head: true }),
      supabase.from('core_ielts_lms_classes').select('*', { count: 'exact', head: true }),
      supabase.from('core_ielts_lms_package_enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('core_ielts_lms_payments').select('amount, created_at').eq('status', 'success').gte('created_at', since.toISOString()),
      supabase
        .from('core_ielts_lms_user_course_enrollments')
        .select(`
          *,
          core_ielts_lms_users!user_id (full_name, email),
          core_ielts_lms_courses!course_id (title, level)
        `)
        .order('enrolled_at', { ascending: false })
        .limit(10),
    ]);

    const totalUsers = totalUsersRes.count;
    const totalStudents = totalStudentsRes.count;
    const activeStudents = activeStudentsRes.count;
    const totalTeachers = totalTeachersRes.count;
    const totalCourses = totalCoursesRes.count;
    const totalEnrollments = totalEnrollmentsRes.count;
    const pendingSubmissions = pendingSubmissionsRes.count;
    const totalMockTests = totalMockTestsRes.count;
    const totalClasses = totalClassesRes.count;
    const activePackages = activePackagesRes.count;
    const payments = paymentsRes.data;
    const recentEnrollments = recentEnrollmentsRes.data;

    const monthly = {};
    (payments || []).forEach(p => {
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + Number(p.amount || 0);
    });
    const revenue = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(since.getFullYear(), since.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      revenue.push({ month: key, total: monthly[key] || 0 });
    }
    const totalRevenue = revenue.reduce((s, r) => s + r.total, 0);

    res.json({
      stats: {
        totalUsers, totalStudents, activeStudents, totalTeachers,
        totalCourses, totalEnrollments, pendingSubmissions, totalMockTests,
        totalClasses, activePackages, totalRevenue,
      },
      revenue,
      recentEnrollments,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Không thể tải dữ liệu bảng điều khiển.' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('core_ielts_lms_users')
      .select('id, email, full_name, role, avatar_url, is_active, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (role) query = query.eq('role', role);
    if (search) query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({
      users: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách người dùng.' });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ email, mật khẩu, họ tên và vai trò.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('core_ielts_lms_users')
      .insert({ email: email.toLowerCase().trim(), password_hash, full_name: full_name.trim(), role })
      .select('id, email, full_name, role, is_active, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Email này đã tồn tại trong hệ thống.' });
      }
      throw error;
    }

    res.status(201).json({ user: data });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Tạo người dùng thất bại. Vui lòng thử lại.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role, is_active } = req.body;

    // Prevent admin from modifying their own role or deactivating themselves
    if (id === req.user.id) {
      if (role !== undefined && role !== req.user.role) {
        return res.status(400).json({ error: 'Không thể tự thay đổi vai trò của chính mình.' });
      }
      if (is_active === false) {
        return res.status(400).json({ error: 'Không thể tự vô hiệu hóa tài khoản của chính mình.' });
      }
    }

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase
      .from('core_ielts_lms_users')
      .update(updates)
      .eq('id', id)
      .select('id, email, full_name, role, is_active')
      .single();

    if (error) throw error;
    res.json({ user: data });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Cập nhật thông tin người dùng thất bại. Vui lòng thử lại.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Không thể tự xóa tài khoản của chính mình.' });
    }
    const { error } = await supabase.from('core_ielts_lms_users').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Đã xóa người dùng thành công.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Xóa người dùng thất bại. Vui lòng thử lại.' });
  }
};

// ─── Student Progress for Admin ────────────────────────────────────────

const getStudentsProgress = async (req, res) => {
  try {
    const { search, course_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    // Get students with pagination
    let userQuery = supabase
      .from('core_ielts_lms_users')
      .select('id, email, full_name, avatar_url, is_active, created_at', { count: 'exact' })
      .eq('role', 'student')
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) userQuery = userQuery.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);

    const { data: students, count, error } = await userQuery;
    if (error) throw error;

    if (!students?.length) {
      return res.json({
        students: [],
        pagination: { total: 0, page: parseInt(page), limit: parseInt(limit), pages: 0 },
      });
    }

    const studentIds = students.map(s => s.id);

    // Get enrollments for all these students
    let enrollmentQuery = supabase
      .from('core_ielts_lms_user_course_enrollments')
      .select('user_id, course_id, status, progress_percentage, enrolled_at, completed_at')
      .in('user_id', studentIds);

    if (course_id) enrollmentQuery = enrollmentQuery.eq('course_id', course_id);

    const { data: enrollments } = await enrollmentQuery;

    // Get lesson progress counts
    const { data: lessonProgress } = await supabase
      .from('core_ielts_lms_user_lesson_progress')
      .select('user_id, status')
      .in('user_id', studentIds);

    // Get activity attempt stats
    const { data: activityAttempts } = await supabase
      .from('core_ielts_lms_user_activity_attempts')
      .select('user_id, is_passed, score')
      .in('user_id', studentIds);

    // Get mock test attempts
    const { data: mockTestAttempts } = await supabase
      .from('core_ielts_lms_user_mock_test_attempts')
      .select('user_id, status, band_score')
      .in('user_id', studentIds);

    // Get study streak data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: streakData } = await supabase
      .from('core_ielts_lms_study_streaks')
      .select('user_id, streak_date, minutes_studied')
      .in('user_id', studentIds)
      .gte('streak_date', thirtyDaysAgo.toISOString().split('T')[0]);

    // Aggregate per student
    const result = students.map(student => {
      const userEnrollments = enrollments?.filter(e => e.user_id === student.id) || [];
      const userLessonProgress = lessonProgress?.filter(p => p.user_id === student.id) || [];
      const userActivityAttempts = activityAttempts?.filter(a => a.user_id === student.id) || [];
      const userMockAttempts = mockTestAttempts?.filter(a => a.user_id === student.id) || [];
      const userStreaks = streakData?.filter(s => s.user_id === student.id) || [];

      const coursesEnrolled = userEnrollments.length;
      const coursesCompleted = userEnrollments.filter(e => e.status === 'completed').length;
      const avgProgress = coursesEnrolled > 0
        ? userEnrollments.reduce((sum, e) => sum + (parseFloat(e.progress_percentage) || 0), 0) / coursesEnrolled
        : 0;

      const lessonsCompleted = userLessonProgress.filter(p => p.status === 'completed').length;
      const activitiesPassed = userActivityAttempts.filter(a => a.is_passed).length;
      const totalAttempts = userActivityAttempts.length;
      const avgActivityScore = totalAttempts > 0
        ? userActivityAttempts.reduce((sum, a) => sum + (parseFloat(a.score) || 0), 0) / totalAttempts
        : 0;

      const mockTestsTaken = userMockAttempts.filter(a => a.status === 'submitted').length;
      const bestBandScore = userMockAttempts.reduce((max, a) => Math.max(max, parseFloat(a.band_score) || 0), 0);

      const totalMinutesStudied = userStreaks.reduce((sum, s) => sum + (s.minutes_studied || 0), 0);
      const activeDays = userStreaks.length;

      return {
        ...student,
        progress: {
          courses_enrolled: coursesEnrolled,
          courses_completed: coursesCompleted,
          avg_progress: parseFloat(avgProgress.toFixed(1)),
          lessons_completed: lessonsCompleted,
          activities_passed: activitiesPassed,
          total_activity_attempts: totalAttempts,
          avg_activity_score: parseFloat(avgActivityScore.toFixed(1)),
          mock_tests_taken: mockTestsTaken,
          best_band_score: bestBandScore,
          total_minutes_studied: totalMinutesStudied,
          active_days_last_30: activeDays,
        },
      };
    });

    res.json({
      students: result,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Get students progress error:', err);
    res.status(500).json({ error: 'Không thể tải tiến độ học sinh.' });
  }
};

const getStudentProgressDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Get student info
    const { data: student, error: userErr } = await supabase
      .from('core_ielts_lms_users')
      .select('id, email, full_name, avatar_url, phone, bio, is_active, created_at')
      .eq('id', id)
      .eq('role', 'student')
      .single();

    if (userErr || !student) {
      return res.status(404).json({ error: 'Không tìm thấy học sinh.' });
    }

    // Get all courses
    const { data: courses } = await supabase
      .from('core_ielts_lms_courses')
      .select('id, title, level, band_range, order_index')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    // Get enrollments
    const { data: enrollments } = await supabase
      .from('core_ielts_lms_user_course_enrollments')
      .select('*')
      .eq('user_id', id);

    // Build course progress
    const courseProgress = courses?.map(course => {
      const enrollment = enrollments?.find(e => e.course_id === course.id);
      return {
        ...course,
        status: enrollment?.status || 'not_enrolled',
        progress_percentage: parseFloat(enrollment?.progress_percentage || 0),
        enrolled_at: enrollment?.enrolled_at || null,
        completed_at: enrollment?.completed_at || null,
      };
    });

    // Get lesson progress
    const { data: lessonProgress } = await supabase
      .from('core_ielts_lms_user_lesson_progress')
      .select('*')
      .eq('user_id', id);

    // Get activity attempts
    const { data: activityAttempts } = await supabase
      .from('core_ielts_lms_user_activity_attempts')
      .select('*')
      .eq('user_id', id)
      .order('completed_at', { ascending: false });

    // Get mock test attempts with test info
    const { data: mockTestAttempts } = await supabase
      .from('core_ielts_lms_user_mock_test_attempts')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    let mockTestDetails = [];
    if (mockTestAttempts?.length) {
      const mockTestIds = [...new Set(mockTestAttempts.map(a => a.mock_test_id))];
      const { data: mockTests } = await supabase
        .from('core_ielts_lms_mock_tests')
        .select('id, title, test_type, skill, time_limit_minutes, passing_score')
        .in('id', mockTestIds);

      const mockTestMap = {};
      (mockTests || []).forEach(mt => { mockTestMap[mt.id] = mt; });

      mockTestDetails = mockTestAttempts.map(a => ({
        ...a,
        mock_test: mockTestMap[a.mock_test_id] || null,
      }));
    }

    // Get study streaks (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const { data: streaks } = await supabase
      .from('core_ielts_lms_study_streaks')
      .select('*')
      .eq('user_id', id)
      .gte('streak_date', ninetyDaysAgo.toISOString().split('T')[0])
      .order('streak_date', { ascending: false });

    // Get submissions
    const { data: submissions } = await supabase
      .from('core_ielts_lms_submissions')
      .select('id, submission_type, status, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Summary stats
    const lessonsCompleted = lessonProgress?.filter(p => p.status === 'completed').length || 0;
    const lessonsInProgress = lessonProgress?.filter(p => p.status === 'in_progress').length || 0;
    const activitiesPassed = activityAttempts?.filter(a => a.is_passed).length || 0;
    const uniqueActivitiesPassed = new Set(activityAttempts?.filter(a => a.is_passed).map(a => a.activity_id)).size;
    const totalMinutes = streaks?.reduce((sum, s) => sum + (s.minutes_studied || 0), 0) || 0;
    const currentStreak = calculateCurrentStreak(streaks || []);

    res.json({
      student,
      course_progress: courseProgress,
      summary: {
        lessons_completed: lessonsCompleted,
        lessons_in_progress: lessonsInProgress,
        activities_passed: uniqueActivitiesPassed,
        total_activity_attempts: activityAttempts?.length || 0,
        mock_tests_taken: mockTestAttempts?.filter(a => a.status === 'submitted').length || 0,
        best_band_score: mockTestAttempts?.reduce((max, a) => Math.max(max, parseFloat(a.band_score) || 0), 0) || 0,
        total_minutes_studied: totalMinutes,
        current_streak: currentStreak,
        submissions_pending: submissions?.filter(s => s.status === 'pending').length || 0,
        submissions_graded: submissions?.filter(s => s.status === 'graded').length || 0,
      },
      mock_test_attempts: mockTestDetails,
      study_streaks: streaks,
      recent_submissions: submissions,
    });
  } catch (err) {
    console.error('Get student progress detail error:', err);
    res.status(500).json({ error: 'Không thể tải chi tiết tiến độ học sinh.' });
  }
};

function calculateCurrentStreak(streaks) {
  if (!streaks.length) return 0;
  const sorted = [...streaks].sort((a, b) => new Date(b.streak_date) - new Date(a.streak_date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let checkDate = new Date(today);

  for (const s of sorted) {
    const sDate = new Date(s.streak_date);
    sDate.setHours(0, 0, 0, 0);
    const diff = Math.round((checkDate - sDate) / (1000 * 60 * 60 * 24));
    if (diff <= 1) {
      streak++;
      checkDate = sDate;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

module.exports = { getDashboard, getUsers, createUser, updateUser, deleteUser, getStudentsProgress, getStudentProgressDetail };
