const supabase = require('../config/supabase');
const { emitToUser, getUnreadCount } = require('../services/realtime.service');

const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('core_ielts_lms_notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (unread_only === 'true') {
      query = query.eq('is_read', false);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    const { count: unreadCount } = await supabase
      .from('core_ielts_lms_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    res.json({
      notifications: data,
      unread_count: unreadCount || 0,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Không thể tải danh sách thông báo.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('core_ielts_lms_notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Không tìm thấy thông báo.' });

    await emitToUser(req.user.id, 'notification:read', { id, unread_count: await getUnreadCount(req.user.id) });

    res.json({ notification: data });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ error: 'Cập nhật thông báo thất bại. Vui lòng thử lại.' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const { error } = await supabase
      .from('core_ielts_lms_notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (error) throw error;
    await emitToUser(req.user.id, 'notification:read_all', { unread_count: 0 });
    res.json({ message: 'Đã đánh dấu tất cả thông báo là đã đọc.' });
  } catch (err) {
    console.error('Mark all as read error:', err);
    res.status(500).json({ error: 'Không thể cập nhật trạng thái thông báo. Vui lòng thử lại.' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('core_ielts_lms_notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Đã xóa thông báo.' });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ error: 'Xóa thông báo thất bại. Vui lòng thử lại.' });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
