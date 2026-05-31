const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getMyCertificates, getCertificateByNumber, issueCertificate } = require('../controllers/certificate.controller');

router.get('/my', auth, getMyCertificates);
router.get('/verify/:number', getCertificateByNumber); // Public verification
router.post('/issue', auth, authorize('admin'), issueCertificate);

module.exports = router;
