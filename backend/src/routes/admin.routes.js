const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getDashboard, getUsers, createUser, updateUser, deleteUser, getStudentsProgress, getStudentProgressDetail } = require('../controllers/admin.controller');

router.get('/dashboard', auth, authorize('admin'), getDashboard);
router.get('/users', auth, authorize('admin'), getUsers);
router.post('/users', auth, authorize('admin'), createUser);
router.put('/users/:id', auth, authorize('admin'), updateUser);
router.delete('/users/:id', auth, authorize('admin'), deleteUser);

// Student progress
router.get('/students/progress', auth, authorize('admin'), getStudentsProgress);
router.get('/students/:id/progress', auth, authorize('admin'), getStudentProgressDetail);

module.exports = router;
