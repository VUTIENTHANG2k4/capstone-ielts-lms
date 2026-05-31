const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getMockTests, getMockTestById, createMockTest, updateMockTest, deleteMockTest, getAllMockTests, startMockTest, saveMockTestProgress, submitMockTest, getMockTestResult } = require('../controllers/mockTest.controller');

// Admin routes (must be before /:id to avoid conflicts)
router.get('/admin/all', auth, authorize('admin'), getAllMockTests);
router.put('/admin/:id', auth, authorize('admin'), updateMockTest);
router.delete('/admin/:id', auth, authorize('admin'), deleteMockTest);

// Student/public routes
router.get('/', auth, getMockTests);
router.get('/:id', auth, getMockTestById);
router.post('/', auth, authorize('admin'), createMockTest);
router.post('/:id/start', auth, authorize('student'), startMockTest);
router.put('/attempts/:id/save', auth, authorize('student'), saveMockTestProgress);
router.post('/attempts/:id/submit', auth, authorize('student'), submitMockTest);
router.get('/attempts/:id/result', auth, getMockTestResult);

module.exports = router;
