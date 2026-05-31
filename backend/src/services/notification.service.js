const supabase = require('../config/supabase');
const { emitToUser } = require('./realtime.service');

async function createNotification(notification) {
  const { data, error } = await supabase
    .from('core_ielts_lms_notifications')
    .insert(notification)
    .select()
    .single();
  if (error) throw error;

  await emitToUser(notification.user_id, 'notification:new', { notification: data });
  return data;
}

module.exports = { createNotification };