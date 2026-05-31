// VNPAY payment URL builder & response verifier (sandbox).
// Docs: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
// Compatible with VNPAY official Node.js demo.

const crypto = require('crypto');

const TMN_CODE = process.env.VNP_TMN_CODE || 'WRKEP3ZY';
const HASH_SECRET = process.env.VNP_HASH_SECRET || 'FVT5VRK3EGLH12BORPW9SCK3HW5UD9V2';
const VNP_URL = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
function isLocalUrl(url) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(String(url || ''));
}

const DEFAULT_FRONTEND_URL = process.env.FRONTEND_URL && !isLocalUrl(process.env.FRONTEND_URL)
  ? process.env.FRONTEND_URL
  : 'https://ielts-thangvu.vercel.app';
const RETURN_URL = process.env.VNP_RETURN_URL || `${DEFAULT_FRONTEND_URL}/payment/return`;

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function formatDate(d) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(d).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`;
}

function normalizeIp(ipAddr) {
  const value = String(ipAddr || '').split(',')[0].trim().replace(/^::ffff:/, '');
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(value) ? value : '127.0.0.1';
}

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).filter(k => obj[k] !== undefined && obj[k] !== null && obj[k] !== '');
  keys.sort();
  for (const k of keys) {
    sorted[encodeURIComponent(k)] = encodeURIComponent(String(obj[k])).replace(/%20/g, '+');
  }
  return sorted;
}

function stringifyParams(params) {
  return Object.keys(params).map((key) => `${key}=${params[key]}`).join('&');
}

/**
 * Build VNPAY payment URL.
 * @param {object} opts
 * @param {string} opts.txnRef Unique order reference (alphanumeric, <= 100 chars)
 * @param {number} opts.amount Amount in VND (will be x100 by VNPAY rules)
 * @param {string} opts.ipAddr Client IP
 * @param {string} opts.orderInfo Description (no diacritics best)
 * @param {string} [opts.returnUrl] Override return URL
 * @param {string} [opts.bankCode] Optional bank
 */
function buildPaymentUrl({ txnRef, amount, ipAddr, orderInfo, returnUrl, bankCode }) {
  const date = new Date();
  const createDate = formatDate(date);
  const expireDate = formatDate(new Date(date.getTime() + 15 * 60 * 1000));

  let params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: TMN_CODE,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(Number(amount) * 100),
    vnp_ReturnUrl: returnUrl || RETURN_URL,
    vnp_IpAddr: normalizeIp(ipAddr),
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };
  if (bankCode) params.vnp_BankCode = bankCode;

  const sorted = sortObject(params);
  const signData = stringifyParams(sorted);
  const hmac = crypto.createHmac('sha512', HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  sorted.vnp_SecureHash = signed;
  return VNP_URL + '?' + stringifyParams(sorted);
}

/**
 * Verify VNPAY return / IPN params.
 * @param {object} query Raw query params from VNPAY
 * @returns {{ valid: boolean, code: string, txnRef: string, amount: number, params: object }}
 */
function verifyReturn(query) {
  const params = { ...query };
  const secureHash = params.vnp_SecureHash;
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sorted = sortObject(params);
  const signData = stringifyParams(sorted);
  const hmac = crypto.createHmac('sha512', HASH_SECRET);
  const checkHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return {
    valid: secureHash === checkHash,
    code: params.vnp_ResponseCode,
    txnRef: params.vnp_TxnRef,
    amount: Number(params.vnp_Amount) / 100,
    transactionNo: params.vnp_TransactionNo,
    bankCode: params.vnp_BankCode,
    payDate: params.vnp_PayDate,
    params,
  };
}

module.exports = { buildPaymentUrl, verifyReturn };
