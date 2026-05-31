// Standalone payment callback routes – mounted at /api/payment so VNPAY return/IPN URLs are short.
const express = require('express');
const router = express.Router();
const { paymentReturn, paymentIpn } = require('../controllers/package.controller');

router.get('/vnpay-return', paymentReturn);
router.get('/vnpay-ipn', paymentIpn);

module.exports = router;
