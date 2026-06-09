const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../config/supabase');
const { sendMail } = require('../services/mailer.service');

// Single source of truth for token lifetime. The frontend reads the JWT
// `exp` claim directly, so changing this value keeps both sides in sync.
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

const register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ email, mật khẩu và họ tên.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const { data: existing } = await supabase
      .from('core_ielts_lms_users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('core_ielts_lms_users')
      .insert({
        email: email.toLowerCase().trim(),
        password_hash,
        full_name: full_name.trim(),
        role: 'student'
      })
      .select('id, email, full_name, role, avatar_url, created_at')
      .single();

    if (error) throw error;

    const token = signToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Đăng ký thất bại. Vui lòng thử lại sau.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu.' });
    }

    const { data: user, error } = await supabase
      .from('core_ielts_lms_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác.' });
    }

    const token = signToken(user);

    const { password_hash, ...userData } = user;
    res.json({ user: userData, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Đăng nhập thất bại. Vui lòng thử lại sau.' });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

const updateProfile = async (req, res) => {
  try {
    const { full_name, avatar_url } = req.body;
    const updates = {};
    if (full_name) updates.full_name = full_name.trim();
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const { data, error } = await supabase
      .from('core_ielts_lms_users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, email, full_name, role, avatar_url')
      .single();

    if (error) throw error;
    res.json({ user: data });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    const { data: user } = await supabase
      .from('core_ielts_lms_users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng.' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);
    // Bumping tokens_valid_from revokes every JWT issued before now.
    await supabase
      .from('core_ielts_lms_users')
      .update({ password_hash, tokens_valid_from: new Date().toISOString() })
      .eq('id', req.user.id);

    // Re-issue a token for the current client so this session stays alive
    // while all OTHER outstanding tokens (other devices) are now revoked.
    const token = signToken({ id: req.user.id, email: req.user.email, role: req.user.role });

    res.json({ message: 'Đổi mật khẩu thành công.', token });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Đổi mật khẩu thất bại. Vui lòng thử lại.' });
  }
};

// ---------- FORGOT / RESET PASSWORD ----------
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Vui lòng nhập email.' });

    const { data: user } = await supabase
      .from('core_ielts_lms_users')
      .select('id, email, full_name')
      .eq('email', email.toLowerCase().trim())
      .single();

    // Always return 200 to avoid user enumeration
    if (!user) return res.json({ message: 'Nếu email tồn tại, hệ thống đã gửi liên kết đặt lại mật khẩu.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await supabase.from('core_ielts_lms_password_reset_tokens').insert({
      user_id: user.id, token, expires_at: expires.toISOString(),
    });

    const fe = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${fe}/reset-password?token=${token}`;

    await sendMail({
      to: user.email,
      subject: 'IELTS Academy – Đặt lại mật khẩu',
      text: `Xin chào ${user.full_name},\n\nVui lòng truy cập liên kết sau để đặt lại mật khẩu (hết hạn sau 1 giờ):\n${link}`,
      html: `<p>Xin chào <b>${user.full_name}</b>,</p><p>Nhấn vào liên kết bên dưới để đặt lại mật khẩu (hết hạn sau 1 giờ):</p><p><a href="${link}">${link}</a></p>`,
    });

    const dev = process.env.NODE_ENV !== 'production';
    res.json({
      message: 'Nếu email tồn tại, hệ thống đã gửi liên kết đặt lại mật khẩu.',
      ...(dev ? { dev_token: token, dev_link: link } : {}),
    });
  } catch (err) {
    console.error('forgot password', err);
    res.status(500).json({ error: 'Không thể xử lý yêu cầu. Vui lòng thử lại.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) return res.status(400).json({ error: 'Thiếu token hoặc mật khẩu mới.' });
    if (new_password.length < 6) return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' });

    const { data: row } = await supabase.from('core_ielts_lms_password_reset_tokens')
      .select('*').eq('token', token).single();
    if (!row) return res.status(400).json({ error: 'Token không hợp lệ.' });
    if (row.used_at) return res.status(400).json({ error: 'Token đã được sử dụng.' });
    if (new Date(row.expires_at) < new Date()) return res.status(400).json({ error: 'Token đã hết hạn.' });

    const password_hash = await bcrypt.hash(new_password, 10);
    // Revoke all outstanding JWTs for this user (they must log in again).
    await supabase.from('core_ielts_lms_users')
      .update({ password_hash, tokens_valid_from: new Date().toISOString() })
      .eq('id', row.user_id);
    await supabase.from('core_ielts_lms_password_reset_tokens').update({ used_at: new Date().toISOString() }).eq('id', row.id);

    res.json({ message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' });
  } catch (err) {
    console.error('reset password', err);
    res.status(500).json({ error: 'Đặt lại mật khẩu thất bại.' });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword };
