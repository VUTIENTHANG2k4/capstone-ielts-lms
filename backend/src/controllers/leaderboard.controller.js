const supabase = require('../config/supabase');

const getLeaderboard = async (req, res) => {
  try {
    const { period = 'all', limit = 20 } = req.query;

    // Get students ranked by total activity score
    // Use raw aggregation via Supabase
    let dateFilter = null;
    if (period === 'week') {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (period === 'month') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Get all passed activity attempts grouped by user
    let attemptsQuery = supabase
      .from('core_ielts_lms_user_activity_attempts')
      .select('user_id, score, is_passed, completed_at');

    if (dateFilter) {
      attemptsQuery = attemptsQuery.gte('completed_at', dateFilter);
    }

    const { data: attempts } = await attemptsQuery;

    // Get mock test scores
    let mockQuery = supabase
      .from('core_ielts_lms_user_mock_test_attempts')
      .select('user_id, band_score, submitted_at')
      .eq('status', 'submitted');

    if (dateFilter) {
      mockQuery = mockQuery.gte('submitted_at', dateFilter);
    }

    const { data: mockAttempts } = await mockQuery;

    // Aggregate scores per user
    const userStats = {};

    attempts?.forEach(a => {
      if (!userStats[a.user_id]) userStats[a.user_id] = { activities_completed: 0, total_score: 0, best_band: 0 };
      if (a.is_passed) {
        userStats[a.user_id].activities_completed++;
        userStats[a.user_id].total_score += (a.score || 0);
      }
    });

    mockAttempts?.forEach(m => {
      if (!userStats[m.user_id]) userStats[m.user_id] = { activities_completed: 0, total_score: 0, best_band: 0 };
      if (m.band_score && m.band_score > userStats[m.user_id].best_band) {
        userStats[m.user_id].best_band = m.band_score;
      }
    });

    // Get user info for top performers
    const topUserIds = Object.entries(userStats)
      .sort((a, b) => {
        const scoreA = a[1].total_score + a[1].best_band * 10;
        const scoreB = b[1].total_score + b[1].best_band * 10;
        return scoreB - scoreA;
      })
      .slice(0, parseInt(limit))
      .map(([id]) => id);

    if (!topUserIds.length) {
      return res.json({ leaderboard: [] });
    }

    const { data: users } = await supabase
      .from('core_ielts_lms_users')
      .select('id, full_name, avatar_url, role')
      .in('id', topUserIds)
      .eq('role', 'student');

    // Build leaderboard
    const leaderboard = topUserIds
      .map((userId, idx) => {
        const user = users?.find(u => u.id === userId);
        if (!user) return null;
        const stats = userStats[userId];
        return {
          rank: idx + 1,
          user_id: userId,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          activities_completed: stats.activities_completed,
          total_score: Math.round(stats.total_score),
          best_band_score: stats.best_band || null
        };
      })
      .filter(Boolean);

    res.json({ leaderboard, period });
  } catch (err) {
    console.error('Get leaderboard error:', err);
    res.status(500).json({ error: 'Không thể tải bảng xếp hạng.' });
  }
};

const getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      { count: activitiesDone },
      { count: lessonsDone },
      { data: mockAttempts },
      { data: enrollments },
      { data: streaks }
    ] = await Promise.all([
      supabase.from('core_ielts_lms_user_activity_attempts').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_passed', true),
      supabase.from('core_ielts_lms_user_lesson_progress').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed'),
      supabase.from('core_ielts_lms_user_mock_test_attempts').select('band_score, submitted_at').eq('user_id', userId).eq('status', 'submitted').order('submitted_at', { ascending: false }),
      supabase.from('core_ielts_lms_user_course_enrollments').select('status').eq('user_id', userId),
      supabase.from('core_ielts_lms_study_streaks').select('streak_date').eq('user_id', userId).order('streak_date', { ascending: false }).limit(60)
    ]);

    const best_band = mockAttempts?.reduce((max, a) => Math.max(max, a.band_score || 0), 0) || 0;
    const courses_completed = enrollments?.filter(e => e.status === 'completed').length || 0;

    // Calculate current streak
    let current_streak = 0;
    if (streaks?.length) {
      const today = new Date().toISOString().slice(0, 10);
      let checkDate = today;
      for (const s of streaks) {
        if (s.streak_date === checkDate) {
          current_streak++;
          const d = new Date(checkDate);
          d.setDate(d.getDate() - 1);
          checkDate = d.toISOString().slice(0, 10);
        } else {
          break;
        }
      }
    }

    res.json({
      stats: {
        activities_passed: activitiesDone || 0,
        lessons_completed: lessonsDone || 0,
        mock_tests_taken: mockAttempts?.length || 0,
        best_band_score: best_band,
        courses_completed,
        current_streak
      }
    });
  } catch (err) {
    console.error('Get my stats error:', err);
    res.status(500).json({ error: 'Không thể tải thống kê của bạn.' });
  }
};

module.exports = { getLeaderboard, getMyStats };
