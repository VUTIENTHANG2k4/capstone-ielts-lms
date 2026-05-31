const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const c = require('../controllers/package.controller');

// Public-ish (auth required) listing for students
router.get('/', auth, c.listPackages);
router.get('/me/active', auth, c.checkActive);
router.get('/me/enrollments', auth, c.myEnrollments);
router.get('/:id', auth, c.getPackage);

// Admin
router.post('/', auth, authorize('admin'), c.createPackage);
router.put('/:id', auth, authorize('admin'), c.updatePackage);
router.delete('/:id', auth, authorize('admin'), c.deletePackage);
router.get('/admin/enrollments', auth, authorize('admin'), c.allEnrollments);
router.post('/admin/enrollments/:id/approve', auth, authorize('admin'), c.approveEnrollment);

// Payment (VNPAY)
router.post('/payments/create', auth, c.createPayment);

module.exports = router;
