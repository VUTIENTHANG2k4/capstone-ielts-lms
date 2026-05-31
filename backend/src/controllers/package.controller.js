const supabase = require('../config/supabase');
const { buildPaymentUrl, verifyReturn } = require('../services/vnpay.service');
const { createNotification } = require('../services/notification.service');
const crypto = require('crypto');

function isLocalUrl(url) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(String(url || ''));
}

const RETURN_URL_FE = process.env.VNP_RETURN_URL
  || (process.env.FRONTEND_URL && !isLocalUrl(process.env.FRONTEND_URL)
    ? `${process.env.FRONTEND_URL}/payment/return`
    : 'https://ielts-thangvu.vercel.app/payment/return');

// ---------- PACKAGES ----------
const listPackages = async (req, res) => {
  try {
    let q = supabase.from('core_ielts_lms_packages').select('*').order('price', { ascending: true });
    if (req.user?.role !== 'admin') q = q.eq('is_active', true);
    const { data, error } = await q;
    if (error) throw error;
    res.json({ packages: data });
  } catch (err) {
    console.error('list packages', err);
    res.status(500).json({ error: 'Không thể tải danh sách gói học.' });
  }
};

const getPackage = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('core_ielts_lms_packages').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Không tìm thấy gói học.' });
    res.json({ package: data });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ.' });
  }
};

const createPackage = async (req, res) => {
  try {
    const { name, description, duration_days, price, features, is_active } = req.body;
    if (!name || !duration_days || price === undefined) {
      return res.status(400).json({ error: 'Vui lòng nhập tên, thời hạn và giá gói học.' });
    }
    const { data, error } = await supabase.from('core_ielts_lms_packages')
      .insert({ name, description, duration_days, price, features: features || [], is_active: is_active !== false })
      .select().single();
    if (error) throw error;
    res.status(201).json({ package: data });
  } catch (err) {
    console.error('create package', err);
    res.status(500).json({ error: 'Tạo gói học thất bại.' });
  }
};

const updatePackage = async (req, res) => {
  try {
    const { data, error } = await supabase.from('core_ielts_lms_packages')
      .update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ package: data });
  } catch (err) {
    res.status(500).json({ error: 'Cập nhật gói học thất bại.' });
  }
};

const deletePackage = async (req, res) => {
  try {
    const { error } = await supabase.from('core_ielts_lms_packages').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Đã xóa gói học.' });
  } catch (err) {
    res.status(500).json({ error: 'Xóa gói học thất bại.' });
  }
};

// ---------- ENROLLMENTS ----------
const myEnrollments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('core_ielts_lms_package_enrollments')
      .select('*, core_ielts_lms_packages!package_id(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ enrollments: data });
  } catch (err) {
    res.status(500).json({ error: 'Không thể tải lịch sử gói học.' });
  }
};

const allEnrollments = async (req, res) => {
  try {
    const { status } = req.query;
    let q = supabase
      .from('core_ielts_lms_package_enrollments')
      .select('*, core_ielts_lms_packages!package_id(name, price), core_ielts_lms_users!user_id(full_name, email)')
      .order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    res.json({ enrollments: data });
  } catch (err) {
    res.status(500).json({ error: 'Không thể tải danh sách đăng ký.' });
  }
};

// Admin manually approves a pending enrollment (bank transfer flow)
const approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: enr } = await supabase.from('core_ielts_lms_package_enrollments')
      .select('*, core_ielts_lms_packages!package_id(duration_days, price)').eq('id', id).single();
    if (!enr) return res.status(404).json({ error: 'Không tìm thấy đăng ký.' });

    const now = new Date();
    const expires = new Date(now.getTime() + (enr.core_ielts_lms_packages.duration_days || 30) * 86400000);

    await supabase.from('core_ielts_lms_package_enrollments').update({
      status: 'active', starts_at: now.toISOString(), expires_at: expires.toISOString()
    }).eq('id', id);

    // Record manual payment
    await supabase.from('core_ielts_lms_payments').insert({
      user_id: enr.user_id, package_id: enr.package_id, enrollment_id: id,
      amount: enr.core_ielts_lms_packages.price, provider: 'manual',
      txn_ref: 'MAN-' + id.slice(0, 8) + '-' + Date.now(),
      status: 'success',
    });

    await createNotification({
      user_id: enr.user_id, title: 'Gói học đã được kích hoạt',
      message: `Gói học của bạn đã được kích hoạt và có hiệu lực đến ${expires.toLocaleDateString('vi-VN')}.`,
      type: 'package', link: '/student/my-packages'
    });

    res.json({ message: 'Đã kích hoạt gói học.' });
  } catch (err) {
    console.error('approve enrollment', err);
    res.status(500).json({ error: 'Kích hoạt gói học thất bại.' });
  }
};

