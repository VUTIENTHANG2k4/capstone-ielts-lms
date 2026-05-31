const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getActivities, getActivityById, createActivity, updateActivity, deleteActivity, submitActivity } = require('../controllers/activity.controller');

router.get('/section/:sectionId', auth, getActivities);
router.get('/:id', auth, getActivityById);
router.post('/', auth, authorize('admin'), createActivity);
router.put('/:id', auth, authorize('admin'), updateActivity);
router.delete('/:id', auth, authorize('admin'), deleteActivity);
router.post('/:id/submit', auth, authorize('student'), submitActivity);

module.exports = router;
