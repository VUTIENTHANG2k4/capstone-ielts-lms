const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const supabase = require('../config/supabase');

let io = null;

async function getUnreadCount(userId) {
  const { count } = await supabase
    .from('core_ielts_lms_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  return count || 0;
}

function initRealtime(server, allowedOrigins) {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');
      if (!token) return next(new Error('Unauthorized'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { data: user, error } = await supabase
        .from('core_ielts_lms_users')
        .select('id, email, full_name, role, is_active')
        .eq('id', decoded.userId)
        .single();

      if (error || !user || !user.is_active) return next(new Error('Unauthorized'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', async (socket) => {
    const room = `user:${socket.user.id}`;
    socket.join(room);
    socket.emit('notification:unread_count', { unread_count: await getUnreadCount(socket.user.id) });
  });

  return io;
}

async function emitToUser(userId, event, payload) {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
  if (event !== 'notification:unread_count') {
    io.to(`user:${userId}`).emit('notification:unread_count', {
      unread_count: await getUnreadCount(userId),
    });
  }
}

module.exports = { initRealtime, emitToUser, getUnreadCount };