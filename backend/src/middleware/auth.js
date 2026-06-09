const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Truy cập bị từ chối. Không tìm thấy token xác thực.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from('core_ielts_lms_users')
      .select('id, email, full_name, role, avatar_url, is_active, tokens_valid_from')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Token không hợp lệ. Không tìm thấy người dùng.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' });
    }

    // Token revocation check: reject tokens issued before tokens_valid_from
    // (bumped whenever the password changes). Both sides compared in seconds
    // so a token re-issued in the same second as the change stays valid.
    if (user.tokens_valid_from) {
      const validFromSec = Math.floor(new Date(user.tokens_valid_from).getTime() / 1000);
      if (typeof decoded.iat === 'number' && decoded.iat < validFromSec) {
        return res.status(401).json({ error: 'Phiên đăng nhập đã hết hiệu lực. Vui lòng đăng nhập lại.' });
      }
    }

    // Never leak the revocation timestamp to route handlers.
    delete user.tokens_valid_from;

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token xác thực không hợp lệ.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
    }
    return res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Bạn chưa đăng nhập.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bạn không có quyền thực hiện thao tác này.' });
    }
    next();
  };
};

module.exports = { auth, authorize };