// ---------- VNPAY CHECKOUT ----------
const createPayment = async (req, res) => {
  try {
    const { package_id, bank_code } = req.body;
    if (!package_id) return res.status(400).json({ error: 'Vui lòng chọn gói học.' });

    const { data: pkg } = await supabase.from('core_ielts_lms_packages')
      .select('*').eq('id', package_id).eq('is_active', true).single();
    if (!pkg) return res.status(404).json({ error: 'Gói học không tồn tại hoặc đã ngừng bán.' });

    // Create pending enrollment
    const { data: enr, error: enrErr } = await supabase.from('core_ielts_lms_package_enrollments')
      .insert({ user_id: req.user.id, package_id, status: 'pending' })
      .select().single();
    if (enrErr) throw enrErr;

    // txnRef – VNPAY requires unique alphanumeric
    const txnRef = 'PKG' + Date.now() + crypto.randomBytes(2).toString('hex').toUpperCase();

    const { data: payment, error: payErr } = await supabase.from('core_ielts_lms_payments').insert({
      user_id: req.user.id, package_id, enrollment_id: enr.id,
      amount: pkg.price, provider: 'vnpay', txn_ref: txnRef, status: 'pending',
    }).select().single();
    if (payErr) throw payErr;

    const ipAddr = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1')
      .toString().split(',')[0].trim().replace(/^::ffff:/, '');

    const url = buildPaymentUrl({
      txnRef,
      amount: pkg.price,
      ipAddr,
      orderInfo: `Thanh toan goi ${pkg.name}`.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      returnUrl: RETURN_URL_FE,
      bankCode: bank_code,
    });

    res.json({ payment_url: url, txn_ref: txnRef, payment_id: payment.id });
  } catch (err) {
    console.error('create payment', err);
    res.status(500).json({ error: 'Khởi tạo thanh toán thất bại.' });
  }
};

const finalizePayment = async ({ txnRef, code, transactionNo, bankCode, payDate, params }) => {
  const { data: payment } = await supabase.from('core_ielts_lms_payments')
    .select('*, core_ielts_lms_packages!package_id(duration_days)')
    .eq('txn_ref', txnRef).single();
  if (!payment) return { ok: false, message: 'Payment not found' };
  if (payment.status === 'success') return { ok: true, message: 'Already processed' };

  const isSuccess = code === '00';

  await supabase.from('core_ielts_lms_payments').update({
    status: isSuccess ? 'success' : 'failed',
    vnp_response_code: code, vnp_transaction_no: transactionNo,
    vnp_bank_code: bankCode, vnp_pay_date: payDate, raw_response: params,
  }).eq('id', payment.id);

  if (isSuccess && payment.enrollment_id) {
    const now = new Date();
    const days = payment.core_ielts_lms_packages?.duration_days || 30;
    const expires = new Date(now.getTime() + days * 86400000);
    await supabase.from('core_ielts_lms_package_enrollments').update({
      status: 'active', starts_at: now.toISOString(), expires_at: expires.toISOString(), payment_id: payment.id,
    }).eq('id', payment.enrollment_id);

    await createNotification({
      user_id: payment.user_id, title: 'Thanh toán thành công',
      message: `Đã kích hoạt gói học, hiệu lực đến ${expires.toLocaleDateString('vi-VN')}.`,
      type: 'payment', link: '/student/my-packages'
    });
  }
  return { ok: isSuccess, payment };
};

// Browser return URL – VNPAY redirects user back here
const paymentReturn = async (req, res) => {
  try {
    const result = verifyReturn(req.query);
    if (!result.valid) return res.status(400).json({ error: 'Chữ ký không hợp lệ.', code: '97' });
    const fin = await finalizePayment(result);
    res.json({
      success: result.code === '00',
      message: result.code === '00' ? 'Thanh toán thành công.' : 'Thanh toán thất bại hoặc bị hủy.',
      response_code: result.code,
      txn_ref: result.txnRef,
    });
  } catch (err) {
    console.error('payment return', err);
    res.status(500).json({ error: 'Lỗi xử lý kết quả thanh toán.' });
  }
};

// IPN URL – server-to-server callback (VNPAY expects RspCode/Message)
const paymentIpn = async (req, res) => {
  try {
    const result = verifyReturn(req.query);
    if (!result.valid) return res.json({ RspCode: '97', Message: 'Invalid signature' });
    await finalizePayment(result);
    return res.json({ RspCode: '00', Message: 'Confirm Success' });
  } catch (err) {
    console.error('payment ipn', err);
    return res.json({ RspCode: '99', Message: 'Unknown error' });
  }
};

// Check whether current user has any active package
const hasActivePackage = async (userId) => {
  const { data } = await supabase.from('core_ielts_lms_package_enrollments')
    .select('id').eq('user_id', userId).eq('status', 'active')
    .gte('expires_at', new Date().toISOString()).limit(1);
  return Array.isArray(data) && data.length > 0;
};

const checkActive = async (req, res) => {
  const active = await hasActivePackage(req.user.id);
  res.json({ active });
};

module.exports = {
  listPackages, getPackage, createPackage, updatePackage, deletePackage,
  myEnrollments, allEnrollments, approveEnrollment,
  createPayment, paymentReturn, paymentIpn, checkActive, hasActivePackage,
};
